import { supabase } from './supabase';
import { MobileInventoryItem, PartUsage, InventoryFilter, InventorySearchResult, StockValidation } from '../types';

export class InventoryService {
  /**
   * Fetch inventory items with filtering and pagination
   */
  async getInventoryItems(
    filter: InventoryFilter = {},
    page: number = 1,
    limit: number = 20
  ): Promise<InventorySearchResult> {
    try {
      let query = supabase
        .from('inventory_items')
        .select('*', { count: 'exact' });

      // Apply search filter
      if (filter.searchTerm) {
        query = query.or(`name.ilike.%${filter.searchTerm}%,sku.ilike.%${filter.searchTerm}%,description.ilike.%${filter.searchTerm}%`);
      }

      // Apply low stock filter
      if (filter.lowStockOnly) {
        query = query.lt('quantity_on_hand', supabase.rpc('reorder_level'));
      }

      // Apply sorting
      const sortBy = filter.sortBy || 'name';
      const sortOrder = filter.sortOrder || 'asc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        throw new Error(`Failed to fetch inventory items: ${error.message}`);
      }

      const items: MobileInventoryItem[] = (data || []).map(item => ({
        ...item,
        isLowStock: item.quantity_on_hand <= item.reorder_level,
        lastSyncTimestamp: new Date().toISOString(),
        localChanges: false
      }));

      return {
        items,
        totalCount: count || 0,
        hasMore: (count || 0) > page * limit
      };
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      throw error;
    }
  }

  /**
   * Get a specific inventory item by ID
   */
  async getInventoryItem(id: string): Promise<MobileInventoryItem | null> {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Item not found
        }
        throw new Error(`Failed to fetch inventory item: ${error.message}`);
      }

      return {
        ...data,
        isLowStock: data.quantity_on_hand <= data.reorder_level,
        lastSyncTimestamp: new Date().toISOString(),
        localChanges: false
      };
    } catch (error) {
      console.error('Error fetching inventory item:', error);
      throw error;
    }
  }

  /**
   * Search inventory items by SKU or barcode
   */
  async searchBySku(sku: string): Promise<MobileInventoryItem | null> {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('sku', sku)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Item not found
        }
        throw new Error(`Failed to search inventory by SKU: ${error.message}`);
      }

      return {
        ...data,
        isLowStock: data.quantity_on_hand <= data.reorder_level,
        lastSyncTimestamp: new Date().toISOString(),
        localChanges: false
      };
    } catch (error) {
      console.error('Error searching inventory by SKU:', error);
      throw error;
    }
  }

  /**
   * Validate stock availability for a part usage request
   */
  async validateStock(itemId: string, requestedQuantity: number): Promise<StockValidation> {
    try {
      const item = await this.getInventoryItem(itemId);
      
      if (!item) {
        return {
          isValid: false,
          availableQuantity: 0,
          requestedQuantity,
          message: 'Item not found in inventory'
        };
      }

      const isValid = item.quantity_on_hand >= requestedQuantity;
      
      return {
        isValid,
        availableQuantity: item.quantity_on_hand,
        requestedQuantity,
        message: isValid ? undefined : `Insufficient stock. Available: ${item.quantity_on_hand}, Requested: ${requestedQuantity}`
      };
    } catch (error) {
      console.error('Error validating stock:', error);
      return {
        isValid: false,
        availableQuantity: 0,
        requestedQuantity,
        message: 'Error validating stock availability'
      };
    }
  }

  /**
   * Record part usage for a work order
   */
  async recordPartUsage(usage: Omit<PartUsage, 'id' | 'created_at'>): Promise<PartUsage> {
    try {
      // First validate stock availability
      const stockValidation = await this.validateStock(usage.item_id, usage.quantity_used);
      
      if (!stockValidation.isValid) {
        throw new Error(stockValidation.message || 'Insufficient stock');
      }

      // Record the part usage
      const { data: partUsageData, error: usageError } = await supabase
        .from('work_order_parts')
        .insert({
          work_order_id: usage.work_order_id,
          item_id: usage.item_id,
          quantity_used: usage.quantity_used,
          price_at_time_of_use: usage.price_at_time_of_use
        })
        .select('*')
        .single();

      if (usageError) {
        throw new Error(`Failed to record part usage: ${usageError.message}`);
      }

      // Update inventory quantity
      const { error: updateError } = await supabase
        .from('inventory_items')
        .update({
          quantity_on_hand: stockValidation.availableQuantity - usage.quantity_used,
          updated_at: new Date().toISOString()
        })
        .eq('id', usage.item_id);

      if (updateError) {
        console.error('Failed to update inventory quantity:', updateError);
        // Note: In a production app, you might want to implement compensation logic here
      }

      return {
        ...partUsageData,
        synced: true
      };
    } catch (error) {
      console.error('Error recording part usage:', error);
      throw error;
    }
  }

  /**
   * Get part usage history for a work order
   */
  async getWorkOrderParts(workOrderId: string): Promise<PartUsage[]> {
    try {
      const { data, error } = await supabase
        .from('work_order_parts')
        .select(`
          *,
          inventory_items (*)
        `)
        .eq('work_order_id', workOrderId);

      if (error) {
        throw new Error(`Failed to fetch work order parts: ${error.message}`);
      }

      return (data || []).map(part => ({
        ...part,
        synced: true,
        inventory_item: part.inventory_items ? {
          ...part.inventory_items,
          isLowStock: part.inventory_items.quantity_on_hand <= part.inventory_items.reorder_level,
          lastSyncTimestamp: new Date().toISOString(),
          localChanges: false
        } : undefined
      }));
    } catch (error) {
      console.error('Error fetching work order parts:', error);
      throw error;
    }
  }

  /**
   * Get low stock items that need reordering
   */
  async getLowStockItems(): Promise<MobileInventoryItem[]> {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .lt('quantity_on_hand', supabase.rpc('reorder_level'))
        .order('quantity_on_hand', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch low stock items: ${error.message}`);
      }

      return (data || []).map(item => ({
        ...item,
        isLowStock: true,
        lastSyncTimestamp: new Date().toISOString(),
        localChanges: false
      }));
    } catch (error) {
      console.error('Error fetching low stock items:', error);
      throw error;
    }
  }

  /**
   * Update inventory item quantity (for manual adjustments)
   */
  async updateInventoryQuantity(itemId: string, newQuantity: number, reason?: string): Promise<MobileInventoryItem> {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .update({
          quantity_on_hand: newQuantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId)
        .select('*')
        .single();

      if (error) {
        throw new Error(`Failed to update inventory quantity: ${error.message}`);
      }

      // TODO: In a production app, you might want to log this adjustment
      // with the reason in an inventory_adjustments table

      return {
        ...data,
        isLowStock: data.quantity_on_hand <= data.reorder_level,
        lastSyncTimestamp: new Date().toISOString(),
        localChanges: false
      };
    } catch (error) {
      console.error('Error updating inventory quantity:', error);
      throw error;
    }
  }
}

export const inventoryService = new InventoryService();