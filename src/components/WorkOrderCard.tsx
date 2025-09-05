import { Card, Tag, Avatar, Tooltip, Typography } from "antd";
import { EnvironmentOutlined, CalendarOutlined, UserOutlined } from "@ant-design/icons";
import { WorkOrder, Technician, Location } from "../data/mockData";
import { formatDistanceToNow } from 'date-fns';
import { Link } from "react-router-dom";

const { Text, Title } = Typography;

interface WorkOrderCardProps {
  order: WorkOrder;
  technician: Technician | undefined;
  location: Location | undefined;
}

const priorityColors = {
  High: "red",
  Medium: "gold",
  Low: "green",
};

const priorityBorderColors = {
    High: "red",
    Medium: "gold",
    Low: "transparent",
}

const WorkOrderCard = ({ order, technician, location }: WorkOrderCardProps) => {
  const slaDue = new Date(order.slaDue);
  const isOverdue = slaDue < new Date();

  return (
    <Link to={`/work-orders/${order.id}`}>
      <Card 
        hoverable 
        className="lift-on-hover"
        style={{ borderLeft: `4px solid ${priorityBorderColors[order.priority]}` }}
        bodyStyle={{ padding: 16 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div>
            <Title level={5} style={{ margin: 0 }}>{order.vehicleId}</Title>
            <Text type="secondary">{order.customerName} • {order.vehicleModel}</Text>
          </div>
          <Tag color={priorityColors[order.priority]}>{order.priority}</Tag>
        </div>
        <Text style={{ display: 'block', marginBottom: 12 }}>{order.service}</Text>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <EnvironmentOutlined />
            <Text type="secondary" style={{ fontSize: 12 }}>{location?.name}</Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CalendarOutlined />
            <Tooltip title={`SLA: ${slaDue.toLocaleString()}`}>
              <Text type={isOverdue ? 'danger' : 'secondary'} style={{ fontSize: 12 }}>
                Due {formatDistanceToNow(slaDue, { addSuffix: true })}
              </Text>
            </Tooltip>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Avatar size="small" src={technician?.avatar} icon={<UserOutlined />} />
            <Text style={{ fontSize: 12 }}>{technician?.name || 'Unassigned'}</Text>
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>{order.id}</Text>
        </div>
      </Card>
    </Link>
  );
};

export default WorkOrderCard;