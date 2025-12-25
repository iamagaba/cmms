import { useEffect, useState } from "react";
import { Drawer, Form, Input, Select, Button, DatePicker, Col, Row, Typography, Space, Divider, Card, message, Tooltip } from "antd";
import { WorkOrder, Technician, Location, ServiceCategory } from "@/types/supabase";
import dayjs from 'dayjs';
import { MapboxLocationSearchInput } from "./MapboxLocationSearchInput";
import { Icon } from '@iconify/react'; // Import Icon from Iconify
import { useSession } from "@/context/SessionContext";
import BikeDiagnosisWizard from "./BikeDiagnosisWizard";

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
      const initialDiagnosisValue =
        workOrder?.initialDiagnosis ??
        prefillData?.initialDiagnosis ??
        '';
      // Merge workOrder (edit) and prefillData (create) for initial values
      form.setFieldsValue({
        ...prefillData,
        ...workOrder,
        vehicleId: workOrder?.vehicleId ?? prefillData?.vehicleId,
        vehicleModel: workOrder?.vehicleModel ?? prefillData?.vehicleModel,
        customerName: workOrder?.customerName ?? prefillData?.customerName,
        customerPhone: workOrder?.customerPhone ?? prefillData?.customerPhone,
        customerId: workOrder?.customerId ?? prefillData?.customerId,
        slaDue: workOrder?.slaDue ? dayjs(workOrder.slaDue) : (prefillData?.slaDue ? dayjs(prefillData.slaDue as string) : null),
        appointmentDate: workOrder?.appointmentDate ? dayjs(workOrder.appointmentDate) : null,
        customerAddress: workOrder?.customerAddress ?? prefillData?.customerAddress,
        initialDiagnosis: initialDiagnosisValue, // Populate initialDiagnosis field
      });
      if (workOrder?.customerLat && workOrder?.customerLng) {
        setClientLocation({ lat: workOrder.customerLat, lng: workOrder.customerLng });
      } else if (prefillData) {
        type WithCoords = { customerLat?: number | null; customerLng?: number | null };
        const pd = prefillData as WithCoords;
        if (typeof pd.customerLat === 'number' && typeof pd.customerLng === 'number') {
          setClientLocation({ lat: pd.customerLat, lng: pd.customerLng });
        }
      }
      if (workOrder?.customerAddress) {
        setClientAddress(workOrder.customerAddress);
      } else if (prefillData?.customerAddress) {
        setClientAddress(prefillData.customerAddress);
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


  const handleSubmit = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      // Remove non-persistent frontend-only fields before sending to backend
      const { initialDiagnosis: _omitInitialDiagnosis, ...restValues } = values;
      // Only send valid backend fields. Map initialDiagnosis to service
      const initialDiagnosisValue: string = (form.getFieldValue('initialDiagnosis')
        || generatedInitialDiagnosis
        || '')
        .toString()
        .trim();
      const rawWorkOrderData: Partial<WorkOrder> & { client_report?: string | null } = {
        ...prefillData,
        ...restValues,
        slaDue: values.slaDue?.toISOString(),
        appointmentDate: values.appointmentDate ? values.appointmentDate.toISOString() : null,
        customerLat: clientLocation?.lat,
        customerLng: clientLocation?.lng,
        customerAddress: clientAddress,
        activityLog: workOrder?.activityLog || [{ timestamp: new Date().toISOString(), activity: 'Work order created.', userId: session?.user.id ?? null }],
        partsUsed: workOrder?.partsUsed || [],
        client_report: initialDiagnosisValue || null,
      };
      if (workOrder?.id) {
        rawWorkOrderData.id = workOrder.id;
      }
      const { customerName: _customerName, customerPhone: _customerPhone, vehicleModel: _vehicleModel, ...workOrderToSave } = rawWorkOrderData;
      onSave(workOrderToSave);
      message.success('Work order saved successfully!');
      onClose();
    } catch (info) {
      message.error('Please check the form for errors.');
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
        icon={isFullScreen ? <Icon icon="ph:arrows-in-line-horizontal-fill" /> : <Icon icon="ph:arrows-out-line-horizontal-fill" />} 
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
          <Button key="cancel" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button key="submit" type="primary" onClick={handleSubmit} loading={loading}>Save Work Order</Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical" name="work_order_form">
  <Card size="small" bordered={false} style={{ marginBottom: 24 }}>
          <Divider orientation="left">Customer & Vehicle Details</Divider>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="vehicleId" label={<Tooltip title="Unique system ID for this vehicle (auto-filled)">Vehicle ID</Tooltip>}>
                <Input disabled />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="vehicleModel" label={<Tooltip title="Make and model of the vehicle (auto-filled)">Vehicle Model</Tooltip>}>
                <Input disabled />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="customerName" label={<Tooltip title="Name of the asset owner (auto-filled)">Customer Name</Tooltip>}>
                <Input disabled />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="customerPhone" label={<Tooltip title="Phone number of the asset owner (auto-filled)">Customer Phone</Tooltip>}>
                <Input disabled />
              </Form.Item>
            </Col>
          </Row>
        </Card>
  <Card size="small" bordered={false} style={{ marginBottom: 24 }}>
          <Divider orientation="left">Service Details</Divider>
          <Row gutter={16}>
            {/* Hidden field to register the initialDiagnosis in the Form store */}
            <Form.Item name="initialDiagnosis" hidden>
              <Input />
            </Form.Item>
            <Col span={24}>
              <Form.Item label="Initial Diagnosis" required>
                {isDiagnosing ? (
                  <BikeDiagnosisWizard onComplete={(summary) => {
                    setGeneratedInitialDiagnosis(summary);
                    form.setFieldsValue({ initialDiagnosis: summary });
                    // Exit diagnosing mode after capturing the summary
                    setIsDiagnosing(false);
                  }} />
                ) : (
                  <>
                    <TextArea 
                      rows={4} 
                      placeholder="What is the initial diagnosis?"
                      value={form.getFieldValue('initialDiagnosis')}
                      onChange={(e) => {
                        form.setFieldsValue({ initialDiagnosis: e.target.value });
                        setGeneratedInitialDiagnosis(e.target.value);
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
            <Col span={24}>
              <Form.Item 
                name="service_category_id" 
                label={<Tooltip title="Type of service or repair required">Service Category</Tooltip>} 
                rules={[{ required: true, message: 'Please select a service category' }]}
              >
                <Select showSearch placeholder="Select a service category">
                  {serviceCategories.map(sc => <Option key={sc.id} value={sc.id}>{sc.name}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item 
                name="status" 
                label={<Tooltip title="Current progress stage of the work order">Status</Tooltip>} 
                rules={[{ required: true, message: 'Please select a status' }]}
              >
                <Select>
                  <Option value="Open">Open</Option>
                  <Option value="Confirmation">Confirmation</Option>
                  <Option value="Ready">Ready</Option>
                  <Option value="In Progress">In Progress</Option>
                  <Option value="On Hold">On Hold</Option>
                  <Option value="Completed">Completed</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item 
                name="priority" 
                label={<Tooltip title="How urgent is this work order?">Priority</Tooltip>} 
                rules={[{ required: true, message: 'Please select a priority' }]}
              >
                <Select>
                  <Option value="High">High</Option>
                  <Option value="Medium">Medium</Option>
                  <Option value="Low">Low</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item 
                name="channel" 
                label={<Tooltip title="How was this work order reported?">Channel</Tooltip>}
              >
                <Select allowClear placeholder="Select a channel">
                  {channelOptions.map(c => <Option key={c} value={c}>{c}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item 
                name="locationId" 
                label={<Tooltip title="Where will the service be performed?">Service Location</Tooltip>} 
                rules={[{ required: true, message: 'Please select a service location' }]}
              >
                <Select>
                  {locations.map(l => <Option key={l.id} value={l.id}>{l.name.replace(' Service Center', '')}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item 
                name="customerAddress" 
                label={<Tooltip title="Client's address for on-site service (optional)">Client Location (Optional)</Tooltip>}
              >
                <MapboxLocationSearchInput onLocationSelect={handleLocationSelect} initialValue={workOrder?.customerAddress || prefillData?.customerAddress || ''} />
              </Form.Item>
            </Col>
          </Row>
        </Card>
  <Card size="small" bordered={false} style={{ marginBottom: 24 }}>
          <Divider orientation="left">Assignment & Scheduling</Divider>
          <Row gutter={16}>
            <Col span={24}><Text type="secondary" style={{ marginBottom: 16, display: 'block' }}>Assign a technician OR schedule an appointment to move the work order to 'In Progress'.</Text></Col>
            <Col xs={24} md={12}><Form.Item name="assignedTechnicianId" label="Assigned Technician"><Select allowClear>{technicians.map(t => <Option key={t.id} value={t.id}>{t.name}</Option>)}</Select></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="appointmentDate" label="Appointment Date">
              <DatePicker 
                showTime={{ format: 'HH', use12Hours: false, minuteStep: 30 }} 
                format="YYYY-MM-DD HH"
                style={{ width: '100%' }} 
              />
            </Form.Item></Col>
            <Col span={24}><Form.Item name="slaDue" label="SLA Due Date" rules={[{ required: true }]}>
              <DatePicker 
                showTime={{ format: 'HH', use12Hours: false, minuteStep: 30 }} 
                format="YYYY-MM-DD HH"
                style={{ width: '100%' }} 
              />
            </Form.Item></Col>
          </Row>
        </Card>
      </Form>
    </Drawer>
  );
};