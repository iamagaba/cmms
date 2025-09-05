import { useState, useEffect } from 'react';
import { Modal, Form, Select, Input, Button } from 'antd';

const { Option } = Select;
const { TextArea } = Input;

const predefinedReasons = [
  'Client Unreachable',
  'Awaiting Spare Parts',
  'Awaiting External Feedback',
];

interface OnHoldReasonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (reason: string) => void;
}

export const OnHoldReasonDialog = ({ isOpen, onClose, onSave }: OnHoldReasonDialogProps) => {
  const [form] = Form.useForm();
  const [showCustomReason, setShowCustomReason] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      form.resetFields();
      setShowCustomReason(false);
    }
  }, [isOpen, form]);

  const handleReasonChange = (value: string) => {
    if (value === 'custom') {
      setShowCustomReason(true);
    } else {
      setShowCustomReason(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      const reason = values.reason === 'custom' ? values.customReason : values.reason;
      onSave(reason);
      onClose();
    } catch (info) {
      console.log('Validate Failed:', info);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Set 'On Hold' Reason"
      open={isOpen}
      onCancel={onClose}
      destroyOnClose
      footer={[
        <Button key="back" onClick={onClose} disabled={loading}>Cancel</Button>,
        <Button key="submit" type="primary" onClick={handleSubmit} loading={loading}>Save Reason</Button>,
      ]}
    >
      <Form form={form} layout="vertical" name="on_hold_reason_form">
        <Form.Item
          name="reason"
          label="Reason for Hold"
          rules={[{ required: true, message: 'Please select a reason!' }]}
        >
          <Select placeholder="Select a reason" onChange={handleReasonChange}>
            {predefinedReasons.map(reason => (
              <Option key={reason} value={reason}>{reason}</Option>
            ))}
            <Option key="custom" value="custom">Other (Please specify)</Option>
          </Select>
        </Form.Item>
        {showCustomReason && (
          <Form.Item
            name="customReason"
            label="Custom Reason"
            rules={[{ required: true, message: 'Please provide a reason!' }]}
          >
            <TextArea rows={3} placeholder="Describe why this work order is on hold..." />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};