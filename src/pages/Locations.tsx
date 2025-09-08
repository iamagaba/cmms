import { useState } from "react";
import { Button, Typography, Space, Row, Col, Skeleton } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { LocationFormDialog } from "@/components/LocationFormDialog";
import { LocationCard } from "@/components/LocationCard";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Location, WorkOrder } from "@/types/supabase";
import { showSuccess, showError } from "@/utils/toast";
import { camelToSnakeCase } from "@/utils/data-helpers"; // Import the utility
import PageHeader from "@/components/PageHeader";

const { Title } = Typography;

const LocationsPage = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);

  const { data: allLocations, isLoading: isLoadingLocations } = useQuery<Location[]>({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase.from('locations').select('*');
      if (error) throw new Error(error.message);
      return data || [];
    }
  });

  const { data: workOrders, isLoading: isLoadingWorkOrders } = useQuery<WorkOrder[]>({
    queryKey: ['work_orders'],
    queryFn: async () => {
      const { data, error } = await supabase.from('work_orders').select('*');
      if (error) throw new Error(error.message);
      return data || [];
    }
  });

  const locationMutation = useMutation({
    mutationFn: async (locationData: Partial<Location>) => {
      const { error } = await supabase.from('locations').upsert(locationData);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      showSuccess('Location has been saved.');
    },
    onError: (error) => showError(error.message),
  });

  const handleSave = (locationData: Location) => {
    locationMutation.mutate(camelToSnakeCase(locationData)); // Apply camelToSnakeCase here
    setIsDialogOpen(false);
    setEditingLocation(null);
  };

  const isLoading = isLoadingLocations || isLoadingWorkOrders;

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <PageHeader
        title="Service Locations"
        actions={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingLocation(null); setIsDialogOpen(true); }}>
            Add Location
          </Button>
        }
      />
      
      {isLoading ? <Skeleton active /> : (
        <Row gutter={[16, 16]}>
          {(allLocations || []).map(location => (
            <Col key={location.id} xs={24} sm={12} md={8} lg={6}>
              <LocationCard location={location} workOrders={workOrders || []} />
            </Col>
          ))}
        </Row>
      )}

      {isDialogOpen && (
        <LocationFormDialog 
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSave={handleSave}
          location={editingLocation}
        />
      )}
    </Space>
  );
};

export default LocationsPage;