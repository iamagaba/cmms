import React, { useState, useMemo } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  Cancel01Icon,
  Add01Icon,
  PackageIcon,
  Clock01Icon,
  Search01Icon,
  Delete01Icon,
  PackageRemoveIcon
} from '@hugeicons/core-free-icons';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { InventoryItem } from '@/types/supabase';
import { snakeToCamelCase } from '@/utils/data-helpers';
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
import { useDensitySpacing } from '@/hooks/useDensitySpacing';
import { useDensity } from '@/context/DensityContext';

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
  const spacing = useDensitySpacing();
  const { isCompact } = useDensity();
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

  if (!isOpen) return null;

  const totalPartsCost = (usedParts || []).reduce((sum, p) => sum + (p.total_cost || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative bg-white dark:bg-gray-900 ${spacing.roundedLg} shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col`}>
        {/* Header */}
        <div className={`flex items-center justify-between ${spacing.card} border-b border-gray-200 dark:border-gray-700`}>
          <div>
            <h2 className={`${spacing.text.heading} font-semibold text-gray-900 dark:text-gray-100`}>
              Parts & Materials
            </h2>
            <p className={`${spacing.text.body} text-gray-500 dark:text-gray-400`}>
              {workOrderNumber ? `Work Order: ${workOrderNumber}` : 'Manage parts for this work order'}
            </p>
          </div>
          <button onClick={onClose} className={`${isCompact ? 'p-1.5' : 'p-2'} hover:bg-gray-100 dark:hover:bg-gray-800 ${spacing.roundedLg}`}>
            <HugeiconsIcon icon={Cancel01Icon} size={spacing.icon.md} className="text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'add', label: 'Add Parts', icon: Add01Icon },
            { id: 'used', label: `Used (${usedParts?.length || 0})`, icon: PackageIcon },
            { id: 'reserved', label: `Reserved (${reservations?.length || 0})`, icon: Clock01Icon },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <HugeiconsIcon icon={tab.icon} size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'add' && (
            <div className="space-y-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Search Inventory
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <HugeiconsIcon icon={Search01Icon} size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name or SKU..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
                  />
                </div>
              </div>

              {/* Item Selection */}
              <div className="max-h-48 overflow-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                {filteredItems.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">No items found</div>
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
                        className={`w-full flex items-center justify-between p-3 text-left border-b border-gray-100 dark:border-gray-800 last:border-0 transition-colors ${
                          isSelected
                            ? 'bg-purple-50 dark:bg-purple-900/30'
                            : isOutOfStock
                            ? 'bg-gray-50 dark:bg-gray-800/50 opacity-50 cursor-not-allowed'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.name}</p>
                          <p className="text-xs text-gray-500">{item.sku || 'No SKU'}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${isOutOfStock ? 'text-red-600' : 'text-gray-900 dark:text-gray-100'}`}>
                            {formatQuantityWithUnit(qty, item.unit_of_measure)}
                          </p>
                          <p className="text-xs text-gray-500">UGX {(item.unit_price ?? 0).toLocaleString()}</p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Selected Item Details */}
              {selectedItem && (
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{selectedItem.name}</p>
                      <p className="text-sm text-gray-500">
                        Available: {availableQty ?? selectedItem.quantity_on_hand ?? 0} | 
                        Price: UGX {(selectedItem.unit_price ?? 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={availableQty ?? selectedItem.quantity_on_hand ?? 999}
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Total Cost
                      </label>
                      <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-medium">
                        UGX {(quantity * (selectedItem.unit_price ?? 0)).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Notes (optional)
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add notes..."
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
                    />
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={isReserving}
                        onChange={(e) => setIsReserving(e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-gray-700 dark:text-gray-300">Reserve only (don't deduct yet)</span>
                    </label>
                  </div>

                  <button
                    onClick={handleAddPart}
                    disabled={addPartMutation.isPending || reservePartMutation.isPending}
                    className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    <HugeiconsIcon icon={isReserving ? Clock01Icon : Add01Icon} size={16} />
                    {isReserving ? 'Reserve Part' : 'Add Part to Work Order'}
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'used' && (
            <div className="space-y-3">
              {isLoadingParts ? (
                <div className="text-center py-8 text-gray-500">Loading...</div>
              ) : !usedParts?.length ? (
                <div className="text-center py-8">
                  <HugeiconsIcon icon={PackageRemoveIcon} size={48} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No parts used yet</p>
                </div>
              ) : (
                <>
                  {usedParts.map(part => (
                    <div
                      key={part.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {part.inventory_items?.name || 'Unknown Item'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {part.inventory_items?.sku || 'No SKU'} • Qty: {part.quantity_used}
                        </p>
                        {part.notes && (
                          <p className="text-xs text-gray-400 mt-1">{part.notes}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          UGX {(part.total_cost || 0).toLocaleString()}
                        </span>
                        <button
                          onClick={() => handleRemovePart(part.id)}
                          disabled={removePartMutation.isPending}
                          className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                          title="Remove and restore to inventory"
                        >
                          <HugeiconsIcon icon={Delete01Icon} size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {/* Total */}
                  <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Total Parts Cost</span>
                    <span className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                      UGX {totalPartsCost.toLocaleString()}
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'reserved' && (
            <div className="space-y-3">
              {isLoadingReservations ? (
                <div className="text-center py-8 text-gray-500">Loading...</div>
              ) : !reservations?.length ? (
                <div className="text-center py-8">
                  <HugeiconsIcon icon={Clock01Icon} size={48} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No reservations</p>
                </div>
              ) : (
                reservations.map(res => (
                  <div
                    key={res.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {res.inventory_items?.name || 'Unknown Item'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Qty: {res.quantity_reserved} • Status: {res.status}
                      </p>
                      {res.expires_at && (
                        <p className="text-xs text-orange-600">
                          Expires: {new Date(res.expires_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {res.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleFulfillReservation(res.id)}
                            disabled={fulfillReservationMutation.isPending}
                            className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded"
                          >
                            Use Now
                          </button>
                          <button
                            onClick={() => handleCancelReservation(res.id)}
                            disabled={cancelReservationMutation.isPending}
                            className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded border border-red-200"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
