import { WorkOrder, Technician, Location } from "@/types/supabase";
import WorkOrderCard from "./WorkOrderCard";
import { Row, Col, Typography, Tag, Space } from "antd";

const { Title } = Typography;

const statusColors: { [key: string]: string } = { 
  Open: '#0052CC', // Professional Blue
  "Pending Confirmation": "#13C2C2", // Cyan
  "Confirmed & Ready": "#595959", // Dark Gray
  "In Progress": "#FAAD14", // Amber
  "On Hold": "#FA8C16", // Orange
  Completed: '#22C55E' // Green
};
const priorityColors: { [key: string]: string } = { High: "#FF4D4F", Medium: "#FAAD14", Low: "#52c41a" };

interface KanbanColumn {
    id: string | null;
    title: string;
}

interface WorkOrderKanbanProps {
    workOrders: WorkOrder[];
    technicians: Technician[];
    locations: Location[];
    groupBy: 'status' | 'priority' | 'assignedTechnicianId';
    columns: KanbanColumn[];
    onUpdateWorkOrder: (id: string, updates: Partial<WorkOrder>) => void;
}

const WorkOrderKanban = ({ workOrders, technicians, locations, groupBy, columns, onUpdateWorkOrder }: WorkOrderKanbanProps) => {
  const getColumnOrders = (columnId: string | null) => {
    return workOrders.filter(order => (order as any)[groupBy] === columnId);
  };

  const getColumnColor = (column: KanbanColumn) => {
    if (groupBy === 'status') return statusColors[column.id as string] || 'default';
    if (groupBy === 'priority') return priorityColors[column.id as string] || 'default';
    return '#6A0DAD'; // Use GOGO Brand Purple for technician grouping
  }

  return (
    <Row gutter={[12, 12]} wrap={false} className="hide-scrollbar" style={{ width: '100%', overflowX: 'auto', paddingBottom: '12px' }}>
      {columns.map(column => {
        const columnOrders = getColumnOrders(column.id);
        const columnColor = getColumnColor(column);
        return (
            <Col key={column.id || 'unassigned'} flex="0 0 300px">
                <div style={{ backgroundColor: '#f5f5f5', borderRadius: '8px', height: '100%' }}>
                    <div style={{ padding: '8px 12px', borderBottom: '1px solid #e8e8e8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Space>
                            <div style={{ width: '4px', height: '14px', backgroundColor: columnColor, borderRadius: '2px' }} />
                            <Title level={5} style={{ margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{column.title}</Title>
                        </Space>
                        <Tag color="default">{columnOrders.length}</Tag>
                    </div>
                    <div className="hide-scrollbar" style={{ height: 'calc(100vh - 20rem)', overflowY: 'auto', padding: '12px' }}>
                        <Space direction="vertical" style={{ width: '100%' }} size="small">
                            {columnOrders.map(order => {
                                const technician = technicians.find(t => t.id === order.assignedTechnicianId);
                                const location = locations.find(l => l.id === order.locationId);
                                return <WorkOrderCard key={order.id} order={order} technician={technician} location={location} onUpdateWorkOrder={onUpdateWorkOrder} allTechnicians={technicians} />;
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