import { Card, List, Typography, Space, Avatar, Empty, theme } from 'antd';
import StatusChip from "@/components/StatusChip";
import { Icon } from '@iconify/react'; // Import Icon from Iconify
import { WorkOrder, Technician, Vehicle } from '@/types/supabase';
import { formatDistanceToNow, isPast } from 'date-fns';
import React from 'react'; // Import React for useMemo

const { Text } = Typography;

interface UrgentWorkOrdersProps {
  workOrders: WorkOrder[];
  technicians: Technician[];
  vehicles: Vehicle[]; // Added vehicles prop
}

const UrgentWorkOrders = ({ workOrders, technicians, vehicles }: UrgentWorkOrdersProps) => {
  const { token } = theme.useToken();
  const now = new Date();
  const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const vehicleMap = React.useMemo(() => {
    return new Map(vehicles.map(v => [v.id, v]));
  }, [vehicles]);

  const urgentOrders = workOrders
    .filter(wo => {
      if (wo.status === 'Completed' || !wo.slaDue) return false;
      const dueDate = new Date(wo.slaDue);
      return isPast(dueDate) || dueDate < twentyFourHoursFromNow;
    })
    .sort((a, b) => new Date(a.slaDue!).getTime() - new Date(b.slaDue!).getTime());

  const cardTitle = (
    <Space>
      <Icon icon="ph:warning-fill" style={{ color: token.colorWarning }} />
      <Text>Urgent Work Orders</Text>
    </Space>
  );

  if (urgentOrders.length === 0) {
    return (
  <Card size="small" title={cardTitle} style={{ height: '100%' }}>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No urgent work orders" />
      </Card>
    );
  }

  return (
  <Card size="small" title={cardTitle} style={{ height: '100%' }}>
      <List
        itemLayout="horizontal"
        dataSource={urgentOrders}
        renderItem={order => {
          const dueDate = new Date(order.slaDue!);
          const isOverdue = isPast(dueDate);
          const technician = technicians.find(t => t.id === order.assignedTechnicianId);
          const vehicle = order.vehicleId ? vehicleMap.get(order.vehicleId) : undefined;

          return (
            <List.Item>
              <List.Item.Meta
                title={
                  <Space direction="vertical" size={0}>
                    <Text strong>License Plate: {vehicle?.license_plate || 'N/A'}</Text>
                    <Text strong>Service: {order.service}</Text>
                  </Space>
                }
                description={
                  <Space direction="vertical" size={4}>
                    {technician ? (
                      <Space>
                        <Avatar size="small" src={technician.avatar || undefined} icon={<Icon icon="ph:user-fill" />} />
                        <Text type="secondary">{technician.name}</Text>
                      </Space>
                    ) : (
                      <Text type="secondary">Unassigned</Text>
                    )}
                    {order.customerAddress && (
                      <Text type="secondary">
                        <Icon icon="ph:map-pin-fill" style={{ marginRight: 4 }} />
                        Client Location: {order.customerAddress}
                      </Text>
                    )}
                  </Space>
                }
              />
              <div style={{ textAlign: 'right' }}>
                <StatusChip kind="custom" value={isOverdue ? 'Overdue' : 'Due Soon'} color={isOverdue ? token.colorError : token.colorWarning} />
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