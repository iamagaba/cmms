-- Simple admin privilege restoration (no profiles table needed)
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

-- Verify the update worked
SELECT 
  email, 
  raw_app_meta_data->'is_admin' as app_meta_admin,
  raw_user_meta_data->'is_admin' as user_meta_admin
FROM auth.users 
WHERE email = 'bbyarugaba@bodawerkco.ug';