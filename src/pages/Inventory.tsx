import React, { useState, useMemo, useCallback } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  AlertCircleIcon,
  RefreshIcon,
  Search01Icon,
  Settings02Icon,
  PlusMinusIcon,
  ArrowDataTransferHorizontalIcon,
  Add01Icon,
  Archive01Icon,
  PencilEdit02Icon,
  Delete01Icon,
  Store01Icon,
  PackageIcon,
} from '@hugeicons/core-free-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { InventoryItem, ItemCategory, Supplier } from '@/types/supabase';
import { snakeToCamelCase, camelToSnakeCase } from '@/utils/data-helpers';
import { showSuccess, showError } from '@/utils/toast';
import { Input } from '@/components/ui/enterprise';
import { InventoryItemFormDialog } from '@/components/InventoryItemFormDialog';
import { DeleteConfirmationDialog } from '@/components/DeleteConfirmationDialog';
import { StockAdjustmentDialog } from '@/components/StockAdjustmentDialog';
import { AdjustmentHistoryPanel } from '@/components/AdjustmentHistoryPanel';
import { CategoryBadge } from '@/components/CategoryMultiSelect';
import { InventoryTransactionsPanel } from '@/components/InventoryTransactionsPanel';
import { InventoryPartsUsagePanel } from '@/components/InventoryPartsUsagePanel';
import { useSuppliers } from '@/hooks/useSuppliers';
import {
  formatStorageLocation,
  formatQuantityWithUnit,
  getUniqueWarehouses,
  ALL_CATEGORIES,
  ITEM_CATEGORY_LABELS
} from '@/utils/inventory-categorization-helpers';

// Filter types
interface InventoryFilters {
  stockStatus: string;
  category: string;
  categories: ItemCategory[];
  supplierId: string;
  warehouse: string;
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

