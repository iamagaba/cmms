import React, { useState, useMemo } from 'react';
import { Plus, Package, Clock, Search, Trash2, PackageX } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { InventoryItem } from '@/types/supabase';
import { snakeToCamelCase } from '@/utils/data-helpers';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useWorkOrderParts,
  usePartReservations,
  useAddPartToWorkOrder,
  useRemovePartFromWorkOrder,
  useReservePart,
  useFulfillReservation,
  useCancelReservation,
  useAvailableQuantity
} from '@/hooks/useWorkOrderParts';
import { formatQuantityWithUnit } from '@/utils/inventory-categorization-helpers';

interface WorkOrderPartsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  workOrderId: string;
  workOrderNumber?: string;
}

type TabType = 'add' | 'used' | 'reserved';

export const WorkOrderPartsDialog: React.FC<WorkOrderPartsDialogProps> = ({
  isOpen,
  onClose,
  workOrderId,
  workOrderNumber,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('add');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [isReserving, setIsReserving] = useState(false);

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
    enabled: isOpen,
  });

  // Fetch parts used on this work order
  const { data: usedParts, isLoading: isLoadingParts } = useWorkOrderParts(workOrderId);

  // Fetch reservations for this work order
  const { data: reservations, isLoading: isLoadingReservations } = usePartReservations(workOrderId);

  // Get available quantity for selected item
  const { data: availableQty } = useAvailableQuantity(selectedItemId || undefined);

  // Mutations
  const addPartMutation = useAddPartToWorkOrder();
  const removePartMutation = useRemovePartFromWorkOrder();
  const reservePartMutation = useReservePart();
  const fulfillReservationMutation = useFulfillReservation();
  const cancelReservationMutation = useCancelReservation();

  // Filter inventory items
  const filteredItems = useMemo(() => {
    if (!inventoryItems) return [];
    if (!searchTerm) return inventoryItems;

    const query = searchTerm.toLowerCase();
    return inventoryItems.filter(item =>
      item.name?.toLowerCase().includes(query) ||
      item.sku?.toLowerCase().includes(query)
    );
  }, [inventoryItems, searchTerm]);

  const selectedItem = useMemo(() => {
    return inventoryItems?.find(i => i.id === selectedItemId);
  }, [inventoryItems, selectedItemId]);

  const handleAddPart = async () => {
    if (!selectedItemId || quantity <= 0) return;

    try {
      if (isReserving) {
        await reservePartMutation.mutateAsync({
          work_order_id: workOrderId,
          inventory_item_id: selectedItemId,
          quantity,
          notes: notes || undefined,
        });
      } else {
        await addPartMutation.mutateAsync({
          work_order_id: workOrderId,
          inventory_item_id: selectedItemId,
          quantity,
          notes: notes || undefined,
        });
      }
      // Reset form
      setSelectedItemId(null);
      setQuantity(1);
      setNotes('');
      setActiveTab(isReserving ? 'reserved' : 'used');
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleRemovePart = async (partId: string) => {
    try {
      await removePartMutation.mutateAsync({ partId, workOrderId });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleFulfillReservation = async (reservationId: string) => {
    try {
      await fulfillReservationMutation.mutateAsync(reservationId);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleCancelReservation = async (reservationId: string) => {
    try {
      await cancelReservationMutation.mutateAsync({ reservationId });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const totalPartsCost = (usedParts || []).reduce((sum, p) => sum + (p.total_cost || 0), 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="text-base font-semibold">
            Parts & Materials
          </DialogTitle>
          <DialogDescription className="text-xs">
            {workOrderNumber ? `Work Order: ${workOrderNumber}` : 'Manage parts for this work order'}
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabType)} className="flex-1 flex flex-col">
          <TabsList className="w-full justify-start rounded-none border-b h-auto p-0">
            <TabsTrigger value="add" className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
              <Plus className="w-4 h-4" />
              Add Parts
            </TabsTrigger>
            <TabsTrigger value="used" className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
              <Package className="w-4 h-4" />
              Used ({usedParts?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="reserved" className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
              <Clock className="w-4 h-4" />
              Reserved ({reservations?.length || 0})
            </TabsTrigger>
          </TabsList>

          {/* Content */}
          <div className="flex-1 overflow-auto p-4">
            <TabsContent value="add" className="mt-0 space-y-4">
              {/* Search */}
              <div>
                <Label htmlFor="search" className="text-xs font-medium mb-1.5">
                  Search Inventory
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Search className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <Input
                    id="search"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search inventory..."
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Item Selection */}
              <div className="max-h-48 overflow-auto border rounded-lg">
                {filteredItems.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">No items found</div>
                ) : (
                  filteredItems.map(item => {
                    const isSelected = selectedItemId === item.id;
                    const qty = item.quantity_on_hand ?? 0;
                    const isOutOfStock = qty === 0;

                    return (
                      <button
                        key={item.id}
                        onClick={() => setSelectedItemId(item.id)}
                        disabled={isOutOfStock}
                        className={`w-full flex items-center justify-between p-3 text-left border-b last:border-0 transition-colors ${isSelected
                          ? 'bg-primary/5'
                          : isOutOfStock
                            ? 'bg-muted/50 opacity-50 cursor-not-allowed'
                            : 'hover:bg-muted/50'
                          }`}
                      >
                        <div>
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.sku || 'No SKU'}
                            {item.model && ` • ${item.model}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${isOutOfStock ? 'text-destructive' : ''}`}>
                            {formatQuantityWithUnit(qty, item.unit_of_measure)}
                          </p>
                          <p className="text-xs text-muted-foreground">UGX {(item.unit_price ?? 0).toLocaleString()}</p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Selected Item Details */}
              {selectedItem && (
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-sm">
                        {selectedItem.name}
                        {selectedItem.model && <span className="text-muted-foreground font-normal"> ({selectedItem.model})</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Available: {availableQty ?? selectedItem.quantity_on_hand ?? 0} |
                        Price: UGX {(selectedItem.unit_price ?? 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="quantity" className="text-xs font-medium mb-1.5">
                        Quantity
                      </Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        max={availableQty ?? selectedItem.quantity_on_hand ?? 999}
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-medium mb-1.5">
                        Total Cost
                      </Label>
                      <div className="px-3 py-2 bg-muted rounded-lg text-sm font-medium h-10 flex items-center">
                        UGX {(quantity * (selectedItem.unit_price ?? 0)).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <Label htmlFor="notes" className="text-xs font-medium mb-1.5">
                      Notes (optional)
                    </Label>
                    <Input
                      id="notes"
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add notes..."
                    />
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <Checkbox
                      id="reserve"
                      checked={isReserving}
                      onCheckedChange={(checked) => setIsReserving(checked === true)}
                    />
                    <Label htmlFor="reserve" className="text-xs font-normal cursor-pointer">
                      Reserve only (don't deduct yet)
                    </Label>
                  </div>

                  <Button
                    onClick={handleAddPart}
                    disabled={addPartMutation.isPending || reservePartMutation.isPending}
                    className="mt-3 w-full"
                    size="sm"
                  >
                    {isReserving ? (
                      <>
                        <Clock className="w-4 h-4 mr-1.5" />
                        Reserve Part
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-1.5" />
                        Add Part
                      </>
                    )}
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="used" className="mt-0 space-y-3">
              {isLoadingParts ? (
                <div className="text-center py-8 text-muted-foreground text-sm">Loading...</div>
              ) : !usedParts?.length ? (
                <div className="text-center py-8">
                  <PackageX className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No parts used yet</p>
                </div>
              ) : (
                <>
                  {usedParts.map(part => (
                    <div
                      key={part.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {part.inventory_items?.name || 'Unknown Item'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {part.inventory_items?.sku || 'No SKU'}
                          {part.inventory_items?.model && ` • ${part.inventory_items.model}`} • Qty: {part.quantity_used}
                        </p>
                        {part.notes && (
                          <p className="text-xs text-muted-foreground mt-1">{part.notes}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">
                          UGX {(part.total_cost || 0).toLocaleString()}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemovePart(part.id)}
                          disabled={removePartMutation.isPending}
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          title="Remove and restore to inventory"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Total */}
                  <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/10">
                    <span className="text-sm font-medium">Total Parts Cost</span>
                    <span className="text-lg font-semibold text-primary">
                      UGX {totalPartsCost.toLocaleString()}
                    </span>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="reserved" className="mt-0 space-y-3">
              {isLoadingReservations ? (
                <div className="text-center py-8 text-muted-foreground text-sm">Loading...</div>
              ) : !reservations?.length ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No reservations</p>
                </div>
              ) : (
                reservations.map(res => (
                  <div
                    key={res.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {res.inventory_items?.name || 'Unknown Item'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Qty: {res.quantity_reserved}
                        {res.inventory_items?.model && ` • ${res.inventory_items.model}`} • Status: {res.status}
                      </p>
                      {res.expires_at && (
                        <p className="text-xs text-muted-foreground">
                          Expires: {new Date(res.expires_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {res.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleFulfillReservation(res.id)}
                            disabled={fulfillReservationMutation.isPending}
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            Use Now
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancelReservation(res.id)}
                            disabled={cancelReservationMutation.isPending}
                            className="text-destructive border-destructive/20 hover:bg-destructive/10"
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

