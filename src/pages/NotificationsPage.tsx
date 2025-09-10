import React from 'react';
import { Typography, Space, Card, Empty, List } from 'antd';
import PageHeader from '@/components/PageHeader';
import { useNotifications } from '@/context/NotificationsContext';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

const NotificationsPage = () => {
  const { notifications, markAllAsRead } = useNotifications();

  React.useEffect(() => {
    markAllAsRead(); // Mark all as read when the page is viewed
  }, [markAllAsRead]);

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <PageHeader title="Notifications" hideSearch />
      <Card>
        {notifications.length === 0 ? (
          <Empty description="No notifications to display." />
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={notifications}
            renderItem={notification => (
              <List.Item style={{ padding: '12px 0', backgroundColor: notification.is_read ? 'transparent' : '#e6f7ff' }}>
                <Link to={`/work-orders/${notification.work_order_id}`} className="block text-inherit hover:text-blue-600">
                  <List.Item.Meta
                    title={<Text>{notification.message}</Text>}
                    description={<Text type="secondary">{formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}</Text>}
                  />
                </Link>
              </List.Item>
            )}
          />
        )}
      </Card>
    </Space>
  );
};

export default NotificationsPage;