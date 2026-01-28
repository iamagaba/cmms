import React, { useState, useMemo } from 'react';
import { Clipboard, Check, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { InventoryItem } from '@/types/supabase';
import { useCreateCycleCount, useUpdateCycleCountItem, useCompleteCycleCount, useCycleCount } from '@/hooks/useInventoryTransactions';
import { getUniqueWarehouses } from '@/utils/inventory-categorization-helpers';
import { snakeToCamelCase } from '@/utils/data-helpers';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { Checkbox } from '@/components/ui/checkbox';

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 py-3 border-b border-border m-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Clipboard className="w-4 h-4 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                {mode === 'setup' ? 'Start Cycle Count' : 'Cycle Count in Progress'}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {mode === 'setup' ? 'Select items to count' : 'Enter counted quantities'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6 max-h-[calc(90vh-180px)] overflow-y-auto">
          {mode === 'setup' ? (
            <>
              {/* Setup Mode */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="warehouse" className="text-xs mb-1.5">Warehouse (Optional)</Label>
                  <Select
                    value={warehouse}
                    onValueChange={(value) => {
                      setWarehouse(value);
                      setLineItems([]);
                    }}
                  >
                    <SelectTrigger id="warehouse">
                      <SelectValue placeholder="All Warehouses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Warehouses</SelectItem>
                      {warehouses.map(w => (
                        <SelectItem key={w} value={w}>{w}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="countDate" className="text-xs mb-1.5">Count Date</Label>
                  <Input
                    id="countDate"
                    type="date"
                    value={countDate}
                    onChange={(e) => setCountDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Item Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs">
                    Select Items to Count ({lineItems.length} selected)
                  </Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      onClick={handleSelectAll}
                      className="h-auto p-0 text-xs"
                    >
                      Select All
                    </Button>
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      onClick={handleClearAll}
                      className="h-auto p-0 text-xs text-muted-foreground"
                    >
                      Clear
                    </Button>
                  </div>
                </div>
                <div className="border border-border rounded-lg max-h-64 overflow-y-auto">
                  {warehouseItems.map(item => {
                    const isSelected = lineItems.some(li => li.inventory_item_id === item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleToggleItem(item)}
                        className={`flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-muted/50 border-b border-border last:border-0 ${
                          isSelected ? 'bg-primary/5' : ''
                        }`}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleToggleItem(item)}
                          className="pointer-events-none"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{item.name}</div>
                          <div className="text-xs text-muted-foreground">{item.sku} • {item.warehouse || 'No location'}</div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Qty: {item.quantity_on_hand ?? 0}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes" className="text-xs mb-1.5">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Optional notes..."
                />
              </div>
            </>
          ) : (
            <>
              {/* Counting Mode */}
              <div className="bg-primary/5 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-primary">
                    Progress: {countedItems} / {lineItems.length} items counted
                  </div>
                  <div className="text-xs text-primary mt-1">
                    Total Variance: {totalVariance > 0 ? '+' : ''}{totalVariance}
                  </div>
                </div>
                <div className="w-32 h-2 bg-primary/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${(countedItems / lineItems.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Count Entry Table */}
              <div className="border border-border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-center w-24">System Qty</TableHead>
                      <TableHead className="text-center w-28">Counted Qty</TableHead>
                      <TableHead className="text-center w-24">Variance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lineItems.map(li => {
                      const variance = li.counted_quantity !== undefined
                        ? li.counted_quantity - li.system_quantity
                        : null;
                      return (
                        <TableRow key={li.inventory_item_id}>
                          <TableCell>
                            <div className="font-medium text-sm">{li.item?.name}</div>
                            <div className="text-xs text-muted-foreground">{li.item?.sku}</div>
                          </TableCell>
                          <TableCell className="text-center text-muted-foreground">
                            {li.system_quantity}
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              value={li.counted_quantity ?? ''}
                              onChange={(e) => handleUpdateCount(li.inventory_item_id, parseInt(e.target.value) || 0)}
                              placeholder="Count"
                              className="h-8 text-center"
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            {variance !== null && (
                              <span className={`font-medium ${
                                variance === 0
                                  ? 'text-muted-foreground'
                                  : variance > 0
                                    ? 'text-foreground'
                                    : 'text-destructive'
                              }`}>
                                {variance > 0 ? '+' : ''}{variance}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-3 border-t border-border bg-muted/50">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
          >
            Cancel
          </Button>
          {mode === 'setup' ? (
            <Button
              size="sm"
              onClick={handleStartCount}
              disabled={lineItems.length === 0 || createCycleCount.isPending}
            >
              {createCycleCount.isPending && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
              Start Count ({lineItems.length} items)
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleCompleteCount}
              disabled={countedItems < lineItems.length || completeCycleCount.isPending}
            >
              {completeCycleCount.isPending && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
              Complete Count
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

