-- Deploy missing add_part_to_work_order RPC and supporting table if needed
-- Safe to re-run (checks for existence)

-- Create work_order_parts table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.work_order_parts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  work_order_id uuid NOT NULL REFERENCES public.work_orders(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES public.inventory_items(id) ON DELETE RESTRICT,
  quantity_used int NOT NULL CHECK (quantity_used > 0),
  price_at_time_of_use numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS if not already
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'work_order_parts'
  ) THEN
    -- no-op, created above
    NULL;
  END IF;
END$$;

-- Minimal RLS policies (adjust to your needs)
ALTER TABLE public.work_order_parts ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'work_order_parts' AND policyname = 'Enable read for authenticated'
  ) THEN
    CREATE POLICY "Enable read for authenticated" ON public.work_order_parts FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'work_order_parts' AND policyname = 'Enable write for authenticated'
  ) THEN
    CREATE POLICY "Enable write for authenticated" ON public.work_order_parts FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'work_order_parts' AND policyname = 'Enable delete for authenticated'
  ) THEN
    CREATE POLICY "Enable delete for authenticated" ON public.work_order_parts FOR DELETE TO authenticated USING (true);
  END IF;
END $$;

-- Ensure helper to update updated_at exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create add_part_to_work_order RPC (idempotent)
CREATE OR REPLACE FUNCTION public.add_part_to_work_order(
  p_work_order_id uuid,
  p_item_id uuid,
  p_quantity_used int
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_stock int;
  current_price numeric;
BEGIN
  -- lock item row
  SELECT quantity_on_hand, unit_price INTO current_stock, current_price
  FROM public.inventory_items WHERE id = p_item_id FOR UPDATE;

  IF current_stock IS NULL THEN
    RAISE EXCEPTION 'Inventory item not found %', p_item_id;
  END IF;
  IF current_stock < p_quantity_used THEN
    RAISE EXCEPTION 'Not enough stock for item %. Required: %, Available: %', p_item_id, p_quantity_used, current_stock;
  END IF;

  -- decrement stock
  UPDATE public.inventory_items
  SET quantity_on_hand = quantity_on_hand - p_quantity_used
  WHERE id = p_item_id;

  -- record usage snapshot
  INSERT INTO public.work_order_parts (work_order_id, item_id, quantity_used, price_at_time_of_use)
  VALUES (p_work_order_id, p_item_id, p_quantity_used, current_price);
END;
$$;
