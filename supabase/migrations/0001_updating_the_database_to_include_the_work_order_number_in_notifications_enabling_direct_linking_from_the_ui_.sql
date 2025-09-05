-- Add a column to store the user-friendly work order number
ALTER TABLE public.notifications ADD COLUMN work_order_number TEXT;

-- Update the function to populate the new column
CREATE OR REPLACE FUNCTION public.create_notification_on_work_order_change()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  notification_message TEXT;
BEGIN
  IF (TG_OP = 'INSERT') THEN
    notification_message := 'New work order ' || NEW.work_order_number || ' was created.';
    INSERT INTO public.notifications (message, work_order_id, work_order_number)
    VALUES (notification_message, NEW.id, NEW.work_order_number);
  ELSIF (TG_OP = 'UPDATE') THEN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      notification_message := 'Work order ' || NEW.work_order_number || ' status changed from ' || OLD.status || ' to ' || NEW.status || '.';
      INSERT INTO public.notifications (message, work_order_id, work_order_number)
      VALUES (notification_message, NEW.id, NEW.work_order_number);
    END IF;
  END IF;
  RETURN NEW;
END;
$function$