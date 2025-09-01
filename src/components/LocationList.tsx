import { Card, List, Avatar } from "antd";
import { EnvironmentOutlined } from "@ant-design/icons";
import { locations } from "../data/mockData";

const LocationList = () => {
  return (
    <Card title="Service Locations">
      <List
        itemLayout="horizontal"
        dataSource={locations}
        renderItem={loc => (
          <List.Item>
            <List.Item.Meta
              avatar={<Avatar icon={<EnvironmentOutlined />} />}
              title={loc.name}
              description={loc.address}
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default LocationList;