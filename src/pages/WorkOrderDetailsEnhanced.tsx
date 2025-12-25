import { useParams, useNavigate } from "react-router-dom";
import { Button, Card, Col, Row, Space, Skeleton, Tabs } from "antd";
import { Icon } from '@iconify/react';
import NotFound from "./NotFound";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder, Technician, Location, Customer, Vehicle, WorkOrderPart, Profile, SlaPolicy } from "@/types/supabase";
import { useState, useMemo, useEffect } from "react";
import { showSuccess, showError } from "@/utils/toast";
import { camelToSnakeCase, snakeToCamelCase } from "@/utils/data-helpers";
import { OnHoldReasonDialog } from "@/components/OnHoldReasonDialog";
import { useSearchParams } from "react-router-dom";
import WorkOrderProgressTracker from "@/components/WorkOrderProgressTracker";
import { useSession } from "@/context/SessionContext";
import { useRealtimeData } from "../context/RealtimeDataContext";
import AppBreadcrumb from "@/components/Breadcrumbs";

// Import new modular components
import { WorkOrderCustomerVehicleCard } from "@/components/work-order-details/WorkOrderCustomerVehicleCard.tsx";
import { WorkOrderServiceLifecycleCard } from "@/components/work-order-details/WorkOrderServiceLifecycleCard.tsx";
import { WorkOrderDetailsInfoCard } from "@/components/work-order-details/WorkOrderDetailsInfoCard.tsx";
import { WorkOrderPartsUsedCard } from "@/components/work-order-details/WorkOrderPartsUsedCard.tsx";
import { WorkOrderActivityLogCard } from "@/components/work-order-details/WorkOrderActivityLogCard.tsx";
import { WorkOrderLocationMapCard } from "@/components/work-order-details/WorkOrderLocationMapCard.tsx";
import { IssueConfirmationDialog } from "@/components/IssueConfirmationDialog.tsx";
import { MaintenanceCompletionDrawer } from "@/components/MaintenanceCompletionDrawer.tsx";
import { WorkOrderAppointmentCard } from "@/components/work-order-details/WorkOrderAppointmentCard.tsx";
import { AssignTechnicianModal } from "@/components/work-order-details/AssignTechnicianModal";

// Import work order helper functions
import {
  generateActivityLogEntry,
  calculateSlaDue,
  calculatePausedDuration,
  isValidStatusTransition,
  generateUpdateActivityMessage,
} from '@/utils/work-order-helpers';

const { TabPane } = Tabs;

interface WorkOrderDetailsProps {
  isDrawerMode?: boolean;
  workOrderId?: string | null;
}

