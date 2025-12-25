import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { InventoryItem, ItemCategory, StockAdjustment } from '@/types/supabase';
import dayjs from 'dayjs';

// Query keys
export const inventoryReportKeys = {
  valuation: ['inventory_valuation'] as const,
  stockMovement: (itemId?: string, startDate?: string, endDate?: string) => 
    ['stock_movement', itemId, startDate, endDate] as const,
  slowMoving: (days: number) => ['slow_moving_stock', days] as const,
  deadStock: (days: number) => ['dead_stock', days] as const,
  usageTrends: (period: string) => ['usage_trends', period] as const,
  costByCategory: ['cost_by_category'] as const,
  turnoverRate: ['turnover_rate'] as const,
};

// ============ INVENTORY VALUATION ============

export interface InventoryValuationItem {
  id: string;
  name: string;
  sku: string | null;
  categories: ItemCategory[];
  quantity_on_hand: number;
  unit_price: number;
  total_value: number;
  warehouse: string | null;
  supplier_name: string | null;
}

export interface InventoryValuationSummary {
  totalItems: number;
  totalQuantity: number;
  totalValue: number;
  averageItemValue: number;
  itemsByCategory: Record<string, { count: number; value: number }>;
  itemsByWarehouse: Record<string, { count: number; value: number }>;
  topValueItems: InventoryValuationItem[];
}

export function useInventoryValuation() {
  return useQuery({
    queryKey: inventoryReportKeys.valuation,
    queryFn: async (): Promise<InventoryValuationSummary> => {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*, supplier:suppliers(name)')
        .order('quantity_on_hand', { ascending: false });

      if (error) throw new Error(error.message);

      const items: InventoryValuationItem[] = (data || []).map(item => ({
        id: item.id,
        name: item.name || 'Unknown',
        sku: item.sku,
        categories: item.categories || [],
        quantity_on_hand: item.quantity_on_hand ?? 0,
        unit_price: item.unit_price ?? 0,
        total_value: (item.quantity_on_hand ?? 0) * (item.unit_price ?? 0),
        warehouse: item.warehouse,
        supplier_name: (item.supplier as any)?.name || null,
      }));

      const totalItems = items.length;
      const totalQuantity = items.reduce((sum, i) => sum + i.quantity_on_hand, 0);
      const totalValue = items.reduce((sum, i) => sum + i.total_value, 0);
      const averageItemValue = totalItems > 0 ? totalValue / totalItems : 0;

      // Group by category
      const itemsByCategory: Record<string, { count: number; value: number }> = {};
      items.forEach(item => {
        const cats = item.categories.length > 0 ? item.categories : ['uncategorized' as ItemCategory];
        cats.forEach(cat => {
          if (!itemsByCategory[cat]) {
            itemsByCategory[cat] = { count: 0, value: 0 };
          }
          itemsByCategory[cat].count++;
          itemsByCategory[cat].value += item.total_value;
        });
      });

      // Group by warehouse
      const itemsByWarehouse: Record<string, { count: number; value: number }> = {};
      items.forEach(item => {
        const wh = item.warehouse || 'Unassigned';
        if (!itemsByWarehouse[wh]) {
          itemsByWarehouse[wh] = { count: 0, value: 0 };
        }
        itemsByWarehouse[wh].count++;
        itemsByWarehouse[wh].value += item.total_value;
      });

      // Top value items
      const topValueItems = [...items]
        .sort((a, b) => b.total_value - a.total_value)
        .slice(0, 10);

      return {
        totalItems,
        totalQuantity,
        totalValue,
        averageItemValue,
        itemsByCategory,
        itemsByWarehouse,
        topValueItems,
      };
    },
  });
}

// ============ STOCK MOVEMENT HISTORY ============

export interface StockMovementRecord {
  id: string;
  inventory_item_id: string;
  item_name: string;
  item_sku: string | null;
  quantity_delta: number;
  quantity_before: number;
  quantity_after: number;
  reason: string;
  notes: string | null;
  created_at: string;
  created_by_name: string | null;
}

export interface StockMovementSummary {
  records: StockMovementRecord[];
  totalIn: number;
  totalOut: number;
  netChange: number;
  byReason: Record<string, { count: number; quantity: number }>;
}

