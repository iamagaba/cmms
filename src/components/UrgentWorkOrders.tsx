import { Card, List, Tag, Typography, Space, Avatar } from 'antd';
import { WarningOutlined, UserOutlined } from '@ant-design/icons';
import { WorkOrder, Technician } from '@/types/supabase';
import { Link } from 'react-router-dom';
import { formatDistanceToNow, isPast } from 'date-fns';

const { Text } = Typography;

interface UrgentWorkOrdersProps {
  workOrders: WorkOrder[];
  technicians: Technician[];
}

const UrgentWorkOrders = ({ workOrders, technicians }: UrgentWorkOrdersProps) => {
  const now = new Date();
  const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const urgentOrders = workOrders
    .filter(wo => {
      if (wo.status === 'Completed' || !wo.slaDue) return false;
      const dueDate = new Date(wo.slaDue);
      return isPast(dueDate) || dueDate < twentyFourHoursFromNow;
    })
    .sort((a, b) => new Date(a.slaDue!).getTime() - new Date(b.slaDue!).getTime());

  if (urgentOrders.length === 0) {
    return null;
  }

  return (
    <Card
      title={
        <Space>
          <WarningOutlined style={{ color: '#faad14' }} />
          <Text>Urgent Work Orders</Text>
        </Space>
      }
      style={{ height: '100%' }}
    >
      <List
        itemLayout="horizontal"
        dataSource={urgentOrders}
        renderItem={order => {
          const dueDate = new Date(order.slaDue!);
          const isOverdue = isPast(dueDate);
          const technician = technicians.find(t => t.id === order.assignedTechnicianId);

          return (
            <List.Item>
              <List.Item.Meta
                title={<Link to={`/work-orders/${order.id}`}>{order.vehicleId} - {order.service}</Link>}
                description={
                  <Space>
                    {technician ? (
                      <>
                        <Avatar size="small" src={technician.avatar || undefined} icon={<UserOutlined />} />
                        <Text type="secondary">{technician.name}</Text>
                      </>
                    ) : (
                      <Text type="secondary">Unassigned</Text>
                    )}
                  </Space>
                }
              />
              <div style={{ textAlign: 'right' }}>
                <Tag color={isOverdue ? 'error' : 'warning'}>
                  {isOverdue ? 'Overdue' : 'Due Soon'}
                </Tag>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {formatDistanceToNow(dueDate, { addSuffix: true })}
                </Text>
              </div>
            </List.Item>
          );
        }}
      />
    </Card>
  );
};

export default UrgentWorkOrders;