/*
  # Add Branding Fields to Business Profiles

  ## Overview
  This migration adds fields to store branding-related information including
  logo designs, color palettes, typography choices, and IP protection details.

  ## Changes
  
  1. Add branding-related fields to business_profiles:
     - `has_branding` (boolean) - Whether user completed branding service
     - `branding_concept_selected` (text) - Which concept was chosen (A/B/C)
     - `logo_design_url` (text) - URL to final logo design
     - `logo_variations` (jsonb) - All logo variations generated
     - `color_palette` (jsonb) - Primary and secondary colors with hex/RGB/CMYK
     - `typography` (jsonb) - Font choices for headline and body
     - `business_card_design` (text) - Business card design details
     - `letterhead_design` (text) - Letterhead design details
     - `signage_design` (text) - Signage board design details
     - `ip_protection_info` (jsonb) - Trademark/copyright/patent information
     - `design_preferences` (jsonb) - User's design preferences and keywords
     - `branding_output` (text) - Complete branding guidance output

  2. No RLS changes needed - existing policies cover these fields
*/

-- Add branding fields to business_profiles
DO $$
BEGIN
  -- Check and add has_branding
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'business_profiles' AND column_name = 'has_branding'
  ) THEN
    ALTER TABLE business_profiles ADD COLUMN has_branding boolean DEFAULT false;
  END IF;

  -- Check and add branding_concept_selected
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'business_profiles' AND column_name = 'branding_concept_selected'
  ) THEN
    ALTER TABLE business_profiles ADD COLUMN branding_concept_selected text;
  END IF;

  -- Check and add logo_design_url
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'business_profiles' AND column_name = 'logo_design_url'
  ) THEN
    ALTER TABLE business_profiles ADD COLUMN logo_design_url text;
  END IF;

  -- Check and add logo_variations
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'business_profiles' AND column_name = 'logo_variations'
  ) THEN
    ALTER TABLE business_profiles ADD COLUMN logo_variations jsonb DEFAULT '[]'::jsonb;
  END IF;

  -- Check and add color_palette
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'business_profiles' AND column_name = 'color_palette'
  ) THEN
    ALTER TABLE business_profiles ADD COLUMN color_palette jsonb DEFAULT '{}'::jsonb;
  END IF;

  -- Check and add typography
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'business_profiles' AND column_name = 'typography'
  ) THEN
    ALTER TABLE business_profiles ADD COLUMN typography jsonb DEFAULT '{}'::jsonb;
  END IF;

  -- Check and add business_card_design
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'business_profiles' AND column_name = 'business_card_design'
  ) THEN
    ALTER TABLE business_profiles ADD COLUMN business_card_design text;
  END IF;

  -- Check and add letterhead_design
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'business_profiles' AND column_name = 'letterhead_design'
  ) THEN
    ALTER TABLE business_profiles ADD COLUMN letterhead_design text;
  END IF;

  -- Check and add signage_design
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'business_profiles' AND column_name = 'signage_design'
  ) THEN
    ALTER TABLE business_profiles ADD COLUMN signage_design text;
  END IF;

  -- Check and add ip_protection_info
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'business_profiles' AND column_name = 'ip_protection_info'
  ) THEN
    ALTER TABLE business_profiles ADD COLUMN ip_protection_info jsonb DEFAULT '{}'::jsonb;
  END IF;

  -- Check and add design_preferences
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'business_profiles' AND column_name = 'design_preferences'
  ) THEN
    ALTER TABLE business_profiles ADD COLUMN design_preferences jsonb DEFAULT '{}'::jsonb;
  END IF;

  -- Check and add branding_output
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'business_profiles' AND column_name = 'branding_output'
  ) THEN
    ALTER TABLE business_profiles ADD COLUMN branding_output text;
  END IF;
END $$;

-- Create index for branding lookups
CREATE INDEX IF NOT EXISTS idx_business_profiles_has_branding ON business_profiles(user_id, has_branding);
