import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { Card, Switch, Form, TimePicker, Typography, Divider, Space, Button, Spin } from 'antd';
import { Icon } from '@iconify/react';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
// Using Select with options prop; no Option alias needed

interface NotificationPreferences {
  email_enabled: boolean;
  push_enabled: boolean;
  work_order_status_changes: boolean;
  sla_alerts: boolean;
  emergency_bike_assignments: boolean;
  inventory_alerts: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  notification_types: string[];
}

const defaultPreferences: NotificationPreferences = {
  email_enabled: true,
  push_enabled: true,
  work_order_status_changes: true,
  sla_alerts: true,
  emergency_bike_assignments: true,
  inventory_alerts: false,
  quiet_hours_start: '22:00',
  quiet_hours_end: '08:00',
  notification_types: ['email', 'push'],
};

export const NotificationSettings: React.FC = () => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  // Fetch current preferences
  const { data: preferences, isLoading: isLoadingPreferences } = useQuery<NotificationPreferences>({
    queryKey: ['notification_preferences'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      return data ? {
        ...defaultPreferences,
        ...data,
      } : defaultPreferences;
    },
  });

  // Update preferences mutation
  const updatePreferences = useMutation({
    mutationFn: async (updates: NotificationPreferences) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...updates,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification_preferences'] });
      showSuccess('Notification preferences updated successfully!');
    },
    onError: (error) => {
      showError(error.message || 'Failed to update preferences');
    },
  });

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      // Convert time picker values
      const preferencesToUpdate: NotificationPreferences = {
        ...values,
        quiet_hours_start: dayjs(values.quiet_hours_start).format('HH:mm'),
        quiet_hours_end: dayjs(values.quiet_hours_end).format('HH:mm'),
      };

      updatePreferences.mutate(preferencesToUpdate);
    } catch (error) {
      console.error('Form validation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (preferences) {
      form.setFieldsValue({
        ...preferences,
        quiet_hours_start: dayjs(preferences.quiet_hours_start, 'HH:mm'),
        quiet_hours_end: dayjs(preferences.quiet_hours_end, 'HH:mm'),
      });
    }
  }, [preferences, form]);

  if (isLoadingPreferences) {
    return (
  <Card size="small">
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin size="large" />
          <Text style={{ display: 'block', marginTop: '16px' }}>Loading preferences...</Text>
        </div>
      </Card>
    );
  }

  return (
  <Card size="small"
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Icon icon="ph:bell-fill" style={{ marginRight: '8px' }} />
          Notification Preferences
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={preferences}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          {/* General Settings */}
          <div>
            <Title level={5}>General Settings</Title>
            <Form.Item
              name="email_enabled"
              valuePropName="checked"
              label="Email Notifications"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name="push_enabled"
              valuePropName="checked"
              label="Push Notifications"
            >
              <Switch />
            </Form.Item>
          </div>

          <Divider />

          {/* Notification Types */}
          <div>
            <Title level={5}>Notification Types</Title>
            <Form.Item
              name="work_order_status_changes"
              valuePropName="checked"
              label="Work Order Status Changes"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name="sla_alerts"
              valuePropName="checked"
              label="SLA Alerts & Warnings"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name="emergency_bike_assignments"
              valuePropName="checked"
              label="Emergency Bike Assignments"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name="inventory_alerts"
              valuePropName="checked"
              label="Inventory Alerts (Low Stock, etc.)"
            >
              <Switch />
            </Form.Item>
          </div>

          <Divider />

          {/* Quiet Hours */}
          <div>
            <Title level={5}>Quiet Hours</Title>
            <Text type="secondary" style={{ marginBottom: '16px', display: 'block' }}>
              You won't receive notifications during these hours unless it's critical.
            </Text>

            <div style={{ display: 'flex', gap: '16px' }}>
              <Form.Item
                name="quiet_hours_start"
                label="Start Time"
                rules={[{ required: true, message: 'Start time is required' }]}
              >
                <TimePicker
                  format="HH:mm"
                  placeholder="Start time"
                  allowClear={false}
                />
              </Form.Item>

              <Form.Item
                name="quiet_hours_end"
                label="End Time"
                rules={[{ required: true, message: 'End time is required' }]}
              >
                <TimePicker
                  format="HH:mm"
                  placeholder="End time"
                  allowClear={false}
                />
              </Form.Item>
            </div>
          </div>

          <Divider />

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
            >
              Save Preferences
            </Button>
          </Form.Item>
        </Space>
      </Form>
    </Card>
  );
};
