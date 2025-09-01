import { Avatar, Button, Dropdown, Menu, Tag, Typography } from "antd";
import { MoreOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { WorkOrder, Technician, Location } from "@/data/mockData";
import dayjs from "dayjs";

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

export const getColumns = (
  onEdit: (record: WorkOrderRow) => void,
  onDelete: (record: WorkOrderRow) => void
) => [
  {
    title: "ID",
    dataIndex: "id",
    render: (id: string) => <Text code>{id}</Text>
  },
  {
    title: "Vehicle",
    dataIndex: "vehicleId",
    sorter: (a: WorkOrderRow, b: WorkOrderRow) => a.vehicleId.localeCompare(b.vehicleId),
    render: (vehicleId: string, record: WorkOrderRow) => (
      <div>
        <Text strong>{vehicleId}</Text>
        <br />
        <Text type="secondary" style={{ fontSize: 12 }}>{record.vehicleModel}</Text>
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
    render: (slaDue: string) => dayjs(slaDue).format("MMM D, YYYY"),
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