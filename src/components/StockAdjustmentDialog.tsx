import { AlertCircle, Info, Loader2, Plus, Search, Settings, X, PackageMinus } from 'lucide-react';
import React, { useState, useEffect, useMemo } from 'react';


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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


interface StockAdjustmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void | Promise<void>;
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
      // Wait for success callback to complete before closing
      if (onSuccess) {
        await onSuccess();
      }
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
          className="w-screen max-w-xl bg-background shadow-2xl flex flex-col border-l"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b bg-muted/50">
            <div>
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                <h2 className="text-base font-semibold">
                  Stock Adjustment
                </h2>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Adjust quantities for one or more items
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-7 w-7"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Form */}
          <form id="stock-adjustment-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-4">

              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                      <p className="text-xs font-medium text-destructive">Fix the following errors:</p>
                      <ul className="mt-1 text-xs text-destructive list-disc list-inside">
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
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Package className="w-4 h-4 text-primary" />
                  Items to Adjust
                </h3>

                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Search className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <Input
                    placeholder="Search by name or SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />

                  {/* Search Results Dropdown */}
                  {filteredItems.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-background border rounded-lg shadow-lg max-h-48 overflow-auto">
                      {filteredItems.map(item => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleAddItem(item)}
                          className="w-full px-3 py-2 text-left hover:bg-muted flex items-center justify-between"
                        >
                          <div>
                            <p className="text-sm font-medium">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.sku}</p>
                          </div>
                          <span className="text-xs text-muted-foreground">
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
                        className={`border rounded-lg p-3 ${isNegative
                            ? 'border-destructive/30 bg-destructive/10'
                            : 'border-border'
                          }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-sm font-medium">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.sku}</p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(item.id)}
                            className="h-6 w-6"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-3 gap-3 items-center">
                          <div>
                            <Label className="text-xs text-muted-foreground mb-1">Current</Label>
                            <p className="text-sm font-semibold">
                              {item.quantity_on_hand ?? 0}
                            </p>
                          </div>

                          <div>
                            <Label className="text-xs text-muted-foreground mb-1">Change</Label>
                            <Input
                              type="number"
                              value={quantityDelta || ''}
                              onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                              placeholder="0"
                              className="h-8"
                            />
                          </div>

                          <div>
                            <Label className="text-xs text-muted-foreground mb-1">Projected</Label>
                            <p className={`text-sm font-semibold ${isNegative
                                ? 'text-destructive'
                                : ''
                              }`}>
                              {projected}
                              {isNegative && (
                                <AlertCircle className="w-4 h-4 inline ml-1" />
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
                <div className="text-center py-8 text-muted-foreground">
                  <PackageMinus className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Search and add items to adjust</p>
                </div>
              )}

              {/* Reason Selection */}
              <div>
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Tag01Icon className="w-4 h-4 text-primary" />
                  Adjustment Reason
                </h3>

                <Select
                  value={reason}
                  onValueChange={(value) => setReason(value as AdjustmentReason)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a reason..." />
                  </SelectTrigger>
                  <SelectContent>
                    {ADJUSTMENT_REASONS.map(r => (
                      <SelectItem key={r} value={r}>{ADJUSTMENT_REASON_LABELS[r]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div>
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  Notes
                  {reason === 'other' && <span className="text-destructive">*</span>}
                </h3>

                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder={reason === 'other' ? 'Required: Explain the adjustment...' : 'Optional notes...'}
                  required={reason === 'other'}
                />
              </div>

            </div>
          </form>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/50">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={batchMutation.isPending}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              size="sm"
              form="stock-adjustment-form"
              disabled={batchMutation.isPending || lineItems.length === 0}
            >
              {batchMutation.isPending && (
                <Loader2 className="w-5 h-5 animate-spin mr-1.5" />
              )}
              Save Adjustment
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};


