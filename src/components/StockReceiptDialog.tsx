import React, { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  Cancel01Icon,
  PackageReceiveIcon,
  Delete01Icon,
  Loading03Icon
} from '@hugeicons/core-free-icons';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { InventoryItem, Supplier } from '@/types/supabase';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useCreateStockReceipt } from '@/hooks/useInventoryTransactions';
import { snakeToCamelCase } from '@/utils/data-helpers';
import { useDensitySpacing } from '@/hooks/useDensitySpacing';
import { useDensity } from '@/context/DensityContext';

interface StockReceiptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface ReceiptLineItem {
  inventory_item_id: string;
  item?: InventoryItem;
  quantity_expected: number;
  quantity_received: number;
  unit_cost?: number;
}

export const StockReceiptDialog: React.FC<StockReceiptDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [supplierId, setSupplierId] = useState<string>('');
  const [receivedDate, setReceivedDate] = useState(new Date().toISOString().split('T')[0]);
  const [poNumber, setPoNumber] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [lineItems, setLineItems] = useState<ReceiptLineItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string>('');

  const { data: suppliers } = useSuppliers();
  const createReceipt = useCreateStockReceipt();
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

  const handleAddItem = () => {
    if (!selectedItemId) return;
    const item = inventoryItems?.find(i => i.id === selectedItemId);
    if (!item) return;

    // Check if already added
    if (lineItems.some(li => li.inventory_item_id === selectedItemId)) {
      return;
    }

    setLineItems([...lineItems, {
      inventory_item_id: selectedItemId,
      item,
      quantity_expected: 1,
      quantity_received: 1,
      unit_cost: item.unit_price,
    }]);
    setSelectedItemId('');
  };

  const handleRemoveItem = (itemId: string) => {
    setLineItems(lineItems.filter(li => li.inventory_item_id !== itemId));
  };

  const handleUpdateItem = (itemId: string, field: keyof ReceiptLineItem, value: number) => {
    setLineItems(lineItems.map(li => 
      li.inventory_item_id === itemId ? { ...li, [field]: value } : li
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lineItems.length === 0) return;

    await createReceipt.mutateAsync({
      supplier_id: supplierId || undefined,
      received_date: receivedDate,
      po_number: poNumber || undefined,
      invoice_number: invoiceNumber || undefined,
      notes: notes || undefined,
      items: lineItems.map(li => ({
        inventory_item_id: li.inventory_item_id,
        quantity_expected: li.quantity_expected,
        quantity_received: li.quantity_received,
        unit_cost: li.unit_cost,
      })),
    });

    onSuccess?.();
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setSupplierId('');
    setReceivedDate(new Date().toISOString().split('T')[0]);
    setPoNumber('');
    setInvoiceNumber('');
    setNotes('');
    setLineItems([]);
    setSelectedItemId('');
  };

  if (!isOpen) return null;

  const totalItems = lineItems.reduce((sum, li) => sum + li.quantity_received, 0);
  const totalValue = lineItems.reduce((sum, li) => sum + (li.quantity_received * (li.unit_cost || 0)), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className={`flex items-center justify-between ${spacing.card} border-b border-gray-200 dark:border-gray-700`}>
          <div className={`flex items-center ${spacing.gap}`}>
            <div className={`${isCompact ? 'w-8 h-8' : 'w-10 h-10'} rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center`}>
              <HugeiconsIcon icon={PackageReceiveIcon} size={spacing.icon.lg} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className={`${spacing.text.heading} font-semibold text-gray-900 dark:text-gray-100`}>Receive Stock</h2>
              <p className={`${spacing.text.body} text-gray-500 dark:text-gray-400`}>Log incoming inventory from supplier</p>
            </div>
          </div>
          <button onClick={onClose} className={`${isCompact ? 'p-1.5' : 'p-2'} hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg`}>
            <HugeiconsIcon icon={Cancel01Icon} size={spacing.icon.lg} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={`${spacing.card} ${spacing.section} max-h-[calc(90vh-180px)] overflow-y-auto`}>
            {/* Receipt Details */}
            <div className={`grid grid-cols-2 ${spacing.gap}`}>
              <div>
                <label className={`block ${spacing.text.body} font-medium text-gray-700 dark:text-gray-300 mb-1`}>Supplier</label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className={`w-full ${spacing.inputHeight} px-3 ${spacing.rounded} border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 ${spacing.text.body}`}
                >
                  <option value="">Select supplier...</option>
                  {suppliers?.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block ${spacing.text.body} font-medium text-gray-700 dark:text-gray-300 mb-1`}>Received Date</label>
                <input
                  type="date"
                  value={receivedDate}
                  onChange={(e) => setReceivedDate(e.target.value)}
                  className={`w-full ${spacing.inputHeight} px-3 ${spacing.rounded} border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 ${spacing.text.body}`}
                  required
                />
              </div>
              <div>
                <label className={`block ${spacing.text.body} font-medium text-gray-700 dark:text-gray-300 mb-1`}>PO Number</label>
                <input
                  type="text"
                  value={poNumber}
                  onChange={(e) => setPoNumber(e.target.value)}
                  placeholder="Optional"
                  className={`w-full ${spacing.inputHeight} px-3 ${spacing.rounded} border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 ${spacing.text.body}`}
                />
              </div>
              <div>
                <label className={`block ${spacing.text.body} font-medium text-gray-700 dark:text-gray-300 mb-1`}>Invoice Number</label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="Optional"
                  className={`w-full ${spacing.inputHeight} px-3 ${spacing.rounded} border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 ${spacing.text.body}`}
                />
              </div>
            </div>

            {/* Add Items */}
            <div>
              <label className={`block ${spacing.text.body} font-medium text-gray-700 dark:text-gray-300 ${spacing.mb}`}>Add Items</label>
              <div className={`flex ${spacing.gap}`}>
                <select
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className={`flex-1 ${spacing.inputHeight} px-3 ${spacing.rounded} border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 ${spacing.text.body}`}
                >
                  <option value="">Select item to add...</option>
                  {inventoryItems?.filter(i => !lineItems.some(li => li.inventory_item_id === i.id)).map(item => (
                    <option key={item.id} value={item.id}>{item.name} ({item.sku})</option>
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

            {/* Line Items Table */}
            {lineItems.length > 0 && (
              <div className={`border border-gray-200 dark:border-gray-700 ${spacing.roundedLg} overflow-hidden`}>
                <table className={`w-full ${spacing.text.body}`}>
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className={`${spacing.rowPadding} text-left font-medium text-gray-700 dark:text-gray-300`}>Item</th>
                      <th className={`${spacing.rowPadding} text-center font-medium text-gray-700 dark:text-gray-300 w-24`}>Expected</th>
                      <th className={`${spacing.rowPadding} text-center font-medium text-gray-700 dark:text-gray-300 w-24`}>Received</th>
                      <th className={`${spacing.rowPadding} text-center font-medium text-gray-700 dark:text-gray-300 w-28`}>Unit Cost</th>
                      <th className={`${spacing.rowPadding} w-12`}></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {lineItems.map(li => (
                      <tr key={li.inventory_item_id}>
                        <td className={spacing.rowPadding}>
                          <div className={`font-medium text-gray-900 dark:text-gray-100`}>{li.item?.name}</div>
                          <div className={`${spacing.text.caption} text-gray-500`}>{li.item?.sku}</div>
                        </td>
                        <td className={spacing.rowPadding}>
                          <input
                            type="number"
                            min="0"
                            value={li.quantity_expected}
                            onChange={(e) => handleUpdateItem(li.inventory_item_id, 'quantity_expected', parseInt(e.target.value) || 0)}
                            className={`w-full ${spacing.inputHeight} px-2 text-center rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800`}
                          />
                        </td>
                        <td className={spacing.rowPadding}>
                          <input
                            type="number"
                            min="0"
                            value={li.quantity_received}
                            onChange={(e) => handleUpdateItem(li.inventory_item_id, 'quantity_received', parseInt(e.target.value) || 0)}
                            className={`w-full ${spacing.inputHeight} px-2 text-center rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800`}
                          />
                        </td>
                        <td className={spacing.rowPadding}>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={li.unit_cost || ''}
                            onChange={(e) => handleUpdateItem(li.inventory_item_id, 'unit_cost', parseFloat(e.target.value) || 0)}
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
              <div className={`bg-gray-50 dark:bg-gray-800 ${spacing.roundedLg} ${spacing.card} flex justify-between items-center`}>
                <div className={`${spacing.text.body} text-gray-600 dark:text-gray-400`}>
                  <span className="font-medium">{lineItems.length}</span> items, <span className="font-medium">{totalItems}</span> units
                </div>
                <div className={`${spacing.text.heading} font-semibold text-gray-900 dark:text-gray-100`}>
                  Total: UGX {totalValue.toLocaleString()}
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
              disabled={lineItems.length === 0 || createReceipt.isPending}
              className={`${spacing.button} font-medium text-white bg-emerald-600 hover:bg-emerald-700 ${spacing.rounded} disabled:opacity-50 disabled:cursor-not-allowed flex items-center ${spacing.gap}`}
            >
              {createReceipt.isPending && <HugeiconsIcon icon={Loading03Icon} size={spacing.icon.sm} className="animate-spin" />}
              Receive Stock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
