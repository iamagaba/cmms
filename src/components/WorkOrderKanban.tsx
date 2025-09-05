import { technicians, locations, WorkOrder } from "../data/mockData";
import WorkOrderCard from "./WorkOrderCard";
import { Row, Col, Typography, Tag, Space } from "antd";

const { Title } = Typography;

const statusColors: { [key: string]: string } = {
  Open: "blue",
  "In Progress": "gold",
  "On Hold": "orange",
  Completed: "green",
};

const priorityColors: { [key: string]: string } = {
    High: "red",
    Medium: "gold",
    Low: "green",
};

interface KanbanColumn {
    id: string | null;
    title: string;
}

interface WorkOrderKanbanProps {
    workOrders: WorkOrder[];
    groupBy: 'status' | 'priority' | 'assignedTechnicianId';
    columns: KanbanColumn[];
    onUpdateWorkOrder: (id: string, field: keyof WorkOrder, value: any) => void;
}

const WorkOrderKanban = ({ workOrders, groupBy, columns, onUpdateWorkOrder }: WorkOrderKanbanProps) => {
  const getColumnOrders = (columnId: string | null) => {
    return workOrders.filter(order => order[groupBy as keyof WorkOrder] === columnId);
  };

  const getColumnColor = (column: KanbanColumn) => {
    if (groupBy === 'status') {
        return statusColors[column.id as string] || 'default';
    }
    if (groupBy === 'priority') {
        return priorityColors[column.id as string] || 'default';
    }
    return '#1677ff'; // Default primary color for other groupings
  }

  return (
    <Row gutter={[16, 16]} wrap={false} className="hide-scrollbar" style={{ width: '100%', overflowX: 'auto', paddingBottom: '16px' }}>
      {columns.map(column => {
        const columnOrders = getColumnOrders(column.id);
        const columnColor = getColumnColor(column);
        return (
            <Col key={column.id || 'unassigned'} flex="0 0 320px">
                <div style={{ backgroundColor: '#f5f5f5', borderRadius: '8px', height: '100%' }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #e8e8e8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Space>
                            <div style={{ width: '4px', height: '16px', backgroundColor: columnColor, borderRadius: '2px' }} />
                            <Title level={5} style={{ margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{column.title}</Title>
                        </Space>
                        <Tag color="default">{columnOrders.length}</Tag>
                    </div>
                    <div className="hide-scrollbar" style={{ height: 'calc(100vh - 29rem)', overflowY: 'auto', padding: '16px' }}>
                        <Space direction="vertical" style={{ width: '100%' }} size="middle">
                            {columnOrders.map(order => {
                                const technician = technicians.find(t => t.id === order.assignedTechnicianId);
                                const location = locations.find(l => l.id === order.locationId);
                                return <WorkOrderCard key={order.id} order={order} technician={technician} location={location} onUpdateWorkOrder={onUpdateWorkOrder} />;
                            })}
                        </Space>
                    </div>
                </div>
            </Col>
        )
      })}
    </Row>
  );
};

export default WorkOrderKanban;