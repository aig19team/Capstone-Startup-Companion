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

const COMPLIANCE_GUIDE_PROMPT = `You are an expert compliance and legal consultant for businesses in India. Generate a comprehensive compliance guide based on the business profile provided.

The guide MUST include:

1. **Tax Compliance**
   - PAN and TAN requirements
   - GST registration (threshold, process, timeline)
   - TDS compliance and filing requirements
   - Income Tax return filing schedule
   - Professional Tax (state-specific)
   - Advance tax payment schedule

2. **ROC Compliance (for Companies/LLPs)**
   - Annual Filing Requirements (AOC-4, MGT-7, etc.)
   - Board Meeting requirements (frequency, quorum)
   - Annual General Meeting (AGM) guidelines
   - Financial statement filing
   - Director KYC (DIN KYC)
   - Statutory audit requirements

3. **Labor Law Compliance**
   - Provident Fund (PF) - when applicable
   - Employee State Insurance (ESI) - when applicable
   - Professional Tax registration
   - Shops and Establishment Act registration
   - Contract Labor Act (if applicable)
   - Minimum wages compliance

4. **Industry-Specific Licenses and Permits**
   - Trade license from municipal corporation
   - Industry-specific licenses (based on business type)
   - Environmental clearances (if applicable)
   - Fire safety NOC
   - Health and safety compliance

5. **Data Protection and Privacy**
   - Digital Personal Data Protection Act compliance
   - Data storage and security requirements
   - Privacy policy requirements
   - Customer consent management

6. **Ongoing Compliance Calendar**
   - Monthly compliance tasks
   - Quarterly compliance tasks
   - Annual compliance tasks
   - Important deadlines and due dates

7. **Penalties and Consequences**
   - Late filing penalties
   - Non-compliance consequences
   - Interest on delayed tax payments

8. **Compliance Costs**
   - Professional fees (CA, CS, lawyers)
   - Registration and license fees
   - Annual maintenance costs
   - Estimated total compliance budget

9. **Resources and Portals**
   - Income Tax Portal: https://www.incometax.gov.in/
   - GST Portal: https://www.gst.gov.in/
   - MCA Portal: https://www.mca.gov.in/
   - EPFO Portal: https://www.epfindia.gov.in/
   - ESI Portal: https://www.esic.gov.in/
   - Professional help contacts

Format the response in clean markdown with proper headers, bullet points, checklists, and actionable steps. Include location-specific compliance based on the business location provided.`;

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
- Business Type: ${profile.business_type || 'General'}
- Entity Type: ${profile.entity_type || 'To be determined'}
- Location: ${profile.location || 'India'}
- Partners/Employees: ${JSON.stringify(profile.partners_info || profile.directors_partners || [])}

Generate a comprehensive compliance guide for this business covering all regulatory requirements in India.`;

    const fullContent = await callOpenRouterAPI(contextInfo);
    const keyPoints = extractKeyPoints(fullContent);

    // Generate and store PDF
    const pdfResult = await generateAndStorePDF(
      {
        userId,
        documentType: 'compliance',
        content: fullContent,
        businessName: profile.business_name || 'Your Business'
      },
      supabaseClient
    );

    // Use upsert to handle re-generation scenarios
    // Check if document already exists for this session and type
    const { data: existingDoc } = await supabaseClient
      .from('generated_documents')
      .select('id')
      .eq('session_id', sessionId)
      .eq('document_type', 'compliance')
      .maybeSingle();

    let docData, docError;

    if (existingDoc) {
      // Update existing document
      const result = await supabaseClient
        .from('generated_documents')
        .update({
          document_title: 'Compliance Guide',
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
      // Insert new document
      const result = await supabaseClient
        .from('generated_documents')
        .insert({
          user_id: userId,
          session_id: sessionId,
          document_type: 'compliance',
          document_title: 'Compliance Guide',
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
    console.error('Error in compliance-guide-guru function:', error);

    let errorMessage = 'Internal server error';
    let userMessage = 'Failed to generate compliance guide. Please try again.';

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
            content: COMPLIANCE_GUIDE_PROMPT
          },
          {
            role: 'user',
            content: contextInfo
          }
        ],
        temperature: 0.7,
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

function extractKeyPoints(content: string): string[] {
  const keyPoints: string[] = [];

  if (!content || content.length < 100) {
    return [
      'Tax compliance checklist (GST, TDS, Income Tax)',
      'ROC filing requirements and deadlines',
      'Labor law compliance (PF, ESI)',
      'Industry-specific licenses guide',
      'Compliance calendar and deadlines',
      'Cost breakdown and professional fees'
    ];
  }

  // Check for tax compliance mentions
  const taxKeywords = ['gst', 'tds', 'income tax', 'tax compliance'];
  if (taxKeywords.some(keyword => content.toLowerCase().includes(keyword))) {
    keyPoints.push('Complete tax compliance checklist (GST, TDS, Income Tax)');
  }

  // Check for ROC compliance
  if (content.toLowerCase().includes('roc') || content.toLowerCase().includes('annual filing') ||
      content.toLowerCase().includes('aoc-4') || content.toLowerCase().includes('mgt-7')) {
    keyPoints.push('ROC annual filing requirements and deadlines');
  }

  // Check for labor law compliance
  const laborKeywords = ['provident fund', 'pf', 'esi', 'professional tax', 'labor law', 'labour law'];
  if (laborKeywords.some(keyword => content.toLowerCase().includes(keyword))) {
    keyPoints.push('Labor law compliance (PF, ESI, Professional Tax)');
  }

  // Check for licenses
  if (content.toLowerCase().includes('license') || content.toLowerCase().includes('permit')) {
    keyPoints.push('Industry-specific licenses and permits guide');
  }

  // Check for compliance calendar
  if (content.toLowerCase().includes('monthly') || content.toLowerCase().includes('quarterly') ||
      content.toLowerCase().includes('calendar') || content.toLowerCase().includes('deadline')) {
    keyPoints.push('Compliance calendar with key deadlines');
  }

  // Check for cost information
  if (content.toLowerCase().includes('cost') || content.toLowerCase().includes('fee') ||
      content.toLowerCase().includes('professional charges')) {
    keyPoints.push('Compliance costs and professional fees breakdown');
  }

  // Check for data protection/privacy
  if (content.toLowerCase().includes('data protection') || content.toLowerCase().includes('privacy') ||
      content.toLowerCase().includes('dpdp')) {
    keyPoints.push('Data protection and privacy compliance');
  }

  // Check for penalties
  if (content.toLowerCase().includes('penalt') || content.toLowerCase().includes('late filing')) {
    keyPoints.push('Penalties and consequences overview');
  }

  // Add fallback points if needed
  const fallbackPoints = [
    'Essential tax compliance requirements',
    'Statutory filing obligations',
    'Employee benefit regulations',
    'Business license requirements',
    'Ongoing compliance timeline',
    'Regulatory cost estimates'
  ];

  for (const fallback of fallbackPoints) {
    if (keyPoints.length >= 6) break;
    keyPoints.push(fallback);
  }

  return keyPoints.slice(0, 6);
}