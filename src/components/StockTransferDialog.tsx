import React, { useState, useMemo } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  Cancel01Icon,
  ArrowRight01Icon,
  Building02Icon,
  Delete01Icon,
  Loading03Icon,
  ArrowDataTransferHorizontalIcon
} from '@hugeicons/core-free-icons';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { InventoryItem } from '@/types/supabase';
import { useCreateStockTransfer } from '@/hooks/useInventoryTransactions';
import { getUniqueWarehouses } from '@/utils/inventory-categorization-helpers';
import { snakeToCamelCase } from '@/utils/data-helpers';
import { useDensitySpacing } from '@/hooks/useDensitySpacing';
import { useDensity } from '@/context/DensityContext';

interface StockTransferDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface TransferLineItem {
  inventory_item_id: string;
  item?: InventoryItem;
  quantity: number;
  maxQuantity: number;
}

export const StockTransferDialog: React.FC<StockTransferDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [fromWarehouse, setFromWarehouse] = useState<string>('');
  const [toWarehouse, setToWarehouse] = useState<string>('');
  const [transferDate, setTransferDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [lineItems, setLineItems] = useState<TransferLineItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string>('');

  const createTransfer = useCreateStockTransfer();
  const spacing = useDensitySpacing();
  const { isCompact } = useDensity();

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

  // Filter items by source warehouse
  const availableItems = useMemo(() => {
    if (!fromWarehouse || !inventoryItems) return [];
    return inventoryItems.filter(i => 
      i.warehouse === fromWarehouse && 
      (i.quantity_on_hand ?? 0) > 0 &&
      !lineItems.some(li => li.inventory_item_id === i.id)
    );
  }, [inventoryItems, fromWarehouse, lineItems]);

  const handleAddItem = () => {
    if (!selectedItemId) return;
    const item = inventoryItems?.find(i => i.id === selectedItemId);
    if (!item) return;

    setLineItems([...lineItems, {
      inventory_item_id: selectedItemId,
      item,
      quantity: 1,
      maxQuantity: item.quantity_on_hand ?? 0,
    }]);
    setSelectedItemId('');
  };

  const handleRemoveItem = (itemId: string) => {
    setLineItems(lineItems.filter(li => li.inventory_item_id !== itemId));
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    setLineItems(lineItems.map(li => 
      li.inventory_item_id === itemId 
        ? { ...li, quantity: Math.min(quantity, li.maxQuantity) } 
        : li
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lineItems.length === 0 || !fromWarehouse || !toWarehouse) return;

    await createTransfer.mutateAsync({
      from_warehouse: fromWarehouse,
      to_warehouse: toWarehouse,
      transfer_date: transferDate,
      notes: notes || undefined,
      items: lineItems.map(li => ({
        inventory_item_id: li.inventory_item_id,
        quantity: li.quantity,
      })),
    });

    onSuccess?.();
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setFromWarehouse('');
    setToWarehouse('');
    setTransferDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setLineItems([]);
    setSelectedItemId('');
  };

  if (!isOpen) return null;

  const totalItems = lineItems.reduce((sum, li) => sum + li.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className={`flex items-center justify-between ${spacing.card} border-b border-gray-200 dark:border-gray-700`}>
          <div className={`flex items-center ${spacing.gap}`}>
            <div className={`${isCompact ? 'w-8 h-8' : 'w-10 h-10'} rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center`}>
              <HugeiconsIcon icon={ArrowDataTransferHorizontalIcon} size={spacing.icon.lg} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className={`${spacing.text.heading} font-semibold text-gray-900 dark:text-gray-100`}>Transfer Stock</h2>
              <p className={`${spacing.text.body} text-gray-500 dark:text-gray-400`}>Move inventory between locations</p>
            </div>
          </div>
          <button onClick={onClose} className={`${isCompact ? 'p-1.5' : 'p-2'} hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg`}>
            <HugeiconsIcon icon={Cancel01Icon} size={spacing.icon.lg} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={`${spacing.card} ${spacing.section} max-h-[calc(90vh-180px)] overflow-y-auto`}>
            {/* Transfer Details */}
            <div className={`grid grid-cols-3 ${spacing.gap}`}>
              <div>
                <label className={`block ${spacing.text.body} font-medium text-gray-700 dark:text-gray-300 mb-1`}>From Warehouse *</label>
                <select
                  value={fromWarehouse}
                  onChange={(e) => {
                    setFromWarehouse(e.target.value);
                    setLineItems([]); // Clear items when source changes
                  }}
                  className={`w-full ${spacing.inputHeight} px-3 ${spacing.rounded} border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 ${spacing.text.body}`}
                  required
                >
                  <option value="">Select source...</option>
                  {warehouses.map(w => (
                    <option key={w} value={w} disabled={w === toWarehouse}>{w}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block ${spacing.text.body} font-medium text-gray-700 dark:text-gray-300 mb-1`}>To Warehouse *</label>
                <select
                  value={toWarehouse}
                  onChange={(e) => setToWarehouse(e.target.value)}
                  className={`w-full ${spacing.inputHeight} px-3 ${spacing.rounded} border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 ${spacing.text.body}`}
                  required
                >
                  <option value="">Select destination...</option>
                  {warehouses.map(w => (
                    <option key={w} value={w} disabled={w === fromWarehouse}>{w}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block ${spacing.text.body} font-medium text-gray-700 dark:text-gray-300 mb-1`}>Transfer Date</label>
                <input
                  type="date"
                  value={transferDate}
                  onChange={(e) => setTransferDate(e.target.value)}
                  className={`w-full ${spacing.inputHeight} px-3 ${spacing.rounded} border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 ${spacing.text.body}`}
                  required
                />
              </div>
            </div>

            {/* Visual Transfer Indicator */}
            {fromWarehouse && toWarehouse && (
              <div className={`flex items-center justify-center ${spacing.gap} ${spacing.card} bg-gray-50 dark:bg-gray-800 ${spacing.roundedLg}`}>
                <div className="text-center">
                  <HugeiconsIcon icon={Building02Icon} size={spacing.icon.xl} className="text-gray-400 mx-auto mb-1" />
                  <div className={`${spacing.text.body} font-medium text-gray-900 dark:text-gray-100`}>{fromWarehouse}</div>
                </div>
                <HugeiconsIcon icon={ArrowRight01Icon} size={spacing.icon.lg} className="text-blue-500" />
                <div className="text-center">
                  <HugeiconsIcon icon={Building02Icon} size={spacing.icon.xl} className="text-blue-500 mx-auto mb-1" />
                  <div className={`${spacing.text.body} font-medium text-gray-900 dark:text-gray-100`}>{toWarehouse}</div>
                </div>
              </div>
            )}

            {/* Add Items */}
            {fromWarehouse && (
              <div>
                <label className={`block ${spacing.text.body} font-medium text-gray-700 dark:text-gray-300 ${spacing.mb}`}>Add Items from {fromWarehouse}</label>
                <div className={`flex ${spacing.gap}`}>
                  <select
                    value={selectedItemId}
                    onChange={(e) => setSelectedItemId(e.target.value)}
                    className={`flex-1 ${spacing.inputHeight} px-3 ${spacing.rounded} border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 ${spacing.text.body}`}
                  >
                    <option value="">Select item to transfer...</option>
                    {availableItems.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.sku}) - {item.quantity_on_hand} available
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    disabled={!selectedItemId}
                    className={`${spacing.button} bg-purple-600 text-white ${spacing.rounded} hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium`}
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

            {/* Line Items Table */}
            {lineItems.length > 0 && (
              <div className={`border border-gray-200 dark:border-gray-700 ${spacing.roundedLg} overflow-hidden`}>
                <table className={`w-full ${spacing.text.body}`}>
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className={`${spacing.rowPadding} text-left font-medium text-gray-700 dark:text-gray-300`}>Item</th>
                      <th className={`${spacing.rowPadding} text-center font-medium text-gray-700 dark:text-gray-300 w-24`}>Available</th>
                      <th className={`${spacing.rowPadding} text-center font-medium text-gray-700 dark:text-gray-300 w-28`}>Transfer Qty</th>
                      <th className={`${spacing.rowPadding} w-12`}></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {lineItems.map(li => (
                      <tr key={li.inventory_item_id}>
                        <td className={spacing.rowPadding}>
                          <div className="font-medium text-gray-900 dark:text-gray-100">{li.item?.name}</div>
                          <div className={`${spacing.text.caption} text-gray-500`}>{li.item?.sku}</div>
                        </td>
                        <td className={`${spacing.rowPadding} text-center text-gray-600 dark:text-gray-400`}>
                          {li.maxQuantity}
                        </td>
                        <td className={spacing.rowPadding}>
                          <input
                            type="number"
                            min="1"
                            max={li.maxQuantity}
                            value={li.quantity}
                            onChange={(e) => handleUpdateQuantity(li.inventory_item_id, parseInt(e.target.value) || 1)}
                            className={`w-full ${spacing.inputHeight} px-2 text-center rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800`}
                          />
                        </td>
                        <td className={spacing.rowPadding}>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(li.inventory_item_id)}
                            className={`${isCompact ? 'p-1' : 'p-1.5'} text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded`}
                          >
                            <HugeiconsIcon icon={Delete01Icon} size={spacing.icon.sm} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className={`block ${spacing.text.body} font-medium text-gray-700 dark:text-gray-300 mb-1`}>Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={isCompact ? 2 : 3}
                placeholder="Optional notes..."
                className={`w-full px-3 py-2 ${spacing.roundedLg} border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 ${spacing.text.body}`}
              />
            </div>

            {/* Summary */}
            {lineItems.length > 0 && (
              <div className={`bg-blue-50 dark:bg-blue-900/20 ${spacing.roundedLg} ${spacing.card}`}>
                <div className={`${spacing.text.body} text-blue-700 dark:text-blue-300`}>
                  Transferring <span className="font-semibold">{lineItems.length}</span> items ({totalItems} units) from {fromWarehouse} to {toWarehouse}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={`flex items-center justify-end ${spacing.gap} ${spacing.card} border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800`}>
            <button
              type="button"
              onClick={onClose}
              className={`${spacing.button} font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${spacing.rounded}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={lineItems.length === 0 || !fromWarehouse || !toWarehouse || createTransfer.isPending}
              className={`${spacing.button} font-medium text-white bg-blue-600 hover:bg-blue-700 ${spacing.rounded} disabled:opacity-50 disabled:cursor-not-allowed flex items-center ${spacing.gap}`}
            >
              {createTransfer.isPending && <HugeiconsIcon icon={Loading03Icon} size={spacing.icon.sm} className="animate-spin" />}
              Complete Transfer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
