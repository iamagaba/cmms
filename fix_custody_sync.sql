-- Fix custody sync issues
-- This script fixes the column name mismatch and updates existing records

-- 1. Drop and recreate the trigger function with correct column names
DROP TRIGGER IF EXISTS trigger_sync_asset_status ON work_orders;
DROP FUNCTION IF EXISTS sync_asset_status_from_work_order();

-- Create corrected function
CREATE OR REPLACE FUNCTION sync_asset_status_from_work_order()
RETURNS TRIGGER AS $$
BEGIN
  -- Skip if no vehicle is associated with this work order
  IF NEW.vehicle_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- When work order moves to In Progress or On Hold, mark asset as In Repair
  IF NEW.status IN ('In Progress', 'On Hold') AND 
     (OLD.status IS NULL OR OLD.status NOT IN ('In Progress', 'On Hold')) THEN
    
    UPDATE vehicles 
    SET status = 'In Repair', 
        updated_at = NOW()
    WHERE id = NEW.vehicle_id;
    
    RAISE NOTICE 'Asset % marked as In Repair due to work order % status change to %', 
                 NEW.vehicle_id, NEW.id, NEW.status;
  END IF;

  -- When work order completes, mark asset as Normal (if no other active work orders)
  IF NEW.status = 'Completed' AND 
     (OLD.status IS NULL OR OLD.status != 'Completed') THEN
    
    -- Only set to Normal if there are no other active work orders for this vehicle
    IF NOT EXISTS (
      SELECT 1 FROM work_orders 
      WHERE vehicle_id = NEW.vehicle_id 
      AND id != NEW.id 
      AND status IN ('In Progress', 'On Hold')
    ) THEN
      
      UPDATE vehicles 
      SET status = 'Normal', 
          updated_at = NOW()
      WHERE id = NEW.vehicle_id;
      
      RAISE NOTICE 'Asset % marked as Normal - work order % completed and no other active work orders', 
                   NEW.vehicle_id, NEW.id;
    ELSE
      RAISE NOTICE 'Asset % remains In Repair - other active work orders exist', 
                   NEW.vehicle_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
CREATE TRIGGER trigger_sync_asset_status
AFTER INSERT OR UPDATE OF status ON work_orders
FOR EACH ROW
EXECUTE FUNCTION sync_asset_status_from_work_order();

-- 2. Fix existing mismatched records
-- Update vehicles to 'In Repair' if they have active work orders
UPDATE vehicles 
SET status = 'In Repair', updated_at = NOW()
WHERE id IN (
    SELECT DISTINCT wo.vehicle_id
    FROM work_orders wo
    LEFT JOIN vehicles v ON wo.vehicle_id = v.id
    WHERE wo.status IN ('In Progress', 'On Hold')
    AND wo.vehicle_id IS NOT NULL
    AND v.status != 'In Repair'
);

-- 3. Show what was fixed
SELECT 
    'Fixed Records' as action,
    COUNT(*) as count
FROM work_orders wo
LEFT JOIN vehicles v ON wo.vehicle_id = v.id
WHERE wo.status IN ('In Progress', 'On Hold')
AND wo.vehicle_id IS NOT NULL
AND v.status = 'In Repair';

-- 4. Verify the fix worked
SELECT 
    wo.workOrderNumber,
    wo.status as work_order_status,
    v.license_plate,
    v.status as vehicle_status,
    CASE 
        WHEN wo.status IN ('In Progress', 'On Hold') AND v.status = 'In Repair' THEN '✅ Correct'
        WHEN wo.status IN ('In Progress', 'On Hold') AND v.status != 'In Repair' THEN '❌ Still Wrong'
        ELSE '⚪ Other'
    END as sync_status
FROM work_orders wo
LEFT JOIN vehicles v ON wo.vehicle_id = v.id
WHERE wo.status IN ('In Progress', 'On Hold')
AND wo.vehicle_id IS NOT NULL
ORDER BY sync_status, wo.workOrderNumber;