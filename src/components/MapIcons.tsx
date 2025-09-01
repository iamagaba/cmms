import React from 'react';
import { renderToString } from 'react-dom/server';
import L from 'leaflet';
import { EnvironmentOutlined, ToolOutlined } from '@ant-design/icons';

export const locationIcon = L.divIcon({
  html: renderToString(<EnvironmentOutlined style={{ fontSize: '32px', color: '#1677ff' }} />),
  className: 'custom-leaflet-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

export const technicianIcon = (status: 'available' | 'busy' | 'offline') => {
    const color = status === 'available' ? '#52c41a' : status === 'busy' ? '#faad14' : '#bfbfbf';
    return L.divIcon({
        html: renderToString(<ToolOutlined style={{ fontSize: '28px', color: 'white', background: color, borderRadius: '50%', padding: '4px' }} />),
        className: 'custom-leaflet-icon',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18]
    });
};