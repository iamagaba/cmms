/**
 * Automation System Types
 * Types for auto-assignment, SLA escalation, and workflow automation
 */

export type RuleType =
  | 'auto_assignment'
  | 'sla_escalation'
  | 'notification'
  | 'route_optimization'
  | 'workload_balancing';

export type ActionType =
  | 'assign_technician'
  | 'send_notification'
  | 'update_priority'
  | 'update_status'
  | 'add_activity_log'
  | 'create_task'
  | 'escalate'
  | 'reassign';

export type LogStatus = 'success' | 'failed' | 'partial';
export type QueueStatus = 'pending' | 'processing' | 'assigned' | 'failed' | 'expired';

// =====================================================
// AUTOMATION RULES
// =====================================================

export interface AutomationRule {
  id: string;
  name: string;
  description?: string;
  rule_type: RuleType;
  is_active: boolean;
  priority: number;

  trigger_conditions: TriggerConditions;
  assignment_criteria?: AssignmentCriteria;
  escalation_settings?: EscalationSettings;
  actions: AutomationAction[];

  schedule_cron?: string;
  last_executed_at?: string;
  execution_count: number;

  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface TriggerConditions {
  trigger?: string;
  triggerValue?: string;
  assetPropertyType?: string;
  conditionLogic?: 'all' | 'any';
  conditions?: Array<{
    type: string;
    value: string;
    propertyType?: string;
  }>;
  // Legacy fields for backward compatibility
  status?: string[];
  priority?: string[];
  service_category_ids?: string[];
  has_technician?: boolean;
  sla_status?: ('on-track' | 'at-risk' | 'overdue')[];
  location_ids?: string[];
  custom_conditions?: Record<string, any>;
}

export interface AssignmentCriteria {
  match_specialization: boolean;
  max_distance_km?: number;
  consider_workload: boolean;
  max_concurrent_orders?: number;
  prefer_same_location: boolean;

  // Weighting factors (should sum to 1.0)
  priority_weight?: number;
  distance_weight?: number;
  workload_weight?: number;
  performance_weight?: number;

  // Additional constraints
  require_on_shift?: boolean;
  exclude_technician_ids?: string[];
  preferred_technician_ids?: string[];
}

export interface EscalationSettings {
  at_risk_threshold_percent: number;
  notify_roles: string[];
  auto_reassign: boolean;
  escalate_to_role?: string;
  create_emergency_assignment?: boolean;
  max_escalations?: number;
}

export interface AutomationAction {
  type: ActionType;
  parameters: Record<string, any>;
  execute_on?: 'immediate' | 'step_start' | 'step_complete' | 'step_timeout';
}

// =====================================================
// AUTOMATION LOGS
// =====================================================

export interface AutomationLog {
  id: string;
  rule_id?: string;
  rule_name: string;
  rule_type: RuleType;

  work_order_id?: string;
  technician_id?: string;

  action_type: string;
  action_details: Record<string, any>;

  status: LogStatus;
  error_message?: string;
  execution_time_ms?: number;

  trigger_context: Record<string, any>;
  decision_factors: DecisionFactors;

  created_at: string;
}

export interface DecisionFactors {
  // For auto-assignment
  matched_specialization?: boolean;
  distance_km?: number;
  current_workload?: number;
  availability_score?: number;
  final_score?: number;

  // For escalation
  sla_consumed_percent?: number;
  time_overdue_hours?: number;
  escalation_level?: number;

  // General
  reason?: string;
  alternatives_considered?: number;
  [key: string]: any;
}

// =====================================================
// AUTOMATION SETTINGS
// =====================================================

export interface AutomationSettings {
  id: string;
  setting_key: string;
  setting_value: any;
  description?: string;
  updated_by?: string;
  updated_at: string;
}

export type AutomationSettingKey =
  | 'auto_assignment_enabled'
  | 'sla_monitoring_enabled'
  | 'notification_enabled'
  | 'route_optimization_enabled'
  | 'business_hours'
  | 'max_auto_assignments_per_run'
  | 'assignment_retry_delay_minutes';

// =====================================================
// TECHNICIAN AVAILABILITY
// =====================================================

export interface TechnicianAvailability {
  technician_id: string;

  is_available: boolean;
  current_location_lat?: number;
  current_location_lng?: number;

