import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/supabase';
import { showSuccess, showError } from '@/utils/toast';
import { useSession } from '@/context/SessionContext';
import { useSystemSettings } from '@/context/SystemSettingsContext';
import { useSearchParams, Link } from 'react-router-dom';
import AppBreadcrumb from "@/components/Breadcrumbs";
import ServiceSlaManagement from '@/components/ServiceSlaManagement';
import { requestNotificationPermission, subscribeUserToPush, saveSubscriptionToProfile, unsubscribeUserFromPush } from '@/utils/push';
import { useNotifications } from '@/context/NotificationsContext';
import { formatDistanceToNow } from 'date-fns';
import UserManagement from '@/components/UserManagement';
import DeveloperSuperAdmin from '@/components/DeveloperSuperAdmin';

// Ant Design components
import {
  Card,
  Tabs,
  Button,
  Input,
  Switch,
  Avatar,
  Select,
  Form,
  Row,
  Col,
  Space,
  Typography,
  Skeleton,
  List,
  Empty,
} from 'antd';
import { Icon } from '@iconify/react'; // Using Iconify for icons

const { TabPane } = Tabs;
const { Title, Paragraph, Text } = Typography;

// --- Notifications Tab ---
const NotificationsTab = () => {
  const { notifications, unreadCount, markAllAsRead } = useNotifications();

  React.useEffect(() => {
    if (unreadCount > 0) {
      markAllAsRead();
    }
  }, [markAllAsRead, unreadCount]);

  return (
    <Card
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={5} style={{ margin: 0 }}>Notifications</Title>
          <Button 
            type="primary" 
            icon={<Icon icon="ph:check-circle-fill" />} 
            onClick={markAllAsRead} 
            disabled={unreadCount === 0}
          >
            Mark All As Read
          </Button>
        </div>
      }
    >
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
  );
};



