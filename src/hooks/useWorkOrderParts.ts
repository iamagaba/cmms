import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  WorkOrderPart,
  PartReservation,
  PartsUsageAnalytics,
  ReservationStatus
} from '@/types/supabase';
import { showSuccess, showError } from '@/utils/toast';

// Query keys
export const workOrderPartsKeys = {
  parts: (workOrderId: string) => ['work_order_parts', workOrderId] as const,
  allParts: ['work_order_parts'] as const,
  reservations: (workOrderId: string) => ['part_reservations', workOrderId] as const,
  allReservations: ['part_reservations'] as const,
  itemReservations: (itemId: string) => ['part_reservations', 'item', itemId] as const,
  analytics: ['parts_usage_analytics'] as const,
  analyticsForItem: (itemId: string) => ['parts_usage_analytics', 'item', itemId] as const,
  analyticsForVehicle: (vehicleId: string) => ['parts_usage_analytics', 'vehicle', vehicleId] as const,
};

// ============ WORK ORDER PARTS ============

export function useWorkOrderParts(workOrderId: string | undefined) {
  return useQuery({
    queryKey: workOrderPartsKeys.parts(workOrderId || ''),
    queryFn: async () => {
      if (!workOrderId) return [];

      const { data, error } = await supabase
        .from('work_order_parts')
        .select(`
          *,
          inventory_items(*),
          profiles:added_by(first_name, last_name)
        `)
        .eq('work_order_id', workOrderId)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return (data || []) as WorkOrderPart[];
    },
    enabled: !!workOrderId,
  });
}

export function usePartsForInventoryItem(inventoryItemId: string | undefined) {
  return useQuery({
    queryKey: ['work_order_parts', 'inventory_item', inventoryItemId],
    queryFn: async () => {
      if (!inventoryItemId) return [];

      const { data, error } = await supabase
        .from('work_order_parts')
        .select(`
          *,
          work_orders(id, work_order_number, title, status, vehicle_id)
        `)
        .eq('inventory_item_id', inventoryItemId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw new Error(error.message);
      return (data || []) as WorkOrderPart[];
    },
    enabled: !!inventoryItemId,
  });
}

export interface AddPartToWorkOrderInput {
  work_order_id: string;
  inventory_item_id: string;
  quantity: number;
  notes?: string;
}

export function useAddPartToWorkOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddPartToWorkOrderInput) => {
      const { data: { user } } = await supabase.auth.getUser();

      // Call the database function that handles auto-deduction
      const { data, error } = await supabase.rpc('add_part_to_work_order', {
        p_work_order_id: input.work_order_id,
        p_inventory_item_id: input.inventory_item_id,
        p_quantity: input.quantity,
        p_notes: input.notes || null,
        p_user_id: user?.id || null,
      });

      if (error) throw new Error(error.message);
      return data as string; // Returns the new part ID
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: workOrderPartsKeys.parts(variables.work_order_id) });
      queryClient.invalidateQueries({ queryKey: ['inventory_items'] });
      queryClient.invalidateQueries({ queryKey: ['stock_adjustments'] });
      showSuccess('Part added to work order');
    },
    onError: (error) => {
      console.error('Add part error:', error);
      showError(error.message || 'Failed to add part');
    },
  });
}

export function useRemovePartFromWorkOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ partId, workOrderId }: { partId: string; workOrderId: string }) => {
      // Get the part details first to restore inventory
      const { data: part, error: fetchError } = await supabase
        .from('work_order_parts')
        .select('*')
        .eq('id', partId)
        .single();

      if (fetchError) throw new Error(fetchError.message);

      const { data: { user } } = await supabase.auth.getUser();

      // Get current inventory quantity
      const { data: invItem } = await supabase
        .from('inventory_items')
        .select('quantity_on_hand')
        .eq('id', part.inventory_item_id)
        .single();

      const currentQty = invItem?.quantity_on_hand ?? 0;
      const newQty = currentQty + part.quantity_used;

      // Restore inventory
      await supabase
        .from('inventory_items')
        .update({ quantity_on_hand: newQty })
        .eq('id', part.inventory_item_id);

      // Create adjustment record
      await supabase.from('stock_adjustments').insert({
        inventory_item_id: part.inventory_item_id,
        quantity_delta: part.quantity_used,
        quantity_before: currentQty,
        quantity_after: newQty,
        reason: 'returned',
        notes: 'Removed from work order',
        created_by: user?.id || null,
      });

      // Delete the work order part
      const { error: deleteError } = await supabase
        .from('work_order_parts')
        .delete()
        .eq('id', partId);

      if (deleteError) throw new Error(deleteError.message);

      return { workOrderId };
    },
    onMutate: async ({ partId, workOrderId }) => {
      await queryClient.cancelQueries({ queryKey: workOrderPartsKeys.parts(workOrderId) });
      const previousParts = queryClient.getQueryData(workOrderPartsKeys.parts(workOrderId));
      queryClient.setQueryData(workOrderPartsKeys.parts(workOrderId), (old: any[]) => {
        return (old || []).filter((part: any) => part.id !== partId);
      });
      return { previousParts };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(
        workOrderPartsKeys.parts(newTodo.workOrderId),
        context?.previousParts
      );
      console.error('Remove part error:', err);
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: workOrderPartsKeys.parts(variables.workOrderId) });
      queryClient.invalidateQueries({ queryKey: ['inventory_items'] });
      queryClient.invalidateQueries({ queryKey: ['stock_adjustments'] });
      if (!error) {
        showSuccess('Part removed and inventory restored');
      }
    },

  });
}


