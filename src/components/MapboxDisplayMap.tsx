import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Empty, Typography, Spin } from 'antd'; // Import Spin from antd

const { Text } = Typography;

mapboxgl.accessToken = import.meta.env.VITE_APP_MAPBOX_API_KEY || '';

interface MapboxDisplayMapProps {
  center: [number, number]; // [lng, lat]
  zoom?: number;
  markers?: { lng: number; lat: number; color?: string; popupText?: string }[];
  height?: string;
}

export const MapboxDisplayMap = ({ center, zoom = 12, markers = [], height = '300px' }: MapboxDisplayMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);

  useEffect(() => {
    if (!mapboxgl.accessToken) {
      console.error("Mapbox API Key is not configured. Please set VITE_APP_MAPBOX_API_KEY in your .env file.");
      return;
    }

    if (map.current || !mapContainer.current) return; // Initialize map only once

    setMapInitialized(false); // Reset loading state when component mounts
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11', // You can choose other styles like 'mapbox/satellite-v9'
      center: center,
      zoom: zoom,
    });

    map.current.on('load', () => {
      setMapInitialized(true);
    });

    // Handle map errors
    map.current.on('error', (e) => {
      console.error('Mapbox GL JS Error:', e.error);
      setMapInitialized(false); // Indicate error state
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [center, zoom]);

  useEffect(() => {
    if (!mapInitialized || !map.current) return;

    // Clear existing markers
    const existingMarkers = document.querySelectorAll('.mapboxgl-marker');
    existingMarkers.forEach(marker => marker.remove());

    // Add new markers
    markers.forEach(markerData => {
      const marker = new mapboxgl.Marker({ color: markerData.color || '#6A0DAD' })
        .setLngLat([markerData.lng, markerData.lat])
        .addTo(map.current!);

      if (markerData.popupText) {
        const popup = new mapboxgl.Popup({ offset: 25 }).setText(markerData.popupText);
        marker.setPopup(popup);
      }
    });

    // Adjust map bounds to fit all markers if there are multiple
    if (markers.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      markers.forEach(marker => bounds.extend([marker.lng, marker.lat]));
      map.current.fitBounds(bounds, { padding: 50, duration: 0 });
    } else if (markers.length === 1) {
      map.current.setCenter([markers[0].lng, markers[0].lat]);
    } else {
      map.current.setCenter(center);
    }

  }, [markers, mapInitialized, center]);

  if (!mapboxgl.accessToken) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f2f5', borderRadius: '8px' }}>
        <Empty description={<Text type="danger">Mapbox API Key not configured.</Text>} />
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height, borderRadius: '8px' }}>
      {!mapInitialized && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          zIndex: 1,
          borderRadius: '8px',
        }}>
          <Spin size="large" tip="Loading map..." />
        </div>
      )}
      <div ref={mapContainer} style={{ width: '100%', height: '100%', borderRadius: '8px' }} />
    </div>
  );
};