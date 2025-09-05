import { useParams, useNavigate, Link } from "react-router-dom";
import { Avatar, Button, Card, Col, Descriptions, Row, Space, Tag, Timeline, Typography, List, Skeleton } from "antd";
import { ArrowLeftOutlined, UserOutlined, EnvironmentOutlined, PhoneOutlined, CalendarOutlined, ToolOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import NotFound from "./NotFound";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder, Technician, Location } from "@/types/supabase";

const { Title, Text, Paragraph } = Typography;

const statusColors: Record<string, string> = { Open: "blue", "In Progress": "gold", "On Hold": "orange", Completed: "green" };
const priorityColors: Record<string, string> = { High: "red", Medium: "gold", Low: "green" };

const API_KEY = import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY || "";

const WorkOrderDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

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

  const isLoading = isLoadingWorkOrder || isLoadingTechnician || isLoadingLocation;

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
          <Tag color={statusColors[workOrder.status || '']}>{workOrder.status}</Tag>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card title="Service Information">
              <Title level={5}>{workOrder.service}</Title>
              <Paragraph type="secondary">{workOrder.serviceNotes}</Paragraph>
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
                <Descriptions.Item label="Customer">{workOrder.customerName}</Descriptions.Item>
                <Descriptions.Item label={<><PhoneOutlined /> Phone</>}><a href={`tel:${workOrder.customerPhone}`}>{workOrder.customerPhone}</a></Descriptions.Item>
                <Descriptions.Item label="Vehicle ID">{workOrder.vehicleId}</Descriptions.Item>
                <Descriptions.Item label="Vehicle Model">{workOrder.vehicleModel}</Descriptions.Item>
              </Descriptions>
            </Card>
          </Space>
        </Col>
        <Col xs={24} lg={8}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card title="Details">
              <Descriptions column={1}>
                <Descriptions.Item label="Priority"><Tag color={priorityColors[workOrder.priority || '']}>{workOrder.priority}</Tag></Descriptions.Item>
                <Descriptions.Item label={<><CalendarOutlined /> SLA Due</>}>{dayjs(workOrder.slaDue).format('MMM D, YY h:mm A')}</Descriptions.Item>
                <Descriptions.Item label={<><EnvironmentOutlined /> Service Location</>}>{location?.name || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Client Location">
                  {workOrder.customerAddress ? <Text>{workOrder.customerAddress}</Text> : hasClientLocation ? `${workOrder.customerLat?.toFixed(4)}, ${workOrder.customerLng?.toFixed(4)}` : <Text type="secondary">Not Captured</Text>}
                </Descriptions.Item>
                <Descriptions.Item label={<><ToolOutlined /> Assigned To</>}>
                  {technician ? (
                    <Link to={`/technicians/${technician.id}`}>
                      <Avatar size="small" src={technician.avatar || undefined} icon={<UserOutlined />} style={{ marginRight: 8 }} />
                      {technician.name}
                    </Link>
                  ) : <Text type="secondary">Unassigned</Text>}
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
    </Space>
  );
};

export default WorkOrderDetailsPage;