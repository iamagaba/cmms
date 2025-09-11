import { useEffect, useState } from "react";
import { Drawer, Form, Input, Select, Button, DatePicker, Space } from "antd";
import { Technician, Location } from "@/types/supabase";
import dayjs from 'dayjs';

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
        form.setFieldsValue({
          ...technician,
          join_date: technician.join_date ? dayjs(technician.join_date) : null, // Use join_date
          specializations: technician.specializations || [], // Use specializations array
        });
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
        id: technician?.id,
        ...values,
        join_date: values.join_date.toISOString(), // Use join_date
        specializations: values.specializations || [], // Ensure specializations is an array
      };
      
      onSave(technicianToSave);
      onClose();
    } catch (info) {
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
        <Form.Item name="join_date" label="Join Date" rules={[{ required: true, message: 'Please select a join date!' }]}> {/* Use join_date */}
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Drawer>
  );
};