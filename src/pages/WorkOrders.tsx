import { useState, useMemo } from "react";
import { Button, Typography, Space, Segmented, Input, Select, Card, Row, Col, Collapse } from "antd";
import { PlusOutlined, AppstoreOutlined, TableOutlined, FilterOutlined } from "@ant-design/icons";
import { workOrders, technicians, locations, WorkOrder } from "@/data/mockData";
import { WorkOrderDataTable } from "@/components/WorkOrderDataTable";
import { WorkOrderFormDialog } from "@/components/WorkOrderFormDialog";
import WorkOrderKanban from "@/components/WorkOrderKanban";
import { showSuccess } from "@/utils/toast";

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;
const { Panel } = Collapse;

type GroupByOption = 'status' | 'priority' | 'technician';

const WorkOrdersPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [allWorkOrders, setAllWorkOrders] = useState(workOrders);
  const [view, setView] = useState<'table' | 'kanban'>('table');
  const [groupBy, setGroupBy] = useState<GroupByOption>('status');

  // Filter states
  const [vehicleFilter, setVehicleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [priorityFilter, setPriorityFilter] = useState<string | undefined>(undefined);
  const [technicianFilter, setTechnicianFilter] = useState<string | undefined>(undefined);

  const handleSave = (workOrderData: WorkOrder) => {
    const exists = allWorkOrders.some(wo => wo.id === workOrderData.id);
    if (exists) {
      setAllWorkOrders(allWorkOrders.map(wo => wo.id === workOrderData.id ? workOrderData : wo));
    } else {
      setAllWorkOrders([workOrderData, ...allWorkOrders]);
    }
    showSuccess(`Work order ${workOrderData.id} has been saved.`);
  };

  const handleDelete = (workOrderData: WorkOrder) => {
    setAllWorkOrders(allWorkOrders.filter(wo => wo.id !== workOrderData.id));
    showSuccess(`Work order ${workOrderData.id} has been deleted.`);
  };

  const handleUpdateWorkOrder = (id: string, field: keyof WorkOrder, value: any) => {
    setAllWorkOrders(prevOrders => 
      prevOrders.map(wo => 
        wo.id === id ? { ...wo, [field]: value } : wo
      )
    );
    showSuccess(`Work order ${id} ${String(field)} updated.`);
  };

  const filteredWorkOrders = allWorkOrders.filter(wo => {
    const vehicleMatch = wo.vehicleId.toLowerCase().includes(vehicleFilter.toLowerCase());
    const statusMatch = statusFilter ? wo.status === statusFilter : true;
    const priorityMatch = priorityFilter ? wo.priority === priorityFilter : true;
    const technicianMatch = technicianFilter ? wo.assignedTechnicianId === technicianFilter : true;
    return vehicleMatch && statusMatch && priorityMatch && technicianMatch;
  });

  const kanbanColumns = useMemo(() => {
    switch (groupBy) {
      case 'priority':
        return [
          { id: 'High', title: 'High' },
          { id: 'Medium', title: 'Medium' },
          { id: 'Low', title: 'Low' },
        ];
      case 'technician':
        return [
          { id: null, title: 'Unassigned' },
          ...technicians.map(t => ({ id: t.id, title: t.name })),
        ];
      case 'status':
      default:
        return [
          { id: 'Open', title: 'Open' },
          { id: 'In Progress', title: 'In Progress' },
          { id: 'On Hold', title: 'On Hold' },
          { id: 'Completed', title: 'Completed' },
        ];
    }
  }, [groupBy]);

  const groupByField = useMemo(() => {
    if (groupBy === 'technician') return 'assignedTechnicianId';
    return groupBy;
  }, [groupBy]);

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Row justify="space-between" align="middle">
        <Col>
          <Title level={4} style={{ margin: 0 }}>Work Order Management</Title>
        </Col>
        <Col>
          <Space size="middle">
            <Segmented
              options={[
                { label: 'Table', value: 'table', icon: <TableOutlined /> },
                { label: 'Board', value: 'kanban', icon: <AppstoreOutlined /> },
              ]}
              value={view}
              onChange={(value) => setView(value as 'table' | 'kanban')}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsDialogOpen(true)}>
              Add Work Order
            </Button>
          </Space>
        </Col>
      </Row>
      
      <Collapse>
        <Panel header={<><FilterOutlined /> Filters & View Options</>} key="1">
          <Row gutter={[16, 16]} align="bottom">
            <Col xs={24} sm={12} md={6}>
              <Search
                placeholder="Filter by Vehicle ID..."
                allowClear
                onSearch={setVehicleFilter}
                onChange={(e) => setVehicleFilter(e.target.value)}
                style={{ width: '100%' }}
              />
            </Col>
            <Col xs={24} sm={12} md={5}>
              <Select
                placeholder="Filter by Status"
                allowClear
                style={{ width: '100%' }}
                onChange={setStatusFilter}
                value={statusFilter}
              >
                <Option value="Open">Open</Option>
                <Option value="In Progress">In Progress</Option>
                <Option value="On Hold">On Hold</Option>
                <Option value="Completed">Completed</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={5}>
              <Select
                placeholder="Filter by Priority"
                allowClear
                style={{ width: '100%' }}
                onChange={setPriorityFilter}
                value={priorityFilter}
              >
                <Option value="High">High</Option>
                <Option value="Medium">Medium</Option>
                <Option value="Low">Low</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={5}>
              <Select
                placeholder="Filter by Technician"
                allowClear
                style={{ width: '100%' }}
                onChange={setTechnicianFilter}
                value={technicianFilter}
              >
                {technicians.map(t => <Option key={t.id} value={t.id}>{t.name}</Option>)}
              </Select>
            </Col>
            {view === 'kanban' && (
              <Col xs={24} sm={12} md={3}>
                <Select
                  value={groupBy}
                  onChange={(value) => setGroupBy(value as GroupByOption)}
                  style={{ width: '100%' }}
                >
                  <Option value="status">Group by: Status</Option>
                  <Option value="priority">Group by: Priority</Option>
                  <Option value="technician">Group by: Technician</Option>
                </Select>
              </Col>
            )}
          </Row>
        </Panel>
      </Collapse>

      <Card bordered={false} bodyStyle={{ padding: view === 'kanban' ? '1' : '0' }}>
        {view === 'table' ? (
          <WorkOrderDataTable 
            workOrders={filteredWorkOrders} 
            technicians={technicians} 
            locations={locations} 
            onSave={handleSave}
            onDelete={handleDelete}
            onUpdateWorkOrder={handleUpdateWorkOrder}
          />
        ) : (
          <WorkOrderKanban 
            workOrders={filteredWorkOrders} 
            groupBy={groupByField}
            columns={kanbanColumns}
            onUpdateWorkOrder={handleUpdateWorkOrder}
          />
        )}
      </Card>

      {isDialogOpen && (
        <WorkOrderFormDialog 
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSave={handleSave}
          workOrder={null}
        />
      )}
    </Space>
  );
};

export default WorkOrdersPage;