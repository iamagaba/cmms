import { useEffect } from "react";
import { Modal, Form, Input, Select, Button, DatePicker } from "antd";
import { Technician } from "@/data/mockData";
import dayjs from 'dayjs';

const { Option } = Select;

interface TechnicianFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Technician) => void;
  technician?: Technician | null;
}

export const TechnicianFormDialog = ({ isOpen, onClose, onSave, technician }: TechnicianFormDialogProps) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (technician) {
      form.setFieldsValue({
        ...technician,
        joinDate: technician.joinDate ? dayjs(technician.joinDate) : null,
      });
    } else {
      form.resetFields();
    }
  }, [isOpen, technician, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const newId = technician?.id || `tech${Math.floor(Math.random() * 1000)}`;
      const technicianToSave: Technician = {
        id: newId,
        name: values.name,
        status: values.status,
        avatar: technician?.avatar || '/placeholder.svg',
        email: values.email,
        phone: values.phone,
        specialization: values.specialization,
        joinDate: values.joinDate.toISOString(),
      };
      onSave(technicianToSave);
      onClose();
    } catch (info) {
      console.log('Validate Failed:', info);
    }
  };

  return (
    <Modal
      title={technician ? "Edit Technician" : "Add Technician"}
      open={isOpen}
      onOk={handleSubmit}
      onCancel={onClose}
      destroyOnClose
      footer={[
        <Button key="back" onClick={onClose}>Cancel</Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>Save</Button>,
      ]}
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
        <Form.Item name="status" label="Status" rules={[{ required: true, message: 'Please select a status!' }]}>
          <Select placeholder="Select a status">
            <Option value="available">Available</Option>
            <Option value="busy">Busy</Option>
            <Option value="offline">Offline</Option>
          </Select>
        </Form.Item>
        <Form.Item name="specialization" label="Specialization" rules={[{ required: true, message: 'Please select a specialization!' }]}>
          <Select placeholder="Select a specialization">
            <Option value="Electrical">Electrical</Option>
            <Option value="Mechanical">Mechanical</Option>
            <Option value="Diagnostics">Diagnostics</Option>
          </Select>
        </Form.Item>
        <Form.Item name="joinDate" label="Join Date" rules={[{ required: true, message: 'Please select a join date!' }]}>
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};