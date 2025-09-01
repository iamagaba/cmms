import { useParams, useNavigate, Link } from "react-router-dom";
import { workOrders, technicians, locations } from "@/data/mockData";
import { Avatar, Button, Card, Col, Descriptions, Row, Space, Tag, Timeline, Typography, List } from "antd";
import { ArrowLeftOutlined, UserOutlined, EnvironmentOutlined, PhoneOutlined, CalendarOutlined, ToolOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import NotFound from "./NotFound";
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { renderToString } from 'react-dom/server';
import L from 'leaflet';

const { Title, Text, Paragraph } = Typography;

const statusColors: Record<string, string> = { Open: "blue", "In Progress": "gold", "On Hold": "orange", Completed: "green" };
const priorityColors: Record<string, string> = { High: "red", Medium: "gold", Low: "green" };

const locationIcon = L.divIcon({
  html: renderToString(<EnvironmentOutlined style={{ fontSize: '32px', color: '#1677ff' }} />),
  className: 'custom-leaflet-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const WorkOrderDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const workOrder = workOrders.find(wo => wo.id === id);

  if (!workOrder) {
    return <NotFound />;
  }

  const technician = technicians.find(t => t.id === workOrder.assignedTechnicianId);
  const location = locations.find(l => l.id === workOrder.locationId);

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/work-orders')}>
          Back to Work Orders
        </Button>
        <Space>
          <Title level={4} style={{ margin: 0 }}>Work Order: {workOrder.id}</Title>
          <Tag color={statusColors[workOrder.status]}>{workOrder.status}</Tag>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card title="Service Information">
              <Title level={5}>{workOrder.service}</Title>
              <Paragraph type="secondary">{workOrder.serviceNotes}</Paragraph>
              {workOrder.partsUsed.length > 0 && (
                <>
                  <Text strong>Parts Used</Text>
                  <List
                    size="small"
                    dataSource={workOrder.partsUsed}
                    renderItem={item => (
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
                <Descriptions.Item label="Priority"><Tag color={priorityColors[workOrder.priority]}>{workOrder.priority}</Tag></Descriptions.Item>
                <Descriptions.Item label={<><CalendarOutlined /> SLA Due</>}>{dayjs(workOrder.slaDue).format('MMM D, YYYY h:mm A')}</Descriptions.Item>
                <Descriptions.Item label={<><EnvironmentOutlined /> Location</>}>{location?.name || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label={<><ToolOutlined /> Assigned To</>}>
                  {technician ? (
                    <Link to={`/technicians/${technician.id}`}>
                      <Avatar size="small" src={technician.avatar} icon={<UserOutlined />} style={{ marginRight: 8 }} />
                      {technician.name}
                    </Link>
                  ) : (
                    <Text type="secondary">Unassigned</Text>
                  )}
                </Descriptions.Item>
              </Descriptions>
            </Card>
            <Card title="Location on Map">
              {location ? (
                <MapContainer center={[location.lat, location.lng]} zoom={15} style={{ height: '250px', width: '100%', borderRadius: '8px' }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker position={[location.lat, location.lng]} icon={locationIcon} />
                </MapContainer>
              ) : (
                <Text type="secondary">Location data not available.</Text>
              )}
            </Card>
            <Card title="Activity Log">
              <Timeline>
                {workOrder.activityLog.map((item, index) => (
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