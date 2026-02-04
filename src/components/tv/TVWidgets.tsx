import { Calendar, CheckCircle, ClipboardList, User } from 'lucide-react';
/**
 * TV Widgets Component
 * 
 * Note: This component intentionally uses neutral colors (bg-neutral-*, text-neutral-*)
 * instead of semantic tokens. TV dashboards require high contrast and specific color
 * palettes optimized for large display visibility from distance.
 * 
 * This is an approved exception to the shadcn/ui compliance rules.
 */

import React from 'react';


// Charts restored - react-is version conflict resolved
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { WorkOrder } from '@/types/supabase';
import { getWorkOrderNumber } from '@/utils/work-order-display';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

// ============================================
// METRIC CARD
// ============================================
interface MetricCardProps {
    label: string;
    value: number | string;
    sublabel?: string;
    variant?: 'normal' | 'critical' | 'warning' | 'success' | 'info';
    icon?: string;
}

export const MetricCard = ({ label, value, sublabel, variant = 'normal', icon }: MetricCardProps) => {
    const getColors = () => {
        switch (variant) {
            case 'critical': return 'bg-error-50 text-error-700 border-error-200 dark:bg-error-900/40 dark:border-error-500/50 dark:text-error-100';
            case 'warning': return 'bg-warning-50 text-warning-800 border-warning-200 dark:bg-warning-900/40 dark:border-warning-500/50 dark:text-warning-100';
            case 'success': return 'bg-success-50 text-success-800 border-success-200 dark:bg-success-900/40 dark:border-success-500/50 dark:text-success-100';
            case 'info': return 'bg-primary-50 text-primary-800 border-primary-200 dark:bg-primary-900/40 dark:border-primary-500/50 dark:text-primary-100';
            default: return 'bg-card text-foreground border';
        }
    };

    const isBlinking = variant === 'critical' && (typeof value === 'number' ? value > 0 : true);

    return (
        <div className={`rounded-2xl border p-6 flex flex-col justify-between h-full relative overflow-hidden transition-colors duration-300 ${getColors()}`}>
            {isBlinking && (
                <span className="absolute top-2 right-2 w-3 h-3 rounded-full bg-error-500 animate-ping"></span>
            )}

            <div className="flex items-center justify-between mb-4">
                <span className="opacity-70 font-medium tracking-wider text-sm uppercase">{label}</span>
                {/* TODO: Convert icon prop to use HugeiconsIcon component */}
            </div>

            <div className="flex flex-col">
                <span className="text-6xl font-black tracking-tighter leading-none">{value}</span>
                {sublabel && <span className="text-sm font-medium opacity-60 mt-2">{sublabel}</span>}
            </div>
        </div>
    );
};

// ============================================
// ACTIVE WORK ORDER LIST
// ============================================

// ============================================
// ACTIVE WORK ORDER LIST (Static)
// ============================================
interface ActiveWorkOrderListProps {
    workOrders: WorkOrder[];
    assetLookup: Map<string, string>;
    techLookup: Map<string, string>;
}

