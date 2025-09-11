import { useState } from "react";
import { Button, Typography, Space, Skeleton, Row, Col, Input } from "antd";
import { Icon } from '@iconify/react'; // Import Icon from Iconify
import { AssetDataTable } from "@/components/AssetDataTable";
import { AssetFormDialog } from "@/components/AssetFormDialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Vehicle, Customer } from "@/types/supabase";
import { showSuccess, showError } from "@/utils/toast";
import { camelToSnakeCase } from "@/utils/data-helpers";
import Breadcrumbs from "@/components/Breadcrumbs"; // Import Breadcrumbs

const { Search } = Input;

const AssetsPage = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: vehicles, isLoading: isLoadingVehicles } = useQuery<Vehicle[]>({
    queryKey: ['vehicles', searchTerm],
    queryFn: async () => {
      let query = supabase.from('vehicles').select('*');
      if (searchTerm) {
        query = query.or(`license_plate.ilike.%${searchTerm}%,make.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%,vin.ilike.%${searchTerm}%`);
      }
      const { data, error } = await query.order('license_plate');
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
      const { error } = await supabase.from('vehicles').upsert([camelToSnakeCase(vehicleData)]);
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

  const pageActions = (
    <Space size="middle" align="center">
      <Search
        placeholder="Search assets..."
        onSearch={setSearchTerm}
        onChange={(e) => !e.target.value && setSearchTerm("")}
        style={{ width: 250 }}
        allowClear
      />
      <Button type="primary" icon={<Icon icon="ph:plus-fill" />} onClick={() => { setEditingVehicle(null); setIsDialogOpen(true); }}>
        Add Asset
      </Button>
    </Space>
  );

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Breadcrumbs actions={pageActions} />
      
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