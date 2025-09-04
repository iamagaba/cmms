import { technicians, locations, WorkOrder } from "../data/mockData";
import WorkOrderCard from "./WorkOrderCard";
import { Row, Col, Typography, Tag } from "antd";

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
}

const WorkOrderKanban = ({ workOrders, groupBy, columns }: WorkOrderKanbanProps) => {
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
    <Row gutter={[16, 16]}>
      {columns.map(column => {
        const columnOrders = getColumnOrders(column.id);
        const columnColor = getColumnColor(column);
        return (
            <Col key={column.id || 'unassigned'} xs={24} sm={12} md={8} lg={6}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, borderBottom: `2px solid ${columnColor}`, paddingBottom: 8 }}>
                    <Title level={5} style={{ margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{column.title}</Title>
                    <Tag color={columnColor}>{columnOrders.length}</Tag>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: 'calc(100vh - 32rem)', overflowY: 'auto', paddingRight: 8 }}>
                    {columnOrders.map(order => {
                    const technician = technicians.find(t => t.id === order.assignedTechnicianId);
                    const location = locations.find(l => l.id === order.locationId);
                    return <WorkOrderCard key={order.id} order={order} technician={technician} location={location} />;
                    })}
                </div>
            </Col>
        )
      })}
    </Row>
  );
};

export default WorkOrderKanban;