// ============ PART RESERVATIONS ============

export function usePartReservations(workOrderId: string | undefined) {
  return useQuery({
    queryKey: workOrderPartsKeys.reservations(workOrderId || ''),
    queryFn: async () => {
      if (!workOrderId) return [];

      const { data, error } = await supabase
        .from('part_reservations')
        .select(`
          *,
          inventory_items(*),
          profiles:reserved_by(first_name, last_name)
        `)
        .eq('work_order_id', workOrderId)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return (data || []) as PartReservation[];
    },
    enabled: !!workOrderId,
  });
}

export function useReservationsForInventoryItem(inventoryItemId: string | undefined) {
  return useQuery({
    queryKey: workOrderPartsKeys.itemReservations(inventoryItemId || ''),
    queryFn: async () => {
      if (!inventoryItemId) return [];

      const { data, error } = await supabase
        .from('part_reservations')
        .select(`
          *,
          work_orders(id, work_order_number, title, status)
        `)
        .eq('inventory_item_id', inventoryItemId)
        .in('status', ['pending', 'confirmed'])
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return (data || []) as PartReservation[];
    },
    enabled: !!inventoryItemId,
  });
}

export function useAllActiveReservations() {
  return useQuery({
    queryKey: [...workOrderPartsKeys.allReservations, 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('part_reservations')
        .select(`
          *,
          inventory_items(id, name, sku, quantity_on_hand),
          work_orders(id, work_order_number, title, status)
        `)
        .in('status', ['pending', 'confirmed'])
        .order('expires_at', { ascending: true });

      if (error) throw new Error(error.message);
      return (data || []) as PartReservation[];
    },
  });
}

export interface ReservePartInput {
  work_order_id: string;
  inventory_item_id: string;
  quantity: number;
  expires_at?: string;
  notes?: string;
}

export function useReservePart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ReservePartInput) => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase.rpc('reserve_part_for_work_order', {
        p_work_order_id: input.work_order_id,
        p_inventory_item_id: input.inventory_item_id,
        p_quantity: input.quantity,
        p_expires_at: input.expires_at || null,
        p_notes: input.notes || null,
        p_user_id: user?.id || null,
      });

      if (error) throw new Error(error.message);
      return data as string; // Returns the reservation ID
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: workOrderPartsKeys.reservations(variables.work_order_id) });
      queryClient.invalidateQueries({ queryKey: workOrderPartsKeys.itemReservations(variables.inventory_item_id) });
      queryClient.invalidateQueries({ queryKey: workOrderPartsKeys.allReservations });
      showSuccess('Part reserved successfully');
    },
    onError: (error) => {
      console.error('Reserve part error:', error);
      showError(error.message || 'Failed to reserve part');
    },
  });
}

export function useFulfillReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reservationId: string) => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase.rpc('fulfill_part_reservation', {
        p_reservation_id: reservationId,
        p_user_id: user?.id || null,
      });

      if (error) throw new Error(error.message);
      return data as string; // Returns the new part ID
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workOrderPartsKeys.allReservations });
      queryClient.invalidateQueries({ queryKey: workOrderPartsKeys.allParts });
      queryClient.invalidateQueries({ queryKey: ['inventory_items'] });
      queryClient.invalidateQueries({ queryKey: ['stock_adjustments'] });
      showSuccess('Reservation fulfilled - part added to work order');
    },
    onError: (error) => {
      console.error('Fulfill reservation error:', error);
      showError(error.message || 'Failed to fulfill reservation');
    },
  });
}

