import { useEffect, useState } from "react";
import { Modal, Form, Input, Select, Button, InputNumber } from "antd";
import { Vehicle, Customer } from "@/types/supabase";

const { Option } = Select;

interface AssetFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Vehicle>) => void;
  vehicle?: Vehicle | null;
  customers: Customer[];
}

export const AssetFormDialog = ({ isOpen, onClose, onSave, vehicle, customers }: AssetFormDialogProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (vehicle) {
      form.setFieldsValue(vehicle);
    } else {
      form.resetFields();
    }
  }, [isOpen, vehicle, form]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      const vehicleToSave: Partial<Vehicle> = {
        id: vehicle?.id,
        ...values,
      };
      
      onSave(vehicleToSave);
      onClose();
    } catch (info) {
      console.log('Validate Failed:', info);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={vehicle ? "Edit Asset" : "Add Asset"}
      open={isOpen}
      onOk={handleSubmit}
      onCancel={onClose}
      destroyOnClose
      footer={[
        <Button key="back" onClick={onClose} disabled={loading}>Cancel</Button>,
        <Button key="submit" type="primary" onClick={handleSubmit} loading={loading}>Save</Button>,
      ]}
    >
      <Form form={form} layout="vertical" name="asset_form">
        <Form.Item name="make" label="Make" rules={[{ required: true }]}>
          <Input placeholder="e.g. Tesla" />
        </Form.Item>
        <Form.Item name="model" label="Model" rules={[{ required: true }]}>
          <Input placeholder="e.g. Model 3" />
        </Form.Item>
        <Form.Item name="year" label="Year" rules={[{ required: true }]}>
          <InputNumber style={{ width: '100%' }} placeholder="e.g. 2023" />
        </Form.Item>
        <Form.Item name="vin" label="VIN" rules={[{ required: true }]}>
          <Input placeholder="Vehicle Identification Number" />
        </Form.Item>
        <Form.Item name="license_plate" label="License Plate">
          <Input placeholder="e.g. UBF 123X" />
        </Form.Item>
        <Form.Item name="customer_id" label="Owner">
          <Select placeholder="Assign an owner" allowClear>
            {customers.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};