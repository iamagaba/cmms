import React from "react";
import { Row, Col, Typography, Space, Input, Badge, Dropdown, Avatar, Menu, List, Empty } from "antd";
import {
  SearchOutlined,
  UserOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useSession } from "@/context/SessionContext";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";

const { Title, Text } = Typography;

interface PageHeaderProps {
  title: React.ReactNode;
  actions?: React.ReactNode;
  onSearch?: (value: string) => void;
  onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  hideSearch?: boolean;
}

const PageHeader = ({ title, actions, onSearch, onSearchChange, hideSearch = false }: PageHeaderProps) => {
  const navigate = useNavigate();
  const { session } = useSession();
  const user = session?.user;

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showError('Failed to log out: ' + error.message);
    } else {
      showSuccess('You have been logged out.');
      navigate('/login');
    }
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="1" icon={<UserOutlined />} onClick={() => navigate('/settings?tab=profile-settings')}>Profile</Menu.Item>
      <Menu.Item key="2" icon={<SettingOutlined />} onClick={() => navigate('/settings?tab=system-settings')}>Settings</Menu.Item>
      <Menu.Item key="3" icon={<QuestionCircleOutlined />}>Support</Menu.Item>
      <Menu.Divider />
      <Menu.Item key="4" icon={<LogoutOutlined />} onClick={handleLogout}>Logout</Menu.Item>
    </Menu>
  );

  return (
    <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
      <Col>
        {typeof title === 'string' ? <Title level={4} style={{ margin: 0 }}>{title}</Title> : title}
      </Col>
      <Col>
        <Space size="middle" align="center">
          {!hideSearch && (
            <Input
              placeholder="Search..."
              prefix={<SearchOutlined />}
              style={{ width: 250 }}
              onPressEnter={(e) => onSearch && onSearch(e.currentTarget.value)}
              onChange={onSearchChange}
              allowClear
            />
          )}
          <Dropdown overlay={userMenu} placement="bottomRight">
            <Avatar style={{ cursor: 'pointer' }} src={user?.user_metadata?.avatar_url || undefined} icon={<UserOutlined />} />
          </Dropdown>
          {actions && <>{actions}</>}
        </Space>
      </Col>
    </Row>
  );
};

export default PageHeader;