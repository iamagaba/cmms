import { useEffect, useState } from "react";
import { Modal, Form, Input, Button } from "antd";
import { Location } from "@/types/supabase";

interface LocationFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Location) => void;
  location?: Location | null;
}

export const LocationFormDialog = ({ isOpen, onClose, onSave, location }: LocationFormDialogProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location) {
      form.setFieldsValue(location);
    } else {
      form.resetFields();
    }
  }, [isOpen, location, form]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      const locationToSave: Location = {
        id: location?.id,
        ...values,
        lat: location?.lat || 0.32,
        lng: location?.lng || 32.58,
      };
      
      onSave(locationToSave);
      onClose();
    } catch (info) {
      console.log('Validate Failed:', info);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={location ? "Edit Location" : "Add Location"}
      open={isOpen}
      onOk={handleSubmit}
      onCancel={onClose}
      destroyOnClose
      footer={[
        <Button key="back" onClick={onClose} disabled={loading}>Cancel</Button>,
        <Button key="submit" type="primary" onClick={handleSubmit} loading={loading}>Save</Button>,
      ]}
    >
      <Form form={form} layout="vertical" name="location_form" initialValues={{ name: location?.name, address: location?.address }}>
        <Form.Item name="name" label="Location Name" rules={[{ required: true, message: 'Please input the location name!' }]}>
          <Input placeholder="e.g. GOGO Station - Wandegeya" />
        </Form.Item>
        <Form.Item name="address" label="Address" rules={[{ required: true, message: 'Please input the address!' }]}>
          <Input placeholder="e.g. Wandegeya, Kampala" />
        </Form.Item>
      </Form>
    </Modal>
  );
};