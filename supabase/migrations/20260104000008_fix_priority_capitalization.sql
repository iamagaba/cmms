-- Fix priority capitalization in work_orders table
-- Convert all lowercase priority values to proper capitalization
-- Valid priority values: Low, Medium, High, Urgent

UPDATE work_orders
SET priority = CASE priority
  WHEN 'urgent' THEN 'Urgent'
  WHEN 'high' THEN 'High'
  WHEN 'medium' THEN 'Medium'
  WHEN 'low' THEN 'Low'
  ELSE priority  -- Keep as-is if already capitalized
END
WHERE priority IN ('urgent', 'high', 'medium', 'low');

-- Add a comment to document the valid priority values
COMMENT ON COLUMN work_orders.priority IS 'Valid values: Low, Medium, High, Urgent (proper case)';
