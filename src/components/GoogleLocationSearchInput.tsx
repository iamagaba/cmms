import React, { useRef } from 'react';
import { Input } from 'antd';
import { Autocomplete } from '@react-google-maps/api';

interface GoogleLocationSearchInputProps {
  onLocationSelect: (location: { lat: number; lng: number; label: string }) => void;
  initialValue?: string;
}

export const GoogleLocationSearchInput = ({ onLocationSelect, initialValue }: GoogleLocationSearchInputProps) => {
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const onLoad = (autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry && place.geometry.location && place.formatted_address) {
        onLocationSelect({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          label: place.formatted_address,
        });
      }
    }
  };

  return (
    <Autocomplete
      onLoad={onLoad}
      onPlaceChanged={onPlaceChanged}
      fields={["geometry", "formatted_address"]}
    >
      <Input
        placeholder="Type to search for an address..."
        defaultValue={initialValue}
        style={{ width: '100%' }}
      />
    </Autocomplete>
  );
};