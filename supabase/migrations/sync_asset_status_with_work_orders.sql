-- Migration: Auto-sync asset status with work order status
-- This ensures that when a bike enters maintenance (In Progress/On Hold),
-- its status automatically changes to "In Repair", and back to "Normal" when completed.

-- Create function to sync asset status based on work order status changes
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

-- Create trigger on work_orders table
DROP TRIGGER IF EXISTS trigger_sync_asset_status ON work_orders;

CREATE TRIGGER trigger_sync_asset_status
AFTER INSERT OR UPDATE OF status ON work_orders
FOR EACH ROW
EXECUTE FUNCTION sync_asset_status_from_work_order();

-- Add comment for documentation
COMMENT ON FUNCTION sync_asset_status_from_work_order() IS 
'Automatically syncs vehicle status to "In Repair" when work order is In Progress/On Hold, and back to "Normal" when completed (if no other active work orders exist)';
