-- =====================================================
-- AUTOMATION SYSTEM TABLES
-- =====================================================
-- This migration creates the foundation for automated
-- work order management including auto-assignment,
-- SLA escalation, and workflow automation.
-- =====================================================

-- =====================================================
-- 1. AUTOMATION RULES TABLE
-- =====================================================
-- Stores configurable rules for auto-assignment and escalation
CREATE TABLE IF NOT EXISTS automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('auto_assignment', 'sla_escalation', 'notification', 'route_optimization', 'workload_balancing')),
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0, -- Higher priority rules execute first
  
  -- Trigger conditions (JSON)
  trigger_conditions JSONB NOT NULL DEFAULT '{}',
  -- Example: { "status": ["Ready"], "priority": ["High", "Critical"], "service_category_ids": [...] }
  
  -- Assignment criteria (JSON) - for auto_assignment rules
  assignment_criteria JSONB DEFAULT '{}',
  -- Example: { 
  --   "match_specialization": true,
  --   "max_distance_km": 50,
  --   "consider_workload": true,
  --   "max_concurrent_orders": 5,
  --   "prefer_same_location": true
  -- }
  
  -- Escalation settings (JSON) - for sla_escalation rules
  escalation_settings JSONB DEFAULT '{}',
  -- Example: {
  --   "at_risk_threshold_percent": 75,
  --   "notify_roles": ["supervisor", "manager"],
  --   "auto_reassign": false,
  --   "escalate_to_role": "manager"
  -- }
  
  -- Actions to perform (JSON array)
  actions JSONB NOT NULL DEFAULT '[]',
  -- Example: [
  --   { "type": "assign_technician", "parameters": {...} },
  --   { "type": "send_notification", "parameters": {...} },
  --   { "type": "update_priority", "parameters": {...} }
  -- ]
  
  -- Execution schedule (for scheduled rules)
  schedule_cron TEXT, -- e.g., "*/15 * * * *" for every 15 minutes
  last_executed_at TIMESTAMPTZ,
  execution_count INTEGER DEFAULT 0,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for active rules lookup
CREATE INDEX idx_automation_rules_active ON automation_rules(is_active, rule_type, priority DESC);
CREATE INDEX idx_automation_rules_schedule ON automation_rules(schedule_cron) WHERE schedule_cron IS NOT NULL;

-- =====================================================
-- 2. AUTOMATION LOGS TABLE
-- =====================================================
-- Audit trail of all automated actions
CREATE TABLE IF NOT EXISTS automation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID REFERENCES automation_rules(id) ON DELETE SET NULL,
  rule_name TEXT NOT NULL,
  rule_type TEXT NOT NULL,
  
  -- What was automated
  work_order_id UUID REFERENCES work_orders(id) ON DELETE CASCADE,
  technician_id UUID REFERENCES technicians(id) ON DELETE SET NULL,
  
  -- Execution details
  action_type TEXT NOT NULL, -- 'assigned', 'escalated', 'notified', 'updated', etc.
  action_details JSONB DEFAULT '{}',
  
  -- Result
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'partial')),
  error_message TEXT,
  execution_time_ms INTEGER,
  
  -- Context
  trigger_context JSONB DEFAULT '{}', -- What triggered this automation
  decision_factors JSONB DEFAULT '{}', -- Why this decision was made (for transparency)
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for log queries
CREATE INDEX idx_automation_logs_work_order ON automation_logs(work_order_id, created_at DESC);
CREATE INDEX idx_automation_logs_rule ON automation_logs(rule_id, created_at DESC);
CREATE INDEX idx_automation_logs_created_at ON automation_logs(created_at DESC);
CREATE INDEX idx_automation_logs_status ON automation_logs(status);

-- =====================================================
-- 3. AUTOMATION SETTINGS TABLE
-- =====================================================
-- Global automation configuration
CREATE TABLE IF NOT EXISTS automation_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO automation_settings (setting_key, setting_value, description) VALUES
  ('auto_assignment_enabled', 'true', 'Master switch for auto-assignment feature'),
  ('sla_monitoring_enabled', 'true', 'Master switch for SLA monitoring and escalation'),
  ('notification_enabled', 'true', 'Master switch for automated notifications'),
  ('route_optimization_enabled', 'false', 'Master switch for automatic route optimization'),
  ('business_hours', '{"start": "08:00", "end": "18:00", "timezone": "UTC"}', 'Business hours for automation'),
  ('max_auto_assignments_per_run', '50', 'Maximum work orders to auto-assign in single execution'),
  ('assignment_retry_delay_minutes', '15', 'Wait time before retrying failed auto-assignment')
ON CONFLICT (setting_key) DO NOTHING;

