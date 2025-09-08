import { Card, Avatar, Typography, Tag, Dropdown, Menu, Button, Space } from "antd";
import { MoreOutlined, EditOutlined, DeleteOutlined, MailOutlined, PhoneOutlined } from "@ant-design/icons";
import { Technician } from "@/types/supabase";
import { Link } from "react-router-dom";

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
  const menu = (
    <Menu>
      <Menu.Item key="edit" icon={<EditOutlined />} onClick={() => onEdit(technician)}>
        Edit Details
      </Menu.Item>
      <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={() => onDelete(technician)}>
        Delete Technician
      </Menu.Item>
    </Menu>
  );

  return (
    <Card hoverable className="lift-on-hover" style={{ height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Space direction="vertical">
          <Link to={`/technicians/${technician.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <Space>
              <Avatar size={48} src={technician.avatar || undefined}>
                {technician.name.split(' ').map(n => n[0]).join('')}
              </Avatar>
              <div>
                <Title level={5} style={{ margin: 0 }}>{technician.name}</Title>
                <Text type="secondary">{technician.specialization}</Text>
              </div>
            </Space>
          </Link>
        </Space>
        <Dropdown overlay={menu} trigger={["click"]}>
          <Button type="text" icon={<MoreOutlined />} />
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
            <Text type="secondary" style={{ fontSize: 12 }}><MailOutlined /> {technician.email}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}><PhoneOutlined /> {technician.phone}</Text>
        </Space>
      </div>
    </Card>
  );
};