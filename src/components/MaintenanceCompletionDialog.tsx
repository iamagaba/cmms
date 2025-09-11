import { useState, useEffect } from 'react';
import { Modal, Form, Select, Input, Button, Typography, Space } from 'antd';

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

const predefinedFaultCodes = [
  'FC-BATT-001: Low Cell Voltage',
  'FC-MOT-002: Stator Winding Fault',
  'FC-BRK-003: ABS Sensor Failure',
  'FC-ELEC-004: Wiring Harness Damage',
  'FC-SW-005: Firmware Corruption',
  'FC-MECH-006: Frame Crack',
  'FC-MAINT-007: Scheduled Service',
  'FC-OTHER-008: Unspecified',
];

interface MaintenanceCompletionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (faultCode: string, maintenanceNotes: string | null) => void;
  usedPartsCount: number;
  onAddPartsClick: () => void; // New prop to handle opening the AddPartToWorkOrderDialog
  initialFaultCode?: string | null;
  initialMaintenanceNotes?: string | null;
}

export const MaintenanceCompletionDialog = ({ isOpen, onClose, onSave, usedPartsCount, onAddPartsClick, initialFaultCode, initialMaintenanceNotes }: MaintenanceCompletionDialogProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [showCustomFaultCode, setShowCustomFaultCode] = useState(false);

  useEffect(() => {
    if (isOpen) {
      form.setFieldsValue({
        faultCode: initialFaultCode && predefinedFaultCodes.includes(initialFaultCode) ? initialFaultCode : (initialFaultCode ? 'other' : undefined),
        customFaultCode: initialFaultCode && !predefinedFaultCodes.includes(initialFaultCode) ? initialFaultCode : undefined,
        maintenanceNotes: initialMaintenanceNotes,
      });
      setShowCustomFaultCode(initialFaultCode && !predefinedFaultCodes.includes(initialFaultCode));
    } else {
      form.resetFields();
      setShowCustomFaultCode(false);
    }
  }, [isOpen, form, initialFaultCode, initialMaintenanceNotes]);

  const handleFaultCodeChange = (value: string) => {
    if (value === 'other') {
      setShowCustomFaultCode(true);
    } else {
      setShowCustomFaultCode(false);
      form.setFieldsValue({ customFaultCode: undefined });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      const faultCode = values.faultCode === 'other' ? values.customFaultCode : values.faultCode;
      onSave(faultCode, values.maintenanceNotes);
      onClose();
    } catch (info) {
      console.log('Validate Failed:', info);
    } finally {
      setLoading(false);
    }
  };

  const handleAddParts = () => {
    onAddPartsClick(); // Trigger the parent's function to open AddPartToWorkOrderDialog
    onClose(); // Close this dialog
  };

  return (
    <Modal
      title="Complete Work Order"
      open={isOpen}
      onCancel={onClose}
      destroyOnClose
      footer={[
        <Button key="back" onClick={onClose} disabled={loading}>Cancel</Button>,
        <Button key="add-parts" onClick={handleAddParts} disabled={loading}>Add Parts</Button>,
        <Button key="submit" type="primary" onClick={handleSubmit} loading={loading} disabled={loading || usedPartsCount === 0}>Mark as Completed</Button>,
      ]}
    >
      <Form form={form} layout="vertical" name="maintenance_completion_form">
        <Form.Item
          name="faultCode"
          label="Identified Fault Code"
          rules={[{ required: true, message: 'Please select an identified fault code!' }]}
        >
          <Select placeholder="Select or specify fault code" onChange={handleFaultCodeChange}>
            {predefinedFaultCodes.map(code => (
              <Option key={code} value={code}>{code}</Option>
            ))}
            <Option key="other" value="other">Other (Please specify)</Option>
          </Select>
        </Form.Item>
        {showCustomFaultCode && (
          <Form.Item
            name="customFaultCode"
            label="Custom Fault Code"
            rules={[{ required: true, message: 'Please provide a custom fault code!' }]}
          >
            <Input placeholder="e.g. FC-BATT-999: Unknown Battery Issue" />
          </Form.Item>
        )}
        <Form.Item
          name="maintenanceNotes"
          label="Maintenance Decision / Repair Notes"
          rules={[{ required: true, message: 'Please provide maintenance notes!' }]}
        >
          <TextArea rows={4} placeholder="Describe the repair performed, root cause, and any recommendations..." />
        </Form.Item>
        <Space style={{ marginTop: 16 }}>
          <Text strong>Parts Used:</Text>
          <Text>{usedPartsCount} items recorded</Text>
          {usedPartsCount === 0 && <Text type="warning">(Please add all parts used before completing)</Text>}
        </Space>
      </Form>
    </Modal>
  );
};