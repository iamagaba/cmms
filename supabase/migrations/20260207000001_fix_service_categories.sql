-- Migration: Fix Service Categories and Assignment Queue Trigger
-- Purpose: Creates the missing service_categories table and updates the 
--          queue_work_order_for_assignment() trigger function to handle
--          missing service categories gracefully.
-- 
-- This migration addresses a critical error where the trigger function
-- attempts to query a non-existent service_categories table, causing
-- confirmation calls to fail when work orders transition to 'Ready' status.
--
-- Requirements: 1.1, 2.1
-- Spec: confirmation-call-specializations-fix

-- ============================================================================
-- 1. Create service_categories table
-- ============================================================================
-- Purpose: Store service category definitions with required specializations
--          for work orders. This table enables the auto-assignment system to
--          match work orders with technicians who have the required skills.
--
-- Columns:
--   - id: Unique identifier (UUID) for each service category
--   - name: Category name (e.g., "Electrical", "HVAC") - must be unique
--   - description: Optional human-readable description of the category
--   - specializations: Array of required skills/certifications (e.g., ["Licensed Electrician"])
--                      Defaults to empty array for categories with no special requirements
--   - created_at: Timestamp when the category was created
--   - updated_at: Timestamp when the category was last modified (auto-updated by trigger)
--
-- Constraints:
--   - name must be unique to prevent duplicate categories
--   - specializations defaults to '{}' (empty array) if not specified
--
-- Requirements: 2.1, 2.2, 2.3, 2.4

CREATE TABLE IF NOT EXISTS service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  specializations TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. Create indexes for performance
-- ============================================================================
-- Purpose: Improve query performance for common lookup patterns
--
-- Indexes:
--   - idx_service_categories_name: Unique index on name column
--     Used for: Fast lookups by category name, enforces uniqueness
--   - idx_service_categories_created_at: Index on created_at column
--     Used for: Sorting categories by creation date, filtering by date ranges
--
-- Note: Uses IF NOT EXISTS for idempotency (safe to run multiple times)
--
-- Requirements: 2.5

CREATE INDEX IF NOT EXISTS idx_service_categories_name 
  ON service_categories(name);

CREATE INDEX IF NOT EXISTS idx_service_categories_created_at 
  ON service_categories(created_at);

-- ============================================================================
-- 3. Enable Row Level Security
-- ============================================================================
-- Purpose: Enable RLS to control access to service_categories table
--          Ensures only authenticated users can access category data
--
-- Requirements: 5.1

ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 4. Create RLS policies for authenticated users
-- ============================================================================
-- Purpose: Define access control rules for service_categories table
--          All authenticated users can perform CRUD operations on categories
--
-- Policies:
--   - SELECT: Allows authenticated users to view all service categories
--   - INSERT: Allows authenticated users to create new service categories
--   - UPDATE: Allows authenticated users to modify existing service categories
--   - DELETE: Allows authenticated users to remove service categories
--
-- Note: Uses IF NOT EXISTS for idempotency
--
-- Requirements: 5.2, 5.3, 5.4

-- Allow authenticated users to view all service categories
DROP POLICY IF EXISTS "Allow authenticated users to view service categories" ON service_categories;
CREATE POLICY "Allow authenticated users to view service categories"
  ON service_categories
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert service categories
DROP POLICY IF EXISTS "Allow authenticated users to insert service categories" ON service_categories;
CREATE POLICY "Allow authenticated users to insert service categories"
  ON service_categories
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update service categories
DROP POLICY IF EXISTS "Allow authenticated users to update service categories" ON service_categories;
CREATE POLICY "Allow authenticated users to update service categories"
  ON service_categories
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete service categories
DROP POLICY IF EXISTS "Allow authenticated users to delete service categories" ON service_categories;
CREATE POLICY "Allow authenticated users to delete service categories"
  ON service_categories
  FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================================
