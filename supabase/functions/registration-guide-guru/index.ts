import { createClient } from 'npm:@supabase/supabase-js@2';
import { generateAndStorePDF } from './_shared/pdfGenerator.ts';

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

const REGISTRATION_GUIDE_PROMPT = `You are an expert business registration consultant in India. Generate a comprehensive registration guide based on the business profile provided.

The guide MUST include:

1. **Recommended Entity Type** - Analyze the business and recommend the best entity type (Proprietorship, Partnership, LLP, Private Limited, etc.) with clear reasoning

2. **Company Name Suggestions** - Provide 3-4 suitable name suggestions based on the business description
   - Check name availability: https://www.mca.gov.in/mcafoportal/companyLLPNameAvailability.do
   - Trademark search: https://ipindiaservices.gov.in/publicsearch

3. **Complete Registration Timeline** - Day-by-day process:
   - Day 1-2: Apply for DSC (Digital Signature Certificate)
   - Day 3-4: Apply for DIN/DPIN
   - Day 5: Reserve company name (RUN form)
   - Day 6-15: File incorporation forms (SPICe+ for company/LLP)
   - Day 16: Receive Certificate of Incorporation
   - Day 17-20: Apply for PAN and TAN
   - Day 21-25: Open bank account
   - Day 26-30: GST registration (if turnover > ₹40 lakhs for services or ₹20 lakhs for goods)

4. **Required Documents Checklist**
   For Directors/Partners:
   - PAN Card (mandatory)
   - Aadhaar Card
   - Passport size photographs
   - Address proof
   - Bank statements (last 2 months)
   
   For Registered Office:
   - Rent agreement / NOC from owner
   - Utility bills (last 2 months)
   - Property documents

5. **Cost Breakdown** (based on entity type and location):
   - Government Fees
   - Professional Fees (optional)
   - DSC and other costs
   - Total estimated cost

6. **Official Government Portals**:
   - MCA Portal: https://www.mca.gov.in/mcafoportal/
   - DSC Application: https://www.mca.gov.in/MinistryV2/digitalsignature.html
   - Name Availability: https://www.mca.gov.in/mcafoportal/companyLLPNameAvailability.do
   - Trademark Search: https://ipindiaservices.gov.in/publicsearch

7. **Post-Registration Compliance**:
   - Annual ROC filings (Form AOC-4, MGT-7, etc.)
   - GST returns (monthly/quarterly)
   - Income tax returns
   - Board meetings and AGM requirements

8. **Brand Protection**:
   - Trademark registration steps
   - Domain name registration
   - Copyright for creative content

Format the response in clean markdown with proper headers, bullet points, and sections.`;

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
- Company Name: ${profile.business_name || 'To be determined'}
- Description: ${profile.company_description || profile.business_description || 'Not provided'}
- Location: ${profile.location || 'India'}
- Business Type: ${profile.business_type || 'General'}
- Partners/Directors: ${JSON.stringify(profile.partners_info || profile.directors_partners || [])}

Generate a comprehensive registration guide for this business.`;

    const fullContent = await callOpenRouterAPI(contextInfo);
    const keyPoints = extractKeyPoints(fullContent);

    const pdfResult = await generateAndStorePDF(
      {
        userId,
        documentType: 'registration',
        content: fullContent,
        businessName: profile.business_name || 'Your Business'
      },
      supabaseClient
    );

    const { data: existingDoc } = await supabaseClient
      .from('generated_documents')
      .select('id')
      .eq('session_id', sessionId)
      .eq('document_type', 'registration')
      .maybeSingle();

    let docData, docError;

    if (existingDoc) {
      const result = await supabaseClient
        .from('generated_documents')
        .update({
          document_title: 'Registration Guide',
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
          document_type: 'registration',
          document_title: 'Registration Guide',
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
    console.error('Error in registration-guide-guru function:', error);

    let errorMessage = 'Internal server error';
    let userMessage = 'Failed to generate registration guide. Please try again.';

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
            content: REGISTRATION_GUIDE_PROMPT
          },
          {
            role: 'user',
            content: contextInfo
          }
        ],
        temperature: 0.7,
        max_tokens: 3000
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

function extractKeyPoints(content: string): string[] {
  const keyPoints: string[] = [];

  if (!content || content.length < 100) {
    return [
      'Complete registration guide with timeline',
      'Recommended entity type and structure',
      'Required documents checklist',
      'Government portal links and resources',
      'Cost breakdown and fee structure',
      'Post-registration compliance requirements'
    ];
  }

  const entityPatterns = [
    /(?:recommended|suggest|best)\s+entity\s+type[:\s-]*([^\n.]+)/i,
    /entity\s+type[:\s-]*([^\n.]+?)(?:based|for|with)/i,
    /(proprietorship|partnership|llp|private limited|public limited)/i
  ];

  for (const pattern of entityPatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      const entityText = match[1].trim().replace(/\*/g, '').substring(0, 80);
      if (entityText.length > 5) {
        keyPoints.push(`Recommended: ${entityText}`);
        break;
      }
    }
  }

  const timelinePatterns = [
    /(\d+[-–]\d+)\s*days?/i,
    /timeline[:\s]*(\d+)\s*(?:to|-)\s*(\d+)\s*days?/i,
    /(?:takes?|requires?)\s*(\d+)\s*days?/i
  ];

  for (const pattern of timelinePatterns) {
    const match = content.match(pattern);
    if (match) {
      const days = match[1] || `${match[1]}-${match[2]}` || '25-30';
      keyPoints.push(`Registration timeline: ${days} days`);
      break;
    }
  }

  if (keyPoints.length < 2 && (content.toLowerCase().includes('day 1') || content.toLowerCase().includes('timeline'))) {
    keyPoints.push('Complete step-by-step registration timeline');
  }

  const costPatterns = [
    /(?:total|estimated|approximate)\s*cost[:\s]*₹?([\d,]+)/i,
    /₹\s*([\d,]+)\s*(?:to|-)\s*₹?\s*([\d,]+)/i,
    /cost[:\s]*₹?([\d,]+)/i
  ];

  for (const pattern of costPatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      const cost = match[2] ? `₹${match[1]}-${match[2]}` : `₹${match[1]}`;
      keyPoints.push(`Estimated cost: ${cost}`);
      break;
    }
  }

  if (keyPoints.length < 3) {
    keyPoints.push('Detailed cost breakdown included');
  }

  if (content.toLowerCase().includes('document') && content.toLowerCase().includes('checklist')) {
    keyPoints.push('Required documents checklist provided');
  } else if (content.toLowerCase().includes('pan') || content.toLowerCase().includes('aadhaar')) {
    keyPoints.push('Complete documentation requirements');
  }

  if (content.includes('mca.gov.in') || content.toLowerCase().includes('government portal')) {
    keyPoints.push('Official government portal links included');
  }

  if (content.toLowerCase().includes('compliance') || content.toLowerCase().includes('post-registration')) {
    keyPoints.push('Post-registration compliance guide');
  }

  const fallbackPoints = [
    'Step-by-step registration process',
    'Entity type recommendations',
    'Complete documentation guide',
    'Timeline and milestones',
    'Cost estimates and fees',
    'Compliance requirements'
  ];

  for (const fallback of fallbackPoints) {
    if (keyPoints.length >= 6) break;
    if (!keyPoints.some(point => point.toLowerCase().includes(fallback.toLowerCase().split(' ')[0]))) {
      keyPoints.push(fallback);
    }
  }

  return keyPoints.slice(0, 6);
}