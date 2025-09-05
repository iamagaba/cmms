import { Card, Tag, Avatar, Tooltip, Typography, Select } from "antd";
import { EnvironmentOutlined, CalendarOutlined, UserOutlined } from "@ant-design/icons";
import { WorkOrder, Technician, Location, technicians as allTechnicians } from "../data/mockData"; // Import allTechnicians
import { formatDistanceToNow } from 'date-fns';
import { Link } from "react-router-dom";

const { Text, Title } = Typography;
const { Option } = Select;

interface WorkOrderCardProps {
  order: WorkOrder;
  technician: Technician | undefined;
  location: Location | undefined;
  onUpdateWorkOrder: (id: string, field: keyof WorkOrder, value: any) => void;
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

const statusColors: Record<WorkOrder['status'], string> = {
  Open: "blue",
  "In Progress": "gold",
  "On Hold": "orange",
  Completed: "green",
};

const WorkOrderCard = ({ order, technician, location, onUpdateWorkOrder }: WorkOrderCardProps) => {
  const slaDue = new Date(order.slaDue);
  const isOverdue = slaDue < new Date();

  return (
    <Card 
      hoverable 
      className="lift-on-hover"
      style={{ borderLeft: `4px solid ${priorityBorderColors[order.priority]}` }}
      bodyStyle={{ padding: 16 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <Title level={5} style={{ margin: 0 }}>
            <Link to={`/work-orders/${order.id}`}>{order.vehicleId}</Link>
          </Title>
          <Text type="secondary">{order.customerName} • {order.vehicleModel}</Text>
        </div>
        <Select
          value={order.priority}
          onChange={(value) => onUpdateWorkOrder(order.id, 'priority', value)}
          style={{ width: 90 }}
          bordered={false}
          size="small"
          dropdownMatchSelectWidth={false}
        >
          <Option value="High"><Tag color={priorityColors["High"]}>High</Tag></Option>
          <Option value="Medium"><Tag color={priorityColors["Medium"]}>Medium</Tag></Option>
          <Option value="Low"><Tag color={priorityColors["Low"]}>Low</Tag></Option>
        </Select>
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
        <Select
          value={order.assignedTechnicianId}
          onChange={(value) => onUpdateWorkOrder(order.id, 'assignedTechnicianId', value)}
          style={{ width: 150 }}
          bordered={false}
          allowClear
          placeholder="Unassigned"
          size="small"
          dropdownMatchSelectWidth={false}
        >
          {allTechnicians.map(tech => (
            <Option key={tech.id} value={tech.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Avatar size="small" src={tech.avatar}>{tech.name.split(' ').map(n => n[0]).join('')}</Avatar>
                <Text>{tech.name}</Text>
              </div>
            </Option>
          ))}
        </Select>
        <Select
          value={order.status}
          onChange={(value) => onUpdateWorkOrder(order.id, 'status', value)}
          style={{ width: 100 }}
          bordered={false}
          size="small"
          dropdownMatchSelectWidth={false}
        >
          <Option value="Open"><Tag color={statusColors["Open"]}>Open</Tag></Option>
          <Option value="In Progress"><Tag color={statusColors["In Progress"]}>In Progress</Tag></Option>
          <Option value="On Hold"><Tag color={statusColors["On Hold"]}>On Hold</Tag></Option>
          <Option value="Completed"><Tag color={statusColors["Completed"]}>Completed</Tag></Option>
        </Select>
      </div>
    </Card>
  );
};

export default WorkOrderCard;