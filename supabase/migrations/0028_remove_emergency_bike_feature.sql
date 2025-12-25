-- Drop emergency bike related functions
DROP FUNCTION IF EXISTS public.notify_overdue_work_orders_needing_emergency_bikes();
DROP FUNCTION IF EXISTS public.return_emergency_bike_from_work_order(UUID, TEXT, UUID);
DROP FUNCTION IF EXISTS public.assign_emergency_bike_to_work_order(UUID, UUID, TEXT, UUID);

-- Drop emergency bike columns from tables
ALTER TABLE IF EXISTS public.work_orders
    DROP COLUMN IF EXISTS emergency_bike_notified_at;

-- Drop emergency bike assignments table
DROP TABLE IF EXISTS public.emergency_bike_assignments;

-- Remove emergency bike flag from vehicles
ALTER TABLE IF EXISTS public.vehicles
    DROP COLUMN IF EXISTS is_emergency_bike;