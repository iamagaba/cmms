import { useState, useMemo } from "react";
import { Button, Space, Skeleton, Segmented } from "antd";
import { Icon } from '@iconify/react'; // Import Icon from Iconify
import { LocationFormDialog } from "@/components/LocationFormDialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Location, WorkOrder } from "@/types/supabase";
import { showSuccess, showError } from "@/utils/toast";
import { snakeToCamelCase, camelToSnakeCase } from "@/utils/data-helpers";
import { LocationCard } from "@/components/LocationCard";
import { LocationDataTable } from "@/components/LocationDataTable";
import { useNavigate } from "react-router-dom";
import AppBreadcrumb from "@/components/Breadcrumbs";
import { TableFiltersBar } from "@/components/TableFiltersBar";
import Fab from "@/components/Fab";


const LocationsPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState<'card' | 'list'>('card');

  const { data: locations, isLoading: isLoadingLocations } = useQuery<Location[]>({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase.from('locations').select('*').order('name');
      if (error) throw new Error(error.message);
      return (data || []).map(location => snakeToCamelCase(location) as Location);
    }
  });

  const { data: workOrders, isLoading: isLoadingWorkOrders } = useQuery<WorkOrder[]>({
    queryKey: ['work_orders'],
    queryFn: async () => {
      const { data, error } = await supabase.from('work_orders').select('*');
      if (error) throw new Error(error.message);
      return (data || []).map(workOrder => snakeToCamelCase(workOrder) as WorkOrder);
    }
  });

  const locationMutation = useMutation({
    mutationFn: async (locationData: Partial<Location>) => {
      const { error } = await supabase.from('locations').upsert(camelToSnakeCase(locationData));
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      showSuccess('Location has been saved.');
    },
    onError: (error) => showError(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('locations').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      showSuccess('Location has been deleted.');
    },
    onError: (error) => showError(error.message),
  });

  const handleSave = (locationData: Location) => {
    locationMutation.mutate(locationData);
    setIsDialogOpen(false);
    setEditingLocation(null);
  };

  const handleDelete = (locationData: Location) => {
    deleteMutation.mutate(locationData.id);
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setIsDialogOpen(true);
  };

  const handleCardClick = (location: Location) => {
    navigate(`/locations/${location.id}`);
  };

  const filteredLocations = useMemo(() => {
    if (!locations) return [];
    return locations.filter(loc =>
      loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (loc.address && loc.address.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [locations, searchTerm]);

  const isLoading = isLoadingLocations || isLoadingWorkOrders;

  // Filter chips for search term
  const filterChips = searchTerm
    ? [{ label: `Search: ${searchTerm}`, onClose: () => setSearchTerm("") }]
    : [];

  const handleClearAll = () => {
    setSearchTerm("");
  };

  const pageActions = (
    <Space size="middle" align="center">
      <TableFiltersBar
        compact
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        filterChips={filterChips}
        onClearAll={handleClearAll}
        placeholder="Search locations..."
      />
      <Segmented
        options={[
          { value: 'card', icon: <Icon icon="ph:grid-four-fill" /> },
          { value: 'list', icon: <Icon icon="ph:list-fill" /> },
        ]}
        value={view}
        onChange={(value) => setView(value as 'card' | 'list')}
      />
  <Button className="primary-action-btn" type="primary" icon={<Icon icon="ant-design:plus-outlined" width={16} height={16} />} onClick={() => { setEditingLocation(null); setIsDialogOpen(true); }}>
        Add Location
      </Button>
    </Space>
  );

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
  <AppBreadcrumb actions={pageActions} />
      
      {isLoading ? <Skeleton active /> : (
        view === 'card' ? (
          <div className="card-grid">
            {filteredLocations.map(loc => (
              <div key={loc.id} className="tap-target" onClick={() => handleCardClick(loc)}>
                <LocationCard 
                  location={loc}
                  workOrders={workOrders || []}
                />
              </div>
            ))}
          </div>
        ) : (
          <LocationDataTable
            locations={filteredLocations}
            workOrders={workOrders || []}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )
      )}

      {isDialogOpen && (
        <LocationFormDialog 
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSave={handleSave}
          location={editingLocation}
        />
      )}

      {/* Mobile FAB for quick add */}
      <div className="hide-on-desktop">
        <Fab label="Add Location" onClick={() => { setEditingLocation(null); setIsDialogOpen(true); }} />
      </div>
    </Space>
  );
};

export default LocationsPage;