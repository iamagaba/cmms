-- Create inventory_items table
CREATE TABLE IF NOT EXISTS public.inventory_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  description TEXT,
  quantity_on_hand INTEGER NOT NULL DEFAULT 0,
  reorder_level INTEGER NOT NULL DEFAULT 5,
  unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create work_order_parts table (join table)
CREATE TABLE IF NOT EXISTS public.work_order_parts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  work_order_id UUID NOT NULL REFERENCES public.work_orders(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE RESTRICT, -- Prevent deleting an item if it's used
  quantity_used INTEGER NOT NULL CHECK (quantity_used > 0),
  price_at_time_of_use NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for both tables
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_order_parts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for inventory_items
DROP POLICY IF EXISTS "Allow authenticated users to manage inventory" ON public.inventory_items;
CREATE POLICY "Allow authenticated users to manage inventory" ON public.inventory_items
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create RLS policies for work_order_parts
DROP POLICY IF EXISTS "Allow authenticated users to view work order parts" ON public.work_order_parts;
CREATE POLICY "Allow authenticated users to view work order parts" ON public.work_order_parts
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to add parts to work orders" ON public.work_order_parts;
CREATE POLICY "Allow authenticated users to add parts to work orders" ON public.work_order_parts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated users to remove parts from work orders" ON public.work_order_parts;
CREATE POLICY "Allow authenticated users to remove parts from work orders" ON public.work_order_parts
  FOR DELETE
  TO authenticated
  USING (true);

-- Create a trigger to automatically update the 'updated_at' column
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_inventory_item_update') THEN
    CREATE TRIGGER on_inventory_item_update
      BEFORE UPDATE ON public.inventory_items
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END;
$$;

-- Create the transactional function to add a part to a work order
CREATE OR REPLACE FUNCTION add_part_to_work_order(
  p_work_order_id UUID,
  p_item_id UUID,
  p_quantity_used INT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_stock INT;
  current_price NUMERIC;
BEGIN
  -- Lock the row to prevent race conditions
  SELECT quantity_on_hand, unit_price
  INTO current_stock, current_price
  FROM public.inventory_items
  WHERE id = p_item_id
  FOR UPDATE;

  -- Check if there is enough stock
  IF current_stock < p_quantity_used THEN
    RAISE EXCEPTION 'Not enough stock for item SKU %. Required: %, Available: %', (SELECT sku FROM public.inventory_items WHERE id = p_item_id), p_quantity_used, current_stock;
  END IF;

  -- Update the inventory
  UPDATE public.inventory_items
  SET quantity_on_hand = quantity_on_hand - p_quantity_used
  WHERE id = p_item_id;

  -- Record the part usage
  INSERT INTO public.work_order_parts (work_order_id, item_id, quantity_used, price_at_time_of_use)
  VALUES (p_work_order_id, p_item_id, p_quantity_used, current_price);
END;
$$;