export const ActiveWorkOrderList = ({ workOrders, assetLookup, techLookup }: ActiveWorkOrderListProps) => {
    return (
        <div className="bg-white dark:bg-neutral-800/50 rounded-2xl border border-neutral-200 dark:border-neutral-700 flex flex-col h-full overflow-hidden transition-colors duration-300 shadow-sm dark:shadow-none">
            <div className="p-4 bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 flex items-center gap-3 transition-colors duration-300">
                <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></div>
                <h3 className="font-bold text-lg tracking-wide text-neutral-900 dark:text-white">LIVE ACTIVITY FEED</h3>
                <span className="text-xs text-muted-foreground ml-auto uppercase tracking-wider font-mono">
                    {workOrders.length} ACTIVE
                </span>
            </div>

            {/* List Container */}
            <div
                className="flex-1 overflow-y-auto p-4 space-y-3 relative custom-scrollbar"
            >
                {workOrders.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                        <CheckCircle className="w-5 h-5 mb-4" />
                        <span className="text-xl font-medium">No Active Work</span>
                    </div>
                ) : (
                    <>
                        {workOrders.map((wo) => {
                            // Resolve names
                            const assetName = wo.vehicleId ? assetLookup.get(wo.vehicleId) : 'Unknown Asset';
                            const techName = wo.assignedTechnicianId ? techLookup.get(wo.assignedTechnicianId) : 'Unassigned';
                            const priority = (wo.priority || 'Normal') as string;

                            const isUrgent = priority === 'High' || priority === 'Critical' || priority === 'Emergency';

                            return (
                                <div key={wo.id} className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 p-4 rounded-xl flex items-center justify-between shadow-sm transition-colors duration-300">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isUrgent ? 'bg-error-100 text-error-600 dark:bg-error-900/30 dark:text-error-500' : 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-500'
                                            }`}>

                                            <ClipboardList className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono font-bold text-primary text-sm">{getWorkOrderNumber(wo)}</span>
                                                <span className="font-semibold text-lg text-neutral-900 dark:text-white">{wo.service || wo.description}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-muted-foreground dark:text-neutral-400 mt-1">
                                                <span className="font-medium text-neutral-700 dark:text-neutral-300">{assetName}</span>
                                                <span className="w-1 h-1 rounded-full bg-neutral-400 dark:bg-neutral-600"></span>
                                                <span>{dayjs(wo.created_at).fromNow()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-1">
                                        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${wo.status === 'In Progress' ? 'bg-primary-100 text-primary-700 dark:bg-primary-500/20 dark:text-primary-300' : 'bg-neutral-200 text-muted-foreground dark:bg-neutral-700 dark:text-neutral-300'
                                            }`}>
                                            {wo.status}
                                        </div>
                                        {wo.assignedTechnicianId && (
                                            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                                <User className="w-5 h-5" />
                                                {techName}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        {/* Space at bottom for scrolling */}
                        <div className="h-8"></div>
                    </>
                )}
            </div>
        </div>
    );
};


// ============================================
// CHARTS & WIDGETS
// ============================================

export const WeeklyTrendChart = ({ data }: { data: any[] }) => {
    // Handle empty data
    if (!data || data.length === 0) {
        return (
            <div className="h-full w-full min-h-[12rem] flex items-center justify-center text-gray-400 text-sm">
                No data available
            </div>
        );
    }

    return (
        <div className="h-full w-full min-h-[12rem]">
            <BarChart
                dataset={data}
                xAxis={[{
                    scaleType: 'band',
                    dataKey: 'date',
                    tickLabelStyle: {
                        fontSize: 10,
                        fill: '#6b7280'
                    }
                }]}
                series={[{
                    dataKey: 'count',
                    color: 'hsl(var(--primary))',
                }]}
                grid={{ horizontal: true, vertical: false }}
                margin={{ top: 10, right: 10, bottom: 20, left: 10 }}
                borderRadius={4}
                slotProps={{
                    legend: {}
                }}
                sx={{
                    '& .MuiChartsGrid-line': {
                        stroke: '#e5e7eb',
                        strokeDasharray: '3 3',
                    },
                    '& .MuiChartsAxis-line': {
                        display: 'none',
                    },
                    '& .MuiChartsAxis-tick': {
                        display: 'none',
                    },
                    '& .MuiChartsAxis-left': {
                        display: 'none',
                    },
                    '& .MuiChartsLegend-root': {
                        display: 'none',
                    }
                }}
            />
        </div>
    );
};

export const TeamStatusChart = ({ data }: { data: { status: string, count: number }[] }) => {
    const colors = ['#10b981', '#f59e0b', '#ef4444', '#64748b']; // Emerald, Amber, Red, Slate

    // Handle empty data
    if (!data || data.length === 0) {
        return (
            <div className="h-full w-full min-h-[12rem] flex items-center justify-center text-gray-400 text-sm">
                No data available
            </div>
        );
    }

    return (
        <div className="h-full w-full min-h-[12rem]">
            <PieChart
                series={[
                    {
                        data: data.map((item, index) => ({
                            id: index,
                            value: item.count,
                            label: item.status,
                            color: colors[index % colors.length],
                        })),
                        innerRadius: 60,
                        outerRadius: 80,
                        paddingAngle: 5,
                        highlightScope: { faded: 'global', highlighted: 'item' },
                    },
                ]}
                margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
                slotProps={{
                }}
                sx={{
                    '& .MuiChartsLegend-root': {
                        display: 'none',
                    }
                }}
            />
        </div>
    );
}

// ============================================
// UP NEXT SCHEDULE
// ============================================

interface UpNextScheduleProps {
    orders: WorkOrder[];
}

export const UpNextSchedule = ({ orders }: UpNextScheduleProps) => {
    return (
        <div className="h-full flex flex-col">
            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                {orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-muted-foreground opacity-60">
                        <Calendar className="w-5 h-5 mb-3" />
                        <span className="text-sm font-medium">No Appointments (24h)</span>
                    </div>
                ) : (
                    orders.map(order => (
                        <div key={order.id} className="bg-neutral-50 dark:bg-neutral-900 border-l-4 border-primary-500 rounded-r-lg p-3 flex justify-between items-center group transition-colors duration-300">
                            <div>
                                <div className="text-neutral-900 dark:text-white font-medium text-base mb-1">
                                    {dayjs(order.appointmentDate || order.scheduledDate).format('h:mm A')}
                                </div>
                                <div className="text-muted-foreground dark:text-neutral-400 text-xs uppercase tracking-wide truncate max-w-[150px]">
                                    {order.service || order.title}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
                                    {dayjs(order.appointmentDate || order.scheduledDate).format('MMM D')}
                                </div>
                                <span className="text-xs text-muted-foreground bg-neutral-200 dark:bg-neutral-800 px-2 py-0.5 rounded-full">
                                    SCHEDULED
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};




