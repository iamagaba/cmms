-- Migration: Create profile trigger and backfill existing users
-- This ensures every user has a profile record for activity timeline display

-- First, check if we need to add full_name and email columns
-- (They might not exist if the table only has first_name/last_name)
DO $$ 
BEGIN
  -- Add full_name column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'full_name'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
    
    -- Populate full_name from first_name and last_name if they exist
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'first_name'
    ) THEN
      UPDATE public.profiles 
      SET full_name = TRIM(CONCAT(COALESCE(first_name, ''), ' ', COALESCE(last_name, '')))
      WHERE full_name IS NULL;
    END IF;
  END IF;

  -- Add email column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'email'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN email TEXT;
  END IF;

  -- Add role column if it doesn't exist (from the test script)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'role'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN role TEXT;
  END IF;
END $$;

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Backfill: Create profiles for existing users who don't have one
INSERT INTO public.profiles (id, email, full_name, updated_at)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', u.email, 'User'),
  NOW()
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO UPDATE
SET
  email = COALESCE(EXCLUDED.email, profiles.email),
  full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
  updated_at = NOW();

-- Update existing profiles: populate email from auth.users if null
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND (p.email IS NULL OR p.email = '');

-- Update existing profiles: populate full_name from email if null
UPDATE public.profiles
SET full_name = COALESCE(NULLIF(full_name, ''), email, 'User')
WHERE full_name IS NULL OR full_name = '';

