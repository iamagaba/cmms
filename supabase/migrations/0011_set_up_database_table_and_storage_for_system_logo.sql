-- Function to check if the current user is an admin
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    is_admin_user BOOLEAN;
BEGIN
    SELECT is_admin INTO is_admin_user
    FROM public.profiles
    WHERE id = auth.uid();
    RETURN COALESCE(is_admin_user, false);
END;
$$;

-- Create system_settings table
CREATE TABLE IF NOT EXISTS public.system_settings (
  key TEXT NOT NULL PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Policies for system_settings
DROP POLICY IF EXISTS "Allow public read access" ON public.system_settings;
CREATE POLICY "Allow public read access" ON public.system_settings
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admins to manage settings" ON public.system_settings;
CREATE POLICY "Allow admins to manage settings" ON public.system_settings
FOR ALL USING (public.is_current_user_admin())
WITH CHECK (public.is_current_user_admin());

-- Create storage bucket for system assets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('system_assets', 'system_assets', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/svg+xml'])
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 5242880, allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/svg+xml'];

-- Policies for storage bucket
DROP POLICY IF EXISTS "Public read access for system_assets" ON storage.objects;
CREATE POLICY "Public read access for system_assets" ON storage.objects
FOR SELECT USING (bucket_id = 'system_assets');

DROP POLICY IF EXISTS "Admin upload access for system_assets" ON storage.objects;
CREATE POLICY "Admin upload access for system_assets" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'system_assets' AND public.is_current_user_admin());

DROP POLICY IF EXISTS "Admin update access for system_assets" ON storage.objects;
CREATE POLICY "Admin update access for system_assets" ON storage.objects
FOR UPDATE USING (bucket_id = 'system_assets' AND public.is_current_user_admin());

DROP POLICY IF EXISTS "Admin delete access for system_assets" ON storage.objects;
CREATE POLICY "Admin delete access for system_assets" ON storage.objects
FOR DELETE USING (bucket_id = 'system_assets' AND public.is_current_user_admin());