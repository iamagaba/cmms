import React, { useState, useEffect, useRef } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Location01Icon, MapsIcon, CheckmarkCircle01Icon, InformationCircleIcon } from '@hugeicons/core-free-icons';
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
    <Stack gap="xs">
      {/* Label */}
      {label && (
        <label className="block text-xs font-medium text-gray-700">
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
            className={`w-full h-7 pl-8 pr-16 py-1 text-xs border rounded-md shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-purple-600 focus:border-purple-600 ${error ? 'border-red-500' : 'border-gray-200'
              }`}
          />
          <HugeiconsIcon
            icon={Location01Icon}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
            size={14}
          />
          {/* Map Toggle Icon */}
          <button
            type="button"
            onClick={toggleMap}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-primary-600 transition-colors rounded"
            title={showMap ? 'Hide map' : 'Show map picker'}
          >
            <HugeiconsIcon
              icon={MapsIcon}
              size={14}
            />
          </button>
          {isSearching && (
            <div className="absolute right-8 top-1/2 -translate-y-1/2">
              <div className="w-3 h-3 border-2 border-gray-300 border-t-primary-600 rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto">
            {suggestions.map((feature) => (
              <button
                key={feature.id}
                onClick={() => handleSelectSuggestion(feature)}
                className="w-full text-left px-2.5 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-start gap-1.5">
                  <HugeiconsIcon icon={Location01Icon} className="text-primary-600 flex-shrink-0 mt-0.5" size={12} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-900 truncate">
                      {feature.text}
                    </div>
                    <div className="text-[10px] text-gray-500 truncate">
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
        <p className="text-[10px] text-red-600">{error}</p>
      )}

      {/* Selected Location Info */}
      {value && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
          <div className="flex items-start gap-1.5">
            <HugeiconsIcon icon={CheckmarkCircle01Icon} className="text-blue-600 flex-shrink-0 mt-0.5" size={12} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-blue-900">Location Selected</p>
              <p className="text-[10px] text-blue-700 mt-0.5">{value.address}</p>
              <p className="text-[10px] text-blue-600 mt-0.5">
                Coordinates: {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      )}



      {/* Map Container */}
      {showMap && (
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <div ref={mapContainer} className="w-full h-48" />
          <div className="bg-gray-50 px-2 py-1.5 text-[10px] text-gray-600">
            <HugeiconsIcon icon={InformationCircleIcon} className="inline mr-0.5" size={12} />
            Drag the marker to adjust the location
          </div>
        </div>
      )}
    </Stack>
  );
};

export default MapboxLocationPicker;
