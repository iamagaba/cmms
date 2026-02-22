-- ============================================
-- Migration: Add Search Performance Indexes
-- Description: Optimize work order search performance for scalability
-- Created: 2026-02-06
-- ============================================

-- Add indexes for work_orders table to optimize search queries
-- These indexes dramatically improve search performance as data grows

-- Index for work order number search (most common search)
CREATE INDEX IF NOT EXISTS idx_work_orders_number_search 
ON work_orders USING btree (workOrderNumber text_pattern_ops);

-- Index for description search
CREATE INDEX IF NOT EXISTS idx_work_orders_description_search 
ON work_orders USING gin (to_tsvector('english', description));

-- Index for initial diagnosis search
CREATE INDEX IF NOT EXISTS idx_work_orders_diagnosis_search 
ON work_orders USING gin (to_tsvector('english', initialDiagnosis));

-- Index for service search
CREATE INDEX IF NOT EXISTS idx_work_orders_service_search 
ON work_orders USING btree (service text_pattern_ops);

-- Composite index for common filter combinations
CREATE INDEX IF NOT EXISTS idx_work_orders_status_priority 
ON work_orders (status, priority, created_at DESC);

-- Index for technician filtering
CREATE INDEX IF NOT EXISTS idx_work_orders_technician 
ON work_orders (assignedTechnicianId, created_at DESC);

-- Index for location filtering
CREATE INDEX IF NOT EXISTS idx_work_orders_location 
ON work_orders (locationId, created_at DESC);

-- Index for vehicle relationship (critical for license plate search)
CREATE INDEX IF NOT EXISTS idx_work_orders_vehicle 
ON work_orders (vehicleId, created_at DESC);

-- Index for customer relationship
CREATE INDEX IF NOT EXISTS idx_work_orders_customer 
ON work_orders (customerId, created_at DESC);

-- ============================================
-- Indexes for vehicles table (license plate search)
-- ============================================

-- Index for license plate search (case-insensitive)
CREATE INDEX IF NOT EXISTS idx_vehicles_license_plate_search 
ON vehicles USING btree (LOWER(license_plate) text_pattern_ops);

-- Index for make/model search
CREATE INDEX IF NOT EXISTS idx_vehicles_make_search 
ON vehicles USING btree (LOWER(make) text_pattern_ops);

CREATE INDEX IF NOT EXISTS idx_vehicles_model_search 
ON vehicles USING btree (LOWER(model) text_pattern_ops);

-- Index for VIN search
CREATE INDEX IF NOT EXISTS idx_vehicles_vin_search 
ON vehicles USING btree (LOWER(vin) text_pattern_ops);

-- ============================================
-- Indexes for customers table
-- ============================================

-- Index for customer name search
CREATE INDEX IF NOT EXISTS idx_customers_name_search 
ON customers USING btree (LOWER(name) text_pattern_ops);

-- ============================================
-- Indexes for profiles table (technician search)
-- ============================================

-- Index for technician name search
CREATE INDEX IF NOT EXISTS idx_profiles_full_name_search 
ON profiles USING btree (LOWER(full_name) text_pattern_ops);

-- ============================================
-- Indexes for locations table
-- ============================================

-- Index for location name search
CREATE INDEX IF NOT EXISTS idx_locations_name_search 
ON locations USING btree (LOWER(name) text_pattern_ops);

-- ============================================
-- Performance Notes:
-- ============================================
-- 
-- 1. text_pattern_ops: Optimizes LIKE/ILIKE queries with wildcards
-- 2. GIN indexes: Enable full-text search on description fields
-- 3. Composite indexes: Speed up multi-column filters
-- 4. LOWER() indexes: Enable case-insensitive search without performance penalty
--
-- Expected Performance:
-- - Without indexes: O(n) - scans all rows (slow with 10k+ records)
-- - With indexes: O(log n) - uses B-tree lookup (fast even with 1M+ records)
--
-- Example: Searching 100,000 work orders
-- - Before: ~2-5 seconds (full table scan)
-- - After: ~10-50ms (index lookup)
-- ============================================

-- Add comments for documentation
COMMENT ON INDEX idx_work_orders_number_search IS 'Optimizes work order number search queries';
COMMENT ON INDEX idx_vehicles_license_plate_search IS 'Optimizes license plate search - critical for scalability';
COMMENT ON INDEX idx_work_orders_status_priority IS 'Optimizes filtered list views with status and priority';
