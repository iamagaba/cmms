-- Migration: Fix Original Queue Function to Remove Service Categories
-- Purpose: Updates the original queue_work_order_for_assignment() function
--          from the automation_tables migration to remove the service_categories
--          dependency, ensuring consistency across all versions of the function.
--
-- This ensures the function works correctly regardless of which migration
-- created or last updated it.
--
-- Spec: confirmation-call-specializations-fix

-- ============================================================================
-- Update original trigger function to remove specializations dependency
-- ============================================================================

CREATE OR REPLACE FUNCTION queue_work_order_for_assignment()
RETURNS TRIGGER AS $$
BEGIN
  -- Only queue if status changed to 'Ready' and no technician assigned
  IF NEW.status = 'Ready' AND (NEW.assigned_technician_id IS NULL) THEN
    -- Check if auto-assignment is enabled
    IF EXISTS (
      SELECT 1 FROM automation_settings 
      WHERE setting_key = 'auto_assignment_enabled' 
      AND (setting_value)::boolean = true
    ) THEN
      -- Add to queue if not already there (without specializations)
      INSERT INTO assignment_queue (
        work_order_id,
        priority,
        preferred_location_id
      )
      VALUES (
        NEW.id,
        CASE 
          WHEN NEW.priority = 'Critical' THEN 100
          WHEN NEW.priority = 'High' THEN 75
          WHEN NEW.priority = 'Medium' THEN 50
          WHEN NEW.priority = 'Low' THEN 25
          ELSE 0
        END,
        NEW.location_id
      )
      ON CONFLICT (work_order_id) DO NOTHING;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
