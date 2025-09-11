import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Typography, Space, Descriptions } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EmergencyBikeAssignment } from '@/types/supabase';
import { showError, showSuccess } from '@/utils/toast';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Text } = Typography;

interface EmergencyBikeReturnDialogProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: EmergencyBikeAssignment;
}

export const EmergencyBikeReturnDialog: React.FC<EmergencyBikeReturnDialogProps> = ({
  isOpen,
  onClose,
  assignment,
}) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const returnBikeMutation = useMutation({
    mutationFn: async ({ assignmentId, notes }: { assignmentId: string; notes?: string }) => {
      const { error } = await supabase.rpc('return_emergency_bike_from_work_order', {
        p_assignment_id: assignmentId,
        p_return_notes: notes,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work_order', assignment.work_order_id] });
      queryClient.invalidateQueries({ queryKey: ['work_orders'] });
      queryClient.invalidateQueries({ queryKey: ['available_emergency_bikes'] });
      showSuccess('Emergency bike returned successfully!');
      onClose();
    },
    onError: (error: any) => {
      showError(`Failed to return emergency bike: ${error.message}`);
    },
    onSettled: () => setLoading(false),
  });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      await returnBikeMutation.mutateAsync({
        assignmentId: assignment.id,
        notes: values.returnNotes,
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
      title={`Return Emergency Bike: ${assignment.vehicles?.license_plate}`}
      open={isOpen}
      onCancel={onClose}
      destroyOnClose
      footer={[
        <Button key="back" onClick={onClose} disabled={loading}>Cancel</Button>,
        <Button key="submit" type="primary" onClick={handleSubmit} loading={loading}>Confirm Return</Button>,
      ]}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Text>Please confirm that the client has returned the emergency bike and taken their original bike.</Text>
        <Descriptions bordered column={1} size="small" style={{ marginTop: 16 }}>
          <Descriptions.Item label="Assigned Bike">
            <Text strong>{assignment.vehicles?.license_plate}</Text> ({assignment.vehicles?.make} {assignment.vehicles?.model})
          </Descriptions.Item>
          <Descriptions.Item label="Assigned On">
            {dayjs(assignment.assigned_at).format('MMM D, YYYY h:mm A')}
          </Descriptions.Item>
          {assignment.assignment_notes && (
            <Descriptions.Item label="Assignment Notes">
              {assignment.assignment_notes}
            </Descriptions.Item>
          )}
        </Descriptions>
        <Form form={form} layout="vertical" name="return_emergency_bike_form" style={{ marginTop: 16 }}>
          <Form.Item name="returnNotes" label="Return Notes (Optional)">
            <TextArea rows={3} placeholder="e.g., Bike returned in good condition, client satisfied." />
          </Form.Item>
        </Form>
      </Space>
    </Modal>
  );
};