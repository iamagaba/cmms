import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowDown01Icon, Cancel01Icon, ArrowUp01Icon, AlertCircleIcon } from '@hugeicons/core-free-icons';
import { Stack } from '@/components/tailwind-components';
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
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800', icon: ArrowDown01Icon },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800', icon: Cancel01Icon },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800', icon: ArrowUp01Icon },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800', icon: AlertCircleIcon }
  ];



  return (
    <Stack gap="sm">
      {/* Priority Selection */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Priority <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-1.5">
          {priorities.map((priority) => (
            <button
              key={priority.value}
              onClick={() => onChange({ priority: priority.value })}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium transition-all ${
                data.priority === priority.value
                  ? `${priority.color} ring-2 ring-offset-1 ring-current`
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <HugeiconsIcon icon={priority.icon} size={12} />
              {priority.label}
            </button>
          ))}
        </div>
        {errors.priority && <p className="text-[10px] text-red-600 mt-0.5">{errors.priority}</p>}
      </div>

      {/* Service Location */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Service Location <span className="text-red-500">*</span>
        </label>
        <select
          value={data.serviceLocationId}
          onChange={(e) => onChange({ serviceLocationId: e.target.value })}
          className={`w-full h-7 px-2 py-1 text-xs border rounded-md shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-purple-600 focus:border-purple-600 ${errors.serviceLocationId ? 'border-red-500' : 'border-gray-200'
            }`}
        >
          <option value="">Select service center...</option>
          {locations?.map(l => (
            <option key={l.id} value={l.id}>
              {l.name} - {l.address}
            </option>
          ))}
        </select>
        {errors.serviceLocationId && <p className="text-[10px] text-red-600 mt-0.5">{errors.serviceLocationId}</p>}
      </div>

      {/* Scheduled Date (Optional) */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Scheduled Date (Optional)
        </label>
        <input
          type="datetime-local"
          value={data.scheduledDate}
          onChange={(e) => onChange({ scheduledDate: e.target.value })}
          className="w-full h-7 px-2 py-1 text-xs border border-gray-200 rounded-md shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-purple-600 focus:border-purple-600"
        />
        <p className="text-[10px] text-gray-500 mt-0.5">
          Leave empty for immediate service
        </p>
      </div>

      {/* Customer Notes */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Additional Notes (Optional)
        </label>
        <textarea
          value={data.customerNotes}
          onChange={(e) => onChange({ customerNotes: e.target.value })}
          placeholder="Any additional information from the customer..."
          rows={3}
          className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-md shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-purple-600 focus:border-purple-600 resize-none"
        />
      </div>
    </Stack>
  );
};
