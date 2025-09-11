import { Card, Tag, Avatar, Typography, Tooltip, theme, Space, Dropdown, Menu } from "antd";
import { WorkOrder, Technician, Vehicle } from "@/types/supabase";
import SlaCountdown from "./SlaCountdown";
import { Icon } from '@iconify/react'; // Import Icon from Iconify
import { EmergencyBikeTag } from "./EmergencyBikeTag"; // Import the new tag component

const { Text, Title, Paragraph } = Typography;
const { useToken } = theme;

interface WorkOrderCardProps {
  order: WorkOrder;
  technician: Technician | undefined;
  vehicle: Vehicle | undefined;
  onUpdateWorkOrder: (id: string, updates: Partial<WorkOrder>) => void;
  onViewDetails: () => void;
  groupBy?: 'status' | 'priority' | 'assignedTechnicianId';
}

const WorkOrderCard = ({ order, technician, vehicle, onUpdateWorkOrder, onViewDetails, groupBy }: WorkOrderCardProps) => {
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
      bodyStyle={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}
      onClick={onViewDetails}
    >
      {/* Header: ID and SLA */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text code style={{ fontSize: '11px' }}>{order.workOrderNumber}</Text>
        <Space size={4}>
          <EmergencyBikeTag workOrder={order} /> {/* New Emergency Bike Tag */}
          <SlaCountdown slaDue={order.slaDue} status={order.status} completedAt={order.completedAt} />
        </Space>
      </div>

      {/* Body: Vehicle and Service */}
      <div>
        <Title level={5} style={{ margin: 0, lineHeight: 1.2, fontSize: '14px' }}>
          {vehicle ? `${vehicle.make} ${vehicle.license_plate}` : 'N/A'}
        </Title>
        <Paragraph 
          style={{ fontSize: '12px', margin: '2px 0 0 0' }}
          ellipsis={{ rows: 2, tooltip: order.service }}
          type="secondary"
        >
          {order.service}
        </Paragraph>
      </div>

      {/* Footer: Tags and Assignee */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0px' }}>
        <Space size="small" onClick={stopPropagation}>
          {groupBy !== 'priority' && (
            <Dropdown overlay={priorityMenu} trigger={['click']}>
              <Tag color={priorityColors[order.priority || 'Low']} style={{ cursor: 'pointer' }} className="ant-tag-compact">
                {order.priority}
              </Tag>
            </Dropdown>
          )}
          {groupBy !== 'status' && (
            <Dropdown overlay={statusMenu} trigger={['click']}>
              <Tag color={statusColors[order.status || 'Open']} style={{ cursor: 'pointer' }} className="ant-tag-compact">
                {order.status}
              </Tag>
            </Dropdown>
          )}
        </Space>
        <Tooltip title={technician ? `Assigned to ${technician.name}` : 'Unassigned'}>
          <Avatar size={24} src={technician?.avatar || undefined}>
            {technician ? technician.name.split(' ').map(n => n[0]).join('') : '?'}
          </Avatar>
        </Tooltip>
      </div>
    </Card>
  );
};

export default WorkOrderCard;