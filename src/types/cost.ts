// Cost Tracking and Financial Management Types

export interface CostCategory {
  id: string;
  name: string;
  description?: string;
  type: 'labor' | 'parts' | 'equipment' | 'overhead' | 'travel' | 'other';
  is_billable: boolean;
  default_rate?: number;
  markup_percentage?: number;
  created_at: string;
  updated_at: string;
}

export interface CostEntry {
  id: string;
  work_order_id: string;
  category_id: string;
  category: CostCategory;
  description: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  billable_amount: number;
  is_billable: boolean;
  date_incurred: string;
  technician_id?: string;
  part_id?: string;
  equipment_id?: string;
  time_entry_id?: string;
  invoice_id?: string;
  status: 'draft' | 'approved' | 'billed' | 'paid';
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: string;
  name: string;
  description?: string;
  work_order_id?: string;
  project_id?: string;
  customer_id?: string;
  total_budget: number;
  allocated_budget: number;
  spent_amount: number;
  remaining_budget: number;
  budget_categories: BudgetCategory[];
  start_date: string;
  end_date: string;
  status: 'draft' | 'approved' | 'active' | 'completed' | 'exceeded';
  variance_threshold: number; // Percentage threshold for alerts
  created_by: string;
  approved_by?: string;
  created_at: string;
  updated_at: string;
}

