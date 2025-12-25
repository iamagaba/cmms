-- Debug script to investigate custody sync issues

-- 1. Check if the trigger function exists
SELECT routine_name, routine_type, routine_definition
FROM information_schema.routines 
WHERE routine_name = 'sync_asset_status_from_work_order';

-- 2. Check if the trigger exists and is active
SELECT trigger_name, event_manipulation, event_object_table, action_timing, action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_sync_asset_status';

-- 3. Find work orders that are In Progress but vehicles are not In Repair
SELECT 
    wo.id as work_order_id,
    wo.workOrderNumber,
    wo.status as work_order_status,
    wo.vehicle_id,
    v.license_plate,
    v.status as vehicle_status,
    wo.work_started_at,
    wo.updated_at as wo_updated_at,
    v.updated_at as vehicle_updated_at
FROM work_orders wo
LEFT JOIN vehicles v ON wo.vehicle_id = v.id
WHERE wo.status IN ('In Progress', 'On Hold')
AND wo.vehicle_id IS NOT NULL
AND v.status != 'In Repair'
ORDER BY wo.updated_at DESC;

-- 4. Check for any recent trigger activity (if logging is enabled)
-- This might not work if logging isn't configured
SELECT * FROM pg_stat_user_functions 
WHERE funcname = 'sync_asset_status_from_work_order';

-- 5. Manual fix for existing mismatched records
-- UPDATE vehicles 
-- SET status = 'In Repair', updated_at = NOW()
-- WHERE id IN (
--     SELECT DISTINCT wo.vehicle_id
--     FROM work_orders wo
--     LEFT JOIN vehicles v ON wo.vehicle_id = v.id
--     WHERE wo.status IN ('In Progress', 'On Hold')
--     AND wo.vehicle_id IS NOT NULL
--     AND v.status != 'In Repair'
-- );