export function useStockMovementHistory(
  inventoryItemId?: string,
  startDate?: string,
  endDate?: string,
  limit: number = 100
) {
  return useQuery({
    queryKey: inventoryReportKeys.stockMovement(inventoryItemId, startDate, endDate),
    queryFn: async (): Promise<StockMovementSummary> => {
      let query = supabase
        .from('stock_adjustments')
        .select(`
          *,
          inventory_items(name, sku),
          profiles:created_by(first_name, last_name)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (inventoryItemId) {
        query = query.eq('inventory_item_id', inventoryItemId);
      }
      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);

      const records: StockMovementRecord[] = (data || []).map(adj => ({
        id: adj.id,
        inventory_item_id: adj.inventory_item_id,
        item_name: (adj.inventory_items as any)?.name || 'Unknown',
        item_sku: (adj.inventory_items as any)?.sku || null,
        quantity_delta: adj.quantity_delta,
        quantity_before: adj.quantity_before,
        quantity_after: adj.quantity_after,
        reason: adj.reason,
        notes: adj.notes,
        created_at: adj.created_at,
        created_by_name: (adj.profiles as any)
          ? `${(adj.profiles as any).first_name || ''} ${(adj.profiles as any).last_name || ''}`.trim()
          : null,
      }));

      const totalIn = records
        .filter(r => r.quantity_delta > 0)
        .reduce((sum, r) => sum + r.quantity_delta, 0);
      
      const totalOut = records
        .filter(r => r.quantity_delta < 0)
        .reduce((sum, r) => sum + Math.abs(r.quantity_delta), 0);

      const netChange = totalIn - totalOut;

      // Group by reason
      const byReason: Record<string, { count: number; quantity: number }> = {};
      records.forEach(r => {
        if (!byReason[r.reason]) {
          byReason[r.reason] = { count: 0, quantity: 0 };
        }
        byReason[r.reason].count++;
        byReason[r.reason].quantity += r.quantity_delta;
      });

      return { records, totalIn, totalOut, netChange, byReason };
    },
  });
}


// ============ SLOW-MOVING & DEAD STOCK ============

export interface SlowMovingItem {
  id: string;
  name: string;
  sku: string | null;
  quantity_on_hand: number;
  unit_price: number;
  total_value: number;
  last_movement_date: string | null;
  days_since_movement: number;
  warehouse: string | null;
  categories: ItemCategory[];
}

export function useSlowMovingStock(daysThreshold: number = 90) {
  return useQuery({
    queryKey: inventoryReportKeys.slowMoving(daysThreshold),
    queryFn: async (): Promise<SlowMovingItem[]> => {
      // Get all inventory items
      const { data: items, error: itemsError } = await supabase
        .from('inventory_items')
        .select('*')
        .gt('quantity_on_hand', 0);

      if (itemsError) throw new Error(itemsError.message);

      // Get last movement date for each item
      const { data: movements, error: movementsError } = await supabase
        .from('stock_adjustments')
        .select('inventory_item_id, created_at')
        .order('created_at', { ascending: false });

      if (movementsError) throw new Error(movementsError.message);

      // Build map of last movement dates
      const lastMovementMap: Record<string, string> = {};
      (movements || []).forEach(m => {
        if (!lastMovementMap[m.inventory_item_id]) {
          lastMovementMap[m.inventory_item_id] = m.created_at;
        }
      });

      const now = dayjs();
      const thresholdDate = now.subtract(daysThreshold, 'day');

      const slowMovingItems: SlowMovingItem[] = (items || [])
        .map(item => {
          const lastMovement = lastMovementMap[item.id];
          const lastMovementDate = lastMovement ? dayjs(lastMovement) : null;
          const daysSinceMovement = lastMovementDate 
            ? now.diff(lastMovementDate, 'day')
            : 999; // No movement ever

          return {
            id: item.id,
            name: item.name || 'Unknown',
            sku: item.sku,
            quantity_on_hand: item.quantity_on_hand ?? 0,
            unit_price: item.unit_price ?? 0,
            total_value: (item.quantity_on_hand ?? 0) * (item.unit_price ?? 0),
            last_movement_date: lastMovement || null,
            days_since_movement: daysSinceMovement,
            warehouse: item.warehouse,
            categories: item.categories || [],
          };
        })
        .filter(item => item.days_since_movement >= daysThreshold)
        .sort((a, b) => b.days_since_movement - a.days_since_movement);

      return slowMovingItems;
    },
  });
}

export function useDeadStock(daysThreshold: number = 180) {
  return useQuery({
    queryKey: inventoryReportKeys.deadStock(daysThreshold),
    queryFn: async (): Promise<SlowMovingItem[]> => {
      // Get all inventory items with stock
      const { data: items, error: itemsError } = await supabase
        .from('inventory_items')
        .select('*')
        .gt('quantity_on_hand', 0);

      if (itemsError) throw new Error(itemsError.message);

      // Get last movement date for each item
      const { data: movements, error: movementsError } = await supabase
        .from('stock_adjustments')
        .select('inventory_item_id, created_at')
        .order('created_at', { ascending: false });

      if (movementsError) throw new Error(movementsError.message);

      // Build map of last movement dates
      const lastMovementMap: Record<string, string> = {};
      (movements || []).forEach(m => {
        if (!lastMovementMap[m.inventory_item_id]) {
          lastMovementMap[m.inventory_item_id] = m.created_at;
        }
      });

      const now = dayjs();

      const deadStockItems: SlowMovingItem[] = (items || [])
        .map(item => {
          const lastMovement = lastMovementMap[item.id];
          const lastMovementDate = lastMovement ? dayjs(lastMovement) : null;
          const daysSinceMovement = lastMovementDate 
            ? now.diff(lastMovementDate, 'day')
            : 999;

          return {
            id: item.id,
            name: item.name || 'Unknown',
            sku: item.sku,
            quantity_on_hand: item.quantity_on_hand ?? 0,
            unit_price: item.unit_price ?? 0,
            total_value: (item.quantity_on_hand ?? 0) * (item.unit_price ?? 0),
            last_movement_date: lastMovement || null,
            days_since_movement: daysSinceMovement,
            warehouse: item.warehouse,
            categories: item.categories || [],
          };
        })
        .filter(item => item.days_since_movement >= daysThreshold)
        .sort((a, b) => b.total_value - a.total_value);

      return deadStockItems;
    },
  });
}

// ============ USAGE TRENDS & FORECASTING ============

export interface UsageTrendData {
  period: string;
  totalUsed: number;
  totalReceived: number;
  netChange: number;
  transactionCount: number;
}

export interface UsageTrendSummary {
  trends: UsageTrendData[];
  averageMonthlyUsage: number;
  averageMonthlyReceived: number;
  projectedNextMonth: number;
  growthRate: number; // percentage
}

export function useUsageTrends(periodType: 'daily' | 'weekly' | 'monthly' = 'monthly', periods: number = 12) {
  return useQuery({
    queryKey: inventoryReportKeys.usageTrends(`${periodType}-${periods}`),
    queryFn: async (): Promise<UsageTrendSummary> => {
      const now = dayjs();
      let startDate: string;
      
      switch (periodType) {
        case 'daily':
          startDate = now.subtract(periods, 'day').toISOString();
          break;
        case 'weekly':
          startDate = now.subtract(periods, 'week').toISOString();
          break;
        case 'monthly':
        default:
          startDate = now.subtract(periods, 'month').toISOString();
          break;
      }

      const { data, error } = await supabase
        .from('stock_adjustments')
        .select('quantity_delta, reason, created_at')
        .gte('created_at', startDate)
        .order('created_at', { ascending: true });

      if (error) throw new Error(error.message);

      // Group by period
      const periodMap: Record<string, UsageTrendData> = {};
      
      (data || []).forEach(adj => {
        let periodKey: string;
        const date = dayjs(adj.created_at);
        
        switch (periodType) {
          case 'daily':
            periodKey = date.format('YYYY-MM-DD');
            break;
          case 'weekly':
            periodKey = date.startOf('week').format('YYYY-MM-DD');
            break;
          case 'monthly':
          default:
            periodKey = date.format('YYYY-MM');
            break;
        }

        if (!periodMap[periodKey]) {
          periodMap[periodKey] = {
            period: periodKey,
            totalUsed: 0,
            totalReceived: 0,
            netChange: 0,
            transactionCount: 0,
          };
        }

        periodMap[periodKey].transactionCount++;
        
        if (adj.quantity_delta < 0) {
          periodMap[periodKey].totalUsed += Math.abs(adj.quantity_delta);
        } else {
          periodMap[periodKey].totalReceived += adj.quantity_delta;
        }
        
        periodMap[periodKey].netChange += adj.quantity_delta;
      });

      const trends = Object.values(periodMap).sort((a, b) => a.period.localeCompare(b.period));

      // Calculate averages and projections
      const usageValues = trends.map(t => t.totalUsed);
      const receivedValues = trends.map(t => t.totalReceived);
      
      const averageMonthlyUsage = usageValues.length > 0 
        ? usageValues.reduce((a, b) => a + b, 0) / usageValues.length 
        : 0;
      
      const averageMonthlyReceived = receivedValues.length > 0 
        ? receivedValues.reduce((a, b) => a + b, 0) / receivedValues.length 
        : 0;

      // Simple linear projection based on recent trend
      let projectedNextMonth = averageMonthlyUsage;
      let growthRate = 0;
      
      if (trends.length >= 2) {
        const recentTrends = trends.slice(-3);
        const recentAvg = recentTrends.reduce((sum, t) => sum + t.totalUsed, 0) / recentTrends.length;
        const olderTrends = trends.slice(0, Math.max(1, trends.length - 3));
        const olderAvg = olderTrends.reduce((sum, t) => sum + t.totalUsed, 0) / olderTrends.length;
        
        if (olderAvg > 0) {
          growthRate = ((recentAvg - olderAvg) / olderAvg) * 100;
          projectedNextMonth = recentAvg * (1 + growthRate / 100);
        }
      }

      return {
        trends,
        averageMonthlyUsage,
        averageMonthlyReceived,
        projectedNextMonth: Math.max(0, projectedNextMonth),
        growthRate,
      };
    },
  });
}

// ============ COST ANALYSIS BY CATEGORY ============

export interface CategoryCostData {
  category: string;
  itemCount: number;
  totalQuantity: number;
  totalValue: number;
  averageUnitCost: number;
  percentageOfTotal: number;
}

export interface CostAnalysisSummary {
  byCategory: CategoryCostData[];
  bySupplier: Array<{
    supplier_id: string | null;
    supplier_name: string;
    itemCount: number;
    totalValue: number;
    percentageOfTotal: number;
  }>;
  totalInventoryValue: number;
  averageItemCost: number;
  highestValueCategory: string;
  lowestValueCategory: string;
}

export function useCostAnalysis() {
  return useQuery({
    queryKey: inventoryReportKeys.costByCategory,
    queryFn: async (): Promise<CostAnalysisSummary> => {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*, supplier:suppliers(id, name)');

      if (error) throw new Error(error.message);

      const items = data || [];
      const totalInventoryValue = items.reduce(
        (sum, i) => sum + ((i.quantity_on_hand ?? 0) * (i.unit_price ?? 0)), 
        0
      );

      // Group by category
      const categoryMap: Record<string, CategoryCostData> = {};
      
      items.forEach(item => {
        const cats = (item.categories || []).length > 0 ? item.categories : ['uncategorized'];
        const itemValue = (item.quantity_on_hand ?? 0) * (item.unit_price ?? 0);
        
        cats.forEach((cat: string) => {
          if (!categoryMap[cat]) {
            categoryMap[cat] = {
              category: cat,
              itemCount: 0,
              totalQuantity: 0,
              totalValue: 0,
              averageUnitCost: 0,
              percentageOfTotal: 0,
            };
          }
          categoryMap[cat].itemCount++;
          categoryMap[cat].totalQuantity += item.quantity_on_hand ?? 0;
          categoryMap[cat].totalValue += itemValue;
        });
      });

      // Calculate percentages and averages
      Object.values(categoryMap).forEach(cat => {
        cat.percentageOfTotal = totalInventoryValue > 0 
          ? (cat.totalValue / totalInventoryValue) * 100 
          : 0;
        cat.averageUnitCost = cat.totalQuantity > 0 
          ? cat.totalValue / cat.totalQuantity 
          : 0;
      });

      const byCategory = Object.values(categoryMap)
        .sort((a, b) => b.totalValue - a.totalValue);

      // Group by supplier
      const supplierMap: Record<string, {
        supplier_id: string | null;
        supplier_name: string;
        itemCount: number;
        totalValue: number;
      }> = {};

      items.forEach(item => {
        const supplierId = item.supplier_id || 'none';
        const supplierName = (item.supplier as any)?.name || 'No Supplier';
        const itemValue = (item.quantity_on_hand ?? 0) * (item.unit_price ?? 0);

        if (!supplierMap[supplierId]) {
          supplierMap[supplierId] = {
            supplier_id: item.supplier_id,
            supplier_name: supplierName,
            itemCount: 0,
            totalValue: 0,
          };
        }
        supplierMap[supplierId].itemCount++;
        supplierMap[supplierId].totalValue += itemValue;
      });

      const bySupplier = Object.values(supplierMap)
        .map(s => ({
          ...s,
          percentageOfTotal: totalInventoryValue > 0 
            ? (s.totalValue / totalInventoryValue) * 100 
            : 0,
        }))
        .sort((a, b) => b.totalValue - a.totalValue);

      const averageItemCost = items.length > 0 ? totalInventoryValue / items.length : 0;
      const highestValueCategory = byCategory[0]?.category || 'N/A';
      const lowestValueCategory = byCategory[byCategory.length - 1]?.category || 'N/A';

      return {
        byCategory,
        bySupplier,
        totalInventoryValue,
        averageItemCost,
        highestValueCategory,
        lowestValueCategory,
      };
    },
  });
}

// ============ INVENTORY TURNOVER RATE ============

export interface TurnoverData {
  inventory_item_id: string;
  item_name: string;
  item_sku: string | null;
  average_inventory: number;
  total_sold: number;
  turnover_rate: number;
  days_to_sell: number;
}

export function useInventoryTurnover(months: number = 12) {
  return useQuery({
    queryKey: [...inventoryReportKeys.turnoverRate, months],
    queryFn: async (): Promise<TurnoverData[]> => {
      const startDate = dayjs().subtract(months, 'month').toISOString();

      // Get current inventory
      const { data: items, error: itemsError } = await supabase
        .from('inventory_items')
        .select('id, name, sku, quantity_on_hand');

      if (itemsError) throw new Error(itemsError.message);

      // Get outgoing movements (sales/usage)
      const { data: movements, error: movementsError } = await supabase
        .from('stock_adjustments')
        .select('inventory_item_id, quantity_delta')
        .lt('quantity_delta', 0)
        .gte('created_at', startDate);

      if (movementsError) throw new Error(movementsError.message);

      // Calculate total sold per item
      const soldMap: Record<string, number> = {};
      (movements || []).forEach(m => {
        if (!soldMap[m.inventory_item_id]) {
          soldMap[m.inventory_item_id] = 0;
        }
        soldMap[m.inventory_item_id] += Math.abs(m.quantity_delta);
      });

      const turnoverData: TurnoverData[] = (items || []).map(item => {
        const totalSold = soldMap[item.id] || 0;
        const currentQty = item.quantity_on_hand ?? 0;
        // Estimate average inventory as current + half of what was sold
        const averageInventory = currentQty + (totalSold / 2);
        const turnoverRate = averageInventory > 0 ? totalSold / averageInventory : 0;
        const daysToSell = turnoverRate > 0 ? (365 * months / 12) / turnoverRate : 999;

        return {
          inventory_item_id: item.id,
          item_name: item.name || 'Unknown',
          item_sku: item.sku,
          average_inventory: averageInventory,
          total_sold: totalSold,
          turnover_rate: turnoverRate,
          days_to_sell: Math.min(daysToSell, 999),
        };
      }).sort((a, b) => b.turnover_rate - a.turnover_rate);

      return turnoverData;
    },
  });
}
