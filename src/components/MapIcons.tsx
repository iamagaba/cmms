import L from 'leaflet';

// Raw SVG for Ant Design's EnvironmentOutlined icon
const locationIconSvg = `
  <svg viewBox="64 64 896 896" focusable="false" data-icon="environment" width="1em" height="1em" fill="currentColor" aria-hidden="true">
    <path d="M512 64c-159.1 0-288 128.9-288 288a286.33 286.33 0 0056.3 173.5l216.3 324.4c5.6 8.4 15.3 13.1 25.4 13.1s19.8-4.7 25.4-13.1l216.3-324.4A286.33 286.33 0 00800 352c0-159.1-128.9-288-288-288zm0 427.1c-79.5 0-144-64.5-144-144s64.5-144 144-144 144 64.5 144 144-64.5 144-144 144z"></path>
  </svg>
`;

// Raw SVG for Ant Design's ToolOutlined icon
const toolIconSvg = `
  <svg viewBox="64 64 896 896" focusable="false" data-icon="tool" width="1em" height="1em" fill="currentColor" aria-hidden="true">
    <path d="M888 208H736v-32c0-35.3-28.7-64-64-64H352c-35.3 0-64 28.7-64 64v32H136c-17.7 0-32 14.3-32 32v120c0 4.4 3.6 8 8 8h56.4l61.4 448.2c1.3 9.6 9.5 16.8 19.2 16.8h512c9.7 0 17.9-7.2 19.2-16.8L827.6 368H888c4.4 0 8-3.6 8-8V240c0-17.7-14.3-32-32-32zM384 176h256v32H384v-32zm383.6 624H256.4L200.5 368h623l-55.9 432zM736 464H640v160h96V464zM480 464H384v160h96V464z"></path>
  </svg>
`;

export const locationIcon = L.divIcon({
  html: `<div style="font-size: 32px; color: #1677ff;">${locationIconSvg}</div>`,
  className: 'custom-leaflet-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

export const technicianIcon = (status: 'available' | 'busy' | 'offline') => {
    const color = status === 'available' ? '#52c41a' : status === 'busy' ? '#faad14' : '#bfbfbf';
    return L.divIcon({
        html: `<div style="font-size: 28px; color: white; background: ${color}; border-radius: 50%; padding: 4px; display: flex; align-items: center; justify-content: center;">${toolIconSvg}</div>`,
        className: 'custom-leaflet-icon',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18]
    });
};