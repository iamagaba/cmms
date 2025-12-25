import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Typography,
  Skeleton,
  Tag,
  Tooltip,
  Avatar,
} from 'antd';
import { Icon } from '@iconify/react';
import { User } from '@supabase/supabase-js';
import { Location } from '@/types/supabase';

const { Title, Text } = Typography;
const { Option } = Select;

// --- API Functions ---
const fetchUsers = async () => {
  const { data, error } = await supabase.functions.invoke('user-management', {
    method: 'GET',
  });
  if (error) throw new Error(error.message);
  return data;
};

const createUser = async (userData: any) => {
  const { data, error } = await supabase.functions.invoke('user-management', {
    method: 'POST',
    body: userData,
  });
  if (error) throw new Error(error.message);
  return data;
};

const updateUserRole = async ({ id, role, location_id }: { id: string; role: string; location_id?: string | null }) => {
  const { data, error } = await supabase.functions.invoke('user-management', {
    method: 'PUT',
    body: { id, role, location_id },
  });
  if (error) throw new Error(error.message);
  return data;
};

const deleteUser = async (id: string) => {
  const { error } = await supabase.functions.invoke('user-management', {
    method: 'DELETE',
    body: { id },
  });
  if (error) throw new Error(error.message);
};

// --- User Form Dialog ---
interface UserFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: any) => void;
  user: User | null;
  isLoading: boolean;
  locations: Location[];
}

const UserFormDialog: React.FC<UserFormDialogProps> = ({ isOpen, onClose, onSave, user, isLoading, locations }) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (user) {
      form.setFieldsValue({
        email: user.email,
        full_name: user.user_metadata.full_name,
        role: user.user_metadata.role,
        location_id: user.user_metadata.location_id || null,
      });
    } else {
      form.resetFields();
    }
  }, [user, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      onSave({ ...values, id: user?.id });
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <Modal
      title={user ? 'Edit User' : 'Add New User'}
      open={isOpen}
      onCancel={onClose}
      onOk={handleSave}
      confirmLoading={isLoading}
      okText="Save"
    >
      <Form form={form} layout="vertical" name="user_form">
        <Form.Item
          name="full_name"
          label="Full Name"
          rules={[{ required: true, message: 'Please input the full name!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email"
          rules={[{ required: true, type: 'email', message: 'Please input a valid email!' }]}
        >
          <Input disabled={!!user} />
        </Form.Item>
        {!user && (
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please input a password!' }]}
          >
            <Input.Password />
          </Form.Item>
        )}
        <Form.Item
          name="role"
          label="Role"
          rules={[{ required: true, message: 'Please select a role!' }]}
        >
          <Select>
            <Option value="admin">System Administrator</Option>
            <Option value="manager">Maintenance Manager</Option>
            <Option value="technician">Maintenance Technician</Option>
            <Option value="maintenance_frontdesk">Maintenance Frontdesk</Option>
            <Option value="maintenance_backoffice">Maintenance Backoffice</Option>
            <Option value="call_center_agent">Call Center Agent</Option>
          </Select>
        </Form.Item>

        {/* Location selection - required for maintenance roles */}
        <Form.Item noStyle shouldUpdate={(prev, curr) => prev.role !== curr.role}>
          {() => {
            const role = form.getFieldValue('role');
            const requiresLocation = ['manager', 'technician', 'maintenance_frontdesk', 'maintenance_backoffice'].includes(role);
            if (!requiresLocation) return null;
            return (
              <Form.Item
                name="location_id"
                label="Location"
                rules={[{ required: true, message: 'Please select the location for this role.' }]}
              >
                <Select placeholder="Select service center" allowClear>
                  {locations.map((loc) => (
                    <Option key={loc.id} value={loc.id}>
                      {loc.name?.replace(' Service Center', '') || loc.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            );
          }}
        </Form.Item>
      </Form>
    </Modal>
  );
};


// --- User Management Component ---
const UserManagement = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const { data: users, isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  const { data: locations, isLoading: isLoadingLocations } = useQuery<Location[]>({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase.from('locations').select('id, name');
      if (error) throw new Error(error.message);
      return data as Location[];
    },
  });

  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showSuccess('User created successfully.');
      setIsDialogOpen(false);
    },
    onError: (error: Error) => showError(error.message),
  });

  const updateUserMutation = useMutation({
    mutationFn: updateUserRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showSuccess('User updated successfully.');
      setIsDialogOpen(false);
    },
    onError: (error: Error) => showError(error.message),
  });

  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showSuccess('User deleted successfully.');
      setIsDeleteDialogOpen(false);
    },
    onError: (error: Error) => showError(error.message),
  });

  const handleSave = (values: any) => {
    if (values.id) {
      updateUserMutation.mutate({ id: values.id, role: values.role, location_id: values.location_id || null });
    } else {
      createUserMutation.mutate(values);
    }
  };

  const handleDeleteClick = (user: User) => {
    setItemToDelete(user.id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteUserMutation.mutate(itemToDelete);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsDialogOpen(true);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'email',
      key: 'name',
      render: (_: any, record: User) => (
        <Space>
          <Avatar src={record.user_metadata.avatar_url} >
            {record.user_metadata.full_name?.[0] || record.email?.[0].toUpperCase()}
          </Avatar>
          <Space direction="vertical" size={0}>
            <Text strong>{record.user_metadata.full_name || 'N/A'}</Text>
            <Text type="secondary">{record.email}</Text>
          </Space>
        </Space>
      ),
    },
    {
      title: 'Role',
      dataIndex: ['user_metadata', 'role'],
      key: 'role',
      render: (role: string) => <Tag color="blue">{role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Tag>,
    },
    {
      title: 'Last Sign In',
      dataIndex: 'last_sign_in_at',
      key: 'last_sign_in_at',
      render: (text: string) => text ? new Date(text).toLocaleString() : 'Never',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: User) => (
        <Space size="middle">
          <Tooltip title="Edit User">
            <Button icon={<Icon icon="ph:pencil-simple-fill" />} onClick={() => handleEdit(record)} />
          </Tooltip>
          <Tooltip title="Delete User">
            <Button danger icon={<Icon icon="ph:trash-simple-fill" />} onClick={() => handleDeleteClick(record)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (isLoadingUsers || isLoadingLocations) {
    return <Skeleton active />;
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4}>User Management</Title>
        <Button type="primary" icon={<Icon icon="ph:plus-bold" />} onClick={() => { setEditingUser(null); setIsDialogOpen(true); }}>
          Add User
        </Button>
      </div>
      <Table columns={columns} dataSource={users} rowKey="id" />
      <UserFormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSave}
        user={editingUser}
        isLoading={createUserMutation.isPending || updateUserMutation.isPending}
        locations={locations || []}
      />
      <Modal
        title="Confirm Deletion"
        open={isDeleteDialogOpen}
        onOk={confirmDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true, loading: deleteUserMutation.isPending }}
      >
        <p>Are you sure you want to delete this user? This action cannot be undone.</p>
      </Modal>
    </>
  );
};

export default UserManagement;
