import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  Cancel01Icon,
  Alert01Icon,
  Shield01Icon,
  Clock01Icon,
  CloudIcon,
  InformationCircleIcon,
  MoreHorizontalIcon,
  Loading03Icon
} from '@hugeicons/core-free-icons';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { InventoryItem, LossType, LOSS_TYPE_LABELS } from '@/types/supabase';
import { useCreateShrinkageRecord } from '@/hooks/useInventoryTransactions';
import { snakeToCamelCase } from '@/utils/data-helpers';
import type { IconSvgObject } from '@hugeicons/core-free-icons';

interface ShrinkageRecordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  preselectedItem?: InventoryItem | null;
}

const LOSS_TYPES: LossType[] = ['theft', 'damage', 'expired', 'spoilage', 'unknown', 'other'];

const LOSS_TYPE_ICONS: Record<LossType, IconSvgObject> = {
  theft: Shield01Icon,
  damage: Alert01Icon,
  expired: Clock01Icon,
  spoilage: CloudIcon,
  unknown: InformationCircleIcon,
  other: MoreHorizontalIcon,
};

const LOSS_TYPE_COLORS: Record<LossType, string> = {
  theft: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
  damage: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
  expired: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
  spoilage: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
  unknown: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
  other: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
};

export const ShrinkageRecordDialog: React.FC<ShrinkageRecordDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
  preselectedItem,
}) => {
  const [selectedItemId, setSelectedItemId] = useState<string>(preselectedItem?.id || '');
  const [quantityLost, setQuantityLost] = useState<number>(1);
  const [lossType, setLossType] = useState<LossType>('damage');
  const [discoveredDate, setDiscoveredDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const createShrinkage = useCreateShrinkageRecord();

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

  const selectedItem = inventoryItems?.find(i => i.id === selectedItemId);
  const maxQuantity = selectedItem?.quantity_on_hand ?? 0;
  const estimatedValue = selectedItem ? quantityLost * (selectedItem.unit_price ?? 0) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId || quantityLost <= 0) return;

    await createShrinkage.mutateAsync({
      inventory_item_id: selectedItemId,
      quantity_lost: quantityLost,
      loss_type: lossType,
      discovered_date: discoveredDate,
      estimated_value: estimatedValue,
      notes: notes || undefined,
    });

    onSuccess?.();
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setSelectedItemId(preselectedItem?.id || '');
    setQuantityLost(1);
    setLossType('damage');
    setDiscoveredDate(new Date().toISOString().split('T')[0]);
    setNotes('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <HugeiconsIcon icon={Alert01Icon} size={20} className="text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Record Shrinkage</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Log inventory loss or damage</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <HugeiconsIcon icon={Cancel01Icon} size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-5">
            {/* Item Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Item *</label>
              <select
                value={selectedItemId}
                onChange={(e) => {
                  setSelectedItemId(e.target.value);
                  setQuantityLost(1);
                }}
                className="w-full h-10 px-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                required
              >
                <option value="">Select item...</option>
                {inventoryItems?.filter(i => (i.quantity_on_hand ?? 0) > 0).map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.sku}) - {item.quantity_on_hand} in stock
                  </option>
                ))}
              </select>
            </div>

            {/* Loss Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Loss Type *</label>
              <div className="grid grid-cols-3 gap-2">
                {LOSS_TYPES.map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setLossType(type)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      lossType === type
                        ? LOSS_TYPE_COLORS[type]
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <HugeiconsIcon icon={LOSS_TYPE_ICONS[type]} size={16} />
                    {LOSS_TYPE_LABELS[type]}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity and Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity Lost *</label>
                <input
                  type="number"
                  min="1"
                  max={maxQuantity}
                  value={quantityLost}
                  onChange={(e) => setQuantityLost(Math.min(parseInt(e.target.value) || 1, maxQuantity))}
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                  required
                />
                {selectedItem && (
                  <p className="text-xs text-gray-500 mt-1">Max: {maxQuantity}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Discovered Date</label>
                <input
                  type="date"
                  value={discoveredDate}
                  onChange={(e) => setDiscoveredDate(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                  required
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Describe the circumstances..."
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
              />
            </div>

            {/* Estimated Value */}
            {selectedItem && quantityLost > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-red-700 dark:text-red-300">Estimated Loss Value</span>
                  <span className="text-lg font-semibold text-red-700 dark:text-red-300">
                    UGX {estimatedValue.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {quantityLost} × UGX {(selectedItem.unit_price ?? 0).toLocaleString()} per unit
                </p>
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
              disabled={!selectedItemId || quantityLost <= 0 || createShrinkage.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {createShrinkage.isPending && <HugeiconsIcon icon={Loading03Icon} size={16} className="animate-spin" />}
              Record Shrinkage
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
