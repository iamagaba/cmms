import { Card, Tag, Avatar, Typography, Select, Tooltip } from "antd";
import { EnvironmentOutlined, MessageOutlined } from "@ant-design/icons";
import { WorkOrder, Technician, Location } from "@/types/supabase";
import { useNavigate } from "react-router-dom";
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

const priorityColors: Record<string, string> = { High: "#FF4D4F", Medium: "#FAAD14", Low: "#52c41a" };
const priorityBorderColors: Record<string, string> = { High: "#FF4D4F", Medium: "#FAAD14", Low: "transparent" };
const statusColors: Record<string, string> = { 
  Open: '#0052CC', // Professional Blue
  "Confirmation": "#13C2C2", // Cyan
  "Ready": "#595959", // Dark Gray
  "In Progress": "#FAAD14", // Amber
  "On Hold": "#FA8C16", // Orange
  Completed: '#22C55E' // Green
};

const WorkOrderCard = ({ order, technician, location, allTechnicians, onUpdateWorkOrder }: WorkOrderCardProps) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/work-orders/${order.id}`);
  };

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Card 
      hoverable 
      className="lift-on-hover"
      style={{ borderLeft: `4px solid ${priorityBorderColors[order.priority || 'Low']}`, cursor: 'pointer' }}
      bodyStyle={{ padding: 12 }}
      onClick={handleCardClick}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <Title level={5} style={{ margin: 0 }}>
            {order.vehicleId}
          </Title>
          <Text type="secondary">{order.customerName} • {order.vehicleModel}</Text>
        </div>
        <div onClick={stopPropagation}>
          <Select value={order.priority} onChange={(value) => onUpdateWorkOrder(order.id, { priority: value })} style={{ width: 90 }} bordered={false} size="small" dropdownMatchSelectWidth={false} suffixIcon={null}>
            <Option value="High"><Tag color={priorityColors["High"]}>High</Tag></Option>
            <Option value="Medium"><Tag color={priorityColors["Medium"]}>Medium</Tag></Option>
            <Option value="Low"><Tag color={priorityColors["Low"]}>Low</Tag></Option>
          </Select>
        </div>
      </div>
      <Text style={{ display: 'block', marginBottom: 12 }}>{order.service}</Text>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <EnvironmentOutlined />
          <Text type="secondary" style={{ fontSize: 12 }}>{location?.name?.replace(' Service Center', '')}</Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <SlaCountdown slaDue={order.slaDue} status={order.status} completedAt={order.completedAt} />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div onClick={stopPropagation}>
          <Select value={order.assignedTechnicianId} onChange={(value) => onUpdateWorkOrder(order.id, { assignedTechnicianId: value })} style={{ width: 150 }} bordered={false} allowClear placeholder="Unassigned" size="small" dropdownMatchSelectWidth={false} suffixIcon={null}>
            {allTechnicians.map(tech => (
              <Option key={tech.id} value={tech.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Avatar size="small" src={tech.avatar || undefined}>{tech.name.split(' ').map(n => n[0]).join('')}</Avatar>
                  <Text>{tech.name}</Text>
                </div>
              </Option>
            ))}
          </Select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={stopPropagation}>
          {order.status === 'On Hold' && order.onHoldReason && (
            <Tooltip title={`On Hold: ${order.onHoldReason}`}><MessageOutlined style={{ color: 'orange', cursor: 'pointer' }} /></Tooltip>
          )}
          <Select value={order.status} onChange={(value) => onUpdateWorkOrder(order.id, { status: value })} style={{ width: 150 }} bordered={false} size="small" dropdownMatchSelectWidth={false} suffixIcon={null}>
            <Option value="Open"><Tag color={statusColors["Open"]}>Open</Tag></Option>
            <Option value="Confirmation"><Tag color={statusColors["Confirmation"]}>Confirmation</Tag></Option>
            <Option value="Ready"><Tag color={statusColors["Ready"]}>Ready</Tag></Option>
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