  active_work_orders_count: number;
  max_concurrent_orders: number;
  current_week_hours: number;

  on_shift: boolean;
  current_shift_id?: string;
  shift_start_time?: string;
  shift_end_time?: string;

  completion_rate: number;
  average_response_time_minutes?: number;

  specializations: string[];

  last_updated_at: string;
}

// =====================================================
// ASSIGNMENT QUEUE
// =====================================================

export interface AssignmentQueueItem {
  id: string;
  work_order_id: string;

  priority: number;
  added_at: string;
  retry_count: number;
  max_retries: number;
  next_retry_at?: string;

  required_specializations: string[];
  preferred_location_id?: string;
  max_distance_km?: number;

  status: QueueStatus;
  assigned_at?: string;
  failed_reason?: string;

  metadata: Record<string, any>;
}

// =====================================================
// ASSIGNMENT ALGORITHM TYPES
// =====================================================

export interface AssignmentCandidate {
  technician_id: string;
  technician_name: string;

  // Scoring factors
  specialization_match: boolean;
  distance_km: number;
  current_workload: number;
  availability_score: number;
  performance_score: number;

  // Final score (0-100)
  total_score: number;

  // Additional context
  on_shift: boolean;
  has_capacity: boolean;
  same_location: boolean;
}

export interface AssignmentResult {
  success: boolean;
  work_order_id: string;
  assigned_technician_id?: string;
  assigned_technician_name?: string;

  decision_factors: DecisionFactors;
  candidates_evaluated: number;
  execution_time_ms: number;

  error?: string;
  fallback_reason?: string;
}

// =====================================================
// SLA MONITORING TYPES
// =====================================================

export interface SLAMonitoringResult {
  work_order_id: string;
  work_order_number: string;

  sla_status: 'on-track' | 'at-risk' | 'overdue' | 'no-sla';
  sla_consumed_percent: number;
  time_remaining_hours?: number;
  time_overdue_hours?: number;

  escalation_triggered: boolean;
  escalation_level: number;
  actions_taken: string[];

  notified_users: string[];
}

// =====================================================
// DASHBOARD & ANALYTICS TYPES
// =====================================================

export interface AutomationMetrics {
  period: 'today' | 'week' | 'month';

  total_assignments: number;
  successful_assignments: number;
  failed_assignments: number;
  success_rate: number;

  total_escalations: number;
  at_risk_count: number;
  overdue_count: number;

  average_assignment_time_ms: number;
  average_candidates_evaluated: number;

  top_failure_reasons: Array<{
    reason: string;
    count: number;
  }>;

  technician_utilization: Array<{
    technician_id: string;
    technician_name: string;
    auto_assigned_count: number;
    manual_assigned_count: number;
    current_workload: number;
  }>;
}

export interface AutomationDashboardData {
  metrics: AutomationMetrics;
  active_rules: AutomationRule[];
  recent_logs: AutomationLog[];
  queue_status: {
    pending: number;
    processing: number;
    failed: number;
  };
  settings: Record<AutomationSettingKey, any>;
}

// =====================================================
// API REQUEST/RESPONSE TYPES
// =====================================================

export interface CreateAutomationRuleRequest {
  name: string;
  description?: string;
  rule_type: RuleType;
  is_active?: boolean;
  priority?: number;
  trigger_conditions: TriggerConditions;
  assignment_criteria?: AssignmentCriteria;
  escalation_settings?: EscalationSettings;
  actions: AutomationAction[];
  schedule_cron?: string;
}

export interface UpdateAutomationRuleRequest extends Partial<CreateAutomationRuleRequest> {
  id: string;
}

export interface ExecuteAutomationRequest {
  rule_id?: string;
  work_order_ids?: string[];
  force?: boolean;
}

export interface UpdateAutomationSettingRequest {
  setting_key: AutomationSettingKey;
  setting_value: any;
}

export interface GetAutomationLogsRequest {
  rule_id?: string;
  work_order_id?: string;
  status?: LogStatus;
  start_date?: string;
  end_date?: string;
  limit?: number;
}

// =====================================================
// UTILITY TYPES
// =====================================================

export interface AutomationHealth {
  overall_status: 'healthy' | 'degraded' | 'critical';
  issues: Array<{
    severity: 'warning' | 'error' | 'critical';
    message: string;
    affected_component: string;
  }>;
  last_check: string;
}
