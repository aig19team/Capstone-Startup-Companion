/*
  # Create All Application Tables with Data Integrity

  ## Overview
  This migration creates the complete database schema for the StartUP Companion application,
  including all tables needed for user sessions, business profiles, chat messages, ratings,
  and registration guides.

  ## Tables Created

  ### 1. business_profiles
  Stores business information for each user
  - `id` (uuid, primary key) - Unique profile identifier
  - `user_id` (uuid, foreign key → users) - References users table
  - `business_name` (text) - Company name
  - `business_type` (text) - Type of business
  - `business_description` (text) - Detailed description
  - `industry` (text) - Industry sector
  - `location` (text) - Business location
  - `entity_type` (text) - Legal entity type (LLP, Pvt Ltd, etc.)
  - `capital_investment` (text) - Investment amount
  - `expected_turnover` (text) - Projected revenue
  - `directors_partners` (jsonb) - Director/partner details
  - `has_idea_tuning` (boolean) - Completed idea tuning service
  - `idea_tuning_output` (text) - Idea tuning results
  - `has_branding` (boolean) - Completed branding service
  - `branding_concept_selected` (text) - Selected branding concept
  - `logo_design_url` (text) - Final logo URL
  - `logo_variations` (jsonb) - All logo variations
  - `logo_specifications` (jsonb) - Logo specifications
  - `color_palette` (jsonb) - Brand colors
  - `typography` (jsonb) - Font choices
  - `business_card_design` (text) - Business card design
  - `business_card_image_url` (text) - Business card image URL
  - `business_card_specs` (jsonb) - Business card specifications
  - `letterhead_design` (text) - Letterhead design
  - `letterhead_image_url` (text) - Letterhead image URL
  - `letterhead_specs` (jsonb) - Letterhead specifications
  - `signage_design` (text) - Signage design
  - `signage_image_url` (text) - Signage image URL
  - `signage_specs` (jsonb) - Signage specifications
  - `ip_protection_info` (jsonb) - IP protection details
  - `design_preferences` (jsonb) - Design preferences
  - `branding_output` (text) - Branding guidance output
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. user_sessions
  Tracks user service sessions
  - `id` (uuid, primary key) - Unique session identifier
  - `user_id` (uuid, foreign key → users) - References users table
  - `service_type` (text) - Service type identifier
  - `status` (text) - Session status (active, completed, abandoned)
  - `started_at` (timestamptz) - Session start time
  - `completed_at` (timestamptz) - Session completion time
  - `created_at` (timestamptz) - Creation timestamp

  ### 3. chat_messages
  Stores all chat conversations
  - `id` (uuid, primary key) - Unique message identifier
  - `session_id` (uuid, foreign key → user_sessions) - Session reference
  - `user_id` (uuid, foreign key → users) - User reference
  - `message_type` (text) - Type: 'user' or 'ai'
  - `content` (text) - Message content
  - `attachments` (jsonb) - Attachment metadata
  - `ai_model` (text) - AI model used
  - `tokens_used` (integer) - Token count
  - `message_metadata` (jsonb) - Additional metadata
  - `created_at` (timestamptz) - Creation timestamp

  ### 4. registration_guides
  Stores generated registration guide PDFs
  - `id` (uuid, primary key) - Unique guide identifier
  - `user_id` (uuid, foreign key → users) - User reference
  - `session_id` (uuid, foreign key → user_sessions) - Session reference
  - `file_name` (text) - PDF filename
  - `file_url` (text) - PDF storage URL
  - `business_type` (text) - Business type
  - `entity_type` (text) - Entity type
  - `location` (text) - Registration location
  - `pdf_data` (jsonb) - PDF generation data
  - `service_type` (text) - Service type
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 5. service_ratings
  Stores user feedback ratings
  - `id` (uuid, primary key) - Unique rating identifier
  - `user_id` (uuid, foreign key → auth.users) - User reference
  - `session_id` (uuid, foreign key → user_sessions) - Session reference
  - `service_type` (text) - Service that was rated
  - `rating` (integer) - Rating 1-5
  - `feedback_reason` (text) - Feedback for low ratings
  - `mentor_assigned` (boolean) - Mentor recommended
  - `mentor_id` (uuid, foreign key → mentors) - Mentor reference
  - `created_at` (timestamptz) - Creation timestamp

  ## Security
  - All tables have RLS enabled
  - Users can only access their own data
  - Authenticated users required for all operations
  - CASCADE deletes maintain referential integrity

  ## Performance
  - Indexes on all foreign keys
  - Indexes on frequently queried columns
  - Indexes on timestamp columns for sorting
*/

