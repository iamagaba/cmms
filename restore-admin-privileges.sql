-- Grant superadmin privileges to user
-- Run this in your Supabase SQL Editor

-- First, let's check the current user
SELECT id, email, raw_app_meta_data, raw_user_meta_data 
FROM auth.users 
WHERE email = 'bbyarugaba@bodawerkco.ug';

-- Update the user to have superadmin privileges
UPDATE auth.users 
SET 
  raw_app_meta_data = jsonb_set(
    COALESCE(raw_app_meta_data, '{}'::jsonb),
    '{is_admin}',
    'true'::jsonb
  ),
  raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{is_admin}',
    'true'::jsonb
  )
WHERE email = 'bbyarugaba@bodawerkco.ug';

-- Also update the profiles table if it exists
UPDATE profiles 
SET is_admin = true 
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'bbyarugaba@bodawerkco.ug'
);

-- Insert into profiles if the record doesn't exist
INSERT INTO profiles (id, is_admin, first_name, last_name)
SELECT 
  id, 
  true,
  'Admin',
  'User'
FROM auth.users 
WHERE email = 'bbyarugaba@bodawerkco.ug'
  AND NOT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.users.id
  );

-- Verify the changes
SELECT 
  u.id,
  u.email,
  u.raw_app_meta_data,
  u.raw_user_meta_data,
  p.is_admin as profile_admin
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE u.email = 'bbyarugaba@bodawerkco.ug';