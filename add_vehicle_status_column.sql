-- Add status column to vehicles table if it doesn't exist
-- This column tracks whether the vehicle is with customer, in repair, etc.

-- Add the status column
ALTER TABLE vehicles 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'Normal' 
CHECK (status IN ('Normal', 'Available', 'In Repair', 'Decommissioned'));

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);

-- Add comment for documentation
COMMENT ON COLUMN vehicles.status IS 'Vehicle status: Normal (with customer), Available (company asset), In Repair (at service center), Decommissioned (out of service)';

-- Set default status for existing vehicles
UPDATE vehicles 
SET status = 'Normal' 
WHERE status IS NULL;

-- Show the result
SELECT 
    'Vehicles with status' as description,
    status,
    COUNT(*) as count
FROM vehicles 
GROUP BY status
ORDER BY status;