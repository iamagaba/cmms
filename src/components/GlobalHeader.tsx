import { Layout, Space, Badge, Avatar, Dropdown, Button, Input, Typography, theme } from 'antd';
import { Icon } from '@iconify/react';
import { useSession } from '@/context/SessionContext';
import { useSystemSettings } from '@/context/SystemSettingsContext';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { subscribeToPushNotifications } from '@/utils/push';

const { Header } = Layout;
const { Search } = Input;
const { Text } = Typography;

interface GlobalHeaderProps {
  onSearch?: (value: string) => void;
  unreadNotifications?: number;
}

export const GlobalHeader: React.FC<GlobalHeaderProps> = ({
  onSearch,
  unreadNotifications = 0,
}) => {
  const { token } = theme.useToken();
  const { session } = useSession();
  const { settings } = useSystemSettings();
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    async function checkSubscription() {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      }
    }
    checkSubscription();
  }, []);

  const handleSubscribe = async () => {
    const subscription = await subscribeToPushNotifications();
    if (subscription) {
      // Here you would send the subscription to your server
      console.log('Subscribed to push notifications:', subscription);
      setIsSubscribed(true);
    } else {
      console.error('Failed to subscribe to push notifications.');
    }
  };
  
  const userMenu = (
    <div className="user-menu p-2" style={{ minWidth: '200px' }}>
      <div className="px-4 py-2">
        <Text strong>{session?.user?.email}</Text>
        <Text type="secondary" className="block">{settings?.organization_name}</Text>
      </div>
      <div className="border-t my-2" />
      <div className="space-y-2">
        <Button type="text" block icon={<Icon icon="si:user" />}>
          Profile Settings
        </Button>
        <Button type="text" block icon={<Icon icon="si:settings" />}>
          Account Settings
        </Button>
        <Button type="text" block icon={<Icon icon="si:help-circle" />}>
          Help Center
        </Button>
        <div className="border-t my-2" />
        <Button type="text" block danger icon={<Icon icon="si:log-out" />}>
          Sign Out
        </Button>
      </div>
    </div>
  );

  const quickActions = (
    <div className="quick-actions-menu p-2" style={{ minWidth: '200px' }}>
      <Button type="text" block icon={<Icon icon="si:plus" />}>
        New Work Order
      </Button>
      <Button type="text" block icon={<Icon icon="si:calendar-plus" />}>
        Schedule Maintenance
      </Button>
      <Button type="text" block icon={<Icon icon="si:tool" />}>
        Request Parts
      </Button>
    </div>
  );

  return (
    <Header
      className="global-header"
      style={{
        padding: '0 24px',
        boxShadow: token.boxShadowTertiary,
        position: 'sticky',
        top: 0,
        zIndex: 10,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: token.colorBgElevated,
        backdropFilter: 'saturate(180%) blur(8px)',
      }}
    >
      <div style={{ flex: '1 1 0%' }}>
        <Search
          placeholder="Search work orders, assets, locations..."
          allowClear
          onSearch={onSearch}
          style={{ maxWidth: '400px' }}
        />
      </div>

      <Space size="large" align="center">
        <Button onClick={handleSubscribe} disabled={isSubscribed}>
          {isSubscribed ? 'Subscribed' : 'Subscribe to Notifications'}
        </Button>
        <Dropdown 
          overlay={quickActions} 
          placement="bottomRight"
          trigger={['click']}
        >
          <Button type="text" icon={<Icon icon="si:plus-circle" />}>
            Quick Actions
          </Button>
        </Dropdown>

        <Link to="/notifications">
          <Badge count={unreadNotifications} size="small">
            <Button 
              type="text" 
              icon={<Icon icon="si:bell" style={{ fontSize: '20px' }} />} 
            />
          </Badge>
        </Link>

        <Dropdown 
          overlay={userMenu} 
          placement="bottomRight" 
          trigger={['click']}
        >
          <div style={{ cursor: 'pointer' }}>
            <Space>
              <Avatar
                src={session?.user?.user_metadata?.avatar_url}
                style={{ backgroundColor: token.colorPrimary, color: token.colorWhite }}
              >
                {session?.user?.email?.[0]?.toUpperCase()}
              </Avatar>
              <Icon icon="si:chevron-down" style={{ fontSize: '12px' }} />
            </Space>
          </div>
        </Dropdown>
      </Space>
    </Header>
  );
};