import { Card, Typography, Space, Badge } from 'antd';
import { EnvironmentOutlined, ToolOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { Location, WorkOrder } from '@/data/mockData';

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
        <Title level={5}>{location.name}</Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          <EnvironmentOutlined style={{ marginRight: 8 }} />
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