// --- System Settings Tab ---
const SystemTab = () => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const { settings, isLoading: isLoadingSettings } = useSystemSettings();
  const [loading, setLoading] = useState(false);

  const updateSystemSettingsMutation = useMutation({
    mutationFn: async (settingsToUpdate: { key: string; value: string | boolean | number | null }[]) => {
      const { error } = await supabase.from('system_settings').upsert(settingsToUpdate);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system_settings'] });
      showSuccess('System settings have been updated.');
      setLoading(false);
    },
    onError: (error) => {
      showError(error.message);
      setLoading(false);
    },
  });

  useEffect(() => {
    if (!isLoadingSettings && settings) {
      form.setFieldsValue({
        notifications: settings.notifications === 'true',
        defaultPriority: (settings.defaultPriority as "Low" | "Medium" | "High") || 'Medium',
        slaThreshold: settings.slaThreshold ? parseInt(settings.slaThreshold) : null,
      });
    }
  }, [isLoadingSettings, settings, form]);

  const logoUrl = settings.logo_url;

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `public/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('system_assets')
      .upload(filePath, file);

    if (uploadError) {
      showError(`Upload failed: ${uploadError.message}`);
      setLoading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('system_assets')
      .getPublicUrl(filePath);

    const { error: dbError } = await supabase
      .from('system_settings')
      .upsert([{ key: 'logo_url', value: publicUrl }]);

    if (dbError) {
      showError(`Failed to save logo URL: ${dbError.message}`);
      setLoading(false);
      return;
    }

    queryClient.invalidateQueries({ queryKey: ['system_settings'] });
    showSuccess('Logo updated successfully.');
    setLoading(false);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      const settingsToUpdate = Object.keys(values).map(key => ({
        key,
        value: (values as any)[key],
      }));
      updateSystemSettingsMutation.mutate(settingsToUpdate);
    } catch (info) {
      console.log('Validate Failed:', info);
      setLoading(false);
    }
  };

  if (isLoadingSettings) {
    return <Card title={<Title level={5} style={{ margin: 0 }}>System Configuration</Title>} style={{ width: '100%' }}><Skeleton active /></Card>;
  }

  return (
    <Card
      title={<Title level={5} style={{ margin: 0 }}>System Configuration</Title>}
      style={{ width: '100%' }}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="notifications"
          label="Enable Email Notifications"
          valuePropName="checked"
          tooltip="Toggle all system-wide email notifications for events like work order creation and status changes."
        >
          <Switch />
        </Form.Item>
        <Form.Item
          name="defaultPriority"
          label="Default Work Order Priority"
          rules={[{ required: true, message: 'Please select a default priority!' }]}
          tooltip="Set the default priority for all newly created work orders."
        >
          <Select style={{ width: 180 }} placeholder="Select a priority">
            <Select.Option value="Low">Low</Select.Option>
            <Select.Option value="Medium">Medium</Select.Option>
            <Select.Option value="High">High</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="slaThreshold"
          label="SLA Warning Threshold (days)"
          tooltip="Get a warning for work orders that are due within this many days."
        >
          <Input
            type="number"
            style={{ width: 180 }}
            placeholder="e.g. 3"
            min={0}
            onChange={e => form.setFieldsValue({ slaThreshold: e.target.value === '' ? null : Number(e.target.value) })}
          />
        </Form.Item>

        <Form.Item label="System Logo">
          <Paragraph type="secondary">
            Upload a logo to be displayed in the header and sidebar. Recommended size: 128x128px.
          </Paragraph>
          <Space align="center">
            {logoUrl && <Avatar size={64} shape="square" src={logoUrl} alt="System Logo" />}
            <label htmlFor="logo-upload" style={{ cursor: 'pointer' }}>
              <Button type="default" icon={<Icon icon="ph:upload-fill" />}>
                Change Logo
              </Button>
              <input id="logo-upload" type="file" style={{ display: 'none' }} onChange={handleLogoUpload} accept=".png,.jpg,.jpeg,.svg" />
            </label>
          </Space>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Save Settings
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

// --- Profile Settings Tab ---
const ProfileTab = () => {
  const { session } = useSession();
  const user = session?.user;
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const queryClient = useQueryClient();
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isPushLoading, setIsPushLoading] = useState(true);

  useEffect(() => {
    async function checkSubscription() {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.getSubscription();
          setIsSubscribed(!!subscription);
        } catch (error) {
          console.error('Error checking push notification subscription:', error);
        }
      }
      setIsPushLoading(false);
    }
    checkSubscription();
  }, []);

  const handleSubscriptionChange = async (checked: boolean) => {
    setIsPushLoading(true);
    if (checked) {
      const permissionGranted = await requestNotificationPermission();
      if (permissionGranted) {
        const subscription = await subscribeUserToPush();
        if (subscription) {
          await saveSubscriptionToProfile(subscription);
          setIsSubscribed(true);
          showSuccess('Push notifications enabled.');
        } else {
          showError('Failed to subscribe to push notifications.');
        }
      } else {
        showError('Permission for push notifications was denied.');
      }
    } else {
      await unsubscribeUserFromPush();
      setIsSubscribed(false);
      showSuccess('Push notifications disabled.');
    }
    setIsPushLoading(false);
  };

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

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: { first_name?: string; last_name?: string; avatar_url?: string; is_admin?: boolean }) => {
      if (!user?.id) throw new Error("User not authenticated.");
      
      // Update the profiles table
      const { error: profileError } = await supabase.from('profiles').update(updates).eq('id', user.id);
      if (profileError) throw new Error(profileError.message);
      
      // Also update the user metadata in Supabase Auth so the navigation shows the correct name
      if (updates.first_name || updates.last_name) {
        const full_name = `${updates.first_name || ''} ${updates.last_name || ''}`.trim();
        const { error: authError } = await supabase.auth.updateUser({
          data: { 
            full_name,
            ...user.user_metadata, // Preserve existing metadata like role
          }
        });
        if (authError) throw new Error(authError.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      showSuccess('Your profile has been updated.');
      setLoadingProfile(false);
      // Refresh the session to get updated user metadata
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    },
    onError: (error) => {
      showError(error.message);
      setLoadingProfile(false);
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (newPassword: string) => {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      showSuccess('Your password has been updated.');
      passwordForm.resetFields();
      setLoadingPassword(false);
    },
    onError: (error) => {
      showError(error.message);
      setLoadingPassword(false);
    },
  });

  useEffect(() => {
    if (user) {
      // Get name from user_metadata first (primary source), fallback to profiles table
      const fullName = user.user_metadata?.full_name || 
                      (profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : '');
      
      form.setFieldsValue({
        name: fullName,
        email: user.email || "",
        is_admin: profile?.is_admin || false,
      });
      passwordForm.resetFields();
    }
  }, [profile, user, form, passwordForm]);

  if (isLoadingProfile) {
    return <Skeleton active />;
  }

  const displayAvatar = profile?.avatar_url || user?.user_metadata?.avatar_url;

  const handleProfileSubmit = async () => {
    setLoadingProfile(true);
    try {
      const values = await form.validateFields();
      const [first_name, ...last_name_parts] = values.name.split(' ');
      const last_name = last_name_parts.join(' ');
      updateProfileMutation.mutate({ first_name, last_name, is_admin: values.is_admin });
    } catch (info) {
      console.log('Validate Failed:', info);
      setLoadingProfile(false);
    }
  };

  const handlePasswordSubmit = async () => {
    setLoadingPassword(true);
    try {
      const values = await passwordForm.validateFields();
      if (values.newPassword !== values.confirmPassword) {
        passwordForm.setFields([
          { name: 'confirmPassword', errors: ['New passwords do not match'] }
        ]);
        setLoadingPassword(false);
        return;
      }
      updatePasswordMutation.mutate(values.newPassword);
    } catch (info) {
      console.log('Validate Failed:', info);
      setLoadingPassword(false);
    }
  };

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} md={8}>
        <Card className="flex flex-col items-center p-6">
          <Avatar size={128} src={displayAvatar || undefined} style={{ marginBottom: 16 }}>
            <Icon icon="ph:user-fill" style={{ fontSize: '64px' }} />
          </Avatar>
          <Button type="default">Change Avatar</Button>
        </Card>
      </Col>
      <Col xs={24} md={16}>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Card
            title={<Title level={5} style={{ margin: 0 }}>Edit Profile Information</Title>}
            style={{ width: '100%' }}
          >
            <Form form={form} layout="vertical" onFinish={handleProfileSubmit}>
              <Form.Item name="name" label="Full Name" rules={[{ required: true, message: 'Full name is required' }]}>
                <Input placeholder="Your full name" />
              </Form.Item>
              <Form.Item name="email" label="Email Address">
                <Input placeholder="Your email address" disabled />
              </Form.Item>
              {user?.id === 'df02bbc5-167b-4a8c-a3f8-de0eb4d9db47' && ( // Admin check
                <Form.Item
                  name="is_admin"
                  label="Admin Access"
                  valuePropName="checked"
                  tooltip="Toggle your administrative privileges."
                >
                  <Switch />
                </Form.Item>
              )}
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loadingProfile}>
                  Update Profile
                </Button>
              </Form.Item>
            </Form>
          </Card>
          <Card
            title={<Title level={5} style={{ margin: 0 }}>Change Password</Title>}
            style={{ width: '100%' }}
          >
            <Form form={passwordForm} layout="vertical" onFinish={handlePasswordSubmit}>
              <Form.Item name="currentPassword" label="Current Password">
                <Input.Password placeholder="Current password" />
              </Form.Item>
              <Form.Item name="newPassword" label="New Password" rules={[{ required: true, message: 'Please enter a new password!' }]}>
                <Input.Password placeholder="New password" />
              </Form.Item>
              <Form.Item name="confirmPassword" label="Confirm New Password" rules={[{ required: true, message: 'Please confirm your new password!' }]}>
                <Input.Password placeholder="Confirm new password" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loadingPassword}>
                  Update Password
                </Button>
              </Form.Item>
            </Form>
          </Card>
          <Card
            title={<Title level={5} style={{ margin: 0 }}>Push Notifications</Title>}
            style={{ width: '100%' }}
          >
            <Form.Item
              label="Enable Push Notifications"
              valuePropName="checked"
              tooltip="Enable push notifications on this device."
            >
              <Switch
                checked={isSubscribed}
                loading={isPushLoading}
                onChange={handleSubscriptionChange}
              />
            </Form.Item>
          </Card>
        </Space>
      </Col>
      <Col xs={24}>
        <DeveloperSuperAdmin />
      </Col>
    </Row>
  );
};

// --- Main Settings Page Component ---
const SettingsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { session } = useSession();
  const userRole = session?.user?.user_metadata?.role || 'technician';

  const handleTabChange = (key: string) => {
    setSearchParams({ tab: key });
  };

  const allTabItems = [
    { label: <Space><Icon icon="ph:user-fill" />My Profile</Space>, key: 'profile', children: <ProfileTab />, roles: ['admin', 'manager', 'technician', 'maintenance_frontdesk', 'maintenance_backoffice', 'call_center_agent', 'superadmin'] },
    { label: <Space><Icon icon="ph:bell-fill" />Notifications</Space>, key: 'notifications', children: <NotificationsTab />, roles: ['admin', 'manager', 'technician', 'maintenance_frontdesk', 'maintenance_backoffice', 'call_center_agent', 'superadmin'] },
    { label: <Space><Icon icon="ph:users-fill" />User Management</Space>, key: 'user-management', children: <UserManagement />, roles: ['admin', 'superadmin'] },
    { label: <Space><Icon icon="ph:wrench-fill" />Service & SLA</Space>, key: 'service-sla', children: <ServiceSlaManagement />, roles: ['admin', 'superadmin'] },
    { label: <Space><Icon icon="ph:gear-fill" />System Settings</Space>, key: 'system-settings', children: <SystemTab />, roles: ['admin', 'superadmin'] },
  ];

  const availableTabs = allTabItems.filter(tab => tab.roles.includes(userRole));
  const activeTab = searchParams.get('tab') || availableTabs[0]?.key || 'profile';

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <AppBreadcrumb />
      <div className="sticky-header-secondary">
        <Tabs activeKey={activeTab} onChange={handleTabChange} style={{ width: '100%' }}>
          {availableTabs.map(item => (
            <TabPane tab={item.label} key={item.key}>
              {item.children}
            </TabPane>
          ))}
        </Tabs>
      </div>
    </Space>
  );
};

export default SettingsPage;