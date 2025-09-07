import { Card, List, Avatar, Progress, Typography, Space, Tooltip } from "antd";
import { Link } from "react-router-dom";
import { Technician, WorkOrder } from "@/types/supabase";

const { Text } = Typography;

const electricGreen = '#22C55E'; // A more balanced, vibrant green

const statusColors: Record<string, 'success' | 'warning' | 'default'> = {
  available: "success",
  busy: "warning",
  offline: "default",
};

interface TechnicianStatusListProps {
  technicians: Technician[];
  workOrders: WorkOrder[];
}

const TechnicianStatusList = ({ technicians, workOrders }: TechnicianStatusListProps) => {
  const techData = technicians.map(tech => {
    const openTasks = workOrders.filter(wo => wo.assignedTechnicianId === tech.id && wo.status !== 'Completed').length;
    const maxTasks = tech.maxConcurrentOrders || 5;
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
                <Tooltip title={tech.status ? tech.status.charAt(0).toUpperCase() + tech.status.slice(1) : 'Unknown'}>
                  <Avatar src={tech.avatar || undefined} style={{ border: `2px solid ${tech.status === 'available' ? electricGreen : statusColors[tech.status || 'offline'] === 'warning' ? '#faad14' : '#bfbfbf'}` }} />
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