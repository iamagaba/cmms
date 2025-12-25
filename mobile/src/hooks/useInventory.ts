import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { inventoryService } from '../services/inventoryService';
import { MobileInventoryItem, PartUsage, InventoryFilter, StockValidation } from '../types';

// Query keys for inventory operations
export const inventoryKeys = {
  all: ['inventory'] as const,
  lists: () => [...inventoryKeys.all, 'list'] as const,
  list: (filter: InventoryFilter) => [...inventoryKeys.lists(), filter] as const,
  details: () => [...inventoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...inventoryKeys.details(), id] as const,
  search: (sku: string) => [...inventoryKeys.all, 'search', sku] as const,
  lowStock: () => [...inventoryKeys.all, 'lowStock'] as const,
  workOrderParts: (workOrderId: string) => [...inventoryKeys.all, 'workOrderParts', workOrderId] as const,
  stockValidation: (itemId: string, quantity: number) => [...inventoryKeys.all, 'stockValidation', itemId, quantity] as const,
};

/**
 * Hook to fetch inventory items with filtering and pagination
 */
export function useInventoryItems(filter: InventoryFilter = {}, limit: number = 20) {
  return useInfiniteQuery({
    queryKey: inventoryKeys.list(filter),
    queryFn: ({ pageParam = 1 }) => inventoryService.getInventoryItems(filter, pageParam, limit),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch a specific inventory item
 */
export function useInventoryItem(id: string) {
  return useQuery({
    queryKey: inventoryKeys.detail(id),
    queryFn: () => inventoryService.getInventoryItem(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to search inventory by SKU
 */
export function useInventorySearch(sku: string) {
  return useQuery({
    queryKey: inventoryKeys.search(sku),
    queryFn: () => inventoryService.searchBySku(sku),
    enabled: !!sku && sku.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to fetch low stock items
 */
export function useLowStockItems() {
  return useQuery({
    queryKey: inventoryKeys.lowStock(),
    queryFn: () => inventoryService.getLowStockItems(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to validate stock availability
 */
export function useStockValidation(itemId: string, quantity: number) {
  return useQuery({
    queryKey: inventoryKeys.stockValidation(itemId, quantity),
    queryFn: () => inventoryService.validateStock(itemId, quantity),
    enabled: !!itemId && quantity > 0,
    staleTime: 30 * 1000, // 30 seconds (short stale time for real-time validation)
  });
}

/**
 * Hook to fetch work order parts
 */
export function useWorkOrderParts(workOrderId: string) {
  return useQuery({
    queryKey: inventoryKeys.workOrderParts(workOrderId),
    queryFn: () => inventoryService.getWorkOrderParts(workOrderId),
    enabled: !!workOrderId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to record part usage
 */
export function useRecordPartUsage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (usage: Omit<PartUsage, 'id' | 'created_at'>) => 
      inventoryService.recordPartUsage(usage),
    onSuccess: (data, variables) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: inventoryKeys.workOrderParts(variables.work_order_id) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.detail(variables.item_id) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lowStock() });
      
      // Update the specific inventory item in cache
      queryClient.setQueryData(
        inventoryKeys.detail(variables.item_id),
        (oldData: MobileInventoryItem | undefined) => {
          if (oldData) {
            const newQuantity = oldData.quantity_on_hand - variables.quantity_used;
            return {
              ...oldData,
              quantity_on_hand: newQuantity,
              isLowStock: newQuantity <= oldData.reorder_level,
              lastSyncTimestamp: new Date().toISOString(),
            };
          }
          return oldData;
        }
      );
    },
    onError: (error) => {
      console.error('Failed to record part usage:', error);
    },
  });
}

/**
 * Hook to update inventory quantity
 */
export function useUpdateInventoryQuantity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, newQuantity, reason }: { 
      itemId: string; 
      newQuantity: number; 
      reason?: string; 
    }) => inventoryService.updateInventoryQuantity(itemId, newQuantity, reason),
    onSuccess: (data, variables) => {
      // Update the specific inventory item in cache
      queryClient.setQueryData(inventoryKeys.detail(variables.itemId), data);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lowStock() });
    },
    onError: (error) => {
      console.error('Failed to update inventory quantity:', error);
    },
  });
}

/**
 * Custom hook for inventory search with debouncing
 */
export function useInventorySearchWithDebounce(searchTerm: string, debounceMs: number = 300) {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = React.useState(searchTerm);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchTerm, debounceMs]);

  return useInventoryItems({ searchTerm: debouncedSearchTerm });
}

/**
 * Hook to get inventory statistics
 */
export function useInventoryStats() {
  const { data: lowStockItems } = useLowStockItems();
  const { data: allItems } = useInventoryItems({}, 1000); // Get a large number for stats

  return React.useMemo(() => {
    const totalItems = allItems?.pages?.[0]?.totalCount || 0;
    const lowStockCount = lowStockItems?.length || 0;
    const totalValue = allItems?.pages?.reduce((acc, page) => {
      return acc + page.items.reduce((pageAcc, item) => {
        return pageAcc + (item.quantity_on_hand * item.unit_price);
      }, 0);
    }, 0) || 0;

    return {
      totalItems,
      lowStockCount,
      totalValue,
      lowStockPercentage: totalItems > 0 ? (lowStockCount / totalItems) * 100 : 0,
    };
  }, [allItems, lowStockItems]);
}

// Re-export React for the debounce hook
import React from 'react';