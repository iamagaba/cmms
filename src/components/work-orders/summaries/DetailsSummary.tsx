import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { AlertCircleIcon, Alert01Icon, Store01Icon, Calendar01Icon, NoteIcon } from '@hugeicons/core-free-icons';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface DetailsSummaryProps {
    data: {
        priority: 'low' | 'medium' | 'high' | 'urgent';
        serviceLocationId: string;
        scheduledDate?: string;
        customerNotes?: string;
    };
}

export const DetailsSummary: React.FC<DetailsSummaryProps> = ({ data }) => {
    // Fetch location details (cached query)
    const { data: location } = useQuery({
        queryKey: ['location', data.serviceLocationId],
        queryFn: async () => {
            if (!data.serviceLocationId) return null;
            const { data: loc } = await supabase
                .from('locations')
                .select('name')
                .eq('id', data.serviceLocationId)
                .single();
            return loc;
        },
        enabled: !!data.serviceLocationId
    });

    const priorityConfig = {
        low: { color: 'text-blue-700 bg-blue-50 border-blue-100', icon: Alert01Icon },
        medium: { color: 'text-amber-700 bg-amber-50 border-amber-100', icon: Alert01Icon },
        high: { color: 'text-orange-700 bg-orange-50 border-orange-100', icon: Alert01Icon },
        urgent: { color: 'text-red-700 bg-red-50 border-red-100', icon: AlertCircleIcon }
    };

    const priorityLabels = {
        low: 'Low Priority',
        medium: 'Medium Priority',
        high: 'High Priority',
        urgent: 'Urgent'
    };

    const currentConfig = priorityConfig[data.priority];

    return (
        <div className="mt-1 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
            {/* Priority & Location */}
            <div className="space-y-1">
                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${currentConfig.color}`}>
                    <HugeiconsIcon icon={currentConfig.icon} size={10} />
                    {priorityLabels[data.priority]}
                </span>

                {location && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-700">
                        <HugeiconsIcon icon={Store01Icon} size={12} className="text-gray-400" />
                        <span className="font-medium">{location.name}</span>
                    </div>
                )}
            </div>

            {/* Schedule & Notes */}
            <div className="space-y-0.5">
                {data.scheduledDate ? (
                    <div className="flex items-center gap-1.5 text-xs text-gray-700">
                        <HugeiconsIcon icon={Calendar01Icon} size={12} className="text-gray-400" />
                        <span>
                            {new Date(data.scheduledDate).toLocaleString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit'
                            })}
                        </span>
                    </div>
                ) : (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 italic">
                        <HugeiconsIcon icon={Calendar01Icon} size={12} className="text-gray-300" />
                        Immediate / No schedule
                    </div>
                )}

                {data.customerNotes && (
                    <div className="flex items-start gap-1.5 mt-0.5">
                        <HugeiconsIcon icon={NoteIcon} size={12} className="text-gray-400 mt-0.5" />
                        <p className="text-[10px] text-gray-600 line-clamp-1 italic">
                            "{data.customerNotes}"
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
