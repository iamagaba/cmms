import { Map as MapIcon } from 'lucide-react';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { WorkOrder } from '@/types/supabase';


import 'leaflet/dist/leaflet.css';

// Fix for default marker icons not showing in React Leaflet
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom hook to fit bounds
const MapBounds = ({ locations }: { locations: [number, number][] }) => {
    const map = useMap();
    useEffect(() => {
        if (locations.length > 0) {
            const bounds = L.latLngBounds(locations);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [locations, map]);
    return null;
};

interface WorkOrderMapWidgetProps {
    workOrders: WorkOrder[];
    isDarkMode?: boolean;
}

export const WorkOrderMapWidget = ({ workOrders, isDarkMode = true }: WorkOrderMapWidgetProps) => {
    // Filter orders with valid coordinates and active status
    const mapOrders = workOrders.filter(
        wo =>
            (wo.status === 'New' || wo.status === 'In Progress' || wo.status === 'Ready') &&
            wo.customerLat &&
            wo.customerLng
    );

    // Default center (Kampala roughly) or average of points
    const defaultCenter: [number, number] = [0.3476, 32.5825];

    return (
        <div className="h-full w-full rounded-2xl overflow-hidden relative z-0">
            <MapContainer
                center={defaultCenter}
                zoom={12}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
                attributionControl={false}
            >
                {/* Tile Layer - Dark or Light */}
                <TileLayer
                    url={isDarkMode
                        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                        : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
                    }
                />

                {mapOrders.map(wo => (
                    <Marker
                        key={wo.id}
                        position={[wo.customerLat!, wo.customerLng!]}
                    >
                        <Popup>
                            <div className="p-1 min-w-[150px]">
                                <div className="font-bold text-sm mb-1">#{wo.workOrderNumber}</div>
                                <div className="text-xs text-muted-foreground mb-2">{wo.service || wo.title}</div>
                                <div className={`inline-block px-2 py-0.5 text-xs font-bold rounded uppercase ${wo.status === 'In Progress' ? 'bg-primary-100 text-primary-700' : 'bg-neutral-100 text-muted-foreground'
                                    }`}>
                                    {wo.status}
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                <MapBounds locations={mapOrders.map(wo => [wo.customerLat!, wo.customerLng!])} />
            </MapContainer>

            {/* Overlay Title */}
            <div className="absolute top-4 left-4 z-[400] bg-white/90 dark:bg-neutral-900/90 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center gap-2">
                    <MapIcon className="w-4 h-4 text-primary-500" />
                    <span className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">Field Operations</span>
                    <span className="ml-1 bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300 text-xs px-1.5 rounded-full font-mono">
                        {mapOrders.length}
                    </span>
                </div>
            </div>
        </div>
    );
};





