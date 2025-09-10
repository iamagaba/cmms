import { useParams, useNavigate } from "react-router-dom";
import { Avatar, Button, Card, Col, Descriptions, Row, Space, Tag, Timeline, Typography, List, Skeleton, Select, DatePicker, Input, Popconfirm, Table, Tabs, theme, Empty } from "antd";
import { ArrowLeftOutlined, UserOutlined, EnvironmentOutlined, PhoneOutlined, CalendarOutlined, ToolOutlined, PlusOutlined, DeleteOutlined, InfoCircleOutlined, UnorderedListOutlined, CompassOutlined, MailOutlined } from "@ant-design/icons"; // Import MailOutlined
import dayjs from "dayjs";
import NotFound from "./NotFound";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder, Technician, Location, Customer, Vehicle, WorkOrderPart, ServiceCategory, SlaPolicy } from "@/types/supabase";
import { useState } from "react";
import { showSuccess, showError, showInfo } from "@/utils/toast";
import { camelToSnakeCase } from "@/utils/data-helpers";
import { OnHoldReasonDialog } from "@/components/OnHoldReasonDialog";
import { GoogleLocationSearchInput } from "@/components/GoogleLocationSearchInput";
import { useSearchParams } from "react-router-dom";
import { AddPartToWorkOrderDialog } from "@/components/AddPartToWorkOrderDialog";
import PageHeader from "@/components/PageHeader";
import WorkOrderProgressTracker from "@/components/WorkOrderProgressTracker";
import SlaStatusCard from "@/components/SlaStatusCard"; // Import the new SLA Status Card

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { useToken } = theme;

