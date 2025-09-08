import { Card, Tag, Avatar, Typography, Tooltip, theme, Space, Dropdown, Menu } from "antd";
import { WorkOrder, Technician, Vehicle } from "@/types/supabase";
import SlaCountdown from "./SlaCountdown";
import { EllipsisOutlined } from "@ant-design/icons";

const { Text, Title, Paragraph } = Typography;
const { useToken } = theme;

interface WorkOrderCardProps {
  order: WorkOrder;
  technician: Technician | undefined;
  vehicle: Vehicle | undefined;
  onUpdateWorkOrder: (id: string, updates: Partial<WorkOrder>) => void;
  onViewDetails: () => void;
}

const WorkOrderCard = ({ order, technician, vehicle, onUpdateWorkOrder, onViewDetails }: WorkOrderCardProps) => {
  const { token } = useToken();

  const priorityColors: Record<string, string> = { High: token.colorError, Medium: token.colorWarning, Low: token.colorSuccess };
  const statusColors: Record<string, string> = { 
    Open: token.colorInfo,
    "Confirmation": token.cyan6,
    "Ready": token.colorTextSecondary,
    "In Progress": token.colorWarning,
    "On Hold": token.orange6,
    Completed: token.colorSuccess
  };

  const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

  const statusMenu = (
    <Menu onClick={({ key }) => onUpdateWorkOrder(order.id, { status: key as WorkOrder['status'] })}>
      <Menu.Item key="Open"><Tag color={statusColors["Open"]}>Open</Tag></Menu.Item>
      <Menu.Item key="Confirmation"><Tag color={statusColors["Confirmation"]}>Confirmation</Tag></Menu.Item>
      <Menu.Item key="Ready"><Tag color={statusColors["Ready"]}>Ready</Tag></Menu.Item>
      <Menu.Item key="In Progress"><Tag color={statusColors["In Progress"]}>In Progress</Tag></Menu.Item>
      <Menu.Item key="On Hold"><Tag color={statusColors["On Hold"]}>On Hold</Tag></Menu.Item>
      <Menu.Item key="Completed"><Tag color={statusColors["Completed"]}>Completed</Tag></Menu.Item>
    </Menu>
  );

  const priorityMenu = (
    <Menu onClick={({ key }) => onUpdateWorkOrder(order.id, { priority: key as WorkOrder['priority'] })}>
      <Menu.Item key="High"><Tag color={priorityColors["High"]}>High</Tag></Menu.Item>
      <Menu.Item key="Medium"><Tag color={priorityColors["Medium"]}>Medium</Tag></Menu.Item>
      <Menu.Item key="Low"><Tag color={priorityColors["Low"]}>Low</Tag></Menu.Item>
    </Menu>
  );

  return (
    <Card 
      hoverable 
      className="lift-on-hover"
      style={{ cursor: 'pointer' }}
      bodyStyle={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}
      onClick={onViewDetails}
    >
      {/* Header: ID and SLA */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text code>{order.workOrderNumber}</Text>
        <SlaCountdown slaDue={order.slaDue} status={order.status} completedAt={order.completedAt} />
      </div>

      {/* Body: Vehicle and Service */}
      <div>
        <Title level={5} style={{ margin: 0, lineHeight: 1.3, fontSize: '15px' }}>
          {vehicle ? `${vehicle.make} ${vehicle.model}` : 'N/A'}
        </Title>
        <Paragraph 
          style={{ fontSize: '13px', margin: '4px 0 0 0' }}
          ellipsis={{ rows: 2, tooltip: order.service }}
          type="secondary"
        >
          {order.service}
        </Paragraph>
      </div>

      {/* Footer: Tags and Assignee */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
        <Space size="small" onClick={stopPropagation}>
          <Dropdown overlay={priorityMenu} trigger={['click']}>
            <Tag color={priorityColors[order.priority || 'Low']} style={{ cursor: 'pointer' }}>
              {order.priority}
            </Tag>
          </Dropdown>
          <Dropdown overlay={statusMenu} trigger={['click']}>
            <Tag color={statusColors[order.status || 'Open']} style={{ cursor: 'pointer' }}>
              {order.status}
            </Tag>
          </Dropdown>
        </Space>
        <Tooltip title={technician ? `Assigned to ${technician.name}` : 'Unassigned'}>
          <Avatar size={28} src={technician?.avatar || undefined}>
            {technician ? technician.name.split(' ').map(n => n[0]).join('') : '?'}
          </Avatar>
        </Tooltip>
      </div>
    </Card>
  );
};

export default WorkOrderCard;