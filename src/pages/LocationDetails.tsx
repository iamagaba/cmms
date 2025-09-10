import { useParams, useNavigate } from "react-router-dom";
import { Avatar, Button, Card, Col, Row, Space, Typography, List, Skeleton, Empty, theme } from "antd";
import { ArrowLeftOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { WorkOrderDataTable, ALL_COLUMNS } from "@/components/WorkOrderDataTable";
import NotFound from "./NotFound";
import { useMemo, useState } from "react";
import { showSuccess, showInfo, showError } from "@/utils/toast";
import { OnHoldReasonDialog } from "@/components/OnHoldReasonDialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Location, WorkOrder, Technician, Customer, Vehicle, Profile } from "@/types/supabase";
import { camelToSnakeCase } from "@/utils/data-helpers";
import PageHeader from "@/components/PageHeader";
import dayjs from "dayjs";
import { getColumns } from "@/components/WorkOrderTableColumns";
import { useSession } from "@/context/SessionContext";
import { OSMMap } from "@/components/OSMMap"; // Updated import

const { Title, Text } = Typography;
const { useToken } = theme;

const LocationDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [onHoldWorkOrder, setOnHoldWorkOrder] = useState<WorkOrder | null>(null);
  const { session } = useSession();
  const { token } = useToken();

  const { data: location, isLoading: isLoadingLocation } = useQuery<Location | null>({ queryKey: ['location', id], queryFn: async () => { const { data, error } = await supabase.from('locations').select('*').eq('id', id).single(); if (error) throw new Error(error.message); return data; }, enabled: !!id });
  const { data: allWorkOrders, isLoading: isLoadingWorkOrders } = useQuery<WorkOrder[]>({ queryKey: ['work_orders'], queryFn: async () => { const { data, error } = await supabase.from('work_orders').select('*').order('created_at', { ascending: false }); if (error) throw new Error(error.message); return data || []; } });
  const { data: technicians, isLoading: isLoadingTechnicians } = useQuery<Technician[]>({ queryKey: ['technicians'], queryFn: async () => { const { data, error } = await supabase.from('technicians').select('*'); if (error) throw new Error(error.message); return data || []; } });
  const { data: customers, isLoading: isLoadingCustomers } = useQuery<Customer[]>({ queryKey: ['customers'], queryFn: async () => { const { data, error } = await supabase.from('customers').select('*'); if (error) throw new Error(error.message); return data || []; } });
  const { data: vehicles, isLoading: isLoadingVehicles } = useQuery<Vehicle[]>({ queryKey: ['vehicles'], queryFn: async () => { const { data, error } = await supabase.from('vehicles').select('*'); if (error) throw new Error(error.message); return data || []; } });
  const { data: profiles, isLoading: isLoadingProfiles } = useQuery<Profile[]>({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) throw new Error(error.message);
      return data || [];
    }
  });
  const { data: allLocations, isLoading: isLoadingAllLocations } = useQuery<Location[]>({ queryKey: ['locations'], queryFn: async () => { const { data, error } = await supabase.from('locations').select('*'); if (error) throw new Error(error.message); return data || []; } });


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

    const oldWorkOrder = { ...workOrder };
    const newActivityLog = [...(workOrder.activityLog || [])];
    let activityMessage = '';

    if (updates.status && updates.status !== oldWorkOrder.status) {
      activityMessage = `Status changed from '${oldWorkOrder.status || 'N/A'}' to '${updates.status}'.`;
    } else if (updates.assignedTechnicianId && updates.assignedTechnicianId !== oldWorkOrder.assignedTechnicianId) {
      const oldTech = technicians?.find(t => t.id === oldWorkOrder.assignedTechnicianId)?.name || 'Unassigned';
      const newTech = technicians?.find(t => t.id === updates.assignedTechnicianId)?.name || 'Unassigned';
      activityMessage = `Assigned technician changed from '${oldTech}' to '${newTech}'.`;
    } else if (updates.slaDue && updates.slaDue !== oldWorkOrder.slaDue) {
      activityMessage = `SLA due date updated to '${dayjs(updates.slaDue).format('MMM D, YYYY h:mm A')}'.`;
    } else if (updates.appointmentDate && updates.appointmentDate !== oldWorkOrder.appointmentDate) {
      activityMessage = `Appointment date updated to '${dayjs(updates.appointmentDate).format('MMM D, YYYY h:mm A')}'.`;
    } else if (updates.service && updates.service !== oldWorkOrder.service) {
      activityMessage = `Service description updated.`;
    } else if (updates.serviceNotes && updates.serviceNotes !== oldWorkOrder.serviceNotes) {
      activityMessage = `Service notes updated.`;
    } else if (updates.priority && updates.priority !== oldWorkOrder.priority) {
      activityMessage = `Priority changed from '${oldWorkOrder.priority || 'N/A'}' to '${updates.priority}'.`;
    } else if (updates.locationId && updates.locationId !== oldWorkOrder.locationId) {
      const oldLoc = allLocations?.find(l => l.id === oldWorkOrder.locationId)?.name || 'N/A'; // Fixed here
      const newLoc = allLocations?.find(l => l.id === updates.locationId)?.name || 'N/A'; // Fixed here
      activityMessage = `Service location changed from '${oldLoc}' to '${newLoc}'.`;
    } else if (updates.customerAddress && updates.customerAddress !== oldWorkOrder.customerAddress) {
      activityMessage = `Client address updated to '${updates.customerAddress}'.`;
    } else if (updates.customerLat !== oldWorkOrder.customerLat || updates.customerLng !== oldWorkOrder.customerLng) {
      activityMessage = `Client coordinates updated.`;
    } else {
      activityMessage = 'Work order details updated.'; // Generic message for other changes
    }

    if (activityMessage) {
      newActivityLog.push({ timestamp: new Date().toISOString(), activity: activityMessage, userId: session?.user.id ?? null });
      updates.activityLog = newActivityLog;
    }

    if (updates.status === 'On Hold') { setOnHoldWorkOrder(workOrder); return; }
    if ((updates.assignedTechnicianId || updates.appointmentDate) && workOrder.status === 'Ready') { updates.status = 'In Progress'; showInfo(`Work Order ${id} automatically moved to In Progress.`); }
    workOrderMutation.mutate(camelToSnakeCase({ id, ...updates }));
  };

  const handleSaveOnHoldReason = (reason: string) => {
    if (!onHoldWorkOrder) return;
    const updates = { status: 'On Hold' as const, onHoldReason: reason };
    workOrderMutation.mutate(camelToSnakeCase({ id: onHoldWorkOrder.id, ...updates }));
    setOnHoldWorkOrder(null);
  };

  const handleViewDetails = (workOrderId: string) => {
    navigate(`/work-orders/${workOrderId}`);
  };

  const isLoading = isLoadingLocation || isLoadingWorkOrders || isLoadingTechnicians || isLoadingCustomers || isLoadingVehicles || isLoadingProfiles || isLoadingAllLocations;

  if (isLoading) return <Skeleton active />;
  if (!location) return <NotFound />;

  const defaultVisibleColumns = ALL_COLUMNS.map(c => c.value); // Use ALL_COLUMNS for default visibility

  const mapMarkers = useMemo(() => {
    const markers = [];
    if (location.lat && location.lng) {
      markers.push({
        position: [location.lat, location.lng],
        popupContent: (
          <div>
            <Text strong>{location.name.replace(' Service Center', '')}</Text><br />
            <Text type="secondary">{location.address}</Text>
          </div>
        ),
        color: token.colorPrimary,
      });
    }
    locationTechnicians.forEach(tech => {
      if (tech.lat && tech.lng) {
        markers.push({
          position: [tech.lat, tech.lng],
          popupContent: (
            <div>
              <Text strong>{tech.name}</Text><br />
              <Text type="secondary">{tech.specialization}</Text>
            </div>
          ),
          color: token.colorInfo, // Different color for technicians at this location
        });
      }
    });
    return markers;
  }, [location, locationTechnicians, token]);

  const mapCenter: [number, number] = (location.lat && location.lng) ? [location.lat, location.lng] : [0.32, 32.58]; // Default to Kampala, Uganda

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
              {mapMarkers.length > 0 ? (
                <OSMMap center={mapCenter} markers={mapMarkers} height="300px" />
              ) : (
                <div style={{padding: '24px', textAlign: 'center'}}>
                  <Empty description="No location data to display." />
                </div>
              )}
            </Card>
          </Col>
        </Row>
        <Card>
          <Title level={5}>Work Orders at {location.name.replace(' Service Center', '')}</Title>
          <WorkOrderDataTable 
            workOrders={locationWorkOrders} 
            technicians={technicians || []} 
            locations={allLocations || []} 
            customers={customers || []} 
            vehicles={vehicles || []} 
            onEdit={() => {}} 
            onDelete={() => {}} 
            onUpdateWorkOrder={handleUpdateWorkOrder} 
            onViewDetails={handleViewDetails} 
            profiles={profiles || []}
            visibleColumns={defaultVisibleColumns}
            onVisibleColumnsChange={() => {}} // Added missing prop
          />
        </Card>
      </Space>
      {onHoldWorkOrder && <OnHoldReasonDialog isOpen={!!onHoldWorkOrder} onClose={() => setOnHoldWorkOrder(null)} onSave={handleSaveOnHoldReason} />}
    </>
  );
};

export default LocationDetailsPage;