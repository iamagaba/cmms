import { useEffect, useState } from "react";
import { Drawer, Form, Input, Select, Button, InputNumber, DatePicker, Row, Col, Space } from "antd";
import { Vehicle, Customer } from "@/types/supabase";
import dayjs from 'dayjs';

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
    if (isOpen) {
      if (vehicle) {
        form.setFieldsValue({
          ...vehicle,
          date_of_manufacture: vehicle.date_of_manufacture ? dayjs(vehicle.date_of_manufacture) : null,
          release_date: vehicle.release_date ? dayjs(vehicle.release_date) : null,
        });
      } else {
        form.resetFields();
      }
    }
  }, [isOpen, vehicle, form]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      const vehicleToSave: Partial<Vehicle> = {
        id: vehicle?.id,
        ...values,
        date_of_manufacture: values.date_of_manufacture ? values.date_of_manufacture.toISOString() : null,
        release_date: values.release_date ? values.release_date.toISOString() : null,
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
    <Drawer
      title={vehicle ? "Edit Asset" : "Add Asset"}
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
      <Form form={form} layout="vertical" name="asset_form">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="license_plate" label="License Plate" rules={[{ required: true }]}>
              <Input placeholder="e.g. UBF 123X" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="customer_id" label="Owner">
              <Select placeholder="Assign an owner" allowClear>
                {customers.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}><Form.Item name="make" label="Make" rules={[{ required: true }]}><Input placeholder="e.g. Tesla" /></Form.Item></Col>
          <Col span={8}><Form.Item name="model" label="Model" rules={[{ required: true }]}><Input placeholder="e.g. Model 3" /></Form.Item></Col>
          <Col span={8}><Form.Item name="year" label="Year" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} placeholder="e.g. 2023" /></Form.Item></Col>
          <Col span={12}><Form.Item name="vin" label="VIN / Chassis Number" rules={[{ required: true }]}><Input placeholder="Vehicle Identification Number" /></Form.Item></Col>
          <Col span={12}><Form.Item name="motor_number" label="Motor Number"><Input placeholder="Motor serial number" /></Form.Item></Col>
          <Col span={24}><Form.Item name="mileage" label="Mileage / Total KMs"><InputNumber style={{ width: '100%' }} placeholder="e.g. 50000" formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={value => value!.replace(/\$\s?|(,*)/g, '')} /></Form.Item></Col>
          <Col span={12}><Form.Item name="date_of_manufacture" label="Date of Manufacture"><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
          <Col span={12}><Form.Item name="release_date" label="Release Date to Customer"><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
        </Row>
      </Form>
    </Drawer>
  );
};