-- =====================================================
-- 4. TECHNICIAN AVAILABILITY CACHE TABLE
-- =====================================================
-- Cached availability data for faster assignment decisions
CREATE TABLE IF NOT EXISTS technician_availability_cache (
  technician_id UUID PRIMARY KEY REFERENCES technicians(id) ON DELETE CASCADE,
  
  -- Current status
  is_available BOOLEAN DEFAULT true,
  current_location_lat DECIMAL(10, 8),
  current_location_lng DECIMAL(11, 8),
  
  -- Workload metrics
  active_work_orders_count INTEGER DEFAULT 0,
  max_concurrent_orders INTEGER DEFAULT 5,
  current_week_hours DECIMAL(5, 2) DEFAULT 0,
  
  -- Shift information
  on_shift BOOLEAN DEFAULT false,
  current_shift_id UUID REFERENCES shifts(id) ON DELETE SET NULL,
  shift_start_time TIMESTAMPTZ,
  shift_end_time TIMESTAMPTZ,
  
  -- Performance metrics
  completion_rate DECIMAL(5, 2) DEFAULT 100.0, -- Percentage
  average_response_time_minutes INTEGER,
  
  -- Specializations (denormalized for faster queries)
  specializations TEXT[] DEFAULT '{}',
  
  -- Last updated
  last_updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT check_completion_rate CHECK (completion_rate >= 0 AND completion_rate <= 100)
);

-- Index for availability queries
CREATE INDEX idx_tech_availability_available ON technician_availability_cache(is_available, on_shift);
CREATE INDEX idx_tech_availability_location_lat ON technician_availability_cache(current_location_lat) WHERE current_location_lat IS NOT NULL;
CREATE INDEX idx_tech_availability_location_lng ON technician_availability_cache(current_location_lng) WHERE current_location_lng IS NOT NULL;
CREATE INDEX idx_tech_availability_workload ON technician_availability_cache(active_work_orders_count, max_concurrent_orders);

-- =====================================================
-- 5. ASSIGNMENT QUEUE TABLE
-- =====================================================
-- Queue for work orders pending auto-assignment
CREATE TABLE IF NOT EXISTS assignment_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id UUID UNIQUE NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  
  -- Queue metadata
  priority INTEGER DEFAULT 0, -- Higher = more urgent
  added_at TIMESTAMPTZ DEFAULT NOW(),
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  next_retry_at TIMESTAMPTZ,
  
  -- Assignment constraints
  required_specializations TEXT[] DEFAULT '{}',
  preferred_location_id UUID REFERENCES locations(id),
  max_distance_km DECIMAL(6, 2),
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'assigned', 'failed', 'expired')),
  assigned_at TIMESTAMPTZ,
  failed_reason TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'
);

-- Indexes for queue processing
CREATE INDEX idx_assignment_queue_status ON assignment_queue(status, priority DESC, added_at);
CREATE INDEX idx_assignment_queue_retry ON assignment_queue(next_retry_at) WHERE status = 'pending' AND next_retry_at IS NOT NULL;

-- =====================================================
-- 6. FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update automation_rules updated_at
CREATE OR REPLACE FUNCTION update_automation_rules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_automation_rules_updated_at
  BEFORE UPDATE ON automation_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_automation_rules_updated_at();

-- Function to add work orders to assignment queue on status change
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
      -- Add to queue if not already there
      INSERT INTO assignment_queue (
        work_order_id,
        priority,
        required_specializations,
        preferred_location_id
      )
      VALUES (
        NEW.id,
        CASE 
          WHEN NEW.priority = 'High' THEN 100
          WHEN NEW.priority = 'Medium' THEN 50
          ELSE 0
        END,
        COALESCE((SELECT specializations FROM service_categories WHERE id = NEW.service_category_id), '{}'),
        NEW.location_id
      )
      ON CONFLICT (work_order_id) DO NOTHING;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_queue_work_order_for_assignment
  AFTER INSERT OR UPDATE OF status ON work_orders
  FOR EACH ROW
  EXECUTE FUNCTION queue_work_order_for_assignment();

-- Function to update technician availability cache
CREATE OR REPLACE FUNCTION update_technician_availability_cache()
RETURNS TRIGGER AS $$
BEGIN
  -- Update cache when technician is assigned or unassigned
  IF TG_OP = 'UPDATE' AND (OLD.assigned_technician_id IS DISTINCT FROM NEW.assigned_technician_id) THEN
    -- Increment count for newly assigned technician
    IF NEW.assigned_technician_id IS NOT NULL THEN
      INSERT INTO technician_availability_cache (technician_id, active_work_orders_count)
      VALUES (NEW.assigned_technician_id, 1)
      ON CONFLICT (technician_id) DO UPDATE
      SET 
        active_work_orders_count = technician_availability_cache.active_work_orders_count + 1,
        last_updated_at = NOW();
    END IF;
    
    -- Decrement count for previously assigned technician
    IF OLD.assigned_technician_id IS NOT NULL THEN
      UPDATE technician_availability_cache
      SET 
        active_work_orders_count = GREATEST(0, active_work_orders_count - 1),
        last_updated_at = NOW()
      WHERE technician_id = OLD.assigned_technician_id;
    END IF;
  END IF;
  
  -- Update when work order is completed
  IF TG_OP = 'UPDATE' AND NEW.status = 'Completed' AND OLD.status != 'Completed' THEN
    IF NEW.assigned_technician_id IS NOT NULL THEN
      UPDATE technician_availability_cache
      SET 
        active_work_orders_count = GREATEST(0, active_work_orders_count - 1),
        last_updated_at = NOW()
      WHERE technician_id = NEW.assigned_technician_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_technician_availability_cache
  AFTER INSERT OR UPDATE ON work_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_technician_availability_cache();

