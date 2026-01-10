import React, { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Search01Icon, Loading01Icon, Motorbike01Icon, ArrowRight01Icon, AlertCircleIcon, CheckmarkCircle01Icon, UserIcon, Call02Icon, Cancel01Icon } from '@hugeicons/core-free-icons';
import { Stack } from '@/components/tailwind-components';
import { MapboxLocationPicker } from '../MapboxLocationPicker';
import { supabase } from '@/integrations/supabase/client';
import { Customer, Vehicle } from '@/types/supabase';

interface CustomerVehicleStepProps {
  data: any;
  onChange: (updates: any) => void;
  initialLicensePlate?: string;
}

export const CustomerVehicleStep: React.FC<CustomerVehicleStepProps> = ({
  data,
  onChange,

  initialLicensePlate
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedVehicle, setSelectedVehicle] = useState<(Vehicle & { customers: Customer }) | null>(null);
  const [searchQuery, setSearchQuery] = useState(initialLicensePlate || '');
  const [searchResults, setSearchResults] = useState<(Vehicle & { customers: Customer })[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Auto-search if initial license plate is provided
  useEffect(() => {
    if (initialLicensePlate && !selectedVehicle) {
      searchVehicles(initialLicensePlate);
    }
  }, [initialLicensePlate]);

  // Search vehicles by license plate
  const searchVehicles = async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    console.log('🔍 Searching for vehicles with query:', query);

    try {
      const { data: vehicleData, error } = await supabase
        .from('vehicles')
        .select('*, customers(*)')
        .ilike('license_plate', `%${query}%`)
        .order('license_plate', { ascending: true })
        .limit(10);

      console.log('📊 Search results:', vehicleData);
      console.log('❌ Search error:', error);

      if (error) throw error;
      setSearchResults(vehicleData as (Vehicle & { customers: Customer })[]);
      setShowResults(true);
    } catch (error) {
      console.error('❌ Error searching vehicles:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchVehicles(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle vehicle selection
  const handleSelectVehicle = (vehicle: Vehicle & { customers: Customer }) => {
    console.log('✅ Selected vehicle:', vehicle);
    setSelectedVehicle(vehicle);
    setSearchQuery(vehicle.license_plate || '');
    setShowResults(false);

    const customer = vehicle.customers;
    onChange({
      vehicleId: vehicle.id,
      customerId: customer?.id || '',
      contactPhone: customer?.phone || '',
    });
  };

  // Clear selection
  const handleClearSelection = () => {
    setSelectedVehicle(null);
    setSearchQuery('');
    setSearchResults([]);
    onChange({
      vehicleId: '',
      customerId: '',
      contactPhone: '',
    });
  };





  return (
    <Stack gap="sm">
      {/* License Plate Search */}
      {!selectedVehicle ? (
        <div className="relative">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Search License Plate <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Type license plate number..."
              className={`w-full h-7 px-2 py-1 pl-8 text-xs border rounded-md shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-purple-600 focus:border-purple-600 ${errors.vehicleId ? 'border-red-500' : 'border-gray-200'
                }`}
              autoFocus
            />
            <HugeiconsIcon
              icon={Search01Icon}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
              size={14}
            />
            {isSearching && (
              <HugeiconsIcon
                icon={Loading01Icon}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-primary-500 animate-spin"
                size={14}
              />
            )}
          </div>
          {errors.vehicleId && <p className="text-[10px] text-red-600 mt-0.5">{errors.vehicleId}</p>}

          {/* Search Results Dropdown */}
          {showResults && searchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
              {searchResults.map((vehicle) => (
                <button
                  key={vehicle.id}
                  onClick={() => handleSelectVehicle(vehicle)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <HugeiconsIcon icon={Motorbike01Icon} className="text-primary-600" size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-xs text-gray-900">
                        {vehicle.license_plate}
                      </div>
                      <div className="text-[10px] text-gray-600">
                        {vehicle.make} {vehicle.model} • {vehicle.customers?.name || 'No owner'}
                      </div>
                    </div>
                    <HugeiconsIcon icon={ArrowRight01Icon} className="text-gray-400" size={14} />
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {showResults && searchResults.length === 0 && !isSearching && searchQuery.length >= 2 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-center">
              <HugeiconsIcon icon={AlertCircleIcon} className="mx-auto text-gray-400 mb-1" size={24} />
              <p className="text-xs text-gray-600">No vehicles found matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      ) : (
        /* Selected Vehicle Summary - Consistent with App Design */
        <div className="bg-white border border-gray-200 rounded-lg p-2.5 shadow-sm relative group">
          <div className="flex justify-between items-start">
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0 border border-green-100">
                <HugeiconsIcon icon={CheckmarkCircle01Icon} className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-gray-900 leading-tight">{selectedVehicle.license_plate}</h3>
                </div>

                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                  <div className="flex items-center gap-1">
                    <HugeiconsIcon icon={Motorbike01Icon} size={12} className="text-gray-400" />
                    <span className="text-[10px] text-gray-700 font-medium">
                      {selectedVehicle.make} {selectedVehicle.model} <span className="text-gray-400 font-normal">{selectedVehicle.year}</span>
                    </span>
                  </div>
                  <div className="w-px h-2.5 bg-gray-200 self-center hidden sm:block"></div>
                  <div className="flex items-center gap-1">
                    <HugeiconsIcon icon={UserIcon} size={12} className="text-gray-400" />
                    <span className="text-[10px] text-gray-700">{selectedVehicle.customers?.name || 'N/A'}</span>
                  </div>
                  <div className="w-px h-2.5 bg-gray-200 self-center hidden sm:block"></div>
                  <div className="flex items-center gap-1">
                    <HugeiconsIcon icon={Call02Icon} size={12} className="text-gray-400" />
                    <span className="text-[10px] text-gray-700">{selectedVehicle.customers?.phone || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleClearSelection}
              className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all opacity-0 group-hover:opacity-100"
              title="Remove vehicle"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Location Picker */}
      <MapboxLocationPicker
        value={data.customerLocation}
        onChange={(location) => onChange({ customerLocation: location })}
        label="Customer Location"
        required
        error={errors.customerLocation}
      />

      {/* Contact Phone */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Contact Phone <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          value={data.contactPhone}
          onChange={(e) => onChange({ contactPhone: e.target.value })}
          placeholder="+256 XXX XXX XXX"
          className={`w-full h-7 px-2 py-1 text-xs border rounded-md shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-purple-600 focus:border-purple-600 ${errors.contactPhone ? 'border-red-500' : 'border-gray-200'
            }`}
        />
        {errors.contactPhone && <p className="text-[10px] text-red-600 mt-0.5">{errors.contactPhone}</p>}
      </div>

      {/* Alternate Phone */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Alternate Phone (Optional)
        </label>
        <input
          type="tel"
          value={data.alternatePhone}
          onChange={(e) => onChange({ alternatePhone: e.target.value })}
          placeholder="+256 XXX XXX XXX"
          className="w-full h-7 px-2 py-1 text-xs border border-gray-200 rounded-md shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-purple-600 focus:border-purple-600"
        />
      </div>

    </Stack>
  );
};
