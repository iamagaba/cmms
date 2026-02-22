-- Fix RLS Policy for technician_availability_cache table
-- This script resolves the "new row violates row-level security policy" error
-- when assigning technicians to work orders

-- First, check if RLS is enabled on the table
-- If you need to enable it:
-- ALTER TABLE technician_availability_cache ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (optional - only if you want to recreate them)
DROP POLICY IF EXISTS "Allow authenticated users to read availability" ON technician_availability_cache;
DROP POLICY IF EXISTS "Allow authenticated users to update availability" ON technician_availability_cache;
DROP POLICY IF EXISTS "Allow system to manage availability cache" ON technician_availability_cache;

-- Create comprehensive RLS policies for technician_availability_cache

-- 1. Allow authenticated users to read technician availability
CREATE POLICY "Allow authenticated users to read availability"
ON technician_availability_cache
FOR SELECT
TO authenticated
USING (true);

-- 2. Allow authenticated users to insert/update availability cache
-- This is needed when work orders are assigned/updated
CREATE POLICY "Allow authenticated users to update availability"
ON technician_availability_cache
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 3. Allow service role (backend/triggers) to manage the cache
CREATE POLICY "Allow service role to manage availability"
ON technician_availability_cache
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Verify the policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'technician_availability_cache'
ORDER BY policyname;

-- Test query to verify access (run this after creating policies)
-- SELECT * FROM technician_availability_cache LIMIT 5;
