import { useParams, useNavigate } from "react-router-dom";
import { Button, Card, Col, Row, Space, Typography, Skeleton, Tabs } from "antd";
import { ArrowLeftOutlined, InfoCircleOutlined, UnorderedListOutlined, CompassOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import NotFound from "./NotFound";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder, Technician, Location, Customer, Vehicle, WorkOrderPart, Profile } from "@/types/supabase";
import { useState, useMemo, useEffect } from "react";
import { showSuccess, showError, showInfo } from "@/utils/toast";
import { camelToSnakeCase } from "@/utils/data-helpers";
import { OnHoldReasonDialog } from "@/components/OnHoldReasonDialog";
import { useSearchParams } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import WorkOrderProgressTracker from "@/components/WorkOrderProgressTracker";
import { useSession } from "@/context/SessionContext";
import { calculateDistance } from "@/utils/geo-helpers";

// Import new modular components
import { WorkOrderCustomerVehicleCard } from "@/components/work-order-details/WorkOrderCustomerVehicleCard.tsx";
import { WorkOrderServiceInfoCard } from "@/components/work-order-details/WorkOrderServiceInfoCard.tsx";
import { WorkOrderDetailsInfoCard } from "@/components/work-order-details/WorkOrderDetailsInfoCard.tsx";
import { WorkOrderPartsUsedCard } from "@/components/work-order-details/WorkOrderPartsUsedCard.tsx";
import { WorkOrderActivityLogCard } from "@/components/work-order-details/WorkOrderActivityLogCard.tsx";
import { WorkOrderLocationMapCard } from "@/components/work-order-details/WorkOrderLocationMapCard.tsx";

const { Title } = Typography;
const { TabPane } = Tabs;

interface WorkOrderDetailsProps {
  isDrawerMode?: boolean;
}

