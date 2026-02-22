-- Create Test User for Automated Testing
-- Run this in Supabase SQL Editor

-- 1. Create the auth user (this creates the authentication record)
-- Note: You'll need to do this via Supabase Dashboard or use Supabase Admin API
-- because auth.users is managed by Supabase Auth service

-- 2. After creating the user in Supabase Dashboard, run this to set up profile data:

-- Insert into profiles table (adjust based on your schema)
INSERT INTO profiles (id, email, full_name, role, created_at, updated_at)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'example@gmail.com'),
  'example@gmail.com',
  'Test User',
  'dispatcher', -- or 'admin', 'technician', etc.
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET 
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- 3. Grant necessary permissions (if using custom roles)
-- Adjust based on your RLS policies and role system

-- Example: If you have a user_roles table
-- INSERT INTO user_roles (user_id, role)
-- VALUES (
--   (SELECT id FROM auth.users WHERE email = 'example@gmail.com'),
--   'dispatcher'
-- );

-- 4. Verify the user was created
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  u.created_at,
  p.full_name,
  p.role
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'example@gmail.com';
