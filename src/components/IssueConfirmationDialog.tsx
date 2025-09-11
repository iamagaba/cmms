import { useState, useEffect } from 'react';
import { Modal, Form, Select, Input, Button } from 'antd';

const { Option } = Select;
const { TextArea } = Input;

const predefinedIssueTypes = [
  'Battery Degradation',
  'Motor Malfunction',
  'Brake System Issue',
  'Electrical Fault',
  'Software Glitch',
  'Physical Damage',
  'Routine Maintenance',
  'Other',
];

interface IssueConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (issueType: string, notes: string | null) => void;
  initialIssueType?: string | null;
  initialNotes?: string | null;
}

export const IssueConfirmationDialog = ({ isOpen, onClose, onSave, initialIssueType, initialNotes }: IssueConfirmationDialogProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [showCustomIssueType, setShowCustomIssueType] = useState(false);

  useEffect(() => {
    if (isOpen) {
      form.setFieldsValue({
        issueType: initialIssueType && predefinedIssueTypes.includes(initialIssueType) ? initialIssueType : (initialIssueType ? 'other' : undefined),
        customIssueType: initialIssueType && !predefinedIssueTypes.includes(initialIssueType) ? initialIssueType : undefined,
        notes: initialNotes,
      });
      setShowCustomIssueType(initialIssueType && !predefinedIssueTypes.includes(initialIssueType));
    } else {
      form.resetFields();
      setShowCustomIssueType(false);
    }
  }, [isOpen, form, initialIssueType, initialNotes]);

  const handleIssueTypeChange = (value: string) => {
    if (value === 'other') {
      setShowCustomIssueType(true);
    } else {
      setShowCustomIssueType(false);
      form.setFieldsValue({ customIssueType: undefined });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      const issueType = values.issueType === 'other' ? values.customIssueType : values.issueType;
      onSave(issueType, values.notes);
      onClose();
    } catch (info) {
      console.log('Validate Failed:', info);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Confirm Issue Type"
      open={isOpen}
      onCancel={onClose}
      destroyOnClose
      footer={[
        <Button key="back" onClick={onClose} disabled={loading}>Cancel</Button>,
        <Button key="submit" type="primary" onClick={handleSubmit} loading={loading}>Confirm Issue</Button>,
      ]}
    >
      <Form form={form} layout="vertical" name="issue_confirmation_form">
        <Form.Item
          name="issueType"
          label="Issue Type"
          rules={[{ required: true, message: 'Please select an issue type!' }]}
        >
          <Select placeholder="Select or specify issue type" onChange={handleIssueTypeChange}>
            {predefinedIssueTypes.map(type => (
              <Option key={type} value={type}>{type}</Option>
            ))}
            <Option key="other" value="other">Other (Please specify)</Option>
          </Select>
        </Form.Item>
        {showCustomIssueType && (
          <Form.Item
            name="customIssueType"
            label="Custom Issue Type"
            rules={[{ required: true, message: 'Please provide a custom issue type!' }]}
          >
            <Input placeholder="e.g. Faulty Charging Port" />
          </Form.Item>
        )}
        <Form.Item name="notes" label="Confirmation Notes (Optional)">
          <TextArea rows={3} placeholder="Add any notes from the confirmation call or initial assessment..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};