import { useParams, useNavigate, Link } from "react-router-dom";
import { workOrders, technicians, locations } from "@/data/mockData";
import { Avatar, Button, Card, Col, Descriptions, Row, Space, Tag, Timeline, Typography, List } from "antd";
import { ArrowLeftOutlined, UserOutlined, EnvironmentOutlined, PhoneOutlined, CalendarOutlined, ToolOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import NotFound from "./NotFound";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { locationIcon, clientIcon } from "@/components/MapIcons";
import L from 'leaflet';

const { Title, Text, Paragraph } = Typography;

const statusColors: Record<string, string> = { Open: "blue", "In Progress": "gold", "On Hold": "orange", Completed: "green" };
const priorityColors: Record<string, string> = { High: "red", Medium: "gold", Low: "green" };

const WorkOrderDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const workOrder = workOrders.find(wo => wo.id === id);

  if (!workOrder) {
    return <NotFound />;
  }

  const technician = technicians.find(t => t.id === workOrder.assignedTechnicianId);
  const location = locations.find(l => l.id === workOrder.locationId);
  const hasClientLocation = workOrder.customerLat != null && workOrder.customerLng != null;

  const mapCenter: [number, number] = hasClientLocation 
    ? [workOrder.customerLat!, workOrder.customerLng!] 
    : (location ? [location.lat, location.lng] : [0.32, 32.58]);
  
  const mapBounds = () => {
    if (location && hasClientLocation) {
      const bounds = L.latLngBounds([
        [location.lat, location.lng],
        [workOrder.customerLat!, workOrder.customerLng!]
      ]);
      return bounds.pad(0.1); // Add some padding
    }
    return undefined;
  }

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
                <Descriptions.Item label={<><EnvironmentOutlined /> Service Location</>}>{location?.name || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Client Location">
                  {workOrder.customerAddress ? (
                    <Text>{workOrder.customerAddress}</Text>
                  ) : hasClientLocation ? (
                    `${workOrder.customerLat?.toFixed(4)}, ${workOrder.customerLng?.toFixed(4)}`
                  ) : (
                    <Text type="secondary">Not Captured</Text>
                  )}
                </Descriptions.Item>
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
              <MapContainer center={mapCenter} zoom={15} bounds={mapBounds()} style={{ height: '250px', width: '100%', borderRadius: '8px' }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {location && <Marker position={[location.lat, location.lng]} icon={locationIcon}><Popup>Service Location: {location.name}</Popup></Marker>}
                {hasClientLocation && <Marker position={[workOrder.customerLat!, workOrder.customerLng!]} icon={clientIcon}><Popup>{workOrder.customerAddress || 'Client Location'}</Popup></Marker>}
              </MapContainer>
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