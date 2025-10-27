/*
  # Create Registration Guide Guru Service Infrastructure

  ## Overview
  This migration sets up the complete database schema for the Registration Guide Guru service,
  which helps users register their companies legally in India by providing personalized guidance,
  document preparation assistance, and generating comprehensive PDF guides.

  ## 1. New Tables

  ### users
  - `id` (uuid, primary key) - Unique user identifier
  - `email` (text, unique) - User email address
  - `full_name` (text) - User's full name
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### business_profiles
  - `id` (uuid, primary key) - Unique profile identifier
  - `user_id` (uuid, foreign key) - References users table
  - `business_name` (text) - Proposed company name
  - `business_type` (text) - Type of business (service, product, etc.)
  - `business_description` (text) - Detailed business description
  - `industry` (text) - Industry sector
  - `location` (text) - Registration location (state/city)
  - `entity_type` (text) - Chosen entity type (LLP, Pvt Ltd, etc.)
  - `capital_investment` (text) - Expected capital investment
  - `expected_turnover` (text) - Projected annual turnover
  - `directors_partners` (jsonb) - Array of director/partner details
  - `has_idea_tuning` (boolean) - Whether user completed idea tuning service
  - `idea_tuning_output` (text) - Output from idea tuning service
  - `created_at` (timestamptz) - Profile creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### user_sessions
  - `id` (uuid, primary key) - Unique session identifier
  - `user_id` (uuid, foreign key) - References users table
  - `service_type` (text) - Type of service (registration_guide_guru, idea_tuning, etc.)
  - `status` (text) - Session status (active, completed, abandoned)
  - `started_at` (timestamptz) - Session start time
  - `completed_at` (timestamptz) - Session completion time
  - `created_at` (timestamptz) - Record creation timestamp

  ### chat_messages
  - `id` (uuid, primary key) - Unique message identifier
  - `session_id` (uuid, foreign key) - References user_sessions table
  - `user_id` (uuid, foreign key) - References users table
  - `message_type` (text) - Type of message (user or ai)
  - `content` (text) - Message content
  - `attachments` (jsonb) - Array of attachment metadata
  - `ai_model` (text) - AI model used for generation
  - `tokens_used` (integer) - Number of tokens consumed
  - `message_metadata` (jsonb) - Additional metadata
  - `created_at` (timestamptz) - Message creation timestamp

  ### registration_guides
  - `id` (uuid, primary key) - Unique guide identifier
  - `user_id` (uuid, foreign key) - References users table
  - `session_id` (uuid, foreign key) - References user_sessions table
  - `file_name` (text) - PDF file name
  - `file_url` (text) - URL to stored PDF
  - `business_type` (text) - Type of business
  - `entity_type` (text) - Chosen entity type
  - `location` (text) - Registration location
  - `pdf_data` (jsonb) - Complete PDF generation data
  - `service_type` (text) - Service type identifier
  - `created_at` (timestamptz) - Guide creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## 2. Security (Row Level Security)
  
  All tables have RLS enabled with policies ensuring:
  - Users can only access their own data
  - Authenticated users required for all operations
  - Ownership verification on all CRUD operations

  ## 3. Indexes
  
  Performance indexes added on:
  - Foreign key columns for fast joins
  - Timestamp columns for sorting and filtering
  - User lookup columns

  ## 4. Important Notes
  
  - All tables use UUID for primary keys
  - Timestamps use timestamptz for timezone awareness
  - JSONB used for flexible data storage (directors, attachments, metadata)
  - CASCADE delete ensures data cleanup when users are removed
  - Default values set for boolean and timestamp columns
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

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
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on business_profiles
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;

-- Business profiles policies
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
  service_type text NOT NULL CHECK (service_type IN ('idea_tuning', 'registration', 'compliance', 'branding', 'hr_setup', 'financial_planning', 'registration_guide_guru')),
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on user_sessions
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- User sessions policies
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

-- Chat messages policies
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

-- Registration guides policies
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_business_profiles_user_id ON business_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_service_type ON user_sessions(service_type);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_registration_guides_user_id ON registration_guides(user_id);
CREATE INDEX IF NOT EXISTS idx_registration_guides_session_id ON registration_guides(session_id);
CREATE INDEX IF NOT EXISTS idx_registration_guides_created_at ON registration_guides(created_at DESC);