  // Stock Adjustment Dialog State
  const [adjustmentDialogOpen, setAdjustmentDialogOpen] = useState(false);
  const [adjustmentPreselectedItem, setAdjustmentPreselectedItem] = useState<InventoryItem | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showWorkOrderUsage, setShowWorkOrderUsage] = useState(false);

  // Transactions Panel State
  const [transactionsPanelOpen, setTransactionsPanelOpen] = useState(false);

  const [filters, setFilters] = useState<InventoryFilters>({
    stockStatus: 'all',
    category: 'all',
    categories: [],
    supplierId: 'all',
    warehouse: 'all',
    sortBy: 'name',
    sortOrder: 'asc',
  });
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Fetch suppliers for filter dropdown
  const { data: suppliers } = useSuppliers();

  // Data fetching - include supplier join
  const { data: inventoryItems, isLoading, error, refetch } = useQuery<InventoryItem[]>({
    queryKey: ['inventory_items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*, supplier:suppliers(*)')
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

    // Apply category filter (item must have at least one matching category)
    if (filters.categories.length > 0) {
      filtered = filtered.filter(item => {
        const itemCategories = item.categories || [];
        return filters.categories.some(cat => itemCategories.includes(cat));
      });
    }

    // Apply supplier filter
    if (filters.supplierId && filters.supplierId !== 'all') {
      filtered = filtered.filter(item => item.supplier_id === filters.supplierId);
    }

    // Apply warehouse filter
    if (filters.warehouse && filters.warehouse !== 'all') {
      filtered = filtered.filter(item => item.warehouse === filters.warehouse);
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

  // Get unique warehouses for filter dropdown
  const uniqueWarehouses = useMemo(() => {
    return getUniqueWarehouses(inventoryItems || []);
  }, [inventoryItems]);

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
    setFilters({ stockStatus: 'all', category: 'all', categories: [], supplierId: 'all', warehouse: 'all', sortBy: 'name', sortOrder: 'asc' });
  }, []);

  const handleOpenBatchAdjustment = useCallback(() => {
    setAdjustmentPreselectedItem(null);
    setAdjustmentDialogOpen(true);
  }, []);

  const handleQuickAdjust = useCallback((item: InventoryItem) => {
    setAdjustmentPreselectedItem(item);
    setAdjustmentDialogOpen(true);
  }, []);

  const handleAdjustmentSuccess = useCallback(() => {
    // Refresh the selected item if it was adjusted
    if (selectedItem) {
      const updatedItem = inventoryItems?.find(i => i.id === selectedItem.id);
      if (updatedItem) {
        setSelectedItem(updatedItem);
      }
    }
  }, [selectedItem, inventoryItems]);

  const hasActiveFilters = searchTerm || filters.stockStatus !== 'all' || filters.category !== 'all' || filters.categories.length > 0 || filters.supplierId !== 'all' || filters.warehouse !== 'all';


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
              <HugeiconsIcon icon={AlertCircleIcon} size={32} className=" text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Inventory</h3>
            <p className="text-sm text-gray-600 mb-4 max-w-md mx-auto">
              {error.message || 'An unexpected error occurred.'}
            </p>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
            >
              <HugeiconsIcon icon={RefreshIcon} size={16} className="" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="flex h-[calc(100vh-2rem)] w-full bg-white dark:bg-gray-900 overflow-hidden">
      {/* List Column - Inventory List */}
      <div className="w-80 flex-none border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col">
        {/* Header with Stat Ribbon */}
        <div className="border-b border-gray-200 dark:border-gray-800">
          {/* Page Title */}
          <div className="px-3 py-2">
            <h1 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Inventory</h1>
          </div>

          {/* Search */}
          <div className="px-3 py-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <HugeiconsIcon icon={Search01Icon} size={14} className="text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Search inventory..."
                className="w-full pl-10 pr-4 py-1.5 text-xs border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Filters Toggle */}
          <div className="px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                className={`inline-flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium rounded-md transition-colors ${filtersOpen || hasActiveFilters
                  ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700'
                  }`}
              >
                <HugeiconsIcon icon={Settings02Icon} size={14} className="" />
                Filters
                {hasActiveFilters && (
                  <span className="inline-flex items-center justify-center min-w-[16px] h-3.5 px-1 rounded-full bg-purple-600 text-white text-[10px] font-semibold">
                    {[searchTerm, filters.stockStatus !== 'all', filters.category !== 'all', filters.categories.length > 0, filters.supplierId !== 'all', filters.warehouse !== 'all'].filter(Boolean).length}
                  </span>
                )}
              </button>
              <button
                onClick={handleOpenBatchAdjustment}
                className="inline-flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md transition-colors"
                title="Adjust Stock"
              >
                <HugeiconsIcon icon={PlusMinusIcon} size={14} className="" />
                Adjust
              </button>
              <button
                onClick={() => setTransactionsPanelOpen(true)}
                className="inline-flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md transition-colors"
                title="Inventory Transactions"
              >
                <HugeiconsIcon icon={ArrowDataTransferHorizontalIcon} size={14} className="" />
                Transactions
              </button>
            </div>
            <button
              onClick={() => { setEditingItem(null); setIsDialogOpen(true); }}
              className="inline-flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors"
            >
              <HugeiconsIcon icon={Add01Icon} size={14} className="" />
              Add Item
            </button>
          </div>

          {/* Advanced Filters */}
          {filtersOpen && (
            <div className="px-3 pb-3 border-t border-gray-100 dark:border-gray-800 pt-2 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    value={filters.stockStatus}
                    onChange={(e) => setFilters({ ...filters, stockStatus: e.target.value })}
                    className="h-7 w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2.5 py-1 text-xs dark:text-gray-200"
                  >
                    <option value="all">All</option>
                    <option value="in-stock">In Stock</option>
                    <option value="low-stock">Low Stock</option>
                    <option value="out-of-stock">Out of Stock</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-gray-700 dark:text-gray-300 mb-1">Sort</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                    className="h-7 w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2.5 py-1 text-xs dark:text-gray-200"
                  >
                    <option value="name">Name</option>
                    <option value="sku">SKU</option>
                    <option value="quantity">Quantity</option>
                    <option value="price">Price</option>
                  </select>
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-[10px] font-medium text-gray-700 dark:text-gray-300 mb-1">Categories</label>
                <div className="flex flex-wrap gap-1">
                  {ALL_CATEGORIES.slice(0, 6).map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        const newCategories = filters.categories.includes(cat)
                          ? filters.categories.filter(c => c !== cat)
                          : [...filters.categories, cat];
                        setFilters({ ...filters, categories: newCategories });
                      }}
                      className={`px-2 py-0.5 text-[10px] rounded border transition-colors ${filters.categories.includes(cat)
                        ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                    >
                      {ITEM_CATEGORY_LABELS[cat]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Supplier & Warehouse Filters */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-medium text-gray-700 dark:text-gray-300 mb-1">Supplier</label>
                  <select
                    value={filters.supplierId}
                    onChange={(e) => setFilters({ ...filters, supplierId: e.target.value })}
                    className="h-7 w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2.5 py-1 text-xs dark:text-gray-200"
                  >
                    <option value="all">All Suppliers</option>
                    {suppliers?.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-gray-700 dark:text-gray-300 mb-1">Warehouse</label>
                  <select
                    value={filters.warehouse}
                    onChange={(e) => setFilters({ ...filters, warehouse: e.target.value })}
                    className="h-7 w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2.5 py-1 text-xs dark:text-gray-200"
                  >
                    <option value="all">All Warehouses</option>
                    {uniqueWarehouses.map(w => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="text-[10px] text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Inventory List */}
        <div className="flex-1 overflow-auto overscroll-y-contain">
          {filteredItems.length === 0 ? (
            <div className="empty-state">
              <HugeiconsIcon icon={Archive01Icon} className="empty-state-icon" />
              <p className="text-xs font-medium text-gray-900 dark:text-gray-100 mb-1">No items found</p>
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
                const itemCategories = item.categories || [];

                return (
                  <div
                    key={item.id}
                    className={`group relative list-row cursor-pointer ${isSelected ? 'list-row-active' : ''}`}
                    onClick={() => handleSelectItem(item)}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-md bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                          <HugeiconsIcon icon={Archive01Icon} size={14} className=" text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                            {item.name || 'Unnamed Item'}
                          </p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400">
                            {item.sku || 'No SKU'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${isOutOfStock ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800' :
                          isLowStock ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800' :
                            'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                          }`}>
                          {isOutOfStock ? 'Out' : isLowStock ? 'Low' : 'In Stock'}
                        </span>
                      </div>
                    </div>
                    {/* Category badges */}
                    {itemCategories.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-1.5">
                        {itemCategories.slice(0, 2).map(cat => (
                          <CategoryBadge key={cat} category={cat} size="sm" showIcon={false} />
                        ))}
                        {itemCategories.length > 2 && (
                          <span className="text-[10px] text-gray-400">+{itemCategories.length - 2}</span>
                        )}
                      </div>
                    )}
                    <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400">
                      <span>{formatQuantityWithUnit(qty, item.unit_of_measure, item.units_per_package)}</span>
                      <span>UGX {(item.unit_price ?? 0).toLocaleString()}</span>
                    </div>

                    {/* Quick Actions - Show on hover */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 p-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickAdjust(item);
                        }}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        title="Adjust Stock"
                      >
                        <HugeiconsIcon icon={PlusMinusIcon} size={14} className=" text-gray-600 dark:text-gray-400" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(item);
                        }}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        title="Edit"
                      >
                        <HugeiconsIcon icon={PencilEdit02Icon} size={14} className=" text-gray-600 dark:text-gray-400" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(item);
                        }}
                        className="p-1 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                        title="Delete"
                      >
                        <HugeiconsIcon icon={Delete01Icon} size={14} className=" text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Detail Column */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-gray-900">
        {selectedItem ? (
          <div className="flex flex-col h-full">
            <div className="flex-none px-3 py-2 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 z-10">
              {/* Item Header */}
              <div className="flex items-center justify-between mb-0">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {selectedItem.name || 'Unnamed Item'}
                  </h2>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    {selectedItem.sku ? `SKU: ${selectedItem.sku}` : 'No SKU assigned'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleQuickAdjust(selectedItem)}
                    className="inline-flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                  >
                    <HugeiconsIcon icon={PlusMinusIcon} size={14} className="" />
                    Adjust Stock
                  </button>
                  <button
                    onClick={() => handleEdit(selectedItem)}
                    className="inline-flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                  >
                    <HugeiconsIcon icon={PencilEdit02Icon} size={14} className="" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(selectedItem)}
                    className="inline-flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium text-red-700 dark:text-red-400 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
                  >
                    <HugeiconsIcon icon={Delete01Icon} size={14} className="" />
                    Delete
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-auto px-3 py-2 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent overscroll-y-contain">
              {/* Item Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* Basic Information */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 pb-1.5">Basic Information</h3>
                  <div className="space-y-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2">
                    <div>
                      <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400">Item Name</label>
                      <p className="text-xs text-gray-900 dark:text-gray-100 mt-0.5">{selectedItem.name || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400">SKU</label>
                      <p className="text-xs text-gray-900 dark:text-gray-100 mt-0.5 font-mono">{selectedItem.sku || 'Not assigned'}</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400">Description</label>
                      <p className="text-xs text-gray-900 dark:text-gray-100 mt-0.5">{selectedItem.description || 'No description'}</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400">Unit Price</label>
                      <p className="text-xs text-gray-900 dark:text-gray-100 mt-0.5">UGX {(selectedItem.unit_price ?? 0).toLocaleString()}</p>
                    </div>
                    {/* Categories */}
                    <div>
                      <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400">Categories</label>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {(selectedItem.categories || []).length > 0 ? (
                          selectedItem.categories!.map(cat => (
                            <CategoryBadge key={cat} category={cat} size="sm" />
                          ))
                        ) : (
                          <div className="w-full text-center py-2 px-3 bg-white dark:bg-gray-900 rounded-md border border-dashed border-gray-300 dark:border-gray-600">
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1.5">No categories assigned</p>
                            <button
                              onClick={() => handleEdit(selectedItem)}
                              className="inline-flex items-center gap-1 text-[10px] text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                            >
                              <HugeiconsIcon icon={Add01Icon} size={12} className="" />
                              Add Categories
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stock Information */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 pb-1.5">Stock Information</h3>
                  <div className="space-y-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2">
                    <div>
                      <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400">Quantity on Hand</label>
                      <p className="text-xs text-gray-900 dark:text-gray-100 mt-0.5 font-semibold">
                        {formatQuantityWithUnit(selectedItem.quantity_on_hand ?? 0, selectedItem.unit_of_measure, selectedItem.units_per_package)}
                      </p>
                    </div>
                    <div>
                      <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400">Reorder Level</label>
                      <p className="text-xs text-gray-900 dark:text-gray-100 mt-0.5">{selectedItem.reorder_level ?? 0}</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400">Status</label>
                      <div className="mt-0.5">
                        {(() => {
                          const qty = selectedItem.quantity_on_hand ?? 0;
                          const reorderLvl = selectedItem.reorder_level ?? 0;
                          const isLowStock = qty > 0 && qty <= reorderLvl;
                          const isOutOfStock = qty === 0;

                          return (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${isOutOfStock ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800' :
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
                      <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400">Total Value</label>
                      <p className="text-xs text-gray-900 dark:text-gray-100 mt-0.5 font-semibold">
                        UGX {((selectedItem.quantity_on_hand ?? 0) * (selectedItem.unit_price ?? 0)).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Supplier & Storage Location */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-4">
                {/* Supplier Information */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 pb-1.5">Supplier</h3>
                  <div className="space-y-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2">
                    {selectedItem.supplier ? (
                      <>
                        <div>
                          <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400">Supplier Name</label>
                          <p className="text-xs text-gray-900 dark:text-gray-100 mt-0.5">{selectedItem.supplier.name}</p>
                        </div>
                        {selectedItem.supplier.contact_name && (
                          <div>
                            <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400">Contact</label>
                            <p className="text-xs text-gray-900 dark:text-gray-100 mt-0.5">{selectedItem.supplier.contact_name}</p>
                          </div>
                        )}
                        {selectedItem.supplier.phone && (
                          <div>
                            <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400">Phone</label>
                            <p className="text-xs text-gray-900 dark:text-gray-100 mt-0.5">{selectedItem.supplier.phone}</p>
                          </div>
                        )}
                        {selectedItem.supplier.email && (
                          <div>
                            <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400">Email</label>
                            <p className="text-xs text-gray-900 dark:text-gray-100 mt-0.5">{selectedItem.supplier.email}</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <div className=" bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-2">
                          <HugeiconsIcon icon={Store01Icon} size={20} className=" text-gray-400 dark:text-gray-500" />
                        </div>
                        <p className="text-xs font-medium text-gray-900 dark:text-gray-100 mb-0.5">No Supplier Assigned</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2">Add a supplier to track vendor information</p>
                        <button
                          onClick={() => handleEdit(selectedItem)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-md transition-colors"
                        >
                          <HugeiconsIcon icon={Add01Icon} size={12} className="" />
                          Add Supplier
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Storage Location */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400">Storage Location</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400">Location</label>
                      <p className="text-xs text-gray-900 dark:text-gray-100 mt-0.5 font-mono">
                        {formatStorageLocation(selectedItem)}
                      </p>
                    </div>
                    {selectedItem.warehouse && (
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {selectedItem.zone && (
                          <div>
                            <label className="text-[10px] text-gray-500 dark:text-gray-400">Zone</label>
                            <p className="text-gray-900 dark:text-gray-100">{selectedItem.zone}</p>
                          </div>
                        )}
                        {selectedItem.aisle && (
                          <div>
                            <label className="text-[10px] text-gray-500 dark:text-gray-400">Aisle</label>
                            <p className="text-gray-900 dark:text-gray-100">{selectedItem.aisle}</p>
                          </div>
                        )}
                        {selectedItem.bin && (
                          <div>
                            <label className="text-[10px] text-gray-500 dark:text-gray-400">Bin</label>
                            <p className="text-gray-900 dark:text-gray-100">{selectedItem.bin}</p>
                          </div>
                        )}
                        {selectedItem.shelf && (
                          <div>
                            <label className="text-[10px] text-gray-500 dark:text-gray-400">Shelf</label>
                            <p className="text-gray-900 dark:text-gray-100">{selectedItem.shelf}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Adjustment History */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Stock Adjustment History
                  </h3>
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="text-[10px] text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                  >
                    {showHistory ? 'Hide' : 'Show'} History
                  </button>
                </div>
                {showHistory && (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                    <AdjustmentHistoryPanel
                      inventoryItemId={selectedItem.id}
                      maxHeight="300px"
                    />
                  </div>
                )}
              </div>

              {/* Work Order Usage */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Work Order Usage
                  </h3>
                  <button
                    onClick={() => setShowWorkOrderUsage(!showWorkOrderUsage)}
                    className="text-[10px] text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                  >
                    {showWorkOrderUsage ? 'Hide' : 'Show'} Usage
                  </button>
                </div>
                {showWorkOrderUsage && (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                    <InventoryPartsUsagePanel
                      inventoryItemId={selectedItem.id}
                      maxHeight="400px"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <HugeiconsIcon icon={PackageIcon} size={40} className=" text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Select an Item</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Choose an inventory item from the list to view details</p>
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

      {/* Stock Adjustment Dialog */}
      <StockAdjustmentDialog
        isOpen={adjustmentDialogOpen}
        onClose={() => {
          setAdjustmentDialogOpen(false);
          setAdjustmentPreselectedItem(null);
        }}
        onSuccess={handleAdjustmentSuccess}
        preselectedItem={adjustmentPreselectedItem}
      />

      {/* Inventory Transactions Panel */}
      <InventoryTransactionsPanel
        isOpen={transactionsPanelOpen}
        onClose={() => setTransactionsPanelOpen(false)}
      />
    </div>
  );
};
export default InventoryPage;