const WorkOrderDetailsEnhanced = ({ isDrawerMode = false, workOrderId }: WorkOrderDetailsProps) => {
  const { id: paramId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  
  // State for dialogs and UI
  const [onHoldWorkOrder, setOnHoldWorkOrder] = useState<WorkOrder | null>(null);
  const [isIssueConfirmationDialogOpen, setIsIssueConfirmationDialogOpen] = useState(false);
  const [isMaintenanceCompletionDrawerOpen, setIsMaintenanceCompletionDrawerOpen] = useState(false);
  const [isAddPartDialogOpen, setIsAddPartDialogOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [pendingUpdates, setPendingUpdates] = useState<Partial<WorkOrder> | null>(null);
  const [showInteractiveMap, setShowInteractiveMap] = useState(false);
  const [activeTabKey, setActiveTabKey] = useState('1');

  const { session } = useSession();
  const { realtimeWorkOrders, realtimeTechnicians } = useRealtimeData();

  const id = workOrderId || (isDrawerMode ? searchParams.get('view') : paramId);

  console.log('WorkOrderDetailsEnhanced: Component rendered with id:', id, 'isDrawerMode:', isDrawerMode);

  // Try to use realtime data first, fallback to query if not available
  const realtimeWorkOrder = useMemo(() => {
    if (!id || !realtimeWorkOrders) return null;
    return realtimeWorkOrders.find((wo: WorkOrder) => wo.id === id);
  }, [id, realtimeWorkOrders]);

  const { data: queriedWorkOrder, isLoading: isLoadingWorkOrder, error: workOrderError } = useQuery<WorkOrder | null>({ 
    queryKey: ['work_order', id], 
    queryFn: async () => { 
      console.log('WorkOrderDetailsEnhanced: Fetching work order with id:', id);
      if (!id) return null; 
      
      try {
        const { data, error } = await supabase
          .from('work_orders')
          .select(`
            *,
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
            initialDiagnosis: data.client_report,
            maintenanceNotes: data.maintenance_notes || data.service_notes || null,
            issueType: data.issue_type || null,
            faultCode: data.fault_code || null,
            serviceNotes: data.service_notes || null,
            partsUsed: data.parts_used || null,
            activityLog: data.activity_log || null,
            slaDue: data.sla_due || null,
            completedAt: data.completed_at || null,
            customerLat: data.customer_lat ?? null,
            customerLng: data.customer_lng ?? null,
            customerAddress: data.customer_address || null,
            onHoldReason: data.on_hold_reason || null,
            appointmentDate: data.appointment_date || null,
            customerId: data.customer_id || null,
            vehicleId: data.vehicle_id || null,
            created_by: data.created_by,
            confirmed_at: data.confirmed_at,
            work_started_at: data.work_started_at,
            sla_timers_paused_at: data.sla_timers_paused_at,
            total_paused_duration_seconds: data.total_paused_duration_seconds
          };

          console.log('WorkOrderDetailsEnhanced: Successfully loaded work order:', mappedData.workOrderNumber);
          return mappedData;
        }
        return null;
      } catch (err) {
        console.error('WorkOrderDetailsEnhanced: Error fetching work order:', err);
        setError(err instanceof Error ? err.message : 'Failed to load work order');
        throw err;
      }
    }, 
    enabled: !!id && !realtimeWorkOrder // Only query if we don't have realtime data
  });

  // Use realtime data if available, otherwise fallback to queried data
  const workOrder = realtimeWorkOrder || queriedWorkOrder;

  // Try to use realtime technician data first
  const realtimeTechnician = useMemo(() => {
    if (!workOrder?.assignedTechnicianId || !realtimeTechnicians) return null;
    return realtimeTechnicians.find((tech: Technician) => tech.id === workOrder.assignedTechnicianId);
  }, [workOrder?.assignedTechnicianId, realtimeTechnicians]);

  // Additional data queries
  const { data: queriedTechnician, isLoading: isLoadingTechnician } = useQuery<Technician | null>({ 
    queryKey: ['technician', workOrder?.assignedTechnicianId], 
    queryFn: async () => { 
      if (!workOrder?.assignedTechnicianId) return null; 
      const { data, error } = await supabase.from('technicians').select('*').eq('id', workOrder.assignedTechnicianId).single(); 
      if (error) throw new Error(error.message); 
      return data ? snakeToCamelCase(data) as Technician : null; 
    }, 
    enabled: !!workOrder?.assignedTechnicianId && !realtimeTechnician
  });

  const technician = realtimeTechnician || queriedTechnician;
  
  const { data: location, isLoading: isLoadingLocation } = useQuery<Location | null>({ 
    queryKey: ['location', workOrder?.locationId], 
    queryFn: async () => { 
      if (!workOrder?.locationId) return null; 
      const { data, error } = await supabase.from('locations').select('*').eq('id', workOrder.locationId).single(); 
      if (error) throw new Error(error.message); 
      return data ? snakeToCamelCase(data) as Location : null; 
    }, 
    enabled: !!workOrder?.locationId 
  });
  
  const { data: queriedAllTechnicians, isLoading: isLoadingAllTechnicians } = useQuery<Technician[]>({ 
    queryKey: ['technicians'], 
    queryFn: async () => { 
      const { data, error } = await supabase.from('technicians').select('*'); 
      if (error) throw new Error(error.message); 
      return (data || []).map(tech => snakeToCamelCase(tech) as Technician); 
    },
    enabled: !realtimeTechnicians || realtimeTechnicians.length === 0
  });

  const allTechnicians = realtimeTechnicians && realtimeTechnicians.length > 0 ? realtimeTechnicians : queriedAllTechnicians;
  
  const { data: allLocations, isLoading: isLoadingAllLocations } = useQuery<Location[]>({ 
    queryKey: ['locations'], 
    queryFn: async () => { 
      const { data, error } = await supabase.from('locations').select('*'); 
      if (error) throw new Error(error.message); 
      return (data || []).map(loc => snakeToCamelCase(loc) as Location); 
    } 
  });
  
  const { data: customer, isLoading: isLoadingCustomer } = useQuery<Customer | null>({ 
    queryKey: ['customer', workOrder?.customerId], 
    queryFn: async () => { 
      if (!workOrder?.customerId) return null; 
      const { data, error } = await supabase.from('customers').select('*').eq('id', workOrder.customerId).single(); 
      if (error) throw new Error(error.message); 
      return data ? snakeToCamelCase(data) as Customer : null; 
    }, 
    enabled: !!workOrder?.customerId 
  });
  
  const { data: vehicle, isLoading: isLoadingVehicle } = useQuery<Vehicle | null>({ 
    queryKey: ['vehicle', workOrder?.vehicleId], 
    queryFn: async () => { 
      if (!workOrder?.vehicleId) return null; 
      const { data, error } = await supabase.from('vehicles').select('*').eq('id', workOrder.vehicleId).single(); 
      if (error) throw new Error(error.message); 
      return data ? snakeToCamelCase(data) as Vehicle : null; 
    }, 
    enabled: !!workOrder?.vehicleId 
  });
  
  const { data: usedParts, isLoading: isLoadingUsedParts } = useQuery<WorkOrderPart[]>({ 
    queryKey: ['work_order_parts', id], 
    queryFn: async () => { 
      if (!id) return []; 
      const { data, error } = await supabase.from('work_order_parts').select('*, inventory_items(*)').eq('work_order_id', id); 
      if (error) throw new Error(error.message); 
      return (data || []).map(part => snakeToCamelCase(part) as WorkOrderPart); 
    }, 
    enabled: !!id 
  });
  
  const { data: profiles, isLoading: isLoadingProfiles } = useQuery<Profile[]>({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) throw new Error(error.message);
      return (data || []).map(profile => snakeToCamelCase(profile) as Profile);
    }
  });
  
  const { data: slaPolicies, isLoading: isLoadingSlaPolicies } = useQuery<SlaPolicy[]>({ 
    queryKey: ['sla_policies'], 
    queryFn: async () => { 
      const { data, error } = await supabase.from('sla_policies').select('*'); 
      if (error) throw new Error(error.message); 
      return (data || []).map(sla => snakeToCamelCase(sla) as SlaPolicy); 
    } 
  });

  // Effect for interactive map
  useEffect(() => {
    if (isDrawerMode && activeTabKey === '3') {
      setShowInteractiveMap(true);
    } else {
      setShowInteractiveMap(false);
    }
  }, [isDrawerMode, activeTabKey]);

  // Mutations
  const workOrderMutation = useMutation({
    mutationFn: async (workOrderData: Partial<WorkOrder>) => {
      const { error } = await supabase.from('work_orders').upsert([camelToSnakeCase(workOrderData)]);
      if (error) throw new Error(error.message);
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['work_order', id] });
      const previous = queryClient.getQueryData(['work_order', id]);
      if (previous && variables.assignedTechnicianId) {
        queryClient.setQueryData(['work_order', id], {
          ...previous,
          assignedTechnicianId: variables.assignedTechnicianId,
        });
      }
      return { previous };
    },
    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['work_order', id], context.previous);
      }
      showError(error.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['work_order', id] });
      queryClient.invalidateQueries({ queryKey: ['work_orders'] });
    },
    onSuccess: () => {
      showSuccess('Work order has been updated.');
    },
  });

  const addPartMutation = useMutation({ 
    mutationFn: async ({ itemId, quantity }: { itemId: string, quantity: number }) => { 
      const { error } = await supabase.rpc('add_part_to_work_order', { 
        p_work_order_id: id, 
        p_item_id: itemId, 
        p_quantity_used: quantity 
      }); 
      if (error) throw new Error(error.message); 
    }, 
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['work_order_parts', id] }); 
      queryClient.invalidateQueries({ queryKey: ['work_order', id] }); 
      queryClient.invalidateQueries({ queryKey: ['inventory_items'] }); 
      setIsAddPartDialogOpen(false);
      showSuccess('Part added to work order successfully!'); 
    }, 
    onError: (error) => showError(error.message) 
  });

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

  // Event handlers
  const handleUpdateWorkOrder = (updates: Partial<WorkOrder>) => { 
    if (!workOrder) return; 

    const oldWorkOrder = { ...workOrder };
    const newStatus = updates.status;
    const oldStatus = oldWorkOrder.status;
    const isServiceCenter = oldWorkOrder.channel === 'Service Center';

    // Intercept: Ready -> In Progress requires an assigned technician
    if (oldStatus === 'Ready' && newStatus === 'In Progress') {
      const effectiveAssigned = updates.assignedTechnicianId ?? oldWorkOrder.assignedTechnicianId;
      if (!effectiveAssigned) {
        setPendingUpdates(updates);
        setIsAssignModalOpen(true);
        return;
      }
    }

    // Allow assignment or reassignment at any time. Still enforce that moving Ready -> In Progress must have a technician.

    // Status transition validation
    if (newStatus && newStatus !== oldStatus) {
      if (!isValidStatusTransition(oldStatus, newStatus, isServiceCenter)) {
        showError(`Invalid status transition from '${oldStatus}' to '${newStatus}'.`);
        return;
      }

      // Special handling dialogs (only when required info not provided in this update)
      // On Hold: open reason dialog only if reason not provided in updates
      if (newStatus === 'On Hold' && !('onHoldReason' in updates)) {
        setOnHoldWorkOrder(oldWorkOrder);
        return;
      }
      // Ready: open Issue Confirmation only if no issueType provided in updates and none exists
      if (newStatus === 'Ready' && !isServiceCenter && !(oldWorkOrder.issueType || updates.issueType)) {
        setIsIssueConfirmationDialogOpen(true);
        return;
      }
      // Completed: open Maintenance Completion only if faultCode or maintenanceNotes missing (considering updates)
      const hasFaultCode = Boolean(oldWorkOrder.faultCode || updates.faultCode);
      const hasMaintNotes = Boolean(oldWorkOrder.maintenanceNotes || updates.maintenanceNotes);
      if (newStatus === 'Completed' && (!hasFaultCode || !hasMaintNotes)) {
        setIsMaintenanceCompletionDrawerOpen(true);
        return;
      }
    }

    // Prepare activity log and timestamp automation
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
      const category = (oldWorkOrder as any).service_categories?.name || 'N/A';
      activityMessage += ` Service category set to '${category}'. Resolution SLA updated.`;
    }

    if (activityMessage) {
      newActivityLog.push(generateActivityLogEntry(activityMessage, session?.user.id ?? null));
      updates.activityLog = newActivityLog;
    }

    // No auto-advance on appointment. Status changes must be explicit via user action (e.g., Start Work).
    
    // Execute mutation
    const finalUpdates = { ...updates };
    if (workOrder.id) {
      finalUpdates.id = workOrder.id;
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

  const handleLocationSelect = (selectedLoc: { lat: number; lng: number; label: string }) => { 
    handleUpdateWorkOrder({ customerAddress: selectedLoc.label, customerLat: selectedLoc.lat, customerLng: selectedLoc.lng }); 
  };
  
  const handleAddPart = (itemId: string, quantity: number) => { 
    addPartMutation.mutate({ itemId, quantity }); 
  };
  
  const handleRemovePart = (partId: string) => { 
    removePartMutation.mutate(partId); 
  };

  // Helper functions
  const profileMap = useMemo(() => {
    if (!profiles) return new Map();
    return new Map(profiles.map(p => [p.id, `${p.first_name || ''} ${p.last_name || ''}`.trim()]));
  }, [profiles]);

  // Loading and error states
  const isLoading = isLoadingWorkOrder || isLoadingTechnician || isLoadingLocation || isLoadingAllTechnicians || isLoadingAllLocations || isLoadingCustomer || isLoadingVehicle || isLoadingUsedParts || isLoadingProfiles || isLoadingSlaPolicies;

  if (error || workOrderError) {
    console.error('WorkOrderDetailsEnhanced: Error state:', { error, workOrderError });
    return isDrawerMode ? (
      <div style={{ padding: 24 }}>
        <NotFound />
      </div>
    ) : (
      <NotFound />
    );
  }

  if (isLoading) {
    console.log('WorkOrderDetailsEnhanced: Loading state');
    return <Skeleton active />;
  }

  if (!workOrder) {
    console.log('WorkOrderDetailsEnhanced: No work order found');
    return isDrawerMode ? (
      <div style={{ padding: 24 }}>
        <NotFound />
      </div>
    ) : (
      <NotFound />
    );
  }

  console.log('WorkOrderDetailsEnhanced: Rendering work order:', workOrder.workOrderNumber);

  const usedPartsCount = usedParts?.length || 0;

  const backButton = (
    <Button 
      icon={<Icon icon="ant-design:arrow-left-outlined" width={18} height={18} />} 
      onClick={() => navigate('/work-orders')} 
    />
  );

  // Main Render
  return (
    <>
      {!isDrawerMode && <AppBreadcrumb backButton={backButton} />}
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {isDrawerMode ? (
          <>
            <div style={{ marginBottom: 16 }}>
              <WorkOrderProgressTracker workOrder={workOrder} />
            </div>
            <div className="sticky-header-secondary">
              <Tabs defaultActiveKey="1" destroyInactiveTabPane={false} onChange={setActiveTabKey}>
              <TabPane tab={<span><Icon icon="ant-design:info-circle-filled" width={18} height={18} /> Overview</span>} key="1">
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <WorkOrderServiceLifecycleCard
                    workOrder={workOrder}
                    handleUpdateWorkOrder={handleUpdateWorkOrder}
                    usedPartsCount={usedPartsCount}
                  />
                  <WorkOrderDetailsInfoCard
                    workOrder={workOrder}
                    technician={technician || null}
                    allTechnicians={allTechnicians || []}
                    allLocations={allLocations || []}
                    handleUpdateWorkOrder={handleUpdateWorkOrder}
                  />
                  {workOrder.appointmentDate && (
                    <WorkOrderAppointmentCard
                      workOrder={workOrder}
                      technician={technician || null}
                      location={location || null}
                    />
                  )}
                  <WorkOrderCustomerVehicleCard workOrder={workOrder} customer={customer || null} vehicle={vehicle || null} />
                </Space>
              </TabPane>
              <TabPane tab={<span><Icon icon="ant-design:ordered-list-outlined" width={18} height={18} /> Parts & Log</span>} key="2">
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <WorkOrderPartsUsedCard
                    usedParts={usedParts || []}
                    isAddPartDialogOpen={isAddPartDialogOpen}
                    setIsAddPartDialogOpen={setIsAddPartDialogOpen}
                    handleAddPart={handleAddPart}
                    handleRemovePart={handleRemovePart}
                  />
                  <WorkOrderActivityLogCard workOrder={workOrder} profileMap={profileMap} />
                </Space>
              </TabPane>
              <TabPane tab={<span><Icon icon="ant-design:compass-filled" width={18} height={18} /> Location</span>} key="3">
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <WorkOrderLocationMapCard
                    workOrder={workOrder}
                    location={location || null}
                    allLocations={allLocations || []}
                    handleUpdateWorkOrder={handleUpdateWorkOrder}
                    handleLocationSelect={handleLocationSelect}
                    showInteractiveMap={showInteractiveMap}
                    setShowInteractiveMap={setShowInteractiveMap}
                  />
                </Space>
              </TabPane>
              </Tabs>
            </div>
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
                    technician={technician || null}
                    allTechnicians={allTechnicians || []}
                    allLocations={allLocations || []}
                    handleUpdateWorkOrder={handleUpdateWorkOrder}
                  />
                  {workOrder.appointmentDate && (
                    <WorkOrderAppointmentCard
                      workOrder={workOrder}
                      technician={technician || null}
                      location={location || null}
                    />
                  )}
                  <WorkOrderCustomerVehicleCard workOrder={workOrder} customer={customer || null} vehicle={vehicle || null} />
                  <WorkOrderLocationMapCard
                    workOrder={workOrder}
                    location={location || null}
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

      {/* Dialogs and Drawers */}
      {onHoldWorkOrder && (
        <OnHoldReasonDialog 
          isOpen={!!onHoldWorkOrder} 
          onClose={() => setOnHoldWorkOrder(null)} 
          onSave={handleSaveOnHoldReason} 
        />
      )}
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

      {/* Enforced assignment modal for Ready -> In Progress */}
      <AssignTechnicianModal
        open={isAssignModalOpen}
        technicians={allTechnicians || []}
        workOrders={(realtimeWorkOrders as WorkOrder[]) || []}
        onCancel={() => { setIsAssignModalOpen(false); setPendingUpdates(null); }}
        onConfirm={(technicianId) => {
          const merged: Partial<WorkOrder> = { ...(pendingUpdates || {}), status: 'In Progress', assignedTechnicianId: technicianId };
          setIsAssignModalOpen(false);
          setPendingUpdates(null);
          handleUpdateWorkOrder(merged);
        }}
      />
    </>
  );
};

export default WorkOrderDetailsEnhanced;