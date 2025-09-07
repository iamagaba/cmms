import { useState } from "react";
import { Button, Typography, Space, Skeleton } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { AssetDataTable } from "@/components/AssetDataTable";
import { AssetFormDialog } from "@/components/AssetFormDialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Vehicle, Customer } from "@/types/supabase";
import { showSuccess, showError } from "@/utils/toast";
import { camelToSnakeCase } from "@/utils/data-helpers";

const { Title } = Typography;

const AssetsPage = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const { data: vehicles, isLoading: isLoadingVehicles } = useQuery<Vehicle[]>({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('vehicles').select('*');
      if (error) throw new Error(error.message);
      return data || [];
    }
  });

  const { data: customers, isLoading: isLoadingCustomers } = useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase.from('customers').select('*');
      if (error) throw new Error(error.message);
      return data || [];
    }
  });

  const vehicleMutation = useMutation({
    mutationFn: async (vehicleData: Partial<Vehicle>) => {
      const { error } = await supabase.from('vehicles').upsert(camelToSnakeCase(vehicleData));
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      showSuccess('Asset has been saved.');
    },
    onError: (error) => showError(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('vehicles').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      showSuccess('Asset has been deleted.');
    },
    onError: (error) => showError(error.message),
  });

  const handleSave = (vehicleData: Partial<Vehicle>) => {
    vehicleMutation.mutate(vehicleData);
    setIsDialogOpen(false);
    setEditingVehicle(null);
  };

  const handleDelete = (vehicleData: Vehicle) => {
    deleteMutation.mutate(vehicleData.id);
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setIsDialogOpen(true);
  };

  const isLoading = isLoadingVehicles || isLoadingCustomers;

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={4}>Asset Management</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingVehicle(null); setIsDialogOpen(true); }}>
          Add Asset
        </Button>
      </div>
      
      {isLoading ? <Skeleton active /> : (
        <AssetDataTable 
          vehicles={vehicles || []} 
          customers={customers || []}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {isDialogOpen && (
        <AssetFormDialog 
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSave={handleSave}
          vehicle={editingVehicle}
          customers={customers || []}
        />
      )}
    </Space>
  );
};

export default AssetsPage;