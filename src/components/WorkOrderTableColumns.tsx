import { Avatar, Button, Dropdown, Menu, Tag, Typography, Select } from "antd";
import { MoreOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { WorkOrder, Technician, Location } from "@/types/supabase";
import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime';
import { Link } from "react-router-dom";
import SlaCountdown from "./SlaCountdown";

dayjs.extend(relativeTime);

const { Text } = Typography;
const { Option } = Select;

const primaryPurple = '#6A0DAD'; // GOGO Brand Purple
const electricGreen = '#7FFF00'; // GOGO Electric Green
const lightGrey = '#d9d9d9'; // Light Grey for 'Confirmed & Ready' status

export type WorkOrderRow = WorkOrder & {
  technician?: Technician;
  location?: Location;
};

const priorityColors: Record<string, string> = { High: "red", Medium: "gold", Low: "green" };
const statusColors: Record<string, string> = { 
  Open: primaryPurple, 
  "Pending Confirmation": "cyan", 
  "Confirmed & Ready": lightGrey, 
  "In Progress": "gold", 
  "On Hold": "orange", 
  Completed: electricGreen 
};
const priorityOrder: Record<string, number> = { 'High': 1, 'Medium': 2, 'Low': 3 };

export const getColumns = (
  onEdit: (record: WorkOrderRow) => void,
  onDelete: (record: WorkOrderRow) => void,
  onUpdateWorkOrder: (id: string, updates: Partial<WorkOrder>) => void,
  allTechnicians: Technician[]
) => [
  {
    title: "ID",
    dataIndex: "workOrderNumber",
    render: (text: string, record: WorkOrderRow) => <Link to={`/work-orders/${record.id}`}><Text code>{text || record.id.substring(0, 6)}</Text></Link>
  },
  {
    title: "Customer & Vehicle",
    dataIndex: "customerName",
    render: (_: any, record: WorkOrderRow) => (
      <div>
        <Text strong>{record.customerName}</Text><br />
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
    render: (status: WorkOrder['status'], record: WorkOrderRow) => (
      <Select value={status} onChange={(value) => onUpdateWorkOrder(record.id, { status: value })} style={{ width: 180 }} bordered={false}>
        <Option value="Open"><Tag color={statusColors["Open"]}>Open</Tag></Option>
        <Option value="Pending Confirmation"><Tag color={statusColors["Pending Confirmation"]}>Pending Confirmation</Tag></Option>
        <Option value="Confirmed & Ready"><Tag color={statusColors["Confirmed & Ready"]}>Confirmed & Ready</Tag></Option>
        <Option value="In Progress"><Tag color={statusColors["In Progress"]}>In Progress</Tag></Option>
        <Option value="On Hold"><Tag color={statusColors["On Hold"]}>On Hold</Tag></Option>
        <Option value="Completed"><Tag color={statusColors["Completed"]}>Completed</Tag></Option>
      </Select>
    ),
    sorter: (a: WorkOrderRow, b: WorkOrderRow) => (a.status || "").localeCompare(b.status || ""),
  },
  {
    title: "Priority",
    dataIndex: "priority",
    render: (priority: WorkOrder['priority'], record: WorkOrderRow) => (
      <Select value={priority} onChange={(value) => onUpdateWorkOrder(record.id, { priority: value })} style={{ width: 100 }} bordered={false}>
        <Option value="High"><Tag color={priorityColors["High"]}>High</Tag></Option>
        <Option value="Medium"><Tag color={priorityColors["Medium"]}>Medium</Tag></Option>
        <Option value="Low"><Tag color={priorityColors["Low"]}>Low</Tag></Option>
      </Select>
    ),
    sorter: (a: WorkOrderRow, b: WorkOrderRow) => priorityOrder[a.priority || 'Low'] - priorityOrder[b.priority || 'Low'],
  },
  {
    title: "Technician",
    dataIndex: "technician",
    render: (_: any, record: WorkOrderRow) => (
      <Select value={record.assignedTechnicianId} onChange={(value) => onUpdateWorkOrder(record.id, { assignedTechnicianId: value })} style={{ width: 150 }} bordered={false} allowClear placeholder="Unassigned">
        {allTechnicians.map(tech => (
          <Option key={tech.id} value={tech.id}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Avatar size="small" src={tech.avatar || undefined}>{tech.name.split(' ').map(n => n[0]).join('')}</Avatar>
              <Text>{tech.name}</Text>
            </div>
          </Option>
        ))}
      </Select>
    )
  },
  {
    title: "SLA Status",
    dataIndex: "slaDue",
    render: (_: any, record: WorkOrderRow) => <SlaCountdown slaDue={record.slaDue} status={record.status} completedAt={record.completedAt} />,
    sorter: (a: WorkOrderRow, b: WorkOrderRow) => dayjs(a.slaDue).unix() - dayjs(b.slaDue).unix(),
  },
  {
    title: "Actions",
    key: "actions",
    align: "right" as const,
    render: (_: any, record: WorkOrderRow) => (
      <Dropdown overlay={<Menu><Menu.Item key="edit" icon={<EditOutlined />} onClick={() => onEdit(record)}>Edit Work Order</Menu.Item><Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={() => onDelete(record)}>Delete Work Order</Menu.Item></Menu>} trigger={["click"]}>
        <Button type="text" icon={<MoreOutlined style={{ fontSize: '18px' }} />} />
      </Dropdown>
    ),
  },
];