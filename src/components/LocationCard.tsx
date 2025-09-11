import { Card, Typography, Space, Badge } from 'antd';
import { Icon } from '@iconify/react'; // Import Icon from Iconify
import { Link } from 'react-router-dom';
import { Location, WorkOrder } from '@/types/supabase';

const { Title, Text } = Typography;

interface LocationCardProps {
  location: Location;
  workOrders: WorkOrder[];
}

export const LocationCard = ({ location, workOrders }: LocationCardProps) => {
  const openWorkOrders = workOrders.filter(wo => wo.locationId === location.id && wo.status !== 'Completed').length;

  return (
    <Link to={`/locations/${location.id}`}>
      <Card hoverable className="lift-on-hover">
        <Title level={5}>{location.name.replace(' Service Center', '')}</Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          <Icon icon="si:map-pin" style={{ marginRight: 8 }} />
          {location.address}
        </Text>
        <Space>
          <Badge count={openWorkOrders} showZero color="#1677ff" />
          <Text>Open Work Orders</Text>
        </Space>
      </Card>
    </Link>
  );
};