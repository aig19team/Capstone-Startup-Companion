/*
  # Add Registration Guide Guru Service Support

  1. Updates
    - Update user_sessions service_type constraint to include 'registration_guide_guru'
    - Update service_recommendations service_type references
    - Add registration_guides table for storing generated PDFs

  2. New Tables
    - `registration_guides`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `session_id` (uuid, foreign key to user_sessions)
      - `file_name` (text)
      - `file_url` (text)
      - `business_type` (text)
      - `entity_type` (text)
      - `location` (text)
      - `service_type` (text, default 'registration_guide_guru')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  3. Security
    - Enable RLS on `registration_guides` table
    - Add policies for authenticated users to manage their own guides
*/

-- Update user_sessions service_type constraint
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_sessions_service_type_check' 
    AND table_name = 'user_sessions'
  ) THEN
    ALTER TABLE user_sessions DROP CONSTRAINT user_sessions_service_type_check;
  END IF;
END $$;

ALTER TABLE user_sessions ADD CONSTRAINT user_sessions_service_type_check 
CHECK ((service_type = ANY (ARRAY['idea_tuning'::text, 'registration'::text, 'compliance'::text, 'branding'::text, 'hr_setup'::text, 'financial_planning'::text, 'registration_guide_guru'::text])));

-- Create registration_guides table if it doesn't exist
CREATE TABLE IF NOT EXISTS registration_guides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  session_id uuid REFERENCES user_sessions(id),
  file_name text NOT NULL,
  file_url text NOT NULL,
  business_type text,
  entity_type text,
  location text,
  service_type text DEFAULT 'registration_guide_guru',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE registration_guides ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Users can view their own registration guides"
  ON registration_guides
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own registration guides"
  ON registration_guides
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own registration guides"
  ON registration_guides
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own registration guides"
  ON registration_guides
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_registration_guides_user_id ON registration_guides(user_id);
CREATE INDEX IF NOT EXISTS idx_registration_guides_created_at ON registration_guides(created_at DESC);