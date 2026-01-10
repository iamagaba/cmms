import React, { useState, useEffect, useMemo } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  PackageIcon,
  Add01Icon,
  MinusSignIcon,
  AlertCircleIcon,
  InformationCircleIcon,
  Settings02Icon,
  Cancel01Icon,
  Search01Icon,
  Alert01Icon,
  PackageRemoveIcon,
  Tag01Icon,
  NoteIcon,
  Loading01Icon
} from '@hugeicons/core-free-icons';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  InventoryItem, 
  AdjustmentReason, 
  ADJUSTMENT_REASON_LABELS 
} from '@/types/supabase';
import { snakeToCamelCase } from '@/utils/data-helpers';
import { 
  validateBatchAdjustment, 
  calculateProjectedQuantity,
  formatBatchAdjustmentInput 
} from '@/utils/stock-adjustment-helpers';
import { useBatchAdjustment } from '@/hooks/useStockAdjustments';
import { Input } from '@/components/ui/enterprise';
import { useDensitySpacing } from '@/hooks/useDensitySpacing';
import { useDensity } from '@/context/DensityContext';

interface StockAdjustmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  preselectedItem?: InventoryItem | null;
}

interface AdjustmentLineItem {
  item: InventoryItem;
  quantityDelta: number;
}

const ADJUSTMENT_REASONS: AdjustmentReason[] = [
  'received',
  'damaged',
  'returned',
  'cycle_count',
  'theft',
  'expired',
  'transfer_out',
  'transfer_in',
  'initial_stock',
  'other',
];

