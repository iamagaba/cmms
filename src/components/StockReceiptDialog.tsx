import React, { useState } from 'react';
import { InventoryItem } from '@/types/supabase';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  PackageReceiveIcon,
  Delete01Icon,
  Loading03Icon
} from '@hugeicons/core-free-icons';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useCreateStockReceipt } from '@/hooks/useInventoryTransactions';
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


interface StockReceiptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const receiptSchema = z.object({
  supplier_id: z.string().optional(),
  received_date: z.string().min(1, "Date is required"),
  po_number: z.string().optional(),
  invoice_number: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    inventory_item_id: z.string(),
    item_name: z.string().optional(), // For display
    item_sku: z.string().optional(),  // For display
    quantity_expected: z.coerce.number().min(0),
    quantity_received: z.coerce.number().min(0),
    unit_cost: z.coerce.number().min(0).optional(),
  })).min(1, "At least one item is required"),
});

type ReceiptFormValues = z.infer<typeof receiptSchema>;

export const StockReceiptDialog: React.FC<StockReceiptDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedItemId, setSelectedItemId] = useState<string>('');

  const { data: suppliers } = useSuppliers();
  const createReceipt = useCreateStockReceipt();

  const form = useForm<ReceiptFormValues>({
    resolver: zodResolver(receiptSchema),
    defaultValues: {
      supplier_id: '',
      received_date: new Date().toISOString().split('T')[0],
      po_number: '',
      invoice_number: '',
      notes: '',
      items: [],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
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

  const handleAddItem = () => {
    if (!selectedItemId) return;
    const item = inventoryItems?.find(i => i.id === selectedItemId);
    if (!item) return;

    // Check if already added
    if (fields.some(field => field.inventory_item_id === selectedItemId)) {
      return;
    }

    append({
      inventory_item_id: selectedItemId,
      item_name: item.name,
      item_sku: item.sku,
      quantity_expected: 1,
      quantity_received: 1,
      unit_cost: item.unit_price,
    });
    setSelectedItemId('');
  };

  const onSubmit = async (values: ReceiptFormValues) => {
    await createReceipt.mutateAsync({
      supplier_id: values.supplier_id || undefined,
      received_date: values.received_date,
      po_number: values.po_number || undefined,
      invoice_number: values.invoice_number || undefined,
      notes: values.notes || undefined,
      items: values.items.map(li => ({
        inventory_item_id: li.inventory_item_id,
        quantity_expected: li.quantity_expected,
        quantity_received: li.quantity_received,
        unit_cost: li.unit_cost,
      })),
    });

    onSuccess?.();
    onClose();
    form.reset();
  };

  // Calculate totals for display
  const items = form.watch('items');
  const totalItems = items?.reduce((sum, li) => sum + (li.quantity_received || 0), 0) || 0;
  const totalValue = items?.reduce((sum, li) => sum + ((li.quantity_received || 0) * (li.unit_cost || 0)), 0) || 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <HugeiconsIcon icon={PackageReceiveIcon} size={24} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">Receive Stock</DialogTitle>
              <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">Log incoming inventory from supplier</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 overflow-hidden flex flex-col">
            <div className="p-4 space-y-6 max-h-[calc(90vh-180px)] overflow-y-auto">
              {/* Receipt Details */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="supplier_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select supplier..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {suppliers?.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
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
                  name="received_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Received Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="po_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PO Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Optional" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="invoice_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Optional" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Add Items */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Add Items</label>
                <div className="flex gap-2">
                  <Select
                    value={selectedItemId}
                    onValueChange={setSelectedItemId}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select item to add..." />
                    </SelectTrigger>
                    <SelectContent>
                      {inventoryItems?.filter(i => !fields.some(li => li.inventory_item_id === i.id)).map(item => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name} ({item.sku})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    onClick={handleAddItem}
                    disabled={!selectedItemId}
                    className="bg-purple-600 hover:bg-purple-700"
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

              {/* Line Items Table */}
              {fields.length > 0 && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-50 dark:bg-gray-800">
                      <TableRow>
                        <TableHead className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300 h-auto">Item</TableHead>
                        <TableHead className="px-4 py-3 text-center font-medium text-gray-700 dark:text-gray-300 w-24 h-auto">Expected</TableHead>
                        <TableHead className="px-4 py-3 text-center font-medium text-gray-700 dark:text-gray-300 w-24 h-auto">Received</TableHead>
                        <TableHead className="px-4 py-3 text-center font-medium text-gray-700 dark:text-gray-300 w-28 h-auto">Unit Cost</TableHead>
                        <TableHead className="px-4 py-3 w-12 h-auto"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {fields.map((field, index) => (
                        <TableRow key={field.id}>
                          <TableCell className="px-4 py-3">
                            <div className="font-medium text-gray-900 dark:text-gray-100">{field.item_name}</div>
                            <div className="text-xs text-gray-500">{field.item_sku}</div>
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <FormField
                              control={form.control}
                              name={`items.${index}.quantity_expected`}
                              render={({ field }) => (
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="0"
                                    className="h-8 px-2 text-center"
                                    {...field}
                                  />
                                </FormControl>
                              )}
                            />
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <FormField
                              control={form.control}
                              name={`items.${index}.quantity_received`}
                              render={({ field }) => (
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="0"
                                    className="h-8 px-2 text-center"
                                    {...field}
                                  />
                                </FormControl>
                              )}
                            />
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <FormField
                              control={form.control}
                              name={`items.${index}.unit_cost`}
                              render={({ field }) => (
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    className="h-8 px-2 text-center"
                                    {...field}
                                  />
                                </FormControl>
                              )}
                            />
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                            >
                              <HugeiconsIcon icon={Delete01Icon} size={16} />
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
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 flex justify-between items-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">{fields.length}</span> items, <span className="font-medium">{totalItems}</span> units
                  </div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Total: UGX {totalValue.toLocaleString()}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700"
                disabled={fields.length === 0 || form.formState.isSubmitting}
              >
                {form.formState.isSubmitting && <HugeiconsIcon icon={Loading03Icon} size={16} className="animate-spin mr-2" />}
                Receive Stock
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
