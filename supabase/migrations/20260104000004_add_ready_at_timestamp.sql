-- Add ready_at timestamp to work_orders table
-- This field tracks when a work order enters 'Ready' status after confirmation

ALTER TABLE work_orders
ADD COLUMN IF NOT EXISTS ready_at TIMESTAMPTZ;

-- Add comment for documentation
COMMENT ON COLUMN work_orders.ready_at IS 'Timestamp when work order status changed to Ready (after confirmation call)';
