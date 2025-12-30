import React, { useState, useMemo } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  Cancel01Icon,
  ClipboardIcon,
  Tick01Icon,
  Loading03Icon
} from '@hugeicons/core-free-icons';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { InventoryItem } from '@/types/supabase';
import { useCreateCycleCount, useUpdateCycleCountItem, useCompleteCycleCount, useCycleCount } from '@/hooks/useInventoryTransactions';
import { getUniqueWarehouses } from '@/utils/inventory-categorization-helpers';
import { snakeToCamelCase } from '@/utils/data-helpers';

interface CycleCountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  existingCountId?: string; // For continuing an existing count
}

interface CountLineItem {
  inventory_item_id: string;
  item?: InventoryItem;
  system_quantity: number;
  counted_quantity?: number;
}

export const CycleCountDialog: React.FC<CycleCountDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
  existingCountId,
}) => {
  const [warehouse, setWarehouse] = useState<string>('');
  const [countDate, setCountDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [lineItems, setLineItems] = useState<CountLineItem[]>([]);
  const [mode, setMode] = useState<'setup' | 'counting'>('setup');

  const createCycleCount = useCreateCycleCount();
  const updateCountItem = useUpdateCycleCountItem();
  const completeCycleCount = useCompleteCycleCount();
  const { data: existingCount } = useCycleCount(existingCountId);

  // Fetch inventory items
  const { data: inventoryItems } = useQuery<InventoryItem[]>({
    queryKey: ['inventory_items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('name');
      if (error) throw new Error(error.message);
      return (data || []).map(item => snakeToCamelCase(item) as InventoryItem);
    },
  });

  // Get unique warehouses
  const warehouses = useMemo(() => {
    return getUniqueWarehouses(inventoryItems || []);
  }, [inventoryItems]);

  // Filter items by warehouse
  const warehouseItems = useMemo(() => {
    if (!warehouse || !inventoryItems) return inventoryItems || [];
    return inventoryItems.filter(i => i.warehouse === warehouse);
  }, [inventoryItems, warehouse]);

  const handleSelectAll = () => {
    setLineItems(warehouseItems.map(item => ({
      inventory_item_id: item.id,
      item,
      system_quantity: item.quantity_on_hand ?? 0,
    })));
  };

  const handleClearAll = () => {
    setLineItems([]);
  };

  const handleToggleItem = (item: InventoryItem) => {
    const exists = lineItems.some(li => li.inventory_item_id === item.id);
    if (exists) {
      setLineItems(lineItems.filter(li => li.inventory_item_id !== item.id));
    } else {
      setLineItems([...lineItems, {
        inventory_item_id: item.id,
        item,
        system_quantity: item.quantity_on_hand ?? 0,
      }]);
    }
  };

  const handleUpdateCount = (itemId: string, countedQty: number) => {
    setLineItems(lineItems.map(li => 
      li.inventory_item_id === itemId 
        ? { ...li, counted_quantity: countedQty } 
        : li
    ));
  };

  const handleStartCount = async () => {
    if (lineItems.length === 0) return;

    await createCycleCount.mutateAsync({
      count_date: countDate,
      warehouse: warehouse || undefined,
      notes: notes || undefined,
      items: lineItems.map(li => ({
        inventory_item_id: li.inventory_item_id,
        system_quantity: li.system_quantity,
      })),
    });

    setMode('counting');
  };

  const handleCompleteCount = async () => {
    // In a real implementation, this would use the existingCountId
    // For now, we'll just close the dialog
    onSuccess?.();
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setWarehouse('');
    setCountDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setLineItems([]);
    setMode('setup');
  };

  if (!isOpen) return null;

  const totalVariance = lineItems.reduce((sum, li) => {
    if (li.counted_quantity === undefined) return sum;
    return sum + (li.counted_quantity - li.system_quantity);
  }, 0);

  const countedItems = lineItems.filter(li => li.counted_quantity !== undefined).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <HugeiconsIcon icon={ClipboardIcon} size={20} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {mode === 'setup' ? 'Start Cycle Count' : 'Cycle Count in Progress'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {mode === 'setup' ? 'Select items to count' : 'Enter counted quantities'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <HugeiconsIcon icon={Cancel01Icon} size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[calc(90vh-180px)] overflow-y-auto">
          {mode === 'setup' ? (
            <>
              {/* Setup Mode */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Warehouse (Optional)</label>
                  <select
                    value={warehouse}
                    onChange={(e) => {
                      setWarehouse(e.target.value);
                      setLineItems([]);
                    }}
                    className="w-full h-10 px-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                  >
                    <option value="">All Warehouses</option>
                    {warehouses.map(w => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Count Date</label>
                  <input
                    type="date"
                    value={countDate}
                    onChange={(e) => setCountDate(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                    required
                  />
                </div>
              </div>

              {/* Item Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Select Items to Count ({lineItems.length} selected)
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="text-xs text-purple-600 hover:text-purple-700"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={handleClearAll}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg max-h-64 overflow-y-auto">
                  {warehouseItems.map(item => {
                    const isSelected = lineItems.some(li => li.inventory_item_id === item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleToggleItem(item)}
                        className={`flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-800 last:border-0 ${
                          isSelected ? 'bg-purple-50 dark:bg-purple-900/20' : ''
                        }`}
                      >
                        <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                          isSelected 
                            ? 'bg-purple-600 border-purple-600' 
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {isSelected && <HugeiconsIcon icon={Tick01Icon} size={12} className="text-white" />}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.name}</div>
                          <div className="text-xs text-gray-500">{item.sku} • {item.warehouse || 'No location'}</div>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Qty: {item.quantity_on_hand ?? 0}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Optional notes..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                />
              </div>
            </>
          ) : (
            <>
              {/* Counting Mode */}
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-purple-700 dark:text-purple-300">
                    Progress: {countedItems} / {lineItems.length} items counted
                  </div>
                  <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                    Total Variance: {totalVariance > 0 ? '+' : ''}{totalVariance}
                  </div>
                </div>
                <div className="w-32 h-2 bg-purple-200 dark:bg-purple-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-600 transition-all"
                    style={{ width: `${(countedItems / lineItems.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Count Entry Table */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Item</th>
                      <th className="px-4 py-2 text-center font-medium text-gray-700 dark:text-gray-300 w-24">System Qty</th>
                      <th className="px-4 py-2 text-center font-medium text-gray-700 dark:text-gray-300 w-28">Counted Qty</th>
                      <th className="px-4 py-2 text-center font-medium text-gray-700 dark:text-gray-300 w-24">Variance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {lineItems.map(li => {
                      const variance = li.counted_quantity !== undefined 
                        ? li.counted_quantity - li.system_quantity 
                        : null;
                      return (
                        <tr key={li.inventory_item_id}>
                          <td className="px-4 py-2">
                            <div className="font-medium text-gray-900 dark:text-gray-100">{li.item?.name}</div>
                            <div className="text-xs text-gray-500">{li.item?.sku}</div>
                          </td>
                          <td className="px-4 py-2 text-center text-gray-600 dark:text-gray-400">
                            {li.system_quantity}
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              min="0"
                              value={li.counted_quantity ?? ''}
                              onChange={(e) => handleUpdateCount(li.inventory_item_id, parseInt(e.target.value) || 0)}
                              placeholder="Enter count"
                              className="w-full h-8 px-2 text-center rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                            />
                          </td>
                          <td className="px-4 py-2 text-center">
                            {variance !== null && (
                              <span className={`font-medium ${
                                variance === 0 
                                  ? 'text-gray-500' 
                                  : variance > 0 
                                    ? 'text-emerald-600' 
                                    : 'text-red-600'
                              }`}>
                                {variance > 0 ? '+' : ''}{variance}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            Cancel
          </button>
          {mode === 'setup' ? (
            <button
              onClick={handleStartCount}
              disabled={lineItems.length === 0 || createCycleCount.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {createCycleCount.isPending && <HugeiconsIcon icon={Loading03Icon} size={16} className="animate-spin" />}
              Start Count ({lineItems.length} items)
            </button>
          ) : (
            <button
              onClick={handleCompleteCount}
              disabled={countedItems < lineItems.length || completeCycleCount.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {completeCycleCount.isPending && <HugeiconsIcon icon={Loading03Icon} size={16} className="animate-spin" />}
              Complete & Apply Adjustments
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
