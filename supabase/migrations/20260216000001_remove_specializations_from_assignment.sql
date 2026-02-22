-- Migration: Remove Specializations from Assignment Queue Trigger
-- Purpose: Updates the queue_work_order_for_assignment() trigger function to
--          remove the dependency on the service_categories table and the
--          required_specializations field. This unblocks the confirmation call
--          workflow by eliminating the "column 'specializations' does not exist" error.
-- 
-- This migration addresses a critical blocker where the trigger function
-- attempts to query a non-existent service_categories table, causing
-- confirmation calls to fail when work orders transition to 'Ready' status.
--
-- Requirements: 1.1
-- Spec: confirmation-call-specializations-fix

-- ============================================================================
-- Update trigger function to remove specializations dependency
-- ============================================================================
-- Purpose: Fix the critical error where the trigger function attempts to query
--          a non-existent service_categories table. This update removes the
--          specializations dependency entirely, allowing the confirmation call
--          process to complete successfully.
--
-- Key Changes:
--   1. Removed service_categories table lookup
--   2. Removed required_specializations from INSERT statement
--   3. Preserved existing logic:
--      - Auto-assignment enabled check (queries settings table)
--      - Priority score calculation (Critical=100, High=75, Medium=50, Low=25)
--      - ON CONFLICT DO NOTHING (prevents duplicate queue entries)
--      - Returns NEW to allow the work order status change to proceed
--
-- Behavior:
--   - Work orders are queued for assignment without checking specializations
--   - Auto-assignment system can add specialization matching in the future
--   - Confirmation calls complete successfully without database errors
--
-- Requirements: 1.1, 1.2, 3.1, 3.2, 3.3, 3.4

CREATE OR REPLACE FUNCTION queue_work_order_for_assignment()
RETURNS TRIGGER AS $$
BEGIN
  -- Only queue if auto-assignment is enabled
  IF EXISTS (
    SELECT 1 FROM automation_settings 
    WHERE setting_key = 'auto_assignment_enabled' 
    AND (setting_value)::boolean = true
  ) THEN
    -- Insert into assignment queue without specializations
    INSERT INTO assignment_queue (
      work_order_id,
      priority,
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
      NEW.location_id
    )
    ON CONFLICT (work_order_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Assignment Queue Schema Compatibility
-- ============================================================================
-- Note: The assignment_queue table already has a required_specializations column
--       with a default value of '{}' (empty array). This column is nullable and
--       does not require any schema changes. The trigger function above simply
--       omits this column from the INSERT statement, allowing it to use its
--       default value.
--
-- No schema changes needed - the existing table structure is compatible.
--
-- Requirements: 1.3, 1.4
