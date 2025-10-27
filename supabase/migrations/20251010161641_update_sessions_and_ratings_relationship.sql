/*
  # Update Sessions and Ratings Relationship

  ## Overview
  This migration adds proper relationship between service_ratings and user_sessions,
  and adds rating information to user_sessions for easier history display.

  ## Changes
  
  1. Add rating fields to user_sessions table:
     - `rating` (integer) - User's rating for the session
     - `rating_feedback` (text) - Feedback for low ratings
     - `mentor_assigned` (boolean) - Whether mentor was assigned

  2. Add foreign key from service_ratings to user_sessions

  3. Create indexes for better query performance

  4. No RLS changes needed - existing policies cover these fields
*/

-- Add rating fields to user_sessions if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_sessions' AND column_name = 'rating'
  ) THEN
    ALTER TABLE user_sessions ADD COLUMN rating integer CHECK (rating >= 1 AND rating <= 5);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_sessions' AND column_name = 'rating_feedback'
  ) THEN
    ALTER TABLE user_sessions ADD COLUMN rating_feedback text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_sessions' AND column_name = 'mentor_assigned'
  ) THEN
    ALTER TABLE user_sessions ADD COLUMN mentor_assigned boolean DEFAULT false;
  END IF;
END $$;

-- Add foreign key from service_ratings to user_sessions if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'service_ratings_session_id_fkey'
  ) THEN
    ALTER TABLE service_ratings 
      ADD CONSTRAINT service_ratings_session_id_fkey 
      FOREIGN KEY (session_id) 
      REFERENCES user_sessions(id) 
      ON DELETE CASCADE;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_rating ON user_sessions(user_id, rating);
CREATE INDEX IF NOT EXISTS idx_user_sessions_service_status ON user_sessions(service_type, status);
CREATE INDEX IF NOT EXISTS idx_service_ratings_session_id ON service_ratings(session_id);

-- Create a function to update session when rating is submitted
CREATE OR REPLACE FUNCTION update_session_on_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_sessions
  SET 
    rating = NEW.rating,
    rating_feedback = NEW.feedback_reason,
    mentor_assigned = NEW.mentor_assigned,
    status = 'completed',
    completed_at = COALESCE(completed_at, now())
  WHERE id = NEW.session_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update session when rating is added
DROP TRIGGER IF EXISTS rating_updates_session ON service_ratings;
CREATE TRIGGER rating_updates_session
  AFTER INSERT ON service_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_session_on_rating();
