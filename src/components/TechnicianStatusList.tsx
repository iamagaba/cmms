import { Card, List, Avatar, Typography, Tag, Badge } from "antd";
import { Link } from "react-router-dom";
import { Technician, WorkOrder } from "@/types/supabase";

const { Text } = Typography;

const statusColorMap: Record<string, string> = {
  available: "success",
  busy: "warning",
  offline: "default",
};

const statusTextMap: Record<string, string> = {
    available: 'Available',
    busy: 'Busy',
    offline: 'Offline',
};

interface TechnicianStatusListProps {
  technicians: Technician[];
  workOrders: WorkOrder[];
}

const TechnicianStatusList = ({ technicians, workOrders }: TechnicianStatusListProps) => {
  const techData = technicians.map(tech => {
    const openTasks = workOrders.filter(wo => wo.assignedTechnicianId === tech.id && wo.status !== 'Completed').length;
    return { ...tech, openTasks };
  });

  return (
    <Card title="Technician Status" style={{ height: '100%' }}>
      <List
        itemLayout="horizontal"
        dataSource={techData}
        renderItem={tech => (
          <List.Item>
            <List.Item.Meta
              avatar={
                <Link to={`/technicians/${tech.id}`}>
                  <Avatar src={tech.avatar || undefined}>
                    {tech.name.split(' ').map(n => n[0]).join('')}
                  </Avatar>
                </Link>
              }
              title={<Link to={`/technicians/${tech.id}`}>{tech.name}</Link>}
              description={<Tag color={statusColorMap[tech.status || 'offline']}>{statusTextMap[tech.status || 'offline']}</Tag>}
            />
            <div style={{ textAlign: 'right' }}>
                <Text type="secondary" style={{ fontSize: 12 }}>Open Tasks</Text>
                <br/>
                <Badge count={tech.openTasks} showZero color="#6A0DAD" />
            </div>
          </List.Item>
        )}
      />
    </Card>
  );
};

export default TechnicianStatusList;