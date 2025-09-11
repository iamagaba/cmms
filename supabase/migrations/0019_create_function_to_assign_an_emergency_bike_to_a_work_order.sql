CREATE OR REPLACE FUNCTION public.assign_emergency_bike_to_work_order(
  p_work_order_id UUID,
  p_emergency_bike_id UUID,
  p_assignment_notes TEXT DEFAULT NULL,
  p_created_by UUID DEFAULT auth.uid()
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_status TEXT;
  v_work_order_number TEXT;
  v_bike_license_plate TEXT;
  v_activity_log JSONB;
BEGIN
  -- Check if the work order exists and is in 'In Progress' status
  SELECT status, work_order_number, activity_log INTO v_current_status, v_work_order_number, v_activity_log
  FROM public.work_orders
  WHERE id = p_work_order_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Work order with ID % not found.', p_work_order_id;
  END IF;

  IF v_current_status != 'In Progress' THEN
    RAISE EXCEPTION 'Emergency bike can only be assigned to work orders in "In Progress" status.';
  END IF;

  -- Check if the emergency bike exists and is marked as an emergency bike
  SELECT license_plate INTO v_bike_license_plate
  FROM public.vehicles
  WHERE id = p_emergency_bike_id AND is_emergency_bike = TRUE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Emergency bike with ID % not found or is not marked as an emergency bike.', p_emergency_bike_id;
  END IF;

  -- Check for existing active assignment for this work order
  IF EXISTS (SELECT 1 FROM public.emergency_bike_assignments WHERE work_order_id = p_work_order_id AND returned_at IS NULL) THEN
    RAISE EXCEPTION 'An emergency bike is already actively assigned to this work order.';
  END IF;

  -- Check if the emergency bike is currently assigned to another work order
  IF EXISTS (SELECT 1 FROM public.emergency_bike_assignments WHERE emergency_bike_id = p_emergency_bike_id AND returned_at IS NULL) THEN
    RAISE EXCEPTION 'Emergency bike with license plate % is currently assigned to another work order.', v_bike_license_plate;
  END IF;

  -- Insert the new assignment
  INSERT INTO public.emergency_bike_assignments (work_order_id, emergency_bike_id, assignment_notes, created_by)
  VALUES (p_work_order_id, p_emergency_bike_id, p_assignment_notes, p_created_by);

  -- Add activity log entry to the work order
  UPDATE public.work_orders
  SET
    activity_log = COALESCE(v_activity_log, '[]'::jsonb) || jsonb_build_object(
      'timestamp', NOW(),
      'activity', 'Emergency bike ' || v_bike_license_plate || ' assigned.',
      'userId', p_created_by
    )
  WHERE id = p_work_order_id;

  -- Create a notification
  INSERT INTO public.notifications (message, work_order_id, work_order_number)
  VALUES (
    'Emergency bike ' || v_bike_license_plate || ' assigned to work order ' || v_work_order_number || '.',
    p_work_order_id,
    v_work_order_number
  );

END;
$$;