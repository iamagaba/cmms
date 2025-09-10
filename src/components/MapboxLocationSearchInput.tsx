import React, { useState, useMemo } from 'react';
import { AutoComplete, Spin } from 'antd';
import debounce from 'lodash.debounce';

const MAPBOX_API_KEY = import.meta.env.VITE_APP_MAPBOX_API_KEY;

interface MapboxLocationSearchInputProps {
  onLocationSelect: (location: { lat: number; lng: number; label: string }) => void;
  initialValue?: string;
}

interface MapboxFeature {
  place_name: string;
  center: [number, number]; // [lng, lat]
}

interface OptionType {
  value: string;
  label: string;
  feature: MapboxFeature;
}

export const MapboxLocationSearchInput = ({ onLocationSelect, initialValue }: MapboxLocationSearchInputProps) => {
  const [options, setOptions] = useState<OptionType[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSuggestions = async (searchText: string) => {
    if (!searchText || !MAPBOX_API_KEY) {
      setOptions([]);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          searchText
        )}.json?access_token=${MAPBOX_API_KEY}&autocomplete=true`
      );
      const data = await response.json();
      const newOptions = (data.features || []).map((feature: MapboxFeature) => ({
        value: feature.place_name,
        label: feature.place_name,
        feature,
      }));
      setOptions(newOptions);
    } catch (error) {
      console.error('Error fetching Mapbox suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetch = useMemo(() => debounce(fetchSuggestions, 300), []);

  const handleSelect = (value: string, option: OptionType) => {
    onLocationSelect({
      label: option.feature.place_name,
      lng: option.feature.center[0],
      lat: option.feature.center[1],
    });
  };

  if (!MAPBOX_API_KEY) {
    return (
      <AutoComplete
        placeholder="Mapbox API Key not configured. Cannot search."
        defaultValue={initialValue}
        style={{ width: '100%' }}
        disabled
      />
    );
  }

  return (
    <AutoComplete
      options={options}
      onSearch={debouncedFetch}
      onSelect={handleSelect}
      defaultValue={initialValue}
      placeholder="Type to search for an address..."
      style={{ width: '100%' }}
      notFoundContent={loading ? <Spin size="small" /> : null}
    />
  );
};