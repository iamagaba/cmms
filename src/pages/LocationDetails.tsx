import { useParams, useNavigate } from "react-router-dom";
import { Avatar, Button, Card, Col, Row, Space, Typography, List, Skeleton } from "antd";
import { ArrowLeftOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { GoogleMap, MarkerF } from "@react-google-maps/api";
import { WorkOrderDataTable } from "@/components/WorkOrderDataTable";
import NotFound from "./NotFound";
import { useMemo, useState } from "react";
import { showSuccess, showInfo, showError } from "@/utils/toast";
import { OnHoldReasonDialog } from "@/components/OnHoldReasonDialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Location, WorkOrder, Technician, Customer, Vehicle, Profile } from "@/types/supabase"; // Import Profile
import { camelToSnakeCase } from "@/utils/data-helpers"; // Import the utility
import PageHeader from "@/components/PageHeader";
import dayjs from "dayjs";
import { getColumns } from "@/components/WorkOrderTableColumns"; // Import getColumns

const { Title, Text } = Typography;

const containerStyle = { width: '100%', height: '300px', borderRadius: '8px' };

const LocationDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [onHoldWorkOrder, setOnHoldWorkOrder] = useState<WorkOrder | null>(null);

  const { data: location, isLoading: isLoadingLocation } = useQuery<Location | null>({ queryKey: ['location', id], queryFn: async () => { const { data, error } = await supabase.from('locations').select('*').eq('id', id).single(); if (error) throw new Error(error.message); return data; }, enabled: !!id });
  const { data: allWorkOrders, isLoading: isLoadingWorkOrders } = useQuery<WorkOrder[]>({ queryKey: ['work_orders'], queryFn: async () => { const { data, error } = await supabase.from('work_orders').select('*'); if (error) throw new Error(error.message); return data || []; } });
  const { data: technicians, isLoading: isLoadingTechnicians } = useQuery<Technician[]>({ queryKey: ['technicians'], queryFn: async () => { const { data, error } = await supabase.from('technicians').select('*'); if (error) throw new Error(error.message); return data || []; } });
  const { data: customers, isLoading: isLoadingCustomers } = useQuery<Customer[]>({ queryKey: ['customers'], queryFn: async () => { const { data, error } = await supabase.from('customers').select('*'); if (error) throw new Error(error.message); return data || []; } });
  const { data: vehicles, isLoading: isLoadingVehicles } = useQuery<Vehicle[]>({ queryKey: ['vehicles'], queryFn: async () => { const { data, error } = await supabase.from('vehicles').select('*'); if (error) throw new Error(error.message); return data || []; } });
  const { data: profiles, isLoading: isLoadingProfiles } = useQuery<Profile[]>({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*'); // Select all fields for Profile type
      if (error) throw new Error(error.message);
      return data || [];
    }
  });

  const workOrderMutation = useMutation({
    mutationFn: async (workOrderData: Partial<WorkOrder>) => { const { error } = await supabase.from('work_orders').upsert(workOrderData); if (error) throw new Error(error.message); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['work_orders'] }); showSuccess('Work order has been updated.'); },
    onError: (error) => showError(error.message),
  });

  const locationWorkOrders = useMemo(() => (allWorkOrders || []).filter(wo => wo.locationId === id), [id, allWorkOrders]);
  const locationTechnicians = useMemo(() => { const techIds = new Set(locationWorkOrders.map(wo => wo.assignedTechnicianId)); return (technicians || []).filter(tech => techIds.has(tech.id)); }, [locationWorkOrders, technicians]);

  const handleUpdateWorkOrder = (id: string, updates: Partial<WorkOrder>) => {
    const workOrder = allWorkOrders?.find(wo => wo.id === id);
    if (!workOrder) return;
    if (updates.status === 'On Hold') { setOnHoldWorkOrder(workOrder); return; }
    if ((updates.assignedTechnicianId || updates.appointmentDate) && workOrder.status === 'Ready') { updates.status = 'In Progress'; showInfo(`Work Order ${id} automatically moved to In Progress.`); }
    workOrderMutation.mutate(camelToSnakeCase({ id, ...updates })); // Apply camelToSnakeCase here
  };

  const handleSaveOnHoldReason = (reason: string) => {
    if (!onHoldWorkOrder) return;
    const updates = { status: 'On Hold' as const, onHoldReason: reason };
    workOrderMutation.mutate(camelToSnakeCase({ id: onHoldWorkOrder.id, ...updates })); // Apply camelToSnakeCase here
    setOnHoldWorkOrder(null);<dyad-problem-report summary="2 problems">
<problem file="src/pages/LocationDetails.tsx" line="109" column="12" code="2741">Property 'visibleColumns' is missing in type '{ workOrders: WorkOrder[]; technicians: Technician[]; locations: Location[]; customers: Customer[]; vehicles: Vehicle[]; onEdit: () =&gt; void; onDelete: () =&gt; void; onUpdateWorkOrder: (id: string, updates: Partial&lt;...&gt;) =&gt; void; onViewDetails: (workOrderId: string) =&gt; void; profiles: Profile[]; }' but required in type 'WorkOrderDataTableProps'.</problem>
<problem file="src/pages/AssetDetails.tsx" line="213" column="22" code="2741">Property 'visibleColumns' is missing in type '{ workOrders: WorkOrder[]; technicians: Technician[]; locations: Location[]; customers: Customer[]; vehicles: VehicleWithCustomer[]; ... 4 more ...; profiles: Profile[]; }' but required in type 'WorkOrderDataTableProps'.</problem>
</dyad-problem-report><think>**Analyzing Missing Props**

I've determined the issue involves missing `visibleColumns` in `WorkOrderDataTable`. The component's prop type requires it, but it's absent in the invocation. Now, I must locate where the component is used and ensure the `visibleColumns` prop is correctly passed. The next step is a code inspection to diagnose the root cause of the missing prop.


**Defining Column Visibility**

I've pinpointed the root cause: missing `visibleColumns` props in both `LocationDetails.tsx` and `AssetDetails.tsx`. To fix this, I plan to import `getColumns` from `WorkOrderTableColumns` to obtain the default column keys. Subsequently, I'll define `visibleColumns` state or memoized values using these default keys and then pass them as props to the `WorkOrderDataTable` component in each file.


</think>You're right, it looks like I missed adding the `visibleColumns` prop to the `WorkOrderDataTable` in `LocationDetails.tsx` and `AssetDetails.tsx`.

To fix this, I'll:
1.  Import `getColumns` in both `LocationDetails.tsx` and `AssetDetails.tsx` to retrieve the default column keys.
2.  Use `useMemo` to define `defaultColumnKeys` and then set `visibleColumns` to these default keys in both pages.
3.  Pass the `visibleColumns` prop to the `WorkOrderDataTable` component in both files.

Here are the updated files:

<dyad-write path="src/pages/LocationDetails.tsx" description="Adding the required 'visibleColumns' prop to WorkOrderDataTable.">
import { useParams, useNavigate } from "react-router-dom";
import { Avatar, Button, Card, Col, Row, Space, Typography, List, Skeleton } from "antd";
import { ArrowLeftOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { GoogleMap, MarkerF } from "@react-google-maps/api";
import { WorkOrderDataTable } from "@/components/WorkOrderDataTable";
import NotFound from "./NotFound";
import { useMemo, useState } from "react";
import { showSuccess, showInfo, showError } from "@/utils/toast";
import { OnHoldReasonDialog } from "@/components/OnHoldReasonDialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Location, WorkOrder, Technician, Customer, Vehicle, Profile } from "@/types/supabase"; // Import Profile
import { camelToSnakeCase } => "@/utils/data-helpers"; // Import the utility
import PageHeader from "@/components/PageHeader";
import dayjs from "dayjs";
import { getColumns } from "@/components/WorkOrderTableColumns"; // Import getColumns

const { Title, Text } = Typography;

const containerStyle = { width: '100%', height: '300px', borderRadius: '8px' };

const LocationDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [onHoldWorkOrder, setOnHoldWorkOrder] = useState<WorkOrder | null>(null);

  const { data: location, isLoading: isLoadingLocation } = useQuery<Location | null>({ queryKey: ['location', id], queryFn: async () => { const { data, error } = await supabase.from('locations').select('*').eq('id', id).single(); if (error) throw new Error(error.message); return data; }, enabled: !!id });
  const { data: allWorkOrders, isLoading: isLoadingWorkOrders } = useQuery<WorkOrder[]>({ queryKey: ['work_orders'], queryFn: async () => { const { data, error } = await supabase.from('work_orders').select('*').order('created_at', { ascending: false }); if (error) throw new Error(error.message); return data || []; } });
  const { data: technicians, isLoading: isLoadingTechnicians } = useQuery<Technician[]>({ queryKey: ['technicians'], queryFn: async () => { const { data, error } = await supabase.from('technicians').select('*'); if (error) throw new Error(error.message); return data || []; } });
  const { data: customers, isLoading: isLoadingCustomers } = useQuery<Customer[]>({ queryKey: ['customers'], queryFn: async () => { const { data, error } = await supabase.from('customers').select('*'); if (error) throw new Error(error.message); return data || []; } });
  const { data: vehicles, isLoading: isLoadingVehicles } = useQuery<Vehicle[]>({ queryKey: ['vehicles'], queryFn: async () => { const { data, error } = await supabase.from('vehicles').select('*'); if (error) throw new Error(error.message); return data || []; } });
  const { data: profiles, isLoading: isLoadingProfiles } = useQuery<Profile[]>({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*'); // Select all fields for Profile type
      if (error) throw new Error(error.message);
      return data || [];
    }
  });

  const workOrderMutation = useMutation({
    mutationFn: async (workOrderData: Partial<WorkOrder>) => { const { error } = await supabase.from('work_orders').upsert(workOrderData); if (error) throw new Error(error.message); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['work_orders'] }); showSuccess('Work order has been updated.'); },
    onError: (error) => showError(error.message),
  });

  const locationWorkOrders = useMemo(() => (allWorkOrders || []).filter(wo => wo.locationId === id), [id, allWorkOrders]);
  const locationTechnicians = useMemo(() => { const techIds = new Set(locationWorkOrders.map(wo => wo.assignedTechnicianId)); return (technicians || []).filter(tech => techIds.has(tech.id)); }, [locationWorkOrders, technicians]);

  const handleUpdateWorkOrder = (id: string, updates: Partial<WorkOrder>) => {
    const workOrder = allWorkOrders?.find(wo => wo.id === id);
    if (!workOrder) return;
    if (updates.status === 'On Hold') { setOnHoldWorkOrder(workOrder); return; }
    if ((updates.assignedTechnicianId || updates.appointmentDate) && workOrder.status === 'Ready') { updates.status = 'In Progress'; showInfo(`Work Order ${id} automatically moved to In Progress.`); }
    workOrderMutation.mutate(camelToSnakeCase({ id, ...updates })); // Apply camelToSnakeCase here
  };

  const handleSaveOnHoldReason = (reason: string) => {
    if (!onHoldWorkOrder) return;
    const updates = { status: 'On Hold' as const, onHoldReason: reason };
    workOrderMutation.mutate(camelToSnakeCase({ id: onHoldWorkOrder.id, ...updates })); // Apply camelToSnakeCase here
    setOnHoldWorkOrder(null);
  };

  const handleViewDetails = (workOrderId: string) => {
    navigate(`/work-orders/${workOrderId}`);
  };

  const defaultColumnKeys = useMemo(() => getColumns({
    onEdit: () => {}, onDelete: () => {}, onUpdateWorkOrder: () => {},
    allTechnicians: [], allProfiles: [], columnWidths: {}, onColumnResize: () => {},
    visibleColumns: []
  }).map(col => col.key), []);

  const isLoading = isLoadingLocation || isLoadingWorkOrders || isLoadingTechnicians || isLoadingCustomers || isLoadingVehicles || isLoadingProfiles;

  if (isLoading) return <Skeleton active />;
  if (!location) return <NotFound />;

  return (
    <>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <PageHeader
          title={
            <Space>
              <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/locations')}>
                Back to Locations
              </Button>
              <Title level={4} style={{ margin: 0 }}>Location Details</Title>
            </Space>
          }
          hideSearch
        />
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={8}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Card><Title level={4}>{location.name.replace(' Service Center', '')}</Title><Text type="secondary"><EnvironmentOutlined /> {location.address}</Text></Card>
              <Card title="Technicians On-Site">
                <List itemLayout="horizontal" dataSource={locationTechnicians} renderItem={(tech: Technician) => (<List.Item><List.Item.Meta avatar={<Avatar src={tech.avatar || undefined} />} title={<a href={`/technicians/${tech.id}`}>{tech.name}</a>} description={tech.specialization} /></List.Item>)} />
              </Card>
            </Space>
          </Col>
          <Col xs={24} lg={16}>
            <Card title="Location Map" bodyStyle={{ padding: 0 }}>
              {location.lat && location.lng && (
                <GoogleMap mapContainerStyle={containerStyle} center={{ lat: location.lat, lng: location.lng }} zoom={14}>
                  <MarkerF position={{ lat: location.lat, lng: location.lng }} />
                  {locationTechnicians.map(tech => tech.lat && tech.lng && <MarkerF key={tech.id} position={{ lat: tech.lat, lng: tech.lng }} icon={{ path: google.maps.SymbolPath.CIRCLE, scale: 5, fillColor: 'blue', fillOpacity: 1, strokeWeight: 0 }} />)}
                </GoogleMap>
              )}
            </Card>
          </Col>
        </Row>
        <Card>
          <Title level={5}>Work Orders at {location.name.replace(' Service Center', '')}</Title>
          <WorkOrderDataTable 
            workOrders={locationWorkOrders} 
            technicians={technicians || []} 
            locations={allWorkOrders ? [location] : []} 
            customers={customers || []} 
            vehicles={vehicles || []} 
            onEdit={() => {}} 
            onDelete={() => {}} 
            onUpdateWorkOrder={handleUpdateWorkOrder} 
            onViewDetails={handleViewDetails} 
            profiles={profiles || []}
            visibleColumns={defaultColumnKeys} // Added visibleColumns prop
          />
        </Card>
      </Space>
      {onHoldWorkOrder && <OnHoldReasonDialog isOpen={!!onHoldWorkOrder} onClose={() => setOnHoldWorkOrder(null)} onSave={handleSaveOnHoldReason} />}
    </>
  );
};

export default LocationDetailsPage;