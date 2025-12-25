/**
 * Workflow Engine Types for Advanced Work Order Management
 */

export interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  version: string;
  is_active: boolean;
  trigger_conditions: TriggerCondition[];
  steps: WorkflowStep[];
  escalation_rules: EscalationRule[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface TriggerCondition {
  id: string;
  type: 'work_order_created' | 'status_change' | 'priority_change' | 'cost_threshold' | 'time_threshold' | 'custom';
  field?: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in' | 'not_in';
  value: any;
  logical_operator?: 'AND' | 'OR';
}

export interface WorkflowStep {
  id: string;
  workflow_id: string;
  step_number: number;
  name: string;
  description?: string;
  type: 'approval' | 'assignment' | 'notification' | 'automation' | 'review' | 'validation';
  required_role?: string[];
  required_users?: string[];
  auto_advance: boolean;
  timeout_hours?: number;
  timeout_action: 'escalate' | 'auto_approve' | 'auto_reject' | 'skip';
  parallel_execution: boolean;
  conditions?: StepCondition[];
  actions: StepAction[];
  created_at: string;
}

export interface StepCondition {
  field: string;
  operator: string;
  value: any;
  required: boolean;
}

export interface StepAction {
  id: string;
  type: 'send_notification' | 'update_field' | 'assign_technician' | 'create_task' | 'send_email' | 'webhook';
  parameters: Record<string, any>;
  execute_on: 'step_start' | 'step_complete' | 'step_timeout' | 'step_reject';
}

export interface EscalationRule {
  id: string;
  workflow_id: string;
  step_id?: string;
  trigger_after_hours: number;
  escalate_to_role?: string;
  escalate_to_users?: string[];
  escalation_action: 'notify' | 'reassign' | 'auto_approve' | 'skip_step';
  max_escalations: number;
  is_active: boolean;
}

export interface WorkflowInstance {
  id: string;
  workflow_id: string;
  work_order_id: string;
  current_step_id: string;
  status: 'active' | 'completed' | 'cancelled' | 'failed' | 'paused';
  started_at: string;
  completed_at?: string;
  started_by: string;
  context_data: Record<string, any>;
  step_history: WorkflowStepExecution[];
}

export interface WorkflowStepExecution {
  id: string;
  workflow_instance_id: string;
  step_id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected' | 'skipped' | 'timeout' | 'escalated';
  assigned_to?: string;
  started_at: string;
  completed_at?: string;
  completed_by?: string;
  decision?: 'approved' | 'rejected' | 'escalated';
  comments?: string;
  attachments?: string[];
  timeout_at?: string;
  escalation_count: number;
  execution_data: Record<string, any>;
}

export interface ApprovalRequest {
  id: string;
  workflow_instance_id: string;
  step_execution_id: string;
  work_order_id: string;
  requested_from: string;
  requested_by: string;
  request_type: 'approval' | 'review' | 'validation' | 'assignment';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  due_date?: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired' | 'cancelled';
  decision_made_at?: string;
  decision_comments?: string;
  attachments?: ApprovalAttachment[];
  metadata: Record<string, any>;
  created_at: string;
}

export interface ApprovalAttachment {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  file_url: string;
  uploaded_by: string;
  uploaded_at: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  industry: string;
  use_case: string;
  template_data: WorkflowDefinition;
  is_public: boolean;
  usage_count: number;
  rating: number;
  created_by: string;
  created_at: string;
}

export interface WorkflowMetrics {
  workflow_id: string;
  total_instances: number;
  completed_instances: number;
  failed_instances: number;
  average_completion_time: number; // hours
  average_steps_per_instance: number;
  approval_rate: number; // percentage
  escalation_rate: number; // percentage
  bottleneck_steps: string[]; // step IDs with longest processing times
  performance_trend: 'improving' | 'stable' | 'declining';
  last_updated: string;
}

export interface TimeTrackingEntry {
  id: string;
  work_order_id: string;
  technician_id: string;
  activity_type: 'work' | 'travel' | 'break' | 'waiting' | 'documentation';
  start_time: string;
  end_time?: string;
  duration_minutes?: number;
  description?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  is_billable: boolean;
  hourly_rate?: number;
  cost?: number;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface WorkOrderTimeline {
  work_order_id: string;
  events: TimelineEvent[];
  total_duration: number; // minutes
  billable_duration: number; // minutes
  cost_breakdown: CostBreakdown;
  efficiency_metrics: EfficiencyMetrics;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  event_type: 'created' | 'assigned' | 'started' | 'paused' | 'resumed' | 'completed' | 'approved' | 'rejected' | 'escalated' | 'commented';
  actor_id: string;
  actor_name: string;
  actor_role: string;
  description: string;
  metadata?: Record<string, any>;
  duration?: number; // for time-based events
}

export interface CostBreakdown {
  labor_cost: number;
  material_cost: number;
  travel_cost: number;
  overhead_cost: number;
  total_cost: number;
  estimated_vs_actual: {
    estimated_total: number;
    actual_total: number;
    variance_amount: number;
    variance_percentage: number;
  };
}

export interface EfficiencyMetrics {
  planned_duration: number; // minutes
  actual_duration: number; // minutes
  efficiency_ratio: number; // actual/planned
  idle_time: number; // minutes
  productive_time: number; // minutes
  productivity_score: number; // 0-100
  quality_score?: number; // 0-100, based on rework/issues
}

export interface WorkflowAnalytics {
  period: 'day' | 'week' | 'month' | 'quarter' | 'year';
  start_date: string;
  end_date: string;
  metrics: {
    total_workflows: number;
    completed_workflows: number;
    average_completion_time: number;
    approval_rate: number;
    escalation_rate: number;
    cost_savings: number;
    efficiency_improvement: number;
  };
  trends: {
    completion_time_trend: number[]; // daily/weekly averages
    approval_rate_trend: number[];
    cost_trend: number[];
  };
  bottlenecks: {
    step_id: string;
    step_name: string;
    average_duration: number;
    frequency: number;
    impact_score: number;
  }[];
  recommendations: {
    type: 'optimization' | 'automation' | 'training' | 'resource';
    priority: 'high' | 'medium' | 'low';
    description: string;
    estimated_impact: string;
  }[];
}

// Request/Response types for API
export interface CreateWorkflowRequest {
  name: string;
  description?: string;
  trigger_conditions: Omit<TriggerCondition, 'id'>[];
  steps: Omit<WorkflowStep, 'id' | 'workflow_id' | 'created_at'>[];
  escalation_rules?: Omit<EscalationRule, 'id' | 'workflow_id'>[];
}

export interface UpdateWorkflowRequest extends Partial<CreateWorkflowRequest> {
  id: string;
  version?: string;
}

export interface StartWorkflowRequest {
  workflow_id: string;
  work_order_id: string;
  context_data?: Record<string, any>;
}

export interface ProcessApprovalRequest {
  approval_id: string;
  decision: 'approved' | 'rejected';
  comments?: string;
  attachments?: File[];
}

export interface CreateTimeEntryRequest {
  work_order_id: string;
  activity_type: TimeTrackingEntry['activity_type'];
  description?: string;
  location?: TimeTrackingEntry['location'];
  is_billable?: boolean;
  hourly_rate?: number;
}

export interface UpdateTimeEntryRequest {
  id: string;
  end_time?: string;
  description?: string;
  is_billable?: boolean;
  status?: TimeTrackingEntry['status'];
}