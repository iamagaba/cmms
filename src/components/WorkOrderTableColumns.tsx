import { Avatar, Button, Dropdown, Menu, Tag, Typography, Tooltip } from "antd";
import { MoreOutlined, DeleteOutlined, EditOutlined, ClockCircleOutlined, WarningOutlined } from "@ant-design/icons";
import { WorkOrder, Technician, Location } from "@/data/mockData";
import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime';
import { Link } from "react-router-dom";

dayjs.extend(relativeTime);

const { Text } = Typography;

export type WorkOrderRow = WorkOrder & {
  technician?: Technician;
  location?: Location;
};

const priorityColors: Record<WorkOrder['priority'], string> = {
  High: "red",
  Medium: "gold",
  Low: "green",
};

const statusColors: Record<WorkOrder['status'], string> = {
    Open: "blue",
    "In Progress": "gold",
    "On Hold": "orange",
    Completed: "green",
};

const priorityOrder: Record<WorkOrder['priority'], number> = { 'High': 1, 'Medium': 2, 'Low': 3 };

const SlaDisplay = ({ slaDue }: { slaDue: string }) => {
  const dueDate = dayjs(slaDue);
  const now = dayjs();
  const isOverdue = dueDate.isBefore(now);
  const isDueSoon = dueDate.isBefore(now.add(1, 'day'));

  let icon = <ClockCircleOutlined style={{ color: '#52c41a' }} />;
  if (isOverdue) {
    icon = <WarningOutlined style={{ color: '#ff4d4f' }} />;
  } else if (isDueSoon) {
    icon = <ClockCircleOutlined style={{ color: '#faad14' }} />;
  }

  return (
    <Tooltip title={`Due: ${dueDate.format("MMM D, YYYY h:mm A")}`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {icon}
        <Text type={isOverdue ? 'danger' : 'secondary'}>{dueDate.fromNow()}</Text>
      </div>
    </Tooltip>
  );
};

export const getColumns = (
  onEdit: (record: WorkOrderRow) => void,
  onDelete: (record: WorkOrderRow) => void
) => [
  {
    title: "ID",
    dataIndex: "id",
    render: (id: string) => <Link to={`/work-orders/${id}`}><Text code>{id}</Text></Link>
  },
  {
    title: "Customer & Vehicle",
    dataIndex: "customerName",
    render: (_: any, record: WorkOrderRow) => (
      <div>
        <Text strong>{record.customerName}</Text>
        <br />
        <Text type="secondary" style={{ fontSize: 12 }}>{record.vehicleId} ({record.vehicleModel})</Text>
      </div>
    )
  },
  {
    title: "Service",
    dataIndex: "service",
  },
  {
    title: "Status",
    dataIndex: "status",
    render: (status: WorkOrder['status']) => <Tag color={statusColors[status]}>{status}</Tag>,
    sorter: (a: WorkOrderRow, b: WorkOrderRow) => a.status.localeCompare(b.status),
  },
  {
    title: "Priority",
    dataIndex: "priority",
    render: (priority: WorkOrder['priority']) => <Tag color={priorityColors[priority]}>{priority}</Tag>,
    sorter: (a: WorkOrderRow, b: WorkOrderRow) => priorityOrder[a.priority] - priorityOrder[b.priority],
  },
  {
    title: "Technician",
    dataIndex: "technician",
    render: (_: any, record: WorkOrderRow) => {
      const tech = record.technician;
      if (!tech) return <Text type="secondary">Unassigned</Text>;
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Avatar size="small" src={tech.avatar}>{tech.name.split(' ').map(n => n[0]).join('')}</Avatar>
          <Text>{tech.name}</Text>
        </div>
      );
    }
  },
  {
    title: "SLA Due",
    dataIndex: "slaDue",
    render: (slaDue: string) => <SlaDisplay slaDue={slaDue} />,
    sorter: (a: WorkOrderRow, b: WorkOrderRow) => dayjs(a.slaDue).unix() - dayjs(b.slaDue).unix(),
  },
  {
    title: "Actions",
    key: "actions",
    align: "right" as const,
    render: (_: any, record: WorkOrderRow) => (
      <Dropdown
        overlay={
          <Menu>
            <Menu.Item key="edit" icon={<EditOutlined />} onClick={() => onEdit(record)}>
              Edit Work Order
            </Menu.Item>
            <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={() => onDelete(record)}>
              Delete Work Order
            </Menu.Item>
          </Menu>
        }
        trigger={["click"]}
      >
        <Button type="text" icon={<MoreOutlined style={{ fontSize: '18px' }} />} />
      </Dropdown>
    ),
  },
];