-- Create the notifications table
CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  work_order_id UUID REFERENCES public.work_orders(id) ON DELETE CASCADE
);

-- Enable Row Level Security on the new table
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow all authenticated users to read notifications
CREATE POLICY "Allow all authenticated users to read notifications" ON public.notifications
FOR SELECT TO authenticated USING (true);

-- Create a function to generate notifications
CREATE OR REPLACE FUNCTION public.create_notification_on_work_order_change()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
DECLARE
  notification_message TEXT;
BEGIN
  IF (TG_OP = 'INSERT') THEN
    notification_message := 'New work order ' || NEW.work_order_number || ' was created.';
    INSERT INTO public.notifications (message, work_order_id)
    VALUES (notification_message, NEW.id);
  ELSIF (TG_OP = 'UPDATE') THEN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      notification_message := 'Work order ' || NEW.work_order_number || ' status changed from ' || OLD.status || ' to ' || NEW.status || '.';
      INSERT INTO public.notifications (message, work_order_id)
      VALUES (notification_message, NEW.id);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Create a trigger to call the function after inserts or updates on work_orders
CREATE TRIGGER on_work_order_change
  AFTER INSERT OR UPDATE ON public.work_orders
  FOR EACH ROW EXECUTE FUNCTION public.create_notification_on_work_order_change();