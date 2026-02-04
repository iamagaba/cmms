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
    <div className="space-y-4">
      {/* License Plate Search - "Hero" Field */}
      <div className="bg-background rounded-lg border border-border/60 shadow-sm p-1">
        {isLoadingPrefilledVehicle ? (
          /* Loading State */
          <div className="flex gap-3 p-3">
            <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center animate-pulse">
              <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
            </div>
            <div className="space-y-2 flex-1 pt-1">
              <div className="h-4 bg-muted rounded w-1/3 animate-pulse"></div>
              <div className="h-3 bg-muted rounded w-1/2 animate-pulse"></div>
            </div>
          </div>
        ) : !selectedVehicle ? (
          <div className="relative group">
            <div className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Search className="w-4 h-4" />
            </div>
            <Input
              id="license-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter license plate"
              className={`pl-9 ${errors.vehicleId ? 'border-destructive' : ''}`}
              autoFocus
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
              </div>
            )}

            {/* Search Results Dropdown - Bespoke Style */}
            {showResults && searchResults.length > 0 && (
              <div className="absolute z-20 w-[calc(100%+2px)] -left-[1px] top-full mt-2 bg-popover/95 backdrop-blur-sm border border-border/60 rounded-lg shadow-xl overflow-hidden animate-accordion-down">
                {searchResults.map((vehicle) => (
                  <button
                    key={vehicle.id}
                    onClick={() => handleSelectVehicle(vehicle)}
                    className="w-full px-4 py-3 text-left hover:bg-primary/5 border-b border-border/40 last:border-0 transition-colors flex items-center gap-3 group/item"
                  >
                    <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover/item:bg-primary/20 transition-colors">
                      <Bike className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-mono font-bold text-sm text-foreground tracking-wide">
                        {vehicle.license_plate}
                      </div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                        {vehicle.make} {vehicle.model} • {vehicle.customers?.name || 'No Owner'}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground/50 opacity-0 group-hover/item:opacity-100 -translate-x-2 group-hover/item:translate-x-0 transition-all" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Selected Vehicle Summary - Restored Icon Style with Green Theme */
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-2.5 relative group">
            <div className="flex justify-between items-start">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0 border border-emerald-500/20">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground leading-tight">{selectedVehicle.license_plate}</h3>

                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-muted-foreground font-medium">
                    <span className="flex items-center gap-1.5">
                      <Bike className="w-3.5 h-3.5" />
                      {selectedVehicle.make} {selectedVehicle.model} <span className="opacity-70 font-normal">{selectedVehicle.year}</span>
                    </span>
                    <span className="w-1 h-1 bg-muted-foreground/30 rounded-full self-center hidden sm:block" />
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      {selectedVehicle.customers?.name || 'N/A'}
                    </span>
                    <span className="w-1 h-1 bg-muted-foreground/30 rounded-full self-center hidden sm:block" />
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" />
                      {selectedVehicle.customers?.phone || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearSelection}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full w-8 h-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-4">
        {/* Location - Full Width */}
        <div className="relative">
          <MapboxLocationPicker
            value={data.customerLocation}
            onChange={(location) => onChange({ customerLocation: location })}
            label="Service Location"
            required
            error={errors.customerLocation}
          />
        </div>

        {/* Phones - Broken Layout (Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="group">
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

          <div className="group">
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
        </div>
      </div>
    </div>
  );
};



