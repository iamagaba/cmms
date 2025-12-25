import { useState, useEffect, useCallback } from 'react';
import { 
  CostEntry, 
  CostCategory, 
  CostAnalysis,
  CostForecast,
  UseCostTrackingReturn,
  CostEstimate
} from '@/types/cost';

// Mock data for EV motorbike maintenance and repair
const mockCostCategories: CostCategory[] = [
  {
    id: '1',
    name: 'Technician Labor - Regular',
    description: 'Standard technician labor hours for EV motorbike repairs',
    type: 'labor',
    is_billable: true,
    default_rate: 25000, // UGX per hour
    markup_percentage: 20,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Technician Labor - Emergency',
    description: 'Emergency/after-hours technician labor',
    type: 'labor',
    is_billable: true,
    default_rate: 40000, // UGX per hour
    markup_percentage: 25,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Battery & Power Components',
    description: 'Battery packs, chargers, and power system parts',
    type: 'parts',
    is_billable: true,
    markup_percentage: 30,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    name: 'Motor & Drive Components',
    description: 'Electric motors, controllers, and drive system parts',
    type: 'parts',
    is_billable: true,
    markup_percentage: 35,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '5',
    name: 'Mechanical Parts',
    description: 'Brakes, tires, chains, and mechanical components',
    type: 'parts',
    is_billable: true,
    markup_percentage: 25,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '6',
    name: 'Electrical Components',
    description: 'Lights, displays, wiring, and electrical parts',
    type: 'parts',
    is_billable: true,
    markup_percentage: 30,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '7',
    name: 'Diagnostic Equipment',
    description: 'Specialized diagnostic tools and equipment usage',
    type: 'equipment',
    is_billable: true,
    default_rate: 15000, // UGX per use
    markup_percentage: 20,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '8',
    name: 'Field Service Travel',
    description: 'Travel costs for on-site repairs and pickup/delivery',
    type: 'travel',
    is_billable: true,
    default_rate: 1500, // UGX per km
    markup_percentage: 15,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '9',
    name: 'Workshop Overhead',
    description: 'Workshop utilities, rent, and general overhead',
    type: 'overhead',
    is_billable: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

const mockCostEntries: CostEntry[] = [
  {
    id: '1',
    work_order_id: 'WO-001',
    category_id: '1',
    category: mockCostCategories[0],
    description: 'Battery diagnostic and motor controller repair',
    quantity: 2.5,
    unit_cost: 25000,
    total_cost: 62500,
    billable_amount: 75000,
    is_billable: true,
    date_incurred: '2024-01-15T10:00:00Z',
    technician_id: 'tech-1',
    status: 'approved',
    created_by: 'user-1',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    work_order_id: 'WO-001',
    category_id: '5',
    category: mockCostCategories[4],
    description: 'Brake pads replacement for EV motorbike',
    quantity: 1,
    unit_cost: 45000,
    total_cost: 45000,
    billable_amount: 56250,
    is_billable: true,
    date_incurred: '2024-01-15T11:30:00Z',
    part_id: 'part-123',
    status: 'approved',
    created_by: 'user-1',
    created_at: '2024-01-15T11:30:00Z',
    updated_at: '2024-01-15T11:30:00Z'
  },
  {
    id: '3',
    work_order_id: 'WO-002',
    category_id: '3',
    category: mockCostCategories[2],
    description: 'Lithium battery pack replacement',
    quantity: 1,
    unit_cost: 850000,
    total_cost: 850000,
    billable_amount: 1105000,
    is_billable: true,
    date_incurred: '2024-01-16T09:00:00Z',
    part_id: 'battery-456',
    status: 'approved',
    created_by: 'user-1',
    created_at: '2024-01-16T09:00:00Z',
    updated_at: '2024-01-16T09:00:00Z'
  }
];

export const useCostTracking = (workOrderId?: string): UseCostTrackingReturn => {
  const [costEntries, setCostEntries] = useState<CostEntry[]>([]);
  const [costCategories, setCostCategories] = useState<CostCategory[]>(mockCostCategories);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load cost entries
  const loadCostEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let entries = mockCostEntries;
      if (workOrderId) {
        entries = entries.filter(entry => entry.work_order_id === workOrderId);
      }
      
      setCostEntries(entries);
    } catch (err) {
      setError('Failed to load cost entries');
      console.error('Error loading cost entries:', err);
    } finally {
      setLoading(false);
    }
  }, [workOrderId]);

  useEffect(() => {
    loadCostEntries();
  }, [loadCostEntries]);

  // Create cost entry
  const createCostEntry = useCallback(async (
    entry: Omit<CostEntry, 'id' | 'created_at' | 'updated_at'>
  ): Promise<CostEntry> => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const category = costCategories.find(c => c.id === entry.category_id);
      if (!category) {
        throw new Error('Invalid cost category');
      }

      // Calculate billable amount with markup
      const billableAmount = entry.is_billable && category.markup_percentage
        ? entry.total_cost * (1 + category.markup_percentage / 100)
        : entry.total_cost;

      const newEntry: CostEntry = {
        ...entry,
        id: `cost-${Date.now()}`,
        category,
        billable_amount: billableAmount,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setCostEntries(prev => [...prev, newEntry]);
      return newEntry;
    } catch (err) {
      setError('Failed to create cost entry');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [costCategories]);

  // Update cost entry
  const updateCostEntry = useCallback(async (
    id: string, 
    updates: Partial<CostEntry>
  ): Promise<CostEntry> => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setCostEntries(prev => prev.map(entry => {
        if (entry.id === id) {
          const updatedEntry = { 
            ...entry, 
            ...updates, 
            updated_at: new Date().toISOString() 
          };
          
          // Recalculate billable amount if relevant fields changed
          if (updates.total_cost || updates.is_billable || updates.category_id) {
            const category = costCategories.find(c => c.id === updatedEntry.category_id);
            if (category && updatedEntry.is_billable && category.markup_percentage) {
              updatedEntry.billable_amount = updatedEntry.total_cost * (1 + category.markup_percentage / 100);
            } else {
              updatedEntry.billable_amount = updatedEntry.total_cost;
            }
          }
          
          return updatedEntry;
        }
        return entry;
      }));
      
      const updatedEntry = costEntries.find(e => e.id === id);
      if (!updatedEntry) throw new Error('Entry not found');
      
      return { ...updatedEntry, ...updates };
    } catch (err) {
      setError('Failed to update cost entry');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [costCategories, costEntries]);

  // Delete cost entry
  const deleteCostEntry = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setCostEntries(prev => prev.filter(entry => entry.id !== id));
    } catch (err) {
      setError('Failed to delete cost entry');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Approve cost entry
  const approveCostEntry = useCallback(async (id: string): Promise<void> => {
    await updateCostEntry(id, { status: 'approved' });
  }, [updateCostEntry]);

  // Get cost analysis
  const getCostAnalysis = useCallback(async (workOrderId: string): Promise<CostAnalysis> => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const workOrderEntries = costEntries.filter(entry => entry.work_order_id === workOrderId);
      
      const totalCost = workOrderEntries.reduce((sum, entry) => sum + entry.total_cost, 0);
      const billableCost = workOrderEntries
        .filter(entry => entry.is_billable)
        .reduce((sum, entry) => sum + entry.billable_amount, 0);
      const nonBillableCost = totalCost - workOrderEntries
        .filter(entry => entry.is_billable)
        .reduce((sum, entry) => sum + entry.total_cost, 0);
      
      const profitMargin = totalCost > 0 ? ((billableCost - totalCost) / billableCost) * 100 : 0;
      
      const costBreakdown = {
        labor: workOrderEntries
          .filter(entry => entry.category.type === 'labor')
          .reduce((sum, entry) => sum + entry.total_cost, 0),
        parts: workOrderEntries
          .filter(entry => entry.category.type === 'parts')
          .reduce((sum, entry) => sum + entry.total_cost, 0),
        equipment: workOrderEntries
          .filter(entry => entry.category.type === 'equipment')
          .reduce((sum, entry) => sum + entry.total_cost, 0),
        overhead: workOrderEntries
          .filter(entry => entry.category.type === 'overhead')
          .reduce((sum, entry) => sum + entry.total_cost, 0),
        travel: workOrderEntries
          .filter(entry => entry.category.type === 'travel')
          .reduce((sum, entry) => sum + entry.total_cost, 0),
        other: workOrderEntries
          .filter(entry => entry.category.type === 'other')
          .reduce((sum, entry) => sum + entry.total_cost, 0)
      };
      
      const analysis: CostAnalysis = {
        work_order_id: workOrderId,
        total_cost: totalCost,
        billable_cost: billableCost,
        non_billable_cost: nonBillableCost,
        profit_margin: profitMargin,
        cost_breakdown: costBreakdown,
        budget_variance: 0, // Would be calculated against budget
        efficiency_score: Math.min(100, Math.max(0, profitMargin + 50)), // Simple efficiency calculation
      };
      
      return analysis;
    } catch (err) {
      setError('Failed to get cost analysis');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [costEntries]);

  // Get cost forecast
  const getCostForecast = useCallback(async (workOrderId: string): Promise<CostForecast> => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simple forecast based on historical data and work order complexity
      const forecast: CostForecast = {
        work_order_id: workOrderId,
        forecasted_total: 450,
        confidence_level: 85,
        breakdown: {
          labor_hours: 4,
          labor_cost: 300,
          parts_cost: 100,
          equipment_cost: 25,
          overhead_cost: 15,
          travel_cost: 10
        },
        risk_factors: [
          'Parts availability may affect timeline',
          'Complex diagnostic requirements'
        ],
        assumptions: [
          'Standard labor rates applied',
          'No unexpected complications',
          'Parts available within 24 hours'
        ],
        generated_at: new Date().toISOString()
      };
      
      return forecast;
    } catch (err) {
      setError('Failed to get cost forecast');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create cost category
  const createCostCategory = useCallback(async (
    category: Omit<CostCategory, 'id' | 'created_at' | 'updated_at'>
  ): Promise<CostCategory> => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const newCategory: CostCategory = {
        ...category,
        id: `category-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setCostCategories(prev => [...prev, newCategory]);
      return newCategory;
    } catch (err) {
      setError('Failed to create cost category');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update cost category
  const updateCostCategory = useCallback(async (
    id: string, 
    updates: Partial<CostCategory>
  ): Promise<CostCategory> => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setCostCategories(prev => prev.map(category => 
        category.id === id 
          ? { ...category, ...updates, updated_at: new Date().toISOString() }
          : category
      ));
      
      const updatedCategory = costCategories.find(c => c.id === id);
      if (!updatedCategory) throw new Error('Category not found');
      
      return { ...updatedCategory, ...updates };
    } catch (err) {
      setError('Failed to update cost category');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [costCategories]);

  const generateCostEstimate = useCallback(async (workOrderId: string, method: 'template' | 'historical' | 'manual' | 'ai'): Promise<CostEstimate> => {
    const forecast = await getCostForecast(workOrderId);
    return {
      id: `est-${Date.now()}`,
      work_order_id: workOrderId,
      estimated_labor_hours: forecast.breakdown.labor_hours,
      estimated_labor_cost: forecast.breakdown.labor_cost,
      estimated_material_cost: forecast.breakdown.parts_cost,
      estimated_other_costs: forecast.breakdown.equipment_cost + forecast.breakdown.overhead_cost + forecast.breakdown.travel_cost,
      total_estimated_cost: forecast.forecasted_total,
      confidence_level: 'medium',
      estimation_method: method,
      estimated_by: 'current-user',
      estimated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }, [getCostForecast]);

  return {
    costEntries,
    costCategories,
    loading,
    error,
    createCostEntry,
    updateCostEntry,
    deleteCostEntry,
    approveCostEntry,
    getCostAnalysis,
    getCostForecast,
    createCostCategory,
    updateCostCategory,
    generateCostEstimate,
  };
};