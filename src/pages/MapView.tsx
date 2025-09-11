import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Typography, Tag, List, Card, Avatar, Skeleton, Empty, Row, Col, Space } from 'antd';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Location, Technician, WorkOrder } from '@/types/supabase';
import { MapboxDisplayMap } from '@/components/MapboxDisplayMap'; // Import the new Mapbox map component
import mapboxgl from 'mapbox-gl'; // Import mapboxgl for types
import Breadcrumbs from "@/components/Breadcrumbs";

const { Title, Text } = Typography;

const containerStyle = { width: '100%', height: '100%', borderRadius: '8px' };
const defaultCenter: [number, number] = [32.58, 0.32]; // [lng, lat] for Kampala, Uganda
const statusColorMap: Record<string, string> = { available: 'success', busy: 'warning', offline: 'default' };

const MapViewPage = () => {
  const [selected, setSelected] = useState<{ type: 'location' | 'technician', data: any } | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(defaultCenter);
  const [mapZoom, setMapZoom] = useState<number>(12);

  const { data: workOrders, isLoading: isLoadingWorkOrders } = useQuery<WorkOrder[]>({
    queryKey: ['work_orders'],
    queryFn: async () => {
      const { data, error } = await supabase.from('work_orders').select('*');
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

    // Add work order customer locations
    (workOrders || []).forEach(wo => {
      if (wo.customerLng && wo.customerLat) {
        markers.push({
          lng: wo.customerLng,
          lat: wo.customerLat,
          color: '#6A0DAD', // Purple for customer locations
          popupText: `Work Order: ${wo.workOrderNumber} - ${wo.service}`,
        });
      }
    });

    return markers;
  }, [locations, technicians, workOrders]);

  if (isLoadingWorkOrders || isLoadingLocations || isLoadingTechnicians) {
    return <Skeleton active />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 112px)' }}>
      <Breadcrumbs />
      <div style={{ flexGrow: 1, width: '100%' }}>
        <MapboxDisplayMap
          center={mapCenter}
          zoom={mapZoom}
          markers={allMarkers}
          height="100%"
        />
      </div>
    </div>
  );
};

export default MapViewPage;