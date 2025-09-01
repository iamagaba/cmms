import { Layout, Input, Badge, Dropdown, Avatar, Button, Menu } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SearchOutlined,
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
  LogoutOutlined,
} from "@ant-design/icons";

const { Header } = Layout;

interface AppHeaderProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const AppHeader = ({ collapsed, setCollapsed }: AppHeaderProps) => {
  const menu = (
    <Menu>
      <Menu.Item key="1" icon={<UserOutlined />}>Profile</Menu.Item>
      <Menu.Item key="2" icon={<SettingOutlined />}>Settings</Menu.Item>
      <Menu.Item key="3" icon={<QuestionCircleOutlined />}>Support</Menu.Item>
      <Menu.Divider />
      <Menu.Item key="4" icon={<LogoutOutlined />}>Logout</Menu.Item>
    </Menu>
  );

  return (
    <Header style={{ padding: '0 16px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
                fontSize: '16px',
                width: 64,
                height: 64,
            }}
        />
        <Input
          placeholder="Search work orders..."
          prefix={<SearchOutlined />}
          style={{ width: 300, marginLeft: 24 }}
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <Badge count={5}>
          <BellOutlined style={{ fontSize: '20px' }} />
        </Badge>
        <Dropdown overlay={menu} placement="bottomRight">
          <Avatar style={{ cursor: 'pointer' }} icon={<UserOutlined />} />
        </Dropdown>
      </div>
    </Header>
  );
};

export default AppHeader;