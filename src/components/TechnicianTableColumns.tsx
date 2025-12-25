import { Avatar, Button, Dropdown, Menu, Typography, Select, Tag } from "antd";
import StatusChip from "@/components/StatusChip";
import { Icon } from '@iconify/react';
import { Technician } from "@/types/supabase";
import { Link } from "react-router-dom";
import { Profile } from "@/types/supabase"; // Import Profile type

const { Text } = Typography;
const { Option } = Select;

export type TechnicianRow = Technician & {
  openTasks: number;
  location?: { name: string } | null;
};


const statusTextMap: Record<string, string> = {
    available: 'Available',
    busy: 'Busy',
    offline: 'Offline',
};

interface GetColumnsProps {
  onEdit: (record: TechnicianRow) => void;
  onDelete: (record: TechnicianRow) => void;
  onUpdateStatus: (id: string, status: Technician['status']) => void; // New prop for status update
  currentUserProfile?: Profile | null; // pass profile from caller instead of using hooks here
}

export const getColumns = ({
  onEdit,
  onDelete,
  onUpdateStatus,
  currentUserProfile,
}: GetColumnsProps) => {
  const isAdmin = !!currentUserProfile?.is_admin;

  return [
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
      render: (status: TechnicianRow['status'], record: TechnicianRow) => {
        if (isAdmin) {
          return (
            <Select
              value={status || 'offline'}
              onChange={(value) => onUpdateStatus(record.id, value)}
              style={{ width: 120 }}
              bordered={false}
              size="small"
              onClick={(e) => e.stopPropagation()} // Prevent row click
              >
              <Option value="available"><StatusChip kind="tech" value="Available" /></Option>
              <Option value="busy"><StatusChip kind="tech" value="Busy" /></Option>
              <Option value="offline"><StatusChip kind="tech" value="Offline" /></Option>
            </Select>
          );
        }
        return <StatusChip kind="tech" value={statusTextMap[status || 'offline']} />;
      }
    },
    {
      title: "Open Tasks",
      dataIndex: "openTasks",
      sorter: (a: TechnicianRow, b: TechnicianRow) => a.openTasks - b.openTasks,
    },
    {
      title: "Location",
      dataIndex: "location",
      render: (location: { name: string } | null) => location ? location.name : 'No location assigned',
    },
    {
      title: "Specializations", // Changed title
      dataIndex: "specializations", // Changed dataIndex
      render: (specializations: string[] | null) => (specializations || []).map(s => <Tag key={s}>{s}</Tag>),
    },
    {
      title: "Actions",
      key: "actions",
      width: 80,
      align: "right" as const,
      render: (_: unknown, record: TechnicianRow) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item key="edit" icon={<Icon icon="ph:pencil-fill" />} onClick={(e) => { e.domEvent.stopPropagation(); onEdit(record); }}>
                Edit Details
              </Menu.Item>
              <Menu.Item key="delete" icon={<Icon icon="ph:trash-fill" />} danger onClick={(e) => { e.domEvent.stopPropagation(); onDelete(record); }}>
                Delete Technician
              </Menu.Item>
            </Menu>
          }
          trigger={["click"]}
        >
          <Button type="text" icon={<Icon icon="ph:dots-three-horizontal-fill" style={{ fontSize: '18px' }} />} onClick={(e) => e.stopPropagation()} />
        </Dropdown>
      ),
    },
  ];
};