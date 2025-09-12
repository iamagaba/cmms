import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Technician, WorkOrder, Profile, Location } from '@/types/supabase';
import { showSuccess, showError } from '@/utils/toast';
import { camelToSnakeCase, snakeToCamelCase } from "@/utils/data-helpers";
import { useSession } from '@/context/SessionContext';
import { useSystemSettings } from '@/context/SystemSettingsContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Breadcrumbs from "@/components/Breadcrumbs";
import ServiceSlaManagement from '@/components/ServiceSlaManagement';

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
  Modal,
  DatePicker,
  Popconfirm,
} from 'antd';
import { Icon } from '@iconify/react'; // Using Iconify for icons
import { TechnicianDataTable } from '@/components/TechnicianDataTable';
import { TechnicianFormDialog } from '@/components/TechnicianFormDialog';
import dayjs from 'dayjs';

const { TabPane } = Tabs;
const { Option } = Select;
const { Title, Text, Paragraph } = Typography;

// --- User Management Tab ---
const UserManagement = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTechnician, setEditingTechnician] = useState<Technician | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const { data: technicians, isLoading: isLoadingTechnicians } = useQuery<Technician[]>({
    queryKey: ['technicians'],
    queryFn: async () => {
      const { data, error } = await supabase.from('technicians').select('*').order('name');
      if (error) throw new Error(error.message);
      return (data || []).map(snakeToCamelCase) as Technician[];
    }
  });
  const { data: workOrders, isLoading: isLoadingWorkOrders } = useQuery<WorkOrder[]>({ queryKey: ['work_orders'], queryFn: async () => { const { data, error } = await supabase.from('work_orders').select('*'); if (error) throw new Error(error.message); return data || []; } });
  const { data: locations, isLoading: isLoadingLocations } = useQuery<Location[]>({ queryKey: ['locations'], queryFn: async () => { const { data, error } = await supabase.from('locations').select('*'); if (error) throw new Error(error.message); return data || []; } });

  const technicianMutation = useMutation({
    mutationFn: async (technicianData: Partial<Technician>) => {
      const snakeCaseData = camelToSnakeCase(technicianData);
      if (technicianData.id) {
        const { error } = await supabase
          .from('technicians')
          .update(snakeCaseData)
          .eq('id', technicianData.id);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase.from('technicians').insert([snakeCaseData]);
        if (error) throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technicians'] });
      showSuccess('Technician has been saved.');
      setIsDialogOpen(false);
      setEditingTechnician(null);
    },
    onError: (error) => showError(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('technicians').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technicians'] });
      showSuccess('Technician has been deleted.');
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    },
    onError: (error) => showError(error.message),
  });

  const handleSave = (technicianData: Technician) => {
    technicianMutation.mutate(technicianData);
  };

  const handleDeleteClick = (technician: Technician) => {
    setItemToDelete(technician.id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteMutation.mutate(itemToDelete);
    }
  };

  const handleEdit = (technician: Technician) => {
    setEditingTechnician(technician);
    setIsDialogOpen(true);
  };

  const handleUpdateStatus = async (id: string, status: Technician['status']) => {
    const { data: currentTechnicianRaw, error: fetchError } = await supabase
      .from('technicians')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      showError(`Failed to fetch technician data: ${fetchError.message}`);
      return;
    }
    if (!currentTechnicianRaw) {
      showError("Technician not found.");
      return;
    }

    const currentTechnician = snakeToCamelCase(currentTechnicianRaw) as Technician;

    const updatedTechnicianData: Partial<Technician> = {
      ...currentTechnician,
      status: status,
    };

    technicianMutation.mutate(updatedTechnicianData);
  };

  const isLoading = isLoadingTechnicians || isLoadingWorkOrders || isLoadingLocations;

  return (
    <Card
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={5} style={{ margin: 0 }}>Manage Users</Title>
          <Button type="primary" icon={<Icon icon="ph:plus-fill" />} onClick={() => { setEditingTechnician(null); setIsDialogOpen(true); }}>
            Add User
          </Button>
        </div>
      }
      style={{ width: '100%' }}
    >
      {isLoading ? <Skeleton active /> : (
        <TechnicianDataTable
          technicians={technicians || []}
          workOrders={workOrders || []}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
      {isDialogOpen && (
        <TechnicianFormDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSave={handleSave}
          technician={editingTechnician}
          locations={locations || []}
        />
      )}
      <Modal
        title="Confirm Deletion"
        open={isDeleteDialogOpen}
        onOk={confirmDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true, loading: deleteMutation.isPending }}
      >
        <Paragraph>
          This action cannot be undone. This will permanently delete the technician.
        </Paragraph>
      </Modal>
    </Card>
  );
};

// --- System Settings Tab ---
const SystemSettings = () => {
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
            <Option value="Low">Low</Option>
            <Option value="Medium">Medium</Option>
            <Option value="High">High</Option>
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
const ProfileSettings = () => {
  const { session } = useSession();
  const user = session?.user;
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const queryClient = useQueryClient();
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

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
      setLoadingProfile(false);
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
    if (profile && user) {
      form.setFieldsValue({
        name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
        email: user.email || "",
        is_admin: profile.is_admin || false,
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
        </Space>
      </Col>
    </Row>
  );
};

// --- Main Settings Page Component ---
const SettingsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeTab = searchParams.get('tab') || 'user-management';

  const handleTabChange = (key: string) => {
    setSearchParams({ tab: key });
  };

  const tabItems = [
    { label: <Space><Icon icon="ph:users-fill" />User Management</Space>, key: 'user-management', children: <UserManagement /> },
    { label: <Space><Icon icon="ph:wrench-fill" />Service & SLA</Space>, key: 'service-sla', children: <ServiceSlaManagement /> },
    { label: <Space><Icon icon="ph:gear-fill" />System Settings</Space>, key: 'system-settings', children: <SystemSettings /> },
    { label: <Space><Icon icon="ph:user-fill" />My Profile</Space>, key: 'profile-settings', children: <ProfileSettings /> },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Breadcrumbs />
      <Tabs activeKey={activeTab} onChange={handleTabChange} style={{ width: '100%' }}>
        {tabItems.map(item => (
          <TabPane tab={item.label} key={item.key}>
            {item.children}
          </TabPane>
        ))}
      </Tabs>
    </Space>
  );
};

export default SettingsPage;