-- Create business_profiles table
CREATE TABLE IF NOT EXISTS business_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  business_name text,
  business_type text,
  business_description text,
  industry text,
  location text,
  entity_type text,
  capital_investment text,
  expected_turnover text,
  directors_partners jsonb DEFAULT '[]'::jsonb,
  has_idea_tuning boolean DEFAULT false,
  idea_tuning_output text,
  has_branding boolean DEFAULT false,
  branding_concept_selected text,
  logo_design_url text,
  logo_variations jsonb DEFAULT '[]'::jsonb,
  logo_specifications jsonb DEFAULT '{}'::jsonb,
  color_palette jsonb DEFAULT '{}'::jsonb,
  typography jsonb DEFAULT '{}'::jsonb,
  business_card_design text,
  business_card_image_url text,
  business_card_specs jsonb DEFAULT '{}'::jsonb,
  letterhead_design text,
  letterhead_image_url text,
  letterhead_specs jsonb DEFAULT '{}'::jsonb,
  signage_design text,
  signage_image_url text,
  signage_specs jsonb DEFAULT '{}'::jsonb,
  ip_protection_info jsonb DEFAULT '{}'::jsonb,
  design_preferences jsonb DEFAULT '{}'::jsonb,
  branding_output text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on business_profiles
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;

-- Business profiles RLS policies
CREATE POLICY "Users can view own business profiles"
  ON business_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own business profiles"
  ON business_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own business profiles"
  ON business_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own business profiles"
  ON business_profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create user_sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  service_type text NOT NULL CHECK (service_type IN ('idea_tuning', 'registration', 'compliance', 'branding', 'hr_setup', 'financial_planning', 'registration_guide_guru', 'branding_guide_guru')),
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned', 'escalated', 'in-progress')),
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  rating_feedback text,
  mentor_assigned boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on user_sessions
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- User sessions RLS policies
CREATE POLICY "Users can view own sessions"
  ON user_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON user_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON user_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES user_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  message_type text NOT NULL CHECK (message_type IN ('user', 'ai')),
  content text NOT NULL,
  attachments jsonb DEFAULT '[]'::jsonb,
  ai_model text,
  tokens_used integer DEFAULT 0,
  message_metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on chat_messages
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Chat messages RLS policies
CREATE POLICY "Users can view own chat messages"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat messages"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create registration_guides table
CREATE TABLE IF NOT EXISTS registration_guides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  session_id uuid REFERENCES user_sessions(id) ON DELETE CASCADE NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  business_type text,
  entity_type text,
  location text,
  pdf_data jsonb DEFAULT '{}'::jsonb,
  service_type text DEFAULT 'registration_guide_guru',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on registration_guides
ALTER TABLE registration_guides ENABLE ROW LEVEL SECURITY;

-- Registration guides RLS policies
CREATE POLICY "Users can view own registration guides"
  ON registration_guides FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own registration guides"
  ON registration_guides FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own registration guides"
  ON registration_guides FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own registration guides"
  ON registration_guides FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create service_ratings table
CREATE TABLE IF NOT EXISTS service_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id uuid NOT NULL REFERENCES user_sessions(id) ON DELETE CASCADE,
  service_type text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback_reason text,
  mentor_assigned boolean DEFAULT false,
  mentor_id uuid REFERENCES mentors(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on service_ratings
ALTER TABLE service_ratings ENABLE ROW LEVEL SECURITY;

-- Service ratings RLS policies
CREATE POLICY "Users can insert own ratings"
  ON service_ratings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own ratings"
  ON service_ratings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own ratings"
  ON service_ratings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_business_profiles_user_id ON business_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_business_profiles_has_branding ON business_profiles(user_id, has_branding);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_service_type ON user_sessions(service_type);
CREATE INDEX IF NOT EXISTS idx_user_sessions_status ON user_sessions(status);
CREATE INDEX IF NOT EXISTS idx_user_sessions_created_at ON user_sessions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_registration_guides_user_id ON registration_guides(user_id);
CREATE INDEX IF NOT EXISTS idx_registration_guides_session_id ON registration_guides(session_id);
CREATE INDEX IF NOT EXISTS idx_registration_guides_created_at ON registration_guides(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_service_ratings_user_id ON service_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_service_ratings_session_id ON service_ratings(session_id);
CREATE INDEX IF NOT EXISTS idx_service_ratings_service_type ON service_ratings(service_type);
CREATE INDEX IF NOT EXISTS idx_service_ratings_rating ON service_ratings(rating);

-- Function to update business_profiles updated_at timestamp
CREATE OR REPLACE FUNCTION update_business_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update business_profiles updated_at
DROP TRIGGER IF EXISTS business_profile_updated_at_trigger ON business_profiles;
CREATE TRIGGER business_profile_updated_at_trigger
  BEFORE UPDATE ON business_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_business_profile_updated_at();

-- Function to update registration_guides updated_at timestamp
CREATE OR REPLACE FUNCTION update_registration_guide_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update registration_guides updated_at
DROP TRIGGER IF EXISTS registration_guide_updated_at_trigger ON registration_guides;
CREATE TRIGGER registration_guide_updated_at_trigger
  BEFORE UPDATE ON registration_guides
  FOR EACH ROW
  EXECUTE FUNCTION update_registration_guide_updated_at();
