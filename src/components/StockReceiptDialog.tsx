import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { InventoryItem, Supplier } from '@/types/supabase';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useCreateStockReceipt } from '@/hooks/useInventoryTransactions';
import { snakeToCamelCase } from '@/utils/data-helpers';

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
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <Icon icon="tabler:package-import" className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Receive Stock</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Log incoming inventory from supplier</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <Icon icon="tabler:x" className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6 max-h-[calc(90vh-180px)] overflow-y-auto">
            {/* Receipt Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Supplier</label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                >
                  <option value="">Select supplier...</option>
                  {suppliers?.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Received Date</label>
                <input
                  type="date"
                  value={receivedDate}
                  onChange={(e) => setReceivedDate(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">PO Number</label>
                <input
                  type="text"
                  value={poNumber}
                  onChange={(e) => setPoNumber(e.target.value)}
                  placeholder="Optional"
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Invoice Number</label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="Optional"
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                />
              </div>
            </div>

            {/* Add Items */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Add Items</label>
              <div className="flex gap-2">
                <select
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="flex-1 h-10 px-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
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
                  className="px-4 h-10 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Line Items Table */}
            {lineItems.length > 0 && (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Item</th>
                      <th className="px-4 py-2 text-center font-medium text-gray-700 dark:text-gray-300 w-24">Expected</th>
                      <th className="px-4 py-2 text-center font-medium text-gray-700 dark:text-gray-300 w-24">Received</th>
                      <th className="px-4 py-2 text-center font-medium text-gray-700 dark:text-gray-300 w-28">Unit Cost</th>
                      <th className="px-4 py-2 w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {lineItems.map(li => (
                      <tr key={li.inventory_item_id}>
                        <td className="px-4 py-2">
                          <div className="font-medium text-gray-900 dark:text-gray-100">{li.item?.name}</div>
                          <div className="text-xs text-gray-500">{li.item?.sku}</div>
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            min="0"
                            value={li.quantity_expected}
                            onChange={(e) => handleUpdateItem(li.inventory_item_id, 'quantity_expected', parseInt(e.target.value) || 0)}
                            className="w-full h-8 px-2 text-center rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            min="0"
                            value={li.quantity_received}
                            onChange={(e) => handleUpdateItem(li.inventory_item_id, 'quantity_received', parseInt(e.target.value) || 0)}
                            className="w-full h-8 px-2 text-center rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={li.unit_cost || ''}
                            onChange={(e) => handleUpdateItem(li.inventory_item_id, 'unit_cost', parseFloat(e.target.value) || 0)}
                            className="w-full h-8 px-2 text-center rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(li.inventory_item_id)}
                            className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                          >
                            <Icon icon="tabler:trash" className="w-4 h-4" />
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Optional notes..."
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
              />
            </div>

            {/* Summary */}
            {lineItems.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 flex justify-between items-center">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">{lineItems.length}</span> items, <span className="font-medium">{totalItems}</span> units
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Total: UGX {totalValue.toLocaleString()}
                </div>
              </div>
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
            <button
              type="submit"
              disabled={lineItems.length === 0 || createReceipt.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {createReceipt.isPending && <Icon icon="tabler:loader-2" className="w-4 h-4 animate-spin" />}
              Receive Stock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
