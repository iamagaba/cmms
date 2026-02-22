import { Archive, Plus, RefreshCw, Search, Settings, AlertCircle, Edit, Trash2, Package, Store, ArrowLeftRight, PlusCircle } from 'lucide-react';
import React, { useState, useMemo, useCallback } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/ui/empty-state';


import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { InventoryItem, ItemCategory, Supplier } from '@/types/supabase';
import { snakeToCamelCase, camelToSnakeCase } from '@/utils/data-helpers';
import { showSuccess, showError } from '@/utils/toast';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

const formatCurrency = (amount: number) => {
  if (amount >= 1000000) {
    return `UGX ${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `UGX ${(amount / 1000).toFixed(1)}K`;
  }
  return `UGX ${amount.toLocaleString()}`;
};

const StockStatusBadge: React.FC<{ item: InventoryItem }> = ({ item }) => {
  const qty = item.quantityOnHand ?? item.quantity_on_hand ?? 0;
  const reorderLvl = item.reorderLevel ?? item.reorder_level ?? 0;
  const isLowStock = qty > 0 && qty <= reorderLvl;
  const isOutOfStock = qty === 0;

  const variant = isOutOfStock ? 'error' : isLowStock ? 'warning' : 'success';
  const label = isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock';

  return (
    <Badge variant={variant} className="gap-1.5">
      <span className={`w-1.5 h-1.5 rounded-full ${isOutOfStock ? 'bg-rose-500' :
        isLowStock ? 'bg-orange-500' :
          'bg-emerald-500'
        }`} />
      {label}
    </Badge>
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
      <div className="flex h-screen w-full bg-background overflow-hidden">
        {/* List Column */}
        <div className="w-80 flex-none border-r border-border bg-muted dark:bg-background flex flex-col">
          <div className="p-4 border-b border-border">
            <Skeleton className="h-6 mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="flex-1 p-4 space-y-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </div>

        {/* Detail Column */}
        <div className="flex-1 overflow-auto bg-background">
          <div className="p-6 space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-4" />
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
      <div className="flex h-screen w-full bg-background overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Inventory</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              {error.message || 'An unexpected error occurred.'}
            </p>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-destructive-foreground bg-destructive hover:bg-destructive/90 rounded-md transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* List Column - Inventory List */}
      <div className="w-80 flex-none border-r border-border bg-muted dark:bg-background flex flex-col">
        {/* Header with Stat Ribbon */}
        <div className="border-b border-border">
          {/* Page Header */}
          <div className="px-3 py-2">
            <div className="flex items-center justify-between mb-1">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Inventory</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Manage parts and supplies</p>
              </div>
              <button
                onClick={() => { setEditingItem(null); setIsDialogOpen(true); }}
                className="inline-flex items-center justify-center w-7 h-7 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                title="Add Item"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="px-3 py-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-muted-foreground" />
              </div>
              <input
                type="text"
                placeholder="Search inventory..."
                aria-label="Search inventory"
                className="w-full pl-10 pr-4 py-1.5 text-xs border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Filters Toggle */}
          <div className="px-3 py-2 flex items-center gap-4 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`inline-flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${filtersOpen || hasActiveFilters
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted border border-border'
                }`}
            >
              <Settings className="w-5 h-5" />
              Filters
              {hasActiveFilters && (
                <span className="inline-flex items-center justify-center min-w-4 h-4 h-3.5 px-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                  {[searchTerm, filters.stockStatus !== 'all', filters.category !== 'all', filters.categories.length > 0, filters.supplierId !== 'all', filters.warehouse !== 'all'].filter(Boolean).length}
                </span>
              )}
            </button>
            <button
              onClick={handleOpenBatchAdjustment}
              className="inline-flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted border border-border rounded-md transition-colors whitespace-nowrap"
              title="Adjust Stock"
            >
              <PlusCircle className="w-4 h-4" />
              Adjust
            </button>
            <button
              onClick={() => setTransactionsPanelOpen(true)}
              className="inline-flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted border border-border rounded-md transition-colors whitespace-nowrap"
              title="Inventory Transactions"
            >
              <ArrowLeftRight className="w-4 h-4" />
              Transactions
            </button>
          </div>

          {/* Advanced Filters */}
          {filtersOpen && (
            <div className="px-4 pb-4 border-t border-border pt-2 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="block text-xs font-medium text-muted-foreground mb-1">Status</Label>
                  <Select
                    value={filters.stockStatus}
                    onValueChange={(value) => setFilters({ ...filters, stockStatus: value })}
                  >
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="in-stock">In Stock</SelectItem>
                      <SelectItem value="low-stock">Low Stock</SelectItem>
                      <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="block text-xs font-medium text-muted-foreground mb-1">Sort</Label>
                  <Select
                    value={filters.sortBy}
                    onValueChange={(value) => setFilters({ ...filters, sortBy: value })}
                  >
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="sku">SKU</SelectItem>
                      <SelectItem value="quantity">Quantity</SelectItem>
                      <SelectItem value="price">Price</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <Label className="block text-xs font-medium text-muted-foreground mb-1">Categories</Label>
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
                      className={`px-2 py-0.5 text-xs rounded border transition-colors ${filters.categories.includes(cat)
                        ? 'bg-primary/10 text-primary border-primary/20'
                        : 'bg-background text-muted-foreground border-border hover:border-muted-foreground'
                        }`}
                    >
                      {ITEM_CATEGORY_LABELS[cat]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Supplier & Warehouse Filters */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="block text-xs font-medium text-muted-foreground mb-1">Supplier</Label>
                  <Select
                    value={filters.supplierId}
                    onValueChange={(value) => setFilters({ ...filters, supplierId: value })}
                  >
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Suppliers</SelectItem>
                      {suppliers?.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="block text-xs font-medium text-muted-foreground mb-1">Warehouse</Label>
                  <Select
                    value={filters.warehouse}
                    onValueChange={(value) => setFilters({ ...filters, warehouse: value })}
                  >
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Warehouses</SelectItem>
                      {uniqueWarehouses.map(w => (
                        <SelectItem key={w} value={w}>{w}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="text-xs text-muted-foreground hover:text-foreground underline"
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
            <EmptyState
              icon={<Archive className="w-6 h-6 text-muted-foreground" />}
              title="No items found"
              description={hasActiveFilters ? "Try adjusting your filters" : "Add your first inventory item to get started"}
            />
          ) : (
            <div className="divide-y divide-border">
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
                    className={`group relative cursor-pointer p-3 transition-all hover:bg-muted ${isSelected ? 'bg-background shadow-sm' : ''}`}
                    onClick={() => handleSelectItem(item)}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="text-xs font-semibold text-foreground">
                            {item.name || 'Unnamed Item'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.sku || 'No SKU'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant={isOutOfStock ? 'error' : isLowStock ? 'warning' : 'success'} className="text-xs">
                          {isOutOfStock ? 'Out' : isLowStock ? 'Low' : 'In Stock'}
                        </Badge>
                      </div>
                    </div>
                    {/* Category badges */}
                    {itemCategories.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-1.5">
                        {itemCategories.slice(0, 2).map(cat => (
                          <CategoryBadge key={cat} category={cat} size="sm" showIcon={false} />
                        ))}
                        {itemCategories.length > 2 && (
                          <span className="text-xs text-muted-foreground">+{itemCategories.length - 2}</span>
                        )}
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatQuantityWithUnit(qty, item.unit_of_measure, item.units_per_package)}</span>
                      <span>UGX {(item.unitPrice ?? item.unit_price ?? 0).toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Detail Column */}
      <div className="flex-1 flex flex-col overflow-hidden bg-background">
        {selectedItem ? (
          <div className="flex flex-col h-full">
            <div className="flex-none px-4 py-3 border-b border-border bg-background z-10">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold text-foreground">
                      {selectedItem.name || 'Unnamed Item'}
                    </h2>
                    <StockStatusBadge item={selectedItem} />
                  </div>
                  <p className="text-xs text-muted-foreground font-mono mt-1">
                    {selectedItem.sku || 'No SKU'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuickAdjust(selectedItem)}
                    title="Adjust Stock"
                  >
                    <PlusCircle className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(selectedItem)}
                    title="Edit Item"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClick(selectedItem)}
                    title="Delete Item"
                    className="hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-auto px-4 py-6 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent overscroll-y-contain">
              {/* Tabs Navigation */}
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full justify-start border-b border-border rounded-none bg-transparent p-0 h-auto mb-6">
                  <TabsTrigger
                    value="overview"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 text-xs font-medium"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="configuration"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 text-xs font-medium"
                  >
                    Configuration
                  </TabsTrigger>
                  <TabsTrigger
                    value="logistics"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 text-xs font-medium"
                  >
                    Logistics
                  </TabsTrigger>
                  <TabsTrigger
                    value="history"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 text-xs font-medium"
                  >
                    Adjustment History
                  </TabsTrigger>
                  <TabsTrigger
                    value="usage"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 text-xs font-medium"
                  >
                    Work Order Usage
                  </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="mt-0 space-y-6">
                  {/* 1. Stock & Valuation Card */}
                  <div>
                    <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-4">Stock & Valuation</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {/* On Hand - Primary Metric */}
                      <div className="col-span-1 bg-card rounded-lg p-5 border border-border shadow-sm">
                        <span className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">On Hand</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold text-foreground">
                            {(selectedItem.quantityOnHand ?? selectedItem.quantity_on_hand ?? 0).toLocaleString()}
                          </span>
                          <span className="text-sm font-medium text-muted-foreground">
                            {UNIT_OF_MEASURE_LABELS[selectedItem.unitOfMeasure ?? selectedItem.unit_of_measure ?? 'each'] ?? 'Units'}
                          </span>
                        </div>
                      </div>

                      {/* Value & Price - Secondary Metrics */}
                      <div className="col-span-2 grid grid-cols-2 gap-4">
                        <div className="bg-card rounded-lg p-5 border border-border shadow-sm">
                          <span className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Total Value</span>
                          <span className="text-2xl font-bold text-foreground">
                            {formatCurrency((selectedItem.quantityOnHand ?? selectedItem.quantity_on_hand ?? 0) * (selectedItem.unitPrice ?? selectedItem.unit_price ?? 0))}
                          </span>
                        </div>
                        <div className="bg-card rounded-lg p-5 border border-border shadow-sm">
                          <span className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Unit Price</span>
                          <span className="text-2xl font-bold text-foreground">
                            {formatCurrency(selectedItem.unitPrice ?? selectedItem.unit_price ?? 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. Overview Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-3">Details</h3>
                      <div className="bg-muted/50 rounded-lg p-4 border border-border">
                        <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                          {/* Categories */}
                          <div className="col-span-2">
                            <span className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Categories</span>
                            <div className="flex flex-wrap gap-1.5">
                              {selectedItem.categories && selectedItem.categories.length > 0 ? (
                                selectedItem.categories.map(cat => (
                                  <CategoryBadge key={cat} category={cat} size="sm" showIcon={true} />
                                ))
                              ) : (
                                <span className="text-sm text-muted-foreground italic">Uncategorized</span>
                              )}
                            </div>
                          </div>

                          {/* Description */}
                          <div className="col-span-2">
                            <span className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Description</span>
                            <p className="text-sm text-foreground leading-relaxed">
                              {selectedItem.description || <span className="text-muted-foreground italic">No description provided.</span>}
                            </p>
                          </div>

                          {/* Model */}
                          <div>
                            <span className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Model</span>
                            <span className="text-sm font-medium text-foreground">{selectedItem.model || '-'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Configuration Tab */}
                <TabsContent value="configuration" className="mt-0">
                  <div className="space-y-4">
                    <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide">Configuration</h3>
                    <div className="bg-card rounded-lg border border-border divide-y divide-border">
                      <div className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Settings className="w-5 h-5 text-muted-foreground" />
                          <span className="text-sm text-foreground">Reorder Level</span>
                        </div>
                        <span className="font-mono font-medium text-foreground">
                          {selectedItem.reorderLevel ?? selectedItem.reorder_level ?? 0}
                        </span>
                      </div>
                      <div className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-foreground">Pack Size</span>
                        </div>
                        <span className="font-mono font-medium text-foreground">
                          {selectedItem.unitsPerPackage ?? selectedItem.units_per_package ?? 1}
                        </span>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Logistics Tab */}
                <TabsContent value="logistics" className="mt-0">
                  <div className="space-y-4">
                    <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide">Logistics</h3>
                    <div className="bg-card rounded-lg border border-border p-3 space-y-3">
                      {/* Storage Location */}
                      <div>
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1">Exact Location</span>
                        <div className="flex items-center gap-2 text-foreground bg-muted/50 p-2 rounded border border-border font-mono text-xs">
                          <Store className="w-4 h-4 text-muted-foreground" />
                          {formatStorageLocation(selectedItem)}
                        </div>
                      </div>

                      {/* Supplier */}
                      <div>
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1">Preferred Supplier</span>
                        {selectedItem.supplier ? (
                          <div className="text-sm text-foreground">
                            {selectedItem.supplier.name}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground italic">No supplier assigned</span>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Adjustment History Tab */}
                <TabsContent value="history" className="mt-0">
                  <div className="border border-border rounded-md overflow-hidden">
                    <AdjustmentHistoryPanel inventoryItemId={selectedItem.id} maxHeight="500px" />
                  </div>
                </TabsContent>

                {/* Work Order Usage Tab */}
                <TabsContent value="usage" className="mt-0">
                  <div className="border border-border rounded-md overflow-hidden">
                    <InventoryPartsUsagePanel inventoryItemId={selectedItem.id} maxHeight="500px" />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Package size={40} className="text-muted-foreground mx-auto mb-3" />
              <h3 className="text-sm font-medium text-foreground mb-1">Select an Item</h3>
              <p className="text-xs text-muted-foreground">Choose an inventory item from the list to view details</p>
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
    </div>
  );
};

export default InventoryPage;




