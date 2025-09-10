import React from 'react';
import { Typography, Tag, List, Card, Avatar, Skeleton, Empty, theme } from 'antd';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Location, Technician, WorkOrder } from '@/types/supabase';
import { OSMMap } from '@/components/OSMMap'; // Updated import

const { Title, Text } = Typography;
const { useToken } = theme;

const MapViewPage = () => {
  const [selected, setSelected] = React.useState<{ type: 'location' | 'technician', data: any } | null>(null);
  const { token } = useToken();

  const { data: locations, isLoading: isLoadingLocations } = useQuery<Location[]>({ queryKey: ['locations'], queryFn: async () => { const { data, error } = await supabase.from('locations').select('*'); if (error) throw new Error(error.message); return data || []; } });
  const { data: technicians, isLoading: isLoadingTechnicians } = useQuery<Technician[]>({ queryKey: ['technicians'], queryFn: async () => { const { data, error } = await supabase.from('technicians').select('*'); if (error) throw new Error(error.message); return data || []; } });
  const { data: workOrders, isLoading: isLoadingWorkOrders } = useQuery<WorkOrder[]>({ queryKey: ['work_orders'], queryFn: async () => { const { data, error } = await supabase.from('work_orders').select('*'); if (error) throw new Error(error.message); return data || []; } });

  if (isLoadingLocations || isLoadingTechnicians || isLoadingWorkOrders) {
    return <Skeleton active />;
  }

  const defaultCenter: [number, number] = [0.32, 32.58]; // Kampala, Uganda coordinates

  const mapMarkers = React.useMemo(() => {
    const markers = [];

    (locations || []).forEach(location => {
      if (location.lat && location.lng) {
        markers.push({
          position: [location.lat, location.lng],
          popupContent: (
            <Card bodyStyle={{ padding: 12, width: 250 }} bordered={false}>
              <Title level={5}>{location.name.replace(' Service Center', '')}</Title>
              <Text type="secondary">{location.address}</Text>
              <List
                size="small"
                header={<Text strong>Open Work Orders</Text>}
                dataSource={(workOrders || []).filter(wo => wo.locationId === location.id && wo.status !== 'Completed')}
                renderItem={(item: WorkOrder) => (
                  <List.Item><Link to={`/work-orders/${item.id}`}>{item.workOrderNumber}: {item.service}</Link></List.Item>
                )}
                locale={{ emptyText: <Text>No open work orders.</Text> }}
              />
            </Card>
          ),
          color: token.colorPrimary, // Use primary color for locations
        });
      }
    });

    (technicians || []).forEach(tech => {
      if (tech.lat && tech.lng) {
        const statusColorMap: Record<string, string> = {
          available: token.colorSuccess,
          busy: token.colorWarning,
          offline: token.colorTextSecondary,
        };
        markers.push({
          position: [tech.lat, tech.lng],
          popupContent: (
            <Card bodyStyle={{ padding: 12, width: 250 }} bordered={false}>
              <Avatar src={tech.avatar || undefined} style={{ marginRight: 8 }}>{tech.name.split(' ').map((n:string) => n[0]).join('')}</Avatar>
              <Title level={5} style={{ display: 'inline' }}>{tech.name}</Title>
              <div>
                <Tag color={statusColorMap[tech.status || 'offline']}>{tech.status}</Tag>
                <Text type="secondary">{tech.specialization}</Text>
              </div>
            </Card>
          ),
          color: statusColorMap[tech.status || 'offline'], // Use status color for technicians
        });
      }
    });

    return markers;
  }, [locations, technicians, workOrders, token]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 112px)' }}>
      <Title level={4} style={{ marginBottom: '24px', flexShrink: 0 }}>Live Operations Map</Title>
      <div style={{ flexGrow: 1, width: '100%' }}>
        <OSMMap
          center={defaultCenter}
          zoom={12}
          markers={mapMarkers}
          height="100%"
          width="100%"
        />
      </div>
    </div>
  );
};

export default MapViewPage;