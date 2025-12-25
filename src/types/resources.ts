

// Technician scheduling and assignment types only

export interface WorkSchedule {
  id: string;
  technician_id: string;
  day_of_week: number; // 0 = Sunday, 1 = Monday, etc.
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  is_available: boolean;
  break_start?: string;
  break_end?: string;
  notes?: string;
}

export interface TimeOffRequest {
  id: string;
  technician_id: string;
  start_date: string;
  end_date: string;
  type: 'Vacation' | 'Sick' | 'Personal' | 'Training' | 'Other';
  status: 'Pending' | 'Approved' | 'Rejected';
  reason?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
}

export interface WorkloadMetrics {
  technician_id: string;
  current_week_hours: number;
  current_month_hours: number;
  active_work_orders: number;
  overdue_work_orders: number;
  completion_rate: number; // Percentage
  average_completion_time: number; // Hours
  last_updated: string;
}


// Assignment and scheduling only

export interface TechnicianAssignment {
  id: string;
  work_order_id: string;
  technician_id: string;
  role: 'Primary' | 'Secondary';
  estimated_hours: number;
  actual_hours?: number;
  assigned_at: string;
  assigned_by: string;
  status: 'Assigned' | 'Accepted' | 'In Progress' | 'Completed' | 'Cancelled';
  notes?: string;
}

export interface EnhancedTechnicianProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  employee_id?: string;
  department?: string;
  hire_date?: string;
  hourly_rate: number;
  overtime_rate?: number;
  work_schedule: WorkSchedule[];
  time_off_requests: TimeOffRequest[];
  workload_metrics: WorkloadMetrics;
  max_weekly_hours?: number;
  preferred_work_types?: string[];
  travel_radius_km?: number;
  status: 'Active' | 'Inactive' | 'On Leave' | 'Training';
  last_active?: string;
  created_at: string;
  updated_at: string;
}

export interface ResourcePlanningRequest {
  work_order_id?: string;
  template_id?: string;
  requirements: ResourceRequirement[];
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  estimated_duration: number; // in hours
  preferred_start_date?: string;
  deadline?: string;
  location_id?: string;
}

export interface ResourceRequirement {
  id?: string;
  skill_id: string;
  skill_level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  estimated_hours: number;
  is_required: boolean;
  priority: number; // 1-10
}

export interface TechnicianRecommendation {
  technician_id: string;
  technician_name: string;
  match_score: number; // 0-100
  confidence_score: number; // 0-100
  estimated_start_date: string;
  estimated_completion_date: string;
  estimated_cost: number;
  skill_gap: string[];
  conflicts: Conflict[];
}

export interface Conflict {
  type: 'availability' | 'workload' | 'skill_gap' | 'location';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  resolution_suggestion?: string;
}