export const StockAdjustmentDialog: React.FC<StockAdjustmentDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
  preselectedItem,
}) => {
  const spacing = useDensitySpacing();
  const { isCompact } = useDensity();
  const [lineItems, setLineItems] = useState<AdjustmentLineItem[]>([]);
  const [reason, setReason] = useState<AdjustmentReason | ''>('');
  const [notes, setNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const batchMutation = useBatchAdjustment();

  // Fetch inventory items for search
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

  // Initialize with preselected item
  useEffect(() => {
    if (isOpen && preselectedItem) {
      setLineItems([{ item: preselectedItem, quantityDelta: 0 }]);
    }
  }, [isOpen, preselectedItem]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setLineItems([]);
      setReason('');
      setNotes('');
      setSearchTerm('');
      setValidationErrors([]);
    }
  }, [isOpen]);

  // Filter items for search dropdown
  const filteredItems = useMemo(() => {
    if (!inventoryItems || !searchTerm) return [];
    const query = searchTerm.toLowerCase();
    const addedIds = new Set(lineItems.map(li => li.item.id));
    
    return inventoryItems
      .filter(item => 
        !addedIds.has(item.id) && (
          item.name?.toLowerCase().includes(query) ||
          item.sku?.toLowerCase().includes(query)
        )
      )
      .slice(0, 10);
  }, [inventoryItems, searchTerm, lineItems]);

  const handleAddItem = (item: InventoryItem) => {
    setLineItems(prev => [...prev, { item, quantityDelta: 0 }]);
    setSearchTerm('');
  };

  const handleRemoveItem = (itemId: string) => {
    setLineItems(prev => prev.filter(li => li.item.id !== itemId));
  };

  const handleQuantityChange = (itemId: string, delta: number) => {
    setLineItems(prev => 
      prev.map(li => 
        li.item.id === itemId ? { ...li, quantityDelta: delta } : li
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors([]);

    // Validate
    const validation = validateBatchAdjustment(
      lineItems,
      reason || null,
      notes
    );

    if (!validation.valid) {
      setValidationErrors(validation.errors.map(e => e.error));
      return;
    }

    // Submit
    const input = formatBatchAdjustmentInput(lineItems, reason as AdjustmentReason, notes);
    
    try {
      await batchMutation.mutateAsync(input);
      onSuccess?.();
      onClose();
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 transition-opacity" onClick={onClose} />
      
      {/* Dialog */}
      <div className="absolute inset-y-0 right-0 flex max-w-full">
        <div 
          className="w-screen max-w-xl bg-white dark:bg-gray-900 shadow-2xl flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`flex items-center justify-between ${spacing.card} border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800`}>
            <div>
              <div className={`flex items-center ${spacing.gap}`}>
                <HugeiconsIcon icon={Settings02Icon} size={spacing.icon.lg} className="text-purple-600" />
                <h2 className={`${isCompact ? 'text-lg' : 'text-xl'} font-semibold text-gray-900 dark:text-gray-100`}>
                  Stock Adjustment
                </h2>
              </div>
              <p className={`${spacing.text.body} text-gray-500 dark:text-gray-400 mt-0.5`}>
                Adjust quantities for one or more items
              </p>
            </div>
            <button
              onClick={onClose}
              className={`${isCompact ? 'p-1.5' : 'p-2'} text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ${spacing.roundedLg} hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
            >
              <HugeiconsIcon icon={Cancel01Icon} size={spacing.icon.md} />
            </button>
          </div>

          {/* Form */}
          <form id="stock-adjustment-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              
              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <HugeiconsIcon icon={AlertCircleIcon} size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-800 dark:text-red-300">Please fix the following errors:</p>
                      <ul className="mt-1 text-sm text-red-700 dark:text-red-400 list-disc list-inside">
                        {validationErrors.map((error, i) => (
                          <li key={i}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Item Search */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <HugeiconsIcon icon={PackageIcon} size={16} className="text-purple-600" />
                  Items to Adjust
                </h3>
                
                <div className="relative">
                  <Input
                    placeholder="Search by name or SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    leftIcon={<HugeiconsIcon icon={Search01Icon} size={16} className="text-gray-400" />}
                  />
                  
                  {/* Search Results Dropdown */}
                  {filteredItems.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-auto">
                      {filteredItems.map(item => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleAddItem(item)}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{item.sku}</p>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Qty: {item.quantity_on_hand}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Line Items */}
              {lineItems.length > 0 && (
                <div className="space-y-3">
                  {lineItems.map(({ item, quantityDelta }) => {
                    const projected = calculateProjectedQuantity(item.quantity_on_hand ?? 0, quantityDelta);
                    const isNegative = projected < 0;
                    
                    return (
                      <div 
                        key={item.id} 
                        className={`border rounded-lg p-3 ${
                          isNegative 
                            ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20' 
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{item.sku}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                          >
                            <HugeiconsIcon icon={Cancel01Icon} size={16} />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3 items-center">
                          <div>
                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Current</label>
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {item.quantity_on_hand ?? 0}
                            </p>
                          </div>
                          
                          <div>
                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Change</label>
                            <input
                              type="number"
                              value={quantityDelta || ''}
                              onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                              placeholder="0"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Projected</label>
                            <p className={`text-sm font-semibold ${
                              isNegative 
                                ? 'text-red-600 dark:text-red-400' 
                                : 'text-gray-900 dark:text-gray-100'
                            }`}>
                              {projected}
                              {isNegative && (
                                <HugeiconsIcon icon={Alert01Icon} size={12} className="inline ml-1" />
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {lineItems.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <HugeiconsIcon icon={PackageRemoveIcon} size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Search and add items to adjust</p>
                </div>
              )}

              {/* Reason Selection */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <HugeiconsIcon icon={Tag01Icon} size={16} className="text-purple-600" />
                  Adjustment Reason
                </h3>
                
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as AdjustmentReason)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  required
                >
                  <option value="">Select a reason...</option>
                  {ADJUSTMENT_REASONS.map(r => (
                    <option key={r} value={r}>{ADJUSTMENT_REASON_LABELS[r]}</option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <HugeiconsIcon icon={NoteIcon} size={16} className="text-purple-600" />
                  Notes
                  {reason === 'other' && <span className="text-red-500">*</span>}
                </h3>
                
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder={reason === 'other' ? 'Required: Explain the adjustment...' : 'Optional notes...'}
                  required={reason === 'other'}
                />
              </div>

            </div>
          </form>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
            <button
              type="button"
              onClick={onClose}
              disabled={batchMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              form="stock-adjustment-form"
              disabled={batchMutation.isPending || lineItems.length === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {batchMutation.isPending && (
                <HugeiconsIcon icon={Loading01Icon} size={16} className="animate-spin" />
              )}
              Save Adjustment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
