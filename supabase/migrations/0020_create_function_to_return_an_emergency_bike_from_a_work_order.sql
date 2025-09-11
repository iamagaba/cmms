CREATE OR REPLACE FUNCTION public.return_emergency_bike_from_work_order(
  p_assignment_id UUID,
  p_return_notes TEXT DEFAULT NULL,
  p_returned_by UUID DEFAULT auth.uid()
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_work_order_id UUID;
  v_emergency_bike_id UUID;
  v_work_order_number TEXT;
  v_bike_license_plate TEXT;
  v_activity_log JSONB;
BEGIN
  -- Update the assignment record
  UPDATE public.emergency_bike_assignments
  SET
    returned_at = NOW(),
    return_notes = p_return_notes,
    returned_by = p_returned_by
  WHERE id = p_assignment_id AND returned_at IS NULL
  RETURNING work_order_id, emergency_bike_id INTO v_work_order_id, v_emergency_bike_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Active emergency bike assignment with ID % not found.', p_assignment_id;
  END IF;

  -- Get work order number and bike license plate for notification and activity log
  SELECT work_order_number, activity_log INTO v_work_order_number, v_activity_log
  FROM public.work_orders
  WHERE id = v_work_order_id;

  SELECT license_plate INTO v_bike_license_plate
  FROM public.vehicles
  WHERE id = v_emergency_bike_id;

  -- Add activity log entry to the work order
  UPDATE public.work_orders
  SET
    activity_log = COALESCE(v_activity_log, '[]'::jsonb) || jsonb_build_object(
      'timestamp', NOW(),
      'activity', 'Emergency bike ' || v_bike_license_plate || ' returned.',
      'userId', p_returned_by
    )
  WHERE id = v_work_order_id;

  -- Create a notification
  INSERT INTO public.notifications (message, work_order_id, work_order_number)
  VALUES (
    'Emergency bike ' || v_bike_license_plate || ' returned from work order ' || v_work_order_number || '.',
    v_work_order_id,
    v_work_order_number
  );

END;
$$;