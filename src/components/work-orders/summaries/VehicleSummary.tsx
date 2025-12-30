import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Car01Icon, Location01Icon, Call02Icon } from '@hugeicons/core-free-icons';

interface VehicleSummaryProps {
    data: {
        vehicleId: string;
        customerLocation: { address: string; lat: number; lng: number } | null;
        contactPhone: string;
        alternatePhone?: string;
    };
    vehicleInfo?: {
        make?: string;
        model?: string;
        license_plate?: string;
    };
}

export const VehicleSummary: React.FC<VehicleSummaryProps> = ({ data, vehicleInfo }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div className="space-y-1">
                <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-wide font-medium">
                    <HugeiconsIcon icon={Car01Icon} size={14} />
                    Vehicle
                </div>
                <div className="text-sm font-medium text-gray-900">
                    {vehicleInfo?.make} {vehicleInfo?.model}
                </div>
                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded w-fit">
                    {vehicleInfo?.license_plate}
                </div>
            </div>

            <div className="space-y-1">
                <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-wide font-medium">
                    <HugeiconsIcon icon={Location01Icon} size={14} />
                    Location
                </div>
                <div className="text-sm text-gray-900 line-clamp-1" title={data.customerLocation?.address}>
                    {data.customerLocation?.address || 'No location provided'}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                    <HugeiconsIcon icon={Call02Icon} size={12} />
                    {data.contactPhone}
                    {data.alternatePhone && <span className="text-gray-400"> • {data.alternatePhone}</span>}
                </div>
            </div>
        </div>
    );
};
