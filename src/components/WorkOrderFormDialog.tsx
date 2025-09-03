import { useEffect, useState } from "react";
import { Modal, Form, Input, Select, Button, DatePicker, Col, Row } from "antd";
import { WorkOrder, technicians, locations } from "@/data/mockData";
import dayjs from 'dayjs';
import { LocationSearchInput } from "./LocationSearchInput";

const { Option } = Select;
const { TextArea } = Input;

interface WorkOrderFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: WorkOrder) => void;
  workOrder?: WorkOrder | null;
}

export const WorkOrderFormDialog = ({ isOpen, onClose, onSave, workOrder }: WorkOrderFormDialogProps) => {
  const [form] = Form.useForm();
  const [clientLocation, setClientLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [clientAddress, setClientAddress] = useState<string | null>(null);

  useEffect(() => {
    if (workOrder) {
      form.setFieldsValue({
        ...workOrder,
        slaDue: workOrder.slaDue ? dayjs(workOrder.slaDue) : null,
        customerAddress: workOrder.customerAddress,
      });
      if (workOrder.customerLat && workOrder.customerLng) {
        setClientLocation({ lat: workOrder.customerLat, lng: workOrder.customerLng });
      }
      if (workOrder.customerAddress) {
        setClientAddress(workOrder.customerAddress);
      }
    } else {
      form.resetFields();
      setClientLocation(null);
      setClientAddress(null);
    }
  }, [isOpen, workOrder, form]);

  const handleLocationSelect = (location: { lat: number; lng: number; label: string }) => {
    setClientLocation({ lat: location.lat, lng: location.lng });
    setClientAddress(location.label);
    form.setFieldsValue({ customerAddress: location.label });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const newId = workOrder?.id || `WO-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      const workOrderToSave: WorkOrder = {
        ...workOrder,
        ...values,
        id: newId,
        slaDue: values.slaDue.toISOString(),
        customerLat: clientLocation?.lat,
        customerLng: clientLocation?.lng,
        customerAddress: clientAddress,
      };
      onSave(workOrderToSave);
      onClose();
    } catch (info) {
      console.log('Validate Failed:', info);
    }
  };

  return (
    <Modal
      title={workOrder ? "Edit Work Order" : "Create Work Order"}
      open={isOpen}
      onOk={handleSubmit}
      onCancel={onClose}
      width={600}
      destroyOnClose
      footer={[
        <Button key="back" onClick={onClose}>Cancel</Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>Save Work Order</Button>,
      ]}
    >
      <Form form={form} layout="vertical" name="work_order_form">
        <Row gutter={16}>
          <Col span={12}><Form.Item name="vehicleId" label="Vehicle ID" rules={[{ required: true }]}><Input /></Form.Item></Col>
          <Col span={12}><Form.Item name="vehicleModel" label="Vehicle Model" rules={[{ required: true }]}><Input /></Form.Item></Col>
          <Col span={12}><Form.Item name="customerName" label="Customer Name" rules={[{ required: true }]}><Input /></Form.Item></Col>
          <Col span={12}><Form.Item name="customerPhone" label="Customer Phone" rules={[{ required: true }]}><Input /></Form.Item></Col>
          <Col span={24}><Form.Item name="service" label="Service Description" rules={[{ required: true }]}><TextArea rows={2} /></Form.Item></Col>
          <Col span={12}><Form.Item name="status" label="Status" rules={[{ required: true }]}><Select><Option value="Open">Open</Option><Option value="In Progress">In Progress</Option><Option value="On Hold">On Hold</Option><Option value="Completed">Completed</Option></Select></Form.Item></Col>
          <Col span={12}><Form.Item name="priority" label="Priority" rules={[{ required: true }]}><Select><Option value="High">High</Option><Option value="Medium">Medium</Option><Option value="Low">Low</Option></Select></Form.Item></Col>
          <Col span={12}><Form.Item name="locationId" label="Service Location" rules={[{ required: true }]}><Select>{locations.map(l => <Option key={l.id} value={l.id}>{l.name}</Option>)}</Select></Form.Item></Col>
          <Col span={12}><Form.Item name="assignedTechnicianId" label="Assigned Technician"><Select allowClear>{technicians.map(t => <Option key={t.id} value={t.id}>{t.name}</Option>)}</Select></Form.Item></Col>
          <Col span={12}><Form.Item name="slaDue" label="SLA Due Date" rules={[{ required: true }]}><DatePicker showTime style={{ width: '100%' }} /></Form.Item></Col>
          <Col span={12}>
              <Form.Item name="customerAddress" label="Client Location">
                  <LocationSearchInput 
                      onLocationSelect={handleLocationSelect}
                      initialValue={workOrder?.customerAddress || ''}
                  />
              </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};