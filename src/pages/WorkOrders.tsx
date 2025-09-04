import { useState, useMemo } from "react";
import { Button, Typography, Space, Segmented, Input, Select, Card } from "antd";
import { PlusOutlined, AppstoreOutlined, TableOutlined } from "@ant-design/icons";
import { workOrders, technicians, locations, WorkOrder } from "@/data/mockData";
import { WorkOrderDataTable } from "@/components/WorkOrderDataTable";
import { WorkOrderFormDialog } from "@/components/WorkOrderFormDialog";
import WorkOrderKanban from "@/components/WorkOrderKanban";

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

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
  };

  const handleDelete = (workOrderData: WorkOrder) => {
    setAllWorkOrders(allWorkOrders.filter(wo => wo.id !== workOrderData.id));
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={4}>Work Order Management</Title>
        <Space>
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
      </div>
      
      <Card>
        <Space wrap>
          <Search
            placeholder="Filter by Vehicle ID..."
            allowClear
            onSearch={setVehicleFilter}
            onChange={(e) => setVehicleFilter(e.target.value)}
            style={{ width: 200 }}
          />
          <Select
            placeholder="Filter by Status"
            allowClear
            style={{ width: 150 }}
            onChange={setStatusFilter}
            value={statusFilter}
          >
            <Option value="Open">Open</Option>
            <Option value="In Progress">In Progress</Option>
            <Option value="On Hold">On Hold</Option>
            <Option value="Completed">Completed</Option>
          </Select>
          <Select
            placeholder="Filter by Priority"
            allowClear
            style={{ width: 150 }}
            onChange={setPriorityFilter}
            value={priorityFilter}
          >
            <Option value="High">High</Option>
            <Option value="Medium">Medium</Option>
            <Option value="Low">Low</Option>
          </Select>
          <Select
            placeholder="Filter by Technician"
            allowClear
            style={{ width: 200 }}
            onChange={setTechnicianFilter}
            value={technicianFilter}
          >
            {technicians.map(t => <Option key={t.id} value={t.id}>{t.name}</Option>)}
          </Select>
          {view === 'kanban' && (
            <Select
              value={groupBy}
              onChange={(value) => setGroupBy(value as GroupByOption)}
              style={{ width: 180 }}
            >
              <Option value="status">Group by: Status</Option>
              <Option value="priority">Group by: Priority</Option>
              <Option value="technician">Group by: Technician</Option>
            </Select>
          )}
        </Space>
      </Card>

      {view === 'table' ? (
        <WorkOrderDataTable 
          workOrders={filteredWorkOrders} 
          technicians={technicians} 
          locations={locations} 
          onSave={handleSave}
          onDelete={handleDelete}
        />
      ) : (
        <WorkOrderKanban 
            workOrders={filteredWorkOrders} 
            groupBy={groupByField}
            columns={kanbanColumns}
        />
      )}

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