const API_KEY = import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY || "";
const channelOptions = ['Call Center', 'Service Center', 'Social Media', 'Staff', 'Swap Station'];

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

  const { data: workOrder, isLoading: isLoadingWorkOrder } = useQuery<WorkOrder | null>({ 
    queryKey: ['work_order', id], 
    queryFn: async () => { 
      if (!id) return null; 
      console.log('Fetching work order details for ID:', id);
      const { data, error } = await supabase.from('work_orders').select('*').eq('id', id).single(); 
      if (error) throw new Error(error.message); 
      console.log('Raw fetched work order data from Supabase:', data); // Log raw data
      if (data) {
        // Manually map snake_case to camelCase for consistency with WorkOrder type
        const mappedData: WorkOrder = {
          ...data,
          workOrderNumber: data.work_order_number,
          assignedTechnicianId: data.assigned_technician_id,
          locationId: data.location_id,
          serviceNotes: data.service_notes,
          partsUsed: data.parts_used,
          activityLog: data.activity_log,
          slaDue: data.sla_due, // Map sla_due to slaDue
          completedAt: data.completed_at,
          customerLat: data.customer_lat,
          customerLng: data.customer_lng,
          customerAddress: data.customer_address,
          onHoldReason: data.on_hold_reason,
          appointmentDate: data.appointment_date,
          customerId: data.customer_id,
          vehicleId: data.vehicle_id,
          created_by: data.created_by, // Ensure created_by is also mapped if it's snake_case in DB
          service_category_id: data.service_category_id,
          confirmed_at: data.confirmed_at,
          work_started_at: data.work_started_at,
          sla_timers_paused_at: data.sla_timers_paused_at,
          total_paused_duration_seconds: data.total_paused_duration_seconds,
        };
        console.log('Mapped work order data (camelCase):', mappedData);
        return mappedData;
      }
      return null;
    }, 
    enabled: !!id 
  });
  const { data: technician, isLoading: isLoadingTechnician } = useQuery<Technician | null>({ queryKey: ['technician', workOrder?.assignedTechnicianId], queryFn: async () => { if (!workOrder?.assignedTechnicianId) return null; const { data, error } = await supabase.from('technicians').select('*').eq('id', workOrder.assignedTechnicianId).single(); if (error) throw new Error(error.message); return data; }, enabled: !!workOrder?.assignedTechnicianId });
  const { data: location, isLoading: isLoadingLocation } = useQuery<Location | null>({ queryKey: ['location', workOrder?.locationId], queryFn: async () => { if (!workOrder?.locationId) return null; const { data, error } = await supabase.from('locations').select('*').eq('id', workOrder.locationId).single(); if (error) throw new Error(error.message); return data; }, enabled: !!workOrder?.locationId });
  const { data: allTechnicians, isLoading: isLoadingAllTechnicians } = useQuery<Technician[]>({ queryKey: ['technicians'], queryFn: async () => { const { data, error } = await supabase.from('technicians').select('*'); if (error) throw new Error(error.message); return data || []; } });
  const { data: allLocations, isLoading: isLoadingAllLocations } = useQuery<Location[]>({ queryKey: ['locations'], queryFn: async () => { const { data, error } = await supabase.from('locations').select('*'); if (error) throw new Error(error.message); return data || []; } });
  const { data: customer, isLoading: isLoadingCustomer } = useQuery<Customer | null>({ queryKey: ['customer', workOrder?.customerId], queryFn: async () => { if (!workOrder?.customerId) return null; const { data, error } = await supabase.from('customers').select('*').eq('id', workOrder.customerId).single(); if (error) throw new Error(error.message); return data; }, enabled: !!workOrder?.customerId });
  const { data: vehicle, isLoading: isLoadingVehicle } = useQuery<Vehicle | null>({ queryKey: ['vehicle', workOrder?.vehicleId], queryFn: async () => { if (!workOrder?.vehicleId) return null; const { data, error } = await supabase.from('vehicles').select('*').eq('id', workOrder.vehicleId).single(); if (error) throw new Error(error.message); return data; }, enabled: !!workOrder?.vehicleId });
  const { data: usedParts, isLoading: isLoadingUsedParts } = useQuery<WorkOrderPart[]>({ queryKey: ['work_order_parts', id], queryFn: async () => { if (!id) return []; const { data, error } = await supabase.from('work_order_parts').select('*, inventory_items(*)').eq('work_order_id', id); if (error) throw new Error(error.message); return data || []; }, enabled: !!id });
  const { data: serviceCategories, isLoading: isLoadingServiceCategories } = useQuery<ServiceCategory[]>({ queryKey: ['service_categories'], queryFn: async () => { const { data, error } = await supabase.from('service_categories').select('*'); if (error) throw new Error(error.message); return data || []; } });
  const { data: slaPolicies, isLoading: isLoadingSlaPolicies } = useQuery<SlaPolicy[]>({ queryKey: ['sla_policies'], queryFn: async () => { const { data, error } = await supabase.from('sla_policies').select('*'); if (error) throw new Error(error.message); return data || []; } });

  const workOrderMutation = useMutation({ 
    mutationFn: async (workOrderData: Partial<WorkOrder>) => { 
      const { error } = await supabase.from('work_orders').upsert([workOrderData]); 
      if (error) throw new Error(error.message); 
    }, 
    onSuccess: (_, variables) => { // Get the variables passed to mutate
      const updatedId = variables.id; // Assuming id is always present in updates
      if (updatedId) {
        queryClient.refetchQueries({ queryKey: ['work_order', updatedId] }); // Refetch specific work order
      }
      queryClient.invalidateQueries({ queryKey: ['work_orders'] }); // Invalidate all work orders for lists
      showSuccess('Work order has been updated.'); 
    }, 
    onError: (error) => showError(error.message) 
  });
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

  const handleUpdateWorkOrder = (updates: Partial<WorkOrder>) => { 
    if (!workOrder) return; 

    const oldWorkOrder = { ...workOrder };
    const newActivityLog = [...(workOrder.activityLog || [])];
    let activityMessage = '';

    // --- Timestamp & SLA Automation ---
    const oldStatus = oldWorkOrder.status;
    const newStatus = updates.status;

    if (newStatus && newStatus !== oldStatus) {
      activityMessage = `Status changed from '${oldStatus || 'N/A'}' to '${newStatus}'.`;
      if (newStatus === 'Confirmation' && !oldWorkOrder.confirmed_at) updates.confirmed_at = new Date().toISOString();
      if (newStatus === 'In Progress' && !oldWorkOrder.work_started_at) updates.work_started_at = new Date().toISOString();
      if (newStatus === 'On Hold' && oldStatus !== 'On Hold') updates.sla_timers_paused_at = new Date().toISOString();
      if (oldStatus === 'On Hold' && newStatus !== 'On Hold' && oldWorkOrder.sla_timers_paused_at) {
        const pausedAt = dayjs(oldWorkOrder.sla_timers_paused_at);
        const resumedAt = dayjs();
        const durationPaused = resumedAt.diff(pausedAt, 'second');
        updates.total_paused_duration_seconds = (oldWorkOrder.total_paused_duration_seconds || 0) + durationPaused;
        updates.sla_timers_paused_at = null;
        activityMessage += ` (SLA timers resumed after ${durationPaused}s pause).`;
      }
    }

    if (updates.service_category_id && updates.service_category_id !== oldWorkOrder.service_category_id) {
      const policy = slaPolicies?.find(p => p.service_category_id === updates.service_category_id);
      const category = serviceCategories?.find(c => c.id === updates.service_category_id);
      if (policy && policy.resolution_hours) {
        const createdAt = dayjs(oldWorkOrder.createdAt);
        const totalPausedSeconds = updates.total_paused_duration_seconds || oldWorkOrder.total_paused_duration_seconds || 0;
        const newSlaDue = createdAt.add(policy.resolution_hours, 'hours').add(totalPausedSeconds, 'seconds').toISOString();
        updates.slaDue = newSlaDue;
        activityMessage += ` Service category set to '${category?.name}'. Resolution SLA updated.`;
      }
    }
    // --- End Automation ---

    if (activityMessage) {
      newActivityLog.push({ timestamp: new Date().toISOString(), activity: activityMessage });
      updates.activityLog = newActivityLog;
    }

    if (updates.status === 'On Hold') { 
      setOnHoldWorkOrder(workOrder); 
      return; 
    } 
    
    workOrderMutation.mutate(camelToSnakeCase({ id: workOrder.id, ...updates })); 
  };
  const handleSaveOnHoldReason = (reason: string) => { if (!onHoldWorkOrder) return; const updates = { status: 'On Hold' as const, onHoldReason: reason }; workOrderMutation.mutate(camelToSnakeCase({ id: onHoldWorkOrder.id, ...updates })); setOnHoldWorkOrder(null); };
  const handleLocationSelect = (selectedLoc: { lat: number; lng: number; label: string }) => { handleUpdateWorkOrder({ customerAddress: selectedLoc.label, customerLat: selectedLoc.lat, customerLng: selectedLoc.lng }); };
  const handleAddPart = (itemId: string, quantity: number) => { addPartMutation.mutate({ itemId, quantity }); };
  const handleRemovePart = (partId: string) => { removePartMutation.mutate(partId); };

  const isLoading = isLoadingWorkOrder || isLoadingTechnician || isLoadingLocation || isLoadingAllTechnicians || isLoadingAllLocations || isLoadingCustomer || isLoadingVehicle || isLoadingUsedParts || isLoadingServiceCategories || isLoadingSlaPolicies;

  if (isLoading) return <Skeleton active />;
  if (!workOrder) return isDrawerMode ? <div style={{ padding: 24 }}><NotFound /></div> : <NotFound />;

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

  const currentSlaPolicy = slaPolicies?.find(p => p.service_category_id === workOrder.service_category_id) || null;

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
      <Descriptions column={1} bordered style={{ marginTop: 16 }}>
        <Descriptions.Item label="Service Category" labelStyle={{ width: '150px' }}>
          <Select
            value={workOrder.service_category_id}
            onChange={(value) => handleUpdateWorkOrder({ service_category_id: value })}
            style={{ width: '100%' }}
            bordered={false}
            allowClear
            placeholder="Select category"
            suffixIcon={null}
          >
            {(serviceCategories || []).map(sc => <Option key={sc.id} value={sc.id}>{sc.name}</Option>)}
          </Select>
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );

  const workOrderDetailsCard = ( // Renamed from assignmentScheduleCard
    <Card title="Work Order Details">
      <Descriptions column={1}>
        <Descriptions.Item label="Status">
          <Select
            value={workOrder.status || 'Open'}
            onChange={(value) => handleUpdateWorkOrder({ status: value })}
            style={{ width: 180 }}
            bordered={false}
            size="small"
            suffixIcon={null}
          >
            <Option value="Open"><Tag color={statusColors["Open"]}>Open</Tag></Option>
            <Option value="Confirmation"><Tag color={statusColors["Confirmation"]}>Confirmation</Tag></Option>
            <Option value="Ready"><Tag color={statusColors["Ready"]}>Ready</Tag></Option>
            <Option value="In Progress"><Tag color={statusColors["In Progress"]}>In Progress</Tag></Option>
            <Option value="On Hold"><Tag color={statusColors["On Hold"]}>On Hold</Tag></Option>
            <Option value="Completed"><Tag color={statusColors["Completed"]}>Completed</Tag></Option>
          </Select>
        </Descriptions.Item>
        <Descriptions.Item label="Priority"><Select value={workOrder.priority || 'Low'} onChange={(value) => handleUpdateWorkOrder({ priority: value })} style={{ width: 100 }} bordered={false} size="small" suffixIcon={null}><Option value="High"><Tag color={priorityColors["High"]}>High</Tag></Option><Option value="Medium"><Tag color={priorityColors["Medium"]}>Medium</Tag></Option><Option value="Low"><Tag color={priorityColors["Low"]}>Low</Tag></Option></Select></Descriptions.Item>
        <Descriptions.Item label="Channel">
          <Select
            value={workOrder.channel}
            onChange={(value) => handleUpdateWorkOrder({ channel: value })}
            style={{ width: '100%' }}
            bordered={false}
            allowClear
            placeholder="Select channel"
            suffixIcon={null}
          >
            {channelOptions.map(c => <Option key={c} value={c}>{c}</Option>)}
          </Select>
        </Descriptions.Item>
        <Descriptions.Item label={<><CalendarOutlined /> SLA Due</>}><DatePicker showTime value={workOrder.slaDue ? dayjs(workOrder.slaDue) : null} onChange={(date) => { console.log("DatePicker onChange - new SLA date:", date ? date.toISOString() : null); handleUpdateWorkOrder({ slaDue: date ? date.toISOString() : null }); }} bordered={false} style={{ width: '100%' }} /></Descriptions.Item>
        <Descriptions.Item label="Appointment Date"><DatePicker showTime value={workOrder.appointmentDate ? dayjs(workOrder.appointmentDate) : null} onChange={(date) => handleUpdateWorkOrder({ appointmentDate: date ? date.toISOString() : null })} bordered={false} style={{ width: '100%' }} /></Descriptions.Item>
        <Descriptions.Item label={<><ToolOutlined /> Assigned To</>}><Select value={workOrder.assignedTechnicianId} onChange={(value) => handleUpdateWorkOrder({ assignedTechnicianId: value })} style={{ width: '100%' }} bordered={false} allowClear placeholder="Unassigned" suffixIcon={null}>{(allTechnicians || []).map(t => (<Option key={t.id} value={t.id}><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Avatar size="small" src={t.avatar || undefined}>{t.name.split(' ').map(n => n[0]).join('')}</Avatar><Text>{t.name}</Text></div></Option>))}</Select></Descriptions.Item>
        {technician && (
          <Descriptions.Item label={<><PhoneOutlined /> Tech Phone</>}><a href={`tel:${technician.phone}`}>{technician.phone || 'N/A'}</a></Descriptions.Item>
        )}
      </Descriptions>
    </Card>
  );

  const partsCard = (
    <Card title="Parts & Materials" extra={<Button icon={<PlusOutlined />} onClick={() => setIsAddPartDialogOpen(true)}>Add Part</Button>}>
      <Table columns={partsColumns} dataSource={usedParts} rowKey="id" pagination={false} size="small" summary={() => <Table.Summary.Row><Table.Summary.Cell index={0} colSpan={3}><Text strong>Total Parts Cost</Text></Table.Summary.Cell><Table.Summary.Cell index={1}><Text strong>UGX {(partsTotal || 0).toLocaleString('en-US')}</Text></Table.Summary.Cell></Table.Summary.Row>} />
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
        {API_KEY ? (mapUrl ? <img src={mapUrl} alt="Map of service and client locations" style={{ width: '100%', height: 'auto', display: 'block' }} /> : <div style={{padding: '24px', textAlign: 'center'}}><Empty description="No location data to display." /></div>) : <div style={{padding: '24px', textAlign: 'center'}}><Empty description="Google Maps API Key not configured." /></div>}
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
            // Removed status dropdown from PageHeader
          />
        )}

        {isDrawerMode ? (
          <>
            <div style={{ marginBottom: 16 }}>
              <WorkOrderProgressTracker workOrder={workOrder} />
            </div>
            <Tabs defaultActiveKey="1">
              <TabPane tab={<span><InfoCircleOutlined /> Overview</span>} key="1">
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  {workOrder.service_category_id && <SlaStatusCard workOrder={workOrder} slaPolicy={currentSlaPolicy} />}
                  {serviceInfoCard}
                  {workOrderDetailsCard}
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
          </>
        ) : (
          <>
            <Card>
              <WorkOrderProgressTracker workOrder={workOrder} />
            </Card>
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={16}>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  {workOrder.service_category_id && <SlaStatusCard workOrder={workOrder} slaPolicy={currentSlaPolicy} />}
                  {serviceInfoCard}
                  {partsCard}
                  {activityLogCard}
                </Space>
              </Col>
              <Col xs={24} lg={8}>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  {workOrderDetailsCard}
                  {customerVehicleCard}
                  {locationAndMapCard}
                </Space>
              </Col>
            </Row>
          </>
        )}
      </Space>
      {onHoldWorkOrder && <OnHoldReasonDialog isOpen={!!onHoldWorkOrder} onClose={() => setOnHoldWorkOrder(null)} onSave={handleSaveOnHoldReason} />}
      {isAddPartDialogOpen && <AddPartToWorkOrderDialog isOpen={isAddPartDialogOpen} onClose={() => setIsAddPartDialogOpen(false)} onSave={handleAddPart} />}
    </>
  );
};

export default WorkOrderDetailsPage;