/*
  # Add Logo Specifications Field

  This migration adds a field to store detailed logo specifications
  including design elements, colors, typography, and file formats.

  ## Changes
  
  1. Add `logo_specifications` (jsonb) field to business_profiles table
     - Stores detailed specifications of the generated logo
     - Includes design elements, color codes, typography details, file formats
  
  2. No RLS changes needed - existing policies cover this field
*/

-- Add logo_specifications field to business_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'business_profiles' AND column_name = 'logo_specifications'
  ) THEN
    ALTER TABLE business_profiles ADD COLUMN logo_specifications jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;