const WorkOrderDetailsPage = ({ isDrawerMode = false }: WorkOrderDetailsProps) => {
  const { id: paramId } = useParams<{ id:string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [onHoldWorkOrder, setOnHoldWorkOrder] = useState<WorkOrder | null>(null);
  const [isAddPartDialogOpen, setIsAddPartDialogOpen] = useState(false);
  const { session } = useSession();

  const [showInteractiveMap, setShowInteractiveMap] = useState(false);
  const [activeTabKey, setActiveTabKey] = useState('1');

  const id = isDrawerMode ? searchParams.get('view') : paramId;

  const { data: workOrder, isLoading: isLoadingWorkOrder } = useQuery<WorkOrder | null>({ 
    queryKey: ['work_order', id], 
    queryFn: async () => { 
      if (!id) return null; 
      const { data, error } = await supabase.from('work_orders').select('*').eq('id', id).single(); 
      if (error) throw new Error(error.message); 
      if (data) {
        const mappedData: WorkOrder = {
          ...data,
          createdAt: data.created_at,
          workOrderNumber: data.work_order_number,
          assignedTechnicianId: data.assigned_technician_id,
          locationId: data.location_id,
          serviceNotes: data.service_notes,
          partsUsed: data.parts_used,
          activityLog: data.activity_log,
          slaDue: data.sla_due,
          completedAt: data.completed_at,
          customerLat: data.customer_lat,
          customerLng: data.customer_lng,
          customerAddress: data.customer_address,
          onHoldReason: data.on_hold_reason,
          appointmentDate: data.appointment_date,
          customerId: data.customer_id,
          vehicleId: data.vehicle_id,
          created_by: data.created_by,
        };
        return mappedData;
      }
      return null;
    }, 
    enabled: !!id 
  });
  const { data: technician, isLoading: isLoadingTechnician } = useQuery<Technician | null>({ queryKey: ['technician', workOrder?.assignedTechnicianId], queryFn: async () => { if (!workOrder?.assignedTechnicianId) return null; const { data, error } = await supabase.from('technicians').select('*').eq('id', workOrder.assignedTechnicianId).single(); if (error) throw new Error(error.message); return data; }, enabled: !!workOrder?.assignedTechnicianId });
  const { data: location, isLoading: isLoadingLocation } = useQuery<Location | null>({ queryKey: ['location', workOrder?.locationId], queryFn: async () => { if (!workOrder?.locationId) return null; const { data, error } = await supabase.from('locations').select('*').eq('id', workOrder.locationId).single(); if (error) throw new Error(error.message); return data; }, enabled: !!workOrder?.locationId });
  const { data: allTechnicians, isLoading: isLoadingAllTechnicians } = useQuery<Technician[]>({ queryKey: ['technicians'], queryFn: async () => { const { data, error } = await supabase.from('technicians').select('*'); if (error) throw new Error(error.message); return data || []; } });
  const { data: allLocations, isLoading: isLoadingAllLocations } = useQuery<Location[]>({ queryKey: ['locations'], queryFn: async () => { const { data, error } = await supabase.from('locations').select('*'); if (error) throw new Error(error.message); return data || []; } });
  const { data: customer, isLoading: isLoadingCustomer } = useQuery<Customer | null>({ queryKey: ['customer', workOrder?.customerId], queryFn: async () => { if (!workOrder?.customerId) return null; const { data, error } = await supabase.from('customers').select('*').eq('id', workOrder.customerId).single(); if (error) throw new Error(error.message); return data; }, enabled: !!workOrder?.customerId });
  const { data: vehicle, isLoading: isLoadingVehicle } = useQuery<Vehicle | null>({ queryKey: ['vehicle', workOrder?.vehicleId], queryFn: async () => { if (!workOrder?.vehicleId) return null; const { data, error } = await supabase.from('vehicles').select('*').eq('id', workOrder.vehicleId).single(); if (error) throw new Error(error.message); return data; }, enabled: !!workOrder?.vehicleId });
  const { data: usedParts, isLoading: isLoadingUsedParts } = useQuery<WorkOrderPart[]>({ queryKey: ['work_order_parts', id], queryFn: async () => { if (!id) return []; const { data, error } = await supabase.from('work_order_parts').select('*, inventory_items(*)').eq('work_order_id', id); if (error) throw new Error(error.message); return data || []; }, enabled: !!id });
  const { data: profiles, isLoading: isLoadingProfiles } = useQuery<Profile[]>({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) throw new Error(error.message);
      return data || [];
    }
  });

  useEffect(() => {
    if (isDrawerMode && activeTabKey === '3') {
      setShowInteractiveMap(true);
    } else {
      setShowInteractiveMap(false);
    }
  }, [isDrawerMode, activeTabKey]);

  const workOrderMutation = useMutation({ 
    mutationFn: async (workOrderData: Partial<WorkOrder>) => { 
      const { error } = await supabase.from('work_orders').upsert([camelToSnakeCase(workOrderData)]); 
      if (error) throw new Error(error.message); 
    }, 
    onSuccess: (_, variables) => {
      const updatedId = variables.id;
      if (updatedId) {
        queryClient.refetchQueries({ queryKey: ['work_order', updatedId] });
      }
      queryClient.invalidateQueries({ queryKey: ['work_orders'] });
      showSuccess('Work order has been updated.'); 
    }, 
    onError: (error) => showError(error.message) 
  });
  const addPartMutation = useMutation({ mutationFn: async ({ itemId, quantity }: { itemId: string, quantity: number }) => { const { error } = await supabase.rpc('add_part_to_work_order', { p_work_order_id: id, p_item_id: itemId, p_quantity_used: quantity }); if (error) throw new Error(error.message); }, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['work_order_parts', id] }); queryClient.invalidateQueries({ queryKey: ['inventory_items'] }); showSuccess('Part added to work order.'); }, onError: (error) => showError(error.message) });
  const removePartMutation = useMutation({
    mutationFn: async (partId: string) => {
      const { error } = await supabase.from('work_order_parts').delete().eq('id', partId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work_order_parts', id] });
      queryClient.invalidateQueries({ queryKey: ['inventory_items'] });
      showSuccess('Part removed from work order.');
    },
    onError: (error) => showError(error.message),
  });

  const handleUpdateWorkOrder = (updates: Partial<WorkOrder>) => { 
    if (!workOrder) return; 

    const oldWorkOrder = { ...workOrder };
    const newActivityLog = [...(workOrder.activityLog || [])];
    let activityMessage = '';

    if (updates.status && updates.status !== oldWorkOrder.status) {
      activityMessage = `Status changed from '${oldWorkOrder.status || 'N/A'}' to '${updates.status}'.`;
    } else if (updates.assignedTechnicianId && updates.assignedTechnicianId !== oldWorkOrder.assignedTechnicianId) {
      const oldTech = allTechnicians?.find(t => t.id === oldWorkOrder.assignedTechnicianId)?.name || 'Unassigned';
      const newTech = allTechnicians?.find(t => t.id === updates.assignedTechnicianId)?.name || 'Unassigned';
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
    } else if (updates.channel && updates.channel !== oldWorkOrder.channel) {
      activityMessage = `Channel changed from '${oldWorkOrder.channel || 'N/A'}' to '${updates.channel}'.`;
    } else if (updates.locationId && updates.locationId !== oldWorkOrder.locationId) {
      const oldLoc = allLocations?.find(l => l.id === oldWorkOrder.locationId)?.name || 'N/A';
      const newLoc = allLocations?.find(l => l.id === updates.locationId)?.name || 'N/A';
      activityMessage = `Service location changed from '${oldLoc}' to '${newLoc}'.`;
    } else if (updates.customerAddress && updates.customerAddress !== oldWorkOrder.customerAddress) {
      activityMessage = `Client address updated to '${updates.customerAddress}'.`;
    } else if (updates.customerLat !== oldWorkOrder.customerLat || updates.customerLng !== oldWorkOrder.customerLng) {
      activityMessage = `Client coordinates updated.`;
    } else {
      activityMessage = 'Work order details updated.';
    }

    if (activityMessage) {
      newActivityLog.push({ timestamp: new Date().toISOString(), activity: activityMessage, userId: session?.user.id ?? null });
      updates.activityLog = newActivityLog;
    }

    if (updates.status === 'On Hold') { 
      setOnHoldWorkOrder(workOrder); 
      return; 
    } 
    if ((updates.assignedTechnicianId || updates.appointmentDate) && workOrder.status === 'Ready') { 
      updates.status = 'In Progress'; 
      showInfo(`Work Order ${workOrder.workOrderNumber} automatically moved to In Progress.`); 
    } 
    workOrderMutation.mutate({ id: workOrder.id, ...updates }); 
  };
  const handleSaveOnHoldReason = (reason: string) => { if (!onHoldWorkOrder) return; const updates = { status: 'On Hold' as const, onHoldReason: reason }; workOrderMutation.mutate({ id: onHoldWorkOrder.id, ...updates }); setOnHoldWorkOrder(null); };
  const handleLocationSelect = (selectedLoc: { lat: number; lng: number; label: string }) => { handleUpdateWorkOrder({ customerAddress: selectedLoc.label, customerLat: selectedLoc.lat, customerLng: selectedLoc.lng }); };
  const handleAddPart = (itemId: string, quantity: number) => { addPartMutation.mutate({ itemId, quantity }); };
  const handleRemovePart = (partId: string) => { removePartMutation.mutate(partId); };

  const profileMap = useMemo(() => {
    if (!profiles) return new Map();
    return new Map(profiles.map(p => [p.id, `${p.first_name || ''} ${p.last_name || ''}`.trim()]));
  }, [profiles]);

  const isLoading = isLoadingWorkOrder || isLoadingTechnician || isLoadingLocation || isLoadingAllTechnicians || isLoadingAllLocations || isLoadingCustomer || isLoadingVehicle || isLoadingUsedParts || isLoadingProfiles;

  if (isLoading) return <Skeleton active />;
  if (!workOrder) return isDrawerMode ? <div style={{ padding: 24 }}><NotFound /></div> : <NotFound />;

  // --- Main Render Logic ---
  return (
    <>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {!isDrawerMode && (
          <PageHeader
            title={
              <Space align="center">
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/work-orders')}>
                  Back to Work Orders
                </Button>
                <Title level={4} style={{ margin: 0 }}>
                  Work Order: {workOrder.workOrderNumber}
                </Title>
              </Space>
            }
            hideSearch
          />
        )}

        {isDrawerMode ? (
          <>
            <div style={{ marginBottom: 16 }}>
              <WorkOrderProgressTracker workOrder={workOrder} />
            </div>
            <Tabs defaultActiveKey="1" destroyInactiveTabPane={false} onChange={setActiveTabKey}>
              <TabPane tab={<span><InfoCircleOutlined /> Overview</span>} key="1">
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <WorkOrderServiceInfoCard workOrder={workOrder} handleUpdateWorkOrder={handleUpdateWorkOrder} />
                  <WorkOrderDetailsInfoCard
                    workOrder={workOrder}
                    technician={technician}
                    allTechnicians={allTechnicians || []}
                    allLocations={allLocations || []}
                    handleUpdateWorkOrder={handleUpdateWorkOrder}
                  />
                  <WorkOrderCustomerVehicleCard workOrder={workOrder} customer={customer} vehicle={vehicle} />
                </Space>
              </TabPane>
              <TabPane tab={<span><UnorderedListOutlined /> Parts & Log</span>} key="2">
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <WorkOrderPartsUsedCard
                    workOrder={workOrder}
                    usedParts={usedParts || []}
                    isAddPartDialogOpen={isAddPartDialogOpen}
                    setIsAddPartDialogOpen={setIsAddPartDialogOpen}
                    handleAddPart={handleAddPart}
                    handleRemovePart={handleRemovePart}
                  />
                  <WorkOrderActivityLogCard workOrder={workOrder} profileMap={profileMap} />
                </Space>
              </TabPane>
              <TabPane tab={<span><CompassOutlined /> Location</span>} key="3">
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <WorkOrderLocationMapCard
                    workOrder={workOrder}
                    location={location}
                    allLocations={allLocations || []}
                    handleUpdateWorkOrder={handleUpdateWorkOrder}
                    handleLocationSelect={handleLocationSelect}
                    showInteractiveMap={showInteractiveMap}
                    setShowInteractiveMap={setShowInteractiveMap}
                  />
                </Space>
              </TabPane>
            </Tabs>
          </>
        ) : (
          <>
            <Card>
              <WorkOrderProgressTracker workOrder={workOrder} />
            </Card>
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={16}>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <WorkOrderServiceInfoCard workOrder={workOrder} handleUpdateWorkOrder={handleUpdateWorkOrder} />
                  <WorkOrderPartsUsedCard
                    workOrder={workOrder}
                    usedParts={usedParts || []}
                    isAddPartDialogOpen={isAddPartDialogOpen}
                    setIsAddPartDialogOpen={setIsAddPartDialogOpen}
                    handleAddPart={handleAddPart}
                    handleRemovePart={handleRemovePart}
                  />
                  <WorkOrderActivityLogCard workOrder={workOrder} profileMap={profileMap} />
                </Space>
              </Col>
              <Col xs={24} lg={8}>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <WorkOrderDetailsInfoCard
                    workOrder={workOrder}
                    technician={technician}
                    allTechnicians={allTechnicians || []}
                    allLocations={allLocations || []}
                    handleUpdateWorkOrder={handleUpdateWorkOrder}
                  />
                  <WorkOrderCustomerVehicleCard workOrder={workOrder} customer={customer} vehicle={vehicle} />
                  <WorkOrderLocationMapCard
                    workOrder={workOrder}
                    location={location}
                    allLocations={allLocations || []}
                    handleUpdateWorkOrder={handleUpdateWorkOrder}
                    handleLocationSelect={handleLocationSelect}
                    showInteractiveMap={showInteractiveMap}
                    setShowInteractiveMap={setShowInteractiveMap}
                  />
                </Space>
              </Col>
            </Row>
          </>
        )}
      </Space>
      {onHoldWorkOrder && <OnHoldReasonDialog isOpen={!!onHoldWorkOrder} onClose={() => setOnHoldWorkOrder(null)} onSave={handleSaveOnHoldReason} />}
    </>
  );
};

export default WorkOrderDetailsPage;