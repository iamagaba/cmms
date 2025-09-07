-- Add the new columns to the vehicles table if they don't already exist
ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS date_of_manufacture DATE,
  ADD COLUMN IF NOT EXISTS release_date DATE,
  ADD COLUMN IF NOT EXISTS motor_number TEXT,
  ADD COLUMN IF NOT EXISTS mileage NUMERIC;

-- Before setting the column to NOT NULL, we must handle any existing vehicles
-- that might have a NULL license plate. We'll assign the VIN as a placeholder.
UPDATE public.vehicles
SET license_plate = vin
WHERE license_plate IS NULL;

-- Now, it's safe to enforce that the license_plate column cannot be null.
ALTER TABLE public.vehicles
  ALTER COLUMN license_plate SET NOT NULL;

-- Add a unique constraint to the license_plate column, but only if it doesn't already exist.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'vehicles_license_plate_key' AND conrelid = 'public.vehicles'::regclass
  ) THEN
    ALTER TABLE public.vehicles
      ADD CONSTRAINT vehicles_license_plate_key UNIQUE (license_plate);
  END IF;
END;
$$;