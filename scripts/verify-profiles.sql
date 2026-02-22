-- Verify Profiles Setup
-- Run this in Supabase SQL Editor to check if profiles are set up correctly

-- 1. Check if all auth users have profiles
SELECT 
  'Users without profiles' as check_type,
  COUNT(*) as count
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- 2. Check profiles with missing full_name
SELECT 
  'Profiles with missing full_name' as check_type,
  COUNT(*) as count
FROM public.profiles
WHERE full_name IS NULL OR full_name = '';

-- 3. Check profiles with missing email
SELECT 
  'Profiles with missing email' as check_type,
  COUNT(*) as count
FROM public.profiles
WHERE email IS NULL OR email = '';

-- 4. Show all profiles with their details
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.role,
  p.is_admin,
  u.email as auth_email,
  u.created_at as user_created_at
FROM public.profiles p
LEFT JOIN auth.users u ON p.id = u.id
ORDER BY p.updated_at DESC
LIMIT 20;

-- 5. Check if the trigger exists
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
