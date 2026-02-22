
import React from 'react';
import { StatusSegment } from './types';
import { cn } from '@/lib/utils';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

import { STATUS_CONFIG } from '@/config/status';

interface TimelineBarProps {
    segments: StatusSegment[];
    totalWidthPercent: number; // The width of the entire bar relative to the visible time window
    pxPerMs: number;
    usePercentage?: boolean;
    totalDuration?: number;
}

// Map generic color names from config to specific Tailwind classes for the timeline bars
const COLOR_VARIANTS: Record<string, string> = {
    slate: 'bg-slate-300 border-slate-400 text-slate-700',
    blue: 'bg-blue-200 border-blue-400 text-blue-800',
    orange: 'bg-orange-200 border-orange-400 text-orange-800',
    yellow: 'bg-yellow-100 border-yellow-400 text-yellow-800 bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,.05)_25%,rgba(0,0,0,.05)_50%,transparent_50%,transparent_75%,rgba(0,0,0,.05)_75%,rgba(0,0,0,.05))] bg-[length:10px_10px]',
    green: 'bg-emerald-200 border-emerald-500 text-emerald-800',
    red: 'bg-red-100 border-red-300 text-red-800 opacity-70',
    indigo: 'bg-indigo-200 border-indigo-400 text-indigo-800',
};

export const TimelineBar: React.FC<TimelineBarProps> = ({
    segments,
    pxPerMs,
    usePercentage = false,
    totalDuration = 0
}) => {
    return (
        <div className="flex h-5 overflow-hidden shadow-sm">
            {segments.map((segment, index) => {
                let widthStyle = {};

                if (usePercentage && totalDuration > 0) {
                    // Percentage based width - calculate as percentage of TIMELINE duration
                    const widthPercent = (segment.durationMs / totalDuration) * 100;
                    widthStyle = { width: `${Math.max(widthPercent, 0.5)}%` }; // Min 0.5% width
                } else {
                    // Pixel based width
                    const widthPx = Math.max(segment.durationMs * pxPerMs, 4); // Min width 4px for visibility
                    widthStyle = { width: `${widthPx}px` };
                }

                const statusConfig = STATUS_CONFIG[segment.status as keyof typeof STATUS_CONFIG];
                const colorKey = statusConfig?.color || 'slate';
                const colorClass = COLOR_VARIANTS[colorKey] || COLOR_VARIANTS['slate'];

                return (
                    <TooltipProvider key={`${segment.status}-${index}`}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div
                                    className={cn(
                                        "h-full border-r last:border-r-0 box-border transition-all hover:brightness-95 cursor-pointer relative",
                                        colorClass
                                    )}
                                    style={widthStyle}
                                >
                                    {/* Status label removed */}
                                </div>
                            </TooltipTrigger>
                            <TooltipContent className="bg-slate-900 text-white border-slate-700">
                                <div className="text-xs">
                                    <p className="font-bold mb-1">{segment.status}</p>
                                    <p className="font-mono opacity-80">
                                        {dayjs(segment.start).format('MMM D, HH:mm')} - {dayjs(segment.end).format('MMM D, HH:mm')}
                                    </p>
                                    <p className="mt-1 font-medium text-emerald-400">
                                        {dayjs.duration(segment.durationMs).format('D[d] H[h] m[m]')}
                                    </p>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                );
            })}
        </div>
    );
};
