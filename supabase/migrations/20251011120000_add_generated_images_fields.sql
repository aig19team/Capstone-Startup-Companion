/*
  # Add Generated Images Fields to Business Profiles

  ## Overview
  This migration adds fields to store URLs of generated images for
  business card, letterhead, and signage designs.

  ## Changes

  1. Add image URL fields to business_profiles:
     - `business_card_image_url` (text) - URL to generated business card image
     - `letterhead_image_url` (text) - URL to generated letterhead image
     - `signage_image_url` (text) - URL to generated signage board image
     - `business_card_specs` (jsonb) - Structured business card specifications
     - `letterhead_specs` (jsonb) - Structured letterhead specifications
     - `signage_specs` (jsonb) - Structured signage specifications

  2. No RLS changes needed - existing policies cover these fields
*/

-- Add generated image URL fields to business_profiles
DO $$
BEGIN
  -- Check and add business_card_image_url
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_profiles' AND column_name = 'business_card_image_url'
  ) THEN
    ALTER TABLE business_profiles ADD COLUMN business_card_image_url text;
  END IF;

  -- Check and add letterhead_image_url
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_profiles' AND column_name = 'letterhead_image_url'
  ) THEN
    ALTER TABLE business_profiles ADD COLUMN letterhead_image_url text;
  END IF;

  -- Check and add signage_image_url
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_profiles' AND column_name = 'signage_image_url'
  ) THEN
    ALTER TABLE business_profiles ADD COLUMN signage_image_url text;
  END IF;

  -- Check and add business_card_specs
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_profiles' AND column_name = 'business_card_specs'
  ) THEN
    ALTER TABLE business_profiles ADD COLUMN business_card_specs jsonb DEFAULT '{}'::jsonb;
  END IF;

  -- Check and add letterhead_specs
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_profiles' AND column_name = 'letterhead_specs'
  ) THEN
    ALTER TABLE business_profiles ADD COLUMN letterhead_specs jsonb DEFAULT '{}'::jsonb;
  END IF;

  -- Check and add signage_specs
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_profiles' AND column_name = 'signage_specs'
  ) THEN
    ALTER TABLE business_profiles ADD COLUMN signage_specs jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;
