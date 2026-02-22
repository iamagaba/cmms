import { CheckCircle, Clock, X, Layers, Maximize2, Minimize2 } from 'lucide-react';
import React, { useEffect, useRef, useState, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

import { WorkOrder, Location, Vehicle } from '@/types/supabase';
import { DiagnosticCategoryRow } from '@/types/diagnostic';
import { getWorkOrderNumber } from '@/utils/work-order-display';
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

// Status colors for markers - UNIFIED SYSTEM
const STATUS_COLORS: Record<string, string> = {
  'New': '#64748b',          // slate-500
  'Open': '#cbd5e1',         // slate-300 (lighter for variety)
  'Confirmation': '#94a3b8', // slate-400
  'Ready': '#475569',        // slate-600
  'On Hold': '#f97316',      // orange-500
  'In Progress': '#f59e0b',  // amber-500
  'Completed': '#10b981',    // emerald-500
  'Cancelled': '#6b7280',    // gray-500
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
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isLegendOpen, setIsLegendOpen] = useState(true);

  // Create location lookup map
  const locationMap = useMemo(() => new Map(locations.map(l => [l.id, l])), [locations]);

  // Create vehicle lookup map
  const vehicleMap = useMemo(() => new Map(vehicles.map(v => [v.id, v])), [vehicles]);

  // Create service category lookup map
  const serviceCategoryMap = useMemo(() => new Map(serviceCategories.map(c => [c.id, c])), [serviceCategories]);

  // Filter work orders that have valid coordinates
  const workOrdersWithLocation = useMemo(() => workOrders.filter(wo => {
    const lat = wo.customerLat ?? wo.customer_lat;
    const lng = wo.customerLng ?? wo.customer_lng;
    return lat && lng && !isNaN(lat) && !isNaN(lng);
  }), [workOrders]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11', // Cleaner, more professional style
      center: [32.5825, 0.3476], // Default to Kampala, Uganda
      zoom: 11,
      attributionControl: false,
    });

    map.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right');
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');
    map.current.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right');

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update Source Data
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const geojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: workOrdersWithLocation.map(wo => {
        const lat = wo.customerLat ?? wo.customer_lat;
        const lng = wo.customerLng ?? wo.customer_lng;
        return {
          type: 'Feature',
          properties: {
            id: wo.id,
            status: wo.status,
            priority: wo.priority,
            workOrderNumber: getWorkOrderNumber(wo),
          },
          geometry: {
            type: 'Point',
            coordinates: [lng!, lat!]
          }
        };
      })
    };

    const sourceId = 'work-orders-source';

    if (map.current.getSource(sourceId)) {
      (map.current.getSource(sourceId) as mapboxgl.GeoJSONSource).setData(geojson);
    } else {
      map.current.addSource(sourceId, {
        type: 'geojson',
        data: geojson,
        cluster: true,
        clusterMaxZoom: 14, // Max zoom to cluster points
        clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
      });

      // Add a transparent layer to force Mapbox to process the source features
      // allowing querySourceFeatures to work
      map.current.addLayer({
        id: 'work-orders-layer',
        type: 'circle',
        source: sourceId,
        paint: {
          'circle-radius': 1, // Must be > 0 to be rendered
          'circle-color': 'transparent',
          'circle-opacity': 0
        }
      });
    }

    // Trigger marker update
    updateMarkers();

  }, [workOrdersWithLocation, mapLoaded]);

  // Sync Markers Logic
  const updateMarkers = () => {
    if (!map.current || !map.current.getSource('work-orders-source')) return;

    const features = map.current.querySourceFeatures('work-orders-source');
    const seenIds = new Set<string>();

    features.forEach(feature => {
      const coords = (feature.geometry as any).coordinates;
      const props = feature.properties as any;

      const isCluster = props.cluster;
      const id = isCluster ? `cluster-${props.cluster_id}` : props.id;

      seenIds.add(id);

      // If marker already exists, update position
      if (markersRef.current.has(id)) {
        markersRef.current.get(id)!.setLngLat(coords);
        return;
      }

      // Create new marker
      const el = document.createElement('div');

      if (isCluster) {
        // --- CLUSTER MARKER ---
        const count = props.point_count;
        const size = count < 10 ? 40 : count < 50 ? 50 : 60;

        el.className = 'cluster-marker cursor-pointer transition-transform hover:scale-105 active:scale-95';

        // Exact styling requested: Blue core with concentric semi-transparent rings
        el.innerHTML = `
          <div style="
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            
            /* Core Background */
            background: #2563eb;
            
            /* Text Styling */
            color: white;
            font-weight: 600;
            font-size: ${count < 100 ? '14px' : '12px'};
            
            /* Concentric Rings via Box Shadow */
            box-shadow: 
              0 0 0 6px rgba(37, 99, 235, 0.3),  /* Inner Ring */
              0 0 0 12px rgba(37, 99, 235, 0.15); /* Outer Ring */
          ">
            ${count}
          </div>
        `;

        el.addEventListener('click', () => {
          map.current?.getSource('work-orders-source') &&
            (map.current.getSource('work-orders-source') as any).getClusterExpansionZoom(
              props.cluster_id,
              (err: any, zoom: number) => {
                if (err) return;
                map.current?.easeTo({
                  center: coords,
                  zoom: zoom,
                  duration: 500
                });
              }
            );
        });

      } else {
        // --- INDIVIDUAL WORK ORDER MARKER ---
        const wo = workOrdersWithLocation.find(w => w.id === props.id);
        if (!wo) return;

        const statusColor = STATUS_COLORS[wo.status || 'New'] || '#6b7280';
        const priorityColor = PRIORITY_COLORS[wo.priority || 'Medium'] || '#f59e0b';
        const vehicle = vehicleMap.get(wo.vehicleId!);
        const licensePlate = vehicle?.license_plate || 'Unknown';
        const bikeModel = vehicle ? `${vehicle.make} ${vehicle.model}` : '';
        const serviceCenter = wo.locationId ? locationMap.get(wo.locationId)?.name : 'N/A';
        const address = wo.customerAddress || 'No address';
        const issue = wo.description || serviceCategoryMap.get(wo.service!)?.label || wo.service || 'General Service';
        const timeDisplay = wo.created_at ? dayjs(wo.created_at).fromNow(true) : '';

        // Create HTML structure for marker
        el.className = 'work-order-marker group relative z-10'; // z-10 for base z-index
        el.innerHTML = `
          <div style="
            width: 32px;
            height: 32px;
            background: ${statusColor};
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          ">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
          </div>
          ${wo.priority === 'Critical' || wo.priority === 'High' ? `
            <div class="animate-pulse" style="
              position: absolute;
              top: -2px;
              right: -2px;
              width: 12px;
              height: 12px;
              background: ${priorityColor};
              border: 2px solid white;
              border-radius: 50%;
              box-shadow: 0 1px 2px rgba(0,0,0,0.2);
            "></div>
          ` : ''}

          <!-- Modern Glass Tooltip -->
          <div class="marker-tooltip opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200" style="
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%) translateY(-12px);
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(8px);
            padding: 12px;
            border-radius: 12px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            width: max-content;
            max-width: 260px;
            min-width: 200px;
            border: 1px solid rgba(229, 231, 235, 0.5);
            z-index: 50;
            pointer-events: none;
          ">
             <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 6px;">
               <div>
                 <div style="font-weight: 700; color: #1f2937; font-size: 13px;">${licensePlate}</div>
                 <div style="font-weight: 500; color: #6b7280; font-size: 11px;">${bikeModel}</div>
               </div>
               <div style="
                 font-weight: 600; 
                 color: ${statusColor}; 
                 font-size: 10px; 
                 background: ${statusColor}15; 
                 padding: 2px 6px; 
                 border-radius: 99px;
               ">${wo.status}</div>
             </div>
             
             <div style="color: #374151; font-size: 12px; font-weight: 500; margin-bottom: 8px; line-height: 1.4;">${issue}</div>
             
             <div style="
               display: grid;
               grid-template-columns: 1fr auto;
               gap: 8px;
               padding-top: 8px;
               border-top: 1px solid #f3f4f6;
               font-size: 11px;
             ">
               <div style="color: #6b7280; display: flex; align-items: center; gap: 4px;">
                 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                 <span class="truncate max-w-[120px]">${getAddressShort(address)}</span>
               </div>
               <div style="color: #9ca3af; display: flex; align-items: center; gap: 4px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                ${timeDisplay}
               </div>
             </div>
             
             <!-- Arrow -->
             <div style="
               position: absolute;
               bottom: -5px;
               left: 50%;
               transform: translateX(-50%) rotate(45deg);
               width: 10px;
               height: 10px;
               background: rgba(255, 255, 255, 0.95);
               backdrop-filter: blur(8px);
               border-right: 1px solid rgba(229, 231, 235, 0.5);
               border-bottom: 1px solid rgba(229, 231, 235, 0.5);
             "></div>
          </div>
        `;

        // Z-Index handling on hover
        el.addEventListener('mouseenter', () => { el.style.zIndex = '100'; });
        el.addEventListener('mouseleave', () => { el.style.zIndex = '10'; });

        el.addEventListener('click', (e) => {
          e.stopPropagation(); // Prevent map click
          onWorkOrderClick?.(wo);
        });
      }

      // Add to map
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat(coords)
        .addTo(map.current!);

      markersRef.current.set(id, marker);
    });

    // Remove markers that are no longer visible/existing
    for (const [id, marker] of markersRef.current.entries()) {
      if (!seenIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    }
  };

  // Listen to map events to update markers (clustering changes on zoom/move)
  useEffect(() => {
    if (!map.current) return;

    const mapInstance = map.current;

    // Update markers on various events to sync with cluster state
    mapInstance.on('move', updateMarkers);
    mapInstance.on('moveend', updateMarkers);
    mapInstance.on('zoom', updateMarkers);
    mapInstance.on('sourcedata', (e) => {
      if (e.sourceId === 'work-orders-source' && e.isSourceLoaded) {
        updateMarkers();
      }
    });

    return () => {
      mapInstance.off('move', updateMarkers);
      mapInstance.off('moveend', updateMarkers);
      mapInstance.off('zoom', updateMarkers);
    };
  }, [map.current, mapLoaded]); // Re-bind if map instance changes (it shouldn't) but definitely when loaded


  // Helper to shorten address
  const getAddressShort = (addr: string) => {
    if (!addr) return 'Unknown';
    return addr.split(',')[0].substring(0, 20) + (addr.length > 20 ? '...' : '');
  };

  return (
    <div className={`relative h-full w-full overflow-hidden rounded-xl border border-border shadow-sm bg-background ${className}`}>
      {/* Map Container */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* Modern Glass Stats Overlay */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-white/90 backdrop-blur-md border border-white/20 shadow-lg rounded-2xl p-4 min-w-[180px] transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Layers className="w-4 h-4 text-primary" />
            </div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
              {workOrdersWithLocation.length}
            </span>
            <span className="text-xs text-muted-foreground font-medium">on map</span>
          </div>
          <div className="mt-2 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full"
              style={{ width: `${Math.min((workOrdersWithLocation.length / (workOrders.length || 1)) * 100, 100)}%` }}
            ></div>
          </div>
          <div className="mt-1 text-[10px] text-muted-foreground text-right">
            {Math.round((workOrdersWithLocation.length / (workOrders.length || 1)) * 100)}% coverage
          </div>
        </div>
      </div>

      {/* Modern Glass Legend */}
      <div className={`absolute bottom-8 right-4 z-10 flex flex-col items-end transition-all duration-300 ${isLegendOpen ? 'translate-y-0' : 'translate-y-[calc(100%-48px)]'}`}>
        {/* Toggle Button */}
        <button
          onClick={() => setIsLegendOpen(!isLegendOpen)}
          className="mb-2 p-2 bg-white/90 backdrop-blur-md rounded-full shadow-md border border-gray-200 hover:bg-white transition-colors"
        >
          {isLegendOpen ? <Minimize2 className="w-4 h-4 text-gray-600" /> : <Maximize2 className="w-4 h-4 text-gray-600" />}
        </button>

        {/* Legend Content */}
        <div className={`bg-white/95 backdrop-blur-md border border-gray-200/50 shadow-xl rounded-2xl p-4 min-w-[200px] transition-all duration-300 origin-bottom-right ${isLegendOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none absolute'}`}>
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
            <span className="text-xs font-bold text-gray-800">Status Legend</span>
            <span className="text-[10px] text-gray-400">Live</span>
          </div>
          <div className="space-y-2">
            {Object.entries(STATUS_COLORS).map(([status, color]) => (
              <div key={status} className="flex items-center justify-between group cursor-default">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full ring-2 ring-white shadow-sm transition-transform group-hover:scale-125"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs text-gray-600 font-medium">{status}</span>
                </div>
                <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded-md">
                  {workOrders.filter(w => w.status === status).length}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* No location warning toast (centered bottom) */}
      {workOrders.length > 0 && workOrdersWithLocation.length === 0 && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="bg-white/95 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-amber-100 flex flex-col items-center text-center max-w-xs animate-in fade-in zoom-in duration-300">
            <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mb-3 ring-4 ring-amber-50/50">
              <X className="w-6 h-6 text-amber-500" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 mb-1">No Location Data Found</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              None of the current work orders have valid GPS coordinates. Locations are captured when customers report issues.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkOrdersMap;
