import { Card, List, Avatar, Progress, Typography, Space, Tooltip } from "antd";
import { technicians, workOrders } from "../data/mockData";
import { Link } from "react-router-dom";

const { Text } = Typography;

const statusColors: Record<typeof technicians[0]['status'], 'success' | 'warning' | 'default'> = {
  available: "success",
  busy: "warning",
  offline: "default",
};

const TechnicianStatusList = () => {
  const techData = technicians.map(tech => {
    const openTasks = workOrders.filter(wo => wo.assignedTechnicianId === tech.id && wo.status !== 'Completed').length;
    const maxTasks = tech.max_concurrent_orders || 5; // Assuming a default max if not specified
    return { ...tech, openTasks, maxTasks };
  });

  return (
    <Card title="Technician Status">
      <List
        itemLayout="horizontal"
        dataSource={techData}
        renderItem={tech => (
          <List.Item>
            <List.Item.Meta
              avatar={
                <Tooltip title={tech.status.charAt(0).toUpperCase() + tech.status.slice(1)}>
                  <Avatar src={tech.avatar} style={{ border: `2px solid ${statusColors[tech.status] === 'success' ? '#52c41a' : statusColors[tech.status] === 'warning' ? '#faad14' : '#bfbfbf'}` }} />
                </Tooltip>
              }
              title={<Link to={`/technicians/${tech.id}`}>{tech.name}</Link>}
              description={
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text type="secondary">{tech.specialization}</Text>
                  <Tooltip title={`${tech.openTasks} / ${tech.maxTasks} open tasks`}>
                    <Progress percent={(tech.openTasks / tech.maxTasks) * 100} showInfo={false} size="small" />
                  </Tooltip>
                </Space>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default TechnicianStatusList;