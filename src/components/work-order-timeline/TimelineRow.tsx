
import React from 'react';
import { TimelineWorkOrder } from './types';
import { TimelineBar } from './TimelineBar';

interface TimelineRowProps {
    workOrder: TimelineWorkOrder;
    timelineStart: Date;
    timelineEnd: Date;
    pxPerMs: number | null;
    rowHeight?: number;
    usePercentage?: boolean;
    currentTime?: Date;
    className?: string;
    onClick?: () => void;
}

export const TimelineRow: React.FC<TimelineRowProps> = ({
    workOrder,
    timelineStart,
    timelineEnd,
    pxPerMs,
    rowHeight = 36,
    usePercentage = false,
    currentTime = new Date(),
    className,
    onClick
}) => {
    // Calculate position and width
    const startMs = workOrder.statusHistory[0]?.start.getTime() || new Date(workOrder.created_at).getTime();

    // Determine the effective end time
    // For active work orders (not Completed/Cancelled), the bar should stop at current time
    const originalEndMs = workOrder.statusHistory[workOrder.statusHistory.length - 1]?.end.getTime() || Date.now();
    let displaySegments = [...workOrder.statusHistory];

    const isActive = workOrder.status !== 'Completed' && workOrder.status !== 'Cancelled';
    const currentTimeMs = currentTime.getTime();

    // For active work orders, CLAMP the end time to never exceed currentTime
    // This ensures bars don't extend past the "NOW" line
    let endMs = originalEndMs;
    if (isActive) {
        // Clamp to current time - the bar should stop at NOW, not extend into the future
        endMs = Math.min(originalEndMs, currentTimeMs);

        // Also need to update the last segment so TimelineBar renders correctly
        const lastSegment = displaySegments[displaySegments.length - 1];
        if (lastSegment) {
            const segmentStartMs = lastSegment.start.getTime();
            // Clamp the segment end time as well
            const clampedEndMs = Math.min(lastSegment.end.getTime(), currentTimeMs);
            const newDuration = Math.max(0, clampedEndMs - segmentStartMs);

            displaySegments = [
                ...displaySegments.slice(0, -1),
                {
                    ...lastSegment,
                    end: new Date(clampedEndMs),
                    durationMs: newDuration
                }
            ];
        }
    }

    const timelineStartMs = timelineStart.getTime();
    const timelineEndMs = timelineEnd.getTime();
    const totalTimelineDuration = timelineEndMs - timelineStartMs;
    const offsetMs = startMs - timelineStartMs;
    const workOrderDurationMs = endMs - startMs;

    const leftPos = usePercentage
        ? `${(offsetMs / totalTimelineDuration) * 100}%`
        : `${offsetMs * (pxPerMs || 0)}px`;

    // Width of the entire work order bar
    const barWidth = usePercentage
        ? `${Math.max(0.5, (workOrderDurationMs / totalTimelineDuration) * 100)}%`
        : `${Math.max(4, workOrderDurationMs * (pxPerMs || 0))}px`;

    return (
        <div
            className={`relative w-full border-b border-slate-100 transition-colors group cursor-pointer ${className || ''}`}
            style={{ height: `${rowHeight}px` }}
            onClick={onClick}
        >
            <div
                className="absolute top-1/2 -translate-y-1/2"
                style={{ left: leftPos, width: barWidth }}
            >
                <TimelineBar
                    segments={displaySegments}
                    pxPerMs={pxPerMs || 0}
                    totalWidthPercent={100}
                    usePercentage={usePercentage}
                    totalDuration={workOrderDurationMs}
                />
            </div>
        </div>
    );
};
