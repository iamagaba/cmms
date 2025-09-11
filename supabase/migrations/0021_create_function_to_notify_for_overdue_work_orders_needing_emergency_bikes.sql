CREATE OR REPLACE FUNCTION public.notify_overdue_emergency_bike_eligibility()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  r RECORD;
  v_elapsed_active_time INTERVAL;
  v_threshold_hours INTEGER := 6; -- The 6-hour threshold
BEGIN
  FOR r IN
    SELECT
      wo.id AS work_order_id,
      wo.work_order_number,
      wo.work_started_at,
      wo.total_paused_duration_seconds,
      wo.emergency_bike_notified_at
    FROM
      public.work_orders wo
    LEFT JOIN
      public.emergency_bike_assignments eba ON wo.id = eba.work_order_id AND eba.returned_at IS NULL
    WHERE
      wo.status = 'In Progress'
      AND wo.work_started_at IS NOT NULL
      AND eba.id IS NULL -- No active emergency bike assignment
      AND (wo.emergency_bike_notified_at IS NULL OR wo.emergency_bike_notified_at < NOW() - INTERVAL '1 hour') -- Not notified recently (e.g., once per hour)
  LOOP
    -- Calculate active time in 'In Progress'
    v_elapsed_active_time := (NOW() - r.work_started_at) - (COALESCE(r.total_paused_duration_seconds, 0) || ' seconds')::INTERVAL;

    IF v_elapsed_active_time > (v_threshold_hours || ' hours')::INTERVAL THEN
      -- Create a notification
      INSERT INTO public.notifications (message, work_order_id, work_order_number)
      VALUES (
        'Work order ' || r.work_order_number || ' has been in progress for over ' || v_threshold_hours || ' hours. Consider assigning an emergency bike.',
        r.work_order_id,
        r.work_order_number
      );

      -- Update the work order to mark it as notified
      UPDATE public.work_orders
      SET emergency_bike_notified_at = NOW()
      WHERE id = r.work_order_id;
    END IF;
  END LOOP;
END;
$$;