import { Layout, Input, Badge, Dropdown, Avatar, Menu, Row, Col, Typography } from "antd";
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
import '../App.css';

const { Header } = Layout;
const { Title } = Typography;

const navItems = [
  { key: "/", label: "Dashboard", icon: <DashboardOutlined /> },
  { key: "/work-orders", label: "Work Orders", icon: <ToolOutlined /> },
  { key: "/map", label: "Map View", icon: <GlobalOutlined /> },
  { key: "/technicians", label: "Technicians", icon: <UsergroupAddOutlined /> },
  { key: "/locations", label: "Locations", icon: <EnvironmentOutlined /> },
  { key: "/analytics", label: "Analytics", icon: <BarChartOutlined /> },
  { key: "/settings", label: "Settings", icon: <SettingOutlined /> },
];

const Logo = () => (
  <div className="logo">
    <FireOutlined />
    <Title level={4} style={{ margin: 0, marginLeft: '8px', color: '#1677ff' }}>GOGO Electric</Title>
  </div>
);

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
    <Header className="app-header">
      <Row justify="space-between" align="middle" style={{ width: '100%' }}>
        <Col xs={12} sm={12} md={4}>
          <Logo />
        </Col>
        <Col xs={0} sm={0} md={12}>
          <Menu theme="light" mode="horizontal" selectedKeys={[location.pathname]} className="header-menu">
            {navItems.map(item => (
              <Menu.Item key={item.key} icon={item.icon}>
                <NavLink to={item.key}>{item.label}</NavLink>
              </Menu.Item>
            ))}
          </Menu>
        </Col>
        <Col xs={12} sm={12} md={8}>
          <Row justify="end" align="middle" gutter={24}>
            <Col>
              <Input
                placeholder="Search..."
                prefix={<SearchOutlined />}
                className="search-input"
              />
            </Col>
            <Col>
              <Badge count={5}>
                <BellOutlined style={{ fontSize: '20px', cursor: 'pointer' }} />
              </Badge>
            </Col>
            <Col>
              <Dropdown overlay={userMenu} placement="bottomRight">
                <Avatar style={{ cursor: 'pointer' }} icon={<UserOutlined />} />
              </Dropdown>
            </Col>
          </Row>
        </Col>
      </Row>
    </Header>
  );
};

export default AppHeader;