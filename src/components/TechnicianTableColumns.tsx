import { Avatar, Button, Dropdown, Menu, Tag, Typography } from "antd";
import { MoreOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Technician } from "@/data/mockData";
import { Link } from "react-router-dom";

const { Text } = Typography;

export type TechnicianRow = Technician & {
  openTasks: number;
};

const statusColorMap: Record<TechnicianRow['status'], string> = {
  available: 'success',
  busy: 'warning',
  offline: 'default',
};

const statusTextMap: Record<TechnicianRow['status'], string> = {
    available: 'Available',
    busy: 'Busy',
    offline: 'Offline',
};

export const getColumns = (
  onEdit: (record: TechnicianRow) => void,
  onDelete: (record: TechnicianRow) => void
) => [
  {
    title: "Technician",
    dataIndex: "name",
    sorter: (a: TechnicianRow, b: TechnicianRow) => a.name.localeCompare(b.name),
    render: (name: string, record: TechnicianRow) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Avatar src={record.avatar}>{name.split(' ').map(n => n[0]).join('')}</Avatar>
        <Link to={`/technicians/${record.id}`}>
            <Text strong>{name}</Text>
        </Link>
      </div>
    )
  },
  {
    title: "Status",
    dataIndex: "status",
    render: (status: TechnicianRow['status']) => (
      <Tag color={statusColorMap[status]}>{statusTextMap[status]}</Tag>
    )
  },
  {
    title: "Open Tasks",
    dataIndex: "openTasks",
    sorter: (a: TechnicianRow, b: TechnicianRow) => a.openTasks - b.openTasks,
  },
  {
    title: "Actions",
    key: "actions",
    align: "right" as const,
    render: (_: any, record: TechnicianRow) => (
      <Dropdown
        overlay={
          <Menu>
            <Menu.Item key="edit" icon={<EditOutlined />} onClick={() => onEdit(record)}>
              Edit Details
            </Menu.Item>
            <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={() => onDelete(record)}>
              Delete Technician
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