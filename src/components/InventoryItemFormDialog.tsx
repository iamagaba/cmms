import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { CategoryMultiSelect } from './CategoryMultiSelect';
import { SupplierSelect } from './SupplierSelect';
import { UnitOfMeasureSelect } from './UnitOfMeasureSelect';
import { StorageLocationFields } from './StorageLocationFields';
import { Package, Info, Tag, Ruler, MapPin, ChevronDown, Check, Loader2 } from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  model?: string | null;
  sku: string;
  description?: string | null;
  categories?: string[];
  warehouse?: string | null;
  zone?: string | null;
  aisle?: string | null;
  bin?: string | null;
  shelf?: string | null;
}


interface InventoryItemFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemData: Partial<InventoryItem>) => void;
  item?: InventoryItem | null;
}

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  model: z.string().optional(),
  sku: z.string().min(1, 'SKU is required'),
  description: z.string().optional(),
  quantity_on_hand: z.coerce.number().min(0, 'Quantity must be 0 or greater'),
  reorder_level: z.coerce.number().min(0, 'Reorder level must be 0 or greater'),
  unit_price: z.coerce.number().min(0, 'Price must be 0 or greater'),
  categories: z.array(z.string()).default([]),
  supplier_id: z.string().nullable().optional(),
  unit_of_measure: z.string().default('each'),
  units_per_package: z.coerce.number().min(1).default(1),
  warehouse: z.string().nullable().optional(),
  zone: z.string().nullable().optional(),
  aisle: z.string().nullable().optional(),
  bin: z.string().nullable().optional(),
  shelf: z.string().nullable().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export const InventoryItemFormDialog: React.FC<InventoryItemFormDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  item
}) => {
  const [showModelDropdown, setShowModelDropdown] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      model: '',
      sku: '',
      description: '',
      quantity_on_hand: 0,
      reorder_level: 0,
      unit_price: 0,
      categories: [],
      supplier_id: null,
      unit_of_measure: 'each',
      units_per_package: 1,
      warehouse: null,
      zone: null,
      aisle: null,
      bin: null,
      shelf: null,
    },
  });

  // Fetch unique models from vehicles and inventory items
  const { data: existingModels } = useQuery({
    queryKey: ['distinct_models'],
    queryFn: async () => {
      const { data: vehicles } = await supabase
        .from('vehicles')
        .select('model')
        .not('model', 'is', null);

      const { data: items } = await supabase
        .from('inventory_items')
        .select('model')
        .not('model', 'is', null);

      const vehicleModels = vehicles?.map(v => v.model) || [];
      const itemModels = items?.map(i => i.model) || [];

      const allModels = [...vehicleModels, ...itemModels].filter((m): m is string => !!m);

      return Array.from(new Set(allModels)).sort();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const filteredModels = existingModels?.filter(model =>
    model.toLowerCase().includes((form.watch('model') || '').toLowerCase())
  ) || [];

  // Initialize form with item data when editing
  React.useEffect(() => {
    if (item) {
      form.reset({
        name: item.name || '',
        model: item.model || '',
        sku: item.sku || '',
        description: item.description || '',
        quantity_on_hand: (item as any).quantity_on_hand ?? (item as any).quantityOnHand ?? 0,
        reorder_level: (item as any).reorder_level ?? (item as any).reorderLevel ?? 0,
        unit_price: (item as any).unit_price ?? (item as any).unitPrice ?? 0,
        categories: item.categories || [],
        supplier_id: (item as any).supplier_id ?? (item as any).supplierId ?? null,
        unit_of_measure: (item as any).unit_of_measure ?? (item as any).unitOfMeasure ?? 'each',
        units_per_package: (item as any).units_per_package ?? (item as any).unitsPerPackage ?? 1,
        warehouse: item.warehouse || null,
        zone: item.zone || null,
        aisle: item.aisle || null,
        bin: item.bin || null,
        shelf: item.shelf || null,
      });
    } else {
      form.reset({
        name: '',
        model: '',
        sku: '',
        description: '',
        quantity_on_hand: 0,
        reorder_level: 0,
        unit_price: 0,
        categories: [],
        supplier_id: null,
        unit_of_measure: 'each',
        units_per_package: 1,
        warehouse: null,
        zone: null,
        aisle: null,
        bin: null,
        shelf: null,
      });
    }
  }, [item, isOpen, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      // Pass the ID if we are editing
      const itemData = item ? { ...values, id: item.id } : values;
      await onSave(itemData);
      onClose();
    } catch (error) {
      console.error('Error saving inventory item:', error);
      toast({
        title: "Error",
        description: "Unable to save inventory item. Try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="border-b border-border bg-muted/50 -mx-6 -mt-6 px-6 py-3 mb-4">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" />
            <div>
              <SheetTitle className="text-base font-semibold">
                {item ? 'Edit Item' : 'Add Item'}
              </SheetTitle>
              <SheetDescription className="text-xs mt-0.5">
                {item ? 'Update item details' : 'Add item to inventory'}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <Form {...form}>
          <form id="inventory-item-form" onSubmit={form.handleSubmit(onSubmit)} className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-6">

              {/* Basic Information */}
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Info className="w-4 h-4 text-primary" />
                  Basic Information
                </h3>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Item Name <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="Item name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem className="relative">
                        <FormLabel>Model</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input
                              placeholder="Model"
                              {...field}
                              onFocus={() => setShowModelDropdown(true)}
                              onBlur={() => setTimeout(() => setShowModelDropdown(false), 200)}
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowModelDropdown(!showModelDropdown)}
                            className="absolute right-0 top-0 h-full"
                            tabIndex={-1}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                        </div>
                        {showModelDropdown && filteredModels.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {filteredModels.map((model) => (
                              <Button
                                key={model}
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                  form.setValue('model', model);
                                  setShowModelDropdown(false);
                                }}
                                className="w-full justify-between h-auto py-2 px-4"
                              >
                                <span className="text-sm">{model}</span>
                                {field.value === model && (
                                  <Check className="w-4 h-4 text-primary" />
                                )}
                              </Button>
                            ))}
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SKU <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="SKU" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Description (optional)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Categorization */}
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-primary" />
                  Categorization
                </h3>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="categories"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categories</FormLabel>
                        <FormControl>
                          <CategoryMultiSelect
                            value={field.value || []}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="supplier_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Supplier</FormLabel>
                        <FormControl>
                          <SupplierSelect
                            value={field.value || null}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Unit of Measure */}
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-primary" />
                  Unit of Measure
                </h3>
                <div className="space-y-4">
                  <UnitOfMeasureSelect
                    unit={form.watch('unit_of_measure') || 'each'}
                    unitsPerPackage={form.watch('units_per_package') || 1}
                    onUnitChange={(val) => form.setValue('unit_of_measure', val)}
                    onUnitsPerPackageChange={(val) => form.setValue('units_per_package', val)}
                  />
                </div>
              </div>

              {/* Storage Location */}
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Storage Location
                </h3>
                <div className="space-y-4">
                  <StorageLocationFields
                    warehouse={form.watch('warehouse') || null}
                    zone={form.watch('zone') || null}
                    aisle={form.watch('aisle') || null}
                    bin={form.watch('bin') || null}
                    shelf={form.watch('shelf') || null}
                    onChange={(field, value) => form.setValue(field as any, value)}
                  />
                </div>
              </div>

              {/* Stock Information */}
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4 text-primary" />
                  Stock Information
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="quantity_on_hand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity on Hand <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <Input type="number" min="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="reorder_level"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reorder Level <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <Input type="number" min="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="unit_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit Price <span className="text-destructive">*</span></FormLabel>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-sm text-gray-500">UGX</span>
                          </div>
                          <FormControl>
                            <Input type="number" min="0" className="pl-12" {...field} />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Total Value */}
                  <div className="mt-4 flex items-center justify-between px-1">
                    <span className="text-sm font-medium text-muted-foreground">Total Inventory Value</span>
                    <span className="text-lg font-bold">
                      UGX {((form.watch('quantity_on_hand') || 0) * (form.watch('unit_price') || 0)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </form>
        </Form>

        {/* Footer Actions - Sticky */}
        <div className="flex items-center justify-between border-t border-border bg-muted/50 p-3">
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={onClose}
            disabled={form.formState.isSubmitting}
          >
            Cancel
          </Button>

          <Button
            size="sm"
            type="submit"
            form="inventory-item-form"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
            {item ? 'Update Item' : 'Create Item'}
          </Button>
        </div>
      </SheetContent>
    </Sheet >
  );
};

