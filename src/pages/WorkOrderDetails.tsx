import { useParams, useNavigate } from "react-router-dom";
import { Avatar, Button, Card, Col, Descriptions, Row, Space, Tag, Timeline, Typography, List, Skeleton, Select, DatePicker, Input, Popconfirm, Table, Tabs, theme } from "antd";
import { ArrowLeftOutlined, UserOutlined, EnvironmentOutlined, PhoneOutlined, CalendarOutlined, ToolOutlined, PlusOutlined, DeleteOutlined, InfoCircleOutlined, UnorderedListOutlined, CompassOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import NotFound from "./NotFound";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder, Technician, Location, Customer, Vehicle, WorkOrderPart } from "@/types/supabase";
import { useState } from "react";
import { showSuccess, showError, showInfo } from "@/utils/toast";
import { camelToSnakeCase } from "@/utils/data-helpers";
import { OnHoldReasonDialog } from "@/components/OnHoldReasonDialog";
import { GoogleLocationSearchInput } from "@/components/GoogleLocationSearchInput";
import { useSearchParams } from "react-router-dom";
import { AddPartToWorkOrderDialog } from "@/components/AddPartToWorkOrderDialog";
import PageHeader from "@/components/PageHeader";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { useToken } = theme;

const API_KEY = import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY || "";

interface WorkOrderDetailsProps {
  isDrawerMode?: boolean;
}

