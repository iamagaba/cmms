-- Create emergency_bike_assignments table
CREATE TABLE public.emergency_bike_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  work_order_id UUID NOT NULL REFERENCES public.work_orders(id) ON DELETE CASCADE,
  emergency_bike_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE RESTRICT,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  returned_at TIMESTAMP WITH TIME ZONE,
  assignment_notes TEXT,
  return_notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  returned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_active_assignment_per_work_order UNIQUE (work_order_id, emergency_bike_id, returned_at)
);

-- Enable RLS (REQUIRED for security)
ALTER TABLE public.emergency_bike_assignments ENABLE ROW LEVEL SECURITY;

-- Policies for emergency_bike_assignments
-- Allow authenticated users to view assignments related to their work orders or if they are admins
CREATE POLICY "Allow authenticated users to view their work order's emergency bike assignments" ON public.emergency_bike_assignments
FOR SELECT TO authenticated
USING (
  (EXISTS (SELECT 1 FROM public.work_orders wo WHERE wo.id = work_order_id AND wo.created_by = auth.uid()))
  OR
  public.is_current_user_admin()
);

-- Allow authenticated users to create assignments
CREATE POLICY "Allow authenticated users to create emergency bike assignments" ON public.emergency_bike_assignments
FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- Allow authenticated users to update their own assignments or if they are admins
CREATE POLICY "Allow authenticated users to update their emergency bike assignments" ON public.emergency_bike_assignments
FOR UPDATE TO authenticated
USING (
  (EXISTS (SELECT 1 FROM public.work_orders wo WHERE wo.id = work_order_id AND wo.created_by = auth.uid()))
  OR
  public.is_current_user_admin()
)
WITH CHECK (auth.uid() IS NOT NULL);

-- Allow admins to delete assignments
CREATE POLICY "Allow admins to delete emergency bike assignments" ON public.emergency_bike_assignments
FOR DELETE TO authenticated
USING (public.is_current_user_admin());