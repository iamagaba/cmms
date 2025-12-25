-- Check the actual structure of the vehicles table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'vehicles' 
ORDER BY ordinal_position;

-- Also check if there are any vehicles records
SELECT COUNT(*) as total_vehicles FROM vehicles LIMIT 1;

-- Check a sample vehicle record to see actual columns
SELECT * FROM vehicles LIMIT 1;