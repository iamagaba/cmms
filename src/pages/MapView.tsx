import React, { useState } from 'react';
import { Skeleton } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Location, Technician, WorkOrder } from '@/types/supabase';
import { MapboxDisplayMap } from '@/components/MapboxDisplayMap';
import AppBreadcrumb from "@/components/Breadcrumbs";

const defaultCenter: [number, number] = [32.58, 0.32]; // [lng, lat] for Kampala, Uganda

const MapViewPage = () => {
  // const [selected, setSelected] = useState<{ type: 'location' | 'technician', data: any } | null>(null);
  const mapCenter = defaultCenter;
  const [mapZoom] = useState<number>(12);

  const { data: workOrders, isLoading: isLoadingWorkOrders } = useQuery<WorkOrder[]>({
    queryKey: ['work_orders_map'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('work_orders')
        .select('*')
        .neq('status', 'Completed'); // Only show non-completed work orders
      if (error) throw new Error(error.message);
      return data || [];
    }
  });

  const { data: locations, isLoading: isLoadingLocations } = useQuery<Location[]>({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase.from('locations').select('*');
      if (error) throw new Error(error.message);
      return data || [];
    }
  });

  const { data: technicians, isLoading: isLoadingTechnicians } = useQuery<Technician[]>({
    queryKey: ['technicians'],
    queryFn: async () => {
      const { data, error } = await supabase.from('technicians').select('*');
      if (error) throw new Error(error.message);
      return data || [];
    }
  });

  const allMarkers = React.useMemo(() => {
    const markers: { lng: number; lat: number; color?: string; popupText?: string }[] = [];

    (locations || []).forEach(location => {
      if (location.lng && location.lat) {
        markers.push({
          lng: location.lng,
          lat: location.lat,
          color: '#1677ff', // Blue for locations
          popupText: `Location: ${location.name}`,
        });
      }
    });

    (technicians || []).forEach(tech => {
      if (tech.lng && tech.lat) {
        let techColor = '#bfbfbf'; // Offline
        if (tech.status === 'available') techColor = '#52c41a'; // Green
        if (tech.status === 'busy') techColor = '#faad14'; // Orange
        markers.push({
          lng: tech.lng,
          lat: tech.lat,
          color: techColor,
          popupText: `Technician: ${tech.name} (${tech.status})`,
        });
      }
    });

    // Add work order customer locations (only non-completed)
    (workOrders || []).forEach(wo => {
      if (wo.customerLng && wo.customerLat) {
        // Color based on status
        let workOrderColor = '#722ed1'; // Purple for new/pending
        if (wo.status === 'In Progress') workOrderColor = '#faad14'; // Orange
        if (wo.status === 'On Hold') workOrderColor = '#ff4d4f'; // Red
        if (wo.status === 'Ready') workOrderColor = '#1677ff'; // Blue
        
        markers.push({
          lng: wo.customerLng,
          lat: wo.customerLat,
          color: workOrderColor,
          popupText: `Work Order: ${wo.workOrderNumber || wo.id}<br/>Service: ${wo.service || 'N/A'}<br/>Status: ${wo.status}<br/>Address: ${wo.customerAddress || 'No address provided'}`,
        });
      }
    });

    return markers;
  }, [locations, technicians, workOrders]);

  // Only render the map when all data is loaded, so all work order markers are present on first render
  if (isLoadingWorkOrders || isLoadingLocations || isLoadingTechnicians) {
    return <Skeleton active />;
  }

  // If there are no work orders, locations, or technicians, show an empty state
  if (!workOrders || !locations || !technicians) {
    return <Skeleton active />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 112px)' }}>
      <AppBreadcrumb />
      <div style={{ flexGrow: 1, width: '100%' }}>
        <MapboxDisplayMap
          center={mapCenter}
          zoom={mapZoom}
          markers={allMarkers}
          height="calc(100vh - 112px)"
        />
      </div>
    </div>
  );
};

export default MapViewPage;