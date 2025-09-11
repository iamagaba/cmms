import React from 'react';
import { Layout, Space, Avatar, Dropdown, Menu, Badge, Button, Typography } from 'antd';
import { NavLink, useNavigate } from 'react-router-dom';
import { UserOutlined, BellOutlined, LogoutOutlined, SettingOutlined, FireOutlined } from '@ant-design/icons';
import { useNotifications } from '@/context/NotificationsContext';
import { useSession } from '@/context/SessionContext';
import { useSystemSettings } from '@/context/SystemSettingsContext';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { useQuery } from '@tanstack/react-query';
import { Profile } from '@/types/supabase';

const { Header } = Layout;
const { Text } = Typography;

interface GlobalHeaderProps {
  logoUrl: string | null;
}

const GlobalHeader: React.FC<GlobalHeaderProps> = ({ logoUrl }) => {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  const { session } = useSession();
  const user = session?.user;

  const { data: profile, isLoading: isLoadingProfile } = useQuery<Profile | null>({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!user?.id,
  });

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
      <Menu.Item key="profile" icon={<UserOutlined />} onClick={() => navigate('/settings?tab=profile-settings')}>
        My Profile
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingOutlined />} onClick={() => navigate('/settings?tab=system-settings')}>
        Settings
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout} danger>
        Logout
      </Menu.Item>
    </Menu>
  );

  const displayName = profile?.first_name || user?.email || 'Guest';
  const displayAvatar = profile?.avatar_url || user?.user_metadata?.avatar_url;

  return (
    <Header style={{ padding: '0 24px', background: '#fff', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 64 }}>
      <NavLink to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', gap: '12px', overflow: 'hidden' }}>
        {logoUrl ? (
          <img src={logoUrl} alt="System Logo" style={{ height: '32px' }} />
        ) : (
          <FireOutlined style={{ color: '#6A0DAD', fontSize: '28px' }} />
        )}
        <Typography.Title level={4} style={{ margin: 0, color: '#6A0DAD', whiteSpace: 'nowrap' }}>
          GOGO Electric
        </Typography.Title>
      </NavLink>
      <Space size="middle">
        <NavLink to="/notifications">
          <Badge count={unreadCount} size="small" offset={[5, 0]} style={{ backgroundColor: '#6A0DAD' }}>
            <BellOutlined style={{ fontSize: '20px', color: '#6A0DAD' }} />
          </Badge>
        </NavLink>
        <Dropdown overlay={userMenu} trigger={['click']}>
          <Button type="text" style={{ padding: 0, height: 'auto' }}>
            <Space>
              <Avatar size="small" src={displayAvatar || undefined} icon={<UserOutlined />} />
              <Text strong>{displayName}</Text>
            </Space>
          </Button>
        </Dropdown>
      </Space>
    </Header>
  );
};

export default GlobalHeader;