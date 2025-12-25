import React, { useState, useMemo, useCallback } from 'react';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
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
import { PartsUsageAnalyticsPanel } from '@/components/PartsUsageAnalyticsPanel';
import { useSuppliers } from '@/hooks/useSuppliers';
import { 
  formatStorageLocation, 
  formatQuantityWithUnit, 
  getUniqueWarehouses,
  ALL_CATEGORIES 
} from '@/utils/inventory-categorization-helpers';
import { ITEM_CATEGORY_LABELS } from '@/types/supabase';

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
  
  // Analytics Panel State
  const [analyticsPanelOpen, setAnalyticsPanelOpen] = useState(false);
  
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
            <div className="flex items-center gap-2">
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
                onClick={handleOpenBatchAdjustment}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md transition-colors"
                title="Adjust Stock"
              >
                <Icon icon="tabler:plus-minus" className="w-3.5 h-3.5" />
                Adjust
              </button>
              <button
                onClick={() => setTransactionsPanelOpen(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md transition-colors"
                title="Inventory Transactions"
              >
                <Icon icon="tabler:arrows-exchange" className="w-3.5 h-3.5" />
                Transactions
              </button>
              <button
                onClick={() => setAnalyticsPanelOpen(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md transition-colors"
                title="Parts Usage Analytics"
              >
                <Icon icon="tabler:chart-bar" className="w-3.5 h-3.5" />
                Analytics
              </button>
              <Link
                to="/reports?tab=inventory"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md transition-colors"
                title="Inventory Reports"
              >
                <Icon icon="tabler:report-analytics" className="w-3.5 h-3.5" />
                Reports
              </Link>
            </div>
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

              {/* Category Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Categories</label>
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
                      className={`px-2 py-0.5 text-xs rounded border transition-colors ${
                        filters.categories.includes(cat)
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
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Supplier</label>
                  <select
                    value={filters.supplierId}
                    onChange={(e) => setFilters({ ...filters, supplierId: e.target.value })}
                    className="h-9 w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2.5 py-1 text-xs dark:text-gray-200"
                  >
                    <option value="all">All Suppliers</option>
                    {suppliers?.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Warehouse</label>
                  <select
                    value={filters.warehouse}
                    onChange={(e) => setFilters({ ...filters, warehouse: e.target.value })}
                    className="h-9 w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2.5 py-1 text-xs dark:text-gray-200"
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
                const itemCategories = item.categories || [];

                return (
                  <div
                    key={item.id}
                    className={`group relative list-row cursor-pointer ${isSelected ? 'list-row-active' : ''}`}
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
                    {/* Category badges */}
                    {itemCategories.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {itemCategories.slice(0, 2).map(cat => (
                          <CategoryBadge key={cat} category={cat} size="sm" showIcon={false} />
                        ))}
                        {itemCategories.length > 2 && (
                          <span className="text-xs text-gray-400">+{itemCategories.length - 2}</span>
                        )}
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
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
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        title="Adjust Stock"
                      >
                        <Icon icon="tabler:plus-minus" className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(item);
                        }}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        title="Edit"
                      >
                        <Icon icon="tabler:edit" className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(item);
                        }}
                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                        title="Delete"
                      >
                        <Icon icon="tabler:trash" className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
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
                  onClick={() => handleQuickAdjust(selectedItem)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  <Icon icon="tabler:plus-minus" className="w-4 h-4" />
                  Adjust Stock
                </button>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide border-b border-gray-200 dark:border-gray-700 pb-2">Basic Information</h3>
                <div className="space-y-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
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
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-0.5">UGX {(selectedItem.unit_price ?? 0).toLocaleString()}</p>
                  </div>
                  {/* Categories */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Categories</label>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {(selectedItem.categories || []).length > 0 ? (
                        selectedItem.categories!.map(cat => (
                          <CategoryBadge key={cat} category={cat} size="sm" />
                        ))
                      ) : (
                        <div className="w-full text-center py-3 px-4 bg-white dark:bg-gray-900 rounded-md border border-dashed border-gray-300 dark:border-gray-600">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">No categories assigned</p>
                          <button
                            onClick={() => handleEdit(selectedItem)}
                            className="inline-flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                          >
                            <Icon icon="tabler:plus" className="w-3 h-3" />
                            Add Categories
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stock Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide border-b border-gray-200 dark:border-gray-700 pb-2">Stock Information</h3>
                <div className="space-y-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Quantity on Hand</label>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-0.5 font-semibold">
                      {formatQuantityWithUnit(selectedItem.quantity_on_hand ?? 0, selectedItem.unit_of_measure, selectedItem.units_per_package)}
                    </p>
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
                      UGX {((selectedItem.quantity_on_hand ?? 0) * (selectedItem.unit_price ?? 0)).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Supplier & Storage Location */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
              {/* Supplier Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide border-b border-gray-200 dark:border-gray-700 pb-2">Supplier</h3>
                <div className="space-y-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  {selectedItem.supplier ? (
                    <>
                      <div>
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Supplier Name</label>
                        <p className="text-sm text-gray-900 dark:text-gray-100 mt-0.5">{selectedItem.supplier.name}</p>
                      </div>
                      {selectedItem.supplier.contact_name && (
                        <div>
                          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Contact</label>
                          <p className="text-sm text-gray-900 dark:text-gray-100 mt-0.5">{selectedItem.supplier.contact_name}</p>
                        </div>
                      )}
                      {selectedItem.supplier.phone && (
                        <div>
                          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Phone</label>
                          <p className="text-sm text-gray-900 dark:text-gray-100 mt-0.5">{selectedItem.supplier.phone}</p>
                        </div>
                      )}
                      {selectedItem.supplier.email && (
                        <div>
                          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Email</label>
                          <p className="text-sm text-gray-900 dark:text-gray-100 mt-0.5">{selectedItem.supplier.email}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-6">
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Icon icon="tabler:building-store" className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">No Supplier Assigned</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Add a supplier to track vendor information</p>
                      <button
                        onClick={() => handleEdit(selectedItem)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-md transition-colors"
                      >
                        <Icon icon="tabler:plus" className="w-3.5 h-3.5" />
                        Add Supplier
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Storage Location */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">Storage Location</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Location</label>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-0.5 font-mono">
                      {formatStorageLocation(selectedItem)}
                    </p>
                  </div>
                  {selectedItem.warehouse && (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {selectedItem.zone && (
                        <div>
                          <label className="text-gray-500 dark:text-gray-400">Zone</label>
                          <p className="text-gray-900 dark:text-gray-100">{selectedItem.zone}</p>
                        </div>
                      )}
                      {selectedItem.aisle && (
                        <div>
                          <label className="text-gray-500 dark:text-gray-400">Aisle</label>
                          <p className="text-gray-900 dark:text-gray-100">{selectedItem.aisle}</p>
                        </div>
                      )}
                      {selectedItem.bin && (
                        <div>
                          <label className="text-gray-500 dark:text-gray-400">Bin</label>
                          <p className="text-gray-900 dark:text-gray-100">{selectedItem.bin}</p>
                        </div>
                      )}
                      {selectedItem.shelf && (
                        <div>
                          <label className="text-gray-500 dark:text-gray-400">Shelf</label>
                          <p className="text-gray-900 dark:text-gray-100">{selectedItem.shelf}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Adjustment History */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                  Stock Adjustment History
                </h3>
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
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
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                  Work Order Usage
                </h3>
                <button
                  onClick={() => setShowWorkOrderUsage(!showWorkOrderUsage)}
                  className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
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

      {/* Parts Usage Analytics Panel */}
      <PartsUsageAnalyticsPanel
        isOpen={analyticsPanelOpen}
        onClose={() => setAnalyticsPanelOpen(false)}
      />
    </div>
  );
};
export default InventoryPage;
