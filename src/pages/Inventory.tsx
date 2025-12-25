import React, { useState, useMemo, useCallback } from 'react';
import { Icon } from '@iconify/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { InventoryItem } from '@/types/supabase';
import { snakeToCamelCase, camelToSnakeCase } from '@/utils/data-helpers';
import { showSuccess, showError } from '@/utils/toast';
import { Input } from '@/components/ui/enterprise';
import { InventoryItemFormDialog } from '@/components/InventoryItemFormDialog';
import { DeleteConfirmationDialog } from '@/components/DeleteConfirmationDialog';

// Filter types
interface InventoryFilters {
  stockStatus: string;
  category: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const InventoryPage: React.FC = () => {
  const queryClient = useQueryClient();

  // State management
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Delete Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<InventoryFilters>({
    stockStatus: 'all',
    category: 'all',
    sortBy: 'name',
    sortOrder: 'asc',
  });
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Data fetching
  const { data: inventoryItems, isLoading, error, refetch } = useQuery<InventoryItem[]>({
    queryKey: ['inventory_items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('name');
      if (error) throw new Error(error.message);
      return (data || []).map(item => snakeToCamelCase(item) as InventoryItem);
    }
  });

  // Mutations
  const saveMutation = useMutation({
    mutationFn: async (itemData: Partial<InventoryItem>) => {
      const snakeCaseData = camelToSnakeCase(itemData);
      const cleanData = Object.fromEntries(
        Object.entries(snakeCaseData).filter(([_, value]) => value !== undefined)
      );

      if (itemData.id && inventoryItems?.some(i => i.id === itemData.id)) {
        const { error } = await supabase
          .from('inventory_items')
          .update(cleanData)
          .eq('id', itemData.id);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase.from('inventory_items').insert([cleanData]);
        if (error) throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory_items'] });
      showSuccess('Inventory item saved successfully.');
      setIsDialogOpen(false);
      setEditingItem(null);
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      showError(error.message);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('inventory_items').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory_items'] });
      showSuccess('Inventory item deleted.');
    },
    onError: (error) => showError(error.message)
  });

  // Statistics
  const stats = useMemo(() => {
    if (!inventoryItems) return { total: 0, inStock: 0, lowStock: 0, outOfStock: 0, totalValue: 0 };

    const total = inventoryItems.length;
    const outOfStock = inventoryItems.filter(i => (i.quantity_on_hand ?? 0) === 0).length;
    const lowStock = inventoryItems.filter(i => (i.quantity_on_hand ?? 0) > 0 && (i.quantity_on_hand ?? 0) <= (i.reorder_level ?? 0)).length;
    const inStock = inventoryItems.filter(i => (i.quantity_on_hand ?? 0) > (i.reorder_level ?? 0)).length;
    const totalValue = inventoryItems.reduce((sum, i) => sum + ((i.quantity_on_hand ?? 0) * (i.unit_price ?? 0)), 0);

    return { total, inStock, lowStock, outOfStock, totalValue };
  }, [inventoryItems]);
  const filteredItems = useMemo(() => {
    if (!inventoryItems) return [];
    let filtered = [...inventoryItems];

    // Apply stock status filter
    if (filters.stockStatus === 'in-stock') {
      filtered = filtered.filter(i => (i.quantity_on_hand ?? 0) > (i.reorder_level ?? 0));
    } else if (filters.stockStatus === 'low-stock') {
      filtered = filtered.filter(i => (i.quantity_on_hand ?? 0) > 0 && (i.quantity_on_hand ?? 0) <= (i.reorder_level ?? 0));
    } else if (filters.stockStatus === 'out-of-stock') {
      filtered = filtered.filter(i => (i.quantity_on_hand ?? 0) === 0);
    }

    // Apply search
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.name?.toLowerCase().includes(query) ||
        item.sku?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal: any, bVal: any;
      switch (filters.sortBy) {
        case 'name': aVal = a.name || ''; bVal = b.name || ''; break;
        case 'sku': aVal = a.sku || ''; bVal = b.sku || ''; break;
        case 'quantity': aVal = a.quantity_on_hand ?? 0; bVal = b.quantity_on_hand ?? 0; break;
        case 'price': aVal = a.unit_price ?? 0; bVal = b.unit_price ?? 0; break;
        default: return 0;
      }
      if (typeof aVal === 'string') {
        return filters.sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return filters.sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return filtered;
  }, [inventoryItems, filters, searchTerm]);

  // Event handlers
  const handleSave = useCallback((itemData: Partial<InventoryItem>) => {
    saveMutation.mutate(itemData);
  }, [saveMutation]);

  const handleDeleteClick = useCallback((item: InventoryItem) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync(itemToDelete.id);
      if (selectedItem?.id === itemToDelete.id) {
        setSelectedItem(null);
      }
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch (error) {
      // Error is handled by mutation onError
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = useCallback((item: InventoryItem) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  }, []);

  const handleSelectItem = useCallback((item: InventoryItem) => {
    setSelectedItem(item);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setFilters({ stockStatus: 'all', category: 'all', sortBy: 'name', sortOrder: 'asc' });
  }, []);

  const hasActiveFilters = searchTerm || filters.stockStatus !== 'all' || filters.category !== 'all';


  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen w-full bg-white overflow-hidden">
        {/* List Column */}
        <div className="w-80 flex-none border-r border-gray-200 bg-white flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
          </div>
          <div className="flex-1 p-4 space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>

        {/* Detail Column */}
        <div className="flex-1 overflow-auto bg-white">
          <div className="p-6 space-y-4">
            <div className="h-8 bg-gray-200 rounded animate-pulse w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-screen w-full bg-white overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Icon icon="tabler:alert-triangle" className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Inventory</h3>
            <p className="text-sm text-gray-600 mb-4 max-w-md mx-auto">
              {error.message || 'An unexpected error occurred.'}
            </p>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
            >
              <Icon icon="tabler:refresh" className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="flex h-screen w-full bg-white dark:bg-gray-900 overflow-hidden">
      {/* List Column - Inventory List */}
      <div className="w-80 flex-none border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col">
        {/* Header with Stat Ribbon */}
        <div className="border-b border-gray-200 dark:border-gray-800">
          {/* Page Title */}
          <div className="p-4 pb-3">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Inventory</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Parts, supplies, and stock levels</p>
          </div>

          {/* Stat Ribbon - Enterprise Design */}
          <div className="bg-white dark:bg-gray-900 border-y border-gray-200 dark:border-gray-800">
            <div className="grid grid-cols-4 divide-x divide-gray-200 dark:divide-gray-800">
              <div className="px-4 py-2.5 flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Total</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{stats.total ?? 0}</span>
              </div>
              <div className="px-4 py-2.5 flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">In Stock</span>
                <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">{stats.inStock ?? 0}</span>
              </div>
              <div className="px-4 py-2.5 flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Low</span>
                <span className="text-sm font-semibold text-orange-700 dark:text-orange-400">{stats.lowStock ?? 0}</span>
              </div>
              <div className="px-4 py-2.5 flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Out</span>
                <span className="text-sm font-semibold text-red-700 dark:text-red-400">{stats.outOfStock ?? 0}</span>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="p-4 pt-3">
            <Input
              placeholder="Search inventory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Icon icon="tabler:search" className="w-3.5 h-3.5 text-gray-400" />}
            />
          </div>

          {/* Filters Toggle */}
          <div className="px-4 pb-3 flex items-center justify-between">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${filtersOpen || hasActiveFilters
                ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700'
                }`}
            >
              <Icon icon="tabler:adjustments-horizontal" className="w-3.5 h-3.5" />
              Filters
              {hasActiveFilters && (
                <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
              )}
            </button>
            <button
              onClick={() => { setEditingItem(null); setIsDialogOpen(true); }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors"
            >
              <Icon icon="tabler:plus" className="w-3.5 h-3.5" />
              Add Item
            </button>
          </div>

          {/* Advanced Filters */}
          {filtersOpen && (
            <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-800 pt-3 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    value={filters.stockStatus}
                    onChange={(e) => setFilters({ ...filters, stockStatus: e.target.value })}
                    className="h-9 w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2.5 py-1 text-xs dark:text-gray-200"
                  >
                    <option value="all">All</option>
                    <option value="in-stock">In Stock</option>
                    <option value="low-stock">Low Stock</option>
                    <option value="out-of-stock">Out of Stock</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Sort</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                    className="h-9 w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2.5 py-1 text-xs dark:text-gray-200"
                  >
                    <option value="name">Name</option>
                    <option value="sku">SKU</option>
                    <option value="quantity">Quantity</option>
                    <option value="price">Price</option>
                  </select>
                </div>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Inventory List */}
        <div className="flex-1 overflow-auto">
          {filteredItems.length === 0 ? (
            <div className="empty-state">
              <Icon icon="tabler:package-off" className="empty-state-icon" />
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">No items found</p>
              <p className="empty-state-text">
                {hasActiveFilters ? "Try adjusting your filters" : "Add your first inventory item to get started"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredItems.map((item) => {
                const qty = item.quantity_on_hand ?? 0;
                const reorderLvl = item.reorder_level ?? 0;
                const isLowStock = qty > 0 && qty <= reorderLvl;
                const isOutOfStock = qty === 0;
                const isSelected = selectedItem?.id === item.id;

                return (
                  <div
                    key={item.id}
                    className={`list-row cursor-pointer ${isSelected ? 'list-row-active' : ''}`}
                    onClick={() => handleSelectItem(item)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-md bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                          <Icon icon="tabler:package" className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {item.name || 'Unnamed Item'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {item.sku || 'No SKU'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium border ${isOutOfStock ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800' :
                          isLowStock ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800' :
                            'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                          }`}>
                          {isOutOfStock ? 'Out' : isLowStock ? 'Low' : 'In Stock'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Qty: {qty}</span>
                      <span>${(item.unit_price ?? 0).toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Detail Column */}
      <div className="flex-1 overflow-auto bg-white dark:bg-gray-900">
        {selectedItem ? (
          <div className="p-6">
            {/* Item Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {selectedItem.name || 'Unnamed Item'}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {selectedItem.sku ? `SKU: ${selectedItem.sku}` : 'No SKU assigned'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(selectedItem)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  <Icon icon="tabler:edit" className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteClick(selectedItem)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-700 dark:text-red-400 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
                >
                  <Icon icon="tabler:trash" className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>

            {/* Item Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">Basic Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Item Name</label>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-0.5">{selectedItem.name || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">SKU</label>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-0.5 font-mono">{selectedItem.sku || 'Not assigned'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Description</label>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-0.5">{selectedItem.description || 'No description'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Unit Price</label>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-0.5">${(selectedItem.unit_price ?? 0).toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Stock Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">Stock Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Quantity on Hand</label>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-0.5 font-semibold">{selectedItem.quantity_on_hand ?? 0}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Reorder Level</label>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-0.5">{selectedItem.reorder_level ?? 0}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Status</label>
                    <div className="mt-0.5">
                      {(() => {
                        const qty = selectedItem.quantity_on_hand ?? 0;
                        const reorderLvl = selectedItem.reorder_level ?? 0;
                        const isLowStock = qty > 0 && qty <= reorderLvl;
                        const isOutOfStock = qty === 0;

                        return (
                          <span className={`px-2 py-0.5 rounded text-xs font-medium border ${isOutOfStock ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800' :
                            isLowStock ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800' :
                              'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                            }`}>
                            {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Value</label>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-0.5 font-semibold">
                      ${((selectedItem.quantity_on_hand ?? 0) * (selectedItem.unit_price ?? 0)).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            {selectedItem.description && (
              <div className="mt-8">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide mb-4">Description</h3>
                <div className="border border-gray-200 dark:border-gray-700 rounded-md p-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300">{selectedItem.description}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Icon icon="tabler:package" className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">Select an Item</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Choose an inventory item from the list to view details</p>
            </div>
          </div>
        )}
      </div>

      {/* Inventory Item Form Dialog */}
      {isDialogOpen && (
        <InventoryItemFormDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSave={handleSave}
          item={editingItem}
        />
      )}
      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Item"
        message="Are you sure you want to delete this inventory item? This action cannot be undone."
        itemName={itemToDelete?.name}
        isDeleting={isDeleting}
      />
    </div>
  );
};
export default InventoryPage;
