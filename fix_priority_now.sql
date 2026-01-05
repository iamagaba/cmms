-- Quick fix for priority capitalization
-- Valid priority values: Low, Medium, High, Urgent

UPDATE work_orders
SET priority = CASE priority
  WHEN 'urgent' THEN 'Urgent'
  WHEN 'high' THEN 'High'
  WHEN 'medium' THEN 'Medium'
  WHEN 'low' THEN 'Low'
  ELSE priority
END
WHERE priority IN ('urgent', 'high', 'medium', 'low');

-- Show results
SELECT priority, COUNT(*) as count
FROM work_orders
GROUP BY priority
ORDER BY priority;
