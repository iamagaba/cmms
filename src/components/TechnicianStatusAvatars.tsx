import { Card, Avatar, Tooltip, Typography, Space, Badge } from "antd";
import { Link } from "react-router-dom";
import { Technician, WorkOrder } from "@/types/supabase";

const { Text } = Typography;

const statusColors: Record<string, string> = {
  available: "#52c41a", // success
  busy: "#faad14", // warning
  offline: "#bfbfbf", // default
};

interface TechnicianStatusAvatarsProps {
  technicians: Technician[];
  workOrders: WorkOrder[];
}

const TechnicianStatusAvatars = ({ technicians, workOrders }: TechnicianStatusAvatarsProps) => {
  const techData = technicians.map(tech => {
    const openTasks = workOrders.filter(wo => wo.assignedTechnicianId === tech.id && wo.status !== 'Completed').length;
    return { ...tech, openTasks };
  });

  return (
    <Card title="Technician Status">
      <Space size="small" wrap style={{ justifyContent: 'flex-start' }}>
        {techData.map(tech => (
          <Link to={`/technicians/${tech.id}`} key={tech.id}>
            <Tooltip title={
              <div>
                <Text strong>{tech.name}</Text><br />
                <Text>Status: {tech.status ? tech.status.charAt(0).toUpperCase() + tech.status.slice(1) : 'Unknown'}</Text><br />
                <Text>Open Tasks: {tech.openTasks}</Text>
              </div>
            }>
              <Badge dot color={statusColors[tech.status || 'offline']} offset={[-5, 25]}>
                <Avatar size={32} src={tech.avatar || undefined}>
                  {tech.name.split(' ').map(n => n[0]).join('')}
                </Avatar>
              </Badge>
            </Tooltip>
          </Link>
        ))}
      </Space>
    </Card>
  );
};

export default TechnicianStatusAvatars;