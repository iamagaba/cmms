import React, { useState, useRef, useMemo } from 'react';
import Map, { Marker, Popup } from 'react-map-gl';
import useSupercluster from 'use-supercluster';
import { Typography, Tag, List, Card, Avatar, Skeleton, Empty, Space } from 'antd';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Location, Technician, WorkOrder } from '@/types/supabase';
import { PointFeature } from 'supercluster';

const { Title, Text } = Typography;

const containerStyle = { width: '100%', height: '100%', borderRadius: '8px' };
const statusColorMap: Record<string, string> = { available: 'success', busy: 'warning', offline: 'default' };
const MAPBOX_API_KEY = import.meta.env.VITE_APP_MAPBOX_API_KEY || "";

type MapPointProperties = {
  point_type: 'location' | 'technician';
  data: Location | Technician;
};

const MapViewPage = () => {
  const [viewport, setViewport] = useState({
    latitude: 0.32,
    longitude: 32.58,
    zoom: 11
  });
  const [selected, setSelected] = useState<any>(null);
  const mapRef = useRef<any>();

  const { data: workOrders, isLoading: isLoadingWorkOrders } = useQuery<WorkOrder[]>({
    queryKey: ['work_orders'],
    queryFn: async () => {
      const { data, error } = await supabase.from('work_orders').select('*');
      if (error) throw new Error(error.message);
      return data || [];
    }
  });

  const { data: locations, isLoading: isLoadingLocations } = useQuery<Location[]>({
    queryKey: ['locations_all'],
    queryFn: async () => {
      const { data, error } = await supabase.from('locations').select('*');
      if (error) throw new Error(error.message);
      return data || [];
    },
  });

  const { data: technicians, isLoading: isLoadingTechnicians } = useQuery<Technician[]>({
    queryKey: ['technicians_all'],
    queryFn: async () => {
      const { data, error } = await supabase.from('technicians').select('*');
      if (error) throw new Error(error.message);
      return data || [];
    },
  });

  const points: Array<PointFeature<MapPointProperties>> = useMemo(() => {
    const locationPoints = (locations || []).filter(l => l.lat && l.lng).map(l => ({
      type: 'Feature' as const,
      properties: { point_type: 'location' as const, data: l },
      geometry: { type: 'Point' as const, coordinates: [l.lng!, l.lat!] }
    }));
    const technicianPoints = (technicians || []).filter(t => t.lat && t.lng).map(t => ({
      type: 'Feature' as const,
      properties: { point_type: 'technician' as const, data: t },
      geometry: { type: 'Point' as const, coordinates: [t.lng!, t.lat!] }
    }));
    return [...locationPoints, ...technicianPoints] as Array<PointFeature<MapPointProperties>>;
  }, [locations, technicians]);

  const bounds = mapRef.current ? mapRef.current.getMap().getBounds().toArray().flat() : null;

  const { clusters, supercluster } = useSupercluster({
    points,
    bounds,
    zoom: viewport.zoom,
    options: { radius: 75, maxZoom: 20 }
  });

  const isLoading = isLoadingWorkOrders || isLoadingLocations || isLoadingTechnicians;

  if (isLoading) {
    return <Skeleton active />;
  }

  if (!MAPBOX_API_KEY) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 112px)', alignItems: 'center', justifyContent: 'center' }}>
        <Empty description="Mapbox API Key is not configured. Map cannot be displayed." />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 112px)' }}>
      <Title level={4} style={{ marginBottom: '24px', flexShrink: 0 }}>Live Operations Map</Title>
      <div style={{ flexGrow: 1, width: '100%' }}>
        <Map
          {...viewport}
          ref={mapRef}
          onMove={evt => setViewport(evt.viewState)}
          style={containerStyle}
          mapStyle="mapbox://styles/mapbox/streets-v11"
          mapboxAccessToken={MAPBOX_API_KEY}
        >
          {clusters.map(cluster => {
            const [longitude, latitude] = cluster.geometry.coordinates;
            const properties = cluster.properties as any;

            if (properties.cluster) {
              return (
                <Marker key={`cluster-${cluster.id}`} latitude={latitude} longitude={longitude}>
                  <div
                    className="cluster-marker"
                    style={{
                      width: `${10 + (properties.point_count / points.length) * 20}px`,
                      height: `${10 + (properties.point_count / points.length) * 20}px`,
                      backgroundColor: '#6A0DAD',
                      color: 'white',
                      borderRadius: '50%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      const expansionZoom = Math.min(supercluster.getClusterExpansionZoom(cluster.id as number), 20);
                      mapRef.current.flyTo({ center: [longitude, latitude], zoom: expansionZoom, speed: 1 });
                    }}
                  >
                    {properties.point_count}
                  </div>
                </Marker>
              );
            }

            const { point_type, data } = properties;
            if (point_type === 'location') {
              return (
                <Marker key={`loc-${data.id}`} longitude={longitude} latitude={latitude} onClick={() => setSelected(properties)} />
              );
            }
            if (point_type === 'technician') {
              return (
                <Marker key={`tech-${data.id}`} longitude={longitude} latitude={latitude} onClick={() => setSelected(properties)}>
                  <div style={{
                    width: 12,
                    height: 12,
                    backgroundColor: data.status === 'available' ? '#52c41a' : data.status === 'busy' ? '#faad14' : '#bfbfbf',
                    borderRadius: '50%',
                    border: '2px solid white',
                    boxShadow: '0 0 5px rgba(0,0,0,0.5)',
                    cursor: 'pointer'
                  }} />
                </Marker>
              );
            }
            return null;
          })}

          {selected && (
            <Popup
              latitude={selected.data.lat}
              longitude={selected.data.lng}
              onClose={() => setSelected(null)}
              closeOnClick={false}
              anchor="bottom"
            >
              <Card bodyStyle={{ padding: 8, width: 250 }} bordered={false}>
                {selected.point_type === 'location' && (() => {
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
                {selected.point_type === 'technician' && (
                  <Space>
                    <Avatar src={selected.data.avatar || undefined}>{selected.data.name.split(' ').map((n:string) => n[0]).join('')}</Avatar>
                    <div>
                      <Title level={5} style={{ margin: 0 }}>{selected.data.name}</Title>
                      <Tag color={statusColorMap[selected.data.status]}>{selected.data.status}</Tag>
                    </div>
                  </Space>
                )}
              </Card>
            </Popup>
          )}
        </Map>
      </div>
    </div>
  );
};

export default MapViewPage;