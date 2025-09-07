import { useState, useMemo } from "react";
import { Button, Typography, Space, Segmented, Input, Select, Card, Row, Col, Collapse, Skeleton } from "antd";
import { PlusOutlined, AppstoreOutlined, TableOutlined, FilterOutlined } from "@ant-design/icons";
import { WorkOrderDataTable } from "@/components/WorkOrderDataTable";
import { WorkOrderFormDialog } from "@/components/WorkOrderFormDialog";
import WorkOrderKanban from "@/components/WorkOrderKanban";
import { showSuccess, showInfo, showError } from "@/utils/toast";
import { OnHoldReasonDialog } from "@/components/OnHoldReasonDialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder, Technician, Location } from "@/types/supabase";
import { camelToSnakeCase } from "@/utils/data-helpers"; // Import the utility

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;
const { Panel } = Collapse;

type GroupByOption = 'status' | 'priority' | 'technician';

const WorkOrdersPage = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWorkOrder, setEditingWorkOrder] = useState<WorkOrder | null>(null);
  const [view, setView] = useState<'table' | 'kanban'>('table');
  const [groupBy, setGroupBy] = useState<GroupByOption>('status');
  const [onHoldWorkOrder, setOnHoldWorkOrder] = useState<WorkOrder | null>(null);

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
      return data;
    }
  });

  const { data: technicians, isLoading: isLoadingTechnicians } = useQuery<Technician[]>({
    queryKey: ['technicians'],
    queryFn: async () => {
      const { data, error } = await supabase.from('technicians').select('*');
      if (error) throw new Error(error.message);
      return data;
    }
  });

  const { data: locations, isLoading: isLoadingLocations } = useQuery<Location[]>({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase.from('locations').select('*');
      if (error) throw new Error(error.message);
      return data;
    }
  });

  // Mutations
  const workOrderMutation = useMutation({
    mutationFn: async (workOrderData: Partial<WorkOrder>) => {
      const { error } = await supabase.from('work_orders').upsert(workOrderData);
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

  const handleSave = (workOrderData: WorkOrder) => {
    workOrderMutation.mutate(workOrderData);
    setIsDialogOpen(false);
    setEditingWorkOrder(null);
  };

  const handleDelete = (workOrderData: WorkOrder) => {
    deleteMutation.mutate(workOrderData.id);
  };

  const handleUpdateWorkOrder = (id: string, updates: Partial<WorkOrder>) => {
    const workOrder = allWorkOrders?.find(wo => wo.id === id);
    if (!workOrder) return;

    if (updates.status === 'On Hold') {
      setOnHoldWorkOrder(workOrder);
      return;
    }

    if ((updates.assignedTechnicianId || updates.appointmentDate) && workOrder.status === 'Ready') {
      updates.status = 'In Progress';
      showInfo(`Work Order ${workOrder.workOrderNumber} automatically moved to In Progress.`);
    }
    
    workOrderMutation.mutate(camelToSnakeCase({ id, ...updates })); // Apply camelToSnakeCase here
  };

  const handleSaveOnHoldReason = (reason: string) => {
    if (!onHoldWorkOrder) return;
    const updates = { status: 'On Hold' as const, onHoldReason: reason };
    workOrderMutation.mutate(camelToSnakeCase({ id: onHoldWorkOrder.id, ...updates })); // Apply camelToSnakeCase here
    setOnHoldWorkOrder(null);
  };

  const filteredWorkOrders = useMemo(() => {
    if (!allWorkOrders) return [];
    return allWorkOrders.filter(wo => {
      const vehicleMatch = wo.vehicleId?.toLowerCase().includes(vehicleFilter.toLowerCase()) ?? true;
      const statusMatch = statusFilter ? wo.status === statusFilter : true;
      const priorityMatch = priorityFilter ? wo.priority === priorityFilter : true;
      const technicianMatch = technicianFilter ? wo.assignedTechnicianId === technicianFilter : true;
      return vehicleMatch && statusMatch && priorityMatch && technicianMatch;
    });
  }, [allWorkOrders, vehicleFilter, statusFilter, priorityFilter, technicianFilter]);

  const kanbanColumns = useMemo(() => {
    switch (groupBy) {
      case 'priority':
        return [ { id: 'High', title: 'High' }, { id: 'Medium', title: 'Medium' }, { id: 'Low', title: 'Low' } ];
      case 'technician':
        return [ { id: null, title: 'Unassigned' }, ...(technicians || []).map(t => ({ id: t.id, title: t.name })) ];
      case 'status':
      default:
        return [ 
          { id: 'Open', title: 'Open' }, 
          { id: 'Confirmation', title: 'Confirmation' }, 
          { id: 'Ready', title: 'Ready' }, 
          { id: 'In Progress', title: 'In Progress' }, 
          { id: 'On Hold', title: 'On Hold' }, 
          { id: 'Completed', title: 'Completed' } 
        ];
    }
  }, [groupBy, technicians]);

  const groupByField = useMemo(() => (groupBy === 'technician' ? 'assignedTechnicianId' : groupBy), [groupBy]);

  const isLoading = isLoadingWorkOrders || isLoadingTechnicians || isLoadingLocations;

  return (
    <>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Row justify="space-between" align="middle">
          <Col><Title level={4} style={{ margin: 0 }}>Work Order Management</Title></Col>
          <Col>
            <Space size="middle">
              <Segmented options={[{ label: 'Table', value: 'table', icon: <TableOutlined /> }, { label: 'Board', value: 'kanban', icon: <AppstoreOutlined /> }]} value={view} onChange={(value) => setView(value as 'table' | 'kanban')} />
              <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingWorkOrder(null); setIsDialogOpen(true); }}>Add Work Order</Button>
            </Space>
          </Col>
        </Row>
        
        <Collapse>
          <Panel header={<><FilterOutlined /> Filters & View Options</>} key="1">
            <Row gutter={[16, 16]} align="bottom">
              <Col xs={24} sm={12} md={6}><Search placeholder="Filter by Vehicle ID..." allowClear onSearch={setVehicleFilter} onChange={(e) => setVehicleFilter(e.target.value)} style={{ width: '100%' }} /></Col>
              <Col xs={24} sm={12} md={5}><Select placeholder="Filter by Status" allowClear style={{ width: '100%' }} onChange={setStatusFilter} value={statusFilter}><Option value="Open">Open</Option><Option value="Confirmation">Confirmation</Option><Option value="Ready">Ready</Option><Option value="In Progress">In Progress</Option><Option value="On Hold">On Hold</Option><Option value="Completed">Completed</Option></Select></Col>
              <Col xs={24} sm={12} md={5}><Select placeholder="Filter by Priority" allowClear style={{ width: '100%' }} onChange={setPriorityFilter} value={priorityFilter}><Option value="High">High</Option><Option value="Medium">Medium</Option><Option value="Low">Low</Option></Select></Col>
              <Col xs={24} sm={12} md={5}><Select placeholder="Filter by Technician" allowClear style={{ width: '100%' }} onChange={setTechnicianFilter} value={technicianFilter}>{(technicians || []).map(t => <Option key={t.id} value={t.id}>{t.name}</Option>)}</Select></Col>
              {view === 'kanban' && (<Col xs={24} sm={12} md={3}><Select value={groupBy} onChange={(value) => setGroupBy(value as GroupByOption)} style={{ width: '100%' }}><Option value="status">Group by: Status</Option><Option value="priority">Group by: Priority</Option><Option value="technician">Group by: Technician</Option></Select></Col>)}
            </Row>
          </Panel>
        </Collapse>

        <Card bordered={false} bodyStyle={{ padding: view === 'kanban' ? '1' : '0' }}>
          {isLoading ? <Skeleton active paragraph={{ rows: 5 }} /> : (
            view === 'table' ? (
              <WorkOrderDataTable workOrders={filteredWorkOrders} technicians={technicians || []} locations={locations || []} onEdit={(wo) => { setEditingWorkOrder(wo); setIsDialogOpen(true); }} onDelete={handleDelete} onUpdateWorkOrder={handleUpdateWorkOrder} />
            ) : (
              <WorkOrderKanban workOrders={filteredWorkOrders} groupBy={groupByField} columns={kanbanColumns} onUpdateWorkOrder={handleUpdateWorkOrder} technicians={technicians || []} locations={locations || []} />
            )
          )}
        </Card>

        {isDialogOpen && <WorkOrderFormDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} onSave={handleSave} workOrder={editingWorkOrder} technicians={technicians || []} locations={locations || []} />}
      </Space>
      {onHoldWorkOrder && <OnHoldReasonDialog isOpen={!!onHoldWorkOrder} onClose={() => setOnHoldWorkOrder(null)} onSave={handleSaveOnHoldReason} />}
    </>
  );
};

export default WorkOrdersPage;