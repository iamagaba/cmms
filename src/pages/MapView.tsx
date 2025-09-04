import React from 'react';
import { GoogleMap, MarkerF, InfoWindowF } from '@react-google-maps/api';
import { locations, technicians, workOrders } from '@/data/mockData';
import { Typography, Tag, List, Card, Avatar } from 'antd';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '8px',
};

const center = {
  lat: 0.32,
  lng: 32.58
};

const statusColorMap: Record<string, string> = {
  available: 'success',
  busy: 'warning',
  offline: 'default',
};

const MapViewPage = () => {
  const [selected, setSelected] = React.useState<{ type: 'location' | 'technician', data: any } | null>(null);

  const technicianIcon = (status: 'available' | 'busy' | 'offline') => {
    const color = status === 'available' ? '#52c41a' : status === 'busy' ? '#faad14' : '#bfbfbf';
    return {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 8,
      fillColor: color,
      fillOpacity: 1,
      strokeWeight: 2,
      strokeColor: 'white',
    };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 112px)' }}>
      <Title level={4} style={{ marginBottom: '24px', flexShrink: 0 }}>Live Operations Map</Title>
      <div style={{ flexGrow: 1, width: '100%' }}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={12}
          options={{
            disableDefaultUI: true,
            zoomControl: true,
          }}
        >
          {locations.map(location => (
            <MarkerF
              key={location.id}
              position={{ lat: location.lat, lng: location.lng }}
              onClick={() => setSelected({ type: 'location', data: location })}
            />
          ))}
          {technicians.map(tech => (
            <MarkerF
              key={tech.id}
              position={{ lat: tech.lat, lng: tech.lng }}
              icon={technicianIcon(tech.status)}
              onClick={() => setSelected({ type: 'technician', data: tech })}
            />
          ))}

          {selected && (
            <InfoWindowF
              position={{ lat: selected.data.lat, lng: selected.data.lng }}
              onCloseClick={() => setSelected(null)}
            >
              <Card bodyStyle={{ padding: 0, width: 250 }} bordered={false}>
                {selected.type === 'location' && (() => {
                  const openWorkOrders = workOrders.filter(wo => wo.locationId === selected.data.id && wo.status !== 'Completed');
                  return (
                    <>
                      <Title level={5}>{selected.data.name}</Title>
                      <Text type="secondary">{selected.data.address}</Text>
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
                    </>
                  );
                })()}
                {selected.type === 'technician' && (
                  <>
                    <Avatar src={selected.data.avatar} style={{ marginRight: 8 }}>{selected.data.name.split(' ').map((n:string) => n[0]).join('')}</Avatar>
                    <Title level={5} style={{ display: 'inline' }}>{selected.data.name}</Title>
                    <div>
                      <Tag color={statusColorMap[selected.data.status]}>{selected.data.status}</Tag>
                      <Text type="secondary">{selected.data.specialization}</Text>
                    </div>
                  </>
                )}
              </Card>
            </InfoWindowF>
          )}
        </GoogleMap>
      </div>
    </div>
  );
};

export default MapViewPage;