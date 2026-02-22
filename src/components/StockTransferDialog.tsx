import React, { useState, useMemo, useEffect } from 'react';
import { ArrowRight, Building2, Trash2, Loader, ArrowLeftRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { InventoryItem } from '@/types/supabase';
import { useCreateStockTransfer } from '@/hooks/useInventoryTransactions';
import { getUniqueWarehouses } from '@/utils/inventory-categorization-helpers';
import { snakeToCamelCase } from '@/utils/data-helpers';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';


interface StockTransferDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const transferSchema = z.object({
  from_warehouse: z.string().min(1, "Source warehouse is required"),
  to_warehouse: z.string().min(1, "Destination warehouse is required"),
  transfer_date: z.string().min(1, "Date is required"),
  notes: z.string().optional(),
  items: z.array(z.object({
    inventory_item_id: z.string(),
    item_name: z.string().optional(),
    item_sku: z.string().optional(),
    quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
    maxQuantity: z.number(),
  })).min(1, "At least one item is required")
}).refine((data) => data.from_warehouse !== data.to_warehouse, {
  message: "Source and destination warehouses must be different",
  path: ["to_warehouse"],
});

type TransferFormValues = z.infer<typeof transferSchema>;

export const StockTransferDialog: React.FC<StockTransferDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedItemId, setSelectedItemId] = useState<string>('');

  const createTransfer = useCreateStockTransfer();

  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      from_warehouse: '',
      to_warehouse: '',
      transfer_date: new Date().toISOString().split('T')[0],
      notes: '',
      items: [],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "items",
  });

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

  const fromWarehouse = form.watch('from_warehouse');
  const toWarehouse = form.watch('to_warehouse');

  // Filter items by source warehouse
  const availableItems = useMemo(() => {
    if (!fromWarehouse || !inventoryItems) return [];
    return inventoryItems.filter(i =>
      i.warehouse === fromWarehouse &&
      (i.quantity_on_hand ?? 0) > 0 &&
      !fields.some(li => li.inventory_item_id === i.id)
    );
  }, [inventoryItems, fromWarehouse, fields]);

  const handleAddItem = () => {
    if (!selectedItemId) return;
    const item = inventoryItems?.find(i => i.id === selectedItemId);
    if (!item) return;

    append({
      inventory_item_id: selectedItemId,
      item_name: item.name,
      item_sku: item.sku,
      quantity: 1,
      maxQuantity: item.quantity_on_hand ?? 0,
    });
    setSelectedItemId('');
  };

  const onSubmit = async (values: TransferFormValues) => {
    await createTransfer.mutateAsync({
      from_warehouse: values.from_warehouse,
      to_warehouse: values.to_warehouse,
      transfer_date: values.transfer_date,
      notes: values.notes || undefined,
      items: values.items.map(li => ({
        inventory_item_id: li.inventory_item_id,
        quantity: li.quantity,
      })),
    });

    onSuccess?.();
    onClose();
    form.reset();
  };

  const totalItems = fields.reduce((sum, li) => sum + li.quantity, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted dark:bg-blue-900/30 flex items-center justify-center">
              <ArrowLeftRight className="w-6 h-6 text-muted-foreground dark:text-blue-400" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">Transfer Stock</DialogTitle>
              <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">Move inventory between locations</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 overflow-hidden flex flex-col">
            <div className="p-4 space-y-6 max-h-[calc(90vh-180px)] overflow-y-auto">
              {/* Transfer Details */}
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="from_warehouse"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From Warehouse *</FormLabel>
                      <Select
                        onValueChange={(val) => {
                          field.onChange(val);
                          replace([]); // Clear items when source changes
                        }}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select warehouse..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {warehouses.map(w => (
                            <SelectItem key={w} value={w} disabled={w === toWarehouse}>
                              {w}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="to_warehouse"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>To Warehouse *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select warehouse..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {warehouses.map(w => (
                            <SelectItem key={w} value={w} disabled={w === fromWarehouse}>
                              {w}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="transfer_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transfer Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Visual Transfer Indicator */}
              {fromWarehouse && toWarehouse && (
                <div className="flex items-center justify-center gap-4 p-4 bg-muted rounded-lg">
                  <div className="text-center">
                    <Building2 className="w-8 h-8 text-muted-foreground mx-auto mb-1" />
                    <div className="text-sm font-medium">{fromWarehouse}</div>
                  </div>
                  <ArrowRight className="w-6 h-6 text-primary" />
                  <div className="text-center">
                    <Building2 className="w-8 h-8 text-primary mx-auto mb-1" />
                    <div className="text-sm font-medium">{toWarehouse}</div>
                  </div>
                </div>
              )}

              {/* Add Items */}
              {fromWarehouse && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Add Items from {fromWarehouse}</label>
                  <div className="flex gap-2">
                    <Select
                      value={selectedItemId}
                      onValueChange={setSelectedItemId}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select item to transfer..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableItems.map(item => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name} ({item.sku}) - {item.quantity_on_hand} available
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      onClick={handleAddItem}
                      disabled={!selectedItemId}
                      variant="default"
                    >
                      Add
                    </Button>
                  </div>
                  {form.formState.errors.items && (
                    <p className="text-sm font-medium text-destructive mt-2">
                      {form.formState.errors.items.message}
                    </p>
                  )}
                </div>
              )}

              {/* Line Items Table */}
              {fields.length > 0 && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead className="text-center w-24">Available</TableHead>
                        <TableHead className="text-center w-28">Transfer Qty</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fields.map((field, index) => (
                        <TableRow key={field.id}>
                          <TableCell>
                            <div className="font-medium text-sm">{field.item_name}</div>
                            <div className="text-xs text-muted-foreground">{field.item_sku}</div>
                          </TableCell>
                          <TableCell className="text-center text-muted-foreground">
                            {field.maxQuantity}
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`items.${index}.quantity`}
                              render={({ field }) => (
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="1"
                                    max={fields[index].maxQuantity}
                                    className="text-center"
                                    {...field}
                                  />
                                </FormControl>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="p-1.5 text-destructive hover:bg-destructive/10 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Optional notes..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Summary */}
              {fields.length > 0 && (
                <div className="bg-muted dark:bg-blue-900/20 rounded-lg p-4">
                  <div className="text-sm text-muted-foreground dark:text-blue-300">
                    Transferring <span className="font-semibold">{fields.length}</span> items ({totalItems} units) from {fromWarehouse} to {toWarehouse}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-border bg-muted">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={fields.length === 0 || !fromWarehouse || !toWarehouse || form.formState.isSubmitting}
              >
                {form.formState.isSubmitting && <Loader className="w-4 h-4 animate-spin mr-2" />}
                Transfer
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
