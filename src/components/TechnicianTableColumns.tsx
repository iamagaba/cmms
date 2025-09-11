import { Avatar, Button, Dropdown, Menu, Tag, Typography, Select, Space } from "antd";
import { Icon } from '@iconify/react';
import { Technician } from "@/types/supabase";
import { Link } from "react-router-dom";
import { useSession } from "@/context/SessionContext"; // Import useSession
import { useQuery } from "@tanstack/react-query"; // Import useQuery
import { supabase } from "@/integrations/supabase/client"; // Import supabase client
import { Profile } from "@/types/supabase"; // Import Profile type
import { snakeToCamelCase } from "@/utils/data-helpers"; // Import snakeToCamelCase

const { Text } = Typography;
const { Option } = Select;

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

interface GetColumnsProps {
  onEdit: (record: TechnicianRow) => void;
  onDelete: (record: TechnicianRow) => void;
  onUpdateStatus: (id: string, status: Technician['status']) => void; // New prop for status update
}

export const getColumns = ({
  onEdit,
  onDelete,
  onUpdateStatus,
}: GetColumnsProps) => {
  const { session } = useSession();
  const currentUserId = session?.user?.id;

  const { data: userProfile, isLoading: isLoadingProfile } = useQuery<Profile | null>({
    queryKey: ['userProfile', currentUserId],
    queryFn: async () => {
      if (!currentUserId) return null;
      // Select all fields to match the Profile type
      const { data, error } = await supabase.from('profiles').select('*').eq('id', currentUserId).single();
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!currentUserId,
  });

  const isAdmin = userProfile?.is_admin;

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
              <Option value="available"><Tag color={statusColorMap["available"]}>Available</Tag></Option>
              <Option value="busy"><Tag color={statusColorMap["busy"]}>Busy</Tag></Option>
              <Option value="offline"><Tag color={statusColorMap["offline"]}>Offline</Tag></Option>
            </Select>
          );
        }
        return <Tag color={statusColorMap[status || 'offline']}>{statusTextMap[status || 'offline']}</Tag>;
      }
    },
    {
      title: "Open Tasks",
      dataIndex: "openTasks",
      sorter: (a: TechnicianRow, b: TechnicianRow) => a.openTasks - b.openTasks,
    },
    {
      title: "Specializations", // Changed title
      dataIndex: "specializations", // Changed dataIndex
      render: (specializations: string[] | null) => (specializations || []).map(s => <Tag key={s}>{s}</Tag>),
    },
    {
      title: "Actions",
      key: "actions",
      align: "right" as const,
      render: (_: any, record: TechnicianRow) => (
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