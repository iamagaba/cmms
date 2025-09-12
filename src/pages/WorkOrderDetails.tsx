import { useParams, useNavigate } from "react-router-dom";
import { Button, Card, Col, Row, Space, Typography, Skeleton, Tabs, Tag } from "antd";
import { Icon } from '@iconify/react'; // Corrected import for Icon
import dayjs from "dayjs";
import NotFound from "./NotFound";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder, Technician, Location, Customer, Vehicle, WorkOrderPart, Profile, EmergencyBikeAssignment, SlaPolicy } from "@/types/supabase"; // Added EmergencyBikeAssignment
import { useState, useMemo, useEffect } from "react";
import { showSuccess, showError, showInfo } from "@/utils/toast";
import { camelToSnakeCase } from "@/utils/data-helpers";
import { OnHoldReasonDialog } from "@/components/OnHoldReasonDialog";
import { useSearchParams } from "react-router-dom";
import WorkOrderProgressTracker from "@/components/WorkOrderProgressTracker";
import { useSession } from "@/context/SessionContext";
import { calculateDistance } from "@/utils/geo-helpers";
import Breadcrumbs from "@/components/Breadcrumbs";

// Import new modular components
import { WorkOrderCustomerVehicleCard } from "@/components/work-order-details/WorkOrderCustomerVehicleCard.tsx";
import { WorkOrderServiceLifecycleCard } from "@/components/work-order-details/WorkOrderServiceLifecycleCard.tsx";
import { WorkOrderDetailsInfoCard } from "@/components/work-order-details/WorkOrderDetailsInfoCard.tsx";
import { WorkOrderPartsUsedCard } from "@/components/work-order-details/WorkOrderPartsUsedCard.tsx";
import { WorkOrderActivityLogCard } from "@/components/work-order-details/WorkOrderActivityLogCard.tsx";
import { WorkOrderLocationMapCard } from "@/components/work-order-details/WorkOrderLocationMapCard.tsx";
import { IssueConfirmationDialog } from "@/components/IssueConfirmationDialog.tsx";
import { MaintenanceCompletionDrawer } from "@/components/MaintenanceCompletionDrawer.tsx";
import { WorkOrderAppointmentCard } from "@/components/work-order-details/WorkOrderAppointmentCard.tsx"; // New import

// New Emergency Bike components
import { EmergencyBikeAssignmentDialog } from "@/components/EmergencyBikeAssignmentDialog.tsx";
import { EmergencyBikeReturnDialog } from "@/components/EmergencyBikeReturnDialog.tsx";
import { EmergencyBikeTag } from "@/components/EmergencyBikeTag.tsx"; // Reusing the tag for consistency

// Import work order helper functions
import {
  generateActivityLogEntry,
  calculateSlaDue,
  calculatePausedDuration,
  isValidStatusTransition,
  generateUpdateActivityMessage,
} from '@/utils/work-order-helpers';

const { Title } = Typography;
const { TabPane } = Tabs;

interface WorkOrderDetailsProps {
  isDrawerMode?: boolean;
}

const EMERGENCY_BIKE_THRESHOLD_HOURS = 6;

