import { useState } from "react";
import { Button, Space, Spin, Alert } from "antd";
import { Icon } from '@iconify/react'; // Import Icon from Iconify
import { InventoryDataTable } from "@/components/InventoryDataTable";
import AppBreadcrumb from "@/components/Breadcrumbs";
import Fab from "@/components/Fab";
import { TableFiltersBar } from "@/components/TableFiltersBar";
import { InventoryItemFormDialog } from "@/components/InventoryItemFormDialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { InventoryItem } from "@/types/supabase";

import { snakeToCamelCase, camelToSnakeCase } from "@/utils/data-helpers";
import { showSuccess, showError } from "@/utils/toast";

// Removed custom primary button style to match Customers page buttons

// Removed Input.Search in favor of TableFiltersBar

const InventoryPage = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: items,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery<InventoryItem[]>({
    queryKey: ['inventory_items', searchTerm],
    queryFn: async () => {
      let query = supabase.from('inventory_items').select('*').order('name');
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%`);
      }
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return (data || []).map(item => snakeToCamelCase(item) as InventoryItem);
    }
  });

  const itemMutation = useMutation({
    mutationFn: async (itemData: Partial<InventoryItem>) => {
      const { error } = await supabase.from('inventory_items').upsert([camelToSnakeCase(itemData)]);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory_items'] });
      showSuccess('Inventory item has been saved.');
    },
    onError: (error) => showError(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('inventory_items').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory_items'] });
      showSuccess('Inventory item has been deleted.');
    },
    onError: (error) => showError(`Failed to delete: ${error.message}`),
  });

  const handleSave = (itemData: Partial<InventoryItem>) => {
    itemMutation.mutate(itemData);
  };

  const handleDelete = (itemData: InventoryItem) => {
    deleteMutation.mutate(itemData.id);
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  // Inventory filter chips (only search for now)
  const filterChips = searchTerm
    ? [{ label: `Search: ${searchTerm}`, onClose: () => setSearchTerm("") }]
    : [];

  const pageActions = (
    <Space size="middle" align="center">
      <Button
        className="primary-action-btn"
        type="primary"
        icon={<Icon icon="ant-design:plus-outlined" width={16} height={16} />}
        onClick={() => { setEditingItem(null); setIsDialogOpen(true); }}
      >
        Add Item
      </Button>
    </Space>
  );

  return (
    <div style={{ width: '100%' }}>
      <AppBreadcrumb actions={pageActions} />
      <div className="sticky-header-secondary">
        <TableFiltersBar
          compact
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          filterChips={filterChips}
          onClearAll={() => setSearchTerm("")}
          placeholder="Search inventory..."
        />
      </div>
      {isError ? (
        <Alert
          message="Error Loading Inventory"
          description={error instanceof Error ? error.message : 'An error occurred.'}
          type="error"
          showIcon
          action={
            <Button size="small" type="primary" onClick={() => refetch()}>
              Retry
            </Button>
          }
          style={{ margin: '40px 0' }}
        />
      ) : isLoading ? (
        <Spin tip="Loading inventory..." size="large" style={{ width: '100%', margin: '40px 0' }} />
      ) : (
        <InventoryDataTable 
          items={items || []} 
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {isDialogOpen && (
        <InventoryItemFormDialog 
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSave={handleSave}
          item={editingItem}
        />
      )}

      {/* Mobile FAB for quick add */}
      <div className="hide-on-desktop">
        <Fab label="Add Item" onClick={() => { setEditingItem(null); setIsDialogOpen(true); }} />
      </div>
    </div>
  );
};

export default InventoryPage;