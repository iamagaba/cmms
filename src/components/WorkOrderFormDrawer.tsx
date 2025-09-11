import { useEffect, useState } from "react";
import { Drawer, Form, Input, Select, Button, DatePicker, Col, Row, Typography, Space } from "antd";
import { WorkOrder, Technician, Location, ServiceCategory } from "@/types/supabase";
import dayjs from 'dayjs';
import { MapboxLocationSearchInput } from "./MapboxLocationSearchInput";
import { Icon } from '@iconify/react'; // Import Icon from Iconify
import { useSession } from "@/context/SessionContext";
import { DiagnosticFlowInput } from "./DiagnosticFlowInput"; // Import the new component

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

const channelOptions = ['Call Center', 'Service Center', 'Social Media', 'Staff', 'Swap Station'];

interface WorkOrderFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<WorkOrder>) => void;
  workOrder?: WorkOrder | null;
  technicians: Technician[];
  locations: Location[];
  serviceCategories: ServiceCategory[];
  prefillData?: Partial<WorkOrder> | null;
}

export const WorkOrderFormDrawer = ({ isOpen, onClose, onSave, workOrder, technicians, locations, serviceCategories, prefillData }: WorkOrderFormDrawerProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [clientLocation, setClientLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [clientAddress, setClientAddress] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const { session } = useSession();

  // State for diagnostic flow
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [generatedInitialDiagnosis, setGeneratedInitialDiagnosis] = useState<string>(''); // Renamed from generatedClientReport

  useEffect(() => {
    if (isOpen) {
      const initialDiagnosisValue = workOrder?.initialDiagnosis || prefillData?.initialDiagnosis || ''; // Renamed from clientReport
      form.setFieldsValue({
        ...workOrder,
        slaDue: workOrder?.slaDue ? dayjs(workOrder.slaDue) : null,
        appointmentDate: workOrder?.appointmentDate ? dayjs(workOrder.appointmentDate) : null,
        customerAddress: workOrder?.customerAddress,
        initialDiagnosis: initialDiagnosisValue, // Populate initialDiagnosis field
      });
      if (workOrder?.customerLat && workOrder?.customerLng) {
        setClientLocation({ lat: workOrder.customerLat, lng: workOrder.customerLng });
      }
      if (workOrder?.customerAddress) {
        setClientAddress(workOrder.customerAddress);
      }

      // Determine if starting with diagnostic flow or manual input
      if (initialDiagnosisValue) {
        setIsDiagnosing(false); // If there's existing data, start with manual input view
        setGeneratedInitialDiagnosis(initialDiagnosisValue);
      } else {
        setIsDiagnosing(true); // If no existing data, start with diagnostic flow
        setGeneratedInitialDiagnosis('');
      }
      setIsFullScreen(false);
    }
  }, [isOpen, workOrder, prefillData, form]);

  const handleLocationSelect = (location: { lat: number; lng: number; label: string }) => {
    setClientLocation({ lat: location.lat, lng: location.lng });
    setClientAddress(location.label);
    form.setFieldsValue({ customerAddress: location.label });
  };

  const handleDiagnosisComplete = (summary: string) => {
    setGeneratedInitialDiagnosis(summary);
    form.setFieldsValue({ initialDiagnosis: summary }); // Update form field with generated summary
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      const rawWorkOrderData: Partial<WorkOrder> = {
        ...prefillData,
        ...values,
        slaDue: values.slaDue?.toISOString(),
        appointmentDate: values.appointmentDate ? values.appointmentDate.toISOString() : null,
        customerLat: clientLocation?.lat,
        customerLng: clientLocation?.lng,
        customerAddress: clientAddress,
        activityLog: workOrder?.activityLog || [{ timestamp: new Date().toISOString(), activity: 'Work order created.', userId: session?.user.id ?? null }],
        partsUsed: workOrder?.partsUsed || [],
        initialDiagnosis: isDiagnosing ? generatedInitialDiagnosis : values.initialDiagnosis, // Use generated or manual report (renamed)
        service: isDiagnosing ? generatedInitialDiagnosis : values.initialDiagnosis, // Keep for backward compatibility with old 'service' column (renamed)
      };
      
      if (workOrder?.id) {
        rawWorkOrderData.id = workOrder.id;
      }

      const { customerName, customerPhone, vehicleModel, ...workOrderToSave } = rawWorkOrderData;

      onSave(workOrderToSave);
      onClose();
    } catch (info) {
      console.log('Validate Failed:', info);
    } finally {
      setLoading(false);
    }
  };

  const drawerWidth = isFullScreen ? '100%' : 720;

  const drawerTitle = (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography.Title level={5} style={{ margin: 0 }}>
        {workOrder ? "Edit Work Order" : "Create Work Order"}
      </Typography.Title>
      <Button 
        icon={isFullScreen ? <Icon icon="si:minimize" /> : <Icon icon="si:maximize" />} 
        onClick={() => setIsFullScreen(!isFullScreen)}
      >
        {isFullScreen ? 'Shrink' : 'Expand'}
      </Button>
    </div>
  );

  return (
    <Drawer 
      title={drawerTitle}
      placement="right" 
      onClose={onClose} 
      open={isOpen} 
      width={drawerWidth} 
      destroyOnClose 
      footer={
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button key="back" onClick={onClose} disabled={loading}>Cancel</Button>,
          <Button key="submit" type="primary" onClick={handleSubmit} loading={loading}>Save Work Order</Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical" name="work_order_form">
        <Row gutter={16}>
          <Col span={24}><Text strong>Customer & Vehicle Details</Text></Col>
          <Col xs={24} md={12}><Form.Item name="vehicleId" label="Vehicle ID"><Input disabled /></Form.Item></Col>
          <Col xs={24} md={12}><Form.Item name="vehicleModel" label="Vehicle Model"><Input disabled /></Form.Item></Col>
          <Col xs={24} md={12}><Form.Item name="customerName" label="Customer Name"><Input disabled /></Form.Item></Col>
          <Col xs={24} md={12}><Form.Item name="customerPhone" label="Customer Phone"><Input disabled /></Form.Item></Col>
          
          <Col span={24} style={{ marginTop: 24 }}><Text strong>Service Details</Text></Col>
          <Col span={24}>
            <Form.Item label="Initial Diagnosis" required> {/* Changed label */}
              {isDiagnosing ? (
                <DiagnosticFlowInput 
                  onDiagnosisComplete={handleDiagnosisComplete} 
                  initialInitialDiagnosis={workOrder?.initialDiagnosis || prefillData?.initialDiagnosis} // Changed prop name
                />
              ) : (
                <>
                  <TextArea 
                    rows={4} 
                    placeholder="What is the initial diagnosis?" // Changed placeholder
                    value={form.getFieldValue('initialDiagnosis')} // Changed field name
                    onChange={(e) => {
                      form.setFieldsValue({ initialDiagnosis: e.target.value }); // Changed field name
                      setGeneratedInitialDiagnosis(e.target.value); // Keep generated report in sync for manual edits
                    }}
                  />
                  <Button 
                    type="link" 
                    onClick={() => setIsDiagnosing(true)} 
                    style={{ paddingLeft: 0, marginTop: 8 }}
                  >
                    Start Diagnostic Flow
                  </Button>
                </>
              )}
            </Form.Item>
          </Col>
          <Col span={24}><Form.Item name="service_category_id" label="Service Category" rules={[{ required: true }]}><Select showSearch placeholder="Select a service category">{serviceCategories.map(sc => <Option key={sc.id} value={sc.id}>{sc.name}</Option>)}</Select></Form.Item></Col>
          <Col xs={24} md={8}><Form.Item name="status" label="Status" rules={[{ required: true }]}><Select><Option value="Open">Open</Option><Option value="Confirmation">Confirmation</Option><Option value="Ready">Ready</Option><Option value="In Progress">In Progress</Option><Option value="On Hold">On Hold</Option><Option value="Completed">Completed</Option></Select></Form.Item></Col>
          <Col xs={24} md={8}><Form.Item name="priority" label="Priority" rules={[{ required: true }]}><Select><Option value="High">High</Option><Option value="Medium">Medium</Option><Option value="Low">Low</Option></Select></Form.Item></Col>
          <Col xs={24} md={8}><Form.Item name="channel" label="Channel"><Select allowClear placeholder="Select a channel">{channelOptions.map(c => <Option key={c} value={c}>{c}</Option>)}</Select></Form.Item></Col>
          <Col xs={24} md={12}><Form.Item name="locationId" label="Service Location" rules={[{ required: true }]}><Select>{locations.map(l => <Option key={l.id} value={l.id}>{l.name.replace(' Service Center', '')}</Option>)}</Select></Form.Item></Col>
          <Col xs={24} md={12}><Form.Item name="customerAddress" label="Client Location (Optional)"><MapboxLocationSearchInput onLocationSelect={handleLocationSelect} initialValue={workOrder?.customerAddress || ''} /></Form.Item></Col>

          <Col span={24} style={{ marginTop: 24 }}><Text strong>Assignment & Scheduling</Text></Col>
          <Col span={24}><Text type="secondary" style={{ marginBottom: 16, display: 'block' }}>Assign a technician OR schedule an appointment to move the work order to 'In Progress'.</Text></Col>
          <Col xs={24} md={12}><Form.Item name="assignedTechnicianId" label="Assigned Technician"><Select allowClear>{technicians.map(t => <Option key={t.id} value={t.id}>{t.name}</Option>)}</Select></Form.Item></Col>
          <Col xs={24} md={12}><Form.Item name="appointmentDate" label="Appointment Date"><DatePicker showTime style={{ width: '100%' }} /></Form.Item></Col>
          <Col span={24}><Form.Item name="slaDue" label="SLA Due Date" rules={[{ required: true }]}><DatePicker showTime style={{ width: '100%' }} /></Form.Item></Col>
        </Row>
      </Form>
    </Drawer>
  );
};