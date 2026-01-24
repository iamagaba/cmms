import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { HugeiconsIcon } from '@hugeicons/react';
import { TimelineIcon } from '@hugeicons/core-free-icons';

export const WorkOrderTrendsChart = ({ data }: { data: any[] }) => {
    // Handle empty data
    if (!data || data.length === 0) {
        return (
            <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
                <div className="px-4 py-3 border-b border-border">
                    <div className="flex items-center gap-2">
                        <HugeiconsIcon icon={TimelineIcon} size={14} className="text-muted-foreground" />
                        <div>
                            <h3 className="text-sm font-semibold text-foreground">Work Order Trends</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">Last 7 days activity</p>
                        </div>
                    </div>
                </div>
                <div className="p-4">
                    <div className="h-[180px] w-full flex items-center justify-center text-muted-foreground text-sm">
                        No data available
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
            {/* Header */}
            <div className="px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={TimelineIcon} size={14} className="text-muted-foreground" />
                    <div>
                        <h3 className="text-sm font-semibold text-foreground">Work Order Trends</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Last 7 days activity</p>
                    </div>
                </div>
            </div>
            {/* Content */}
            <div className="p-4">
                <div className="h-[180px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                            <defs>
                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: '#6b7280' }}
                                dy={10}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '3 3' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="count"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorCount)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};
