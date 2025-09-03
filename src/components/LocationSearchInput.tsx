import { useState, useCallback } from 'react';
import { AutoComplete, Spin } from 'antd';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import debounce from 'lodash.debounce';

interface LocationSearchInputProps {
  onLocationSelect: (location: { lat: number; lng: number; label: string }) => void;
  initialValue?: string;
}

const provider = new OpenStreetMapProvider();

export const LocationSearchInput = ({ onLocationSelect, initialValue }: LocationSearchInputProps) => {
  const [options, setOptions] = useState<{ value: string; data: any }[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (value: string) => {
    if (value) {
      setLoading(true);
      try {
        const results = await provider.search({ query: value });
        const newOptions = results.map((result: any) => ({
          value: result.label,
          data: result,
        }));
        setOptions(newOptions);
      } catch (error) {
        console.error("Geosearch error:", error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    } else {
      setOptions([]);
    }
  };

  const debouncedSearch = useCallback(debounce(handleSearch, 500), []);

  const onSelect = (value: string, option: any) => {
    const { data } = option;
    onLocationSelect({
      lat: data.y,
      lng: data.x,
      label: data.label,
    });
  };

  return (
    <AutoComplete
      options={options}
      onSelect={onSelect}
      onSearch={debouncedSearch}
      placeholder="Type to search for an address..."
      defaultValue={initialValue}
      style={{ width: '100%' }}
      notFoundContent={loading ? <div style={{ textAlign: 'center' }}><Spin size="small" /></div> : null}
      allowClear
    />
  );
};