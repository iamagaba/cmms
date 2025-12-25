import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import { Stack } from '@/components/tailwind-components';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_APP_MAPBOX_API_KEY || '';

interface LocationData {
  address: string;
  lat: number;
  lng: number;
}

interface MapboxLocationPickerProps {
  value?: LocationData;
  onChange: (location: LocationData) => void;
  label?: string;
  required?: boolean;
  error?: string;
}

export const MapboxLocationPicker: React.FC<MapboxLocationPickerProps> = ({
  value,
  onChange,
  label = 'Customer Location',
  required = false,
  error
}) => {
  const [searchQuery, setSearchQuery] = useState(value?.address || '');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  // Initialize map
  useEffect(() => {
    if (!showMap || !mapContainer.current || map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const initialLat = value?.lat || 0.3476;  // Kampala default
    const initialLng = value?.lng || 32.5825;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [initialLng, initialLat],
      zoom: value ? 15 : 12
    });

    // Add marker
    marker.current = new mapboxgl.Marker({
      draggable: true,
      color: '#2563eb'
    })
      .setLngLat([initialLng, initialLat])
      .addTo(map.current);

    // Handle marker drag
    marker.current.on('dragend', async () => {
      if (!marker.current) return;
      const lngLat = marker.current.getLngLat();

      // Reverse geocode to get address
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lngLat.lng},${lngLat.lat}.json?access_token=${MAPBOX_TOKEN}`
        );
        const data = await response.json();

        if (data.features && data.features.length > 0) {
          const address = data.features[0].place_name;
          setSearchQuery(address);
          onChange({
            address,
            lat: lngLat.lat,
            lng: lngLat.lng
          });
        }
      } catch (error) {
        console.error('Reverse geocoding error:', error);
      }
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [showMap]);

  // Search for addresses
  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    // Debounce search
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
          `access_token=${MAPBOX_TOKEN}&` +
          `country=UG&` + // Uganda
          `limit=5&` +
          `types=address,place,locality`
        );
        const data = await response.json();
        setSuggestions(data.features || []);
      } catch (error) {
        console.error('Geocoding error:', error);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  // Select a suggestion
  const handleSelectSuggestion = (feature: any) => {
    const [lng, lat] = feature.center;
    const address = feature.place_name;

    setSearchQuery(address);
    setSuggestions([]);

    onChange({
      address,
      lat,
      lng
    });

    // Update map if visible
    if (map.current && marker.current) {
      map.current.flyTo({ center: [lng, lat], zoom: 15 });
      marker.current.setLngLat([lng, lat]);
    }
  };

  // Toggle map view
  const toggleMap = () => {
    setShowMap(!showMap);
  };

  return (
    <Stack gap="sm">
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search for address or location..."
            className={`w-full h-9 pl-10 pr-20 py-1.5 text-sm border rounded-md shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-purple-600 focus:border-purple-600 ${error ? 'border-red-500' : 'border-gray-200'
              }`}
          />
          <Icon
            icon="mdi:map-marker"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            width={18}
            height={18}
          />
          {/* Map Toggle Icon */}
          <button
            type="button"
            onClick={toggleMap}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-primary-600 transition-colors rounded"
            title={showMap ? 'Hide map' : 'Show map picker'}
          >
            <Icon
              icon={showMap ? 'mdi:map-marker-off' : 'mdi:map'}
              width={18}
              height={18}
            />
          </button>
          {isSearching && (
            <div className="absolute right-10 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-primary-600 rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
            {suggestions.map((feature) => (
              <button
                key={feature.id}
                onClick={() => handleSelectSuggestion(feature)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-start gap-2">
                  <Icon icon="mdi:map-marker" className="text-primary-600 flex-shrink-0 mt-0.5" width={16} height={16} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {feature.text}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {feature.place_name}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Selected Location Info */}
      {value && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Icon icon="mdi:check-circle" className="text-blue-600 flex-shrink-0 mt-0.5" width={16} height={16} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-blue-900">Location Selected</p>
              <p className="text-xs text-blue-700 mt-1">{value.address}</p>
              <p className="text-xs text-blue-600 mt-1">
                Coordinates: {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      )}



      {/* Map Container */}
      {showMap && (
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <div ref={mapContainer} className="w-full h-64" />
          <div className="bg-gray-50 px-3 py-2 text-xs text-gray-600">
            <Icon icon="mdi:information" className="inline mr-1" width={14} height={14} />
            Drag the marker to adjust the location
          </div>
        </div>
      )}
    </Stack>
  );
};

export default MapboxLocationPicker;
