import { v4 as uuidv4 } from 'uuid';
import { useEffect, useState } from "react";
import { Drawer, Form, Input, Select, Button, Space } from "antd";
import { Technician, Location } from "@/types/supabase";


const { Option } = Select;

interface TechnicianFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Technician) => void;
  technician?: Technician | null;
  locations: Location[];
}

export const TechnicianFormDialog = ({ isOpen, onClose, onSave, technician, locations }: TechnicianFormDialogProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (technician) {
        const formData = {
          ...technician,
          // join_date removed
          specializations: technician.specializations || [], // Use specializations array
        };
        form.setFieldsValue(formData);
      } else {
        form.resetFields();
      }
    }
  }, [isOpen, technician, form]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      const technicianToSave: Technician = {
        id: technician?.id || uuidv4(),
        name: values.name,
        avatar: values.avatar ?? null,
        status: values.status ?? 'available',
        email: values.email ?? '',
        phone: values.phone ?? '',
        specializations: values.specializations || [],
        lat: values.lat ?? null,
        lng: values.lng ?? null,
        max_concurrent_orders: values.max_concurrent_orders ?? null,
        location_id: values.location_id ?? null,
        created_at: values.created_at ?? undefined,
        updated_at: values.updated_at ?? undefined,
      };
      onSave(technicianToSave);
    } catch (info) {
      // Just log info; error message for join_date is handled above
      console.log('Validate Failed:', info);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      title={technician ? "Edit Technician" : "Add Technician"}
      placement="right"
      onClose={onClose}
      open={isOpen}
      width={720}
      destroyOnClose
      footer={
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button key="back" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button key="submit" type="primary" onClick={handleSubmit} loading={loading}>Save</Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical" name="technician_form">
        <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please input the name!' }]}>
          <Input placeholder="e.g. John Doe" />
        </Form.Item>
        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Please enter a valid email!' }]}>
          <Input placeholder="e.g. john.doe@gogo.com" />
        </Form.Item>
        <Form.Item name="phone" label="Phone Number" rules={[{ required: true, message: 'Please input the phone number!' }]}>
          <Input placeholder="e.g. +256 772 123456" />
        </Form.Item>
        <Form.Item name="location_id" label="Assigned Location">
          <Select placeholder="Select a location" allowClear>
            {locations.map(loc => (
              <Option key={loc.id} value={loc.id}>{loc.name}</Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="status" label="Status" rules={[{ required: true, message: 'Please select a status!' }]}>
          <Select placeholder="Select a status">
            <Option value="available">Available</Option>
            <Option value="busy">Busy</Option>
            <Option value="offline">Offline</Option>
          </Select>
        </Form.Item>
        <Form.Item name="specializations" label="Specialization" rules={[{ required: true, message: 'Please select a specialization!' }]}>
          <Select mode="multiple" placeholder="Select specializations"> {/* Changed to multiple select */}
            <Option value="Electrical">Electrical</Option>
            <Option value="Mechanical">Mechanical</Option>
            <Option value="Diagnostics">Diagnostics</Option>
          </Select>
        </Form.Item>
        {/* join_date field removed */}
      </Form>
    </Drawer>
  );
};