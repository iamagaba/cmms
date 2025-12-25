import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Icon } from '@iconify/react';
import { WorkOrder, Location } from '@/types/supabase';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

// Set the Mapbox access token
mapboxgl.accessToken = import.meta.env.VITE_APP_MAPBOX_API_KEY || '';

interface WorkOrdersMapProps {
  workOrders: WorkOrder[];
  locations?: Location[];
  onWorkOrderClick?: (workOrder: WorkOrder) => void;
  className?: string;
}

// Status colors for markers
const STATUS_COLORS: Record<string, string> = {
  'Open': '#3b82f6',        // blue
  'Confirmation': '#8b5cf6', // purple
  'On Hold': '#f59e0b',      // amber
  'Ready': '#06b6d4',        // cyan
  'In Progress': '#f97316',  // orange
  'Completed': '#10b981',    // emerald
};

const PRIORITY_COLORS: Record<string, string> = {
  'Critical': '#ef4444',
  'High': '#f97316',
  'Medium': '#f59e0b',
  'Low': '#10b981',
};

export const WorkOrdersMap: React.FC<WorkOrdersMapProps> = ({
  workOrders,
  locations = [],
  onWorkOrderClick,
  className = '',
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);

  // Create location lookup map
  const locationMap = new Map(locations.map(l => [l.id, l]));

  // Filter work orders that have valid coordinates
  const workOrdersWithLocation = workOrders.filter(
    wo => wo.customerLat && wo.customerLng && 
          !isNaN(wo.customerLat) && !isNaN(wo.customerLng)
  );

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [36.8219, -1.2921], // Default to Nairobi
      zoom: 11,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Listen for view work order events from popup buttons
  useEffect(() => {
    const handleViewWorkOrder = (e: CustomEvent<string>) => {
      const workOrder = workOrders.find(wo => wo.id === e.detail);
      if (workOrder && onWorkOrderClick) {
        onWorkOrderClick(workOrder);
      }
    };

    window.addEventListener('viewWorkOrder', handleViewWorkOrder as EventListener);
    return () => {
      window.removeEventListener('viewWorkOrder', handleViewWorkOrder as EventListener);
    };
  }, [workOrders, onWorkOrderClick]);

  // Add markers when map is loaded and work orders change
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    if (workOrdersWithLocation.length === 0) return;

    // Add markers for each work order
    workOrdersWithLocation.forEach(wo => {
      const statusColor = STATUS_COLORS[wo.status || 'Open'] || '#6b7280';
      const priorityColor = PRIORITY_COLORS[wo.priority || 'Medium'] || '#f59e0b';
      
      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'work-order-marker';
      el.innerHTML = `
        <div style="
          width: 32px;
          height: 32px;
          background: ${statusColor};
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s;
        ">
          <div style="
            width: 8px;
            height: 8px;
            background: white;
            border-radius: 50%;
          "></div>
        </div>
        ${wo.priority === 'Critical' || wo.priority === 'High' ? `
          <div style="
            position: absolute;
            top: -4px;
            right: -4px;
            width: 12px;
            height: 12px;
            background: ${priorityColor};
            border: 2px solid white;
            border-radius: 50%;
          "></div>
        ` : ''}
      `;
      el.style.position = 'relative';

      // Add hover effect
      el.addEventListener('mouseenter', () => {
        el.querySelector('div')?.setAttribute('style', 
          el.querySelector('div')?.getAttribute('style')?.replace('transform: scale(1)', 'transform: scale(1.2)') || ''
        );
      });

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([wo.customerLng!, wo.customerLat!])
        .addTo(map.current!);

      // Get location/service center name
      const serviceCenter = wo.locationId ? locationMap.get(wo.locationId)?.name : null;
      
      // Calculate time since creation
      const createdAt = wo.created_at ? dayjs(wo.created_at) : null;
      const timeSinceCreation = createdAt ? createdAt.fromNow() : 'Unknown';

      // Create popup
      const popup = new mapboxgl.Popup({ offset: 25, closeButton: true, maxWidth: '320px' })
        .setHTML(`
          <div style="padding: 12px; min-width: 260px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
              <div style="font-weight: 700; font-size: 15px; color: #111827;">
                ${wo.workOrderNumber || wo.id.substring(0, 8)}
              </div>
              <div style="
                padding: 3px 10px;
                background: ${statusColor};
                color: white;
                border-radius: 4px;
                font-size: 11px;
                font-weight: 600;
              ">${wo.status || 'Open'}</div>
            </div>
            
            ${wo.title ? `
              <div style="font-size: 13px; color: #374151; margin-bottom: 12px; line-height: 1.4;">
                ${wo.title}
              </div>
            ` : ''}
            
            <div style="display: flex; flex-direction: column; gap: 8px; padding: 10px; background: #f9fafb; border-radius: 8px; margin-bottom: 12px;">
              ${serviceCenter ? `
                <div style="display: flex; align-items: center; gap: 8px;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                  <div>
                    <div style="font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px;">Service Center</div>
                    <div style="font-size: 12px; color: #374151; font-weight: 500;">${serviceCenter}</div>
                  </div>
                </div>
              ` : ''}
              
              <div style="display: flex; align-items: center; gap: 8px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <div>
                  <div style="font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px;">Created</div>
                  <div style="font-size: 12px; color: #374151; font-weight: 500;">${timeSinceCreation}</div>
                </div>
              </div>
              
              <div style="display: flex; align-items: center; gap: 8px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${priorityColor}" stroke-width="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                <div>
                  <div style="font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px;">Priority</div>
                  <div style="font-size: 12px; color: ${priorityColor}; font-weight: 600;">${wo.priority || 'Medium'}</div>
                </div>
              </div>
            </div>
            
            ${wo.customerName || wo.customerAddress ? `
              <div style="border-top: 1px solid #e5e7eb; padding-top: 10px;">
                ${wo.customerName ? `
                  <div style="font-size: 12px; color: #374151; font-weight: 500; margin-bottom: 2px;">
                    ${wo.customerName}
                  </div>
                ` : ''}
                ${wo.customerAddress ? `
                  <div style="font-size: 11px; color: #6b7280;">
                    ${wo.customerAddress}
                  </div>
                ` : ''}
              </div>
            ` : ''}
            
            <button 
              onclick="window.dispatchEvent(new CustomEvent('viewWorkOrder', { detail: '${wo.id}' }))"
              style="
                width: 100%;
                margin-top: 12px;
                padding: 8px 12px;
                background: #7c3aed;
                color: white;
                border: none;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 500;
                cursor: pointer;
                transition: background 0.2s;
              "
              onmouseover="this.style.background='#6d28d9'"
              onmouseout="this.style.background='#7c3aed'"
            >
              View Details
            </button>
          </div>
        `);

      marker.setPopup(popup);

      // Click handler
      el.addEventListener('click', () => {
        setSelectedWorkOrder(wo);
        onWorkOrderClick?.(wo);
      });

      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers
    if (workOrdersWithLocation.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      workOrdersWithLocation.forEach(wo => {
        bounds.extend([wo.customerLng!, wo.customerLat!]);
      });
      map.current.fitBounds(bounds, { padding: 50, maxZoom: 14 });
    }
  }, [workOrdersWithLocation, mapLoaded, onWorkOrderClick]);

  return (
    <div className={`relative ${className}`}>
      {/* Map Container */}
      <div ref={mapContainer} className="w-full h-[500px] rounded-lg" />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white border border-gray-200 rounded-lg p-3 text-xs">
        <div className="font-semibold text-gray-700 mb-2">Status</div>
        <div className="space-y-1">
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <div key={status} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded" 
                style={{ backgroundColor: color }}
              />
              <span className="text-gray-600">{status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats overlay */}
      <div className="absolute top-4 left-4 bg-white border border-gray-200 rounded-lg p-3">
        <div className="text-xs text-gray-500">Work Orders on Map</div>
        <div className="text-2xl font-bold text-gray-900">
          {workOrdersWithLocation.length}
        </div>
        <div className="text-xs text-gray-400">
          of {workOrders.length} total
        </div>
      </div>

      {/* No location warning */}
      {workOrders.length > 0 && workOrdersWithLocation.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 rounded-lg">
          <div className="text-center p-6">
            <div className="mx-auto w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-3">
              <Icon icon="tabler:map-pin-off" className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">No Location Data</h3>
            <p className="text-xs text-gray-500 max-w-xs">
              None of the work orders have location coordinates. Location is captured when customers report issues.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkOrdersMap;
