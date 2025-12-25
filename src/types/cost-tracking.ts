export interface CostCategory {
  id: string;
  name: string;
  description?: string;
  color: string;
  is_billable: boolean;
  default_rate?: number;
  created_at: string;
  updated_at: string;
}

export interface MaterialUsageEntry {
  id: string;
  work_order_id: string;
  inventory_item_id: string;
  quantity_used: number;
  unit_cost: number;
  total_cost: number;
  usage_type: 'consumed' | 'returned' | 'wasted';
  notes?: string;
  recorded_by: string;
  recorded_at: string;
  created_at: string;
  updated_at: string;
}

export interface LaborCostEntry {
  id: string;
  work_order_id: string;
  technician_id: string;
  time_entry_id?: string;
  hours_worked: number;
  hourly_rate: number;
  overtime_hours?: number;
  overtime_rate?: number;
  total_cost: number;
  cost_category_id: string;
  is_billable: boolean;
  notes?: string;
  recorded_at: string;
  created_at: string;
  updated_at: string;
}

export interface OtherCostEntry {
  id: string;
  work_order_id: string;
  cost_type: 'travel' | 'equipment' | 'subcontractor' | 'permit' | 'other';
  description: string;
  amount: number;
  cost_category_id: string;
  is_billable: boolean;
  receipt_url?: string;
  vendor?: string;
  notes?: string;
  recorded_by: string;
  recorded_at: string;
  created_at: string;
  updated_at: string;
}


export interface CostSummary {
  work_order_id: string;
  estimated_costs: {
    labor: number;
    materials: number;
    other: number;
    total: number;
  };
  actual_costs: {
    labor: number;
    materials: number;
    other: number;
    total: number;
  };
  variance: {
    labor: number;
    materials: number;
    other: number;
    total: number;
    percentage: number;
  };
  billable_costs: {
    labor: number;
    materials: number;
    other: number;
    total: number;
  };
  cost_breakdown: {
    categories: Array<{
      category_id: string;
      category_name: string;
      estimated: number;
      actual: number;
      variance: number;
    }>;
  };
  updated_at: string;
}

export interface CostVarianceReport {
  id: string;
  work_order_id: string;
  report_type: 'budget_overrun' | 'significant_variance' | 'cost_anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  variance_amount: number;
  variance_percentage: number;
  affected_categories: string[];
  root_cause?: string;
  recommendations?: string[];
  generated_at: string;
  acknowledged_by?: string;
  acknowledged_at?: string;
  created_at: string;
}

export interface BudgetAlert {
  id: string;
  work_order_id: string;
  alert_type: 'approaching_budget' | 'budget_exceeded' | 'unusual_spending';
  threshold_percentage: number;
  current_percentage: number;
  budget_amount: number;
  current_amount: number;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  is_active: boolean;
  created_at: string;
  resolved_at?: string;
}

export interface CostAnalytics {
  period: {
    start_date: string;
    end_date: string;
  };
  total_costs: {
    estimated: number;
    actual: number;
    variance: number;
    variance_percentage: number;
  };
  cost_by_category: Array<{
    category: string;
    estimated: number;
    actual: number;
    variance: number;
    work_order_count: number;
  }>;
  cost_trends: Array<{
    date: string;
    estimated: number;
    actual: number;
    variance: number;
  }>;
  top_cost_drivers: Array<{
    work_order_id: string;
    work_order_title: string;
    total_cost: number;
    variance: number;
    variance_percentage: number;
  }>;
  efficiency_metrics: {
    cost_per_work_order: number;
    labor_efficiency: number;
    material_waste_percentage: number;
    budget_accuracy: number;
  };
}

export interface MaterialInventoryImpact {
  inventory_item_id: string;
  item_name: string;
  current_stock: number;
  reserved_quantity: number;
  available_quantity: number;
  reorder_point: number;
  needs_reorder: boolean;
  estimated_depletion_date?: string;
  cost_impact: number;
  work_orders_affected: string[];
}

export interface CostTrackingSettings {
  default_labor_rate: number;
  overtime_multiplier: number;
  budget_alert_thresholds: {
    warning: number; // percentage
    critical: number; // percentage
  };
  variance_alert_threshold: number; // percentage
  auto_calculate_estimates: boolean;
  require_cost_approval: boolean;
  cost_approval_threshold: number;
  enable_material_tracking: boolean;
  enable_variance_alerts: boolean;
}