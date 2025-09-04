import { Card, List, Avatar, Badge } from "antd";
import { EnvironmentOutlined } from "@ant-design/icons";
import { locations, workOrders } from "../data/mockData";

const LocationList = () => {
  return (
    <Card title="Service Locations">
      <List
        itemLayout="horizontal"
        dataSource={locations}
        renderItem={loc => {
          const orderCount = workOrders.filter(wo => wo.locationId === loc.id).length;
          return (
            <List.Item
              extra={<Badge count={orderCount} showZero color="#1677ff" />}
            >
              <List.Item.Meta
                avatar={<Avatar icon={<EnvironmentOutlined />} />}
                title={loc.name}
                description={loc.address}
              />
            </List.Item>
          );
        }}
      />
    </Card>
  );
};

export default LocationList;