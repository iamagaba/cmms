import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Empty, Typography, Spin } from 'antd';

const { Text } = Typography;

mapboxgl.accessToken = import.meta.env.VITE_APP_MAPBOX_API_KEY || '';

interface MapMarker {
  lng: number;
  lat: number;
  iconType: 'motorbike' | 'wrench' | 'user' | 'work-order';
  iconColor?: string;
  popupText?: string;
}

interface MapboxDisplayMapProps {
  center: [number, number]; // [lng, lat]
  zoom?: number;
  markers?: MapMarker[];
  height?: string;
  origin?: [number, number] | null; // [lng, lat] for route start
  destination?: [number, number] | null; // [lng, lat] for route end
}

// Helper function to get SVG string for a given icon type and color
const getSvgIcon = (iconType: MapMarker['iconType'], color: string = '#6A0DAD') => {
  const size = 24; // Icon size
  const strokeWidth = 2;

  let pathData = '';
  switch (iconType) {
    case 'motorbike':
      pathData = `<path d="M5 17H4a2 2 0 0 0-2 2v2h12v-2a2 2 0 0 0-2-2h-1"/><path d="M18 17h1a2 2 0 0 0 2-2v-2h-12v2a2 2 0 0 0 2 2h1"/><path d="M12 15V3"/><path d="M18 8V4"/><path d="M5 8V4"/><path d="M12 7H5"/><path d="M12 7h7"/>`;
      break;
    case 'wrench':
      pathData = `<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-2.46 2.46a7 7 0 0 1-11.34-2.87z"/><path d="M2 2l.07.07"/><path d="M12.12 12.12L1.4 22.8Z"/>`;
      break;
    case 'user':
      pathData = `<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>`;
      break;
    case 'work-order': // Generic pin for work orders
    default:
      pathData = `<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>`;
      break;
  }

  return `
    <div style="background-color: white; border-radius: 50%; padding: 4px; display: flex; align-items: center; justify-content: center; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">
        ${pathData}
      </svg>
    </div>
  `;
};

export const MapboxDisplayMap = ({ center, zoom = 12, markers = [], height = '300px', origin, destination }: MapboxDisplayMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [routeData, setRouteData] = useState<any>(null);
  const [routeDistance, setRouteDistance] = useState<number | null>(null); // in kilometers

  useEffect(() => {
    if (!mapboxgl.accessToken) {
      console.error("Mapbox API Key is not configured. Please set VITE_APP_MAPBOX_API_KEY in your .env file.");
      return;
    }

    if (map.current || !mapContainer.current) return;

    setMapInitialized(false);
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: center,
      zoom: zoom,
    });

    map.current.on('load', () => {
      setMapInitialized(true);
    });

    map.current.on('error', (e) => {
      console.error('Mapbox GL JS Error:', e.error);
      setMapInitialized(false);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [center, zoom]);

  // Effect for fetching directions
  useEffect(() => {
    const fetchDirections = async () => {
      if (!origin || !destination || !mapboxgl.accessToken) {
        setRouteData(null);
        setRouteDistance(null);
        return;
      }

      try {
        const query = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${origin[0]},${origin[1]};${destination[0]},${destination[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`,
          { method: 'GET' }
        );
        const json = await query.json();
        if (json.routes && json.routes.length > 0) {
          const route = json.routes[0];
          setRouteData(route.geometry);
          setRouteDistance(route.distance / 1000); // Convert meters to kilometers
        } else {
          setRouteData(null);
          setRouteDistance(null);
          console.warn('No route found between the specified points.');
        }
      } catch (error) {
        console.error('Error fetching directions:', error);
        setRouteData(null);
        setRouteDistance(null);
      }
    };

    fetchDirections();
  }, [origin, destination]);

  // Effect for adding/updating markers and route on the map
  useEffect(() => {
    if (!mapInitialized || !map.current) return;

    // Clear existing markers
    const existingMarkers = document.querySelectorAll('.mapboxgl-marker');
    existingMarkers.forEach(marker => marker.remove());

    // Add new markers
    markers.forEach(markerData => {
      const el = document.createElement('div');
      el.innerHTML = getSvgIcon(markerData.iconType, markerData.iconColor);
      
      const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([markerData.lng, markerData.lat])
        .addTo(map.current!);

      if (markerData.popupText) {
        const popup = new mapboxgl.Popup({ offset: 25 }).setText(markerData.popupText);
        marker.setPopup(popup);
      }
    });

    // Add or update route layer
    if (routeData) {
      if (map.current.getSource('route')) {
        (map.current.getSource('route') as mapboxgl.GeoJSONSource).setData(routeData);
      } else {
        map.current.addSource('route', {
          type: 'geojson',
          data: routeData,
        });
        map.current.addLayer({
          id: 'route-line',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#888',
            'line-width': 6,
            'line-opacity': 0.75,
          },
        });
      }

      // Add distance label to the map
      if (routeDistance !== null && routeData.coordinates && routeData.coordinates.length > 0) {
        const midPointIndex = Math.floor(routeData.coordinates.length / 2);
        const midCoordinate = routeData.coordinates[midPointIndex];

        const el = document.createElement('div');
        el.className = 'distance-label';
        el.style.backgroundColor = 'white';
        el.style.padding = '4px 8px';
        el.style.borderRadius = '4px';
        el.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)';
        el.style.fontWeight = 'bold';
        el.style.fontSize = '12px';
        el.textContent = `${routeDistance.toFixed(1)} km`;

        new mapboxgl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat(midCoordinate)
          .addTo(map.current);
      }
    } else {
      // Remove route layer if no route data
      if (map.current.getLayer('route-line')) {
        map.current.removeLayer('route-line');
      }
      if (map.current.getSource('route')) {
        map.current.removeSource('route');
      }
    }

    // Adjust map bounds to fit all markers and route if available
    const allPoints: mapboxgl.LngLat[] = [];
    markers.forEach(point => allPoints.push(new mapboxgl.LngLat(point.lng, point.lat)));
    if (routeData && routeData.coordinates) {
      routeData.coordinates.forEach((coord: [number, number]) => allPoints.push(new mapboxgl.LngLat(coord[0], coord[1])));
    }

    if (allPoints.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      allPoints.forEach(point => bounds.extend(point));
      map.current.fitBounds(bounds, { padding: 50, duration: 0 });
    } else {
      map.current.setCenter(center);
    }

  }, [markers, mapInitialized, center, routeData, routeDistance]);

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