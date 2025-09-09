-- Add created_by column to work_orders table
ALTER TABLE public.work_orders
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create a function to set the created_by user
CREATE OR REPLACE FUNCTION public.set_work_order_created_by()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.created_by IS NULL THEN
    NEW.created_by := auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

-- Create a trigger to run the function before inserting a new work order
DROP TRIGGER IF EXISTS on_work_order_created_set_user ON public.work_orders;
CREATE TRIGGER on_work_order_created_set_user
BEFORE INSERT ON public.work_orders
FOR EACH ROW EXECUTE FUNCTION public.set_work_order_created_by();