import React, { useState, useEffect } from 'react';
import { Search, Loader2, Bike, ArrowRight, AlertCircle, CheckCircle, User, Phone, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  const [isLoadingPrefilledVehicle, setIsLoadingPrefilledVehicle] = useState(false);

  // Auto-search if initial license plate is provided
  useEffect(() => {
    if (initialLicensePlate && !selectedVehicle) {
      searchVehicles(initialLicensePlate);
    }
  }, [initialLicensePlate]);

  // Auto-select vehicle if vehicleId is provided in data
  useEffect(() => {
    if (data.vehicleId && !selectedVehicle) {
      setIsLoadingPrefilledVehicle(true);
      // Fetch the vehicle data directly by ID
      const fetchVehicle = async () => {
        try {
          const { data: vehicleData, error } = await supabase
            .from('vehicles')
            .select('*, customers(*)')
            .eq('id', data.vehicleId)
            .single();

          if (error) throw error;
          if (vehicleData) {
            setSelectedVehicle(vehicleData as Vehicle & { customers: Customer });
            setSearchQuery(vehicleData.license_plate || '');
          }
        } catch (error) {
          console.error('❌ Error fetching vehicle:', error);
        } finally {
          setIsLoadingPrefilledVehicle(false);
        }
      };

      fetchVehicle();
    }
  }, [data.vehicleId, selectedVehicle]);

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
      {isLoadingPrefilledVehicle ? (
        /* Loading State for Pre-filled Vehicle */
        <div className="bg-background border border-border rounded-lg p-2.5 shadow-sm animate-pulse">
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
              <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
            </div>
            <div className="flex-1">
              <div className="h-4 bg-muted rounded w-20 mb-1"></div>
              <div className="flex gap-3">
                <div className="h-3 bg-muted rounded w-24"></div>
                <div className="h-3 bg-muted rounded w-20"></div>
                <div className="h-3 bg-muted rounded w-28"></div>
              </div>
            </div>
          </div>
        </div>
      ) : !selectedVehicle ? (
        <div className="relative">
          <Label htmlFor="license-search" className="text-xs font-medium mb-1.5">
            License Plate <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input
              id="license-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter license plate"
              className={`pl-8 ${errors.vehicleId ? 'border-destructive' : ''}`}
              autoFocus
            />
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            {isSearching && (
              <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin" />
            )}
          </div>
          {errors.vehicleId && <p className="text-xs text-destructive mt-0.5">{errors.vehicleId}</p>}

          {/* Search Results Dropdown */}
          {showResults && searchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-80 overflow-y-auto">
              {searchResults.map((vehicle) => (
                <button
                  key={vehicle.id}
                  onClick={() => handleSelectVehicle(vehicle)}
                  className="w-full px-3 py-2 text-left hover:bg-muted border-b border-border last:border-b-0 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bike className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-xs text-foreground">
                        {vehicle.license_plate}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {vehicle.make} {vehicle.model} • {vehicle.customers?.name || 'No owner'}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {showResults && searchResults.length === 0 && !isSearching && searchQuery.length >= 2 && (
            <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-lg shadow-lg p-3 text-center">
              <AlertCircle className="w-6 h-6 mx-auto text-muted-foreground mb-1" />
              <p className="text-xs text-muted-foreground">No vehicles found matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      ) : (
        /* Selected Vehicle Summary - Consistent with App Design */
        <div className="bg-background border border-border rounded-lg p-2.5 shadow-sm relative group">
          <div className="flex justify-between items-start">
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0 border border-emerald-200">
                <CheckCircle className="w-4 h-4 text-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-foreground leading-tight">{selectedVehicle.license_plate}</h3>
                </div>

                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                  <div className="flex items-center gap-1">
                    <Bike className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-foreground font-medium">
                      {selectedVehicle.make} {selectedVehicle.model} <span className="text-muted-foreground font-normal">{selectedVehicle.year}</span>
                    </span>
                  </div>
                  <div className="w-px h-2.5 bg-border self-center hidden sm:block"></div>
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-foreground">{selectedVehicle.customers?.name || 'N/A'}</span>
                  </div>
                  <div className="w-px h-2.5 bg-border self-center hidden sm:block"></div>
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-foreground">{selectedVehicle.customers?.phone || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleClearSelection}
              className="opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10"
              title="Remove vehicle"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Location Picker */}
      <MapboxLocationPicker
        value={data.customerLocation}
        onChange={(location) => onChange({ customerLocation: location })}
        label="Location"
        required
        error={errors.customerLocation}
      />

      {/* Contact Phone */}
      <div>
        <Label htmlFor="contact-phone" className="text-xs font-medium mb-1.5">
          Phone <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Input
            id="contact-phone"
            type="tel"
            value={data.contactPhone}
            onChange={(e) => onChange({ contactPhone: e.target.value })}
            placeholder="+256 XXX XXX XXX"
            className={`pl-8 ${errors.contactPhone ? 'border-destructive' : ''}`}
          />
          <Phone className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        </div>
        {errors.contactPhone && <p className="text-xs text-destructive mt-0.5">{errors.contactPhone}</p>}
      </div>

      {/* Alternate Phone */}
      <div>
        <Label htmlFor="alternate-phone" className="text-xs font-medium mb-1.5">
          Alternate Phone
        </Label>
        <div className="relative">
          <Input
            id="alternate-phone"
            type="tel"
            value={data.alternatePhone}
            onChange={(e) => onChange({ alternatePhone: e.target.value })}
            placeholder="+256 XXX XXX XXX"
            className="pl-8"
          />
          <Phone className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        </div>
      </div>

    </Stack>
  );
};



