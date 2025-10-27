/*
  # Create User Record on Signup

  ## Overview
  This migration creates a database trigger that automatically creates a user record
  in the public.users table whenever a new user signs up through Supabase Auth.

  ## 1. Function Creation
  Creates a PostgreSQL function that will be triggered on new user signup to:
  - Insert a new record in the public.users table
  - Use the auth.users id and email
  - Set appropriate timestamps

  ## 2. Trigger Setup
  Creates a trigger on auth.users table that:
  - Fires after a new user is inserted
  - Calls the function to create the public.users record
  - Ensures data consistency between auth and public schemas

  ## 3. Important Notes
  - This ensures every authenticated user has a corresponding record in public.users
  - Required for foreign key relationships in other tables
  - Handles edge cases where user record might already exist
*/

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.created_at,
    NEW.updated_at
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    updated_at = EXCLUDED.updated_at;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Backfill existing auth users to public.users (if any)
INSERT INTO public.users (id, email, created_at, updated_at)
SELECT 
  id,
  email,
  created_at,
  COALESCE(updated_at, created_at)
FROM auth.users
ON CONFLICT (id) DO NOTHING;