
import React from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import { HugeiconsIcon } from '@hugeicons/react';
import { TimelineIcon } from '@hugeicons/core-free-icons';

export const WorkOrderTrendsChart = ({ data }: { data: any[] }) => {
    // Handle empty data
    if (!data || data.length === 0) {
        return (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <HugeiconsIcon icon={TimelineIcon} size={16} className="text-gray-500" />
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900">Work Order Trends</h3>
                            <p className="text-xs text-gray-500 mt-0.5">Last 7 days activity</p>
                        </div>
                    </div>
                </div>
                <div className="p-6">
                    <div className="h-[180px] w-full flex items-center justify-center text-gray-400 text-sm">
                        No data available
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={TimelineIcon} size={16} className="text-gray-500" />
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900">Work Order Trends</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Last 7 days activity</p>
                    </div>
                </div>
            </div>
            {/* Content */}
            <div className="p-6">
                <div className="h-[180px] w-full">
                    <LineChart
                        xAxis={[
                            {
                                scaleType: 'point',
                                data: data.map(d => d.date),
                            },
                        ]}
                        series={[
                            {
                                data: data.map(d => d.count),
                                color: '#3b82f6',
                                area: true,
                                showMark: true,
                            },
                        ]}
                        height={180}
                        margin={{ top: 10, right: 10, bottom: 30, left: 30 }}
                    />
                </div>
            </div>
        </div>
    );
};
