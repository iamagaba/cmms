import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowDown, X, ArrowUp, AlertCircle } from 'lucide-react';
import { Stack } from '@/components/tailwind-components';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Location } from '@/types/supabase';

interface AdditionalDetailsStepProps {
  data: {
    priority: 'low' | 'medium' | 'high' | 'urgent';
    serviceLocationId: string;
    scheduledDate: string;
    customerNotes: string;
    customerLocation?: { lat: number; lng: number } | null;
  };
  onChange: (updates: any) => void;
}
export const AdditionalDetailsStep: React.FC<AdditionalDetailsStepProps> = ({
  data,
  onChange
}) => {
  // Track validation errors (currently not used since sticky footer handles validation)
  const errors: Record<string, string> = {};

  // Fetch service locations
  const { data: locations } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return data as Location[];
    }
  });

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Auto-populate nearest service center when customer location changes
  useEffect(() => {
    if (data.customerLocation && locations && locations.length > 0) {
      const { lat, lng } = data.customerLocation;

      // Calculate distances to all service centers
      const locationsWithDistance = locations
        .filter(location => location.lat && location.lng)
        .map(location => ({
          ...location,
          distance: calculateDistance(lat, lng, location.lat!, location.lng!)
        }));

      if (locationsWithDistance.length > 0) {
        // Find the nearest one
        const nearest = locationsWithDistance.reduce((prev, curr) =>
          curr.distance < prev.distance ? curr : prev
        );

        // Auto-select if not already set or if current selection is far
        if (!data.serviceLocationId) {
          onChange({ serviceLocationId: nearest.id });
        }
      }
    }
  }, [data.customerLocation, locations]);

  const priorities = [
    { value: 'low', label: 'Low', color: 'bg-muted text-foreground', icon: ArrowDown },
    { value: 'medium', label: 'Medium', color: 'bg-amber-50 text-amber-700', icon: X },
    { value: 'high', label: 'High', color: 'bg-amber-50 text-amber-700', icon: ArrowUp },
    { value: 'urgent', label: 'Urgent', color: 'bg-destructive/10 text-destructive', icon: AlertCircle }
  ];



  return (
    <Stack gap="sm">
      {/* Priority Selection */}
      <div>
        <Label className="text-xs font-medium mb-1.5">
          Priority <span className="text-destructive">*</span>
        </Label>
        <div className="flex flex-wrap gap-1.5">
          {priorities.map((priority) => {
            const Icon = priority.icon;
            return (
              <button
                key={priority.value}
                onClick={() => onChange({ priority: priority.value })}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all ${
                  data.priority === priority.value
                    ? `${priority.color} ring-2 ring-offset-1 ring-current`
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <Icon className="w-4 h-4" />
                {priority.label}
              </button>
            );
          })}
        </div>
        {errors.priority && <p className="text-xs text-destructive mt-0.5">{errors.priority}</p>}
      </div>

      {/* Service Location */}
      <div>
        <Label htmlFor="service-location" className="text-xs font-medium mb-1.5">
          Service Location <span className="text-destructive">*</span>
        </Label>
        <Select value={data.serviceLocationId} onValueChange={(value) => onChange({ serviceLocationId: value })}>
          <SelectTrigger id="service-location" className={errors.serviceLocationId ? 'border-destructive' : ''}>
            <SelectValue placeholder="Select location" />
          </SelectTrigger>
          <SelectContent>
            {locations?.map(l => (
              <SelectItem key={l.id} value={l.id}>
                {l.name} - {l.address}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.serviceLocationId && <p className="text-xs text-destructive mt-0.5">{errors.serviceLocationId}</p>}
      </div>

      {/* Scheduled Date (Optional) */}
      <div>
        <Label htmlFor="scheduled-date" className="text-xs font-medium mb-1.5">
          Scheduled Date (Optional)
        </Label>
        <Input
          id="scheduled-date"
          type="datetime-local"
          value={data.scheduledDate}
          onChange={(e) => onChange({ scheduledDate: e.target.value })}
        />
        <p className="text-xs text-muted-foreground mt-0.5">
          Leave empty for immediate service
        </p>
      </div>

      {/* Customer Notes */}
      <div>
        <Label htmlFor="customer-notes" className="text-xs font-medium mb-1.5">
          Additional Notes (Optional)
        </Label>
        <Textarea
          id="customer-notes"
          value={data.customerNotes}
          onChange={(e) => onChange({ customerNotes: e.target.value })}
          placeholder="Additional notes"
          rows={3}
        />
      </div>
    </Stack>
  );
};



