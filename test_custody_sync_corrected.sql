-- Corrected test query to verify custody sync is working
-- Run this AFTER adding the status column to vehicles table

-- 1. First, let's see what we're working with
SELECT 
    'Current work orders and vehicle status' as description,
    wo.workOrderNumber,
    wo.status as work_order_status,
    v.license_plate,
    v.status as vehicle_status,
    CASE 
        WHEN wo.status IN ('In Progress', 'On Hold') AND v.status = 'In Repair' THEN '✅ Correct'
        WHEN wo.status IN ('In Progress', 'On Hold') AND v.status != 'In Repair' THEN '❌ Should be In Repair'
        WHEN wo.status = 'Completed' AND v.status = 'Normal' THEN '✅ Correct'
        ELSE '⚪ Other status'
    END as sync_status
FROM work_orders wo
LEFT JOIN vehicles v ON wo.vehicle_id = v.id
WHERE wo.vehicle_id IS NOT NULL
ORDER BY sync_status, wo.workOrderNumber;

-- 2. Count summary
SELECT 
    COUNT(*) as total_work_orders_with_vehicles,
    COUNT(CASE WHEN wo.status IN ('In Progress', 'On Hold') THEN 1 END) as active_work_orders,
    COUNT(CASE WHEN wo.status IN ('In Progress', 'On Hold') AND v.status = 'In Repair' THEN 1 END) as correctly_marked_in_repair,
    COUNT(CASE WHEN wo.status IN ('In Progress', 'On Hold') AND v.status != 'In Repair' THEN 1 END) as incorrectly_marked
FROM work_orders wo
LEFT JOIN vehicles v ON wo.vehicle_id = v.id
WHERE wo.vehicle_id IS NOT NULL;