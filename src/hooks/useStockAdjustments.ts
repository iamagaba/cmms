import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  StockAdjustment, 
  BatchAdjustmentInput, 
  InventoryItem,
  AdjustmentReason 
} from '@/types/supabase';
import { showSuccess, showError } from '@/utils/toast';

// Query keys
export const stockAdjustmentKeys = {
  all: ['stock_adjustments'] as const,
  byItem: (itemId: string) => ['stock_adjustments', 'item', itemId] as const,
  filtered: (filters: AdjustmentHistoryFilters) => ['stock_adjustments', 'filtered', filters] as const,
};

export interface AdjustmentHistoryFilters {
  dateFrom?: string;
  dateTo?: string;
  reason?: AdjustmentReason;
  inventoryItemId?: string;
}

/**
 * Fetch adjustment history for a specific inventory item
 */
export function useItemAdjustmentHistory(itemId: string | undefined) {
  return useQuery({
    queryKey: stockAdjustmentKeys.byItem(itemId || ''),
    queryFn: async () => {
      if (!itemId) return [];
      
      const { data, error } = await supabase
        .from('stock_adjustments')
        .select(`
          *,
          inventory_items (id, name, sku),
          profiles:created_by (first_name, last_name)
        `)
        .eq('inventory_item_id', itemId)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return (data || []) as StockAdjustment[];
    },
    enabled: !!itemId,
  });
}

/**
 * Fetch global adjustment history with optional filters
 */
export function useAdjustmentHistory(filters: AdjustmentHistoryFilters = {}) {
  return useQuery({
    queryKey: stockAdjustmentKeys.filtered(filters),
    queryFn: async () => {
      let query = supabase
        .from('stock_adjustments')
        .select(`
          *,
          inventory_items (id, name, sku),
          profiles:created_by (first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (filters.inventoryItemId) {
        query = query.eq('inventory_item_id', filters.inventoryItemId);
      }

      if (filters.reason) {
        query = query.eq('reason', filters.reason);
      }

      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }

      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      const { data, error } = await query.limit(100);

      if (error) throw new Error(error.message);
      return (data || []) as StockAdjustment[];
    },
  });
}

/**
 * Create a batch stock adjustment
 */
export function useBatchAdjustment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: BatchAdjustmentInput) => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      // Fetch current quantities for all items
      const itemIds = input.items.map(i => i.inventory_item_id);
      const { data: currentItems, error: fetchError } = await supabase
        .from('inventory_items')
        .select('id, quantity_on_hand')
        .in('id', itemIds);

      if (fetchError) throw new Error(fetchError.message);
      if (!currentItems || currentItems.length !== itemIds.length) {
        throw new Error('Some inventory items were not found');
      }

      // Create a map of current quantities
      const quantityMap = new Map(
        currentItems.map(item => [item.id, item.quantity_on_hand])
      );

      // Validate all adjustments won't result in negative quantities
      for (const item of input.items) {
        const currentQty = quantityMap.get(item.inventory_item_id) ?? 0;
        const newQty = currentQty + item.quantity_delta;
        if (newQty < 0) {
          throw new Error(
            `Adjustment would result in negative quantity for item. Current: ${currentQty}, Delta: ${item.quantity_delta}`
          );
        }
      }

      // Prepare adjustment records
      const adjustmentRecords = input.items.map(item => {
        const quantityBefore = quantityMap.get(item.inventory_item_id) ?? 0;
        return {
          inventory_item_id: item.inventory_item_id,
          quantity_delta: item.quantity_delta,
          quantity_before: quantityBefore,
          quantity_after: quantityBefore + item.quantity_delta,
          reason: input.reason,
          notes: input.notes || null,
          created_by: user?.id || null,
        };
      });

      // Insert adjustment records
      const { data: adjustments, error: insertError } = await supabase
        .from('stock_adjustments')
        .insert(adjustmentRecords)
        .select();

      if (insertError) throw new Error(insertError.message);

      // Update inventory quantities
      for (const item of input.items) {
        const currentQty = quantityMap.get(item.inventory_item_id) ?? 0;
        const newQty = currentQty + item.quantity_delta;

        const { error: updateError } = await supabase
          .from('inventory_items')
          .update({ quantity_on_hand: newQty })
          .eq('id', item.inventory_item_id);

        if (updateError) throw new Error(updateError.message);
      }

      return adjustments as StockAdjustment[];
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['inventory_items'] });
      queryClient.invalidateQueries({ queryKey: stockAdjustmentKeys.all });
      
      // Invalidate specific item histories
      data.forEach(adj => {
        if (adj.inventory_item_id) {
          queryClient.invalidateQueries({ 
            queryKey: stockAdjustmentKeys.byItem(adj.inventory_item_id) 
          });
        }
      });

      const itemCount = data.length;
      showSuccess(`Successfully adjusted ${itemCount} item${itemCount > 1 ? 's' : ''}`);
    },
    onError: (error) => {
      console.error('Batch adjustment error:', error);
      showError(error.message || 'Failed to save adjustment');
    },
  });
}

/**
 * Quick single-item adjustment (convenience wrapper)
 */
export function useQuickAdjustment() {
  const batchMutation = useBatchAdjustment();

  return {
    ...batchMutation,
    mutate: (
      item: InventoryItem,
      quantityDelta: number,
      reason: AdjustmentReason,
      notes?: string
    ) => {
      batchMutation.mutate({
        items: [{ inventory_item_id: item.id, quantity_delta: quantityDelta }],
        reason,
        notes,
      });
    },
    mutateAsync: async (
      item: InventoryItem,
      quantityDelta: number,
      reason: AdjustmentReason,
      notes?: string
    ) => {
      return batchMutation.mutateAsync({
        items: [{ inventory_item_id: item.id, quantity_delta: quantityDelta }],
        reason,
        notes,
      });
    },
  };
}
