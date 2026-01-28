import React, { useState } from 'react';
import { AlertCircle, X, Shield, AlertTriangle, Clock, Cloud, Info, MoreHorizontal, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { InventoryItem, LossType, LOSS_TYPE_LABELS } from '@/types/supabase';
import { useCreateShrinkageRecord } from '@/hooks/useInventoryTransactions';
import { snakeToCamelCase } from '@/utils/data-helpers';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { LucideIcon } from 'lucide-react';

interface ShrinkageRecordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  preselectedItem?: InventoryItem | null;
}

const LOSS_TYPES: LossType[] = ['theft', 'damage', 'expired', 'spoilage', 'unknown', 'other'];

const LOSS_TYPE_ICONS: Record<LossType, LucideIcon> = {
  theft: Shield,
  damage: AlertTriangle,
  expired: Clock,
  spoilage: Cloud,
  unknown: Info,
  other: MoreHorizontal,
};

const LOSS_TYPE_COLORS: Record<LossType, string> = {
  theft: 'bg-destructive/10 text-destructive border-destructive/20',
  damage: 'bg-muted text-muted-foreground border-orange-200',
  expired: 'bg-amber-50 text-amber-700 border-amber-200',
  spoilage: 'bg-amber-100 text-amber-700 border-amber-200',
  unknown: 'bg-muted text-muted-foreground border-border',
  other: 'bg-muted text-muted-foreground border-border',
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

  const LossIcon = LOSS_TYPE_ICONS[lossType];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        {/* Header */}
        <DialogHeader className="flex-row items-center gap-3 space-y-0">
          <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <DialogTitle className="text-base">Record Shrinkage</DialogTitle>
            <DialogDescription className="text-xs">Log inventory loss or damage</DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Item Selection */}
            <div>
              <Label htmlFor="item" className="text-xs">Item <span className="text-destructive">*</span></Label>
              <Select
                value={selectedItemId}
                onValueChange={(value) => {
                  setSelectedItemId(value);
                  setQuantityLost(1);
                }}
                required
              >
                <SelectTrigger id="item">
                  <SelectValue placeholder="Select item..." />
                </SelectTrigger>
                <SelectContent>
                  {inventoryItems?.filter(i => (i.quantity_on_hand ?? 0) > 0).map(item => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} ({item.sku}) - {item.quantity_on_hand} in stock
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Loss Type */}
            <div>
              <Label className="text-xs mb-2 block">Loss Type <span className="text-destructive">*</span></Label>
              <div className="grid grid-cols-3 gap-2">
                {LOSS_TYPES.map(type => {
                  const Icon = LOSS_TYPE_ICONS[type];
                  return (
                    <Button
                      key={type}
                      type="button"
                      variant={lossType === type ? "default" : "outline"}
                      size="sm"
                      onClick={() => setLossType(type)}
                      className={`justify-start ${
                        lossType === type ? LOSS_TYPE_COLORS[type] : ''
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-1.5" />
                      {LOSS_TYPE_LABELS[type]}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Quantity and Date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="quantity" className="text-xs">Quantity Lost <span className="text-destructive">*</span></Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max={maxQuantity}
                  value={quantityLost}
                  onChange={(e) => setQuantityLost(Math.min(parseInt(e.target.value) || 1, maxQuantity))}
                  required
                />
                {selectedItem && (
                  <p className="text-xs text-muted-foreground mt-1">Max: {maxQuantity}</p>
                )}
              </div>
              <div>
                <Label htmlFor="date" className="text-xs">Discovered Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={discoveredDate}
                  onChange={(e) => setDiscoveredDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes" className="text-xs">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Describe the circumstances..."
              />
            </div>

            {/* Estimated Value */}
            {selectedItem && quantityLost > 0 && (
              <div className="bg-destructive/10 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-destructive">Estimated Loss Value</span>
                  <span className="text-lg font-semibold text-destructive">
                    UGX {estimatedValue.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-destructive mt-1">
                  {quantityLost} × UGX {(selectedItem.unit_price ?? 0).toLocaleString()} per unit
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              size="sm"
              disabled={!selectedItemId || quantityLost <= 0 || createShrinkage.isPending}
            >
              {createShrinkage.isPending && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
              Record Shrinkage
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};