-- 5. Update trigger function to handle missing service categories gracefully
-- ============================================================================
-- Purpose: Fix the critical error where the trigger function attempts to query
--          a non-existent service_categories table. This update ensures the
--          confirmation call process completes successfully even when service
--          categories are missing or invalid.
--
-- Key Changes:
--   1. Added COALESCE wrapper around service_categories lookup
--      - Returns empty array '{}' if service_category_id is NULL
--      - Returns empty array '{}' if service_category_id doesn't exist in table
--      - Prevents database errors from breaking the confirmation call flow
--
--   2. Preserved existing logic:
--      - Auto-assignment enabled check (queries settings table)
--      - Priority score calculation (Critical=100, High=75, Medium=50, Low=25)
--      - ON CONFLICT DO NOTHING (prevents duplicate queue entries)
--      - Returns NEW to allow the work order status change to proceed
--
-- Behavior:
--   - Work orders WITH valid service_category_id: Uses actual specializations
--   - Work orders WITHOUT service_category_id: Uses empty array (no special skills required)
--   - Work orders with INVALID service_category_id: Uses empty array (graceful degradation)
--
-- This ensures work orders can always be queued for assignment, even if
-- service category data is incomplete or missing.
--
-- Requirements: 1.1, 1.2, 4.1, 4.2, 4.3, 4.4

CREATE OR REPLACE FUNCTION queue_work_order_for_assignment()
RETURNS TRIGGER AS $$
BEGIN
  -- Only queue if auto-assignment is enabled
  IF EXISTS (
    SELECT 1 FROM automation_settings 
    WHERE setting_key = 'auto_assignment_enabled' 
    AND (setting_value)::boolean = true
  ) THEN
    -- Insert into assignment queue with graceful handling of missing service categories
    INSERT INTO assignment_queue (
      work_order_id,
      priority_score,
      required_specializations,
      preferred_location_id
    )
    VALUES (
      NEW.id,
      -- Calculate priority score (higher priority = higher score)
      CASE NEW.priority
        WHEN 'Critical' THEN 100
        WHEN 'High' THEN 75
        WHEN 'Medium' THEN 50
        WHEN 'Low' THEN 25
        ELSE 0
      END,
      -- Use COALESCE to handle NULL or missing service_category_id
      COALESCE(
        (SELECT specializations 
         FROM service_categories 
         WHERE id = NEW.service_category_id), 
        '{}'
      ),
      NEW.location_id
    )
    ON CONFLICT (work_order_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 6. Insert default service categories
-- ============================================================================
-- Purpose: Pre-populate the service_categories table with common maintenance
--          categories so the system is immediately usable after migration.
--
-- Default Categories:
--   1. General Maintenance - No special skills required (empty specializations)
--      Used for: Basic maintenance tasks that any technician can perform
--
--   2. Electrical - Requires "Licensed Electrician"
--      Used for: Electrical system work requiring licensed professionals
--
--   3. HVAC - Requires "HVAC Certified"
--      Used for: Heating, ventilation, and air conditioning work
--
--   4. Plumbing - Requires "Licensed Plumber"
--      Used for: Plumbing system work requiring licensed professionals
--
--   5. Mechanical - Requires "Mechanical Technician"
--      Used for: Mechanical system maintenance and repair
--
-- Note: Uses ON CONFLICT (name) DO NOTHING for idempotency
--       Safe to run multiple times without creating duplicates
--
-- Requirements: 6.1, 6.2, 6.3, 6.4

INSERT INTO service_categories (name, description, specializations)
VALUES
  (
    'General Maintenance',
    'General maintenance and repair work',
    '{}'
  ),
  (
    'Electrical',
    'Electrical system maintenance and repair',
    '{"Licensed Electrician"}'
  ),
  (
    'HVAC',
    'Heating, ventilation, and air conditioning',
    '{"HVAC Certified"}'
  ),
  (
    'Plumbing',
    'Plumbing system maintenance and repair',
    '{"Licensed Plumber"}'
  ),
  (
    'Mechanical',
    'Mechanical system maintenance and repair',
    '{"Mechanical Technician"}'
  )
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- 7. Create trigger to update updated_at timestamp
-- ============================================================================
-- Purpose: Automatically update the updated_at timestamp whenever a service
--          category record is modified. This provides audit trail functionality
--          and helps track when categories were last changed.
--
-- Components:
--   1. update_service_categories_updated_at() function
--      - Sets NEW.updated_at to current timestamp (NOW())
--      - Returns modified NEW record
--      - Executes before each UPDATE operation
--
--   2. trigger_update_service_categories_updated_at trigger
--      - Fires BEFORE UPDATE on service_categories table
--      - Executes for each row being updated
--      - Calls the update function to set timestamp
--
-- Note: Uses CREATE OR REPLACE and DROP IF EXISTS for idempotency
--
-- Requirements: 2.4

CREATE OR REPLACE FUNCTION update_service_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_service_categories_updated_at ON service_categories;
CREATE TRIGGER trigger_update_service_categories_updated_at
  BEFORE UPDATE ON service_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_service_categories_updated_at();
