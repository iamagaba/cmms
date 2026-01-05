-- Add warranty and status fields to vehicles table

-- Add status column
ALTER TABLE vehicles 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Normal';

-- Add warranty columns
ALTER TABLE vehicles 
ADD COLUMN IF NOT EXISTS warranty_start_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS warranty_end_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS warranty_months INTEGER;

-- Add constraint for valid status values
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'chk_vehicle_status'
  ) THEN
    ALTER TABLE vehicles
      ADD CONSTRAINT chk_vehicle_status CHECK (status IN ('Normal', 'Available', 'In Repair', 'Decommissioned'));
  END IF;
END $$;

-- Add index for status filtering
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);

-- Comments
COMMENT ON COLUMN vehicles.status IS 'Vehicle status: Normal, Available, In Repair, Decommissioned';
COMMENT ON COLUMN vehicles.warranty_start_date IS 'Start date of vehicle warranty';
COMMENT ON COLUMN vehicles.warranty_end_date IS 'End date of vehicle warranty';
COMMENT ON COLUMN vehicles.warranty_months IS 'Duration of warranty in months';
