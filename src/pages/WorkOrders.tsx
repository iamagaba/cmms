import { useState, useMemo } from "react";
import { Button, Typography, Space, Segmented, Input, Select, Card, Row, Col, Collapse, Skeleton, Tabs, Dropdown, Menu, Avatar } from "antd";
import { Icon } from '@iconify/react'; // Import Icon from Iconify
import { WorkOrderDataTable, ALL_COLUMNS } from "@/components/WorkOrderDataTable";
import { WorkOrderFormDrawer } from "@/components/WorkOrderFormDrawer";
import WorkOrderKanban from "@/components/WorkOrderKanban";
import { showSuccess, showInfo, showError } from "@/utils/toast";
import { OnHoldReasonDialog } from "@/components/OnHoldReasonDialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder, Technician, Location, Customer, Vehicle, Profile, ServiceCategory, SlaPolicy, EmergencyBikeAssignment } from "@/types/supabase"; // Added EmergencyBikeAssignment
import { camelToSnakeCase, snakeToCamelCase } from "@/utils/data-helpers";
import WorkOrderDetailsDrawer from "@/components/WorkOrderDetailsDrawer";
import { useNavigate, useSearchParams } from "react-router-dom";
import CalendarPage from "./Calendar";
import MapViewPage from "./MapView";
import { CreateWorkOrderDialog } from "@/components/CreateWorkOrderDialog";
import dayjs from "dayjs";
import isBetween from 'dayjs/plugin/isBetween';
import { useSession } from "@/context/SessionContext";
import Breadcrumbs from "@/components/Breadcrumbs";

dayjs.extend(isBetween);
const { TabPane } = Tabs;
const { Panel } = Collapse; // Import Panel from Collapse
const { Search } = Input; // Import Search from Input

type GroupByOption = 'status' | 'priority' | 'assignedTechnicianId' | 'technician'; // Added 'technician'
type WorkOrderView = 'table' | 'kanban' | 'calendar' | 'map';

const channelOptions = ['Call Center', 'Service Center', 'Social Media', 'Staff', 'Swap Station'];
const EMERGENCY_BIKE_THRESHOLD_HOURS = 6;

const WorkOrdersPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { session } = useSession();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingWorkOrder, setEditingWorkOrder] = useState<WorkOrder | null>(null);
  const [prefillData, setPrefillData] = useState<Partial<WorkOrder> | null>(null);
  const [view, setView] = useState<WorkOrderView>('table');
  const [groupBy, setGroupBy] = useState<GroupByOption>('status');
  const [onHoldWorkOrder, setOnHoldWorkOrder] = useState<WorkOrder | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(ALL_COLUMNS.map(c => c.value));
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const viewingWorkOrderId = searchParams.get('view');

  // Filter states
  const [vehicleFilter, setVehicleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [priorityFilter, setPriorityFilter] = useState<string | undefined>(undefined);
  const [technicianFilter, setTechnicianFilter] = useState<string | undefined>(undefined);
  const [channelFilter, setChannelFilter] = useState<string | undefined>(undefined);

  // Data Fetching
  const { data: allWorkOrders, isLoading: isLoadingWorkOrders } = useQuery<WorkOrder[]>({
    queryKey: ['work_orders'],
    queryFn: async () => {
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
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return (data || []).map((item: any) => {
        const mappedData: WorkOrder = {
          ...item,
          createdAt: item.created_at,
          workOrderNumber: item.work_order_number,
          assignedTechnicianId: item.assigned_technician_id,
          locationId: item.location_id,
          serviceNotes: item.service_notes,
          partsUsed: item.parts_used,
          activityLog: item.activity_log,
          slaDue: item.sla_due,
          completedAt: item.completed_at,
          customerLat: item.customer_lat,
          customerLng: item.customer_lng,
          customerAddress: item.customer_address,
          onHoldReason: item.on_hold_reason,
          appointmentDate: item.appointment_date,
          customerId: item.customer_id,
          vehicleId: item.vehicle_id,
          created_by: item.created_by,
          service_category_id: item.service_category_id,
          confirmed_at: item.confirmed_at,
          work_started_at: item.work_started_at,
          sla_timers_paused_at: item.sla_timers_paused_at,
          total_paused_duration_seconds: item.total_paused_duration_seconds,
          initialDiagnosis: item.client_report,
          issueType: item.issue_type,
          faultCode: item.fault_code,
          maintenanceNotes: item.maintenance_notes,
          emergency_bike_notified_at: item.emergency_bike_notified_at,
          active_emergency_bike_assignment: item.active_emergency_bike_assignment.length > 0 ? item.active_emergency_bike_assignment[0] : null,
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
      }) || [];
    }
  });

  const { data: technicians, isLoading: isLoadingTechnicians } = useQuery<Technician[]>({
    queryKey: ['technicians'],
    queryFn: async () => {
      const { data, error } = await supabase.from('technicians').select('*');
      if (error) throw new Error(error.message);
      return (data || []).map(snakeToCamelCase) as Technician[]; // Apply snakeToCamelCase
    }
  });

  const { data: locations, isLoading: isLoadingLocations } = useQuery<Location[]>({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase.from('locations').select('*');
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

  const { data: vehicles, isLoading: isLoadingVehicles } = useQuery<Vehicle[]>({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('vehicles').select('*');
      if (error) throw new Error(error.message);
      return data || [];
    }
  });

  const { data: profiles, isLoading: isLoadingProfiles } = useQuery<Profile[]>({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) throw new Error(error.message);
      return data || [];
    }
  });

  const { data: serviceCategories, isLoading: isLoadingServiceCategories } = useQuery<ServiceCategory[]>({ queryKey: ['service_categories'], queryFn: async () => { const { data, error } = await supabase.from('service_categories').select('*'); if (error) throw new Error(error.message); return data || []; } });
  const { data: slaPolicies, isLoading: isLoadingSlaPolicies } = useQuery<SlaPolicy[]>({ queryKey: ['sla_policies'], queryFn: async () => { const { data, error } = await supabase.from('sla_policies').select('*'); if (error) throw new Error(error.message); return data || []; } });


  // Mutations
  const workOrderMutation = useMutation({
    mutationFn: async (workOrderData: Partial<WorkOrder>) => {
      const { error } = await supabase.from('work_orders').upsert([workOrderData]);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work_orders'] });
      showSuccess('Work order has been saved.');
    },
    onError: (error) => showError(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('work_orders').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work_orders'] });
      showSuccess('Work order has been deleted.');
    },
    onError: (error) => showError(error.message),
  });

  const bulkAssignMutation = useMutation({
    mutationFn: async ({ workOrderIds, technicianId }: { workOrderIds: React.Key[], technicianId: string }) => {
      const updates = workOrderIds.map(id => ({
        id: id as string,
        assigned_technician_id: technicianId,
        status: 'In Progress' as const,
      }));
      const { error } = await supabase.from('work_orders').upsert(updates);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work_orders'] });
      showSuccess(`${selectedRowKeys.length} work orders have been assigned.`);
      setSelectedRowKeys([]);
    },
    onError: (error) => showError(error.message),
  });

  const handleSave = (workOrderData: WorkOrder) => { 
    const newActivityLog = workOrderData.activityLog || [{ timestamp: new Date().toISOString(), activity: 'Work order created.', userId: session?.user.id ?? null }];
    const dataToMutate: Partial<WorkOrder> = { ...workOrderData, activityLog: newActivityLog };
    if (dataToMutate.id === undefined) { delete dataToMutate.id; }
    workOrderMutation.mutate(camelToSnakeCase(dataToMutate)); 
    setIsFormDialogOpen(false); 
    setEditingWorkOrder(null); 
  };
  const handleDelete = (workOrderData: WorkOrder) => { deleteMutation.mutate(workOrderData.id); };
  
  const handleUpdateWorkOrder = (id: string, updates: Partial<WorkOrder>) => { 
    const workOrder = allWorkOrders?.find(wo => wo.id === id); 
    if (!workOrder) return; 

    const oldWorkOrder = { ...workOrder };
    const newStatus = updates.status;
    const oldStatus = oldWorkOrder.status;

    // Status transition validation
    if (newStatus && newStatus !== oldStatus) {
      const isServiceCenter = oldWorkOrder.channel === 'Service Center';
      let isValidTransition = false;

      if (oldStatus === 'Open') {
        if (newStatus === 'Confirmation') {
          isValidTransition = true;
        } else if (newStatus === 'In Progress' && isServiceCenter) {
          isValidTransition = true;
        }
      } else if (oldStatus === 'Confirmation') {
        if (newStatus === 'Ready') {
          isValidTransition = true;
        }
      } else if (oldStatus === 'Ready') {
        if (newStatus === 'In Progress') {
          isValidTransition = true;
        }
      } else if (oldStatus === 'In Progress') {
        if (newStatus === 'On Hold' || newStatus === 'Completed') {
          isValidTransition = true;
        }
      } else if (oldStatus === 'On Hold') {
        if (newStatus === 'In Progress') {
          isValidTransition = true;
        }
      } else if (oldStatus === 'Completed') {
        showError('Cannot change status of a completed work order.');
        return;
      }

      if (!isValidTransition) {
        showError(`Invalid status transition from '${oldStatus}' to '${newStatus}'.`);
        return;
      }
    }

    const newActivityLog = [...(workOrder.activityLog || [])];
    let activityMessage = '';

    // --- Timestamp & SLA Automation ---
    // The oldStatus and newStatus are already validated above.
    if (newStatus && newStatus !== oldStatus) {
      activityMessage = `Status changed from '${oldStatus || 'N/A'}' to '${newStatus}'.`;
      if (newStatus === 'Confirmation' && !oldWorkOrder.confirmed_at) updates.confirmed_at = new Date().toISOString();
      if (newStatus === 'In Progress' && !oldWorkOrder.work_started_at) updates.work_started_at = new Date().toISOString();
      if (newStatus === 'On Hold' && oldStatus !== 'On Hold') updates.sla_timers_paused_at = new Date().toISOString();
      if (oldStatus === 'On Hold' && newStatus !== 'On Hold' && oldWorkOrder.sla_timers_paused_at) {
        const pausedAt = dayjs(oldWorkOrder.sla_timers_paused_at);
        const resumedAt = dayjs();
        const durationPaused = resumedAt.diff(pausedAt, 'second');
        updates.total_paused_duration_seconds = (oldWorkOrder.total_paused_duration_seconds || 0) + durationPaused;
        updates.sla_timers_paused_at = null;
        activityMessage += ` (SLA timers resumed after ${durationPaused}s pause).`;
      }
    }

    if (updates.service_category_id && updates.service_category_id !== oldWorkOrder.service_category_id) {
      const policy = slaPolicies?.find(p => p.service_category_id === updates.service_category_id);
      const category = serviceCategories?.find(c => c.id === updates.service_category_id);
      if (policy && policy.resolution_hours) {
        const createdAt = dayjs(oldWorkOrder.created_at);
        const totalPausedSeconds = updates.total_paused_duration_seconds || oldWorkOrder.total_paused_duration_seconds || 0;
        const newSlaDue = createdAt.add(policy.resolution_hours, 'hours').add(totalPausedSeconds, 'seconds').toISOString();
        updates.slaDue = newSlaDue;
        activityMessage += ` Service category set to '${category?.name}'. Resolution SLA updated.`;
      }
    }
    // --- End Automation ---

    if (activityMessage) {
      newActivityLog.push({ timestamp: new Date().toISOString(), activity: activityMessage, userId: session?.user.id ?? null });
      updates.activityLog = newActivityLog;
    }

    if (updates.status === 'On Hold') { 
      setOnHoldWorkOrder(workOrder); 
      return; 
    } 
    
    // This automatic status change should happen after validation, but before the final mutation.
    // The validation above already ensures 'Ready' -> 'In Progress' is a valid transition.
    if ((updates.assignedTechnicianId || updates.appointmentDate) && workOrder.status === 'Ready' && !['On Hold', 'Completed'].includes(updates.status as WorkOrder['status'])) {
      updates.status = 'In Progress';
      showInfo(`Work Order ${workOrder.workOrderNumber} automatically moved to In Progress.`);
    }
    
    workOrderMutation.mutate(camelToSnakeCase({ id, ...updates })); 
  };

  const handleSaveOnHoldReason = (reason: string) => { if (!onHoldWorkOrder) return; const updates = { status: 'On Hold' as const, onHoldReason: reason }; handleUpdateWorkOrder(onHoldWorkOrder.id, updates); setOnHoldWorkOrder(null); };
  const handleViewDetails = (workOrderId: string) => { setSearchParams({ view: workOrderId }); };
  const handleCloseDrawer = () => { setSearchParams({}); };

  const handleProceedToCreate = (vehicle: Vehicle & { customers?: Customer | null }) => {
    setIsCreateDialogOpen(false);
    const initialSlaDue = dayjs().add(15, 'minutes').toISOString(); // Default 15 min for first response
    const prefill = {
      vehicleId: vehicle.id,
      customerId: vehicle.customer_id,
      customerName: vehicle.customers?.name || '', // Ensure customerName is always a string
      customerPhone: vehicle.customers?.phone || '', // Ensure customerPhone is always a string
      vehicleModel: `${vehicle.make} ${vehicle.model}`,
      slaDue: initialSlaDue,
    };
    setPrefillData(prefill);
    setEditingWorkOrder(null);
    setIsFormDialogOpen(true);
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const handleBulkAssign = ({ key }: { key: string }) => {
    bulkAssignMutation.mutate({ workOrderIds: selectedRowKeys, technicianId: key });
  };

  const bulkAssignMenu = (
    <Menu onClick={handleBulkAssign}>
      {(technicians || []).map(tech => (
        <Menu.Item key={tech.id}>
          <Space>
            <Avatar size="small" src={tech.avatar || undefined}>{tech.name.split(' ').map(n => n[0]).join('')}</Avatar>
            {tech.name}
          </Space>
        </Menu.Item>
      ))}
    </Menu>
  );

  const filteredWorkOrders = useMemo(() => { if (!allWorkOrders) return []; return allWorkOrders.filter(wo => { const vehicleMatch = wo.vehicleId?.toLowerCase().includes(vehicleFilter.toLowerCase()) ?? true; const statusMatch = statusFilter ? wo.status === statusFilter : true; const priorityMatch = priorityFilter ? wo.priority === priorityFilter : true; const technicianMatch = technicianFilter ? wo.assignedTechnicianId === technicianFilter : true; const channelMatch = channelFilter ? wo.channel === channelFilter : true; return vehicleMatch && statusMatch && priorityMatch && technicianMatch && channelMatch; }); }, [allWorkOrders, vehicleFilter, statusFilter, priorityFilter, technicianFilter, channelFilter]);
  const kanbanColumns = useMemo(() => { switch (groupBy) { case 'priority': return [ { id: 'High', title: 'High' }, { id: 'Medium', title: 'Medium' }, { id: 'Low', title: 'Low' } ]; case 'technician': return [ { id: null, title: 'Unassigned' }, ...(technicians || []).map(t => ({ id: t.id, title: t.name })) ]; case 'status': default: return [ { id: 'Open', title: 'Open' }, { id: 'Confirmation', title: 'Confirmation' }, { id: 'Ready', title: 'Ready' }, { id: 'In Progress', title: 'In Progress' }, { id: 'On Hold', title: 'On Hold' }, { id: 'Completed', title: 'Completed' } ]; } }, [groupBy, technicians]);
  const groupByField = useMemo(() => (groupBy === 'technician' ? 'assignedTechnicianId' : groupBy), [groupBy]);
  const isLoading = isLoadingWorkOrders || isLoadingTechnicians || isLoadingLocations || isLoadingCustomers || isLoadingVehicles || isLoadingProfiles || isLoadingServiceCategories || isLoadingSlaPolicies;

  const handleVisibleColumnsChange = (checkedValues: any) => {
    setVisibleColumns(checkedValues);
  };

  const pageActions = (
    <Space>
      {view === 'table' && selectedRowKeys.length > 0 && (
        <Dropdown overlay={bulkAssignMenu} disabled={selectedRowKeys.length === 0}>
          <Button>
            Assign ({selectedRowKeys.length}) <Icon icon="si:arrow-down" />
          </Button>
        </Dropdown>
      )}
      <Button type="primary" icon={<Icon icon="si:plus" />} onClick={() => setIsCreateDialogOpen(true)}>Add Work Order</Button>
    </Space>
  );

  const tabItems = [
    {
      label: (<span><Icon icon="si:table" /> Table</span>),
      key: 'table',
      children: isLoading ? <Skeleton active paragraph={{ rows: 5 }} /> : (
        <WorkOrderDataTable
          rowSelection={rowSelection}
          workOrders={filteredWorkOrders}
          technicians={technicians || []}
          locations={locations || []}
          customers={customers || []}
          vehicles={vehicles || []}
          onEdit={(wo) => { setEditingWorkOrder(wo); setIsFormDialogOpen(true); }}
          onDelete={handleDelete}
          onUpdateWorkOrder={handleUpdateWorkOrder}
          onViewDetails={handleViewDetails}
          profiles={profiles || []}
          visibleColumns={visibleColumns}
          onVisibleColumnsChange={handleVisibleColumnsChange}
        />
      ),
    },
    {
      label: (<span><Icon icon="si:grid" /> Board</span>),
      key: 'kanban',
      children: isLoading ? <Skeleton active paragraph={{ rows: 5 }} /> : (
        <WorkOrderKanban
          workOrders={filteredWorkOrders}
          groupBy={groupByField}
          columns={kanbanColumns}
          onUpdateWorkOrder={handleUpdateWorkOrder}
          technicians={technicians || []}
          locations={locations || []}
          customers={customers || []}
          vehicles={vehicles || []}
          onViewDetails={handleViewDetails}
        />
      ),
    },
    {
      label: (<span><Icon icon="si:calendar" /> Calendar</span>),
      key: 'calendar',
      children: <CalendarPage />,
    },
    {
      label: (<span><Icon icon="si:map" /> Map View</span>),
      key: 'map',
      children: <MapViewPage />,
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Breadcrumbs actions={pageActions} />
      <Collapse><Panel header={<><Icon icon="si:filter" /> Filters & View Options</>} key="1"><Row gutter={[16, 16]} align="bottom"><Col xs={24} sm={12} md={6}><Search placeholder="Filter by Vehicle ID..." allowClear onSearch={setVehicleFilter} onChange={(e) => setVehicleFilter(e.target.value)} style={{ width: '100%' }} /></Col><Col xs={24} sm={12} md={4}><Select placeholder="Filter by Status" allowClear style={{ width: '100%' }} onChange={setStatusFilter} value={statusFilter}><Select.Option value="Open">Open</Select.Option><Select.Option value="Confirmation">Confirmation</Select.Option><Select.Option value="Ready">Ready</Select.Option><Select.Option value="In Progress">In Progress</Select.Option><Select.Option value="On Hold">On Hold</Select.Option><Select.Option value="Completed">Completed</Select.Option></Select></Col><Col xs={24} sm={12} md={4}><Select placeholder="Filter by Priority" allowClear style={{ width: '100%' }} onChange={setPriorityFilter} value={priorityFilter}><Select.Option value="High">High</Select.Option><Select.Option value="Medium">Medium</Select.Option><Select.Option value="Low">Low</Select.Option></Select></Col><Col xs={24} sm={12} md={5}><Select placeholder="Filter by Technician" allowClear style={{ width: '100%' }} onChange={setTechnicianFilter} value={technicianFilter}>{technicians?.map(t => <Select.Option key={t.id} value={t.id}>{t.name}</Select.Option>)}</Select></Col><Col xs={24} sm={12} md={5}><Select placeholder="Filter by Location" allowClear style={{ width: '100%' }} onChange={setChannelFilter} value={channelFilter}>{locations?.map(l => <Select.Option key={l.id} value={l.id}>{l.name}</Select.Option>)}</Select></Col>{view === 'kanban' && (<Col xs={24} sm={12} md={2}><Select value={groupBy} onChange={(value) => setGroupBy(value as GroupByOption)} style={{ width: '100%' }}><Select.Option value="status">Group by: Status</Select.Option><Select.Option value="priority">Group by: Priority</Select.Option><Select.Option value="technician">Group by: Technician</Select.Option></Select></Col>)}</Row></Panel></Collapse>
      <Tabs defaultActiveKey="table" activeKey={view} onChange={(key) => setView(key as WorkOrderView)} items={tabItems} />
      {isCreateDialogOpen && <CreateWorkOrderDialog isOpen={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)} onProceed={handleProceedToCreate} />}
      {isFormDialogOpen && <WorkOrderFormDrawer isOpen={isFormDialogOpen} onClose={() => { setIsFormDialogOpen(false); setPrefillData(null); }} onSave={handleSave} workOrder={editingWorkOrder} prefillData={prefillData} technicians={technicians || []} locations={locations || []} serviceCategories={serviceCategories || []} />}
      {onHoldWorkOrder && <OnHoldReasonDialog isOpen={!!onHoldWorkOrder} onClose={() => setOnHoldWorkOrder(null)} onSave={handleSaveOnHoldReason} />}
      <WorkOrderDetailsDrawer onClose={handleCloseDrawer} />
    </Space>
  );
};

export default WorkOrdersPage;