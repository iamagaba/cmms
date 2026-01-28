import { CheckCircle, Clock, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';


import { WorkOrder, Location, Vehicle } from '@/types/supabase';
import { DiagnosticCategoryRow } from '@/types/diagnostic';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

// Set the Mapbox access token
mapboxgl.accessToken = import.meta.env.VITE_APP_MAPBOX_API_KEY || '';

interface WorkOrdersMapProps {
  workOrders: WorkOrder[];
  locations?: Location[];
  vehicles?: Vehicle[];
  serviceCategories?: DiagnosticCategoryRow[];
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
  vehicles = [],
  serviceCategories = [],
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
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [32.5825, 0.3476], // Default to Kampala, Uganda
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

    // Group work orders by coordinates to handle overlaps
    const locationsMap: Record<string, WorkOrder[]> = {};

    workOrdersWithLocation.forEach(wo => {
      // Create a key based on coordinates (truncated to reasonable precision to catch very close points)
      const key = `${wo.customerLat?.toFixed(6)},${wo.customerLng?.toFixed(6)}`;
      if (!locationsMap[key]) {
        locationsMap[key] = [];
      }
      locationsMap[key].push(wo);
    });

    // Helper for compact time formatting
    const formatTime = (dateStr: string) => {
      if (!dateStr) return '';
      const d = dayjs(dateStr);
      const now = dayjs();
      const diffMins = now.diff(d, 'minute');

      if (diffMins < 60) return `${diffMins}m`;
      const diffHours = now.diff(d, 'hour');
      if (diffHours < 24) return `${diffHours}h`;
      const diffDays = now.diff(d, 'day');
      if (diffDays < 7) return `${diffDays}d`;
      return `${Math.floor(diffDays / 7)}w`;
    };

    // Helper to create a marker
    const createMarker = (wo: WorkOrder, lngLat: [number, number]) => {
      const statusColor = STATUS_COLORS[wo.status || 'Open'] || '#6b7280';
      const priorityColor = PRIORITY_COLORS[wo.priority || 'Medium'] || '#f59e0b';

      // Get data for tooltip
      const vehicle = vehicles.find(v => v.id === wo.vehicleId);
      const licensePlate = vehicle?.license_plate || 'Unknown';
      // Use make + model for full description (e.g. "EV 125")
      const bikeModel = vehicle ? `${vehicle.make} ${vehicle.model}` : '';

      const serviceCenterName = wo.locationId ? locationMap.get(wo.locationId)?.name : 'N/A';
      const address = wo.customerAddress || 'No address';

      // Match logic from EnhancedWorkOrderDataTable for consistency
      const issue = wo.description || serviceCategories?.find(cat => cat.id === wo.service)?.label || wo.service || 'General Service';

      const timeDisplay = formatTime(wo.created_at);

      // Create custom marker element with wrench icon (maintenance)
      const el = document.createElement('div');
      el.className = 'work-order-marker group'; // added group class for hover
      el.innerHTML = `
        <div style="
          width: 28px;
          height: 28px;
          background: ${statusColor};
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 6px rgba(0,0,0,0.25);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s;
        ">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
          </svg>
        </div>
        ${wo.priority === 'Critical' || wo.priority === 'High' ? `
          <div style="
            position: absolute;
            top: -1px;
            right: -1px;
            width: 10px;
            height: 10px;
            background: ${priorityColor};
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 1px 2px rgba(0,0,0,0.2);
          "></div>
        ` : ''}

        <!-- Hover Tooltip -->
        <div class="marker-tooltip" style="
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%) translateY(-8px);
          background: white;
          padding: 8px 12px;
          border-radius: 6px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          width: max-content;
          max-width: 240px;
          font-size: 11px;
          line-height: 1.4;
          z-index: 100;
          display: none;
          pointer-events: none;
          border: 1px solid #e5e7eb;
        ">
           <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
             <div>
               <div style="font-weight: 700; color: #111827;">${licensePlate}</div>
               <div style="font-weight: 500; color: #6b7280; font-size: 10px;">${bikeModel}</div>
             </div>
             <div style="font-weight: 600; color: #4b5563; font-size: 10px; background: #f3f4f6; padding: 1px 4px; rounded: 3px; margin-left: 8px;">${timeDisplay}</div>
           </div>
           
           <div style="color: #4b5563; margin-bottom: 2px; font-weight: 500;">${issue}</div>
           
           <div style="color: #6b7280; font-size: 10px; margin-top: 4px; border-top: 1px solid #f3f4f6; padding-top: 4px;">
             ${address}<br/>
             <span style="color: ${statusColor}; font-weight: 500;">${serviceCenterName}</span>
           </div>
           
           <!-- Arrow -->
           <div style="
             position: absolute;
             bottom: -4px;
             left: 50%;
             transform: translateX(-50%) rotate(45deg);
             width: 8px;
             height: 8px;
             background: white;
             border-right: 1px solid #e5e7eb;
             border-bottom: 1px solid #e5e7eb;
           "></div>
        </div>
      `;

      // Add hover effect logic manually since we are using inline HTML string
      el.addEventListener('mouseenter', () => {
        el.style.zIndex = '50';
        const tooltip = el.querySelector('.marker-tooltip') as HTMLElement;
        if (tooltip) tooltip.style.display = 'block';

        el.querySelector('div')?.setAttribute('style',
          el.querySelector('div')?.getAttribute('style')?.replace('transform: scale(1)', 'transform: scale(1.1)') || ''
        );
      });
      el.addEventListener('mouseleave', () => {
        el.style.zIndex = 'auto';
        const tooltip = el.querySelector('.marker-tooltip') as HTMLElement;
        if (tooltip) tooltip.style.display = 'none';

        el.querySelector('div')?.setAttribute('style',
          el.querySelector('div')?.getAttribute('style')?.replace('transform: scale(1.1)', 'transform: scale(1)') || ''
        );
      });

      const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
        .setLngLat(lngLat)
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
    };

    // Iterate through groups and create markers
    Object.values(locationsMap).forEach(group => {
      if (group.length === 1) {
        // Single item at this location, just place it
        createMarker(group[0], [group[0].customerLng!, group[0].customerLat!]);
      } else {
        // Multiple items, spiral them out
        // Use a small radius for spiral (e.g. 0.0002 degrees ~ 20 meters)
        const radiusStep = 0.0002;

        group.forEach((wo, index) => {
          // Calculate angle: evenly distributed circle
          const angle = (index / group.length) * 2 * Math.PI;

          // Optional: for very large groups, could use increasing radius (spiral)
          // const r = radiusStep * (1 + Math.floor(index / 8)); 
          const r = radiusStep;

          const offsetLng = wo.customerLng! + (Math.cos(angle) * r);
          const offsetLat = wo.customerLat! + (Math.sin(angle) * r);

          createMarker(wo, [offsetLng, offsetLat]);
        });
      }
    });

    // Fit bounds to show all markers
    if (workOrdersWithLocation.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      markersRef.current.forEach(marker => {
        bounds.extend(marker.getLngLat());
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
              <X className="w-6 h-6 text-amber-600" />
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



