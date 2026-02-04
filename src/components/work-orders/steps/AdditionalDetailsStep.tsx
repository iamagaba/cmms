import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowDown, X, ArrowUp, AlertCircle, MapPin, Calendar, FileText } from 'lucide-react';
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
    <div className="space-y-6">
      {/* Priority Selection - "Radio Card" Style */}
      <div className="space-y-3">
        <Label className="text-xs font-medium ml-1 text-muted-foreground uppercase tracking-wider">
          Service Priority <span className="text-destructive">*</span>
        </Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {priorities.map((priority) => {
            const Icon = priority.icon;
            const isSelected = data.priority === priority.value;
            return (
              <button
                key={priority.value}
                onClick={() => onChange({ priority: priority.value })}
                className={`relative flex items-center justify-center gap-2 p-2 rounded-lg border transition-all duration-200 ${isSelected
                  ? `bg-background border-${priority.value === 'urgent' ? 'destructive' : priority.value === 'high' ? 'amber-500' : priority.value === 'medium' ? 'primary' : 'slate-500'} shadow-sm`
                  : 'bg-muted/20 border-transparent hover:bg-muted/40 hover:border-border/50'
                  }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${isSelected
                  ? `bg-${priority.value === 'urgent' ? 'destructive' : priority.value === 'high' ? 'amber-500' : priority.value === 'medium' ? 'primary' : 'slate-500'}/10`
                  : 'bg-muted'
                  }`}>
                  <Icon className={`w-3 h-3 ${priority.value === 'urgent' ? 'text-destructive' :
                    priority.value === 'high' ? 'text-amber-500' :
                      priority.value === 'medium' ? 'text-primary' :
                        'text-slate-500'
                    }`} />
                </div>
                <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${isSelected ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                  {priority.label}
                </span>
              </button>
            );
          })}
        </div>
        {errors.priority && <p className="text-xs text-destructive mt-0.5">{errors.priority}</p>}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Service Location */}
        <div className="space-y-2">
          <Label htmlFor="service-location" className="text-xs font-medium text-muted-foreground uppercase tracking-wider ml-1">
            Service Location <span className="text-destructive">*</span>
          </Label>
          <div className="relative group">
            <div className="absolute left-3 top-2.5 pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
              <MapPin className="w-4 h-4" />
            </div>
            <Select value={data.serviceLocationId} onValueChange={(value) => onChange({ serviceLocationId: value })}>
              <SelectTrigger
                id="service-location"
                className={`pl-10 transition-all duration-200 focus:ring-4 focus:ring-primary/10 focus:border-primary ${errors.serviceLocationId ? 'border-destructive' : 'hover:border-primary/50'}`}
              >
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
          </div>
          {errors.serviceLocationId && <p className="text-xs text-destructive mt-0.5">{errors.serviceLocationId}</p>}
        </div>

        {/* Scheduled Date (Optional) */}
        <div className="space-y-2">
          <Label htmlFor="scheduled-date" className="text-xs font-medium text-muted-foreground uppercase tracking-wider ml-1">
            Scheduled Date (Optional)
          </Label>
          <div className="relative group">
            <div className="absolute left-3 top-2.5 pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
              <Calendar className="w-4 h-4" />
            </div>
            <Input
              id="scheduled-date"
              type="datetime-local"
              value={data.scheduledDate}
              onChange={(e) => onChange({ scheduledDate: e.target.value })}
              onClick={(e) => e.currentTarget.showPicker()}
              className="pl-10 transition-all duration-200 focus:ring-4 focus:ring-primary/10 focus:border-primary hover:border-primary/50 [&::-webkit-calendar-picker-indicator]:hidden cursor-pointer"
            />
          </div>
          <p className="text-[10px] text-muted-foreground ml-1">
            Leave empty for immediate service
          </p>
        </div>
      </div>

      {/* Customer Notes */}
      <div className="space-y-2">
        <Label htmlFor="customer-notes" className="text-xs font-medium text-muted-foreground uppercase tracking-wider ml-1">
          Customer Notes
        </Label>
        <div className="relative group">
          <div className="absolute left-3 top-3 pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
            <FileText className="w-4 h-4" />
          </div>
          <Textarea
            id="customer-notes"
            value={data.customerNotes}
            onChange={(e) => onChange({ customerNotes: e.target.value })}
            placeholder="Any special requests or additional information..."
            rows={4}
            className="pl-10 resize-none min-h-[100px] transition-all duration-200 focus:ring-4 focus:ring-primary/10 focus:border-primary hover:border-primary/50"
          />
        </div>
      </div>
    </div>
  );
};



