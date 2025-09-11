import React, { useState, useEffect } from 'react';
import { Modal, Form, Select, Input, Button, Typography, Spin, Space } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Vehicle } from '@/types/supabase';
import { showError, showSuccess } from '@/utils/toast';

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

interface EmergencyBikeAssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  workOrderId: string;
  workOrderNumber: string;
}

export const EmergencyBikeAssignmentDialog: React.FC<EmergencyBikeAssignmentDialogProps> = ({
  isOpen,
  onClose,
  workOrderId,
  workOrderNumber,
}) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  // Fetch available emergency bikes
  const { data: availableEmergencyBikes, isLoading: isLoadingBikes } = useQuery<Vehicle[]>({
    queryKey: ['available_emergency_bikes'],
    queryFn: async () => {
      const { data: assignedBikes, error: assignedError } = await supabase
        .from('emergency_bike_assignments')
        .select('emergency_bike_id')
        .is('returned_at', null);

      if (assignedError) throw assignedError;
      const currentlyAssignedBikeIds = assignedBikes?.map(a => a.emergency_bike_id) || [];

      let query = supabase
        .from('vehicles')
        .select('*')
        .eq('is_emergency_bike', true)
        .order('license_plate');

      if (currentlyAssignedBikeIds.length > 0) {
        query = query.not('id', 'in', `(${currentlyAssignedBikeIds.join(',')})`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: isOpen,
  });

  const assignBikeMutation = useMutation({
    mutationFn: async ({ bikeId, notes }: { bikeId: string; notes?: string }) => {
      const { error } = await supabase.rpc('assign_emergency_bike_to_work_order', {
        p_work_order_id: workOrderId,
        p_emergency_bike_id: bikeId,
        p_assignment_notes: notes,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work_order', workOrderId] });
      queryClient.invalidateQueries({ queryKey: ['work_orders'] });
      queryClient.invalidateQueries({ queryKey: ['available_emergency_bikes'] });
      showSuccess('Emergency bike assigned successfully!');
      onClose();
    },
    onError: (error: any) => {
      showError(`Failed to assign emergency bike: ${error.message}`);
    },
    onSettled: () => setLoading(false),
  });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      await assignBikeMutation.mutateAsync({
        bikeId: values.emergencyBikeId,
        notes: values.assignmentNotes,
      });
    } catch (info) {
      console.log('Validate Failed:', info);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      form.resetFields();
    }
  }, [isOpen, form]);

  return (
    <Modal
      title={`Assign Emergency Bike to WO: ${workOrderNumber}`}
      open={isOpen}
      onCancel={onClose}
      destroyOnClose
      footer={[
        <Button key="back" onClick={onClose} disabled={loading}>Cancel</Button>,
        <Button key="submit" type="primary" onClick={handleSubmit} loading={loading}>Assign Bike</Button>,
      ]}
    >
      <Form form={form} layout="vertical" name="assign_emergency_bike_form">
        <Form.Item
          name="emergencyBikeId"
          label="Select Emergency Bike"
          rules={[{ required: true, message: 'Please select an emergency bike!' }]}
        >
          <Select
            placeholder="Select an available emergency bike"
            loading={isLoadingBikes}
            showSearch
            filterOption={(input, option) =>
              String(option?.children).toLowerCase().includes(input.toLowerCase())
            }
          >
            {(availableEmergencyBikes || []).map(bike => (
              <Option key={bike.id} value={bike.id}>
                {bike.license_plate} ({bike.make} {bike.model})
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="assignmentNotes" label="Assignment Notes (Optional)">
          <TextArea rows={3} placeholder="e.g., Client requested due to long repair time, provided with full charge." />
        </Form.Item>
      </Form>
      {isLoadingBikes && <div style={{ textAlign: 'center', marginTop: 20 }}><Spin /> <Text type="secondary">Loading available bikes...</Text></div>}
      {!isLoadingBikes && availableEmergencyBikes?.length === 0 && (
        <Text type="warning">No emergency bikes currently available. All are either assigned or not marked as emergency bikes.</Text>
      )}
    </Modal>
  );
};