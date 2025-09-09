import { useState, useMemo } from "react";
import { Button, Typography, Space, Segmented, Input, Select, Card, Row, Col, Collapse, Skeleton, Tabs } from "antd";
import { PlusOutlined, AppstoreOutlined, TableOutlined, FilterOutlined, CalendarOutlined, GlobalOutlined } from "@ant-design/icons";
import { WorkOrderDataTable, ALL_COLUMNS } from "@/components/WorkOrderDataTable";
import { WorkOrderFormDrawer } from "@/components/WorkOrderFormDrawer";
import WorkOrderKanban from "@/components/WorkOrderKanban";
import { showSuccess, showInfo, showError } from "@/utils/toast";
import { OnHoldReasonDialog } from "@/components/OnHoldReasonDialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder, Technician, Location, Customer, Vehicle, Profile } from "@/types/supabase";
import { camelToSnakeCase } from "@/utils/data-helpers";
import WorkOrderDetailsDrawer from "@/components/WorkOrderDetailsDrawer";
import { useNavigate, useSearchParams } from "react-router-dom";
import CalendarPage from "./Calendar";
import MapViewPage from "./MapView";
import PageHeader from "@/components/PageHeader";
import { CreateWorkOrderDialog } from "@/components/CreateWorkOrderDialog";
import dayjs from "dayjs";

const { Title } = Typography;
const { Search } = Input;
const { Option = Select.Option } = Select;
const { Panel } = Collapse;

type GroupByOption = 'status' | 'priority' | 'technician';
type WorkOrderView = 'table' | 'kanban' | 'calendar' | 'map';

const WorkOrdersPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingWorkOrder, setEditingWorkOrder] = useState<WorkOrder | null>(null);
  const [prefillData, setPrefillData] = useState<Partial<WorkOrder> | null>(null);
  const [view, setView] = useState<WorkOrderView>('table');
  const [groupBy, setGroupBy] = useState<GroupByOption>('status');
  const [onHoldWorkOrder, setOnHoldWorkOrder] = useState<WorkOrder | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(ALL_COLUMNS.map(c => c.value));

  const viewingWorkOrderId = searchParams.get('view');

  // Filter states
  const [vehicleFilter, setVehicleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [priorityFilter, setPriorityFilter] = useState<string | undefined>(undefined);
  const [technicianFilter, setTechnicianFilter] = useState<string | undefined>(undefined);

  // Data Fetching
  const { data: allWorkOrders, isLoading: isLoadingWorkOrders } = useQuery<WorkOrder[]>({ 
    queryKey: ['work_orders'], 
    queryFn: async () => { 
      const { data, error } = await supabase.from('work_orders').select('*').order('created_at', { ascending: false }); 
      if (error) throw new Error(error.message); 
      
      // Manually map snake_case to camelCase for consistency with WorkOrder type
      return (data || []).map((item: any) => ({
        ...item,
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
      })) || [];
    } 
  });
  const { data: technicians, isLoading: isLoadingTechnicians } = useQuery<Technician[]>({ queryKey: ['technicians'], queryFn: async () => { const { data, error } = await supabase.from('technicians').select('*'); if (error) throw new Error(error.message); return data; } });
  const { data: locations, isLoading: isLoadingLocations } = useQuery<Location[]>({ queryKey: ['locations'], queryFn: async () => { const { data, error } = await supabase.from('locations').select('*'); if (error) throw new Error(error.message); return data; } });
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

  // Mutations
  const workOrderMutation = useMutation({ mutationFn: async (workOrderData: Partial<WorkOrder>) => { const { error } = await supabase.from('work_orders').upsert([workOrderData]); if (error) throw new Error(error.message); }, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['work_orders'] }); showSuccess('Work order has been saved.'); }, onError: (error) => showError(error.message) });
  const deleteMutation = useMutation({ mutationFn: async (id: string) => { const { error } = await supabase.from('work_orders').delete().eq('id', id); if (error) throw new Error(error.message); }, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['work_orders'] }); showSuccess('Work order has been deleted.'); }, onError: (error) => showError(error.message) });

  const handleSave = (workOrderData: WorkOrder) => { 
    const newActivityLog = workOrderData.activityLog || [{ timestamp: new Date().toISOString(), activity: 'Work order created.' }];
    
    const dataToMutate: Partial<WorkOrder> = { ...workOrderData, activityLog: newActivityLog };

    if (dataToMutate.id === undefined) {
      delete dataToMutate.id;
    }

    workOrderMutation.mutate(camelToSnakeCase(dataToMutate)); 
    setIsFormDialogOpen(false); 
    setEditingWorkOrder(null); 
  };
  const handleDelete = (workOrderData: WorkOrder) => { deleteMutation.mutate(workOrderData.id); };
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
      const oldLoc = locations?.find(l => l.id === oldWorkOrder.locationId)?.name || 'N/A';
      const newLoc = locations?.find(l => l.id === updates.locationId)?.name || 'N/A';
      activityMessage = `Service location changed from '${oldLoc}' to '${newLoc}'.`;
    } else if (updates.customerAddress && updates.customerAddress !== oldWorkOrder.customerAddress) {
      activityMessage = `Client address updated to '${updates.customerAddress}'.`;
    } else if (updates.customerLat !== oldWorkOrder.customerLat || updates.customerLng !== oldWorkOrder.customerLng) {
      activityMessage = `Client coordinates updated.`;
    } else {
      activityMessage = 'Work order details updated.';
    }

    if (activityMessage) {
      newActivityLog.push({ timestamp: new Date().toISOString(), activity: activityMessage });
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
    workOrderMutation.mutate(camelToSnakeCase({ id, ...updates })); 
  };
  const handleSaveOnHoldReason = (reason: string) => { if (!onHoldWorkOrder) return; const updates = { status: 'On Hold' as const, onHoldReason: reason }; workOrderMutation.mutate(camelToSnakeCase({ id: onHoldWorkOrder.id, ...updates })); setOnHoldWorkOrder(null); };
  const handleViewDetails = (workOrderId: string) => { setSearchParams({ view: workOrderId }); };
  const handleCloseDrawer = () => { setSearchParams({}); };

  const handleProceedToCreate = (vehicle: Vehicle & { customers?: Customer | null }) => {
    setIsCreateDialogOpen(false);
    const prefill = {
      vehicleId: vehicle.id,
      customerId: vehicle.customer_id,
      customerName: vehicle.customers?.name,
      customerPhone: vehicle.customers?.phone,
      vehicleModel: `${vehicle.make} ${vehicle.model}`,
    };
    setPrefillData(prefill);
    setEditingWorkOrder(null);
    setIsFormDialogOpen(true);
  };

  const filteredWorkOrders = useMemo(() => { if (!allWorkOrders) return []; return allWorkOrders.filter(wo => { const vehicleMatch = wo.vehicleId?.toLowerCase().includes(vehicleFilter.toLowerCase()) ?? true; const statusMatch = statusFilter ? wo.status === statusFilter : true; const priorityMatch = priorityFilter ? wo.priority === priorityFilter : true; const technicianMatch = technicianFilter ? wo.assignedTechnicianId === technicianFilter : true; return vehicleMatch && statusMatch && priorityMatch && technicianMatch; }); }, [allWorkOrders, vehicleFilter, statusFilter, priorityFilter, technicianFilter]);
  const kanbanColumns = useMemo(() => { switch (groupBy) { case 'priority': return [ { id: 'High', title: 'High' }, { id: 'Medium', title: 'Medium' }, { id: 'Low', title: 'Low' } ]; case 'technician': return [ { id: null, title: 'Unassigned' }, ...(technicians || []).map(t => ({ id: t.id, title: t.name })) ]; case 'status': default: return [ { id: 'Open', title: 'Open' }, { id: 'Confirmation', title: 'Confirmation' }, { id: 'Ready', title: 'Ready' }, { id: 'In Progress', title: 'In Progress' }, { id: 'On Hold', title: 'On Hold' }, { id: 'Completed', title: 'Completed' } ]; } }, [groupBy, technicians]);
  const groupByField = useMemo(() => (groupBy === 'technician' ? 'assignedTechnicianId' : groupBy), [groupBy]);
  const isLoading = isLoadingWorkOrders || isLoadingTechnicians || isLoadingLocations || isLoadingCustomers || isLoadingVehicles || isLoadingProfiles;

  const handleVisibleColumnsChange = (checkedValues: any) => {
    setVisibleColumns(checkedValues);
  };

  const tabItems = [
    {
      label: (<span><TableOutlined /> Table</span>),
      key: 'table',
      children: isLoading ? <Skeleton active paragraph={{ rows: 5 }} /> : (
        <WorkOrderDataTable
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
      label: (<span><AppstoreOutlined /> Board</span>),
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
      label: (<span><CalendarOutlined /> Calendar</span>),
      key: 'calendar',
      children: <CalendarPage />,
    },
    {
      label: (<span><GlobalOutlined /> Map View</span>),
      key: 'map',
      children: <MapViewPage />,
    },
  ];

  return (
    <>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <PageHeader title="Work Order Management" hideSearch actions={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsCreateDialogOpen(true)}>Add Work Order</Button>
        } />
        <Collapse><Panel header={<><FilterOutlined /> Filters & View Options</>} key="1"><Row gutter={[16, 16]} align="bottom"><Col xs={24} sm={12} md={6}><Search placeholder="Filter by Vehicle ID..." allowClear onSearch={setVehicleFilter} onChange={(e) => setVehicleFilter(e.target.value)} style={{ width: '100%' }} /></Col><Col xs={24} sm={12} md={5}><Select placeholder="Filter by Status" allowClear style={{ width: '100%' }} onChange={setStatusFilter} value={statusFilter}><Option value="Open">Open</Option><Option value="Confirmation">Confirmation</Option><Option value="Ready">Ready</Option><Option value="In Progress">In Progress</Option><Option value="On Hold">On Hold</Option><Option value="Completed">Completed</Option></Select></Col><Col xs={24} sm={12} md={5}><Select placeholder="Filter by Priority" allowClear style={{ width: '100%' }} onChange={setPriorityFilter} value={priorityFilter}><Option value="High">High</Option><Option value="Medium">Medium</Option><Option value="Low">Low</Option></Select></Col><Col xs={24} sm={12} md={5}><Select placeholder="Filter by Technician" allowClear style={{ width: '100%' }} onChange={setTechnicianFilter} value={technicianFilter}>{(technicians || []).map(t => <Option key={t.id} value={t.id}>{t.name}</Option>)}</Select></Col>{view === 'kanban' && (<Col xs={24} sm={12} md={3}><Select value={groupBy} onChange={(value) => setGroupBy(value as GroupByOption)} style={{ width: '100%' }}><Option value="status">Group by: Status</Option><Option value="priority">Group by: Priority</Option><Option value="technician">Group by: Technician</Option></Select></Col>)}</Row></Panel></Collapse>
        <Tabs defaultActiveKey="table" activeKey={view} onChange={(key) => setView(key as WorkOrderView)} items={tabItems} />
      </Space>
      {isCreateDialogOpen && <CreateWorkOrderDialog isOpen={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)} onProceed={handleProceedToCreate} />}
      {isFormDialogOpen && <WorkOrderFormDrawer isOpen={isFormDialogOpen} onClose={() => { setIsFormDialogOpen(false); setPrefillData(null); }} onSave={handleSave} workOrder={editingWorkOrder} prefillData={prefillData} technicians={technicians || []} locations={locations || []} />}
      {onHoldWorkOrder && <OnHoldReasonDialog isOpen={!!onHoldWorkOrder} onClose={() => setOnHoldWorkOrder(null)} onSave={handleSaveOnHoldReason} />}
      <WorkOrderDetailsDrawer workOrderId={viewingWorkOrderId} onClose={handleCloseDrawer} />
    </>
  );
};

export default WorkOrdersPage;