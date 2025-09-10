-- Create service_categories table to store different types of issues
CREATE TABLE IF NOT EXISTS public.service_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for service_categories
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;

-- Policies for service_categories: Admins can manage, authenticated users can read.
DROP POLICY IF EXISTS "Allow admins to manage service categories" ON public.service_categories;
CREATE POLICY "Allow admins to manage service categories" ON public.service_categories
  FOR ALL
  TO authenticated
  USING (is_current_user_admin())
  WITH CHECK (is_current_user_admin());

DROP POLICY IF EXISTS "Allow authenticated users to read service categories" ON public.service_categories;
CREATE POLICY "Allow authenticated users to read service categories" ON public.service_categories
  FOR SELECT
  TO authenticated
  USING (true);


-- Create sla_policies table to define SLA rules for each service category
CREATE TABLE IF NOT EXISTS public.sla_policies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_category_id UUID NOT NULL REFERENCES public.service_categories(id) ON DELETE CASCADE,
  first_response_minutes INTEGER,
  response_hours INTEGER,
  resolution_hours INTEGER,
  expected_repair_hours INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(service_category_id) -- Each category can only have one policy
);

-- Enable RLS for sla_policies
ALTER TABLE public.sla_policies ENABLE ROW LEVEL SECURITY;

-- Policies for sla_policies: Admins can manage, authenticated users can read.
DROP POLICY IF EXISTS "Allow admins to manage SLA policies" ON public.sla_policies;
CREATE POLICY "Allow admins to manage SLA policies" ON public.sla_policies
  FOR ALL
  TO authenticated
  USING (is_current_user_admin())
  WITH CHECK (is_current_user_admin());

DROP POLICY IF EXISTS "Allow authenticated users to read SLA policies" ON public.sla_policies;
CREATE POLICY "Allow authenticated users to read SLA policies" ON public.sla_policies
  FOR SELECT
  TO authenticated
  USING (true);


-- Add new columns to the work_orders table to track SLA lifecycle
ALTER TABLE public.work_orders
  ADD COLUMN IF NOT EXISTS service_category_id UUID REFERENCES public.service_categories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS work_started_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS sla_timers_paused_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS total_paused_duration_seconds INTEGER DEFAULT 0;