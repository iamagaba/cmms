CREATE OR REPLACE FUNCTION public.generate_work_order_number()
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
  today_str TEXT;
  sequence_num INTEGER;
  work_order_number TEXT;
BEGIN
  -- Get today's date in YYYYMMDD format
  today_str := to_char(CURRENT_DATE, 'YYYYMMDD');
  
  -- Get the next sequence number for today
  SELECT COALESCE(MAX(
    CAST(
      SUBSTRING(wo.work_order_number FROM 'WO-' || today_str || '-(\d+)') -- Explicitly qualify with 'wo' alias
      AS INTEGER
    )
  ), 0) + 1
  INTO sequence_num
  FROM work_orders wo -- Use an alias 'wo' for the work_orders table
  WHERE wo.work_order_number LIKE 'WO-' || today_str || '-%'; -- Explicitly qualify with 'wo' alias
  
  -- Format the work order number
  work_order_number := 'WO-' || today_str || '-' || LPAD(sequence_num::TEXT, 4, '0');
  
  RETURN work_order_number;
END;
$function$;