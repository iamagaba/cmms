import React, { useState, useEffect, useMemo } from 'react';
import { Input, List, Typography, Spin } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import debounce from 'lodash.debounce';

const { Text } = Typography;

interface OSMLocationSearchInputProps {
  onLocationSelect: (data: { lat: number; lng: number; label: string }) => void;
  initialValue?: string;
}

export const OSMLocationSearchInput = ({ onLocationSelect, initialValue = '' }: OSMLocationSearchInputProps) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const provider = useMemo(() => new OpenStreetMapProvider({
    params: {
      countrycodes: 'ug', // Filter results to Uganda
      'accept-language': 'en',
    },
  }), []);

  const performSearch = useMemo(
    () =>
      debounce(async (query: string) => {
        if (query.length < 3) {
          setResults([]);
          setLoading(false);
          return;
        }
        setLoading(true);
        try {
          const searchResults = await provider.search({ query });
          setResults(searchResults);
        } catch (error) {
          console.error('Geocoding error:', error);
          setResults([]);
        } finally {
          setLoading(false);
        }
      }, 300),
    [provider]
  );

  useEffect(() => {
    if (searchTerm && searchTerm.length >= 3) {
      performSearch(searchTerm);
    } else {
      setResults([]);
    }
  }, [searchTerm, performSearch]);

  const handleSelect = (result: any) => {
    setSearchTerm(result.label);
    onLocationSelect({ lat: result.y, lng: result.x, label: result.label });
    setResults([]); // Clear results after selection
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <Input
        placeholder="Search for an address in Uganda"
        prefix={<SearchOutlined />}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        allowClear
      />
      {loading && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10, backgroundColor: 'white', border: '1px solid #d9d9d9', borderTop: 'none', borderRadius: '0 0 4px 4px', padding: '8px', textAlign: 'center' }}>
          <Spin size="small" />
        </div>
      )}
      {results.length > 0 && !loading && (
        <List
          size="small"
          bordered
          dataSource={results}
          renderItem={(item) => (
            <List.Item
              onClick={() => handleSelect(item)}
              style={{ cursor: 'pointer' }}
              className="hover:bg-gray-100"
            >
              <Text>{item.label}</Text>
            </List.Item>
          )}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 10,
            backgroundColor: 'white',
            border: '1px solid #d9d9d9',
            borderTop: 'none',
            borderRadius: '0 0 4px 4px',
            maxHeight: '300px',
            overflowY: 'auto',
          }}
        />
      )}
    </div>
  );
};