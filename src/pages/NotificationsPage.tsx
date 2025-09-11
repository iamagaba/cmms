import React from 'react';
import { Typography, Space, Card, Empty, List, Button, Row, Col } from 'antd';
import { useNotifications } from '@/context/NotificationsContext';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react'; // Import Icon from Iconify
import Breadcrumbs from "@/components/Breadcrumbs"; // Import Breadcrumbs

const { Text } = Typography;

const NotificationsPage = () => {
  const { notifications, unreadCount, markAllAsRead } = useNotifications();

  React.useEffect(() => {
    // Mark all as read when the page is viewed, but only if there are unread notifications
    if (unreadCount > 0) {
      markAllAsRead();
    }
  }, [markAllAsRead, unreadCount]);

  const pageActions = (
    <Button 
      type="primary" 
      icon={<Icon icon="ph:check-circle-fill" />} 
      onClick={markAllAsRead} 
      disabled={unreadCount === 0}
    >
      Mark All As Read
    </Button>
  );

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Breadcrumbs actions={pageActions} />
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