import { WorkOrder, Technician, Location, Customer, Vehicle } from "@/types/supabase";
import WorkOrderCard from "./WorkOrderCard";
import { Row, Col, Typography, Space, theme } from "antd";
import "./WorkOrderKanban.css";

const { Title } = Typography;
const { useToken } = theme;

interface KanbanColumn {
    id: string | null;
    title: string;
}

interface WorkOrderKanbanProps {
    workOrders: WorkOrder[];
    technicians: Technician[];
    locations: Location[];
    customers: Customer[];
    vehicles: Vehicle[];
    groupBy: 'status' | 'priority' | 'assignedTechnicianId';
    columns: KanbanColumn[];
    onUpdateWorkOrder: (id: string, updates: Partial<WorkOrder>) => void;
    onViewDetails: (workOrderId: string) => void;
}

const WorkOrderKanban = ({ workOrders, technicians, locations, customers: _customers, vehicles, groupBy, columns, onUpdateWorkOrder: _onUpdateWorkOrder, onViewDetails }: WorkOrderKanbanProps) => {
  const { token } = useToken();

  const statusColors: { [key: string]: string } = { 
    Open: token.colorInfo,
    "Confirmation": token.cyan6,
    "Ready": token.colorTextSecondary,
    "In Progress": token.colorWarning,
    "On Hold": token.orange6,
    Completed: token.colorSuccess
  };
  const priorityColors: { [key: string]: string } = { High: token.colorError, Medium: token.colorWarning, Low: token.colorSuccess };

  const getColumnOrders = (columnId: string | null) => {
    return workOrders.filter(order => (order as any)[groupBy] === columnId);
  };

  const getColumnColor = (column: KanbanColumn) => {
    if (groupBy === 'status') return statusColors[column.id as string] || 'default';
    if (groupBy === 'priority') return priorityColors[column.id as string] || 'default';
    return token.colorPrimary;
  }

  // const custMap = new Map(_customers.map(c => [c.id, c]));
  const vehMap = new Map(vehicles.map(v => [v.id, v]));

  return (
  <Row gutter={[8, 8]} wrap={false} className="kanban-board hide-scrollbar" style={{ minHeight: '60vh', background: 'transparent' }}>
      {columns.map(column => {
        const columnOrders = getColumnOrders(column.id);
        const columnColor = getColumnColor(column);
        return (
            <Col key={column.id || 'unassigned'} className="kanban-column">
        <div style={{ 
          backgroundColor: 'transparent',
          borderRadius: 8,
          boxShadow: 'none',
          border: `1px solid ${token.colorBorder}`,
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}>
          <div className="kanban-column-header" style={{ padding: '8px 8px 4px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Space size={6} align="center">
              <div style={{ width: '2px', height: '16px', backgroundColor: columnColor, borderRadius: '1px' }} />
              <Title level={5} style={{ margin: 0, fontWeight: 500, fontSize: 15 }}>{column.title}</Title>
            </Space>
            <span style={{ minWidth: 22, height: 22, borderRadius: 11, background: token.colorFillTertiary, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 500, color: token.colorTextTertiary, marginLeft: 4 }}>{columnOrders.length}</span>
          </div>
          <div className="kanban-column-content hide-scrollbar" style={{ padding: 4 }}>
            <Space direction="vertical" style={{ width: '100%' }} size={4}>
                            {columnOrders.map(order => {
                                const technician = technicians.find(t => t.id === order.assignedTechnicianId);
                                const vehicle: Vehicle | undefined = order.vehicleId ? vehMap.get(order.vehicleId) : undefined;
                                const location = order.locationId ? locations.find(l => l.id === order.locationId) : undefined;
                                return <WorkOrderCard key={order.id} order={order} technician={technician} vehicle={vehicle} location={location} onViewDetails={() => onViewDetails(order.id)} />;
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
