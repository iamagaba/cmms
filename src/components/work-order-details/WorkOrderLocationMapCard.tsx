import React, { useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import { WorkOrder, Location } from '@/types/supabase';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface WorkOrderLocationMapCardProps {
  workOrder: WorkOrder;
  location?: Location | null;
  allLocations?: Location[];
  handleUpdateWorkOrder?: (updates: Partial<WorkOrder>) => void;
  handleLocationSelect?: (loc: { lat: number; lng: number; label: string }) => void;
  showInteractiveMap?: boolean;
  setShowInteractiveMap?: (show: boolean) => void;
}

const MAPBOX_TOKEN = import.meta.env.VITE_APP_MAPBOX_API_KEY;

export const WorkOrderLocationMapCard: React.FC<WorkOrderLocationMapCardProps> = ({
  workOrder,
  location,
  allLocations = [],
  handleUpdateWorkOrder,
  handleLocationSelect,
  showInteractiveMap = false,
  setShowInteractiveMap,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  const customerLat = workOrder.customerLat;
  const customerLng = workOrder.customerLng;
  const customerAddress = workOrder.customerAddress;
  const hasCustomerLocation = customerLat != null && customerLng != null;

  const serviceCenterLat = location?.lat;
  const serviceCenterLng = location?.lng;
  const hasServiceCenterLocation = serviceCenterLat != null && serviceCenterLng != null;

  const hasAnyLocation = hasCustomerLocation || hasServiceCenterLocation;

  useEffect(() => {
    if (!mapContainer.current || !MAPBOX_TOKEN || !hasAnyLocation) return;

    try {
      mapboxgl.accessToken = MAPBOX_TOKEN;
      
      const centerLat = customerLat ?? serviceCenterLat ?? -1.2921;
      const centerLng = customerLng ?? serviceCenterLng ?? 36.8219;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [centerLng, centerLat],
        zoom: 14,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Customer location marker (red)
      if (hasCustomerLocation) {
        new mapboxgl.Marker({ color: '#ef4444' })
          .setLngLat([customerLng!, customerLat!])
          .setPopup(new mapboxgl.Popup().setHTML(`<strong>Customer Location</strong><br/>${customerAddress || 'No address'}`))
          .addTo(map.current);
      }

      // Service center marker (blue)
      if (hasServiceCenterLocation) {
        new mapboxgl.Marker({ color: '#3b82f6' })
          .setLngLat([serviceCenterLng!, serviceCenterLat!])
          .setPopup(new mapboxgl.Popup().setHTML(`<strong>${location?.name || 'Service Center'}</strong><br/>${location?.address || ''}`))
          .addTo(map.current);
      }

      // Fit bounds if both locations exist
      if (hasCustomerLocation && hasServiceCenterLocation) {
        const bounds = new mapboxgl.LngLatBounds()
          .extend([customerLng!, customerLat!])
          .extend([serviceCenterLng!, serviceCenterLat!]);
        map.current.fitBounds(bounds, { padding: 50 });
      }
    } catch (err) {
      setMapError('Failed to load map');
      console.error('Map error:', err);
    }

    return () => { map.current?.remove(); };
  }, [hasAnyLocation, customerLat, customerLng, serviceCenterLat, serviceCenterLng, showInteractiveMap]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="bg-white">
        <div className="px-3 py-2 border-b border-gray-200">
          <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">Location</h3>
        </div>
        <div className="px-3 py-2">
          <div className="bg-amber-50 border border-amber-200 rounded px-2 py-1.5 text-xs text-amber-700">
            Map unavailable: Mapbox API key not configured
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="px-3 py-2 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">Location</h3>
        {setShowInteractiveMap && (
          <button
            onClick={() => setShowInteractiveMap(!showInteractiveMap)}
            className="text-xs text-primary-600 hover:text-primary-700 font-medium"
          >
            {showInteractiveMap ? 'Hide' : 'Show'}
          </button>
        )}
      </div>
      
      {/* Use divide-y for sections */}
      <div className="divide-y divide-gray-100">
        {/* Address Info */}
        {(customerAddress || location) && (
          <div className="px-3 py-2 space-y-1.5">
            {customerAddress && (
              <div className="flex items-start gap-1.5">
                <Icon icon="tabler:map-pin" className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">Customer</p>
                  <p className="text-xs text-gray-900">{customerAddress}</p>
                </div>
              </div>
            )}
            {location && (
              <div className="flex items-start gap-1.5">
                <Icon icon="tabler:building" className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">Service Center</p>
                  <p className="text-xs text-gray-900">{location.name}</p>
                  {location.address && <p className="text-xs text-gray-500">{location.address}</p>}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Map */}
        <div className="px-3 py-2">
          {hasAnyLocation ? (
            <div ref={mapContainer} className="h-40 rounded overflow-hidden" />
          ) : (
            <div className="h-24 bg-gray-100 rounded flex items-center justify-center">
              <div className="text-center">
                <Icon icon="tabler:map-off" className="w-6 h-6 text-gray-300 mx-auto mb-1" />
                <p className="text-xs text-gray-400">No location data</p>
              </div>
            </div>
          )}
          {mapError && <p className="text-xs text-red-500 mt-1">{mapError}</p>}
        </div>
      </div>
    </div>
  );
};

export default WorkOrderLocationMapCard;
