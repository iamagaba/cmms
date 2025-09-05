-- Step 1: Temporarily remove the foreign key constraint from notifications
-- to allow for the replacement of the work_orders table.
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_work_order_id_fkey;

-- Step 2: Drop the old work order tables that don't match our application's data model.
DROP TABLE IF EXISTS public.work_order_notes, public.work_order_attachments, public.work_order_history, public.work_order_templates, public.work_orders;

-- Step 3: Enhance existing tables with columns required by the application.
ALTER TABLE public.locations ADD COLUMN IF NOT EXISTS lat NUMERIC;
ALTER TABLE public.locations ADD COLUMN IF NOT EXISTS lng NUMERIC;

ALTER TABLE public.technicians ADD COLUMN IF NOT EXISTS lat NUMERIC;
ALTER TABLE public.technicians ADD COLUMN IF NOT EXISTS lng NUMERIC;
ALTER TABLE public.technicians ADD COLUMN IF NOT EXISTS avatar TEXT;
ALTER TABLE public.technicians ADD COLUMN IF NOT EXISTS status TEXT;
ALTER TABLE public.technicians ADD COLUMN IF NOT EXISTS join_date TIMESTAMPTZ;

-- Step 4: Create the new work_orders table designed for our application.
CREATE TABLE public.work_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  work_order_number TEXT,
  vehicle_id TEXT,
  vehicle_model TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  status TEXT,
  priority TEXT,
  assigned_technician_id UUID REFERENCES public.technicians(id) ON DELETE SET NULL,
  location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
  service TEXT,
  service_notes TEXT,
  parts_used JSONB,
  activity_log JSONB,
  sla_due TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  customer_lat NUMERIC,
  customer_lng NUMERIC,
  customer_address TEXT,
  on_hold_reason TEXT,
  appointment_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 5: Re-establish the link between notifications and the new work_orders table.
ALTER TABLE public.notifications ADD CONSTRAINT notifications_work_order_id_fkey
FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id) ON DELETE CASCADE;

-- Step 6: Secure all tables with Row Level Security (RLS).
-- Locations
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access" ON public.locations;
CREATE POLICY "Allow public read access" ON public.locations FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow authenticated users to manage data" ON public.locations;
CREATE POLICY "Allow authenticated users to manage data" ON public.locations FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Technicians
ALTER TABLE public.technicians ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access" ON public.technicians;
CREATE POLICY "Allow public read access" ON public.technicians FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow authenticated users to manage data" ON public.technicians;
CREATE POLICY "Allow authenticated users to manage data" ON public.technicians FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Work Orders
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access" ON public.work_orders;
CREATE POLICY "Allow public read access" ON public.work_orders FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow authenticated users to manage data" ON public.work_orders;
CREATE POLICY "Allow authenticated users to manage data" ON public.work_orders FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Re-enable the trigger for auto-updating the 'updated_at' column on the new work_orders table.
DROP TRIGGER IF EXISTS update_work_orders_updated_at ON public.work_orders;
CREATE TRIGGER update_work_orders_updated_at
BEFORE UPDATE ON public.work_orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Re-enable the trigger for setting the work order number on insert.
DROP TRIGGER IF EXISTS set_work_order_number_trigger ON public.work_orders;
CREATE TRIGGER set_work_order_number_trigger
BEFORE INSERT ON public.work_orders
FOR EACH ROW EXECUTE FUNCTION public.set_work_order_number();