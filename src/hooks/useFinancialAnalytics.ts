import { useState, useEffect, useCallback } from 'react';
import { 
  CostMetrics, 
  FinancialReport, 
  PricingRule,
  UseFinancialAnalyticsReturn 
} from '@/types/cost';

// Mock data for EV motorbike maintenance and repair
const mockMetrics: CostMetrics = {
  total_revenue: 45000000, // UGX 45M
  total_costs: 31500000, // UGX 31.5M
  gross_profit: 13500000, // UGX 13.5M
  profit_margin: 30,
  average_job_cost: 315000, // UGX 315K
  cost_per_hour: 23400, // UGX 23.4K
  billable_utilization: 78,
  budget_variance: -5.2,
  outstanding_invoices: 15,
  overdue_amount: 4500000, // UGX 4.5M
  cash_flow: 9000000 // UGX 9M
};

export const useFinancialAnalytics = (): UseFinancialAnalyticsReturn => {
  const [metrics, setMetrics] = useState<CostMetrics>(mockMetrics);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial metrics
  const loadMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setMetrics(mockMetrics);
    } catch (err) {
      setError('Failed to load financial metrics');
      console.error('Error loading metrics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  // Get cost metrics for a specific period
  const getCostMetrics = useCallback(async (
    period: { start: string; end: string }
  ): Promise<CostMetrics> => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In a real implementation, this would filter data by the period
      const periodMetrics: CostMetrics = {
        ...mockMetrics,
        // Adjust metrics based on period (mock calculation)
        total_revenue: mockMetrics.total_revenue * 0.8,
        total_costs: mockMetrics.total_costs * 0.8,
        gross_profit: mockMetrics.gross_profit * 0.8
      };
      
      return periodMetrics;
    } catch (err) {
      setError('Failed to get cost metrics');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get profitability report
  const getProfitabilityReport = useCallback(async (filters: any): Promise<FinancialReport> => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const report: FinancialReport = {
        id: `report-${Date.now()}`,
        name: 'Profitability Analysis',
        type: 'profitability',
        period_start: filters.start_date || '2024-01-01',
        period_end: filters.end_date || '2024-03-31',
        filters,
        data: {
          summary: {
            total_revenue: 125000,
            total_costs: 87500,
            gross_profit: 37500,
            profit_margin: 30,
            net_profit: 32500
          },
          by_category: [
            {
              category: 'Emergency Repairs',
              revenue: 45000,
              costs: 28000,
              profit: 17000,
              margin: 37.8
            },
            {
              category: 'Routine Maintenance',
              revenue: 35000,
              costs: 22000,
              profit: 13000,
              margin: 37.1
            },
            {
              category: 'Preventive Maintenance',
              revenue: 25000,
              costs: 18000,
              profit: 7000,
              margin: 28.0
            },
            {
              category: 'Inspections',
              revenue: 20000,
              costs: 19500,
              profit: 500,
              margin: 2.5
            }
          ],
          by_technician: [
            {
              technician: 'John Smith',
              revenue: 32000,
              costs: 22000,
              profit: 10000,
              margin: 31.3,
              efficiency: 85
            },
            {
              technician: 'Sarah Johnson',
              revenue: 28000,
              costs: 18500,
              profit: 9500,
              margin: 33.9,
              efficiency: 92
            },
            {
              technician: 'Mike Wilson',
              revenue: 25000,
              costs: 17000,
              profit: 8000,
              margin: 32.0,
              efficiency: 78
            }
          ],
          trends: {
            monthly_profit: [
              { month: 'Jan', profit: 12500 },
              { month: 'Feb', profit: 11000 },
              { month: 'Mar', profit: 14000 }
            ],
            quarterly_growth: 8.5
          }
        },
        generated_at: new Date().toISOString(),
        generated_by: 'current-user'
      };
      
      return report;
    } catch (err) {
      setError('Failed to generate profitability report');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get budget variance report
  const getBudgetVarianceReport = useCallback(async (filters: any): Promise<FinancialReport> => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const report: FinancialReport = {
        id: `report-${Date.now()}`,
        name: 'Budget Variance Analysis',
        type: 'budget_variance',
        period_start: filters.start_date || '2024-01-01',
        period_end: filters.end_date || '2024-03-31',
        filters,
        data: {
          summary: {
            total_budget: 100000,
            total_spent: 87500,
            variance: -12500,
            variance_percentage: -12.5
          },
          by_category: [
            {
              category: 'Labor',
              budget: 50000,
              spent: 45000,
              variance: -5000,
              variance_percentage: -10.0,
              status: 'under_budget'
            },
            {
              category: 'Parts',
              budget: 30000,
              spent: 28000,
              variance: -2000,
              variance_percentage: -6.7,
              status: 'under_budget'
            },
            {
              category: 'Equipment',
              budget: 15000,
              spent: 12000,
              variance: -3000,
              variance_percentage: -20.0,
              status: 'under_budget'
            },
            {
              category: 'Overhead',
              budget: 5000,
              spent: 2500,
              variance: -2500,
              variance_percentage: -50.0,
              status: 'under_budget'
            }
          ],
          alerts: [
            {
              type: 'positive_variance',
              message: 'All categories are under budget',
              severity: 'low'
            }
          ],
          forecast: {
            projected_year_end: 350000,
            budget_utilization: 87.5,
            recommended_adjustments: [
              'Consider reallocating unused overhead budget to parts inventory',
              'Equipment budget appears overestimated for current needs'
            ]
          }
        },
        generated_at: new Date().toISOString(),
        generated_by: 'current-user'
      };
      
      return report;
    } catch (err) {
      setError('Failed to generate budget variance report');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get cash flow report
  const getCashFlowReport = useCallback(async (filters: any): Promise<FinancialReport> => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 700));
      
      const report: FinancialReport = {
        id: `report-${Date.now()}`,
        name: 'Cash Flow Analysis',
        type: 'cash_flow',
        period_start: filters.start_date || '2024-01-01',
        period_end: filters.end_date || '2024-03-31',
        filters,
        data: {
          summary: {
            opening_balance: 50000,
            total_inflows: 125000,
            total_outflows: 87500,
            net_cash_flow: 37500,
            closing_balance: 87500
          },
          monthly_flow: [
            {
              month: 'January',
              inflows: 42000,
              outflows: 28000,
              net_flow: 14000,
              balance: 64000
            },
            {
              month: 'February',
              inflows: 38000,
              outflows: 31000,
              net_flow: 7000,
              balance: 71000
            },
            {
              month: 'March',
              inflows: 45000,
              outflows: 28500,
              net_flow: 16500,
              balance: 87500
            }
          ],
          receivables: {
            current: 25000,
            overdue_1_30: 8000,
            overdue_31_60: 3000,
            overdue_over_60: 1500,
            total_outstanding: 37500
          },
          payables: {
            current: 15000,
            due_1_30: 5000,
            due_31_60: 2000,
            total_payables: 22000
          },
          forecast: {
            next_30_days: 18000,
            next_60_days: 12000,
            next_90_days: 8000
          }
        },
        generated_at: new Date().toISOString(),
        generated_by: 'current-user'
      };
      
      return report;
    } catch (err) {
      setError('Failed to generate cash flow report');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get pricing recommendations
  const getPricingRecommendations = useCallback(async (workOrderId: string): Promise<PricingRule[]> => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const recommendations: PricingRule[] = [
        {
          id: '1',
          name: 'Emergency Service Premium',
          description: 'Apply premium pricing for emergency and after-hours services',
          rule_type: 'markup',
          conditions: {
            priority: ['urgent', 'emergency'],
            time_of_day: ['after_hours', 'weekend']
          },
          pricing_config: {
            markup_percentage: 50
          },
          is_active: true,
          effective_date: '2024-01-01',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        {
          id: '2',
          name: 'Volume Discount',
          description: 'Tiered pricing for high-volume customers',
          rule_type: 'tiered_pricing',
          conditions: {
            customer_type: ['enterprise', 'fleet']
          },
          pricing_config: {
            tiers: [
              { min_quantity: 1, max_quantity: 10, unit_price: 100 },
              { min_quantity: 11, max_quantity: 25, unit_price: 90, discount_percentage: 10 },
              { min_quantity: 26, unit_price: 80, discount_percentage: 20 }
            ]
          },
          is_active: true,
          effective_date: '2024-01-01',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ];
      
      return recommendations;
    } catch (err) {
      setError('Failed to get pricing recommendations');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    metrics,
    loading,
    error,
    getCostMetrics,
    getProfitabilityReport,
    getBudgetVarianceReport,
    getCashFlowReport,
    getPricingRecommendations
  };
};