import React, { useState, useCallback, useRef } from 'react';
import { GoogleMap, MarkerF, InfoWindowF, MarkerClustererF } from '@react-google-maps/api';
import { Typography, Tag, List, Card, Avatar, Skeleton, Empty } from 'antd';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Location, Technician, WorkOrder } from '@/types/supabase';

const { Title, Text } = Typography;

const containerStyle = { width: '100%', height: '100%', borderRadius: '8px' };
const center = { lat: 0.32, lng: 32.58 };
const statusColorMap: Record<string, string> = { available: 'success', busy: 'warning', offline: 'default' };

const MapViewPage = () => {
  const [selected, setSelected] = useState<{ type: 'location' | 'technician', data: any } | null>(null);
  const [bounds, setBounds] = useState<google.maps.LatLngBounds | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const { data: workOrders, isLoading: isLoadingWorkOrders } = useQuery<WorkOrder[]>({
    queryKey: ['work_orders'],
    queryFn: async () => {
      const { data, error } = await supabase.from('work_orders').select('*');
      if (error) throw new Error(error.message);
      return data || [];
    }
  });

  const { data: locations, isLoading: isLoadingLocations } = useQuery<Location[]>({
    queryKey: ['locations', bounds?.toUrlValue()],
    queryFn: async () => {
      if (!bounds) return [];
      const { data, error } = await supabase.from('locations')
        .select('*')
        .gte('lat', bounds.getSouthWest().lat())
        .lte('lat', bounds.getNorthEast().lat())
        .gte('lng', bounds.getSouthWest().lng())
        .lte('lng', bounds.getNorthEast().lng());
      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!bounds,
  });

  const { data: technicians, isLoading: isLoadingTechnicians } = useQuery<Technician[]>({
    queryKey: ['technicians', bounds?.toUrlValue()],
    queryFn: async () => {
      if (!bounds) return [];
      const { data, error } = await supabase.from('technicians')
        .select('*')
        .gte('lat', bounds.getSouthWest().lat())
        .lte('lat', bounds.getNorthEast().lat())
        .gte('lng', bounds.getSouthWest().lng())
        .lte('lng', bounds.getNorthEast().lng());
      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!bounds,
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const onIdle = useCallback(() => {
    if (mapRef.current) {
      const newBounds = mapRef.current.getBounds();
      if (newBounds) {
        setBounds(newBounds);
      }
    }
  }, []);

  const onMarkerClick = useCallback((type: 'location' | 'technician', data: any) => {
    setSelected({ type, data });
  }, []);

  const technicianIcon = (status: 'available' | 'busy' | 'offline') => ({
    path: google.maps.SymbolPath.CIRCLE,
    scale: 8,
    fillColor: status === 'available' ? '#52c41a' : status === 'busy' ? '#faad14' : '#bfbfbf',
    fillOpacity: 1,
    strokeWeight: 2,
    strokeColor: 'white'
  });

  if (isLoadingWorkOrders) {
    return <Skeleton active />;
  }

  if (typeof google === 'undefined' || !google.maps) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 112px)', alignItems: 'center', justifyContent: 'center' }}>
        <Empty description="Google Maps is not available. Please check your API key." />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 112px)' }}>
      <Title level={4} style={{ marginBottom: '24px', flexShrink: 0 }}>Live Operations Map</Title>
      <div style={{ flexGrow: 1, width: '100%' }}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={12}
          options={{ disableDefaultUI: true, zoomControl: true }}
          onLoad={onLoad}
          onIdle={onIdle}
        >
          <MarkerClustererF>
            {(clusterer) => (
              <>
                {(locations || []).map(location =>
                  location.lat && location.lng && (
                    <MarkerF
                      key={`loc-${location.id}`}
                      position={{ lat: location.lat, lng: location.lng }}
                      onClick={() => onMarkerClick('location', location)}
                      clusterer={clusterer}
                    />
                  )
                )}
                {(technicians || []).map(tech =>
                  tech.lat && tech.lng && (
                    <MarkerF
                      key={`tech-${tech.id}`}
                      position={{ lat: tech.lat, lng: tech.lng }}
                      icon={technicianIcon(tech.status || 'offline')}
                      onClick={() => onMarkerClick('technician', tech)}
                      clusterer={clusterer}
                    />
                  )
                )}
              </>
            )}
          </MarkerClustererF>

          {selected && selected.data.lat && selected.data.lng && (
            <InfoWindowF
              position={{ lat: selected.data.lat, lng: selected.data.lng }}
              onCloseClick={() => setSelected(null)}
            >
              <Card bodyStyle={{ padding: 0, width: 250 }} bordered={false}>
                {selected.type === 'location' && (() => {
                  const openWorkOrders = (workOrders || []).filter(wo => wo.locationId === selected.data.id && wo.status !== 'Completed');
                  return (
                    <>
                      <Title level={5}>{selected.data.name.replace(' Service Center', '')}</Title>
                      <Text type="secondary">{selected.data.address}</Text>
                      {openWorkOrders.length > 0 ? (
                        <List size="small" header={<Text strong>Open Work Orders</Text>} dataSource={openWorkOrders} renderItem={(item: WorkOrder) => (<List.Item><Link to={`/work-orders/${item.id}`}>{item.workOrderNumber}: {item.service}</Link></List.Item>)} />
                      ) : <Text><br/>No open work orders.</Text>}
                    </>
                  );
                })()}
                {selected.type === 'technician' && (
                  <>
                    <Avatar src={selected.data.avatar || undefined} style={{ marginRight: 8 }}>{selected.data.name.split(' ').map((n:string) => n[0]).join('')}</Avatar>
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