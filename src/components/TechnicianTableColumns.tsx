import { Avatar, Button, Dropdown, Menu, Tag, Typography } from "antd";
import { Icon } from '@iconify/react'; // Import Icon from Iconify
import { Technician } from "@/types/supabase";
import { Link } from "react-router-dom";

const { Text } = Typography;

export type TechnicianRow = Technician & {
  openTasks: number;
};

const statusColorMap: Record<string, string> = {
  available: 'success',
  busy: 'warning',
  offline: 'default',
};

const statusTextMap: Record<string, string> = {
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
        <Avatar src={record.avatar || undefined}>{name.split(' ').map(n => n[0]).join('')}</Avatar>
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
      <Tag color={statusColorMap[status || 'offline']}>{statusTextMap[status || 'offline']}</Tag>
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
            <Menu.Item key="edit" icon={<Icon icon="si:edit" />} onClick={(e) => { e.domEvent.stopPropagation(); onEdit(record); }}>
              Edit Details
            </Menu.Item>
            <Menu.Item key="delete" icon={<Icon icon="si:trash" />} danger onClick={(e) => { e.domEvent.stopPropagation(); onDelete(record); }}>
              Delete Technician
            </Menu.Item>
          </Menu>
        }
        trigger={["click"]}
      >
        <Button type="text" icon={<Icon icon="si:more-horizontal" style={{ fontSize: '18px' }} />} onClick={(e) => e.stopPropagation()} />
      </Dropdown>
    ),
  },
];