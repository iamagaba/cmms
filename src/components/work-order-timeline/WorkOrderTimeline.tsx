
import React, { useState, useMemo, useEffect } from 'react';
import { TimelineWorkOrder, TimelineViewMode, TimelineGroupBy } from './types';
import { TimelineGrid } from './TimelineGrid';
import { TimelineRow } from './TimelineRow';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, User, MapPin, Hash, Layers, Clock, CalendarDays } from 'lucide-react';
import dayjs from 'dayjs';
import { useMediaQuery } from '@/hooks/tailwind';

interface WorkOrderTimelineProps {
    workOrders: TimelineWorkOrder[];
    className?: string;
    onWorkOrderClick?: (workOrder: TimelineWorkOrder) => void;
    isLoading?: boolean;
}

// Mobile Card Component
const MobileTimelineCard = ({ workOrder, onClick }: { workOrder: TimelineWorkOrder, onClick?: () => void }) => {
    const currentStatus = workOrder.statusHistory[workOrder.statusHistory.length - 1];
    return (
        <div
            className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm mb-3 cursor-pointer active:scale-[0.98] transition-transform"
            onClick={onClick}
        >
            <div className="flex justify-between items-start mb-2">
                <div>
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                        {workOrder.work_order_number}
                    </span>
                    <h4 className="font-semibold text-sm mt-1">{workOrder.vehicle?.license_plate || 'No Plate'}</h4>
                </div>
                <div className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${workOrder.status === 'In Progress' ? 'bg-orange-100 text-orange-700' :
                    workOrder.status === 'Completed' ? 'bg-green-100 text-green-700' :
                        'bg-slate-100 text-slate-700'
                    }`}>
                    {workOrder.status}
                </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500 mb-2">
                <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{workOrder.technician?.name || 'Unassigned'}</span>
                </div>
                <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{currentStatus?.durationMs ? dayjs.duration(currentStatus.durationMs).humanize() : '0m'}</span>
                </div>
            </div>

            {/* Visual Progress Bar for context */}
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                {workOrder.statusHistory.map((seg, i) => (
                    <div
                        key={i}
                        className={`h-full ${seg.status === 'In Progress' ? 'bg-orange-400' :
                            seg.status === 'Completed' ? 'bg-green-400' :
                                'bg-slate-300'
                            }`}
                        style={{ width: `${(seg.durationMs / workOrder.totalDurationMs) * 100}%` }}
                    />
                ))}
            </div>
        </div>
    );
};


export const WorkOrderTimeline: React.FC<WorkOrderTimelineProps> = ({
    workOrders,
    className,
    onWorkOrderClick,
    isLoading = false
}) => {
    const [viewMode, setViewMode] = useState<TimelineViewMode>('day');
    const [groupBy, setGroupBy] = useState<TimelineGroupBy>('technician');
    const [baseDate, setBaseDate] = useState(new Date());
    const [currentTime, setCurrentTime] = useState(new Date());
    const isMobile = useMediaQuery('(max-width: 768px)');

    // Update current time every minute to keep the timeline "red line" and active bars moving
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000); // 1 minute

        return () => clearInterval(timer);
    }, []);

    // Calculate Date Range based on View Mode
    const dateRange = useMemo(() => {
        const today = dayjs(baseDate);
        if (viewMode === 'day') {
            return { from: today.startOf('day').toDate(), to: today.endOf('day').toDate() };
        } else if (viewMode === 'week') {
            // Show past 7 days ending on baseDate (inclusive)
            const fromDate = today.subtract(6, 'day').startOf('day');
            const toDate = today.endOf('day');
            return { from: fromDate.toDate(), to: toDate.toDate() };
        } else { // month - show exactly 30 days ending on baseDate (inclusive)
            // To show 30 days including today: go back 29 days
            // Example: If today is Jan 31, we want Jan 2 - Jan 31 (30 days total)
            const fromDate = today.subtract(29, 'day').startOf('day');
            const toDate = today.endOf('day');
            return { from: fromDate.toDate(), to: toDate.toDate() };
        }
    }, [viewMode, baseDate]);

    // Grouping Logic
    const groupedData = useMemo(() => {
        // Filter out work orders that don't overlap with the current view
        const visibleWorkOrders = workOrders.filter(wo => {
            const start = wo.statusHistory[0]?.start || new Date(wo.created_at);
            const end = wo.statusHistory[wo.statusHistory.length - 1]?.end || new Date();

            // Allow overlap: WO starts before view ends AND WO ends after view starts
            return start < dateRange.to && end > dateRange.from;
        });

        if (groupBy === 'none') {
            return [{ id: 'all', label: 'All Work Orders', items: visibleWorkOrders }];
        }

        const groups: Record<string, { label: string; items: TimelineWorkOrder[] }> = {};

        visibleWorkOrders.forEach(wo => {
            let key = 'Unassigned';
            let label = 'Unassigned';

            if (groupBy === 'technician') {
                key = wo.assigned_technician_id || 'unassigned';
                label = wo.technician?.name || 'Unassigned';
            } else if (groupBy === 'location') {
                key = wo.location_id || 'unknown';
                label = key;
            } else if (groupBy === 'status') {
                key = wo.status || 'unknown';
                label = key;
            } else if (groupBy === 'priority') {
                key = wo.priority || 'none';
                label = key;
            }

            if (!groups[key]) groups[key] = { label, items: [] };
            groups[key].items.push(wo);
        });

        return Object.entries(groups).map(([id, group]) => ({
            id,
            label: group.label,
            items: group.items
        })).sort((a, b) => a.label.localeCompare(b.label));
    }, [workOrders, groupBy, dateRange]);

    // Dimensions - All views use percentage-based layout (100% width, no scrolling)
    const PX_PER_MS = null; // All views use percentage-based layout

    // Explicit widths to enable horizontal scrolling
    const totalWidth = useMemo(() => {
        if (viewMode === 'day') return 1200; // 50px per hour - Fits full day on larger screens
        if (viewMode === 'week') return 1200; // ~170px per day - Fits full week tightly
        if (viewMode === 'month') return 3000; // 100px per day
        return 1200;
    }, [viewMode]);

    // Check if we are at the "Live" edge (Today)
    const isAtFutureLimit = useMemo(() => {
        return dayjs(baseDate).isSame(dayjs(), 'day') || dayjs(baseDate).isAfter(dayjs(), 'day');
    }, [baseDate]);

    const navigateDate = (direction: 'prev' | 'next') => {
        const val = direction === 'next' ? 1 : -1;
        let unit: 'day' | 'week' | 'month' = 'day';
        let amount = val;

        if (viewMode === 'month') {
            amount = val * 30; // Move by 30 days
            unit = 'day';
        } else if (viewMode === 'week') {
            amount = val * 7; // Move by 7 days
            unit = 'day';
        } else {
            amount = val; // Move by 1 day
            unit = 'day';
        }

        setBaseDate(dayjs(baseDate).add(amount, unit).toDate());
    };

    // Continuous Scrolling Logic
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);
    const lastScrollLeft = React.useRef(0);
    const [isNavigating, setIsNavigating] = useState(false);

    // Initial Scroll Positioning to "Current Time" or Center to avoid edge traps
    React.useLayoutEffect(() => {
        if (scrollContainerRef.current) {
            // Calculate where "NOW" is roughly positioned
            const nowTime = currentTime.getTime();
            const startTime = dateRange.from.getTime();
            const setTime = dateRange.to.getTime();
            const duration = setTime - startTime;

            // Percentage 0-1
            const progress = Math.max(0, Math.min(1, (nowTime - startTime) / duration));

            // Calculate target scroll scrollLeft
            const containerWidth = scrollContainerRef.current.clientWidth;
            const contentWidth = scrollContainerRef.current.scrollWidth;

            // Determine target: 
            // If Day View, start at 0 (00:00).
            // Otherwise, center the "Current Time" (Week/Month)
            let targetScroll = 0;

            if (viewMode === 'day') {
                targetScroll = 0;
            } else {
                // Center the "Current Time" in the viewport
                targetScroll = (contentWidth * progress) - (containerWidth / 2);
            }

            // Ensure we don't hit the edges immediately (clamp)
            // Buffer of 60px to avoid triggering the 'prev'/'next' immediately
            const safeTarget = Math.max(60, Math.min(contentWidth - containerWidth - 60, targetScroll));

            // Allow 0 for day view explicit start
            scrollContainerRef.current.scrollLeft = viewMode === 'day' ? 0 : safeTarget;
            lastScrollLeft.current = viewMode === 'day' ? 0 : safeTarget;
        }
    }, [viewMode, dateRange]); // Re-run when view or date range changes/loads

    // Unlock navigation when date range updates
    useEffect(() => {
        if (isNavigating) {
            // Small buffer to allow render to complete and scroll to stabilize
            const timer = setTimeout(() => {
                setIsNavigating(false);
            }, 150);
            return () => clearTimeout(timer);
        }
    }, [dateRange]);

    const sidebarRef = React.useRef<HTMLDivElement>(null);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        // Sync sidebar scroll
        if (sidebarRef.current) {
            sidebarRef.current.scrollTop = e.currentTarget.scrollTop;
        }

        if (isNavigating) return;

        const { scrollLeft, scrollWidth, clientWidth } = e.currentTarget;
        const threshold = 50; // pixels from edge to trigger navigation

        // Critical: Check if Horizontal Scroll actually changed
        // This prevents vertical scrolling from accidentally triggering time navigation
        const deltaX = Math.abs(scrollLeft - lastScrollLeft.current);
        if (deltaX === 0) return; // Vertical scroll only

        lastScrollLeft.current = scrollLeft;

        // Check if scrolled to right edge (Next Period)
        if (scrollLeft + clientWidth >= scrollWidth - threshold) {
            // Guard: Prevent scrolling into future
            if (!isAtFutureLimit) {
                setIsNavigating(true);
                navigateDate('next');
                // Lock is released by useEffect on dateRange change
            }
        }
        // Check if scrolled to left edge (Prev Period)
        else if (scrollLeft <= 5) { // Close to 0
            setIsNavigating(true);
            navigateDate('prev');
            // Lock is released by useEffect on dateRange change
        }
    };

    // Handle Wheel/Touchpad horizontal swipe when content fits screen (no overflow)
    const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
        if (isNavigating) return;

        // Detect horizontal scroll intent:
        // 1. Direct horizontal scroll (deltaX)
        // 2. Shift + vertical scroll (common pattern for horizontal navigation)
        const isHorizontalIntent = Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey;

        if (!isHorizontalIntent) return;

        // Determine direction from deltaX (or deltaY if shift is held)
        const delta = e.shiftKey ? e.deltaY : e.deltaX;

        // Threshold to prevent accidental triggers
        if (Math.abs(delta) < 10) return;

        // Prevent default to avoid page scroll
        e.preventDefault();

        // Navigate based on direction
        if (delta > 0) {
            // Scroll right = Next period
            if (!isAtFutureLimit) {
                setIsNavigating(true);
                navigateDate('next');
            }
        } else {
            // Scroll left = Previous period
            setIsNavigating(true);
            navigateDate('prev');
        }
    };

    if (isMobile) {
        return (
            <Card className={`flex flex-col h-full border-slate-200 shadow-sm bg-slate-50 ${className}`}>
                <div className="p-3 border-b border-slate-200 bg-white sticky top-0 z-20">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <CalendarDays className="w-5 h-5 text-slate-500" />
                        Current Activity
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                        {workOrders.length} active jobs · Sorted by priority
                    </p>
                </div>
                <div className="p-3 overflow-y-auto flex-1">
                    {groupedData.flatMap(g => g.items).map(wo => (
                        <MobileTimelineCard key={wo.id} workOrder={wo} onClick={() => onWorkOrderClick?.(wo)} />
                    ))}
                </div>
            </Card>
        );
    }

    return (
        <Card className={`timeline-container flex flex-col h-full min-h-0 border-slate-200 shadow-sm overflow-hidden ${className}`}>
            {/* Header Controls */}
            <div className="flex items-center justify-between p-3 border-b border-slate-200 bg-white">
                <div className="flex items-center gap-3">
                    {/* Date Nav */}
                    <div className="flex items-center gap-1 bg-slate-100 rounded-md p-0.5">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => navigateDate('prev')}>
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-sm font-semibold w-40 text-center">
                            {viewMode === 'day' && dayjs(baseDate).format('ddd, MMM D')}
                            {viewMode === 'week' && `${dayjs(dateRange.from).format('MMM D')} - ${dayjs(dateRange.to).format('MMM D')}`}
                            {viewMode === 'month' && `${dayjs(dateRange.from).format('MMM D')} - ${dayjs(dateRange.to).format('MMM D')}`}
                        </span>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => navigateDate('next')} disabled={isAtFutureLimit}>
                            <ChevronRight className={`w-4 h-4 ${isAtFutureLimit ? 'text-slate-300' : ''}`} />
                        </Button>
                    </div>

                    <div className="h-4 w-px bg-slate-300 mx-1" />

                    {/* Today Button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => setBaseDate(new Date())}
                    >
                        Today
                    </Button>

                    <div className="h-4 w-px bg-slate-300 mx-1" />

                    {/* View Mode Switcher */}
                    <div className="flex bg-slate-100 rounded-md p-0.5">
                        {['day', 'week', 'month'].map((m) => (
                            <button
                                key={m}
                                onClick={() => setViewMode(m as any)}
                                className={`px-3 py-1 text-xs font-medium rounded-sm transition-all ${viewMode === m ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
                            >
                                {m.charAt(0).toUpperCase() + m.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-semibold">Group by</span>
                    <Select value={groupBy} onValueChange={(v) => setGroupBy(v as any)}>
                        <SelectTrigger className="w-[140px] h-8 text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="z-[70]">
                            <SelectItem value="technician"><div className="flex items-center gap-2"><User className="w-3 h-3" /> Technician</div></SelectItem>
                            <SelectItem value="location"><div className="flex items-center gap-2"><MapPin className="w-3 h-3" /> Location</div></SelectItem>
                            <SelectItem value="status"><div className="flex items-center gap-2"><Layers className="w-3 h-3" /> Status</div></SelectItem>
                            <SelectItem value="none"><div className="flex items-center gap-2"><Hash className="w-3 h-3" /> None</div></SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Main Content Split View - Forces strict height constraint */}
            <div className="flex-1 flex overflow-hidden min-h-0">
                {/* Left Pane: Sidebar (Vertical Scroll Only - Synced via JS) */}
                <div
                    ref={sidebarRef}
                    className="w-60 flex-shrink-0 bg-white border-r border-slate-200 z-40 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.1)] overflow-hidden"
                >
                    {/* Header Spacer - Fixed */}
                    <div className="sticky top-0 z-30 bg-white border-b border-slate-200 h-12 flex-shrink-0" />

                    {groupedData.map(group => (
                        <div key={group.id}>
                            <div className="h-10 bg-slate-50 px-4 border-b border-slate-100 text-xs font-bold text-slate-600 sticky top-0 z-10 flex items-center">
                                {group.label} ({group.items.length})
                            </div>
                            {group.items.map((wo, i) => (
                                <div
                                    key={wo.id}
                                    className={`h-9 border-b border-slate-100 px-4 flex flex-col justify-center cursor-pointer group transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-blue-50/50`}
                                    onClick={() => onWorkOrderClick?.(wo)}
                                >
                                    <div className="font-semibold text-slate-800 text-xs group-hover:text-blue-600 transition-colors truncate">
                                        {wo.vehicle?.license_plate || 'No Plate'}
                                        <span className="text-slate-400 mx-1.5">•</span>
                                        <span className="text-slate-500 font-normal">{wo.work_order_number}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>

                {/* Right Pane: Grid (Vertical + Horizontal Scroll) */}
                <div
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    onWheel={handleWheel}
                    className="flex-1 overflow-x-scroll overflow-y-auto relative timeline-scrollbar"
                >
                    {/* Timeline Canvas Wrapper */}
                    <div className="bg-slate-50 relative min-w-fit flex-1">
                        <TimelineGrid viewMode={viewMode} dateRange={dateRange} totalWidthPx={totalWidth ? Math.max(totalWidth, 800) : null} currentTime={currentTime}>
                            {groupedData.map(group => (
                                <div key={group.id}>
                                    {/* Spacer for Group Header - synced sticky */}
                                    <div className="h-10 border-b border-transparent sticky top-0 z-10 bg-slate-50/50 backdrop-blur-[1px]" />
                                    {group.items.map((wo, i) => (
                                        <div key={wo.id} className="h-9 relative border-b border-slate-100/50">
                                            {/* Zebra background for grid rows to match sidebar */}
                                            <div className={`absolute inset-0 w-full h-full pointer-events-none ${i % 2 === 0 ? 'bg-white/50' : 'bg-slate-50/30'}`} />

                                            {/* Render Bars */}
                                            <div className="relative z-10 h-full">
                                                <TimelineRow
                                                    workOrder={wo}
                                                    timelineStart={dateRange.from}
                                                    timelineEnd={dateRange.to}
                                                    pxPerMs={PX_PER_MS}
                                                    rowHeight={36}
                                                    usePercentage={true}
                                                    currentTime={currentTime}
                                                    className={`${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/20'} hover:bg-blue-50/50 transition-colors`}
                                                    onClick={() => onWorkOrderClick?.(wo)}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </TimelineGrid>
                    </div>
                </div>

                {/* Loading Overlay - Only show for initial data loading, not navigation */}
                {isLoading && (
                    <div className="absolute inset-0 bg-white/60 z-50 flex items-center justify-center backdrop-blur-[1px]">
                        <div className="flex flex-col items-center gap-2">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-primary"></div>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};
