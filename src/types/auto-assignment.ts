/**
 * Auto-Assignment Engine Types
 */

export interface AutoAssignmentRule {
  id: string;
  name: string;
  description?: string | null;
  is_active: boolean;
  priority: number;

  // Weights (0-100)
  weight_availability: number;
  weight_specialization: number;
  weight_proximity: number;
  weight_workload: number;
  weight_performance: number;

  // Constraints
  max_distance_km?: number | null;
  require_specialization_match: boolean;
  respect_max_concurrent_orders: boolean;

  // Filters
  allowed_locations?: string[] | null;
  allowed_service_categories?: string[] | null;
  priority_levels?: string[] | null;

  // Fallback
  fallback_action: 'escalate' | 'queue' | 'notify_manager';
  fallback_user_id?: string | null;

  // Metadata
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AutoAssignmentLog {
  id: string;
  work_order_id: string;
  rule_id?: string | null;

  // Assignment details
  assigned_technician_id?: string | null;
  assignment_score?: number | null;

  // Scoring breakdown
  availability_score?: number | null;
  specialization_score?: number | null;
  proximity_score?: number | null;
  workload_score?: number | null;
  performance_score?: number | null;

  // Candidates
  candidates_evaluated: number;
  candidates_data?: AssignmentCandidate[] | null;

  // Result
  status: 'success' | 'failed' | 'fallback';
  failure_reason?: string | null;
  fallback_action_taken?: string | null;

  // Metadata
  assigned_at: string;
  execution_time_ms?: number | null;
}

export interface AssignmentCandidate {
  technician_id: string;
  technician_name: string;
  total_score: number;
  availability_score: number;
  specialization_score: number;
  proximity_score: number;
  workload_score: number;
  performance_score: number;
  distance_km?: number | null;
  reason: string;
}

export interface AutoAssignmentSettings {
  id: string;

  // Global toggles
  auto_assignment_enabled: boolean;
  auto_assign_on_status: string[];

  // Notifications
  notify_technician_on_assignment: boolean;
  notify_manager_on_fallback: boolean;
  notification_channels: string[];

  // Performance
  max_candidates_to_evaluate: number;
  cache_technician_data_seconds: number;

  // Business hours
  business_hours_start: string;
  business_hours_end: string;
  business_days: number[];

  // Metadata
  updated_by?: string | null;
  updated_at: string;
}

export interface AutoAssignmentRequest {
  work_order_id: string;
}

export interface AutoAssignmentResponse {
  success: boolean;
  work_order_id: string;
  assigned_technician_id?: string;
  technician_name?: string;
  assignment_score?: number;
  candidates_evaluated?: number;
  execution_time_ms?: number;
  message?: string;
  fallback_action?: string;
}

export interface RuleFormData {
  name: string;
  description?: string;
  is_active: boolean;
  priority: number;
  weight_availability: number;
  weight_specialization: number;
  weight_proximity: number;
  weight_workload: number;
  weight_performance: number;
  max_distance_km?: number;
  require_specialization_match: boolean;
  respect_max_concurrent_orders: boolean;
  allowed_locations?: string[];
  allowed_service_categories?: string[];
  priority_levels?: string[];
  fallback_action: 'escalate' | 'queue' | 'notify_manager';
  fallback_user_id?: string;
}
