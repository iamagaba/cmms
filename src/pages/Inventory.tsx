import { useState } from "react";
import { Button, Typography, Space, Skeleton, Input, Row, Col } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { InventoryDataTable } from "@/components/InventoryDataTable";
import { InventoryItemFormDialog } from "@/components/InventoryItemFormDialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { InventoryItem } from "@/types/supabase";
import { showSuccess, showError } from "@/utils/toast";
import PageHeader from "@/components/PageHeader";

const { Title } = Typography;

const InventoryPage = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: items, isLoading } = useQuery<InventoryItem[]>({
    queryKey: ['inventory_items', searchTerm],
    queryFn: async () => {
      let query = supabase.from('inventory_items').select('*').order('name');
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%`);
      }
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data || [];
    }
  });

  const itemMutation = useMutation({
    mutationFn: async (itemData: Partial<InventoryItem>) => {
      const { error } = await supabase.from('inventory_items').upsert([itemData]);
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

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <PageHeader
        title="Inventory Management"
        onSearch={setSearchTerm}
        onSearchChange={(e) => !e.target.value && setSearchTerm("")}
        actions={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingItem(null); setIsDialogOpen(true); }}>
            Add Item
          </Button>
        }
      />
      
      {isLoading ? <Skeleton active /> : (
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
    </Space>
  );
};

export default InventoryPage;