import { WorkOrder, Technician, Location, Customer, Vehicle } from "@/types/supabase";
import WorkOrderCard from "./WorkOrderCard";
import { Row, Col, Typography, Tag, Space, theme } from "antd";

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

const WorkOrderKanban = ({ workOrders, technicians, locations, customers, vehicles, groupBy, columns, onUpdateWorkOrder, onViewDetails }: WorkOrderKanbanProps) => {
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

  const custMap = new Map(customers.map(c => [c.id, c]));
  const vehMap = new Map(vehicles.map(v => [v.id, v]));

  return (
    <Row gutter={[16, 16]} wrap={false} className="hide-scrollbar" style={{ width: '100%', overflowX: 'auto', paddingBottom: '16px' }}>
      {columns.map(column => {
        const columnOrders = getColumnOrders(column.id);
        const columnColor = getColumnColor(column);
        return (
            <Col key={column.id || 'unassigned'} flex="0 0 320px">
                <div style={{ backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                    <div style={{ padding: '8px 12px', borderBottom: '1px solid #e8e8e8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Space>
                            <div style={{ width: '4px', height: '16px', backgroundColor: columnColor, borderRadius: '2px' }} />
                            <Title level={5} style={{ margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{column.title}</Title>
                        </Space>
                        <Tag color="default">{columnOrders.length}</Tag>
                    </div>
                    <div className="hide-scrollbar" style={{ padding: '12px' }}>
                        <Space direction="vertical" style={{ width: '100%' }} size="small">
                            {columnOrders.map(order => {
                                const technician = technicians.find(t => t.id === order.assignedTechnicianId);
                                const location = locations.find(l => l.id === order.locationId);
                                const customer = order.customerId ? custMap.get(order.customerId) : undefined;
                                const vehicle = order.vehicleId ? vehMap.get(order.vehicleId) : undefined;
                                return <WorkOrderCard key={order.id} order={order} technician={technician} location={location} customer={customer} vehicle={vehicle} onUpdateWorkOrder={onUpdateWorkOrder} allTechnicians={technicians} onViewDetails={() => onViewDetails(order.id)} />;
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