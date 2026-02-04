-- Migration: Update existing 'Open' status to 'New' in work_orders table
-- This updates all existing work orders with 'Open' status to use 'New' status

-- Update existing work orders
UPDATE work_orders 
SET status = 'New', 
    updated_at = NOW()
WHERE status = 'Open';

-- Add a comment for documentation
COMMENT ON COLUMN work_orders.status IS 'Work order status: New, Confirmation, Ready, In Progress, On Hold, Completed, Cancelled';

-- Log the number of updated records
DO $$
DECLARE
    updated_count INTEGER;
BEGIN
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Updated % work orders from Open to New status', updated_count;
END $$;