import { Card, Tag, Avatar, Typography, Select, Tooltip } from "antd";
import { EnvironmentOutlined, MessageOutlined } from "@ant-design/icons";
import { WorkOrder, Technician, Location } from "@/types/supabase";
import { Link } from "react-router-dom";
import SlaCountdown from "./SlaCountdown";

const { Text, Title } = Typography;
const { Option } = Select;

interface WorkOrderCardProps {
  order: WorkOrder;
  technician: Technician | undefined;
  location: Location | undefined;
  allTechnicians: Technician[];
  onUpdateWorkOrder: (id: string, updates: Partial<WorkOrder>) => void;
}

const priorityColors: Record<string, string> = { High: "red", Medium: "gold", Low: "green" };
const priorityBorderColors: Record<string, string> = { High: "red", Medium: "gold", Low: "transparent" };
const statusColors: Record<string, string> = { Open: "blue", "Pending Confirmation": "cyan", "Confirmed & Ready": "purple", "In Progress": "gold", "On Hold": "orange", Completed: "green" };

const WorkOrderCard = ({ order, technician, location, allTechnicians, onUpdateWorkOrder }: WorkOrderCardProps) => {
  return (
    <Card 
      hoverable 
      className="lift-on-hover"
      style={{ borderLeft: `4px solid ${priorityBorderColors[order.priority || 'Low']}` }}
      bodyStyle={{ padding: 16 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <Title level={5} style={{ margin: 0 }}>
            <Link to={`/work-orders/${order.id}`}>{order.vehicleId}</Link>
          </Title>
          <Text type="secondary">{order.customerName} • {order.vehicleModel}</Text>
        </div>
        <Select value={order.priority} onChange={(value) => onUpdateWorkOrder(order.id, { priority: value })} style={{ width: 90 }} bordered={false} size="small" dropdownMatchSelectWidth={false}>
          <Option value="High"><Tag color={priorityColors["High"]}>High</Tag></Option>
          <Option value="Medium"><Tag color={priorityColors["Medium"]}>Medium</Tag></Option>
          <Option value="Low"><Tag color={priorityColors["Low"]}>Low</Tag></Option>
        </Select>
      </div>
      <Text style={{ display: 'block', marginBottom: 12 }}>{order.service}</Text>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <EnvironmentOutlined />
          <Text type="secondary" style={{ fontSize: 12 }}>{location?.name}</Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <SlaCountdown slaDue={order.slaDue} status={order.status} completedAt={order.completedAt} />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Select value={order.assignedTechnicianId} onChange={(value) => onUpdateWorkOrder(order.id, { assignedTechnicianId: value })} style={{ width: 150 }} bordered={false} allowClear placeholder="Unassigned" size="small" dropdownMatchSelectWidth={false}>
          {allTechnicians.map(tech => (
            <Option key={tech.id} value={tech.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Avatar size="small" src={tech.avatar || undefined}>{tech.name.split(' ').map(n => n[0]).join('')}</Avatar>
                <Text>{tech.name}</Text>
              </div>
            </Option>
          ))}
        </Select>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {order.status === 'On Hold' && order.onHoldReason && (
            <Tooltip title={`On Hold: ${order.onHoldReason}`}><MessageOutlined style={{ color: 'orange', cursor: 'pointer' }} /></Tooltip>
          )}
          <Select value={order.status} onChange={(value) => onUpdateWorkOrder(order.id, { status: value })} style={{ width: 150 }} bordered={false} size="small" dropdownMatchSelectWidth={false}>
            <Option value="Open"><Tag color={statusColors["Open"]}>Open</Tag></Option>
            <Option value="Pending Confirmation"><Tag color={statusColors["Pending Confirmation"]}>Pending Confirmation</Tag></Option>
            <Option value="Confirmed & Ready"><Tag color={statusColors["Confirmed & Ready"]}>Confirmed & Ready</Tag></Option>
            <Option value="In Progress"><Tag color={statusColors["In Progress"]}>In Progress</Tag></Option>
            <Option value="On Hold"><Tag color={statusColors["On Hold"]}>On Hold</Tag></Option>
            <Option value="Completed"><Tag color={statusColors["Completed"]}>Completed</Tag></Option>
          </Select>
        </div>
      </div>
    </Card>
  );
};

export default WorkOrderCard;