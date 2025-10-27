/*
  # Create Service Ratings and Mentors Tables

  ## Overview
  This migration creates tables to track user experience ratings for each service
  and maintain a list of mentors who can help users when they have concerns.

  ## 1. New Tables
  
  ### `service_ratings`
  Stores user feedback ratings for each service interaction
  - `id` (uuid, primary key) - Unique identifier for each rating
  - `user_id` (uuid, foreign key) - Links to auth.users
  - `session_id` (uuid) - Links to chat session
  - `service_type` (text) - Which service was rated (registration, idea_tuning, etc.)
  - `rating` (integer) - Rating from 1-5
  - `feedback_reason` (text, optional) - Reason for low ratings
  - `mentor_assigned` (boolean) - Whether mentor was recommended
  - `mentor_id` (uuid, optional) - Which mentor was recommended
  - `created_at` (timestamptz) - When rating was given

  ### `mentors`
  Maintains list of available mentors with their specializations
  - `id` (uuid, primary key) - Unique identifier for each mentor
  - `name` (text) - Mentor's full name
  - `email` (text) - Contact email
  - `phone` (text, optional) - Contact phone
  - `specialization` (text[]) - Array of service areas they specialize in
  - `bio` (text) - Brief professional bio
  - `availability_status` (text) - active, busy, inactive
  - `total_consultations` (integer) - Number of consultations done
  - `average_rating` (numeric) - Average rating from users
  - `created_at` (timestamptz) - When mentor was added
  - `updated_at` (timestamptz) - Last update

  ## 2. Security
  - Enable RLS on both tables
  - Users can insert their own ratings
  - Users can read their own ratings
  - Users can read all active mentors
  - Only authenticated users can access these tables

  ## 3. Indexes
  - Index on user_id for fast rating lookups
  - Index on service_type for analytics
  - Index on mentor specialization for quick matching

  ## 4. Sample Data
  - Insert initial mentors for each service area
*/

-- Create service_ratings table
CREATE TABLE IF NOT EXISTS service_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id uuid NOT NULL,
  service_type text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback_reason text,
  mentor_assigned boolean DEFAULT false,
  mentor_id uuid,
  created_at timestamptz DEFAULT now()
);

-- Create mentors table
CREATE TABLE IF NOT EXISTS mentors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  specialization text[] NOT NULL DEFAULT '{}',
  bio text NOT NULL,
  availability_status text DEFAULT 'active' CHECK (availability_status IN ('active', 'busy', 'inactive')),
  total_consultations integer DEFAULT 0,
  average_rating numeric(3,2) DEFAULT 0.00,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE service_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentors ENABLE ROW LEVEL SECURITY;

-- RLS Policies for service_ratings

-- Users can insert their own ratings
CREATE POLICY "Users can insert own ratings"
  ON service_ratings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own ratings
CREATE POLICY "Users can view own ratings"
  ON service_ratings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can update their own ratings
CREATE POLICY "Users can update own ratings"
  ON service_ratings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for mentors

-- All authenticated users can view active mentors
CREATE POLICY "Authenticated users can view active mentors"
  ON mentors
  FOR SELECT
  TO authenticated
  USING (availability_status = 'active');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_service_ratings_user_id ON service_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_service_ratings_service_type ON service_ratings(service_type);
CREATE INDEX IF NOT EXISTS idx_service_ratings_rating ON service_ratings(rating);
CREATE INDEX IF NOT EXISTS idx_mentors_specialization ON mentors USING GIN(specialization);

-- Insert sample mentors for each service area
INSERT INTO mentors (name, email, phone, specialization, bio, availability_status) VALUES
(
  'Rajesh Kumar',
  'rajesh.kumar@startupadvisor.in',
  '+91-98765-43210',
  ARRAY['registration', 'compliance'],
  'CA with 15+ years of experience in company registration and legal compliance. Helped 500+ startups with incorporation and regulatory matters.',
  'active'
),
(
  'Priya Sharma',
  'priya.sharma@businessguru.in',
  '+91-98765-43211',
  ARRAY['idea_tuning', 'branding'],
  'Business strategist and brand consultant. MBA from IIM-A with expertise in market validation and brand positioning for early-stage startups.',
  'active'
),
(
  'Amit Patel',
  'amit.patel@financeexpert.in',
  '+91-98765-43212',
  ARRAY['financial_planning', 'compliance'],
  'Chartered Accountant specializing in startup finances, fundraising, and financial planning. 10+ years helping founders with cap tables and funding rounds.',
  'active'
),
(
  'Sneha Reddy',
  'sneha.reddy@hrpro.in',
  '+91-98765-43213',
  ARRAY['hr_setup', 'compliance'],
  'HR consultant with expertise in building teams for startups. Helped 200+ companies with hiring, policy creation, and employee management.',
  'active'
),
(
  'Vikram Singh',
  'vikram.singh@legaladvisor.in',
  '+91-98765-43214',
  ARRAY['registration', 'compliance', 'branding'],
  'Corporate lawyer with deep expertise in business registration, IP protection, and legal compliance. LLB from NLU Delhi.',
  'active'
),
(
  'Ananya Iyer',
  'ananya.iyer@businesscoach.in',
  '+91-98765-43215',
  ARRAY['idea_tuning', 'financial_planning'],
  'Serial entrepreneur and business coach. Founded 3 successful startups and now helps founders validate ideas and create sustainable business models.',
  'active'
);

-- Add foreign key constraint for mentor_id
ALTER TABLE service_ratings 
  ADD CONSTRAINT fk_service_ratings_mentor 
  FOREIGN KEY (mentor_id) 
  REFERENCES mentors(id) 
  ON DELETE SET NULL;

-- Function to update mentor's updated_at timestamp
CREATE OR REPLACE FUNCTION update_mentor_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update mentor's updated_at
DROP TRIGGER IF EXISTS mentor_updated_at_trigger ON mentors;
CREATE TRIGGER mentor_updated_at_trigger
  BEFORE UPDATE ON mentors
  FOR EACH ROW
  EXECUTE FUNCTION update_mentor_updated_at();
