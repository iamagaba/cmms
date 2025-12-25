import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  StockReceipt, 
  StockReceiptItem,
  StockTransfer,
  StockTransferItem,
  CycleCount,
  CycleCountItem,
  ShrinkageRecord,
  ReceiptStatus,
  TransferStatus,
  CycleCountStatus,
  LossType
} from '@/types/supabase';
import { showSuccess, showError } from '@/utils/toast';

// Query keys
export const transactionKeys = {
  receipts: ['stock_receipts'] as const,
  receipt: (id: string) => ['stock_receipts', id] as const,
  transfers: ['stock_transfers'] as const,
  transfer: (id: string) => ['stock_transfers', id] as const,
  cycleCounts: ['cycle_counts'] as const,
  cycleCount: (id: string) => ['cycle_counts', id] as const,
  shrinkage: ['shrinkage_records'] as const,
};

// ============ STOCK RECEIPTS ============

export function useStockReceipts(status?: ReceiptStatus) {
  return useQuery({
    queryKey: [...transactionKeys.receipts, status],
    queryFn: async () => {
      let query = supabase
        .from('stock_receipts')
        .select(`
          *,
          supplier:suppliers(*),
          profiles:created_by(first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query.limit(100);
      if (error) throw new Error(error.message);
      return (data || []) as StockReceipt[];
    },
  });
}

export function useStockReceipt(id: string | undefined) {
  return useQuery({
    queryKey: transactionKeys.receipt(id || ''),
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('stock_receipts')
        .select(`
          *,
          supplier:suppliers(*),
          profiles:created_by(first_name, last_name),
          items:stock_receipt_items(*, inventory_items(*))
        `)
        .eq('id', id)
        .single();

      if (error) throw new Error(error.message);
      return data as StockReceipt;
    },
    enabled: !!id,
  });
}

export interface CreateReceiptInput {
  supplier_id?: string;
  received_date: string;
  po_number?: string;
  invoice_number?: string;
  notes?: string;
  items: Array<{
    inventory_item_id: string;
    quantity_expected: number;
    quantity_received: number;
    unit_cost?: number;
  }>;
}

export function useCreateStockReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateReceiptInput) => {
      const { data: { user } } = await supabase.auth.getUser();

      // Generate receipt number
      const { data: receiptNum } = await supabase.rpc('generate_receipt_number');

      // Create receipt
      const { data: receipt, error: receiptError } = await supabase
        .from('stock_receipts')
        .insert({
          receipt_number: receiptNum,
          supplier_id: input.supplier_id || null,
          received_date: input.received_date,
          po_number: input.po_number || null,
          invoice_number: input.invoice_number || null,
          notes: input.notes || null,
          status: 'complete',
          created_by: user?.id || null,
        })
        .select()
        .single();

      if (receiptError) throw new Error(receiptError.message);

      // Create receipt items
      const receiptItems = input.items.map(item => ({
        receipt_id: receipt.id,
        inventory_item_id: item.inventory_item_id,
        quantity_expected: item.quantity_expected,
        quantity_received: item.quantity_received,
        unit_cost: item.unit_cost || null,
      }));

      const { error: itemsError } = await supabase
        .from('stock_receipt_items')
        .insert(receiptItems);

      if (itemsError) throw new Error(itemsError.message);

      // Update inventory quantities and create stock adjustments
      for (const item of input.items) {
        if (item.quantity_received > 0) {
          // Get current quantity
          const { data: invItem } = await supabase
            .from('inventory_items')
            .select('quantity_on_hand')
            .eq('id', item.inventory_item_id)
            .single();

          const currentQty = invItem?.quantity_on_hand ?? 0;
          const newQty = currentQty + item.quantity_received;

          // Update inventory
          await supabase
            .from('inventory_items')
            .update({ quantity_on_hand: newQty })
            .eq('id', item.inventory_item_id);

          // Create stock adjustment record
          await supabase.from('stock_adjustments').insert({
            inventory_item_id: item.inventory_item_id,
            quantity_delta: item.quantity_received,
            quantity_before: currentQty,
            quantity_after: newQty,
            reason: 'received',
            notes: `Receipt ${receiptNum}`,
            created_by: user?.id || null,
          });
        }
      }

      return receipt as StockReceipt;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.receipts });
      queryClient.invalidateQueries({ queryKey: ['inventory_items'] });
      queryClient.invalidateQueries({ queryKey: ['stock_adjustments'] });
      showSuccess('Stock receipt created successfully');
    },
    onError: (error) => {
      console.error('Create receipt error:', error);
      showError(error.message || 'Failed to create stock receipt');
    },
  });
}


// ============ STOCK TRANSFERS ============

export function useStockTransfers(status?: TransferStatus) {
  return useQuery({
    queryKey: [...transactionKeys.transfers, status],
    queryFn: async () => {
      let query = supabase
        .from('stock_transfers')
        .select(`
          *,
          profiles:created_by(first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query.limit(100);
      if (error) throw new Error(error.message);
      return (data || []) as StockTransfer[];
    },
  });
}

export function useStockTransfer(id: string | undefined) {
  return useQuery({
    queryKey: transactionKeys.transfer(id || ''),
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('stock_transfers')
        .select(`
          *,
          profiles:created_by(first_name, last_name),
          items:stock_transfer_items(*, inventory_items(*))
        `)
        .eq('id', id)
        .single();

      if (error) throw new Error(error.message);
      return data as StockTransfer;
    },
    enabled: !!id,
  });
}

export interface CreateTransferInput {
  from_warehouse: string;
  to_warehouse: string;
  transfer_date: string;
  notes?: string;
  items: Array<{
    inventory_item_id: string;
    quantity: number;
  }>;
}

export function useCreateStockTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTransferInput) => {
      const { data: { user } } = await supabase.auth.getUser();

      // Generate transfer number
      const { data: transferNum } = await supabase.rpc('generate_transfer_number');

      // Create transfer
      const { data: transfer, error: transferError } = await supabase
        .from('stock_transfers')
        .insert({
          transfer_number: transferNum,
          from_warehouse: input.from_warehouse,
          to_warehouse: input.to_warehouse,
          transfer_date: input.transfer_date,
          notes: input.notes || null,
          status: 'complete',
          created_by: user?.id || null,
        })
        .select()
        .single();

      if (transferError) throw new Error(transferError.message);

      // Create transfer items
      const transferItems = input.items.map(item => ({
        transfer_id: transfer.id,
        inventory_item_id: item.inventory_item_id,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('stock_transfer_items')
        .insert(transferItems);

      if (itemsError) throw new Error(itemsError.message);

      // Update inventory locations and create stock adjustments
      for (const item of input.items) {
        // Get current item data
        const { data: invItem } = await supabase
          .from('inventory_items')
          .select('quantity_on_hand, warehouse')
          .eq('id', item.inventory_item_id)
          .single();

        const currentQty = invItem?.quantity_on_hand ?? 0;

        // Create transfer_out adjustment
        await supabase.from('stock_adjustments').insert({
          inventory_item_id: item.inventory_item_id,
          quantity_delta: -item.quantity,
          quantity_before: currentQty,
          quantity_after: currentQty - item.quantity,
          reason: 'transfer_out',
          notes: `Transfer ${transferNum} to ${input.to_warehouse}`,
          created_by: user?.id || null,
        });

        // Create transfer_in adjustment (same item, different location context)
        await supabase.from('stock_adjustments').insert({
          inventory_item_id: item.inventory_item_id,
          quantity_delta: item.quantity,
          quantity_before: currentQty - item.quantity,
          quantity_after: currentQty,
          reason: 'transfer_in',
          notes: `Transfer ${transferNum} from ${input.from_warehouse}`,
          created_by: user?.id || null,
        });

        // Update warehouse location if item is moving
        if (invItem?.warehouse === input.from_warehouse) {
          await supabase
            .from('inventory_items')
            .update({ warehouse: input.to_warehouse })
            .eq('id', item.inventory_item_id);
        }
      }

      return transfer as StockTransfer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.transfers });
      queryClient.invalidateQueries({ queryKey: ['inventory_items'] });
      queryClient.invalidateQueries({ queryKey: ['stock_adjustments'] });
      showSuccess('Stock transfer completed successfully');
    },
    onError: (error) => {
      console.error('Create transfer error:', error);
      showError(error.message || 'Failed to create stock transfer');
    },
  });
}

