import { useState } from 'react';
import { Card, Tabs, Form, Input, Button, Select, Switch, Avatar, Typography, Space, Row, Col } from 'antd';
import { UserOutlined, SettingOutlined, BellOutlined, LockOutlined, SaveOutlined } from '@ant-design/icons';
import { TechnicianDataTable } from '@/components/TechnicianDataTable';
import { technicians, workOrders, Technician } from '@/data/mockData';
import { TechnicianFormDialog } from '@/components/TechnicianFormDialog';
import { showSuccess } from '@/utils/toast';

const { Title } = Typography;
const { Option } = Select;

// Mock current user data
const currentUser = {
  name: 'Admin User',
  email: 'admin@gogo.com',
  avatar: '/placeholder.svg',
};

const UserManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [allTechnicians, setAllTechnicians] = useState(technicians);

  const handleSave = (technicianData: Technician) => {
    const exists = allTechnicians.some(t => t.id === technicianData.id);
    if (exists) {
      setAllTechnicians(allTechnicians.map(t => t.id === technicianData.id ? technicianData : t));
    } else {
      setAllTechnicians([...allTechnicians, technicianData]);
    }
    showSuccess(`User ${technicianData.name} has been saved.`);
  };

  return (
    <Card>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={5}>Manage Users</Title>
        </Col>
        <Col>
          <Button type="primary" onClick={() => setIsDialogOpen(true)}>Add User</Button>
        </Col>
      </Row>
      <TechnicianDataTable initialData={allTechnicians} workOrders={workOrders} />
      {isDialogOpen && (
        <TechnicianFormDialog 
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSave={handleSave}
          technician={null}
        />
      )}
    </Card>
  );
};

const SystemSettings = () => {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log('Saving system settings:', values);
    showSuccess('System settings have been updated.');
  };

  return (
    <Card title="System Configuration">
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          notifications: true,
          defaultPriority: 'Medium',
          slaThreshold: 3,
        }}
      >
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
          tooltip="Set the default priority for all newly created work orders."
        >
          <Select style={{ maxWidth: 200 }}>
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
          <Input type="number" style={{ maxWidth: 200 }} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
            Save Settings
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

const ProfileSettings = () => {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log('Updating profile:', values);
    showSuccess('Your profile has been updated.');
  };

  return (
    <Row gutter={[24, 24]}>
      <Col xs={24} md={8}>
        <Card>
          <Space direction="vertical" align="center" style={{ width: '100%' }}>
            <Avatar size={128} src={currentUser.avatar} icon={<UserOutlined />} />
            <Title level={4}>{currentUser.name}</Title>
            <Typography.Text type="secondary">{currentUser.email}</Typography.Text>
            <Button>Change Avatar</Button>
          </Space>
        </Card>
      </Col>
      <Col xs={24} md={16}>
        <Card title="Edit Profile Information">
          <Form layout="vertical" form={form} onFinish={onFinish} initialValues={currentUser}>
            <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
              <Input prefix={<UserOutlined />} />
            </Form.Item>
            <Form.Item name="email" label="Email Address" rules={[{ required: true, type: 'email' }]}>
              <Input prefix={<UserOutlined />} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">Update Profile</Button>
            </Form.Item>
          </Form>
        </Card>
        <Card title="Change Password" style={{ marginTop: 24 }}>
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
            <Form.Item>
              <Button type="primary">Update Password</Button>
            </Form.Item>
          </Form>
        </Card>
      </Col>
    </Row>
  );
};

const SettingsPage = () => {
  const tabItems = [
    {
      label: (
        <span>
          <UserOutlined />
          User Management
        </span>
      ),
      key: '1',
      children: <UserManagement />,
    },
    {
      label: (
        <span>
          <SettingOutlined />
          System Settings
        </span>
      ),
      key: '2',
      children: <SystemSettings />,
    },
    {
      label: (
        <span>
          <BellOutlined />
          My Profile
        </span>
      ),
      key: '3',
      children: <ProfileSettings />,
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Title level={4}>Settings</Title>
      <Tabs defaultActiveKey="1" items={tabItems} />
    </Space>
  );
};

export default SettingsPage;