const WorkOrderDetailsPage = ({ isDrawerMode = false }: WorkOrderDetailsProps) => {
  const { id: paramId } = useParams<{ id:string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [onHoldWorkOrder, setOnHoldWorkOrder] = useState<WorkOrder | null>(null);
  const [isAddPartDialogOpen, setIsAddPartDialogOpen] = useState(false);
  const { token } = useToken();

  const statusColors: Record<string, string> = { 
    Open: token.colorInfo,
    "Confirmation": token.cyan6,
    "Ready": token.colorTextSecondary,
    "In Progress": token.colorWarning,
    "On Hold": token.orange6,
    Completed: token.colorSuccess
  };
  const priorityColors: Record<string, string> = { High: token.colorError, Medium: token.colorWarning, Low: token.colorSuccess };

  const id = isDrawerMode ? searchParams.get('view') : paramId;

  const { data: workOrder, isLoading: isLoadingWorkOrder } = useQuery<WorkOrder | null>({ queryKey: ['work_order', id], queryFn: async () => { if (!id) return null; const { data, error } = await supabase.from('work_orders').select('*').eq('id', id).single(); if (error) throw new Error(error.message); return data; }, enabled: !!id });
  const { data: technician, isLoading: isLoadingTechnician } = useQuery<Technician | null>({ queryKey: ['technician', workOrder?.assignedTechnicianId], queryFn: async () => { if (!workOrder?.assignedTechnicianId) return null; const { data, error } = await supabase.from('technicians').select('*').eq('id', workOrder.assignedTechnicianId).single(); if (error) throw new Error(error.message); return data; }, enabled: !!workOrder?.assignedTechnicianId });
  const { data: location, isLoading: isLoadingLocation } = useQuery<Location | null>({ queryKey: ['location', workOrder?.locationId], queryFn: async () => { if (!workOrder?.locationId) return null; const { data, error } = await supabase.from('locations').select('*').eq('id', workOrder.locationId).single(); if (error) throw new Error(error.message); return data; }, enabled: !!workOrder?.locationId });
  const { data: allTechnicians, isLoading: isLoadingAllTechnicians } = useQuery<Technician[]>({ queryKey: ['technicians'], queryFn: async () => { const { data, error } = await supabase.from('technicians').select('*'); if (error) throw new Error(error.message); return data || []; } });
  const { data: allLocations, isLoading: isLoadingAllLocations } = useQuery<Location[]>({ queryKey: ['locations'], queryFn: async () => { const { data, error } = await supabase.from('locations').select('*'); if (error) throw new Error(error.message); return data || []; } });
  const { data: customer, isLoading: isLoadingCustomer } = useQuery<Customer | null>({ queryKey: ['customer', workOrder?.customerId], queryFn: async () => { if (!workOrder?.customerId) return null; const { data, error } = await supabase.from('customers').select('*').eq('id', workOrder.customerId).single(); if (error) throw new Error(error.message); return data; }, enabled: !!workOrder?.customerId });
  const { data: vehicle, isLoading: isLoadingVehicle } = useQuery<Vehicle | null>({ queryKey: ['vehicle', workOrder?.vehicleId], queryFn: async () => { if (!workOrder?.vehicleId) return null; const { data, error } = await supabase.from('vehicles').select('*').eq('id', workOrder.vehicleId).single(); if (error) throw new Error(error.message); return data; }, enabled: !!workOrder?.vehicleId });
  const { data: usedParts, isLoading: isLoadingUsedParts } = useQuery<WorkOrderPart[]>({ queryKey: ['work_order_parts', id], queryFn: async () => { if (!id) return []; const { data, error } = await supabase.from('work_order_parts').select('*, inventory_items(*)').eq('work_order_id', id); if (error) throw new Error(error.message); return data || []; }, enabled: !!id });

  const workOrderMutation = useMutation({ mutationFn: async (workOrderData: Partial<WorkOrder>) => { const { error } = await supabase.from('work_orders').upsert([workOrderData]); if (error) throw new Error(error.message); }, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['work_order', id] }); queryClient.invalidateQueries({ queryKey: ['work_orders'] }); showSuccess('Work order has been updated.'); }, onError: (error) => showError(error.message) });
  const addPartMutation = useMutation({ mutationFn: async ({ itemId, quantity }: { itemId: string, quantity: number }) => { const { error } = await supabase.rpc('add_part_to_work_order', { p_work_order_id: id, p_item_id: itemId, p_quantity_used: quantity }); if (error) throw new Error(error.message); }, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['work_order_parts', id] }); queryClient.invalidateQueries({ queryKey: ['inventory_items'] }); showSuccess('Part added to work order.'); }, onError: (error) => showError(error.message) });
  const removePartMutation = useMutation({
    mutationFn: async (partId: string) => {
      const { error } = await supabase.from('work_order_parts').delete().eq('id', partId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work_order_parts', id] });
      queryClient.invalidateQueries({ queryKey: ['inventory_items'] }); // Invalidate inventory to reflect stock changes
      showSuccess('Part removed from work order.');
    },
    onError: (error) => showError(error.message),
  });

  const handleUpdateWorkOrder = (updates: Partial<WorkOrder>) => { if (!workOrder) return; if (updates.status === 'On Hold') { setOnHoldWorkOrder(workOrder); return; } if ((updates.assignedTechnicianId || updates.appointmentDate) && workOrder.status === 'Ready') { updates.status = 'In Progress'; showInfo(`Work Order ${workOrder.workOrderNumber} automatically moved to In Progress.`); } workOrderMutation.mutate(camelToSnakeCase({ id: workOrder.id, ...updates })); };
  const handleSaveOnHoldReason = (reason: string) => { if (!onHoldWorkOrder) return; const updates = { status: 'On Hold' as const, onHoldReason: reason }; workOrderMutation.mutate(camelToSnakeCase({ id: onHoldWorkOrder.id, ...updates })); setOnHoldWorkOrder(null); };
  const handleLocationSelect = (selectedLoc: { lat: number; lng: number; label: string }) => { handleUpdateWorkOrder({ customerAddress: selectedLoc.label, customerLat: selectedLoc.lat, customerLng: selectedLoc.lng }); };
  const handleAddPart = (itemId: string, quantity: number) => { addPartMutation.mutate({ itemId, quantity }); };
  const handleRemovePart = (partId: string) => { removePartMutation.mutate(partId); };

  const isLoading = isLoadingWorkOrder || isLoadingTechnician || isLoadingLocation || isLoadingAllTechnicians || isLoadingAllLocations || isLoadingCustomer || isLoadingVehicle || isLoadingUsedParts;

  if (isLoading) return <Skeleton active />;
  if (!workOrder) return isDrawerMode ? <div style={{ padding: 24 }}><NotFound /></div> : <NotFound />;

  const hasClientLocation = workOrder.customerLat != null && workOrder.customerLng != null;
  const getMapUrl = () => { if (!API_KEY) return ""; let markers = []; if (location) markers.push(`markers=color:blue%7Clabel:S%7C${location.lat},${location.lng}`); if (hasClientLocation) markers.push(`markers=color:orange%7Clabel:C%7C${workOrder.customerLat},${workOrder.customerLng}`); if (markers.length === 0) return ""; return `https://maps.googleapis.com/maps/api/staticmap?size=600x300&maptype=roadmap&${markers.join('&')}&key=${API_KEY}`; };
  const mapUrl = getMapUrl();

  const partsColumns = [
    { title: 'Part', dataIndex: ['inventory_items', 'name'], render: (name: string, record: WorkOrderPart) => `${name} (${record.inventory_items.sku})` },
    { title: 'Qty', dataIndex: 'quantity_used' },
    { title: 'Unit Price', dataIndex: 'price_at_time_of_use', render: (price: number) => `UGX ${price.toLocaleString('en-US')}` },
    { title: 'Total', render: (_: any, record: WorkOrderPart) => `UGX ${(record.quantity_used * record.price_at_time_of_use).toLocaleString('en-US')}` },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: WorkOrderPart) => (
        <Popconfirm
          title="Are you sure to delete this part?"
          onConfirm={() => handleRemovePart(record.id)}
          okText="Yes"
          cancelText="No"
        >
          <Button type="text" danger icon={<DeleteOutlined />} size="small" />
        </Popconfirm>
      ),
    },
  ];
  const partsTotal = (usedParts || []).reduce((sum, part) => sum + (part.quantity_used * part.price_at_time_of_use), 0);

  // --- Reusable Content Blocks ---
  const customerVehicleCard = (
    <Card title="Customer & Vehicle Details">
      <Descriptions column={1} bordered>
        <Descriptions.Item label="Customer" labelStyle={{ width: '150px' }}><Text>{customer?.name || 'N/A'}</Text></Descriptions.Item>
        <Descriptions.Item label={<><PhoneOutlined /> Phone</>} labelStyle={{ width: '150px' }}><Text>{customer?.phone || 'N/A'}</Text></Descriptions.Item>
        <Descriptions.Item label="Vehicle" labelStyle={{ width: '150px' }}><Text>{vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'N/A'}</Text></Descriptions.Item>
        <Descriptions.Item label="VIN" labelStyle={{ width: '150px' }}><Text code>{vehicle?.vin || 'N/A'}</Text></Descriptions.Item>
        <Descriptions.Item label="License Plate" labelStyle={{ width: '150px' }}><Text>{vehicle?.license_plate || 'N/A'}</Text></Descriptions.Item>
      </Descriptions>
    </Card>
  );

  const serviceInfoCard = (
    <Card title="Service Information">
      <Title level={5} editable={{ onChange: (value) => handleUpdateWorkOrder({ service: value }) }}>{workOrder.service}</Title>
      <Paragraph editable={{ onChange: (value) => handleUpdateWorkOrder({ serviceNotes: value }) }} type="secondary">{workOrder.serviceNotes}</Paragraph>
    </Card>
  );

  const assignmentScheduleCard = (
    <Card title="Assignment & Schedule">
      <Descriptions column={1}>
        <Descriptions.Item label="Priority"><Select value={workOrder.priority || 'Low'} onChange={(value) => handleUpdateWorkOrder({ priority: value })} style={{ width: 100 }} bordered={false} size="small" suffixIcon={null}><Option value="High"><Tag color={priorityColors["High"]}>High</Tag></Option><Option value="Medium"><Tag color={priorityColors["Medium"]}>Medium</Tag></Option><Option value="Low"><Tag color={priorityColors["Low"]}>Low</Tag></Option></Select></Descriptions.Item>
        <Descriptions.Item label={<><CalendarOutlined /> SLA Due</>}><DatePicker showTime value={workOrder.slaDue ? dayjs(workOrder.slaDue) : null} onChange={(date) => handleUpdateWorkOrder({ slaDue: date ? date.toISOString() : null })} bordered={false} style={{ width: '100%' }} /></Descriptions.Item>
        <Descriptions.Item label="Appointment Date"><DatePicker showTime value={workOrder.appointmentDate ? dayjs(workOrder.appointmentDate) : null} onChange={(date) => handleUpdateWorkOrder({ appointmentDate: date ? date.toISOString() : null })} bordered={false} style={{ width: '100%' }} /></Descriptions.Item>
        <Descriptions.Item label={<><ToolOutlined /> Assigned To</>}><Select value={workOrder.assignedTechnicianId} onChange={(value) => handleUpdateWorkOrder({ assignedTechnicianId: value })} style={{ width: '100%' }} bordered={false} allowClear placeholder="Unassigned" suffixIcon={null}>{(allTechnicians || []).map(t => (<Option key={t.id} value={t.id}><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Avatar size="small" src={t.avatar || undefined}>{t.name.split(' ').map(n => n[0]).join('')}</Avatar><Text>{t.name}</Text></div></Option>))}</Select></Descriptions.Item>
      </Descriptions>
    </Card>
  );

  const partsCard = (
    <Card title="Parts & Materials" extra={<Button icon={<PlusOutlined />} onClick={() => setIsAddPartDialogOpen(true)}>Add Part</Button>}>
      <Table columns={partsColumns} dataSource={usedParts} rowKey="id" pagination={false} size="small" summary={() => <Table.Summary.Row><Table.Summary.Cell index={0} colSpan={3}><Text strong>Total Parts Cost</Text></Table.Summary.Cell><Table.Summary.Cell index={1}><Text strong>UGX {partsTotal.toLocaleString('en-US')}</Text></Table.Summary.Cell></Table.Summary.Row>} />
    </Card>
  );

  const activityLogCard = (
    <Card title="Activity Log"><Timeline>{(workOrder.activityLog || []).map((item: { activity: string; timestamp: string }, index: number) => (<Timeline.Item key={index}><Text strong>{item.activity}</Text><br/><Text type="secondary">{dayjs(item.timestamp).format('MMM D, YYYY h:mm A')}</Text></Timeline.Item>))}</Timeline></Card>
  );

  const locationAndMapCard = (
    <Card title="Location Details">
      <Descriptions column={1}>
        <Descriptions.Item label={<><EnvironmentOutlined /> Service Location</>}><Select value={workOrder.locationId} onChange={(value) => handleUpdateWorkOrder({ locationId: value })} style={{ width: '100%' }} bordered={false} allowClear placeholder="Select location" suffixIcon={null}>{(allLocations || []).map(l => <Option key={l.id} value={l.id}>{l.name.replace(' Service Center', '')}</Option>)}</Select></Descriptions.Item>
        <Descriptions.Item label="Client Location"><GoogleLocationSearchInput onLocationSelect={handleLocationSelect} initialValue={workOrder.customerAddress || ''} /></Descriptions.Item>
      </Descriptions>
      <div style={{ marginTop: 16, borderRadius: token.borderRadius, overflow: 'hidden' }}>
        {API_KEY ? (mapUrl ? <img src={mapUrl} alt="Map of service and client locations" style={{ width: '100%', height: 'auto', display: 'block' }} /> : <div style={{padding: '24px', textAlign: 'center'}}><Text type="secondary">No location data to display.</Text></div>) : <div style={{padding: '24px', textAlign: 'center'}}><Text type="secondary">Google Maps API Key not configured.</Text></div>}
      </div>
    </Card>
  );

  // --- Main Render Logic ---
  return (
    <>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {!isDrawerMode && (
          <PageHeader
            title={
              <Space align="center">
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/work-orders')}>
                  Back to Work Orders
                </Button>
                <Title level={4} style={{ margin: 0 }}>
                  Work Order: {workOrder.workOrderNumber}
                </Title>
              </Space>
            }
            hideSearch
            actions={
              <Select
                value={workOrder.status || 'Open'}
                onChange={(value) => handleUpdateWorkOrder({ status: value })}
                style={{ width: 180 }}
              >
                <Option value="Open"><Tag color={statusColors["Open"]}>Open</Tag></Option>
                <Option value="Confirmation"><Tag color={statusColors["Confirmation"]}>Confirmation</Tag></Option>
                <Option value="Ready"><Tag color={statusColors["Ready"]}>Ready</Tag></Option>
                <Option value="In Progress"><Tag color={statusColors["In Progress"]}>In Progress</Tag></Option>
                <Option value="On Hold"><Tag color={statusColors["On Hold"]}>On Hold</Tag></Option>
                <Option value="Completed"><Tag color={statusColors["Completed"]}>Completed</Tag></Option>
              </Select>
            }
          />
        )}

        {isDrawerMode ? (
          <Tabs defaultActiveKey="1">
            <TabPane tab={<span><InfoCircleOutlined /> Overview</span>} key="1">
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {serviceInfoCard}
                {assignmentScheduleCard}
                {customerVehicleCard}
              </Space>
            </TabPane>
            <TabPane tab={<span><UnorderedListOutlined /> Parts & Log</span>} key="2">
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {partsCard}
                {activityLogCard}
              </Space>
            </TabPane>
            <TabPane tab={<span><CompassOutlined /> Location</span>} key="3">
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {locationAndMapCard}
              </Space>
            </TabPane>
          </Tabs>
        ) : (
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={16}>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {serviceInfoCard}
                {partsCard}
                {activityLogCard}
              </Space>
            </Col>
            <Col xs={24} lg={8}>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {assignmentScheduleCard}
                {customerVehicleCard}
                {locationAndMapCard}
              </Space>
            </Col>
          </Row>
        )}
      </Space>
      {onHoldWorkOrder && <OnHoldReasonDialog isOpen={!!onHoldWorkOrder} onClose={() => setOnHoldWorkOrder(null)} onSave={handleSaveOnHoldReason} />}
      {isAddPartDialogOpen && <AddPartToWorkOrderDialog isOpen={isAddPartDialogOpen} onClose={() => setIsAddPartDialogOpen(false)} onSave={handleAddPart} />}
    </>
  );
};

export default WorkOrderDetailsPage;