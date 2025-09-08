import { Card, Tag, Avatar, Typography, Select, Tooltip, theme, Space } from "antd";
import { EnvironmentOutlined, MessageOutlined } from "@ant-design/icons";
import { WorkOrder, Technician, Location, Customer, Vehicle } from "@/types/supabase";
import SlaCountdown from "./SlaCountdown";

const { Text, Title, Paragraph } = Typography;
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
  const priorityBorderColors: Record<string, string> = { High: token.colorError, Medium: token.colorWarning, Low: token.colorBorderSecondary };
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
      }}
      bodyStyle={{ padding: '10px 12px' }}
      onClick={onViewDetails}
    >
      <Space direction="vertical" size={8} style={{ width: '100%' }}>
        {/* Row 1: Title & Priority */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Title level={5} style={{ margin: 0, lineHeight: 1.3, fontSize: '14px' }}>
              {vehicle ? `${vehicle.make} ${vehicle.model}` : 'N/A'}
            </Title>
            <Text type="secondary" style={{ fontSize: '12px' }}>{customer?.name || 'N/A'}</Text>
          </div>
          <div onClick={stopPropagation}>
            <Select 
              value={order.priority} 
              onChange={(value) => onUpdateWorkOrder(order.id, { priority: value })} 
              style={{ width: 80 }}
              bordered={false} 
              size="small" 
              dropdownMatchSelectWidth={false} 
              suffixIcon={null}
              className="kanban-card-select"
            >
              <Option value="High"><Tag color={priorityColors["High"]}>High</Tag></Option>
              <Option value="Medium"><Tag color={priorityColors["Medium"]}>Medium</Tag></Option>
              <Option value="Low"><Tag color={priorityColors["Low"]}>Low</Tag></Option>
            </Select>
          </div>
        </div>

        {/* Row 2: Service */}
        <Paragraph style={{ fontSize: '12px', margin: 0 }} ellipsis={{ rows: 2, tooltip: order.service }}>
          {order.service}
        </Paragraph>

        {/* Row 3: Meta & Status */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
          <Space align="center">
            <Tooltip title={technician ? `Assigned to ${technician.name}` : 'Unassigned'}>
              <Avatar size={24} src={technician?.avatar || undefined}>
                {technician ? technician.name.split(' ').map(n => n[0]).join('') : '?'}
              </Avatar>
            </Tooltip>
            <SlaCountdown slaDue={order.slaDue} status={order.status} completedAt={order.completedAt} />
          </Space>
          
          <Space size={4} onClick={stopPropagation}>
            {order.status === 'On Hold' && order.onHoldReason && (
              <Tooltip title={`On Hold: ${order.onHoldReason}`}><MessageOutlined style={{ color: token.colorWarning, cursor: 'pointer' }} /></Tooltip>
            )}
            <Select 
              value={order.status} 
              onChange={(value) => onUpdateWorkOrder(order.id, { status: value })} 
              style={{ width: 120 }}
              bordered={false} 
              size="small" 
              dropdownMatchSelectWidth={false} 
              suffixIcon={null}
              className="kanban-card-select"
            >
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