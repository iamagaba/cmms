import { Card, List, Typography, Badge, Avatar } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import { locations, workOrders } from '../data/mockData';
import { Link } from 'react-router-dom';

const { Text } = Typography;

const LocationStatusList = () => {
  const locationData = locations.map(loc => ({
    ...loc,
    openWorkOrders: workOrders.filter(wo => wo.locationId === loc.id && wo.status !== 'Completed').length,
  }));

  return (
    <Card title="Location Status">
      <List
        itemLayout="horizontal"
        dataSource={locationData}
        renderItem={loc => (
          <List.Item>
            <List.Item.Meta
              avatar={<Avatar icon={<EnvironmentOutlined />} style={{ backgroundColor: '#e6f7ff', color: '#1890ff' }} />}
              title={<Link to={`/locations/${loc.id}`}>{loc.name}</Link>}
              description={loc.address}
            />
            <Badge count={loc.openWorkOrders} showZero color="#1677ff" />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default LocationStatusList;