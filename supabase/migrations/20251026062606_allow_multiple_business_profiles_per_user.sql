/*
  # Allow Multiple Business Profiles Per User

  ## Overview
  This migration allows users to have multiple business profiles, one for each business idea.
  Each business profile is linked to a specific session, enabling users to generate guides
  for different business ideas without overwriting previous data.

  ## Changes

  ### 1. Drop unique constraint on user_id
  - Remove `business_profiles_user_id_unique` constraint
  - This allows multiple business profile records per user

  ### 2. Add session_id column to business_profiles
  - New column: `session_id` (uuid, foreign key → user_sessions)
  - Links each business profile to a specific session/business idea
  - Nullable to support existing records

  ### 3. Create index on session_id
  - Performance optimization for session-based queries
  - Enables efficient lookups by session

  ## Data Integrity
  - Each session can have one business profile
  - Multiple sessions per user = multiple business profiles per user
  - Existing profiles remain valid (session_id will be null for old records)

  ## Security
  - Maintains existing RLS policies
  - No changes to access control
*/

-- Drop the unique constraint on user_id to allow multiple profiles per user
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'business_profiles_user_id_unique'
  ) THEN
    ALTER TABLE business_profiles DROP CONSTRAINT business_profiles_user_id_unique;
  END IF;
END $$;

-- Add session_id column to business_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_profiles' AND column_name = 'session_id'
  ) THEN
    ALTER TABLE business_profiles ADD COLUMN session_id uuid REFERENCES user_sessions(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create index on session_id for efficient queries
CREATE INDEX IF NOT EXISTS idx_business_profiles_session_id ON business_profiles(session_id);

-- Create unique constraint on session_id to ensure one profile per session
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'business_profiles_session_id_unique'
  ) THEN
    ALTER TABLE business_profiles
    ADD CONSTRAINT business_profiles_session_id_unique
    UNIQUE (session_id);
  END IF;
END $$;
