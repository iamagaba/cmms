import React, { useState } from 'react';
import { Row, Col, Space, message, Card, Switch, Typography, Button } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Technician, WorkOrder, Location } from '@/types/supabase';
import TechnicianTimeline from '@/components/scheduling/TechnicianTimeline';
import Breadcrumbs from '@/components/Breadcrumbs';
import { snakeToCamelCase } from '@/utils/data-helpers';
import OpenWorkOrdersList from '@/components/scheduling/OpenWorkOrdersList';
import { MapboxDisplayMap } from '@/components/MapboxDisplayMap';
import WorkOrderDetailsDrawer from '@/components/WorkOrderDetailsDrawer';
const { Text } = Typography;

const SchedulingPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: technicians = [] } = useQuery<Technician[]>({
    queryKey: ['technicians'],
    queryFn: async () => {
      const { data, error } = await supabase.from('technicians').select('*');
      if (error) throw new Error(error.message);
      return data || [];
    }
  });

  const [onlyUnassigned, setOnlyUnassigned] = useState(false);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string | null>(null);

  const { data: workOrders = [] } = useQuery<WorkOrder[]>({
    queryKey: ['work_orders'],
    queryFn: async () => {
      const { data, error } = await supabase.from('work_orders').select('*');
      if (error) throw new Error(error.message);
      return ((data || []).map(snakeToCamelCase)) as WorkOrder[];
    }
  });

  // Fetch all service center locations
  const { data: locations = [] } = useQuery<Location[]>({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase.from('locations').select('*');
      if (error) throw new Error(error.message);
      return data || [];
    }
  });

  type VehiclePlate = { id: string; license_plate: string };
  const { data: vehicles = [] } = useQuery<VehiclePlate[]>({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('vehicles').select('id, license_plate');
      if (error) throw new Error(error.message);
      return data || [];
    }
  });
  const vehiclesById = React.useMemo(() => new Map<string, { license_plate?: string }>((vehicles || []).map((v: VehiclePlate) => [v.id, { license_plate: v.license_plate }])), [vehicles]);

  // Drawer state
  const [drawerWorkOrderId, setDrawerWorkOrderId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const openDrawer = (id: string) => { setDrawerWorkOrderId(id); setDrawerOpen(true); };
  const closeDrawer = () => { setDrawerOpen(false); setDrawerWorkOrderId(null); };


  const assignMutation = useMutation({
    mutationFn: async ({ workOrderId, technicianId, start }: { workOrderId: string, technicianId: string, start?: string }) => {
      const updates: any = { id: workOrderId, assigned_technician_id: technicianId };
      if (start) {
        updates.appointment_date = start; // planned start to order the queue
      }
      const { error } = await supabase.from('work_orders').upsert([updates]);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work_orders'] });
      message.success('Assignment updated');
    },
    onError: (e: any) => message.error(e.message),
  });

  // simplified UI does not use direct assign button from queue

  const handleDrop = (workOrderId: string, technicianId: string, start: string) => {
    assignMutation.mutate({ workOrderId, technicianId, start });
  };

  // no-op: simple UI doesn’t need map/proximity

  const [openListHeight, setOpenListHeight] = useState<number | null>(null);

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Breadcrumbs />
      {/* Controls */}
      <Card size="small" bodyStyle={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Space>
          <Switch checked={onlyUnassigned} onChange={setOnlyUnassigned} />
          <Text>Show only unassigned</Text>
        </Space>
        {selectedTechnicianId && (
          <Button size="small" onClick={() => setSelectedTechnicianId(null)}>Clear technician filter</Button>
        )}
      </Card>

      {/* Simple layout: Left = Open WOs, Right = Work Orders Map */}
      <Row gutter={0} align="stretch" style={{ width: '100%' }}>
        <Col xs={24} lg={12} style={{ flex: 1, paddingRight: 8, display: 'flex', flexDirection: 'column' }}>
          <OpenWorkOrdersList 
            workOrders={workOrders} 
            onlyUnassigned={onlyUnassigned} 
            technicianId={selectedTechnicianId} 
            onListBodyHeight={setOpenListHeight} 
            vehiclesById={vehiclesById}
          />
        </Col>
        <Col xs={24} lg={12} style={{ flex: 1, paddingLeft: 8, display: 'flex', flexDirection: 'column' }}>
          <Card 
            title="Work Orders Map" 
            size="small" 
            bodyStyle={{ padding: 12, minHeight: openListHeight ? openListHeight : 420 }}
            style={{ width: '100%', height: '100%' }}
          >
            <MapboxDisplayMap
              center={[32.5825, 0.3476]} // Default to Kampala, Uganda
              zoom={10}
              height={openListHeight ? `${openListHeight - 80}px` : '340px'}
              markers={[
                // Work order markers
                ...workOrders
                  .filter(wo => wo.customerLat && wo.customerLng && 
                    (onlyUnassigned ? !wo.assignedTechnicianId : true) &&
                    (selectedTechnicianId ? wo.assignedTechnicianId === selectedTechnicianId : true)
                  )
                  .map(wo => ({
                    lng: wo.customerLng!,
                    lat: wo.customerLat!,
                    color: wo.priority === 'High' ? '#ff4d4f' : wo.priority === 'Medium' ? '#faad14' : '#52c41a',
                    popupText: `${wo.workOrderNumber} - ${wo.service || 'Work Order'}\nPriority: ${wo.priority || 'Normal'}\nStatus: ${wo.status || 'Open'}`
                  })),
                // Service center markers (purple)
                ...locations
                  .filter(loc => loc.lat && loc.lng)
                  .map(loc => ({
                    lng: loc.lng!,
                    lat: loc.lat!,
                    color: '#6A0DAD', // purple
                    popupText: `Service Center: ${loc.name}${loc.address ? `\n${loc.address}` : ''}`
                  }))
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* Optional: simple per-tech timeline list (drop to schedule) */}
      <Card size="small" title="Today: Technician Timelines" bodyStyle={{ padding: 12 }} style={{ marginTop: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }} size={12}>
          {technicians.map(t => (
            <TechnicianTimeline
              key={t.id}
              technician={t}
              items={(workOrders || []).filter(w => w.assignedTechnicianId === t.id).map(w => ({ id: w.id, start: w.appointmentDate, end: null, wo: w }))}
              onDrop={handleDrop}
              vehiclesById={vehiclesById}
              onOpenDrawer={openDrawer}
            />
          ))}
        </Space>
      </Card>

      {/* Shared work order drawer */}
      <WorkOrderDetailsDrawer open={drawerOpen} workOrderId={drawerWorkOrderId || undefined} onClose={closeDrawer} />
    </Space>
  );
};

export default SchedulingPage;
