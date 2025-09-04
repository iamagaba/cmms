import { Card, List, Avatar, Badge } from "antd";
import { technicians } from "../data/mockData";

const statusColors: Record<typeof technicians[0]['status'], 'success' | 'warning' | 'default'> = {
  available: "success",
  busy: "warning",
  offline: "default",
};

const TechnicianList = () => {
  return (
    <Card title="Technicians">
      <List
        itemLayout="horizontal"
        dataSource={technicians}
        renderItem={tech => (
          <List.Item
            actions={[<Badge key="status" status={statusColors[tech.status]} />]}
          >
            <List.Item.Meta
              avatar={<Avatar src={tech.avatar} />}
              title={tech.name}
              description={tech.status.charAt(0).toUpperCase() + tech.status.slice(1)}
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default TechnicianList;