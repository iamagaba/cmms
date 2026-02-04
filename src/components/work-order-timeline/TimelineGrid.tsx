
import React, { useMemo } from 'react';
import dayjs from 'dayjs';
import { TimelineViewMode } from './types';

interface TimelineGridProps {
    viewMode: TimelineViewMode;
    dateRange: { from: Date; to: Date };
    totalWidthPx: number | null; // null means 100% width
    currentTime?: Date;
    children: React.ReactNode;
}

export const TimelineGrid: React.FC<TimelineGridProps> = ({
    viewMode,
    dateRange,
    totalWidthPx,
    currentTime = new Date(),
    children
}) => {
    // Generate time markers based on view mode
    const markers = useMemo(() => {
        const ticks = [];
        const start = dayjs(dateRange.from);
        const end = dayjs(dateRange.to);

        if (viewMode === 'day') {
            // Hour markers
            let current = start.startOf('hour');
            while (current.isBefore(end)) {
                ticks.push({
                    time: current,
                    label: current.format('HH:mm'),
                    major: current.hour() === 0 // Midnight is major
                });
                current = current.add(1, 'hour');
            }
        } else if (viewMode === 'week') {
            // Day markers
            let current = start.startOf('day');
            while (current.isBefore(end) || current.isSame(end, 'day')) {
                ticks.push({
                    time: current,
                    label: current.format('ddd D'),
                    major: true
                });
                current = current.add(1, 'day');
            }
        } else if (viewMode === 'month') {
            // Day markers for month view (show each day)
            let current = start.startOf('day');
            while (current.isBefore(end) || current.isSame(end, 'day')) {
                ticks.push({
                    time: current,
                    label: current.format('D MMM'),
                    major: true
                });
                current = current.add(1, 'day');
            }
        }
        return ticks;
    }, [viewMode, dateRange]);

    // Generate day/hour labels for context
    const headerBlocks = useMemo(() => {
        const blocks: { label: string; left: number; width: number }[] = [];
        const start = dayjs(dateRange.from);

        if (viewMode === 'day') {
            // Day view - show 24 hours
            const hoursCount = 24;
            const hourWidthPercent = 100 / hoursCount;

            for (let i = 0; i < hoursCount; i++) {
                const current = start.add(i, 'hour');

                blocks.push({
                    label: current.format('HH:mm'),
                    left: i * hourWidthPercent,
                    width: hourWidthPercent
                });
            }
        } else if (viewMode === 'week') {
            // Generate exactly 7 days for week view using percentage-based layout
            const daysCount = 7;
            const dayWidthPercent = 100 / daysCount;

            for (let i = 0; i < daysCount; i++) {
                const current = start.add(i, 'day');

                blocks.push({
                    label: current.format('ddd D'),
                    left: i * dayWidthPercent,
                    width: dayWidthPercent
                });
            }
        } else {
            // Month view - show exactly 30 days
            let current = start.startOf('day');
            const daysToShow = 30;
            const dayWidthPercent = 100 / daysToShow;

            for (let i = 0; i < daysToShow; i++) {
                const dayDate = current.add(i, 'day');

                blocks.push({
                    label: dayDate.format('D'),
                    left: i * dayWidthPercent,
                    width: dayWidthPercent
                });
            }
        }
        return blocks;
    }, [viewMode, dateRange]);

    return (
        <div className="flex-1 bg-slate-50 border-l border-slate-200 relative min-w-0">
            <div style={{ width: totalWidthPx ? `${totalWidthPx}px` : '100%', position: 'relative' }}>

                {/* Time Scale Axis Header */}
                <div className="sticky top-0 z-[60] bg-white border-b border-slate-200 shadow-sm">
                    {/* Top Row: Date Range Header (for all views) */}
                    <div className="h-6 flex items-center bg-slate-50 border-b border-slate-100 relative">
                        {viewMode === 'day' && (
                            <div className="sticky left-0 px-4 py-1 text-xs font-bold text-slate-700 tracking-wide bg-slate-50/95 backdrop-blur-sm z-20 border-r border-slate-200">
                                {dayjs(dateRange.from).format('dddd, MMMM D, YYYY')}
                            </div>
                        )}
                        {viewMode === 'week' && (
                            <div className="sticky left-0 px-4 py-1 text-xs font-bold text-slate-700 tracking-wide bg-slate-50/95 backdrop-blur-sm z-20 border-r border-slate-200">
                                {dayjs(dateRange.from).format('MMMM D')} - {dayjs(dateRange.to).format('MMMM D, YYYY')}
                            </div>
                        )}
                        {viewMode === 'month' && (
                            <div className="sticky left-0 px-4 py-1 text-xs font-bold text-slate-700 tracking-wide bg-slate-50/95 backdrop-blur-sm z-20 border-r border-slate-200">
                                {dayjs(dateRange.to).format('MMMM YYYY')}
                            </div>
                        )}
                    </div>

                    {/* Second Row: Day/Hour Labels */}
                    <div className="h-6 flex items-center bg-slate-50 border-b border-slate-100 relative">
                        {headerBlocks?.map((block, i) => (
                            <div
                                key={i}
                                className="absolute top-0 bottom-0 flex items-center justify-center text-[10px] font-bold text-slate-600 tracking-wide border-r border-slate-200 bg-slate-50"
                                style={{ left: `${block.left}%`, width: `${block.width}%` }}
                            >
                                {block.label}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Grid Background Lines & Content Layer */}
                <div className="relative">
                    {/* Vertical Grid Lines */}
                    <div className="absolute inset-0 z-0 pointer-events-none">
                        {markers.map((tick, i) => {
                            const totalDuration = dateRange.to.getTime() - dateRange.from.getTime();
                            const tickTime = tick.time.toDate().getTime() - dateRange.from.getTime();
                            const leftPercent = (tickTime / totalDuration) * 100;

                            return (
                                <div
                                    key={`line-${i}`}
                                    className={`absolute top-0 bottom-0 border-l ${tick.major ? 'border-slate-300' : 'border-slate-100 dashed'}`}
                                    style={{ left: `${leftPercent}%` }}
                                />
                            );
                        })}
                    </div>

                    {/* Current Time Line - Moved out of z-0 container to sit on top of everything */}
                    <div
                        className="absolute top-0 bottom-0 border-l-2 border-red-500 border-dashed z-50 shadow-[0_0_8px_rgba(239,68,68,0.6)] pointer-events-none"
                        style={{
                            left: `${((currentTime.getTime() - dateRange.from.getTime()) / (dateRange.to.getTime() - dateRange.from.getTime())) * 100}%`
                        }}
                    >
                        <div className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm absolute top-0 -translate-x-1/2 shadow-sm whitespace-nowrap">
                            Now
                        </div>
                    </div>

                    {/* Render Timeline Row Contents */}
                    <div className="relative z-10">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};
