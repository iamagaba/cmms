import { Layout, Input, Badge, Dropdown, Avatar, Menu } from "antd";
import {
  SearchOutlined,
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
  LogoutOutlined,
  FireOutlined,
  DashboardOutlined,
  ToolOutlined,
  UsergroupAddOutlined,
  EnvironmentOutlined,
  BarChartOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import { NavLink, useLocation } from "react-router-dom";

const { Header } = Layout;

const navItems = [
  { key: "/", label: "Dashboard", icon: <DashboardOutlined /> },
  { key: "/work-orders", label: "Work Orders", icon: <ToolOutlined /> },
  { key: "/map", label: "Map View", icon: <GlobalOutlined /> },
  { key: "/technicians", label: "Technicians", icon: <UsergroupAddOutlined /> },
  { key: "/locations", label: "Locations", icon: <EnvironmentOutlined /> },
  { key: "/analytics", label: "Analytics", icon: <BarChartOutlined /> },
  { key: "/settings", label: "Settings", icon: <SettingOutlined /> },
];

const AppHeader = () => {
  const location = useLocation();

  const userMenu = (
    <Menu>
      <Menu.Item key="1" icon={<UserOutlined />}>Profile</Menu.Item>
      <Menu.Item key="2" icon={<SettingOutlined />}>Settings</Menu.Item>
      <Menu.Item key="3" icon={<QuestionCircleOutlined />}>Support</Menu.Item>
      <Menu.Divider />
      <Menu.Item key="4" icon={<LogoutOutlined />}>Logout</Menu.Item>
    </Menu>
  );

  return (
    <Header style={{ padding: '0 24px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginRight: '24px' }}>
          <FireOutlined style={{color: '#1677ff', fontSize: '24px'}} />
          <span style={{color: '#1677ff', marginLeft: '8px', fontWeight: 'bold', fontSize: '18px'}}>GOGO Electric</span>
        </div>
        <Menu theme="light" mode="horizontal" selectedKeys={[location.pathname]} style={{ lineHeight: '62px', borderBottom: 'none', flex: 1 }}>
          {navItems.map(item => (
            <Menu.Item key={item.key} icon={item.icon}>
              <NavLink to={item.key}>{item.label}</NavLink>
            </Menu.Item>
          ))}
        </Menu>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <Input
          placeholder="Search..."
          prefix={<SearchOutlined />}
          style={{ width: 250 }}
        />
        <Badge count={5}>
          <BellOutlined style={{ fontSize: '20px', cursor: 'pointer' }} />
        </Badge>
        <Dropdown overlay={userMenu} placement="bottomRight">
          <Avatar style={{ cursor: 'pointer' }} icon={<UserOutlined />} />
        </Dropdown>
      </div>
    </Header>
  );
};

export default AppHeader;