// ============ CYCLE COUNTS ============

export function useCycleCounts(status?: CycleCountStatus) {
  return useQuery({
    queryKey: [...transactionKeys.cycleCounts, status],
    queryFn: async () => {
      let query = supabase
        .from('cycle_counts')
        .select(`
          *,
          profiles:created_by(first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query.limit(100);
      if (error) throw new Error(error.message);
      return (data || []) as CycleCount[];
    },
  });
}

export function useCycleCount(id: string | undefined) {
  return useQuery({
    queryKey: transactionKeys.cycleCount(id || ''),
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('cycle_counts')
        .select(`
          *,
          profiles:created_by(first_name, last_name),
          items:cycle_count_items(*, inventory_items(*))
        `)
        .eq('id', id)
        .single();

      if (error) throw new Error(error.message);
      return data as CycleCount;
    },
    enabled: !!id,
  });
}

export interface CreateCycleCountInput {
  count_date: string;
  warehouse?: string;
  notes?: string;
  items: Array<{
    inventory_item_id: string;
    system_quantity: number;
  }>;
}

export function useCreateCycleCount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCycleCountInput) => {
      const { data: { user } } = await supabase.auth.getUser();

      // Generate count number
      const { data: countNum } = await supabase.rpc('generate_count_number');

      // Create cycle count
      const { data: cycleCount, error: countError } = await supabase
        .from('cycle_counts')
        .insert({
          count_number: countNum,
          count_date: input.count_date,
          warehouse: input.warehouse || null,
          notes: input.notes || null,
          status: 'in_progress',
          created_by: user?.id || null,
        })
        .select()
        .single();

      if (countError) throw new Error(countError.message);

      // Create count items
      const countItems = input.items.map(item => ({
        cycle_count_id: cycleCount.id,
        inventory_item_id: item.inventory_item_id,
        system_quantity: item.system_quantity,
      }));

      const { error: itemsError } = await supabase
        .from('cycle_count_items')
        .insert(countItems);

      if (itemsError) throw new Error(itemsError.message);

      return cycleCount as CycleCount;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.cycleCounts });
      showSuccess('Cycle count started');
    },
    onError: (error) => {
      console.error('Create cycle count error:', error);
      showError(error.message || 'Failed to create cycle count');
    },
  });
}

export interface UpdateCycleCountItemInput {
  id: string;
  counted_quantity: number;
  notes?: string;
}

export function useUpdateCycleCountItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateCycleCountItemInput) => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('cycle_count_items')
        .update({
          counted_quantity: input.counted_quantity,
          notes: input.notes || null,
          counted_by: user?.id || null,
          counted_at: new Date().toISOString(),
        })
        .eq('id', input.id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as CycleCountItem;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.cycleCounts });
    },
    onError: (error) => {
      showError(error.message || 'Failed to update count');
    },
  });
}

export function useCompleteCycleCount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cycleCountId: string) => {
      const { data: { user } } = await supabase.auth.getUser();

      // Get cycle count with items
      const { data: cycleCount, error: fetchError } = await supabase
        .from('cycle_counts')
        .select(`
          *,
          items:cycle_count_items(*)
        `)
        .eq('id', cycleCountId)
        .single();

      if (fetchError) throw new Error(fetchError.message);

      // Apply adjustments for variances
      for (const item of (cycleCount.items || [])) {
        if (item.counted_quantity !== null && item.variance !== 0) {
          // Get current quantity
          const { data: invItem } = await supabase
            .from('inventory_items')
            .select('quantity_on_hand')
            .eq('id', item.inventory_item_id)
            .single();

          const currentQty = invItem?.quantity_on_hand ?? 0;
          const newQty = item.counted_quantity;

          // Update inventory
          await supabase
            .from('inventory_items')
            .update({ quantity_on_hand: newQty })
            .eq('id', item.inventory_item_id);

          // Create adjustment record
          await supabase.from('stock_adjustments').insert({
            inventory_item_id: item.inventory_item_id,
            quantity_delta: newQty - currentQty,
            quantity_before: currentQty,
            quantity_after: newQty,
            reason: 'cycle_count',
            notes: `Cycle count ${cycleCount.count_number}`,
            created_by: user?.id || null,
          });
        }
      }

      // Mark cycle count as complete
      const { data, error } = await supabase
        .from('cycle_counts')
        .update({
          status: 'complete',
          completed_by: user?.id || null,
          completed_at: new Date().toISOString(),
        })
        .eq('id', cycleCountId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as CycleCount;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.cycleCounts });
      queryClient.invalidateQueries({ queryKey: ['inventory_items'] });
      queryClient.invalidateQueries({ queryKey: ['stock_adjustments'] });
      showSuccess('Cycle count completed and inventory updated');
    },
    onError: (error) => {
      console.error('Complete cycle count error:', error);
      showError(error.message || 'Failed to complete cycle count');
    },
  });
}


// ============ SHRINKAGE RECORDS ============

export function useShrinkageRecords(lossType?: LossType) {
  return useQuery({
    queryKey: [...transactionKeys.shrinkage, lossType],
    queryFn: async () => {
      let query = supabase
        .from('shrinkage_records')
        .select(`
          *,
          inventory_items(*),
          profiles:reported_by(first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (lossType) {
        query = query.eq('loss_type', lossType);
      }

      const { data, error } = await query.limit(100);
      if (error) throw new Error(error.message);
      return (data || []) as ShrinkageRecord[];
    },
  });
}

export interface CreateShrinkageInput {
  inventory_item_id: string;
  quantity_lost: number;
  loss_type: LossType;
  discovered_date: string;
  estimated_value?: number;
  notes?: string;
}

export function useCreateShrinkageRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateShrinkageInput) => {
      const { data: { user } } = await supabase.auth.getUser();

      // Get current quantity
      const { data: invItem } = await supabase
        .from('inventory_items')
        .select('quantity_on_hand, unit_price')
        .eq('id', input.inventory_item_id)
        .single();

      const currentQty = invItem?.quantity_on_hand ?? 0;
      const newQty = Math.max(0, currentQty - input.quantity_lost);
      const estimatedValue = input.estimated_value ?? (input.quantity_lost * (invItem?.unit_price ?? 0));

      // Create shrinkage record
      const { data: shrinkage, error: shrinkageError } = await supabase
        .from('shrinkage_records')
        .insert({
          inventory_item_id: input.inventory_item_id,
          quantity_lost: input.quantity_lost,
          loss_type: input.loss_type,
          discovered_date: input.discovered_date,
          estimated_value: estimatedValue,
          notes: input.notes || null,
          reported_by: user?.id || null,
        })
        .select()
        .single();

      if (shrinkageError) throw new Error(shrinkageError.message);

      // Update inventory quantity
      await supabase
        .from('inventory_items')
        .update({ quantity_on_hand: newQty })
        .eq('id', input.inventory_item_id);

      // Map loss_type to adjustment reason
      const reasonMap: Record<LossType, string> = {
        theft: 'theft',
        damage: 'damaged',
        expired: 'expired',
        spoilage: 'damaged',
        unknown: 'other',
        other: 'other',
      };

      // Create stock adjustment record
      await supabase.from('stock_adjustments').insert({
        inventory_item_id: input.inventory_item_id,
        quantity_delta: -input.quantity_lost,
        quantity_before: currentQty,
        quantity_after: newQty,
        reason: reasonMap[input.loss_type],
        notes: `Shrinkage: ${input.loss_type}${input.notes ? ' - ' + input.notes : ''}`,
        created_by: user?.id || null,
      });

      return shrinkage as ShrinkageRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.shrinkage });
      queryClient.invalidateQueries({ queryKey: ['inventory_items'] });
      queryClient.invalidateQueries({ queryKey: ['stock_adjustments'] });
      showSuccess('Shrinkage recorded');
    },
    onError: (error) => {
      console.error('Create shrinkage error:', error);
      showError(error.message || 'Failed to record shrinkage');
    },
  });
}

// ============ SUMMARY STATS ============

export function useTransactionSummary() {
  return useQuery({
    queryKey: ['transaction_summary'],
    queryFn: async () => {
      const [receipts, transfers, counts, shrinkage] = await Promise.all([
        supabase.from('stock_receipts').select('id, status').eq('status', 'pending'),
        supabase.from('stock_transfers').select('id, status').eq('status', 'pending'),
        supabase.from('cycle_counts').select('id, status').eq('status', 'in_progress'),
        supabase.from('shrinkage_records').select('id, estimated_value'),
      ]);

      const totalShrinkageValue = (shrinkage.data || []).reduce(
        (sum, r) => sum + (r.estimated_value || 0), 0
      );

      return {
        pendingReceipts: receipts.data?.length || 0,
        pendingTransfers: transfers.data?.length || 0,
        activeCycleCounts: counts.data?.length || 0,
        totalShrinkageValue,
      };
    },
  });
}
