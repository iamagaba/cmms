import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { theme } from 'antd';

// Fix for default Leaflet icon issues with Webpack/Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface MarkerData {
  position: [number, number];
  popupContent?: React.ReactNode;
  color?: string; // Custom color for the marker
}

interface OSMMapProps {
  center: [number, number];
  zoom?: number;
  markers?: MarkerData[];
  height?: string;
  width?: string;
  scrollWheelZoom?: boolean;
}

export const OSMMap = ({
  center,
  zoom = 12,
  markers = [],
  height = '300px',
  width = '100%',
  scrollWheelZoom = true,
}: OSMMapProps) => {
  const { token } = theme.useToken();

  const createCustomMarkerIcon = (color: string) => {
    return L.divIcon({
      className: 'custom-leaflet-icon',
      html: `<svg width="24" height="40" viewBox="0 0 24 40" fill="none" xmlns="http://www.w3.org/2000/svg">
               <path d="M12 0C7.3125 0 3.5 3.8125 3.5 8.5C3.5 15.3125 12 24 12 24C12 24 20.5 15.3125 20.5 8.5C20.5 3.8125 16.6875 0 12 0ZM12 12.5C9.79167 12.5 8 10.7083 8 8.5C8 6.29167 9.79167 4.5 12 4.5C14.2083 4.5 16 6.29167 16 8.5C16 10.7083 14.2083 12.5 12 12.5Z" fill="${color}"/>
             </svg>`,
      iconSize: [24, 40],
      iconAnchor: [12, 40],
      popupAnchor: [0, -30],
    });
  };

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={scrollWheelZoom}
      style={{ height, width, borderRadius: token.borderRadius }}
      className="z-0" // Ensure map is behind modals/drawers
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers.map((marker, index) => (
        <Marker
          key={index}
          position={marker.position}
          icon={createCustomMarkerIcon(marker.color || token.colorPrimary)}
        >
          {marker.popupContent && <Popup>{marker.popupContent}</Popup>}
        </Marker>
      ))}
    </MapContainer>
  );
};