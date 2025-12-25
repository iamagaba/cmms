import { useState, useEffect, useCallback } from 'react';
import { 
  Budget, 
  BudgetCategory, 
  BudgetAlert,
  UseBudgetManagementReturn 
} from '@/types/cost';

// Mock data for EV motorbike maintenance and repair
const mockBudgets: Budget[] = [
  {
    id: '1',
    name: 'Q1 2024 EV Motorbike Maintenance Budget',
    description: 'Quarterly budget for EV motorbike maintenance and repairs',
    total_budget: 15000000, // UGX 15M
    allocated_budget: 13500000, // UGX 13.5M
    spent_amount: 9750000, // UGX 9.75M
    remaining_budget: 5250000, // UGX 5.25M
    budget_categories: [
      {
        id: '1',
        budget_id: '1',
        category_id: '1',
        category: {
          id: '1',
          name: 'Technician Labor',
          type: 'labor',
          is_billable: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        allocated_amount: 6000000, // UGX 6M
        spent_amount: 4500000, // UGX 4.5M
        remaining_amount: 1500000, // UGX 1.5M
        variance_percentage: -25
      },
      {
        id: '2',
        budget_id: '1',
        category_id: '3',
        category: {
          id: '3',
          name: 'Battery & Power Components',
          type: 'parts',
          is_billable: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        allocated_amount: 4500000, // UGX 4.5M
        spent_amount: 3750000, // UGX 3.75M
        remaining_amount: 750000, // UGX 750K
        variance_percentage: -16.7
      },
      {
        id: '3',
        budget_id: '1',
        category_id: '5',
        category: {
          id: '5',
          name: 'Mechanical Parts',
          type: 'parts',
          is_billable: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        allocated_amount: 3000000, // UGX 3M
        spent_amount: 1500000, // UGX 1.5M
        remaining_amount: 1500000, // UGX 1.5M
        variance_percentage: -50
      }
    ],
    start_date: '2024-01-01',
    end_date: '2024-03-31',
    status: 'active',
    variance_threshold: 10,
    created_by: 'user-1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: '2',
    name: 'Emergency EV Motorbike Repairs Budget',
    description: 'Budget for urgent battery and motor emergency repairs',
    work_order_id: 'WO-001',
    total_budget: 2000000, // UGX 2M
    allocated_budget: 2000000, // UGX 2M
    spent_amount: 1680000, // UGX 1.68M
    remaining_budget: 320000, // UGX 320K
    budget_categories: [
      {
        id: '4',
        budget_id: '2',
        category_id: '1',
        category: {
          id: '1',
          name: 'Emergency Technician Labor',
          type: 'labor',
          is_billable: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        allocated_amount: 1200000, // UGX 1.2M
        spent_amount: 1120000, // UGX 1.12M
        remaining_amount: 80000, // UGX 80K
        variance_percentage: -6.7
      },
      {
        id: '5',
        budget_id: '2',
        category_id: '3',
        category: {
          id: '3',
          name: 'Emergency Battery Parts',
          type: 'parts',
          is_billable: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        allocated_amount: 800000, // UGX 800K
        spent_amount: 560000, // UGX 560K
        remaining_amount: 240000, // UGX 240K
        variance_percentage: -30
      }
    ],
    start_date: '2024-01-15',
    end_date: '2024-01-31',
    status: 'active',
    variance_threshold: 15,
    created_by: 'user-1',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-20T00:00:00Z'
  }
];

export const useBudgetManagement = (): UseBudgetManagementReturn => {
  const [budgets, setBudgets] = useState<Budget[]>(mockBudgets);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load budgets
  const loadBudgets = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setBudgets(mockBudgets);
    } catch (err) {
      setError('Failed to load budgets');
      console.error('Error loading budgets:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBudgets();
  }, [loadBudgets]);

  // Create budget
  const createBudget = useCallback(async (
    budget: Omit<Budget, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Budget> => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const newBudget: Budget = {
        ...budget,
        id: `budget-${Date.now()}`,
        spent_amount: 0,
        remaining_budget: budget.total_budget,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setBudgets(prev => [...prev, newBudget]);
      return newBudget;
    } catch (err) {
      setError('Failed to create budget');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update budget
  const updateBudget = useCallback(async (
    id: string, 
    updates: Partial<Budget>
  ): Promise<Budget> => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setBudgets(prev => prev.map(budget => {
        if (budget.id === id) {
          const updatedBudget = { 
            ...budget, 
            ...updates, 
            updated_at: new Date().toISOString() 
          };
          
          // Recalculate remaining budget if total or spent amount changed
          if (updates.total_budget !== undefined || updates.spent_amount !== undefined) {
            updatedBudget.remaining_budget = updatedBudget.total_budget - updatedBudget.spent_amount;
          }
          
          return updatedBudget;
        }
        return budget;
      }));
      
      const updatedBudget = budgets.find(b => b.id === id);
      if (!updatedBudget) throw new Error('Budget not found');
      
      return { ...updatedBudget, ...updates };
    } catch (err) {
      setError('Failed to update budget');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [budgets]);

  // Delete budget
  const deleteBudget = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setBudgets(prev => prev.filter(budget => budget.id !== id));
    } catch (err) {
      setError('Failed to delete budget');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Approve budget
  const approveBudget = useCallback(async (id: string): Promise<void> => {
    await updateBudget(id, { 
      status: 'approved',
      approved_by: 'current-user' // Would be actual user ID
    });
  }, [updateBudget]);

  // Get budget status
  const getBudgetStatus = useCallback(async (budgetId: string): Promise<Budget> => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const budget = budgets.find(b => b.id === budgetId);
      if (!budget) {
        throw new Error('Budget not found');
      }
      
      // Update budget categories with latest spending
      const updatedBudget = {
        ...budget,
        budget_categories: budget.budget_categories.map(category => ({
          ...category,
          remaining_amount: category.allocated_amount - category.spent_amount,
          variance_percentage: ((category.spent_amount - category.allocated_amount) / category.allocated_amount) * 100
        }))
      };
      
      return updatedBudget;
    } catch (err) {
      setError('Failed to get budget status');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [budgets]);

  // Get budget variance
  const getBudgetVariance = useCallback(async (budgetId: string): Promise<number> => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const budget = budgets.find(b => b.id === budgetId);
      if (!budget) {
        throw new Error('Budget not found');
      }
      
      const variance = ((budget.spent_amount - budget.total_budget) / budget.total_budget) * 100;
      return variance;
    } catch (err) {
      setError('Failed to get budget variance');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [budgets]);

  // Get budget alerts
  const getBudgetAlerts = useCallback(async (): Promise<BudgetAlert[]> => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const alerts: BudgetAlert[] = [];
      
      budgets.forEach(budget => {
        const spentPercentage = (budget.spent_amount / budget.total_budget) * 100;
        
        // Check for budget threshold alerts
        if (spentPercentage > (100 - budget.variance_threshold)) {
          alerts.push({
            id: `alert-${budget.id}-threshold`,
            budget_id: budget.id,
            budget_name: budget.name,
            alert_type: 'variance_threshold',
            message: `Budget "${budget.name}" is ${spentPercentage.toFixed(1)}% spent, approaching threshold`,
            severity: spentPercentage > 95 ? 'high' : 'medium',
            created_at: new Date().toISOString()
          });
        }
        
        // Check for exceeded budgets
        if (budget.spent_amount > budget.total_budget) {
          alerts.push({
            id: `alert-${budget.id}-exceeded`,
            budget_id: budget.id,
            budget_name: budget.name,
            alert_type: 'budget_exceeded',
            message: `Budget "${budget.name}" has been exceeded by $${(budget.spent_amount - budget.total_budget).toFixed(2)}`,
            severity: 'high',
            created_at: new Date().toISOString()
          });
        }
        
        // Check for category overruns
        budget.budget_categories.forEach(category => {
          if (category.spent_amount > category.allocated_amount) {
            alerts.push({
              id: `alert-${budget.id}-category-${category.id}`,
              budget_id: budget.id,
              budget_name: budget.name,
              alert_type: 'category_exceeded',
              message: `Category "${category.category.name}" in budget "${budget.name}" has been exceeded`,
              severity: 'medium',
              created_at: new Date().toISOString()
            });
          }
        });
      });
      
      return alerts.sort((a, b) => {
        const severityOrder = { high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      });
    } catch (err) {
      setError('Failed to get budget alerts');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [budgets]);

  return {
    budgets,
    loading,
    error,
    createBudget,
    updateBudget,
    deleteBudget,
    approveBudget,
    getBudgetStatus,
    getBudgetVariance,
    getBudgetAlerts
  };
};