export function useCancelReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reservationId, reason }: { reservationId: string; reason?: string }) => {
      const { data, error } = await supabase.rpc('cancel_part_reservation', {
        p_reservation_id: reservationId,
        p_reason: reason || null,
      });

      if (error) throw new Error(error.message);
      return data as boolean;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workOrderPartsKeys.allReservations });
      showSuccess('Reservation cancelled');
    },
    onError: (error) => {
      console.error('Cancel reservation error:', error);
      showError(error.message || 'Failed to cancel reservation');
    },
  });
}

// ============ AVAILABLE QUANTITY ============

export function useAvailableQuantity(inventoryItemId: string | undefined) {
  return useQuery({
    queryKey: ['available_quantity', inventoryItemId],
    queryFn: async () => {
      if (!inventoryItemId) return null;

      const { data, error } = await supabase.rpc('get_available_inventory_quantity', {
        p_inventory_item_id: inventoryItemId,
      });

      if (error) throw new Error(error.message);
      return data as number;
    },
    enabled: !!inventoryItemId,
  });
}

// ============ PARTS USAGE ANALYTICS ============

export function usePartsUsageAnalytics(filters?: {
  inventoryItemId?: string;
  vehicleId?: string;
  serviceCategoryId?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: [...workOrderPartsKeys.analytics, filters],
    queryFn: async () => {
      let query = supabase
        .from('parts_usage_analytics')
        .select('*');

      if (filters?.inventoryItemId) {
        query = query.eq('inventory_item_id', filters.inventoryItemId);
      }
      if (filters?.vehicleId) {
        query = query.eq('vehicle_id', filters.vehicleId);
      }
      if (filters?.serviceCategoryId) {
        query = query.eq('service_category_id', filters.serviceCategoryId);
      }

      const { data, error } = await query.limit(100);

      if (error) throw new Error(error.message);
      return (data || []) as PartsUsageAnalytics[];
    },
  });
}

export function useTopUsedParts(limit: number = 10) {
  return useQuery({
    queryKey: ['top_used_parts', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('work_order_parts')
        .select(`
          inventory_item_id,
          inventory_items(id, name, sku, unit_price)
        `)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);

      // Aggregate by inventory item
      const aggregated = (data || []).reduce((acc, part) => {
        const itemId = part.inventory_item_id;
        if (!acc[itemId]) {
          acc[itemId] = {
            inventory_item_id: itemId,
            inventory_item: part.inventory_items,
            usage_count: 0,
          };
        }
        acc[itemId].usage_count++;
        return acc;
      }, {} as Record<string, any>);

      return Object.values(aggregated)
        .sort((a: any, b: any) => b.usage_count - a.usage_count)
        .slice(0, limit);
    },
  });
}

export function usePartsUsageByVehicle(vehicleId: string | undefined) {
  return useQuery({
    queryKey: workOrderPartsKeys.analyticsForVehicle(vehicleId || ''),
    queryFn: async () => {
      if (!vehicleId) return [];

      const { data, error } = await supabase
        .from('work_order_parts')
        .select(`
          *,
          inventory_items(id, name, sku),
          work_orders!inner(vehicle_id)
        `)
        .eq('work_orders.vehicle_id', vehicleId)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return (data || []) as WorkOrderPart[];
    },
    enabled: !!vehicleId,
  });
}

// ============ WORK ORDER PARTS SUMMARY ============

export function useWorkOrderPartsSummary(workOrderId: string | undefined) {
  return useQuery({
    queryKey: ['work_order_parts_summary', workOrderId],
    queryFn: async () => {
      if (!workOrderId) return null;

      const { data: parts, error: partsError } = await supabase
        .from('work_order_parts')
        .select('quantity_used, unit_cost, total_cost')
        .eq('work_order_id', workOrderId);

      if (partsError) throw new Error(partsError.message);

      const { data: reservations, error: resError } = await supabase
        .from('part_reservations')
        .select('quantity_reserved, status')
        .eq('work_order_id', workOrderId)
        .in('status', ['pending', 'confirmed']);

      if (resError) throw new Error(resError.message);

      const totalPartsUsed = (parts || []).reduce((sum, p) => sum + p.quantity_used, 0);
      const totalPartsCost = (parts || []).reduce((sum, p) => sum + (p.total_cost || 0), 0);
      const totalReserved = (reservations || []).reduce((sum, r) => sum + r.quantity_reserved, 0);

      return {
        partsCount: parts?.length || 0,
        totalPartsUsed,
        totalPartsCost,
        reservationsCount: reservations?.length || 0,
        totalReserved,
      };
    },
    enabled: !!workOrderId,
  });
}
