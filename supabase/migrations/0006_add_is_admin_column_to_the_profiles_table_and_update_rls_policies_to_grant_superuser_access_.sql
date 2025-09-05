-- Add is_admin column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Update RLS policies for profiles to allow the specified superuser to manage all profiles
-- Existing policies:
-- CREATE POLICY "profiles_select_policy" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
-- CREATE POLICY "profiles_insert_policy" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
-- CREATE POLICY "profiles_update_policy" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
-- CREATE POLICY "profiles_delete_policy" ON public.profiles FOR DELETE TO authenticated USING (auth.uid() = id);

-- Drop existing policies to recreate them with superuser access
DROP POLICY IF EXISTS profiles_select_policy ON public.profiles;
DROP POLICY IF EXISTS profiles_insert_policy ON public.profiles;
DROP POLICY IF EXISTS profiles_update_policy ON public.profiles;
DROP POLICY IF EXISTS profiles_delete_policy ON public.profiles;
DROP POLICY IF EXISTS profiles_public_read_policy ON public.profiles; -- Drop if it exists

-- Recreate policies to allow individual users to manage their own profile OR the superuser to manage all profiles
CREATE POLICY "profiles_select_policy" ON public.profiles
FOR SELECT TO authenticated
USING (
  (auth.uid() = id) OR (auth.uid() = 'df02bbc5-167b-4a8c-a3f8-de0eb4d9db47')
);

CREATE POLICY "profiles_insert_policy" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (
  (auth.uid() = id) OR (auth.uid() = 'df02bbc5-167b-4a8c-a3f8-de0eb4d9db47')
);

CREATE POLICY "profiles_update_policy" ON public.profiles
FOR UPDATE TO authenticated
USING (
  (auth.uid() = id) OR (auth.uid() = 'df02bbc5-167b-4a8c-a3f8-de0eb4d9db47')
)
WITH CHECK (
  (auth.uid() = id) OR (auth.uid() = 'df02bbc5-167b-4a8c-a3f8-de0eb4d9db47')
);

CREATE POLICY "profiles_delete_policy" ON public.profiles
FOR DELETE TO authenticated
USING (
  (auth.uid() = id) OR (auth.uid() = 'df02bbc5-167b-4a8c-a3f8-de0eb4d9db47')
);

-- Set the provided UID as an admin
UPDATE public.profiles
SET is_admin = TRUE
WHERE id = 'df02bbc5-167b-4a8c-a3f8-de0eb4d9db47';