import { Layout, Input, Badge, Dropdown, Avatar, Menu, List, Typography, Empty } from "antd";
import {
  SearchOutlined,
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
  LogoutOutlined,
  FireOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useNotifications } from "@/context/NotificationsContext";
import { formatDistanceToNow } from 'date-fns';
import { useSession } from "@/context/SessionContext";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";

const { Header } = Layout;
const { Text } = Typography;

const AppHeader = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
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
      <Menu.Item key="1" icon={<UserOutlined />}>Profile</Menu.Item>
      <Menu.Item key="2" icon={<SettingOutlined />}>Settings</Menu.Item>
      <Menu.Item key="3" icon={<QuestionCircleOutlined />}>Support</Menu.Item>
      <Menu.Divider />
      <Menu.Item key="4" icon={<LogoutOutlined />} onClick={handleLogout}>Logout</Menu.Item>
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
    <Header style={{ padding: '0 24px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', marginRight: '24px', textDecoration: 'none' }}>
          <FireOutlined style={{color: '#6A0DAD', fontSize: '24px'}} />
          <span style={{color: '#6A0DAD', marginLeft: '8px', fontWeight: 'bold', fontSize: '18px'}}>GOGO Electric</span>
        </Link>
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
          <Avatar style={{ cursor: 'pointer' }} src={user?.user_metadata?.avatar_url || undefined} icon={<UserOutlined />} />
        </Dropdown>
      </div>
    </Header>
  );
};

export default AppHeader;