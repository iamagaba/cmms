import { Avatar, Button, Dropdown, Menu, Tag, Typography, Select } from "antd";
import { MoreOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { WorkOrder, Technician, Location, Customer, Vehicle } from "@/types/supabase";
import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime';
import SlaCountdown from "./SlaCountdown";

dayjs.extend(relativeTime);

const { Text } = Typography;
const { Option } = Select;

export type WorkOrderRow = WorkOrder & {
  technician?: Technician;
  location?: Location;
  customer?: Customer;
  vehicle?: Vehicle;
};

const priorityColors: Record<string, string> = { High: "#FF4D4F", Medium: "#FAAD14", Low: "#52c41a" };
const statusColors: Record<string, string> = { 
  Open: '#0052CC', // Professional Blue
  "Confirmation": "#13C2C2", // Cyan
  "Ready": "#595959", // Dark Gray
  "In Progress": "#FAAD14", // Amber
  "On Hold": "#FA8C16", // Orange
  Completed: '#22C55E' // Green
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
    render: (text: string, record: WorkOrderRow) => <Text code>{text || record.id.substring(0, 6)}</Text>
  },
  {
    title: "Customer & Vehicle",
    dataIndex: "customerName",
    render: (_: any, record: WorkOrderRow) => (
      <div>
        <Text strong>{record.customer?.name || 'N/A'}</Text><br />
        <Text type="secondary" style={{ fontSize: 12 }}>
          {record.vehicle ? `${record.vehicle.make} ${record.vehicle.model}` : 'N/A'}
        </Text>
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
      <Select value={status} onChange={(value) => onUpdateWorkOrder(record.id, { status: value })} style={{ width: 180 }} bordered={false} suffixIcon={null} size="small" onClick={(e) => e.stopPropagation()}>
        <Option value="Open"><Tag color={statusColors["Open"]}>Open</Tag></Option>
        <Option value="Confirmation"><Tag color={statusColors["Confirmation"]}>Confirmation</Tag></Option>
        <Option value="Ready"><Tag color={statusColors["Ready"]}>Ready</Tag></Option>
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
      <Select value={priority} onChange={(value) => onUpdateWorkOrder(record.id, { priority: value })} style={{ width: 100 }} bordered={false} suffixIcon={null} size="small" onClick={(e) => e.stopPropagation()}>
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
      <Select value={record.assignedTechnicianId} onChange={(value) => onUpdateWorkOrder(record.id, { assignedTechnicianId: value })} style={{ width: 150 }} bordered={false} allowClear placeholder="Unassigned" suffixIcon={null} size="small" onClick={(e) => e.stopPropagation()}>
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
      <Dropdown overlay={<Menu><Menu.Item key="edit" icon={<EditOutlined />} onClick={(e) => { e.domEvent.stopPropagation(); onEdit(record); }}>Edit Work Order</Menu.Item><Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={(e) => { e.domEvent.stopPropagation(); onDelete(record); }}>Delete Work Order</Menu.Item></Menu>} trigger={["click"]}>
        <Button type="text" icon={<MoreOutlined style={{ fontSize: '18px' }} />} onClick={(e) => e.stopPropagation()} />
      </Dropdown>
    ),
  },
];