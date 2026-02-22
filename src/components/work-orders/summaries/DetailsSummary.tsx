import { AlertCircle, Calendar, Store, FileText } from 'lucide-react';
import React from 'react';


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
        low: { color: 'text-muted-foreground bg-muted border-muted-foreground/20', icon: AlertCircle },
        medium: { color: 'text-amber-700 bg-amber-50 border-amber-200', icon: AlertCircle },
        high: { color: 'text-amber-700 bg-amber-50 border-amber-200', icon: AlertCircle },
        urgent: { color: 'text-destructive bg-destructive/10 border-destructive/20', icon: AlertCircle }
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
                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium border ${currentConfig.color}`}>
                    <currentConfig.icon className="w-4 h-4" />
                    {priorityLabels[data.priority]}
                </span>

                {location && (
                    <div className="flex items-center gap-1.5 text-xs text-foreground">
                        <Store className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{location.name}</span>
                    </div>
                )}
            </div>

            {/* Schedule & Notes */}
            <div className="space-y-0.5">
                {data.scheduledDate ? (
                    <div className="flex items-center gap-1.5 text-xs text-foreground">
                        <Calendar className="w-5 h-5 text-muted-foreground" />
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
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground italic">
                        <Calendar className="w-5 h-5" />
                        Immediate / No schedule
                    </div>
                )}

                {data.customerNotes && (
                    <div className="flex items-start gap-1.5 mt-0.5">
                        <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <p className="text-xs text-muted-foreground line-clamp-1 italic">
                            "{data.customerNotes}"
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};



