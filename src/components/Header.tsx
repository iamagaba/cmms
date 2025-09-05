import { Layout, Input, Badge, Dropdown, Avatar, Menu, List, Typography, Empty } from "antd";
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
  CalendarOutlined,
} from "@ant-design/icons";
import { NavLink, useLocation, Link } from "react-router-dom";
import { useNotifications } from "@/context/NotificationsContext";
import { formatDistanceToNow } from 'date-fns';

const { Header } = Layout;
const { Text } = Typography;

const navItems = [
  { key: "/", label: "Dashboard", icon: <DashboardOutlined /> },
  { key: "/work-orders", label: "Work Orders", icon: <ToolOutlined /> },
  { key: "/calendar", label: "Calendar", icon: <CalendarOutlined /> },
  { key: "/map", label: "Map View", icon: <GlobalOutlined /> },
  { key: "/technicians", label: "Technicians", icon: <UsergroupAddOutlined /> },
  { key: "/locations", label: "Locations", icon: <EnvironmentOutlined /> },
  { key: "/analytics", label: "Analytics", icon: <BarChartOutlined /> },
  { key: "/settings", label: "Settings", icon: <SettingOutlined /> },
];

const AppHeader = () => {
  const location = useLocation();
  const { notifications, unreadCount, markAllAsRead } = useNotifications();

  const userMenu = (
    <Menu>
      <Menu.Item key="1" icon={<UserOutlined />}>Profile</Menu.Item>
      <Menu.Item key="2" icon={<SettingOutlined />}>Settings</Menu.Item>
      <Menu.Item key="3" icon={<QuestionCircleOutlined />}>Support</Menu.Item>
      <Menu.Divider />
      <Menu.Item key="4" icon={<LogoutOutlined />}>Logout</Menu.Item>
    </Menu>
  );

  const notificationMenu = (
    <div style={{ width: 350, backgroundColor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', borderRadius: '4px' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
        <Text strong>Notifications</Text>
      </div>
      <List
        itemLayout="horizontal"
        dataSource={notifications}
        locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No new notifications" /> }}
        renderItem={item => (
          <List.Item style={{ padding: '12px 16px', backgroundColor: item.is_read ? 'transparent' : '#e6f7ff' }}>
            <Link to={`/work-orders/${item.work_order_number}`} style={{ color: 'inherit', textDecoration: 'none', width: '100%' }}>
              <List.Item.Meta
                title={<Text>{item.message}</Text>}
                description={<Text type="secondary">{formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</Text>}
              />
            </Link>
          </List.Item>
        )}
        style={{ maxHeight: 400, overflowY: 'auto' }}
      />
    </div>
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
        <Dropdown overlay={notificationMenu} placement="bottomRight" trigger={['click']} onOpenChange={(open) => open && markAllAsRead()}>
          <Badge count={unreadCount}>
            <BellOutlined style={{ fontSize: '20px', cursor: 'pointer' }} />
          </Badge>
        </Dropdown>
        <Dropdown overlay={userMenu} placement="bottomRight">
          <Avatar style={{ cursor: 'pointer' }} icon={<UserOutlined />} />
        </Dropdown>
      </div>
    </Header>
  );
};

export default AppHeader;