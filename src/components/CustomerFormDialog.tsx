import { useEffect, useState } from "react";
import { Modal, Form, Input, Button, Row, Col } from "antd";
import { Customer } from "@/types/supabase";

interface CustomerFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Customer>) => void;
  customer?: Customer | null;
}

export const CustomerFormDialog = ({ isOpen, onClose, onSave, customer }: CustomerFormDialogProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customer) {
      form.setFieldsValue(customer);
    } else {
      form.resetFields();
    }
  }, [isOpen, customer, form]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      const customerToSave: Partial<Customer> = {
        id: customer?.id,
        ...values,
      };
      
      onSave(customerToSave);
      onClose();
    } catch (info) {
      console.log('Validate Failed:', info);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={customer ? "Edit Customer" : "Add Customer"}
      open={isOpen}
      onOk={handleSubmit}
      onCancel={onClose}
      destroyOnClose
      footer={[
        <Button key="back" onClick={onClose} disabled={loading}>Cancel</Button>,
        <Button key="submit" type="primary" onClick={handleSubmit} loading={loading}>Save</Button>,
      ]}
    >
      <Form form={form} layout="vertical" name="customer_form">
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
              <Input placeholder="e.g. Jane Doe" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="email" label="Email Address" rules={[{ required: true, type: 'email' }]}>
              <Input placeholder="e.g. jane.doe@example.com" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="phone" label="Phone Number">
              <Input placeholder="e.g. +256 700 123456" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="address" label="Address">
              <Input placeholder="e.g. 123 Main St" />
            </Form.Item>
          </Col>
          <Col span={8}><Form.Item name="city" label="City"><Input placeholder="e.g. Kampala" /></Form.Item></Col>
          <Col span={8}><Form.Item name="state" label="State/Province"><Input placeholder="e.g. Central Region" /></Form.Item></Col>
          <Col span={8}><Form.Item name="zip_code" label="Zip/Postal Code"><Input placeholder="e.g. 10101" /></Form.Item></Col>
        </Row>
      </Form>
    </Modal>
  );
};