export interface BudgetCategory {
  id: string;
  budget_id: string;
  category_id: string;
  category: CostCategory;
  allocated_amount: number;
  spent_amount: number;
  remaining_amount: number;
  variance_percentage: number;
  notes?: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  work_order_id: string;
  customer_id: string;
  customer_name: string;
  invoice_date: string;
  due_date: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  paid_amount: number;
  balance_due: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  payment_terms: string;
  notes?: string;
  line_items: InvoiceLineItem[];
  payments: Payment[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceLineItem {
  id: string;
  invoice_id: string;
  cost_entry_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  tax_rate: number;
  tax_amount: number;
}

export interface Payment {
  id: string;
  invoice_id: string;
  payment_date: string;
  amount: number;
  payment_method: 'cash' | 'check' | 'credit_card' | 'bank_transfer' | 'other';
  reference_number?: string;
  notes?: string;
  created_by: string;
  created_at: string;
}

export interface CostAnalysis {
  work_order_id: string;
  total_cost: number;
  billable_cost: number;
  non_billable_cost: number;
  profit_margin: number;
  cost_breakdown: {
    labor: number;
    parts: number;
    equipment: number;
    overhead: number;
    travel: number;
    other: number;
  };
  budget_variance: number;
  efficiency_score: number;
}

export interface FinancialReport {
  id: string;
  name: string;
  type: 'cost_summary' | 'profitability' | 'budget_variance' | 'invoice_aging' | 'cash_flow';
  period_start: string;
  period_end: string;
  filters: {
    work_order_ids?: string[];
    customer_ids?: string[];
    technician_ids?: string[];
    cost_categories?: string[];
  };
  data: any;
  generated_at: string;
  generated_by: string;
}

export interface CostMetrics {
  total_revenue: number;
  total_costs: number;
  gross_profit: number;
  profit_margin: number;
  average_job_cost: number;
  cost_per_hour: number;
  billable_utilization: number;
  budget_variance: number;
  outstanding_invoices: number;
  overdue_amount: number;
  cash_flow: number;
}

export interface PricingRule {
  id: string;
  name: string;
  description?: string;
  rule_type: 'markup' | 'fixed_price' | 'hourly_rate' | 'tiered_pricing';
  conditions: {
    customer_type?: string[];
    service_type?: string[];
    priority?: string[];
    location?: string[];
    time_of_day?: string[];
    day_of_week?: string[];
  };
  pricing_config: {
    markup_percentage?: number;
    fixed_price?: number;
    hourly_rate?: number;
    tiers?: PricingTier[];
  };
  is_active: boolean;
  effective_date: string;
  expiry_date?: string;
  created_at: string;
  updated_at: string;
}

export interface PricingTier {
  min_quantity: number;
  max_quantity?: number;
  unit_price: number;
  discount_percentage?: number;
}

export interface CostForecast {
  work_order_id: string;
  forecasted_total: number;
  confidence_level: number;
  breakdown: {
    labor_hours: number;
    labor_cost: number;
    parts_cost: number;
    equipment_cost: number;
    overhead_cost: number;
    travel_cost: number;
  };
  risk_factors: string[];
  assumptions: string[];
  generated_at: string;
}

export interface CostEstimate {
  id: string;
  work_order_id: string;
  estimated_labor_hours: number;
  estimated_labor_cost: number;
  estimated_material_cost: number;
  estimated_other_costs: number;
  total_estimated_cost: number;
  confidence_level: 'low' | 'medium' | 'high';
  estimation_method: 'template' | 'historical' | 'manual' | 'ai';
  estimated_by: string;
  estimated_at: string;
  created_at: string;
  updated_at: string;
}

// Hook return types
export interface UseCostTrackingReturn {
  costEntries: CostEntry[];
  costCategories: CostCategory[];
  loading: boolean;
  error: string | null;
  
  // Cost entry management
  createCostEntry: (entry: Omit<CostEntry, 'id' | 'created_at' | 'updated_at'>) => Promise<CostEntry>;
  updateCostEntry: (id: string, updates: Partial<CostEntry>) => Promise<CostEntry>;
  deleteCostEntry: (id: string) => Promise<void>;
  approveCostEntry: (id: string) => Promise<void>;
  
  // Cost analysis
  getCostAnalysis: (workOrderId: string) => Promise<CostAnalysis>;
  getCostForecast: (workOrderId: string) => Promise<CostForecast>;
  generateCostEstimate: (workOrderId: string, method: 'template' | 'historical' | 'manual' | 'ai') => Promise<CostEstimate>;
  
  // Category management
  createCostCategory: (category: Omit<CostCategory, 'id' | 'created_at' | 'updated_at'>) => Promise<CostCategory>;
  updateCostCategory: (id: string, updates: Partial<CostCategory>) => Promise<CostCategory>;
}

export interface UseBudgetManagementReturn {
  budgets: Budget[];
  loading: boolean;
  error: string | null;
  
  // Budget management
  createBudget: (budget: Omit<Budget, 'id' | 'created_at' | 'updated_at'>) => Promise<Budget>;
  updateBudget: (id: string, updates: Partial<Budget>) => Promise<Budget>;
  deleteBudget: (id: string) => Promise<void>;
  approveBudget: (id: string) => Promise<void>;
  
  // Budget monitoring
  getBudgetStatus: (budgetId: string) => Promise<Budget>;
  getBudgetVariance: (budgetId: string) => Promise<number>;
  getBudgetAlerts: () => Promise<BudgetAlert[]>;
}

export interface BudgetAlert {
  id: string;
  budget_id: string;
  budget_name: string;
  alert_type: 'variance_threshold' | 'budget_exceeded' | 'category_exceeded';
  message: string;
  severity: 'low' | 'medium' | 'high';
  created_at: string;
}

export interface UseInvoicingReturn {
  invoices: Invoice[];
  loading: boolean;
  error: string | null;
  
  // Invoice management
  createInvoice: (workOrderId: string) => Promise<Invoice>;
  updateInvoice: (id: string, updates: Partial<Invoice>) => Promise<Invoice>;
  sendInvoice: (id: string) => Promise<void>;
  recordPayment: (invoiceId: string, payment: Omit<Payment, 'id' | 'created_at'>) => Promise<Payment>;
  
  // Invoice generation
  generateInvoiceFromCosts: (workOrderId: string, costEntryIds: string[]) => Promise<Invoice>;
  previewInvoice: (workOrderId: string) => Promise<Invoice>;
  
  // Reports
  getInvoiceAging: () => Promise<any>;
  getPaymentHistory: (customerId?: string) => Promise<Payment[]>;
}

export interface UseFinancialAnalyticsReturn {
  metrics: CostMetrics;
  loading: boolean;
  error: string | null;
  
  // Analytics
  getCostMetrics: (period: { start: string; end: string }) => Promise<CostMetrics>;
  getProfitabilityReport: (filters: any) => Promise<FinancialReport>;
  getBudgetVarianceReport: (filters: any) => Promise<FinancialReport>;
  getCashFlowReport: (filters: any) => Promise<FinancialReport>;
  
  // Recommendations
  getPricingRecommendations: (workOrderId: string) => Promise<PricingRule[]>;
}