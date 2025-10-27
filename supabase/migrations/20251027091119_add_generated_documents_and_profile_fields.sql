/*
  # Add Generated Documents Table and Business Profile Fields

  ## Overview
  This migration adds support for the new streamlined document generation system.
  It creates a new table for tracking generated documents and adds additional fields
  to the business_profiles table for storing user preferences.

  ## New Tables

  ### generated_documents
  Tracks all generated business documents (Registration, Branding, Compliance, HR)
  - `id` (uuid, primary key) - Unique document identifier
  - `user_id` (uuid, foreign key → users) - User who owns the document
  - `session_id` (uuid, foreign key → user_sessions) - Session that generated the document
  - `document_type` (text) - Type: registration/branding/compliance/hr
  - `document_title` (text) - Human-readable document title
  - `key_points` (jsonb) - Array of brief highlights for dashboard display
  - `full_content` (text) - Complete formatted document content
  - `pdf_url` (text) - Supabase storage URL for downloadable PDF
  - `pdf_file_name` (text) - PDF filename
  - `generation_status` (text) - Status: generating/completed/failed
  - `service_type` (text) - Service type identifier
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Modified Tables

  ### business_profiles
  Additional fields for new question flow:
  - `company_website` (text) - Company website URL
  - `company_description` (text) - Brief company description
  - `color_preference` (text) - Branding color preference
  - `style_preference` (text) - Branding style preference
  - `partners_info` (jsonb) - Detailed partner/director information

  ## Security
  - All tables have RLS enabled
  - Users can only access their own documents
  - Authenticated users required for all operations

  ## Performance
  - Indexes on foreign keys
  - Indexes on document_type for filtering
  - Indexes on generation_status for tracking
*/

-- Add new columns to business_profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_profiles' AND column_name = 'company_website'
  ) THEN
    ALTER TABLE business_profiles ADD COLUMN company_website text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_profiles' AND column_name = 'company_description'
  ) THEN
    ALTER TABLE business_profiles ADD COLUMN company_description text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_profiles' AND column_name = 'color_preference'
  ) THEN
    ALTER TABLE business_profiles ADD COLUMN color_preference text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_profiles' AND column_name = 'style_preference'
  ) THEN
    ALTER TABLE business_profiles ADD COLUMN style_preference text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_profiles' AND column_name = 'partners_info'
  ) THEN
    ALTER TABLE business_profiles ADD COLUMN partners_info jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Create generated_documents table
CREATE TABLE IF NOT EXISTS generated_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  session_id uuid NOT NULL,
  document_type text NOT NULL CHECK (document_type IN ('registration', 'branding', 'compliance', 'hr')),
  document_title text NOT NULL,
  key_points jsonb DEFAULT '[]'::jsonb,
  full_content text,
  pdf_url text,
  pdf_file_name text,
  generation_status text DEFAULT 'generating' CHECK (generation_status IN ('generating', 'completed', 'failed')),
  service_type text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on generated_documents
ALTER TABLE generated_documents ENABLE ROW LEVEL SECURITY;

-- Generated documents RLS policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'generated_documents' 
    AND policyname = 'Users can view own generated documents'
  ) THEN
    CREATE POLICY "Users can view own generated documents"
      ON generated_documents FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'generated_documents' 
    AND policyname = 'Users can insert own generated documents'
  ) THEN
    CREATE POLICY "Users can insert own generated documents"
      ON generated_documents FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'generated_documents' 
    AND policyname = 'Users can update own generated documents'
  ) THEN
    CREATE POLICY "Users can update own generated documents"
      ON generated_documents FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'generated_documents' 
    AND policyname = 'Users can delete own generated documents'
  ) THEN
    CREATE POLICY "Users can delete own generated documents"
      ON generated_documents FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_generated_documents_user_id ON generated_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_documents_session_id ON generated_documents(session_id);
CREATE INDEX IF NOT EXISTS idx_generated_documents_type ON generated_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_generated_documents_status ON generated_documents(generation_status);
CREATE INDEX IF NOT EXISTS idx_generated_documents_created_at ON generated_documents(created_at DESC);

-- Function to update generated_documents updated_at timestamp
CREATE OR REPLACE FUNCTION update_generated_document_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update generated_documents updated_at
DROP TRIGGER IF EXISTS generated_document_updated_at_trigger ON generated_documents;
CREATE TRIGGER generated_document_updated_at_trigger
  BEFORE UPDATE ON generated_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_generated_document_updated_at();