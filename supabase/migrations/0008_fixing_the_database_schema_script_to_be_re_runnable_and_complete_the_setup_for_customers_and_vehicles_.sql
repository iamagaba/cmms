-- 1. Create Customers Table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    address TEXT,
    city VARCHAR,
    state VARCHAR,
    zip_code VARCHAR,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_customers_updated_at ON public.customers;
CREATE TRIGGER update_customers_updated_at
BEFORE UPDATE ON public.customers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS and add policies for customers
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated users to manage customer data" ON public.customers;
CREATE POLICY "Allow authenticated users to manage customer data" ON public.customers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 2. Create Vehicles (Assets) Table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    vin TEXT NOT NULL UNIQUE,
    make VARCHAR NOT NULL,
    model VARCHAR NOT NULL,
    year INT NOT NULL,
    license_plate TEXT,
    battery_capacity NUMERIC,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_vehicles_updated_at ON public.vehicles;
CREATE TRIGGER update_vehicles_updated_at
BEFORE UPDATE ON public.vehicles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS and add policies for vehicles
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated users to manage vehicle data" ON public.vehicles;
CREATE POLICY "Allow authenticated users to manage vehicle data" ON public.vehicles FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. Update Work Orders Table
-- Drop old redundant text-based columns
ALTER TABLE public.work_orders DROP COLUMN IF EXISTS customer_name;
ALTER TABLE public.work_orders DROP COLUMN IF EXISTS customer_phone;
ALTER TABLE public.work_orders DROP COLUMN IF EXISTS vehicle_model;

-- Add new foreign key columns if they don't exist
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL;

-- This is the tricky part: replacing the old text vehicle_id with a new UUID one.
-- We do this by renaming the old one, adding the new one, and then dropping the old one.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'work_orders' AND column_name = 'vehicle_id' AND udt_name != 'uuid'
  ) THEN
    ALTER TABLE public.work_orders RENAME COLUMN vehicle_id TO vehicle_id_old_text;
  END IF;
END;
$$;

ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL;
ALTER TABLE public.work_orders DROP COLUMN IF EXISTS vehicle_id_old_text;