import { Card, Tag, Avatar, Typography, Select, Tooltip, theme, Space } from "antd";
import { EnvironmentOutlined, MessageOutlined } from "@ant-design/icons";
import { WorkOrder, Technician, Location, Customer, Vehicle } from "@/types/supabase";
import SlaCountdown from "./SlaCountdown";

const { Text, Title } = Typography;
const { Option } = Select;
const { useToken } = theme;

interface WorkOrderCardProps {
  order: WorkOrder;
  technician: Technician | undefined;
  location: Location | undefined;
  customer: Customer | undefined;
  vehicle: Vehicle | undefined;
  allTechnicians: Technician[];
  onUpdateWorkOrder: (id: string, updates: Partial<WorkOrder>) => void;
  onViewDetails: () => void;
}

const WorkOrderCard = ({ order, technician, location, customer, vehicle, allTechnicians, onUpdateWorkOrder, onViewDetails }: WorkOrderCardProps) => {
  const { token } = useToken();

  const priorityColors: Record<string, string> = { High: token.colorError, Medium: token.colorWarning, Low: token.colorSuccess };
  const priorityBorderColors: Record<string, string> = { High: token.colorError, Medium: token.colorWarning, Low: token.colorBorderSecondary }; // Use a subtle border for low priority
  const statusColors: Record<string, string> = { 
    Open: token.colorInfo,
    "Confirmation": token.cyan6,
    "Ready": token.colorTextSecondary,
    "In Progress": token.colorWarning,
    "On Hold": token.orange6,
    Completed: token.colorSuccess
  };

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Card 
      hoverable 
      className="lift-on-hover"
      style={{ 
        borderLeft: `4px solid ${priorityBorderColors[order.priority || 'Low']}`, 
        cursor: 'pointer',
        borderRadius: token.borderRadiusSM,
        padding: 0, // Remove default card padding to control it with inner Space
      }}
      bodyStyle={{ padding: 12 }}
      onClick={onViewDetails}
    >
      <Space direction="vertical" size={8} style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Title level={5} style={{ margin: 0, lineHeight: 1.2 }}>
              {vehicle ? `${vehicle.make} ${vehicle.model}` : 'N/A'}
            </Title>
            <Text type="secondary" style={{ fontSize: '12px' }}>{customer?.name || 'N/A'} • {vehicle?.year || ''}</Text>
          </div>
          <div onClick={stopPropagation}>
            <Select value={order.priority} onChange={(value) => onUpdateWorkOrder(order.id, { priority: value })} style={{ width: 90 }} bordered={false} size="small" dropdownMatchSelectWidth={false} suffixIcon={null}>
              <Option value="High"><Tag color={priorityColors["High"]}>High</Tag></Option>
              <Option value="Medium"><Tag color={priorityColors["Medium"]}>Medium</Tag></Option>
              <Option value="Low"><Tag color={priorityColors["Low"]}>Low</Tag></Option>
            </Select>
          </div>
        </div>

        <Text style={{ display: 'block', fontSize: '13px' }}>{order.service}</Text>

        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          <Space size={4} align="center">
            <EnvironmentOutlined style={{ color: token.colorTextSecondary }} />
            <Text type="secondary" style={{ fontSize: 12 }}>{location?.name?.replace(' Service Center', '') || 'N/A'}</Text>
          </Space>
          <SlaCountdown slaDue={order.slaDue} status={order.status} completedAt={order.completedAt} />
        </Space>

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
          <Space size={4} onClick={stopPropagation}>
            {order.status === 'On Hold' && order.onHoldReason && (
              <Tooltip title={`On Hold: ${order.onHoldReason}`}><MessageOutlined style={{ color: token.colorWarning, cursor: 'pointer' }} /></Tooltip>
            )}
            <Select value={order.status} onChange={(value) => onUpdateWorkOrder(order.id, { status: value })} style={{ width: 150 }} bordered={false} size="small" dropdownMatchSelectWidth={false} suffixIcon={null}>
              <Option value="Open"><Tag color={statusColors["Open"]}>Open</Tag></Option>
              <Option value="Confirmation"><Tag color={statusColors["Confirmation"]}>Confirmation</Tag></Option>
              <Option value="Ready"><Tag color={statusColors["Ready"]}>Ready</Tag></Option>
              <Option value="In Progress"><Tag color={statusColors["In Progress"]}>In Progress</Tag></Option>
              <Option value="On Hold"><Tag color={statusColors["On Hold"]}>On Hold</Tag></Option>
              <Option value="Completed"><Tag color={statusColors["Completed"]}>Completed</Tag></Option>
            </Select>
          </Space>
        </div>
      </Space>
    </Card>
  );
};

export default WorkOrderCard;