-- Emergency Bike Debug Script
-- Run this directly in your Supabase SQL editor to fix the emergency bike issue

-- Check current vehicles and their flags
SELECT 
  id,
  license_plate,
  make,
  model,
  is_company_asset,
  is_emergency_bike,
  customer_id
FROM vehicles
ORDER BY license_plate;

-- Check if emergency_bike_assignments table exists and has data
SELECT COUNT(*) as assignments_count FROM emergency_bike_assignments;

-- Check if available_emergency_bikes_v view exists
SELECT COUNT(*) as available_bikes FROM available_emergency_bikes_v;

-- Fix 1: Create some test emergency bikes if none exist
-- Update existing company vehicles to be emergency bikes
UPDATE vehicles 
SET is_emergency_bike = true 
WHERE is_company_asset = true 
  AND is_emergency_bike != true
LIMIT 3;

-- Fix 2: If no company vehicles exist, create test data
INSERT INTO vehicles (
  vin, make, model, year, license_plate, 
  is_company_asset, is_emergency_bike, customer_id
) 
SELECT 
  'EMERGENCY' || generate_random_uuid()::text,
  'Yamaha',
  'Emergency ' || generate_series,
  2023,
  'EMG-' || LPAD(generate_series::text, 3, '0'),
  true,
  true,
  null
FROM generate_series(1, 3)
WHERE NOT EXISTS (
  SELECT 1 FROM vehicles 
  WHERE is_company_asset = true AND is_emergency_bike = true
);

-- Fix 3: Verify the available bikes view works
SELECT 
  id,
  license_plate,
  make,
  model,
  'Available via view' as status
FROM available_emergency_bikes_v
UNION ALL
SELECT 
  v.id,
  v.license_plate,
  v.make,
  v.model,
  CASE 
    WHEN eba.id IS NOT NULL THEN 'Currently assigned'
    ELSE 'Available direct query'
  END as status
FROM vehicles v
LEFT JOIN emergency_bike_assignments eba ON eba.emergency_bike_asset_id = v.id AND eba.returned_at IS NULL
WHERE v.is_company_asset = true AND v.is_emergency_bike = true;

-- Fix 4: Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('vehicles', 'emergency_bike_assignments', 'available_emergency_bikes_v');