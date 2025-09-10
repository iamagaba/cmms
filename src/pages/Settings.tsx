import { useState, useEffect } from 'react';
import { Card, Tabs, Form, Input, Button, Select, Switch, Avatar, Typography, Space, Row, Col, Skeleton, Upload } from 'antd';
import { UserOutlined, SettingOutlined, BellOutlined, LockOutlined, SaveOutlined, UploadOutlined, ToolOutlined } from '@ant-design/icons';
import { TechnicianDataTable } from '@/components/TechnicianDataTable';
import { TechnicianFormDialog } from '@/components/TechnicianFormDialog';
import { showSuccess, showError } from '@/utils/toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Technician, WorkOrder, Profile, Location } from '@/types/supabase';
import { useSession } from '@/context/SessionContext';
import { camelToSnakeCase } from "@/utils/data-helpers";
import { useSystemSettings } from '@/context/SystemSettingsContext';
import PageHeader from '@/components/PageHeader';
import { useSearchParams } from 'react-router-dom';
import ServiceSlaManagement from '@/components/ServiceSlaManagement';

const { Title } = Typography;
const { Option = Select.Option } = Select;

const UserManagement = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTechnician, setEditingTechnician] = useState<Technician | null>(null);

  const { data: technicians, isLoading: isLoadingTechnicians } = useQuery<Technician[]>({ queryKey: ['technicians'], queryFn: async () => { const { data, error } = await supabase.from('technicians').select('*'); if (error) throw new Error(error.message); return data || []; } });
  const { data: workOrders, isLoading: isLoadingWorkOrders } = useQuery<WorkOrder[]>({ queryKey: ['work_orders'], queryFn: async () => { const { data, error } = await supabase.from('work_orders').select('*'); if (error) throw new Error(error.message); return data || []; } });
  const { data: locations, isLoading: isLoadingLocations } = useQuery<Location[]>({ queryKey: ['locations'], queryFn: async () => { const { data, error } = await supabase.from('locations').select('*'); if (error) throw new Error(error.message); return data || []; } });

  const technicianMutation = useMutation({
    mutationFn: async (technicianData: Partial<Technician>) => { const { error } = await supabase.from('technicians').upsert([technicianData]); if (error) throw new Error(error.message); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['technicians'] }); showSuccess('Technician has been saved.'); },
    onError: (error) => showError(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from('technicians').delete().eq('id', id); if (error) throw new Error(error.message); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['technicians'] }); showSuccess('Technician has been deleted.'); },
    onError: (error) => showError(error.message),
  });

  const handleSave = (technicianData: Technician) => { technicianMutation.mutate(camelToSnakeCase(technicianData)); setIsDialogOpen(false); setEditingTechnician(null); };
  const handleDelete = (technicianData: Technician) => { deleteMutation.mutate(technicianData.id); };
  const handleEdit = (technician: Technician) => { setEditingTechnician(technician); setIsDialogOpen(true); };

  const isLoading = isLoadingTechnicians || isLoadingWorkOrders || isLoadingLocations;

  return (
    <Card>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col><Title level={5}>Manage Users</Title></Col>
        <Col><Button type="primary" onClick={() => { setEditingTechnician(null); setIsDialogOpen(true); }}>Add User</Button></Col>
      </Row>
      {isLoading ? <Skeleton active /> : <TechnicianDataTable technicians={technicians || []} workOrders={workOrders || []} onEdit={handleEdit} onDelete={handleDelete} />}
      {isDialogOpen && <TechnicianFormDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} onSave={handleSave} technician={editingTechnician} locations={locations || []} />}
    </Card>
  );
};

