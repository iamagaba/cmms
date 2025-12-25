import { useState } from "react";
import { Button, Space, Skeleton } from "antd";
import { Icon } from '@iconify/react'; // Import Icon from Iconify
import { AssetDataTable } from "@/components/AssetDataTable";
import { TableFiltersBar } from "@/components/TableFiltersBar";
// uuid import for SSR/ESM compatibility (already used in AssetFormDialog)
import { AssetFormDialog } from "@/components/AssetFormDialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Vehicle, Customer } from "@/types/supabase";
import { showSuccess, showError } from "@/utils/toast";
import { camelToSnakeCase, snakeToCamelCase } from "@/utils/data-helpers";
import AppBreadcrumb from "@/components/Breadcrumbs";
// Removed custom primary button style to match Customers page buttons


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
      // Keep snake_case keys to match table columns and form field names
      return (data || []) as Vehicle[];
    }
  });

  const { data: customers, isLoading: isLoadingCustomers } = useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase.from('customers').select('*');
      if (error) throw new Error(error.message);
      return (data || []).map(customer => snakeToCamelCase(customer) as Customer);
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

  // Filter chips for search term
  const filterChips = searchTerm
    ? [{ label: `Search: ${searchTerm}`, onClose: () => setSearchTerm("") }]
    : [];

  const handleClearAll = () => {
    setSearchTerm("");
  };

  const pageActions = (
    <Space size="middle" align="center">
      <Button
        className="primary-action-btn"
        type="primary"
        icon={<Icon icon="ant-design:plus-outlined" width={16} height={16} />}
        onClick={() => { setEditingVehicle(null); setIsDialogOpen(true); }}
      >
        Add Asset
      </Button>
    </Space>
  );

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
  <AppBreadcrumb actions={pageActions} />
      <div className="sticky-header-secondary">
        <TableFiltersBar
          compact
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          filterChips={filterChips}
          onClearAll={handleClearAll}
          placeholder="Search assets..."
        />
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