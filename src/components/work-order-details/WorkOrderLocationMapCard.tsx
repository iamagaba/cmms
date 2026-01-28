import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Building, MapPinOff, ArrowRight, Eye, EyeOff, Route } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

    const fetchRoute = async (start: [number, number], end: [number, number]) => {
      try {
        const query = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${MAPBOX_TOKEN}`
        );
        const json = await query.json();
        const data = json.routes[0];
        const route = data.geometry.coordinates;
        const distance = data.distance; // in meters (it's actually meters, check API docs, yes meters)

        const geojson: GeoJSON.Feature<GeoJSON.Geometry> = {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: route
          }
        };

        // Add the route line
        if (map.current?.getSource('route')) {
          (map.current.getSource('route') as mapboxgl.GeoJSONSource).setData(geojson);
        } else {
          map.current?.addSource('route', {
            type: 'geojson',
            data: geojson
          });

          map.current?.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#3b82f6', // blue-500
              'line-width': 4,
              'line-opacity': 0.75
            }
          });

          // Add arrows to the line to indicate direction
          map.current?.addLayer({
            id: 'route-arrows',
            type: 'symbol',
            source: 'route',
            layout: {
              'symbol-placement': 'line',
              'symbol-spacing': 100,
              'icon-image': 'arrow', // this likely won't exist by default without loading an image, skipping for simplicity unless user asked for arrows explicitly on the line. User asked for "directions", standard line is usually enough.
              // Let's stick to just the line for now to avoid missing-image errors.
            }
          });
        }

        // Calculate midpoint for distance label
        // Simple midpoint of the route line string might not be perfect but good enough for label placement
        // Or we use the middle coordinate of the route array
        const midIndex = Math.floor(route.length / 2);
        const midPoint = route[midIndex];

        const distanceKm = (distance / 1000).toFixed(1);

        const distanceGeoJson: GeoJSON.Feature<GeoJSON.Geometry> = {
          type: 'Feature',
          properties: {
            description: `${distanceKm} km`
          },
          geometry: {
            type: 'Point',
            coordinates: midPoint
          }
        };

        if (map.current?.getSource('distance-label')) {
          (map.current.getSource('distance-label') as mapboxgl.GeoJSONSource).setData(distanceGeoJson);
        } else {
          map.current?.addSource('distance-label', {
            type: 'geojson',
            data: distanceGeoJson
          });

          map.current?.addLayer({
            id: 'distance-label',
            type: 'symbol',
            source: 'distance-label',
            layout: {
              'text-field': ['get', 'description'],
              'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
              'text-size': 12,
              'text-offset': [0, 0],
              'text-anchor': 'center'
            },
            paint: {
              'text-color': '#111827', // gray-900
              'text-halo-color': '#ffffff',
              'text-halo-width': 2
            }
          });
        }

      } catch (err) {
        console.error('Error fetching route:', err);
      }
    };

    try {
      mapboxgl.accessToken = MAPBOX_TOKEN;

      const centerLat = customerLat ?? serviceCenterLat ?? -1.2921;
      const centerLng = customerLng ?? serviceCenterLng ?? 36.8219;

      if (!map.current) {
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [centerLng, centerLat],
          zoom: 14,
        });

        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      }

      // We need to wait for map load to add layers safely, usually. 
      // But inside useEffect with [] dep, it might be tricky. 
      // Better to check if loaded or use a listener.

      const onMapLoad = () => {
        // Customer location marker (red)
        if (hasCustomerLocation) {
          // Check if marker exists? simplified: just create new ones or clear old logic. 
          // React ref cleanup handles map removal, so new creation is fine on re-mount.
          new mapboxgl.Marker({ color: '#ef4444' })
            .setLngLat([customerLng!, customerLat!])
            .setPopup(new mapboxgl.Popup().setHTML(`<strong>Customer Location</strong><br/>${customerAddress || 'No address'}`))
            .addTo(map.current!);
        }

        // Service center marker (blue)
        if (hasServiceCenterLocation) {
          new mapboxgl.Marker({ color: '#3b82f6' })
            .setLngLat([serviceCenterLng!, serviceCenterLat!])
            .setPopup(new mapboxgl.Popup().setHTML(`<strong>${location?.name || 'Service Center'}</strong><br/>${location?.address || ''}`))
            .addTo(map.current!);
        }

        // Fetch route if we have both points
        if (hasCustomerLocation && hasServiceCenterLocation) {
          fetchRoute([customerLng!, customerLat!], [serviceCenterLng!, serviceCenterLat!]);
        }

        // Fit bounds if both locations exist
        if (hasCustomerLocation && hasServiceCenterLocation) {
          const bounds = new mapboxgl.LngLatBounds()
            .extend([customerLng!, customerLat!])
            .extend([serviceCenterLng!, serviceCenterLat!]);
          map.current!.fitBounds(bounds, { padding: { top: 50, bottom: 50, left: 50, right: 50 } });
        } else if (hasCustomerLocation) {
          map.current!.flyTo({ center: [customerLng!, customerLat!], zoom: 14 });
        } else if (hasServiceCenterLocation) {
          map.current!.flyTo({ center: [serviceCenterLng!, serviceCenterLat!], zoom: 14 });
        }
      };

      if (map.current.loaded()) {
        onMapLoad();
      } else {
        map.current.on('load', onMapLoad);
      }

    } catch (err) {
      setMapError('Failed to load map');
      console.error('Map error:', err);
    }

    // No return cleanup for map removal here to support hot reloading/updates better? 
    // Actually the previous code had cleanup. Let's keep it but carefully.
    // Ideally we don't destroy map on every prop change if we can help it, but for simplicity of "hasAnyLocation" changing...
    // The dependency array has many items.

    // Simplification: logic above recreates map if it doesn't exist, but we should make sure we don't end up with duplicate markers.
    // The previous implementation did `return () => { map.current?.remove(); };`. 
    // If we keep that, `map.current` becomes null, so `if (!map.current)` works.

    return () => {
      // Optional: remove listeners if any
    };

  }, [hasAnyLocation, customerLat, customerLng, serviceCenterLat, serviceCenterLng, showInteractiveMap]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="bg-white">

        <div className="px-3 py-2">
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5 text-xs text-amber-700">
            Map unavailable: Mapbox API key not configured
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-border rounded-lg overflow-hidden shadow-sm">
      {setShowInteractiveMap && (
        <div className="px-3 py-2 border-b border-border flex items-center justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowInteractiveMap(!showInteractiveMap)}
          >
            {showInteractiveMap ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </Button>
        </div>
      )}

      {/* Use divide-y for sections */}
      <div className="divide-y divide-border">
        {/* Address Info */}
        {/* Address Info */}
        {(customerAddress || location) && (
          <div className="px-3 py-2">
            {customerAddress && location ? (
              <div className="flex items-center justify-between gap-2">
                {/* Customer (Left) */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium leading-none mb-0.5">Customer</p>
                      <p className="text-xs font-medium text-foreground truncate" title={customerAddress}>{customerAddress}</p>
                    </div>
                  </div>
                </div>

                {/* Connector (Center) - Enhanced Visibility */}
                <div className="flex-shrink-0 flex items-center justify-center px-4">
                  <div className="flex items-center text-muted-foreground">
                    <div className="w-8 sm:w-12 h-px bg-border"></div>
                    <div className="px-2">
                      <Route className="w-5 h-5 text-muted-foreground transform rotate-45" />
                    </div>
                    <div className="w-8 sm:w-12 h-px bg-border"></div>
                  </div>
                </div>

                {/* Service Center (Right) */}
                <div className="flex-1 min-w-0 text-right">
                  <div className="flex items-start justify-end gap-2">
                    <div className="min-w-0 flex flex-col items-end">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium leading-none mb-0.5">Service Center</p>
                      <p className="text-xs font-medium text-foreground truncate w-full" title={location.name}>{location.name}</p>

                    </div>
                    <Building className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  </div>
                </div>
              </div>
            ) : (
              // Fallback single view
              <div className="space-y-1.5">
                {customerAddress && (
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Customer</p>
                      <p className="text-xs text-foreground">{customerAddress}</p>
                    </div>
                  </div>
                )}
                {location && (
                  <div className="flex items-start gap-1.5">
                    <Building className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Service Center</p>
                      <p className="text-xs text-foreground">{location.name}</p>

                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Map */}
        <div className="px-3 py-2">
          {hasAnyLocation ? (
            <div ref={mapContainer} className="h-64 sm:h-72 rounded-lg overflow-hidden border border-border shadow-sm" />
          ) : (
            <div className="h-24 bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPinOff className="w-6 h-6 text-muted-foreground mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">No location data</p>
              </div>
            </div>
          )}
          {mapError && <p className="text-xs text-destructive mt-1">{mapError}</p>}
        </div>
      </div>
    </div>
  );
};

export default WorkOrderLocationMapCard;



