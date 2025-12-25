-- This migration ensures that all users have their full_name properly set in user_metadata
-- This is important because the UI reads names from user_metadata.full_name

-- Update the handle_new_user function to also set full_name in user_metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  first_name_val TEXT;
  last_name_val TEXT;
  full_name_val TEXT;
BEGIN
  -- Extract names from metadata
  first_name_val := new.raw_user_meta_data ->> 'first_name';
  last_name_val := new.raw_user_meta_data ->> 'last_name';
  full_name_val := new.raw_user_meta_data ->> 'full_name';
  
  -- If full_name isn't provided but first/last names are, construct it
  IF full_name_val IS NULL AND (first_name_val IS NOT NULL OR last_name_val IS NOT NULL) THEN
    full_name_val := TRIM(COALESCE(first_name_val, '') || ' ' || COALESCE(last_name_val, ''));
  END IF;
  
  -- Insert into profiles table
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (
    new.id, 
    first_name_val,
    last_name_val
  );
  
  -- Update user_metadata to ensure full_name is available for the UI
  IF full_name_val IS NOT NULL AND full_name_val != '' THEN
    UPDATE auth.users 
    SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('full_name', full_name_val)
    WHERE id = new.id;
  END IF;
  
  RETURN new;
END;
$$;

-- Create a function to sync existing users' full_name to user_metadata
CREATE OR REPLACE FUNCTION sync_user_metadata_full_name()
RETURNS void
LANGUAGE PLPGSQL
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  user_record RECORD;
  full_name_val TEXT;
BEGIN
  -- Loop through all users who don't have full_name in their metadata
  FOR user_record IN 
    SELECT u.id, u.raw_user_meta_data, p.first_name, p.last_name
    FROM auth.users u
    LEFT JOIN public.profiles p ON u.id = p.id
    WHERE (u.raw_user_meta_data ->> 'full_name') IS NULL
       OR (u.raw_user_meta_data ->> 'full_name') = ''
  LOOP
    -- Try to construct full_name from profiles table or existing metadata
    full_name_val := NULL;
    
    -- First try profiles table
    IF user_record.first_name IS NOT NULL OR user_record.last_name IS NOT NULL THEN
      full_name_val := TRIM(COALESCE(user_record.first_name, '') || ' ' || COALESCE(user_record.last_name, ''));
    END IF;
    
    -- Fallback to raw_user_meta_data
    IF (full_name_val IS NULL OR full_name_val = '') AND user_record.raw_user_meta_data IS NOT NULL THEN
      full_name_val := TRIM(
        COALESCE(user_record.raw_user_meta_data ->> 'first_name', '') || ' ' || 
        COALESCE(user_record.raw_user_meta_data ->> 'last_name', '')
      );
    END IF;
    
    -- Update user_metadata if we have a valid full name
    IF full_name_val IS NOT NULL AND full_name_val != '' THEN
      UPDATE auth.users 
      SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('full_name', full_name_val)
      WHERE id = user_record.id;
      
      RAISE NOTICE 'Updated user % with full_name: %', user_record.id, full_name_val;
    END IF;
  END LOOP;
END;
$$;

-- Run the sync function to update existing users
SELECT sync_user_metadata_full_name();

-- Drop the sync function as it's only needed once
DROP FUNCTION sync_user_metadata_full_name();