const WorkOrderDetailsPage = ({ isDrawerMode = false }: WorkOrderDetailsProps) => {
  const { id: paramId } = useParams<{ id:string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [onHoldWorkOrder, setOnHoldWorkOrder] = useState<WorkOrder | null>(null);
  const [isIssueConfirmationDialogOpen, setIsIssueConfirmationDialogOpen] = useState(false);
  const [isMaintenanceCompletionDrawerOpen, setIsMaintenanceCompletionDrawerOpen] = useState(false);
  const [isAssignEmergencyBikeDialogOpen, setIsAssignEmergencyBikeDialogOpen] = useState(false); // New state
  const [isReturnEmergencyBikeDialogOpen, setIsReturnEmergencyBikeDialogOpen] = useState(false); // New state
  const { session } = useSession();

  const [showInteractiveMap, setShowInteractiveMap] = useState(false);
  const [activeTabKey, setActiveTabKey] = useState('1');

  const id = isDrawerMode ? searchParams.get('view') : paramId;

  const { data: workOrder, isLoading: isLoadingWorkOrder } = useQuery<WorkOrder | null>({ 
    queryKey: ['work_order', id], 
    queryFn: async () => { 
      if (!id) return null; 
      const { data, error } = await supabase
        .from('work_orders')
        .select(`
          *,
          active_emergency_bike_assignment:emergency_bike_assignments!left(
            *,
            vehicles(*)
          ),
          service_categories(
            sla_policies(*)
          )
        `)
        .eq('id', id)
        .single(); 
      if (error) throw new Error(error.message); 
      if (data) {
        const mappedData: WorkOrder = {
          ...data,
          createdAt: data.created_at,
          workOrderNumber: data.work_order_number,
          assignedTechnicianId: data.assigned_technician_id,
          locationId: data.location_id,
          initialDiagnosis: data.client_report || data.service,
          maintenanceNotes: data.maintenance_notes || data.service_notes,
          issueType: data.issue_type,
          faultCode: data.fault_code,
          service: data.service,
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
          emergency_bike_notified_at: data.emergency_bike_notified_at,
          active_emergency_bike_assignment: data.active_emergency_bike_assignment.length > 0 ? data.active_emergency_bike_assignment[0] : null,
        };

        // Calculate is_emergency_bike_eligible on the frontend
        if (mappedData.status === 'In Progress' && mappedData.work_started_at) {
          const workStartedAt = dayjs(mappedData.work_started_at);
          const now = dayjs();
          const totalPausedSeconds = mappedData.total_paused_duration_seconds || 0;
          const elapsedActiveTimeSeconds = now.diff(workStartedAt, 'second') - totalPausedSeconds;
          const thresholdSeconds = EMERGENCY_BIKE_THRESHOLD_HOURS * 3600;
          mappedData.is_emergency_bike_eligible = elapsedActiveTimeSeconds >= thresholdSeconds && !mappedData.active_emergency_bike_assignment;
        } else {
          mappedData.is_emergency_bike_eligible = false;
        }

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
  const { data: slaPolicies, isLoading: isLoadingSlaPolicies } = useQuery<SlaPolicy[]>({ queryKey: ['sla_policies'], queryFn: async () => { const { data, error } = await supabase.from('sla_policies').select('*'); if (error) throw new Error(error.message); return data || []; } });


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
    const newStatus = updates.status;
    const oldStatus = oldWorkOrder.status;
    const isServiceCenter = oldWorkOrder.channel === 'Service Center';

    // 1. Status transition validation
    if (newStatus && newStatus !== oldStatus) {
      if (!isValidStatusTransition(oldStatus, newStatus, isServiceCenter)) {
        showError(`Invalid status transition from '${oldStatus}' to '${newStatus}'.`);
        return;
      }

      // Special handling for 'On Hold' to open dialog
      if (newStatus === 'On Hold') { 
        setOnHoldWorkOrder(oldWorkOrder); 
        return; 
      } 
      // Special handling for 'Ready' to open Issue Confirmation Dialog
      if (newStatus === 'Ready' && !isServiceCenter && !oldWorkOrder.issueType) {
        setIsIssueConfirmationDialogOpen(true);
        return; // Stop here, the dialog's save will trigger the actual update
      }
      // Special handling for 'Completed' to open Maintenance Completion Drawer
      if (newStatus === 'Completed' && (!oldWorkOrder.faultCode || !oldWorkOrder.maintenanceNotes)) {
        setIsMaintenanceCompletionDrawerOpen(true);
        return; // Stop here, the drawer's save will trigger the actual update
      }
    }

    // 2. Prepare activity log and timestamp automation
    const newActivityLog = [...(workOrder.activityLog || [])];
    let activityMessage = generateUpdateActivityMessage(oldWorkOrder, updates, allTechnicians, allLocations);

    // Timestamp & SLA Automation
    if (newStatus && newStatus !== oldStatus) {
      if (newStatus === 'Confirmation' && !oldWorkOrder.confirmed_at) updates.confirmed_at = new Date().toISOString();
      if (newStatus === 'In Progress' && !oldWorkOrder.work_started_at) updates.work_started_at = new Date().toISOString();
      if (newStatus === 'On Hold' && oldStatus !== 'On Hold') updates.sla_timers_paused_at = new Date().toISOString();
      
      const additionalPausedDuration = calculatePausedDuration(oldWorkOrder, newStatus, oldStatus);
      if (additionalPausedDuration > 0) {
        updates.total_paused_duration_seconds = (oldWorkOrder.total_paused_duration_seconds || 0) + additionalPausedDuration;
        updates.sla_timers_paused_at = null;
        activityMessage += ` (SLA timers resumed after ${additionalPausedDuration}s pause).`;
      }
    }

    if (updates.service_category_id && updates.service_category_id !== oldWorkOrder.service_category_id) {
      updates.slaDue = calculateSlaDue(
        oldWorkOrder.created_at!,
        updates.service_category_id,
        slaPolicies,
        updates.total_paused_duration_seconds || oldWorkOrder.total_paused_duration_seconds
      );
      const category = (oldWorkOrder as any).service_categories?.name || 'N/A'; // Access from joined data if available
      activityMessage += ` Service category set to '${category}'. Resolution SLA updated.`;
    }

    if (activityMessage) {
      newActivityLog.push(generateActivityLogEntry(activityMessage, session?.user.id ?? null));
      updates.activityLog = newActivityLog;
    }

    // 3. Automatic status change: Ready -> In Progress
    if ((updates.assignedTechnicianId || updates.appointmentDate) && oldStatus === 'Ready' && newStatus !== 'On Hold' && newStatus !== 'Completed') { 
      updates.status = 'In Progress'; 
      showInfo(`Work Order ${workOrder.workOrderNumber} automatically moved to In Progress.`); 
    } 
    
    // 4. Execute mutation
    const finalUpdates = { ...updates };
    if (workOrder.id) {
      finalUpdates.id = workOrder.id; // Ensure ID is present for update
    }
    workOrderMutation.mutate(camelToSnakeCase(finalUpdates)); 
  };

  const handleSaveOnHoldReason = (reason: string) => { 
    if (!onHoldWorkOrder) return; 
    const updates = { status: 'On Hold' as const, onHoldReason: reason }; 
    handleUpdateWorkOrder(updates); 
    setOnHoldWorkOrder(null); 
  };

  const handleSaveIssueConfirmation = (issueType: string, notes: string | null) => {
    if (!workOrder) return;
    const updates: Partial<WorkOrder> = { status: 'Ready', issueType: issueType, serviceNotes: notes };
    handleUpdateWorkOrder(updates);
    setIsIssueConfirmationDialogOpen(false);
  };

  const handleSaveMaintenanceCompletion = (faultCode: string, maintenanceNotes: string | null) => {
    if (!workOrder) return;
    const updates: Partial<WorkOrder> = { status: 'Completed', faultCode: faultCode, maintenanceNotes: maintenanceNotes, completedAt: new Date().toISOString() };
    handleUpdateWorkOrder(updates);
    setIsMaintenanceCompletionDrawerOpen(false);
  };

  const handleLocationSelect = (selectedLoc: { lat: number; lng: number; label: string }) => { handleUpdateWorkOrder({ customerAddress: selectedLoc.label, customerLat: selectedLoc.lat, customerLng: selectedLoc.lng }); };
  const handleAddPart = (itemId: string, quantity: number) => { addPartMutation.mutate({ itemId, quantity }); };
  const handleRemovePart = (partId: string) => { removePartMutation.mutate(partId); };

  const profileMap = useMemo(() => {
    if (!profiles) return new Map();
    return new Map(profiles.map(p => [p.id, `${p.first_name || ''} ${p.last_name || ''}`.trim()]));
  }, [profiles]);

  const isLoading = isLoadingWorkOrder || isLoadingTechnician || isLoadingLocation || isLoadingAllTechnicians || isLoadingAllLocations || isLoadingCustomer || isLoadingVehicle || isLoadingUsedParts || isLoadingProfiles || isLoadingSlaPolicies;

  if (isLoading) return <Skeleton active />;
  if (!workOrder) return isDrawerMode ? <div style={{ padding: 24 }}><NotFound /></div> : <NotFound />;

  const usedPartsCount = usedParts?.length || 0;

  const backButton = (
    <Button icon={<Icon icon="ph:arrow-left-fill" />} onClick={() => navigate('/work-orders')} />
  );

  const hasActiveEmergencyBike = workOrder.active_emergency_bike_assignment && !workOrder.active_emergency_bike_assignment.returned_at;

  // Conditional rendering for the Emergency Bike Status card
  const shouldShowEmergencyBikeCard = hasActiveEmergencyBike || workOrder.is_emergency_bike_eligible;

  // --- Main Render Logic ---
  return (
    <>
      <Breadcrumbs backButton={!isDrawerMode ? backButton : undefined} />
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {isDrawerMode ? (
          <>
            <div style={{ marginBottom: 16 }}>
              <WorkOrderProgressTracker workOrder={workOrder} />
            </div>
            <Tabs defaultActiveKey="1" destroyInactiveTabPane={false} onChange={setActiveTabKey}>
              <TabPane tab={<span><Icon icon="ph:info-fill" /> Overview</span>} key="1">
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <WorkOrderServiceLifecycleCard
                    workOrder={workOrder}
                    handleUpdateWorkOrder={handleUpdateWorkOrder}
                    usedPartsCount={usedPartsCount}
                  />
                  <WorkOrderDetailsInfoCard
                    workOrder={workOrder}
                    technician={technician}
                    allTechnicians={allTechnicians || []}
                    allLocations={allLocations || []}
                    handleUpdateWorkOrder={handleUpdateWorkOrder}
                  />
                  {workOrder.appointmentDate && (
                    <WorkOrderAppointmentCard
                      workOrder={workOrder}
                      technician={technician}
                      location={location}
                    />
                  )}
                  <WorkOrderCustomerVehicleCard workOrder={workOrder} customer={customer} vehicle={vehicle} />
                </Space>
              </TabPane>
              <TabPane tab={<span><Icon icon="ph:list-checks-fill" /> Parts & Log</span>} key="2">
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <WorkOrderPartsUsedCard
                    workOrder={workOrder}
                    usedParts={usedParts || []}
                    isAddPartDialogOpen={false}
                    setIsAddPartDialogOpen={() => {}}
                    handleAddPart={handleAddPart}
                    handleRemovePart={handleRemovePart}
                  />
                  <WorkOrderActivityLogCard workOrder={workOrder} profileMap={profileMap} />
                </Space>
              </TabPane>
              <TabPane tab={<span><Icon icon="ph:compass-fill" /> Location</span>} key="3">
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
              <Space direction="vertical" style={{ width: '100%' }}>
                <WorkOrderProgressTracker workOrder={workOrder} />
              </Space>
            </Card>
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={16}>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <WorkOrderServiceLifecycleCard
                    workOrder={workOrder}
                    handleUpdateWorkOrder={handleUpdateWorkOrder}
                    usedPartsCount={usedPartsCount}
                  />
                  <WorkOrderPartsUsedCard
                    workOrder={workOrder}
                    usedParts={usedParts || []}
                    isAddPartDialogOpen={false}
                    setIsAddPartDialogOpen={() => {}}
                    handleAddPart={handleAddPart}
                    handleRemovePart={handleRemovePart}
                  />
                  <WorkOrderActivityLogCard workOrder={workOrder} profileMap={profileMap} />
                </Space>
              </Col>
              <Col xs={24} lg={8}>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  {shouldShowEmergencyBikeCard && ( // Conditional rendering for the entire card
                    <Card title="Emergency Bike Status">
                      {hasActiveEmergencyBike ? (
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <Tag color="green" icon={<Icon icon="ph:bicycle-fill" width={14} height={14} />}>Assigned</Tag>
                          <Typography.Text strong>Bike: {workOrder.active_emergency_bike_assignment?.vehicles?.license_plate}</Typography.Text>
                          <Typography.Text type="secondary">Assigned on: {dayjs(workOrder.active_emergency_bike_assignment?.assigned_at).format('MMM D, YYYY h:mm A')}</Typography.Text>
                          {workOrder.active_emergency_bike_assignment?.assignment_notes && (
                            <Typography.Paragraph type="secondary" ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}>
                              Notes: {workOrder.active_emergency_bike_assignment.assignment_notes}
                            </Typography.Paragraph>
                          )}
                          <Button type="default" icon={<Icon icon="ph:bicycle-fill" width={16} height={16} />} onClick={() => setIsReturnEmergencyBikeDialogOpen(true)} style={{ marginTop: 8 }}>
                            Return Emergency Bike
                          </Button>
                        </Space>
                      ) : workOrder.is_emergency_bike_eligible ? (
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <Tag color="purple" icon={<Icon icon="ph:bicycle-fill" width={14} height={14} />}>Emergency Bike Needed</Tag>
                          <Typography.Text type="secondary">This work order has been in progress for over {EMERGENCY_BIKE_THRESHOLD_HOURS} hours. Consider assigning an emergency bike.</Typography.Text>
                          <Button type="primary" icon={<Icon icon="ph:bicycle-fill" width={16} height={16} />} onClick={() => setIsAssignEmergencyBikeDialogOpen(true)} style={{ marginTop: 8 }}>
                            Assign Emergency Bike
                          </Button>
                        </Space>
                      ) : (
                        <Tag color="default">No Emergency Bike Assigned</Tag>
                      )}
                    </Card>
                  )}
                  <WorkOrderDetailsInfoCard
                    workOrder={workOrder}
                    technician={technician}
                    allTechnicians={allTechnicians || []}
                    allLocations={allLocations || []}
                    handleUpdateWorkOrder={handleUpdateWorkOrder}
                  />
                  {workOrder.appointmentDate && (
                    <WorkOrderAppointmentCard
                      workOrder={workOrder}
                      technician={technician}
                      location={location}
                    />
                  )}
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
      {isIssueConfirmationDialogOpen && (
        <IssueConfirmationDialog
          isOpen={isIssueConfirmationDialogOpen}
          onClose={() => setIsIssueConfirmationDialogOpen(false)}
          onSave={handleSaveIssueConfirmation}
          initialIssueType={workOrder.issueType}
          initialNotes={workOrder.serviceNotes}
        />
      )}
      {isMaintenanceCompletionDrawerOpen && (
        <MaintenanceCompletionDrawer
          isOpen={isMaintenanceCompletionDrawerOpen}
          onClose={() => setIsMaintenanceCompletionDrawerOpen(false)}
          onSave={handleSaveMaintenanceCompletion}
          usedParts={usedParts || []}
          onAddPart={handleAddPart}
          onRemovePart={handleRemovePart}
          initialFaultCode={workOrder.faultCode}
          initialMaintenanceNotes={workOrder.maintenanceNotes}
        />
      )}
      {isAssignEmergencyBikeDialogOpen && workOrder.workOrderNumber && (
        <EmergencyBikeAssignmentDialog
          isOpen={isAssignEmergencyBikeDialogOpen}
          onClose={() => setIsAssignEmergencyBikeDialogOpen(false)}
          workOrderId={workOrder.id}
          workOrderNumber={workOrder.workOrderNumber}
        />
      )}
      {isReturnEmergencyBikeDialogOpen && workOrder.active_emergency_bike_assignment && (
        <EmergencyBikeReturnDialog
          isOpen={isReturnEmergencyBikeDialogOpen}
          onClose={() => setIsReturnEmergencyBikeDialogOpen(false)}
          assignment={workOrder.active_emergency_bike_assignment}
        />
      )}
    </>
  );
};

export default WorkOrderDetailsPage;