const SystemSettings = () => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const { settings, isLoading: isLoadingSettings } = useSystemSettings();

  const updateSystemSettingsMutation = useMutation({
    mutationFn: async (settingsToUpdate: { key: string; value: string | boolean | number | null }[]) => {
      const { error } = await supabase.from('system_settings').upsert(settingsToUpdate);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system_settings'] });
      showSuccess('System settings have been updated.');
    },
    onError: (error) => showError(error.message),
  });

  const onFinish = (values: any) => {
    const settingsToUpdate = Object.keys(values).map(key => ({
      key,
      value: values[key],
    }));
    updateSystemSettingsMutation.mutate(settingsToUpdate);
  };

  useEffect(() => {
    if (!isLoadingSettings && settings) {
      form.setFieldsValue({
        notifications: settings.notifications === 'true', // Convert string to boolean
        defaultPriority: settings.defaultPriority || 'Medium',
        slaThreshold: settings.slaThreshold ? parseInt(settings.slaThreshold) : 3,
      });
    }
  }, [isLoadingSettings, settings, form]);

  const logoUrl = settings.logo_url;

  const handleLogoUpload = async (options: any) => {
    const { file } = options;
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `public/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('system_assets')
      .upload(filePath, file);

    if (uploadError) {
      showError(`Upload failed: ${uploadError.message}`);
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
      return;
    }

    queryClient.invalidateQueries({ queryKey: ['system_settings'] });
    showSuccess('Logo updated successfully.');
  };

  if (isLoadingSettings) {
    return <Card title="System Configuration"><Skeleton active /></Card>;
  }

  return (
    <Card title="System Configuration">
      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ notifications: true, defaultPriority: 'Medium', slaThreshold: 3 }}>
        <Form.Item name="notifications" label="Enable Email Notifications" valuePropName="checked" tooltip="Toggle all system-wide email notifications for events like work order creation and status changes."><Switch /></Form.Item>
        <Form.Item name="defaultPriority" label="Default Work Order Priority" tooltip="Set the default priority for all newly created work orders."><Select style={{ maxWidth: 200 }}><Option value="Low">Low</Option><Option value="Medium">Medium</Option><Option value="High">High</Option></Select></Form.Item>
        <Form.Item name="slaThreshold" label="SLA Warning Threshold (days)" tooltip="Get a warning for work orders that are due within this many days."><Input type="number" style={{ maxWidth: 200 }} /></Form.Item>
        
        <Form.Item label="System Logo" tooltip="Upload a logo to be displayed in the header and sidebar. Recommended size: 128x128px.">
          <Space align="center">
            {logoUrl && <Avatar src={logoUrl} size={64} shape="square" />}
            <Upload
              customRequest={handleLogoUpload}
              maxCount={1}
              showUploadList={false}
              accept=".png,.jpg,.jpeg,.svg"
            >
              <Button icon={<UploadOutlined />}>Change Logo</Button>
            </Upload>
          </Space>
        </Form.Item>

        <Form.Item><Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={updateSystemSettingsMutation.isPending}>Save Settings</Button></Form.Item>
      </Form>
    </Card>
  );
};

const ProfileSettings = () => {
  const { session } = useSession();
  const user = session?.user;
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

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
      const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      showSuccess('Your profile has been updated.');
    },
    onError: (error) => showError(error.message),
  });

  const onFinish = (values: any) => {
    const { name, email, is_admin } = values;
    const [first_name, ...last_name_parts] = name.split(' ');
    const last_name = last_name_parts.join(' ');
    updateProfileMutation.mutate({ first_name, last_name, is_admin });
    console.log('Updating profile:', values);
  };

  useEffect(() => {
    if (profile && user) {
      form.setFieldsValue({
        name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
        email: user.email,
        is_admin: profile.is_admin,
      });
    }
  }, [profile, user, form]);

  if (isLoadingProfile) {
    return <Skeleton active />;
  }

  const displayName = profile?.first_name || user?.email || 'Guest';
  const displayEmail = user?.email || 'N/A';
  const displayAvatar = profile?.avatar_url || user?.user_metadata?.avatar_url;

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} md={8}>
        <Card>
          <Space direction="vertical" align="center" style={{ width: '100%' }}>
            <Avatar size={128} src={displayAvatar || undefined} icon={<UserOutlined />} />
            <Button>Change Avatar</Button>
          </Space>
        </Card>
      </Col>
      <Col xs={24} md={16}>
        <Card title="Edit Profile Information">
          <Form layout="vertical" form={form} onFinish={onFinish}>
            <Form.Item name="name" label="Full Name" rules={[{ required: true, message: 'Please enter your full name!' }]}>
              <Input prefix={<UserOutlined />} />
            </Form.Item>
            <Form.Item name="email" label="Email Address" rules={[{ required: true, type: 'email', message: 'Please enter a valid email!' }]}>
              <Input prefix={<UserOutlined />} disabled />
            </Form.Item>
            {user?.id === 'df02bbc5-167b-4a8c-a3f8-de0eb4d9db47' && (
              <Form.Item name="is_admin" label="Admin Access" valuePropName="checked" tooltip="Toggle your administrative privileges.">
                <Switch />
              </Form.Item>
            )}
            <Form.Item><Button type="primary" htmlType="submit" loading={updateProfileMutation.isPending}>Update Profile</Button></Form.Item>
          </Form>
        </Card>
        <Card title="Change Password" style={{ marginTop: 16 }}>
          <Form layout="vertical">
            <Form.Item name="currentPassword" label="Current Password">
              <Input.Password prefix={<LockOutlined />} />
            </Form.Item>
            <Form.Item name="newPassword" label="New Password">
              <Input.Password prefix={<LockOutlined />} />
            </Form.Item>
            <Form.Item name="confirmPassword" label="Confirm New Password">
              <Input.Password prefix={<LockOutlined />} />
            </Form.Item>
            <Form.Item><Button type="primary">Update Password</Button></Form.Item>
          </Form>
        </Card>
      </Col>
    </Row>
  );
};

const SettingsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'user-management'; // Default to 'user-management'

  const handleTabChange = (key: string) => {
    setSearchParams({ tab: key });
  };

  const tabItems = [
    { label: <span><UserOutlined />User Management</span>, key: 'user-management', children: <UserManagement /> },
    { label: <span><ToolOutlined />Service & SLA</span>, key: 'service-sla', children: <ServiceSlaManagement /> },
    { label: <span><SettingOutlined />System Settings</span>, key: 'system-settings', children: <SystemSettings /> },
    { label: <span><BellOutlined />My Profile</span>, key: 'profile-settings', children: <ProfileSettings /> },
  ];
  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <PageHeader title="Settings" hideSearch />
      <Tabs activeKey={activeTab} onChange={handleTabChange} items={tabItems} />
    </Space>
  );
};

export default SettingsPage;