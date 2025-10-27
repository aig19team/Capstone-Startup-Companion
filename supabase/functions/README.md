# Supabase Edge Functions Configuration

## Required Environment Variables

The edge functions in this project require the following environment variable to be configured:

### OPENROUTER_API_KEY

This API key is required for all document generation functions (registration, branding, compliance, and HR guides).

## Setup Instructions

### Local Development

1. Create a `.env` file in the `supabase/functions/` directory (this file is already created but needs the actual API key)

2. Update the `.env` file with your OpenRouter API key:
   ```
   OPENROUTER_API_KEY=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
   ```

3. The `.env` file is gitignored, so your API key will not be committed to version control

### Production Deployment (Supabase Dashboard)

For production deployments, you need to configure the secret in your Supabase Dashboard:

1. Go to your Supabase project dashboard
2. Navigate to **Project Settings** → **Edge Functions** → **Secrets**
3. Add a new secret:
   - Name: `OPENROUTER_API_KEY`
   - Value: Your actual OpenRouter API key
4. Save the secret

**Note:** After adding or updating secrets in the Supabase Dashboard, the edge functions will automatically have access to them. No redeployment is necessary for secret changes.

### Getting an OpenRouter API Key

If you don't have an OpenRouter API key:

1. Visit [OpenRouter.ai](https://openrouter.ai/)
2. Sign up for an account
3. Navigate to the API Keys section
4. Generate a new API key
5. Copy the key and use it in your configuration

## Edge Functions Overview

This project includes four edge functions:

- **registration-guide-guru**: Generates comprehensive business registration guides
- **branding-guide-guru**: Creates detailed branding and visual identity guides
- **compliance-guide-guru**: Produces regulatory compliance documentation
- **hr-guide-guru**: Generates HR policies and procedures documentation

All functions use the OpenRouter API to generate AI-powered content tailored to the user's business profile.

## Troubleshooting

### Error: "Configuration error: API key missing"

This error appears when the OPENROUTER_API_KEY is not configured:

1. For local development: Check that `supabase/functions/.env` exists and contains the API key
2. For production: Verify the secret is configured in Supabase Dashboard under Edge Functions → Secrets

### Error: "AI service temporarily unavailable"

This error indicates an issue with the OpenRouter API:

1. Verify your API key is valid and has not expired
2. Check your OpenRouter account for sufficient credits/quota
3. Check OpenRouter's status page for any service outages
4. Review the edge function logs in Supabase Dashboard for detailed error messages

## Environment Variables (Auto-configured)

The following environment variables are automatically provided by Supabase and do not need manual configuration:

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for database access
- `SUPABASE_ANON_KEY`: Anonymous key for public access

## Viewing Logs

To view edge function logs and debug issues:

1. Go to Supabase Dashboard
2. Navigate to **Edge Functions** → **Logs**
3. Select the specific function to view its execution logs
4. Look for error messages or API call failures

## Security Best Practices

- Never commit the `.env` file or API keys to version control
- Use different API keys for development and production
- Regularly rotate your API keys
- Monitor API usage and set up billing alerts
- Keep API keys in secure secret management systems
