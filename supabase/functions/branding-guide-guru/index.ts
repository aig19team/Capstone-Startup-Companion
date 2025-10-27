import { createClient } from 'npm:@supabase/supabase-js@2';
import { generateAndStorePDF } from '../_shared/pdfGenerator.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface RequestPayload {
  message: string;
  sessionId: string;
  userId: string;
  businessProfile?: any;
}

const BRANDING_GUIDE_PROMPT = `You are an expert brand strategist and visual identity designer. Generate a comprehensive branding guide based on the business profile and preferences provided.

The guide MUST include:

1. **Brand Name Suggestions**
   - 5-7 creative brand name options
   - Brief rationale for each name
   - Domain availability considerations
   - Trademark potential assessment

2. **Brand Identity Overview**
   - Brand positioning statement
   - Target audience profile
   - Brand personality and tone
   - Core brand values

3. **Logo Design Concept** (based on the style preference provided)
   - Primary logo concept description
   - Logo variations (horizontal, vertical, icon-only)
   - Usage guidelines and minimum sizes
   - Clear space requirements

4. **Color Palette** (aligned with color preference provided)
   - Primary colors (3-4 colors with HEX, RGB, and CMYK values)
   - Secondary colors (2-3 supporting colors)
   - Color psychology and rationale
   - Color usage guidelines

5. **Typography System**
   - Primary typeface for headings (with alternatives)
   - Secondary typeface for body text
   - Font weights and sizes
   - Typography hierarchy

6. **Brand Applications**
   - Business card design concept
   - Letterhead design concept
   - Email signature format
   - Social media profile guidelines
   - Website design direction

7. **Visual Style Guidelines**
   - Photography style
   - Iconography style
   - Graphic elements and patterns
   - Do's and Don'ts

8. **Brand Voice and Messaging**
   - Tone of voice guidelines
   - Key messaging pillars
   - Tagline suggestions (3-4 options)
   - Sample copy examples

9. **Intellectual Property Protection**
   - Trademark registration process
   - Trademark classes to consider
   - Copyright registration for creative assets
   - Domain name registration recommendations
   - IP protection timeline and costs

10. **Implementation Roadmap**
   - Phase 1: Logo and basic identity (Week 1-2)
   - Phase 2: Marketing collateral (Week 3-4)
   - Phase 3: Digital presence (Week 5-6)
   - Phase 4: Brand rollout (Week 7-8)

Format the response in clean markdown with proper headers, bullet points, and visual descriptions. Be specific and actionable.`;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { message, sessionId, userId, businessProfile }: RequestPayload = await req.json();

    let profile = businessProfile;
    if (!profile) {
      const { data: profileData } = await supabaseClient
        .from('business_profiles')
        .select('*')
        .eq('session_id', sessionId)
        .maybeSingle();
      profile = profileData || {};
    }

    const contextInfo = `
Business Information:
- Company Name: ${profile.business_name || 'Company'}
- Description: ${profile.company_description || profile.business_description || 'Not provided'}
- Industry: ${profile.business_type || profile.industry || 'General'}
- Location: ${profile.location || 'India'}
- Color Preference: ${profile.color_preference || 'Professional'}
- Style Preference: ${profile.style_preference || 'Modern/Contemporary'}

Generate a comprehensive branding guide for this business that aligns with their preferences.`;

    const fullContent = await callOpenRouterAPI(contextInfo);
    const keyPoints = extractKeyPoints(fullContent, profile);

    const pdfResult = await generateAndStorePDF(
      {
        userId,
        documentType: 'branding',
        content: fullContent,
        businessName: profile.business_name || 'Your Business'
      },
      supabaseClient
    );

    const { data: existingDoc } = await supabaseClient
      .from('generated_documents')
      .select('id')
      .eq('session_id', sessionId)
      .eq('document_type', 'branding')
      .maybeSingle();

    let docData, docError;

    if (existingDoc) {
      const result = await supabaseClient
        .from('generated_documents')
        .update({
          document_title: 'Branding Guide',
          key_points: JSON.stringify(keyPoints),
          full_content: fullContent,
          pdf_url: pdfResult?.pdfUrl || null,
          pdf_file_name: pdfResult?.fileName || null,
          generation_status: 'completed',
          service_type: 'confirmed_idea_flow'
        })
        .eq('id', existingDoc.id)
        .select()
        .single();
      docData = result.data;
      docError = result.error;
    } else {
      const result = await supabaseClient
        .from('generated_documents')
        .insert({
          user_id: userId,
          session_id: sessionId,
          document_type: 'branding',
          document_title: 'Branding Guide',
          key_points: JSON.stringify(keyPoints),
          full_content: fullContent,
          pdf_url: pdfResult?.pdfUrl || null,
          pdf_file_name: pdfResult?.fileName || null,
          generation_status: 'completed',
          service_type: 'confirmed_idea_flow'
        })
        .select()
        .single();
      docData = result.data;
      docError = result.error;
    }

    if (docError) {
      console.error('Error storing document in database:', docError);
    }

    return new Response(
      JSON.stringify({
        response: fullContent,
        keyPoints: keyPoints,
        fullContent: fullContent,
        pdfUrl: pdfResult?.pdfUrl,
        documentId: docData?.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in branding-guide-guru function:', error);

    let errorMessage = 'Internal server error';
    let userMessage = 'Failed to generate branding guide. Please try again.';

    if (error.message === 'API_KEY_NOT_CONFIGURED') {
      errorMessage = 'OpenRouter API key not configured';
      userMessage = 'Configuration error: API key missing. Please contact support.';
    } else if (error.message?.startsWith('API_ERROR')) {
      errorMessage = error.message;
      userMessage = 'AI service temporarily unavailable. Please try again in a moment.';
    }
    
    return new Response(
      JSON.stringify({
        error: errorMessage,
        userMessage: userMessage,
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function callOpenRouterAPI(contextInfo: string): Promise<string> {
  const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');

  if (!openRouterApiKey) {
    console.error('OPENROUTER_API_KEY not configured in edge function environment');
    throw new Error('API_KEY_NOT_CONFIGURED');
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://startup-companion.app',
        'X-Title': 'StartUP Companion'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: BRANDING_GUIDE_PROMPT
          },
          {
            role: 'user',
            content: contextInfo
          }
        ],
        temperature: 0.8,
        max_tokens: 3500
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenRouter API error ${response.status}:`, errorText);
      throw new Error(`API_ERROR: ${response.status}`);
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      console.error('Invalid response structure from OpenRouter API:', data);
      throw new Error('INVALID_API_RESPONSE');
    }

    return data.choices[0].message.content;

  } catch (error) {
    console.error('Error calling OpenRouter API:', error);
    throw error;
  }
}

function extractKeyPoints(content: string, profile: any): string[] {
  const keyPoints: string[] = [];

  if (!content || content.length < 100) {
    return [
      `Brand style: ${profile.style_preference || 'Modern/Contemporary'}`,
      `Color scheme: ${profile.color_preference || 'Professional'} tones`,
      'Complete logo design concepts',
      'Professional color palette guide',
      'Typography and font recommendations',
      'Brand collateral designs'
    ];
  }

  if (profile.style_preference) {
    keyPoints.push(`Brand style: ${profile.style_preference}`);
  }

  if (profile.color_preference) {
    keyPoints.push(`Color scheme: ${profile.color_preference} tones`);
  }

  const colorPatterns = [
    /#[0-9a-f]{6}/gi,
    /rgb\s*\(/gi,
    /primary color/gi,
    /color palette/gi
  ];

  if (colorPatterns.some(pattern => content.match(pattern))) {
    keyPoints.push('Professional color palette with HEX/RGB values');
  } else if (content.toLowerCase().includes('color')) {
    keyPoints.push('Comprehensive color scheme guide');
  }

  if (content.toLowerCase().includes('logo') || content.toLowerCase().includes('brand mark')) {
    if (content.toLowerCase().includes('variation') || content.toLowerCase().includes('horizontal') ||
        content.toLowerCase().includes('vertical')) {
      keyPoints.push('Complete logo design with variations');
    } else {
      keyPoints.push('Logo design concept included');
    }
  }

  const typographyKeywords = ['typography', 'typeface', 'font', 'heading', 'body text'];
  if (typographyKeywords.some(keyword => content.toLowerCase().includes(keyword))) {
    keyPoints.push('Typography system and font recommendations');
  }

  const applicationKeywords = ['business card', 'letterhead', 'email signature', 'collateral', 'stationery'];
  if (applicationKeywords.some(keyword => content.toLowerCase().includes(keyword))) {
    keyPoints.push('Brand collateral designs (cards, letterhead)');
  }

  if (content.toLowerCase().includes('brand voice') || content.toLowerCase().includes('messaging') ||
      content.toLowerCase().includes('tone of voice') || content.toLowerCase().includes('tagline')) {
    keyPoints.push('Brand voice and messaging guidelines');
  }

  if (content.toLowerCase().includes('trademark') || content.toLowerCase().includes('intellectual property') ||
      content.toLowerCase().includes('ip protection') || content.toLowerCase().includes('copyright')) {
    keyPoints.push('IP protection and trademark registration guide');
  }

  if (content.toLowerCase().includes('visual') || content.toLowerCase().includes('photography') ||
      content.toLowerCase().includes('iconography')) {
    keyPoints.push('Visual style and design guidelines');
  }

  const fallbackPoints = [
    'Brand identity overview',
    'Logo design concepts',
    'Color system guidelines',
    'Typography specifications',
    'Marketing collateral designs',
    'Implementation roadmap'
  ];

  for (const fallback of fallbackPoints) {
    if (keyPoints.length >= 6) break;
    if (!keyPoints.some(point => point.toLowerCase().includes(fallback.toLowerCase().split(' ')[0]))) {
      keyPoints.push(fallback);
    }
  }

  return keyPoints.slice(0, 6);
}