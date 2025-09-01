import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { locations, technicians, workOrders } from '@/data/mockData';
import { Typography, Tag, List } from 'antd';
import { renderToString } from 'react-dom/server';
import L from 'leaflet';
import { EnvironmentOutlined, ToolOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

// Create custom icons using Ant Design icons
const locationIcon = L.divIcon({
  html: renderToString(<EnvironmentOutlined style={{ fontSize: '32px', color: '#1677ff' }} />),
  className: 'custom-leaflet-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const technicianIcon = (status: 'available' | 'busy' | 'offline') => {
    const color = status === 'available' ? '#52c41a' : status === 'busy' ? '#faad14' : '#bfbfbf';
    return L.divIcon({
        html: renderToString(<ToolOutlined style={{ fontSize: '28px', color: 'white', background: color, borderRadius: '50%', padding: '4px' }} />),
        className: 'custom-leaflet-icon',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18]
    });
};

const MapViewPage = () => {
  const center: [number, number] = [0.32, 32.58]; // Centered on Kampala

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Title level={4} style={{ marginBottom: '24px', flexShrink: 0 }}>Live Operations Map</Title>
      <MapContainer center={center} zoom={12} style={{ flexGrow: 1, width: '100%', borderRadius: '8px' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Render Location Markers */}
        {locations.map(location => {
          const openWorkOrders = workOrders.filter(wo => wo.locationId === location.id && wo.status !== 'Completed');
          return (
            <Marker key={location.id} position={[location.lat, location.lng]} icon={locationIcon}>
              <Popup>
                <Title level={5}>{location.name}</Title>
                <Text type="secondary">{location.address}</Text>
                {openWorkOrders.length > 0 ? (
                  <List
                    size="small"
                    header={<Text strong>Open Work Orders</Text>}
                    dataSource={openWorkOrders}
                    renderItem={item => (
                      <List.Item>
                        <Link to={`/work-orders/${item.id}`}>{item.id}: {item.service}</Link>
                      </List.Item>
                    )}
                  />
                ) : <Text><br/>No open work orders.</Text>}
              </Popup>
            </Marker>
          );
        })}

        {/* Render Technician Markers */}
        {technicians.map(tech => (
          <Marker key={tech.id} position={[tech.lat, tech.lng]} icon={technicianIcon(tech.status)}>
            <Popup>
              <Title level={5}>{tech.name}</Title>
              <Tag color={tech.status === 'available' ? 'success' : tech.status === 'busy' ? 'warning' : 'default'}>
                {tech.status.charAt(0).toUpperCase() + tech.status.slice(1)}
              </Tag>
              <br/>
              <Text type="secondary">{tech.specialization}</Text>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapViewPage;