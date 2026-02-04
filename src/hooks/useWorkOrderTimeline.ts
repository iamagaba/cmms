
import { useMemo } from 'react';
import { WorkOrder } from '@/types/supabase';
import { TimelineWorkOrder, StatusSegment } from '@/components/work-order-timeline/types';
import dayjs from 'dayjs';

/**
 * Regex to parse status change messages.
 * Matches: "Status changed from 'Old Status' to 'New Status'."
 * Captures: [1] Old Status, [2] New Status
 */
const STATUS_CHANGE_REGEX = /Status changed from '([^']+)' to '([^']+)'.*/i;

/**
 * Helper to parse a single work order's activity log into status segments
 */
const parseStatusHistory = (workOrder: WorkOrder): StatusSegment[] => {
    const segments: StatusSegment[] = [];
    const activityLog = (workOrder.activity_log as any[]) || [];
    const createdAt = dayjs(workOrder.created_at);
    const now = dayjs(); // Current time - recalculated each time

    // Sort log by timestamp ascending to process history linearly
    const sortedLog = [...activityLog].sort((a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Initial state
    // CRITICAL FIX: Determine the STARTING status, do not use the current workOrder.status
    let currentStatus = 'New';

    // Try to find the first status change to see what we started from
    const firstStatusChange = sortedLog.find(log => log.activity?.match(STATUS_CHANGE_REGEX));
    if (firstStatusChange) {
        const match = firstStatusChange.activity.match(STATUS_CHANGE_REGEX);
        if (match && match[1]) {
            currentStatus = match[1];
        }
    } else if (workOrder.status) {
        // If there are NO status changes in the log, then the current status 
        // has likely been the status since creation (or logs are missing).
        currentStatus = workOrder.status;
    }

    let currentStart = createdAt;

    sortedLog.forEach((log) => {
        // Check if this log entry is a status change
        const match = log.activity?.match(STATUS_CHANGE_REGEX);

        if (match) {
            const newStatus = match[2]; // The status being changed TO
            const timestamp = dayjs(log.timestamp);

            // Close the previous segment
            if (timestamp.isAfter(currentStart)) {
                segments.push({
                    status: currentStatus,
                    start: currentStart.toDate(),
                    end: timestamp.toDate(),
                    durationMs: timestamp.diff(currentStart)
                });
            }

            // Start the new segment
            currentStatus = newStatus;
            currentStart = timestamp;
        }
    });

    // Close the final segment (from last change until now/completed_at)
    let endTime = now;

    // For completed work orders, use completed_at
    if (workOrder.status === 'Completed' && workOrder.completed_at) {
        endTime = dayjs(workOrder.completed_at);
    }
    // For cancelled work orders, use now (or could use cancellation timestamp if available)
    else if (workOrder.status === 'Cancelled') {
        endTime = now;
    }
    // For all other statuses (New, In Progress, On Hold, etc.), use current time
    else {
        endTime = now;
    }

    // Ensure logical end time (don't go before start)
    if (endTime.isBefore(currentStart)) {
        endTime = currentStart;
    }

    segments.push({
        status: currentStatus,
        start: currentStart.toDate(),
        end: endTime.toDate(),
        durationMs: endTime.diff(currentStart)
    });

    return segments;
};

export const useWorkOrderTimeline = (workOrders: WorkOrder[]): TimelineWorkOrder[] => {
    return useMemo(() => {
        if (!workOrders) return [];

        return workOrders.map(wo => {
            const statusHistory = parseStatusHistory(wo);
            const totalDurationMs = statusHistory.reduce((acc, seg) => acc + seg.durationMs, 0);
            const currentStatusDurationMs = statusHistory[statusHistory.length - 1]?.durationMs || 0;

            return {
                ...wo,
                statusHistory,
                totalDurationMs,
                currentStatusDurationMs
            };
        });
    }, [workOrders]);
};
