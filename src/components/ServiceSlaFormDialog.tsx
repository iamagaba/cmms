import { useEffect, useState } from "react";
import { Modal, Form, Input, Button, Row, Col, InputNumber, Typography } from "antd";
import { ServiceCategory, SlaPolicy } from "@/types/supabase";

const { TextArea } = Input;
const { Text } = Typography;

export type ServiceSlaData = ServiceCategory & { sla_policies: Partial<SlaPolicy> | null };

interface ServiceSlaFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (categoryData: Partial<ServiceCategory>, slaData: Partial<SlaPolicy>) => void;
  serviceSlaData?: ServiceSlaData | null;
}

export const ServiceSlaFormDialog = ({ isOpen, onClose, onSave, serviceSlaData }: ServiceSlaFormDialogProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (serviceSlaData) {
        form.setFieldsValue({
          ...serviceSlaData,
          ...serviceSlaData.sla_policies,
        });
      } else {
        form.resetFields();
      }
    }
  }, [isOpen, serviceSlaData, form]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      const categoryData: Partial<ServiceCategory> = {
        id: serviceSlaData?.id,
        name: values.name,
        description: values.description,
      };
      const slaData: Partial<SlaPolicy> = {
        id: serviceSlaData?.sla_policies?.id,
        service_category_id: serviceSlaData?.id,
        first_response_minutes: values.first_response_minutes,
        response_hours: values.response_hours,
        resolution_hours: values.resolution_hours,
        expected_repair_hours: values.expected_repair_hours,
      };
      onSave(categoryData, slaData);
    } catch (info) {
      console.log('Validate Failed:', info);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={serviceSlaData ? "Edit Service & SLA" : "Add Service & SLA"}
      open={isOpen}
      onOk={handleSubmit}
      onCancel={onClose}
      destroyOnClose
      footer={[
        <Button key="back" onClick={onClose} disabled={loading}>Cancel</Button>,
        <Button key="submit" type="primary" onClick={handleSubmit} loading={loading}>Save</Button>,
      ]}
    >
      <Form form={form} layout="vertical" name="service_sla_form">
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="name" label="Service Category Name" rules={[{ required: true }]}>
              <Input placeholder="e.g. Critical Battery Failure" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="description" label="Description">
              <TextArea rows={2} placeholder="Describe when this category should be used." />
            </Form.Item>
          </Col>
          <Col span={24}><Text strong>SLA Policies</Text></Col>
          <Col xs={24} sm={12}>
            <Form.Item name="first_response_minutes" label="First Response (mins)" tooltip="Time to make confirmation call. Not applicable for walk-ins.">
              <InputNumber style={{ width: '100%' }} min={0} placeholder="e.g. 15" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="response_hours" label="Response Time (hrs)" tooltip="Time from creation to technician starting work.">
              <InputNumber style={{ width: '100%' }} min={0} placeholder="e.g. 4" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="resolution_hours" label="Resolution Time (hrs)" tooltip="Time from creation to work order completion.">
              <InputNumber style={{ width: '100%' }} min={0} placeholder="e.g. 12" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="expected_repair_hours" label="Expected Repair (hrs)" tooltip="The estimated time for the actual repair work.">
              <InputNumber style={{ width: '100%' }} min={0} placeholder="e.g. 3" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};