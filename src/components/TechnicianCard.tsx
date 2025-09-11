import { Card, Avatar, Typography, Tag, Dropdown, Menu, Button, Space } from "antd";
import { Icon } from '@iconify/react'; // Import Icon from Iconify
import { Technician } from "@/types/supabase";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

export type TechnicianCardData = Technician & {
  openTasks: number;
};

interface TechnicianCardProps {
  technician: TechnicianCardData;
  onEdit: (technician: TechnicianCardData) => void;
  onDelete: (technician: TechnicianCardData) => void;
}

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

export const TechnicianCard = ({ technician, onEdit, onDelete }: TechnicianCardProps) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/technicians/${technician.id}`);
  };

  const menu = (
    <Menu>
      <Menu.Item key="edit" icon={<Icon icon="si:edit" />} onClick={(e) => { e.domEvent.stopPropagation(); onEdit(technician); }}>
        Edit Details
      </Menu.Item>
      <Menu.Item key="delete" icon={<Icon icon="si:trash" />} danger onClick={(e) => { e.domEvent.stopPropagation(); onDelete(technician); }}>
        Delete Technician
      </Menu.Item>
    </Menu>
  );

  return (
    <Card hoverable className="lift-on-hover" style={{ height: '100%', cursor: 'pointer' }} onClick={handleCardClick}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Space direction="vertical">
          <Space>
            <Avatar size={48} src={technician.avatar || undefined}>
              {technician.name.split(' ').map(n => n[0]).join('')}
            </Avatar>
            <div>
              <Title level={5} style={{ margin: 0 }}>{technician.name}</Title>
              <Text type="secondary">{technician.specialization}</Text>
            </div>
          </Space>
        </Space>
        <Dropdown overlay={menu} trigger={["click"]}>
          <Button type="text" icon={<Icon icon="si:more-horizontal" />} onClick={(e) => e.stopPropagation()} />
        </Dropdown>
      </div>
      
      <div style={{ marginTop: 16 }}>
        <Tag color={statusColorMap[technician.status || 'offline']}>{statusTextMap[technician.status || 'offline']}</Tag>
      </div>

      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Text type="secondary">Open Tasks</Text>
          <Title level={4} style={{ margin: 0 }}>{technician.openTasks}</Title>
        </div>
        <Space direction="vertical" align="end">
            <Text type="secondary" style={{ fontSize: 12 }}><Icon icon="si:mail" /> {technician.email}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}><Icon icon="si:phone" /> {technician.phone}</Text>
        </Space>
      </div>
    </Card>
  );
};