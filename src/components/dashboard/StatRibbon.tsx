
import React from "react";
import { ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LineChart } from '@mui/x-charts/LineChart';

interface StatRibbonProps {
    stats: Array<{
        title: string;
        value: string | number;
        subtitle?: string;
        icon: LucideIcon;
        color: 'primary' | 'emerald' | 'amber' | 'red' | 'slate' | 'blue';
        onClick?: () => void;
        sparklineData?: Array<{ value: number }>;
        trend?: number; // Percentage change for trend indicator
    }>;
}

export const StatRibbon: React.FC<StatRibbonProps> = ({ stats }) => {
    const getSparklineColor = (color: string) => {
        switch (color) {
            case 'primary': return '#2563eb'; // blue-600
            case 'emerald': return '#059669'; // emerald-600
            case 'amber': return '#d97706'; // amber-600
            case 'red': return '#dc2626'; // red-600
            case 'blue': return '#4f46e5'; // indigo-600
            case 'slate': return '#475569'; // slate-600
            default: return '#94a3b8'; // slate-400
        }
    };

    const getTrendColor = (trend: number) => {
        if (trend > 0) return 'text-emerald-600 dark:text-emerald-400';
        if (trend < 0) return 'text-red-600 dark:text-red-400';
        return 'text-muted-foreground';
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                const hasTrend = stat.trend !== undefined;
                const trendValue = stat.trend || 0;

                return (
                    <div
                        key={index}
                        className={cn(
                            'relative overflow-hidden rounded-lg bg-card border shadow-sm transition-all duration-200',
                            stat.onClick && 'cursor-pointer hover:shadow-md'
                        )}
                    >
                        <div className="p-6 space-y-1">
                            {/* Header: Title + Icon */}
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <IconComponent className="w-4 h-4" />
                                    {stat.title}
                                </span>
                                <Info className="w-4 h-4 text-muted-foreground/50" />
                            </div>

                            {/* Value + Sparkline */}
                            <div className="flex items-center justify-between gap-2">
                                <div className="space-y-1 min-w-0">
                                    <div className="text-3xl font-bold tracking-tight">
                                        {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                                    </div>
                                </div>

                                {stat.sparklineData && stat.sparklineData.length > 0 && (
                                    <div className="w-20 h-10 flex-shrink-0 overflow-visible relative">
                                        <LineChart
                                            xAxis={[{
                                                data: stat.sparklineData.map((_, i) => i),
                                                hideTooltip: true,
                                                disableLine: true,
                                                disableTicks: true
                                            }]}
                                            yAxis={[{
                                                hideTooltip: true,
                                                disableLine: true,
                                                disableTicks: true,
                                                // Add padding to Y axis domain to prevent top/bottom clipping
                                                min: (() => {
                                                    const values = stat.sparklineData?.map(d => d.value) || [];
                                                    const min = Math.min(...values);
                                                    const max = Math.max(...values);
                                                    if (min === max) return min - 10;
                                                    return min - (max - min) * 0.2;
                                                })(),
                                                max: (() => {
                                                    const values = stat.sparklineData?.map(d => d.value) || [];
                                                    const min = Math.min(...values);
                                                    const max = Math.max(...values);
                                                    if (min === max) return max + 10;
                                                    return max + (max - min) * 0.2;
                                                })()
                                            }]}
                                            series={[{
                                                data: stat.sparklineData.map(d => d.value),
                                                color: getSparklineColor(stat.color),
                                                showMark: false,
                                                curve: 'natural',
                                                area: false,
                                            }]}
                                            width={80}
                                            height={40}
                                            margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                                            slotProps={{
                                                legend: { hidden: true } as any
                                            }}
                                            sx={{
                                                '& .MuiChartsAxis-root': { display: 'none' },
                                                '& .MuiChartsGrid-root': { display: 'none' },
                                                '& .MuiLineElement-root': {
                                                    strokeWidth: 2,
                                                    strokeLinecap: 'round',
                                                    strokeLinejoin: 'round'
                                                },
                                                overflow: 'visible'
                                            }}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Footer: Subtitle + Trend */}
                            <div className="flex items-center justify-between">
                                {stat.subtitle && (
                                    <p className="text-xs text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis">
                                        {stat.subtitle}
                                    </p>
                                )}

                                {hasTrend ? (
                                    <div className={cn("flex items-center gap-1 text-xs font-medium", getTrendColor(trendValue))}>
                                        {trendValue > 0 ? (
                                            <ArrowUpRight className="w-3 h-3" />
                                        ) : trendValue < 0 ? (
                                            <ArrowDownRight className="w-3 h-3" />
                                        ) : null}
                                        <span>{Math.abs(trendValue).toFixed(1)}%</span>
                                    </div>
                                ) : (
                                    /* Spacer if no trend but subtitle exists to keep alignment if needed, 
                                       or just empty. For now, empty is fine as justify-between handles it. */
                                    <div />
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