-- =====================================================
-- 7. ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE technician_availability_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_queue ENABLE ROW LEVEL SECURITY;

-- Policies for automation_rules (admins and managers can manage)
CREATE POLICY "Authenticated users can view automation rules"
  ON automation_rules FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage automation rules"
  ON automation_rules FOR ALL
  TO authenticated
  USING (true);

-- Policies for automation_logs (read-only for authenticated users)
CREATE POLICY "Authenticated users can view automation logs"
  ON automation_logs FOR SELECT
  TO authenticated
  USING (true);

-- Policies for automation_settings (admins only)
CREATE POLICY "Authenticated users can view automation settings"
  ON automation_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage automation settings"
  ON automation_settings FOR ALL
  TO authenticated
  USING (true);

-- Policies for technician_availability_cache (read for authenticated)
CREATE POLICY "Authenticated users can view technician availability"
  ON technician_availability_cache FOR SELECT
  TO authenticated
  USING (true);

-- Policies for assignment_queue (read for authenticated)
CREATE POLICY "Authenticated users can view assignment queue"
  ON assignment_queue FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- 8. INITIAL DATA SEED
-- =====================================================

-- Create default auto-assignment rule
INSERT INTO automation_rules (
  name,
  description,
  rule_type,
  is_active,
  priority,
  trigger_conditions,
  assignment_criteria,
  actions
) VALUES (
  'Default Auto-Assignment',
  'Automatically assign work orders to best-match technician when status changes to Ready',
  'auto_assignment',
  true,
  100,
  '{"status": ["Ready"], "has_technician": false}',
  '{
    "match_specialization": true,
    "max_distance_km": 50,
    "consider_workload": true,
    "max_concurrent_orders": 5,
    "prefer_same_location": true,
    "priority_weight": 0.3,
    "distance_weight": 0.4,
    "workload_weight": 0.3
  }',
  '[
    {"type": "assign_technician", "parameters": {"update_status": true}},
    {"type": "send_notification", "parameters": {"channels": ["push", "whatsapp"]}}
  ]'
);

-- Create default SLA escalation rule
INSERT INTO automation_rules (
  name,
  description,
  rule_type,
  is_active,
  priority,
  trigger_conditions,
  escalation_settings,
  actions,
  schedule_cron
) VALUES (
  'SLA At-Risk Escalation',
  'Escalate work orders that are at risk of missing SLA (75% time consumed)',
  'sla_escalation',
  true,
  90,
  '{"sla_status": ["at-risk"], "status": ["In Progress", "Ready"]}',
  '{
    "at_risk_threshold_percent": 75,
    "notify_roles": ["supervisor", "manager"],
    "auto_reassign": false,
    "escalate_to_role": "supervisor"
  }',
  '[
    {"type": "send_notification", "parameters": {"channels": ["email", "push"], "recipients": ["assigned_technician", "supervisor"]}},
    {"type": "add_activity_log", "parameters": {"message": "SLA at risk - escalated to supervisor"}}
  ]',
  '*/15 * * * *'
);

-- Create overdue escalation rule
INSERT INTO automation_rules (
  name,
  description,
  rule_type,
  is_active,
  priority,
  trigger_conditions,
  escalation_settings,
  actions,
  schedule_cron
) VALUES (
  'SLA Overdue Escalation',
  'Escalate overdue work orders to manager and optionally reassign',
  'sla_escalation',
  true,
  95,
  '{"sla_status": ["overdue"], "status": ["In Progress", "Ready", "On Hold"]}',
  '{
    "notify_roles": ["manager", "operations_manager"],
    "auto_reassign": false,
    "escalate_to_role": "manager",
    "create_emergency_assignment": false
  }',
  '[
    {"type": "send_notification", "parameters": {"channels": ["email", "push", "sms"], "recipients": ["assigned_technician", "manager"]}},
    {"type": "add_activity_log", "parameters": {"message": "SLA overdue - escalated to manager"}},
    {"type": "update_priority", "parameters": {"new_priority": "High"}}
  ]',
  '*/15 * * * *'
);

COMMENT ON TABLE automation_rules IS 'Configurable rules for automated work order management';
COMMENT ON TABLE automation_logs IS 'Audit trail of all automated actions performed by the system';
COMMENT ON TABLE automation_settings IS 'Global configuration settings for automation features';
COMMENT ON TABLE technician_availability_cache IS 'Cached technician availability data for fast assignment decisions';
COMMENT ON TABLE assignment_queue IS 'Queue of work orders pending auto-assignment';
