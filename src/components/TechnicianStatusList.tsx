import { Card, List, Avatar, Typography, Badge, theme } from "antd";
import StatusChip from "@/components/StatusChip";
import { Link } from "react-router-dom";
import { Technician, WorkOrder } from "@/types/supabase";

const { Text } = Typography;


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
  const { token } = theme.useToken();
  const techData = technicians.map(tech => {
    const openTasks = workOrders.filter(wo => wo.assignedTechnicianId === tech.id && wo.status !== 'Completed').length;
    return { ...tech, openTasks };
  });

  return (
  <Card size="small" title="Technician Status" style={{ height: '100%' }}>
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
              description={<StatusChip kind="tech" value={statusTextMap[tech.status || 'offline']} />}
            />
            <div style={{ textAlign: 'right' }}>
                <Text type="secondary" style={{ fontSize: 12 }}>Open Tasks</Text>
                <br/>
                <Badge count={tech.openTasks} showZero color={token.colorPrimary} />
            </div>
          </List.Item>
        )}
      />
    </Card>
  );
};

export default TechnicianStatusList;