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
import { Input } from '@/components/ui/input';
import { SimpleTabs as Tabs, SimpleTabsContent as TabsContent, SimpleTabsList as TabsList, SimpleTabsTrigger as TabsTrigger } from '@/components/SimpleTabs';
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
  ITEM_CATEGORY_LABELS,
  UNIT_OF_MEASURE_LABELS
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

const formatCurrency = (amount: number) => `UGX ${amount.toLocaleString()}`;

const StatusBadge: React.FC<{ item: InventoryItem }> = ({ item }) => {
  const qty = item.quantityOnHand ?? item.quantity_on_hand ?? 0;
  const reorderLvl = item.reorderLevel ?? item.reorder_level ?? 0;
  const isLowStock = qty > 0 && qty <= reorderLvl;
  const isOutOfStock = qty === 0;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${isOutOfStock ? 'bg-red-50 text-red-700 border-red-200' :
      isLowStock ? 'bg-orange-50 text-orange-700 border-orange-200' :
        'bg-emerald-50 text-emerald-700 border-emerald-200'
      }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isOutOfStock ? 'bg-red-500' :
        isLowStock ? 'bg-orange-500' :
          'bg-emerald-500'
        }`} />
      {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
    </span>
  );
};

const InventoryPage: React.FC = () => {
  const queryClient = useQueryClient();

  // State management
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const selectedItemIdRef = React.useRef<string | null>(null);

  // Keep ref in sync with selected item
  React.useEffect(() => {
    selectedItemIdRef.current = selectedItem?.id || null;
  }, [selectedItem]);

  // Delete Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Stock Adjustment Dialog State
  const [adjustmentDialogOpen, setAdjustmentDialogOpen] = useState(false);
  const [adjustmentPreselectedItem, setAdjustmentPreselectedItem] = useState<InventoryItem | null>(null);

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
      showSuccess('Inventory item saved.');
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
      filtered = filtered.filter(i => (i.quantityOnHand ?? i.quantity_on_hand ?? 0) > (i.reorderLevel ?? i.reorder_level ?? 0));
    } else if (filters.stockStatus === 'low-stock') {
      filtered = filtered.filter(i => (i.quantityOnHand ?? i.quantity_on_hand ?? 0) > 0 && (i.quantityOnHand ?? i.quantity_on_hand ?? 0) <= (i.reorderLevel ?? i.reorder_level ?? 0));
    } else if (filters.stockStatus === 'out-of-stock') {
      filtered = filtered.filter(i => (i.quantityOnHand ?? i.quantity_on_hand ?? 0) === 0);
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
        case 'quantity': aVal = a.quantityOnHand ?? a.quantity_on_hand ?? 0; bVal = b.quantityOnHand ?? b.quantity_on_hand ?? 0; break;
        case 'price': aVal = a.unitPrice ?? a.unit_price ?? 0; bVal = b.unitPrice ?? b.unit_price ?? 0; break;
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

  const handleAdjustmentSuccess = useCallback(async () => {
    // Refetch inventory items to get updated data
    const { data: refreshedData } = await refetch();

    // Refresh the selected item if it was adjusted
    const currentSelectedId = selectedItemIdRef.current;
    if (currentSelectedId && refreshedData) {
      // Find the updated item in the refreshed data
      const updatedItem = refreshedData.find(item => item.id === currentSelectedId);
      if (updatedItem) {
        setSelectedItem(updatedItem);
      }
    }
  }, [refetch]);

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
          {/* Page Title & Add Action */}
          <div className="px-3 py-2 flex items-center justify-between">
            <h1 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Inventory</h1>
            <button
              onClick={() => { setEditingItem(null); setIsDialogOpen(true); }}
              className="inline-flex items-center justify-center w-6 h-6 text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors"
              title="Add Item"
            >
              <HugeiconsIcon icon={Add01Icon} size={14} />
            </button>
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
          <div className="px-3 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`inline-flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${filtersOpen || hasActiveFilters
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
              className="inline-flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md transition-colors whitespace-nowrap"
              title="Adjust Stock"
            >
              <HugeiconsIcon icon={PlusMinusIcon} size={14} className="" />
              Adjust
            </button>
            <button
              onClick={() => setTransactionsPanelOpen(true)}
              className="inline-flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md transition-colors whitespace-nowrap"
              title="Inventory Transactions"
            >
              <HugeiconsIcon icon={ArrowDataTransferHorizontalIcon} size={14} className="" />
              Transactions
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
                const qty = item.quantityOnHand ?? item.quantity_on_hand ?? 0;
                const reorderLvl = item.reorderLevel ?? item.reorder_level ?? 0;
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
                      <span>UGX {(item.unitPrice ?? item.unit_price ?? 0).toLocaleString()}</span>
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
            <div className="flex-none px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 z-10">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {selectedItem.name || 'Unnamed Item'}
                    </h2>
                    <StatusBadge item={selectedItem} />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1">
                    {selectedItem.sku || 'No SKU'}
                  </p>
                </div>
                <div className="flex items-center gap-2 pointer-events-auto">
                  <button
                    onClick={() => handleQuickAdjust(selectedItem)}
                    className="inline-flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 dark:border-gray-800"
                    title="Adjust Stock"
                  >
                    <HugeiconsIcon icon={PlusMinusIcon} size={18} />
                  </button>
                  <button
                    onClick={() => handleEdit(selectedItem)}
                    className="inline-flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 dark:border-gray-800"
                    title="Edit Item"
                  >
                    <HugeiconsIcon icon={PencilEdit02Icon} size={18} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-auto px-4 py-6 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent overscroll-y-contain">
              {/* Tabs Navigation */}
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full justify-start border-b border-gray-200 dark:border-gray-700 rounded-none bg-transparent p-0 h-auto mb-6">
                  <TabsTrigger
                    value="overview"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 text-xs font-medium"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="configuration"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 text-xs font-medium"
                  >
                    Configuration
                  </TabsTrigger>
                  <TabsTrigger
                    value="logistics"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 text-xs font-medium"
                  >
                    Logistics
                  </TabsTrigger>
                  <TabsTrigger
                    value="history"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 text-xs font-medium"
                  >
                    Adjustment History
                  </TabsTrigger>
                  <TabsTrigger
                    value="usage"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 text-xs font-medium"
                  >
                    Work Order Usage
                  </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="mt-0 space-y-6">
                  {/* 1. Stock & Valuation Card */}
                  <div>
                    <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide mb-3">Stock & Valuation</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {/* On Hand - Primary Metric */}
                      <div className="col-span-1 bg-purple-50 dark:bg-purple-900/10 rounded-lg p-4 border border-purple-100 dark:border-purple-900/30">
                        <span className="block text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">On Hand</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                            {(selectedItem.quantityOnHand ?? selectedItem.quantity_on_hand ?? 0).toLocaleString()}
                          </span>
                          <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                            {UNIT_OF_MEASURE_LABELS[selectedItem.unitOfMeasure ?? selectedItem.unit_of_measure ?? 'each'] ?? 'Units'}
                          </span>
                        </div>
                      </div>

                      {/* Value & Price - Secondary Metrics */}
                      <div className="col-span-2 grid grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                          <span className="block text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1">Total Value</span>
                          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            {formatCurrency((selectedItem.quantityOnHand ?? selectedItem.quantity_on_hand ?? 0) * (selectedItem.unitPrice ?? selectedItem.unit_price ?? 0))}
                          </span>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                          <span className="block text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1">Unit Price</span>
                          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            UGX {(selectedItem.unitPrice ?? selectedItem.unit_price ?? 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. Overview Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide mb-3">Details</h3>
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-100 dark:border-gray-800">
                        <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                          {/* Categories */}
                          <div className="col-span-2">
                            <span className="block text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1.5">Categories</span>
                            <div className="flex flex-wrap gap-1.5">
                              {selectedItem.categories && selectedItem.categories.length > 0 ? (
                                selectedItem.categories.map(cat => (
                                  <CategoryBadge key={cat} category={cat} size="sm" showIcon={true} />
                                ))
                              ) : (
                                <span className="text-sm text-gray-400 italic">Uncategorized</span>
                              )}
                            </div>
                          </div>

                          {/* Description */}
                          <div className="col-span-2">
                            <span className="block text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1">Description</span>
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                              {selectedItem.description || <span className="text-gray-400 italic">No description provided.</span>}
                            </p>
                          </div>

                          {/* Model */}
                          <div>
                            <span className="block text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1">Model</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedItem.model || '-'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Configuration Tab */}
                <TabsContent value="configuration" className="mt-0">
                  <div className="space-y-4">
                    <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">Configuration</h3>
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-800">
                      <div className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <HugeiconsIcon icon={Settings02Icon} size={16} className="text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">Reorder Level</span>
                        </div>
                        <span className="font-mono font-medium text-gray-900 dark:text-gray-100">
                          {selectedItem.reorderLevel ?? selectedItem.reorder_level ?? 0}
                        </span>
                      </div>
                      <div className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <HugeiconsIcon icon={PackageIcon} size={16} className="text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">Pack Size</span>
                        </div>
                        <span className="font-mono font-medium text-gray-900 dark:text-gray-100">
                          {selectedItem.unitsPerPackage ?? selectedItem.units_per_package ?? 1}
                        </span>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Logistics Tab */}
                <TabsContent value="logistics" className="mt-0">
                  <div className="space-y-4">
                    <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">Logistics</h3>
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 space-y-3">
                      {/* Storage Location */}
                      <div>
                        <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider block mb-1">Exact Location</span>
                        <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900/50 p-2 rounded border border-gray-100 dark:border-gray-800 font-mono text-xs">
                          <HugeiconsIcon icon={Store01Icon} size={14} className="text-gray-400" />
                          {formatStorageLocation(selectedItem)}
                        </div>
                      </div>

                      {/* Supplier */}
                      <div>
                        <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider block mb-1">Preferred Supplier</span>
                        {selectedItem.supplier ? (
                          <div className="text-sm text-gray-900 dark:text-gray-100">
                            {selectedItem.supplier.name}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 italic">No supplier assigned</span>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Adjustment History Tab */}
                <TabsContent value="history" className="mt-0">
                  <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                    <AdjustmentHistoryPanel inventoryItemId={selectedItem.id} maxHeight="500px" />
                  </div>
                </TabsContent>

                {/* Work Order Usage Tab */}
                <TabsContent value="usage" className="mt-0">
                  <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                    <InventoryPartsUsagePanel inventoryItemId={selectedItem.id} maxHeight="500px" />
                  </div>
                </TabsContent>
              </Tabs>
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
      {
        isDialogOpen && (
          <InventoryItemFormDialog
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            onSave={handleSave}
            item={editingItem}
          />
        )
      }
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
    </div >
  );
};

export default InventoryPage;
