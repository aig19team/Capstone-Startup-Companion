/*
  # Fix Data Integrity Constraints

  ## Overview
  This migration adds constraints and fields to ensure data integrity across
  user_sessions, business_profiles, and generated_documents tables.

  ## Changes

  ### 1. Add unique constraint to generated_documents
  Prevents duplicate document generation for same session and document type
  - Unique constraint on (session_id, document_type)

  ### 2. Add service_type to generated_documents
  Improves filtering and reporting
  - New field: service_type (text)
  - Index on service_type for performance

  ### 3. Update user_sessions service_type check
  Adds 'confirmed_idea_flow' to valid service types
  - Extends CHECK constraint on service_type field

  ## Security
  - Maintains existing RLS policies
  - No changes to access control

  ## Performance
  - Unique constraint improves query performance
  - Index on service_type for faster filtering
*/

-- Add service_type column to generated_documents
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'generated_documents' AND column_name = 'service_type'
  ) THEN
    ALTER TABLE generated_documents ADD COLUMN service_type text;
  END IF;
END $$;

-- Add unique constraint to prevent duplicate documents per session
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'generated_documents_session_type_unique'
  ) THEN
    ALTER TABLE generated_documents
    ADD CONSTRAINT generated_documents_session_type_unique
    UNIQUE (session_id, document_type);
  END IF;
END $$;

-- Update user_sessions service_type check constraint to include confirmed_idea_flow
DO $$
BEGIN
  -- Drop existing constraint if it exists
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_sessions_service_type_check'
  ) THEN
    ALTER TABLE user_sessions DROP CONSTRAINT user_sessions_service_type_check;
  END IF;

  -- Add updated constraint
  ALTER TABLE user_sessions ADD CONSTRAINT user_sessions_service_type_check
  CHECK (service_type IN (
    'idea_tuning',
    'registration',
    'compliance',
    'branding',
    'hr_setup',
    'financial_planning',
    'registration_guide_guru',
    'branding_guide_guru',
    'confirmed_idea_flow'
  ));
END $$;

-- Create index on service_type for better filtering performance
CREATE INDEX IF NOT EXISTS idx_generated_documents_service_type ON generated_documents(service_type);

-- Add unique constraint to business_profiles on user_id
-- Each user should have only one business profile
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'business_profiles_user_id_unique'
  ) THEN
    -- First, delete duplicate profiles keeping only the most recent one
    DELETE FROM business_profiles a
    USING business_profiles b
    WHERE a.user_id = b.user_id
    AND a.created_at < b.created_at;

    -- Now add the unique constraint
    ALTER TABLE business_profiles
    ADD CONSTRAINT business_profiles_user_id_unique
    UNIQUE (user_id);
  END IF;
END $$;
