import React from 'react';
import { Card, Descriptions, Select, Button, Empty, Typography, Space } from 'antd';
import { Icon } from '@iconify/react'; // Import Icon from Iconify
import { WorkOrder, Location } from '@/types/supabase';
import { MapboxLocationSearchInput } from '@/components/MapboxLocationSearchInput';
import { MapboxDisplayMap } from '@/components/MapboxDisplayMap';
import { calculateDistance } from '@/utils/geo-helpers';
import mapboxgl from 'mapbox-gl';

const { Text } = Typography;
const { Option } = Select;

interface WorkOrderLocationMapCardProps {
  workOrder: WorkOrder;
  location: Location | null;
  allLocations: Location[];
  handleUpdateWorkOrder: (updates: Partial<WorkOrder>) => void;
  handleLocationSelect: (selectedLoc: { lat: number; lng: number; label: string }) => void;
  showInteractiveMap: boolean;
  setShowInteractiveMap: (show: boolean) => void;
}

export const WorkOrderLocationMapCard: React.FC<WorkOrderLocationMapCardProps> = ({
  workOrder,
  location,
  allLocations,
  handleUpdateWorkOrder,
  handleLocationSelect,
  showInteractiveMap,
  setShowInteractiveMap,
}) => {
  const mapMarkers = [];
  let mapCenter: [number, number] = [0, 0]; // Default center
  let originCoords: [number, number] | null = null;
  let destinationCoords: [number, number] | null = null;

  if (location?.lng && location?.lat) {
    mapMarkers.push({ lng: location.lng, lat: location.lat, color: '#1677ff', popupText: `Service Center: ${location.name}` });
    mapCenter = [location.lng, location.lat];
    originCoords = [location.lng, location.lat];
  }
  if (workOrder.customerLng && workOrder.customerLat) {
    mapMarkers.push({ lng: workOrder.customerLng, lat: workOrder.customerLat, color: '#faad14', popupText: `Client Location: ${workOrder.customerAddress || 'N/A'}` });
    if (!mapCenter[0] && !mapCenter[1]) { // If no service location, center on client
      mapCenter = [workOrder.customerLng, workOrder.customerLat];
    }
    destinationCoords = [workOrder.customerLng, workOrder.customerLat];
  }

  // The distance calculation and display is now handled by MapboxDisplayMap
  // so we remove the local calculation and Descriptions.Item for it.

  return (
    <Card title="Location Details">
      <Descriptions column={1}>
        <Descriptions.Item label={<><Icon icon="ph:map-pin-fill" /> Service Location</>}>
          <Select
            value={workOrder.locationId}
            onChange={(value) => handleUpdateWorkOrder({ locationId: value })}
            style={{ width: '100%' }}
            bordered={false}
            allowClear
            placeholder="Select location"
            suffixIcon={null}
          >
            {(allLocations || []).map(l => (
              <Option key={l.id} value={l.id}>{l.name.replace(' Service Center', '')}</Option>
            ))}
          </Select>
        </Descriptions.Item>
        <Descriptions.Item label="Client Location">
          <MapboxLocationSearchInput onLocationSelect={handleLocationSelect} initialValue={workOrder.customerAddress || ''} />
        </Descriptions.Item>
      </Descriptions>
      <div style={{ marginTop: 16 }}>
        {mapMarkers.length > 0 ? (
          showInteractiveMap ? (
            <MapboxDisplayMap 
              center={mapCenter} 
              markers={mapMarkers} 
              height="300px" 
              origin={originCoords} 
              destination={destinationCoords} 
            />
          ) : (
            <div
              style={{
                height: '300px',
                backgroundColor: '#f0f2f5',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
              }}
              onClick={() => setShowInteractiveMap(true)}
            >
              {mapboxgl.accessToken && mapCenter[0] !== 0 && mapCenter[1] !== 0 ? (
                <img
                  src={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${mapCenter[0]},${mapCenter[1]},${12},0,0/600x300?access_token=${mapboxgl.accessToken}&logo=false&attribution=false`}
                  alt="Static map preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }}
                />
              ) : (
                <Empty description="No map preview available" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ zIndex: 1 }} />
              )}
              <Button type="primary" icon={<Icon icon="ph:compass-fill" />} style={{ zIndex: 1 }}>
                View Interactive Map
              </Button>
            </div>
          )
        ) : (
          <div style={{padding: '24px', textAlign: 'center'}}><Empty description="No location data to display." /></div>
        )}
      </div>
    </Card>
  );
};