import { useParams, useNavigate, Link } from "react-router-dom";
import { Avatar, Button, Card, Col, Descriptions, Row, Space, Tag, Timeline, Typography, List, Skeleton, Select, DatePicker, Input } from "antd";
import { ArrowLeftOutlined, UserOutlined, EnvironmentOutlined, PhoneOutlined, CalendarOutlined, ToolOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import NotFound from "./NotFound";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder, Technician, Location } from "@/types/supabase";
import { useState } from "react";
import { showSuccess, showError, showInfo } from "@/utils/toast";
import { camelToSnakeCase } from "@/utils/data-helpers";
import { OnHoldReasonDialog } from "@/components/OnHoldReasonDialog";
import { GoogleLocationSearchInput } from "@/components/GoogleLocationSearchInput";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const statusColors: Record<string, string> = { 
  Open: '#7F56D9', 
  "Pending Confirmation": "#13C2C2", 
  "Confirmed & Ready": "#d9d9d9", 
  "In Progress": "#FAAD14", 
  "On Hold": "#FA8C16", 
  Completed: '#22C55E' 
};
const priorityColors: Record<string, string> = { High: "#FF4D4F", Medium: "#FAAD14", Low: "#52c41a" };

const API_KEY = import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY || "";

const WorkOrderDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [onHoldWorkOrder, setOnHoldWorkOrder] = useState<WorkOrder | null>(null);

  const { data: workOrder, isLoading: isLoadingWorkOrder } = useQuery<WorkOrder | null>({
    queryKey: ['work_order', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('work_orders').select('*').eq('id', id).single();
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!id,
  });

  const { data: technician, isLoading: isLoadingTechnician } = useQuery<Technician | null>({
    queryKey: ['technician', workOrder?.assignedTechnicianId],
    queryFn: async () => {
      if (!workOrder?.assignedTechnicianId) return null;
      const { data, error } = await supabase.from('technicians').select('*').eq('id', workOrder.assignedTechnicianId).single();
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!workOrder?.assignedTechnicianId,
  });

  const { data: location, isLoading: isLoadingLocation } = useQuery<Location | null>({
    queryKey: ['location', workOrder?.locationId],
    queryFn: async () => {
      if (!workOrder?.locationId) return null;
      const { data, error } = await supabase.from('locations').select('*').eq('id', workOrder.locationId).single();
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!workOrder?.locationId,
  });

  const { data: allTechnicians, isLoading: isLoadingAllTechnicians } = useQuery<Technician[]>({
    queryKey: ['technicians'],
    queryFn: async () => {
      const { data, error } = await supabase.from('technicians').select('*');
      if (error) throw new Error(error.message);
      return data || [];
    }
  });

  const { data: allLocations, isLoading: isLoadingAllLocations } = useQuery<Location[]>({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase.from('locations').select('*');
      if (error) throw new Error(error.message);
      return data || [];
    }
  });

  const workOrderMutation = useMutation({
    mutationFn: async (workOrderData: Partial<WorkOrder>) => {
      const { error } = await supabase.from('work_orders').upsert(workOrderData);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work_order', id] });
      queryClient.invalidateQueries({ queryKey: ['work_orders'] });
      showSuccess('Work order has been updated.');
    },
    onError: (error) => showError(error.message),
  });

  const handleUpdateWorkOrder = (updates: Partial<WorkOrder>) => {
    if (!workOrder) return;

    if (updates.status === 'On Hold') {
      setOnHoldWorkOrder(workOrder);
      return;
    }

    if ((updates.assignedTechnicianId || updates.appointmentDate) && workOrder.status === 'Confirmed & Ready') {
      updates.status = 'In Progress';
      showInfo(`Work Order ${workOrder.workOrderNumber} automatically moved to In Progress.`);
    }
    
    workOrderMutation.mutate(camelToSnakeCase({ id: workOrder.id, ...updates }));
  };

  const handleSaveOnHoldReason = (reason: string) => {
    if (!onHoldWorkOrder) return;
    const updates = { status: 'On Hold' as const, onHoldReason: reason };
    workOrderMutation.mutate(camelToSnakeCase({ id: onHoldWorkOrder.id, ...updates }));
    setOnHoldWorkOrder(null);
  };

  const handleLocationSelect = (selectedLoc: { lat: number; lng: number; label: string }) => {
    handleUpdateWorkOrder({
      customerAddress: selectedLoc.label,
      customerLat: selectedLoc.lat,
      customerLng: selectedLoc.lng,
    });
  };

  const isLoading = isLoadingWorkOrder || isLoadingTechnician || isLoadingLocation || isLoadingAllTechnicians || isLoadingAllLocations;

  if (isLoading) {
    return <Skeleton active />;
  }

  if (!workOrder) {
    return <NotFound />;
  }

  const hasClientLocation = workOrder.customerLat != null && workOrder.customerLng != null;

  const getMapUrl = () => {
    if (!API_KEY) return "";
    let markers = [];
    if (location) markers.push(`markers=color:blue%7Clabel:S%7C${location.lat},${location.lng}`);
    if (hasClientLocation) markers.push(`markers=color:orange%7Clabel:C%7C${workOrder.customerLat},${workOrder.customerLng}`);
    if (markers.length === 0) return "";
    return `https://maps.googleapis.com/maps/api/staticmap?size=600x300&maptype=roadmap&${markers.join('&')}&key=${API_KEY}`;
  };

  const mapUrl = getMapUrl();

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/work-orders')}>Back to Work Orders</Button>
        <Space>
          <Title level={4} style={{ margin: 0 }}>Work Order: {workOrder.workOrderNumber}</Title>
          <Select
            value={workOrder.status || 'Open'}
            onChange={(value) => handleUpdateWorkOrder({ status: value })}
            style={{ width: 180 }}
            bordered={false}
          >
            <Option value="Open"><Tag color={statusColors["Open"]}>Open</Tag></Option>
            <Option value="Pending Confirmation"><Tag color={statusColors["Pending Confirmation"]}>Pending Confirmation</Tag></Option>
            <Option value="Confirmed & Ready"><Tag color={statusColors["Confirmed & Ready"]}>Confirmed & Ready</Tag></Option>
            <Option value="In Progress"><Tag color={statusColors["In Progress"]}>In Progress</Tag></Option>
            <Option value="On Hold"><Tag color={statusColors["On Hold"]}>On Hold</Tag></Option>
            <Option value="Completed"><Tag color={statusColors["Completed"]}>Completed</Tag></Option>
          </Select>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card title="Service Information">
              <Title level={5} editable={{ onChange: (value) => handleUpdateWorkOrder({ service: value }) }}>{workOrder.service}</Title>
              <Paragraph editable={{ onChange: (value) => handleUpdateWorkOrder({ serviceNotes: value }) }} type="secondary">{workOrder.serviceNotes}</Paragraph>
              {(workOrder.partsUsed || []).length > 0 && (
                <>
                  <Text strong>Parts Used</Text>
                  <List
                    size="small"
                    dataSource={workOrder.partsUsed || []}
                    renderItem={(item: { name: string; quantity: number }) => (
                      <List.Item>
                        {item.name} <Text type="secondary">(Qty: {item.quantity})</Text>
                      </List.Item>
                    )}
                  />
                </>
              )}
            </Card>
            <Card title="Customer & Vehicle Details">
              <Descriptions column={1} bordered>
                <Descriptions.Item label="Customer" labelStyle={{ width: '150px' }}>
                  <Text editable={{ onChange: (value) => handleUpdateWorkOrder({ customerName: value }) }}>{workOrder.customerName}</Text>
                </Descriptions.Item>
                <Descriptions.Item label={<><PhoneOutlined /> Phone</>} labelStyle={{ width: '150px' }}>
                  <Text editable={{ onChange: (value) => handleUpdateWorkOrder({ customerPhone: value }) }}>{workOrder.customerPhone}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Vehicle ID" labelStyle={{ width: '150px' }}>
                  <Text editable={{ onChange: (value) => handleUpdateWorkOrder({ vehicleId: value }) }}>{workOrder.vehicleId}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Vehicle Model" labelStyle={{ width: '150px' }}>
                  <Text editable={{ onChange: (value) => handleUpdateWorkOrder({ vehicleModel: value }) }}>{workOrder.vehicleModel}</Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Space>
        </Col>
        <Col xs={24} lg={8}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card title="Details">
              <Descriptions column={1}>
                <Descriptions.Item label="Priority">
                  <Select
                    value={workOrder.priority || 'Low'}
                    onChange={(value) => handleUpdateWorkOrder({ priority: value })}
                    style={{ width: 100 }}
                    bordered={false}
                    size="small"
                  >
                    <Option value="High"><Tag color={priorityColors["High"]}>High</Tag></Option>
                    <Option value="Medium"><Tag color={priorityColors["Medium"]}>Medium</Tag></Option>
                    <Option value="Low"><Tag color={priorityColors["Low"]}>Low</Tag></Option>
                  </Select>
                </Descriptions.Item>
                <Descriptions.Item label={<><CalendarOutlined /> SLA Due</>}>
                  <DatePicker
                    showTime
                    value={workOrder.slaDue ? dayjs(workOrder.slaDue) : null}
                    onChange={(date) => handleUpdateWorkOrder({ slaDue: date ? date.toISOString() : null })}
                    bordered={false}
                    style={{ width: '100%' }}
                  />
                </Descriptions.Item>
                <Descriptions.Item label="Appointment Date">
                  <DatePicker
                    showTime
                    value={workOrder.appointmentDate ? dayjs(workOrder.appointmentDate) : null}
                    onChange={(date) => handleUpdateWorkOrder({ appointmentDate: date ? date.toISOString() : null })}
                    bordered={false}
                    style={{ width: '100%' }}
                  />
                </Descriptions.Item>
                <Descriptions.Item label={<><EnvironmentOutlined /> Service Location</>}>
                  <Select
                    value={workOrder.locationId}
                    onChange={(value) => handleUpdateWorkOrder({ locationId: value })}
                    style={{ width: '100%' }}
                    bordered={false}
                    allowClear
                    placeholder="Select location"
                  >
                    {(allLocations || []).map(l => <Option key={l.id} value={l.id}>{l.name}</Option>)}
                  </Select>
                </Descriptions.Item>
                <Descriptions.Item label="Client Location">
                  <GoogleLocationSearchInput
                    onLocationSelect={handleLocationSelect}
                    initialValue={workOrder.customerAddress || ''}
                  />
                </Descriptions.Item>
                <Descriptions.Item label={<><ToolOutlined /> Assigned To</>}>
                  <Select
                    value={workOrder.assignedTechnicianId}
                    onChange={(value) => handleUpdateWorkOrder({ assignedTechnicianId: value })}
                    style={{ width: '100%' }}
                    bordered={false}
                    allowClear
                    placeholder="Unassigned"
                  >
                    {(allTechnicians || []).map(t => (
                      <Option key={t.id} value={t.id}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Avatar size="small" src={t.avatar || undefined}>{t.name.split(' ').map(n => n[0]).join('')}</Avatar>
                          <Text>{t.name}</Text>
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Descriptions.Item>
              </Descriptions>
            </Card>
            <Card title="Location on Map" bodyStyle={{ padding: 0 }}>
              {API_KEY ? (mapUrl ? <img src={mapUrl} alt="Map of service and client locations" style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '8px' }} /> : <div style={{padding: '24px'}}><Text type="secondary">No location data to display.</Text></div>) : <div style={{padding: '24px'}}><Text type="secondary">Google Maps API Key not configured.</Text></div>}
            </Card>
            <Card title="Activity Log">
              <Timeline>
                {(workOrder.activityLog || []).map((item: { activity: string; timestamp: string }, index: number) => (
                  <Timeline.Item key={index}>
                    <Text strong>{item.activity}</Text><br/>
                    <Text type="secondary">{dayjs(item.timestamp).format('MMM D, YYYY h:mm A')}</Text>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>
          </Space>
        </Col>
      </Row>

      {onHoldWorkOrder && (
        <OnHoldReasonDialog
          isOpen={!!onHoldWorkOrder}
          onClose={() => setOnHoldWorkOrder(null)}
          onSave={handleSaveOnHoldReason}
        />
      )}
    </Space>
  );
};

export default WorkOrderDetailsPage;