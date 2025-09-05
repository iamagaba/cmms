import { useState } from 'react';
import { Card, Tabs, Form, Input, Button, Select, Switch, Avatar, Typography, Space, Row, Col, Skeleton } from 'antd';
import { UserOutlined, SettingOutlined, BellOutlined, LockOutlined, SaveOutlined } from '@ant-design/icons';
import { TechnicianDataTable } from '@/components/TechnicianDataTable';
import { TechnicianFormDialog } from '@/components/TechnicianFormDialog';
import { showSuccess, showError } from '@/utils/toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Technician, WorkOrder } from '@/types/supabase';

const { Title } = Typography;
const { Option } = Select;

const currentUser = { name: 'Admin User', email: 'admin@gogo.com', avatar: '/placeholder.svg' };

const UserManagement = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTechnician, setEditingTechnician] = useState<Technician | null>(null);

  const { data: technicians, isLoading: isLoadingTechnicians } = useQuery<Technician[]>({ queryKey: ['technicians'], queryFn: async () => { const { data, error } = await supabase.from('technicians').select('*'); if (error) throw new Error(error.message); return data || []; } });
  const { data: workOrders, isLoading: isLoadingWorkOrders } = useQuery<WorkOrder[]>({ queryKey: ['work_orders'], queryFn: async () => { const { data, error } = await supabase.from('work_orders').select('*'); if (error) throw new Error(error.message); return data || []; } });

  const technicianMutation = useMutation({
    mutationFn: async (technicianData: Partial<Technician>) => { const { error } = await supabase.from('technicians').upsert(technicianData); if (error) throw new Error(error.message); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['technicians'] }); showSuccess('Technician has been saved.'); },
    onError: (error) => showError(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from('technicians').delete().eq('id', id); if (error) throw new Error(error.message); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['technicians'] }); showSuccess('Technician has been deleted.'); },
    onError: (error) => showError(error.message),
  });

  const handleSave = (technicianData: Technician) => { technicianMutation.mutate(technicianData); setIsDialogOpen(false); setEditingTechnician(null); };
  const handleDelete = (technicianData: Technician) => { deleteMutation.mutate(technicianData.id); };
  const handleEdit = (technician: Technician) => { setEditingTechnician(technician); setIsDialogOpen(true); };

  const isLoading = isLoadingTechnicians || isLoadingWorkOrders;

  return (
    <Card>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col><Title level={5}>Manage Users</Title></Col>
        <Col><Button type="primary" onClick={() => { setEditingTechnician(null); setIsDialogOpen(true); }}>Add User</Button></Col>
      </Row>
      {isLoading ? <Skeleton active /> : <TechnicianDataTable technicians={technicians || []} workOrders={workOrders || []} onEdit={handleEdit} onDelete={handleDelete} />}
      {isDialogOpen && <TechnicianFormDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} onSave={handleSave} technician={editingTechnician} />}
    </Card>
  );
};

const SystemSettings = () => {
  const [form] = Form.useForm();
  const onFinish = (values: any) => { console.log('Saving system settings:', values); showSuccess('System settings have been updated.'); };
  return (
    <Card title="System Configuration">
      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ notifications: true, defaultPriority: 'Medium', slaThreshold: 3 }}>
        <Form.Item name="notifications" label="Enable Email Notifications" valuePropName="checked" tooltip="Toggle all system-wide email notifications for events like work order creation and status changes."><Switch /></Form.Item>
        <Form.Item name="defaultPriority" label="Default Work Order Priority" tooltip="Set the default priority for all newly created work orders."><Select style={{ maxWidth: 200 }}><Option value="Low">Low</Option><Option value="Medium">Medium</Option><Option value="High">High</Option></Select></Form.Item>
        <Form.Item name="slaThreshold" label="SLA Warning Threshold (days)" tooltip="Get a warning for work orders that are due within this many days."><Input type="number" style={{ maxWidth: 200 }} /></Form.Item>
        <Form.Item><Button type="primary" htmlType="submit" icon={<SaveOutlined />}>Save Settings</Button></Form.Item>
      </Form>
    </Card>
  );
};

const ProfileSettings = () => {
  const [form] = Form.useForm();
  const onFinish = (values: any) => { console.log('Updating profile:', values); showSuccess('Your profile has been updated.'); };
  return (
    <Row gutter={[24, 24]}>
      <Col xs={24} md={8}><Card><Space direction="vertical" align="center" style={{ width: '100%' }}><Avatar size={128} src={currentUser.avatar} icon={<UserOutlined />} /><Title level={4}>{currentUser.name}</Title><Typography.Text type="secondary">{currentUser.email}</Typography.Text><Button>Change Avatar</Button></Space></Card></Col>
      <Col xs={24} md={16}>
        <Card title="Edit Profile Information">
          <Form layout="vertical" form={form} onFinish={onFinish} initialValues={currentUser}>
            <Form.Item name="name" label="Full Name" rules={[{ required: true }]}><Input prefix={<UserOutlined />} /></Form.Item>
            <Form.Item name="email" label="Email Address" rules={[{ required: true, type: 'email' }]}><Input prefix={<UserOutlined />} /></Form.Item>
            <Form.Item><Button type="primary" htmlType="submit">Update Profile</Button></Form.Item>
          </Form>
        </Card>
        <Card title="Change Password" style={{ marginTop: 24 }}><Form layout="vertical"><Form.Item name="currentPassword" label="Current Password"><Input.Password prefix={<LockOutlined />} /></Form.Item><Form.Item name="newPassword" label="New Password"><Input.Password prefix={<LockOutlined />} /></Form.Item><Form.Item name="confirmPassword" label="Confirm New Password"><Input.Password prefix={<LockOutlined />} /></Form.Item><Form.Item><Button type="primary">Update Password</Button></Form.Item></Form></Card>
      </Col>
    </Row>
  );
};

const SettingsPage = () => {
  const tabItems = [
    { label: <span><UserOutlined />User Management</span>, key: '1', children: <UserManagement /> },
    { label: <span><SettingOutlined />System Settings</span>, key: '2', children: <SystemSettings /> },
    { label: <span><BellOutlined />My Profile</span>, key: '3', children: <ProfileSettings /> },
  ];
  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Title level={4}>Settings</Title>
      <Tabs defaultActiveKey="1" items={tabItems} />
    </Space>
  );
};

export default SettingsPage;