import { useEffect, useState } from "react";
import { Modal, Form, Input, Select, Button, DatePicker, Col, Row, Typography } from "antd";
import { WorkOrder, Technician, Location } from "@/types/supabase";
import dayjs from 'dayjs';
import { GoogleLocationSearchInput } from "./GoogleLocationSearchInput";

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

interface WorkOrderFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<WorkOrder>) => void;
  workOrder?: WorkOrder | null;
  technicians: Technician[];
  locations: Location[];
}

export const WorkOrderFormDialog = ({ isOpen, onClose, onSave, workOrder, technicians, locations }: WorkOrderFormDialogProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [clientLocation, setClientLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [clientAddress, setClientAddress] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (workOrder) {
        form.setFieldsValue({
          ...workOrder,
          slaDue: workOrder.slaDue ? dayjs(workOrder.slaDue) : null,
          appointmentDate: workOrder.appointmentDate ? dayjs(workOrder.appointmentDate) : null,
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
        form.setFieldsValue({ status: 'Open', priority: 'Medium' });
        setClientLocation(null);
        setClientAddress(null);
      }
    }
  }, [isOpen, workOrder, form]);

  const handleLocationSelect = (location: { lat: number; lng: number; label: string }) => {
    setClientLocation({ lat: location.lat, lng: location.lng });
    setClientAddress(location.label);
    form.setFieldsValue({ customerAddress: location.label });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      const workOrderToSave: Partial<WorkOrder> = {
        id: workOrder?.id,
        ...values,
        slaDue: values.slaDue?.toISOString(),
        appointmentDate: values.appointmentDate ? values.appointmentDate.toISOString() : null,
        customerLat: clientLocation?.lat,
        customerLng: clientLocation?.lng,
        customerAddress: clientAddress,
        activityLog: workOrder?.activityLog || [{ timestamp: new Date().toISOString(), activity: 'Work order created.' }],
        partsUsed: workOrder?.partsUsed || [],
      };
      
      onSave(workOrderToSave); // Pass the data as is, parent component will handle camelToSnakeCase
      onClose();
    } catch (info) {
      console.log('Validate Failed:', info);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      title={workOrder ? "Edit Work Order" : "Create Work Order"} 
      open={isOpen} 
      onCancel={onClose} 
      width={720} 
      destroyOnClose 
      footer={[
        <Button key="back" onClick={onClose} disabled={loading}>Cancel</Button>,
        <Button key="submit" type="primary" onClick={handleSubmit} loading={loading}>Save Work Order</Button>,
      ]}
    >
      <Form form={form} layout="vertical" name="work_order_form">
        <Row gutter={16}>
          <Col span={24}><Text strong>Customer & Vehicle Details</Text></Col>
          <Col span={12}><Form.Item name="vehicleId" label="Vehicle ID" rules={[{ required: true }]}><Input /></Form.Item></Col>
          <Col span={12}><Form.Item name="vehicleModel" label="Vehicle Model" rules={[{ required: true }]}><Input /></Form.Item></Col>
          <Col span={12}><Form.Item name="customerName" label="Customer Name" rules={[{ required: true }]}><Input /></Form.Item></Col>
          <Col span={12}><Form.Item name="customerPhone" label="Customer Phone" rules={[{ required: true }]}><Input /></Form.Item></Col>
          
          <Col span={24} style={{ marginTop: 24 }}><Text strong>Service Details</Text></Col>
          <Col span={24}><Form.Item name="service" label="Service Description" rules={[{ required: true }]}><TextArea rows={2} /></Form.Item></Col>
          <Col span={12}><Form.Item name="status" label="Status" rules={[{ required: true }]}><Select><Option value="Open">Open</Option><Option value="Confirmation">Confirmation</Option><Option value="Ready">Ready</Option><Option value="In Progress">In Progress</Option><Option value="On Hold">On Hold</Option><Option value="Completed">Completed</Option></Select></Form.Item></Col>
          <Col span={12}><Form.Item name="priority" label="Priority" rules={[{ required: true }]}><Select><Option value="High">High</Option><Option value="Medium">Medium</Option><Option value="Low">Low</Option></Select></Form.Item></Col>
          <Col span={12}><Form.Item name="locationId" label="Service Location" rules={[{ required: true }]}><Select>{locations.map(l => <Option key={l.id} value={l.id}>{l.name.replace(' Service Center', '')}</Option>)}</Select></Form.Item></Col>
          <Col span={12}><Form.Item name="customerAddress" label="Client Location (Optional)"><GoogleLocationSearchInput onLocationSelect={handleLocationSelect} initialValue={workOrder?.customerAddress || ''} /></Form.Item></Col>

          <Col span={24} style={{ marginTop: 24 }}><Text strong>Assignment & Scheduling</Text></Col>
          <Col span={24}><Text type="secondary" style={{ marginBottom: 16, display: 'block' }}>Assign a technician OR schedule an appointment to move the work order to 'In Progress'.</Text></Col>
          <Col span={12}><Form.Item name="assignedTechnicianId" label="Assigned Technician"><Select allowClear>{technicians.map(t => <Option key={t.id} value={t.id}>{t.name}</Option>)}</Select></Form.Item></Col>
          <Col span={12}><Form.Item name="appointmentDate" label="Appointment Date"><DatePicker showTime style={{ width: '100%' }} /></Form.Item></Col>
          <Col span={24}><Form.Item name="slaDue" label="SLA Due Date" rules={[{ required: true }]}><DatePicker showTime style={{ width: '100%' }} /></Form.Item></Col>
        </Row>
      </Form>
    </Modal>
  );
};