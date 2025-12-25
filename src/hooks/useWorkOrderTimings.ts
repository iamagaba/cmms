import { useState, useEffect, useMemo } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { WorkOrder } from '@/types/supabase';

dayjs.extend(duration);

export interface StageTiming {
    start: Dayjs | null;
    end: Dayjs | null;
    activeDurationMs: number;
    onHoldDurationMs: number;
}

export const formatDuration = (ms: number): string => {
    if (ms < 0) return '';

    const totalSeconds = Math.floor(ms / 1000);

    if (totalSeconds < 60) {
        return '0m';
    }

    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);

    return parts.join(' ');
};

export const useWorkOrderTimings = (workOrder: WorkOrder) => {
    const [now, setNow] = useState(dayjs());

    useEffect(() => {
        const timer = setInterval(() => {
            if (workOrder.status !== 'Completed') {
                setNow(dayjs());
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [workOrder.status]);

    const steps = useMemo(() => ['Open', 'Confirmation', 'Ready', 'In Progress', 'Completed'], []);

    let currentStepIndex = steps.indexOf(workOrder.status || 'Open');
    if (workOrder.status === 'On Hold') {
        currentStepIndex = steps.indexOf('In Progress');
    }

    const stageTimings = useMemo(() => {
        const createdAt = (workOrder as any).createdAt ?? workOrder.created_at ?? null;
        const confirmedAt = (workOrder as any).confirmedAt ?? workOrder.confirmed_at ?? null;
        const workStartedAt = (workOrder as any).workStartedAt ?? workOrder.work_started_at ?? null;

        const timings: Record<string, StageTiming> = {};
        steps.forEach(step => {
            timings[step] = { start: null, end: null, activeDurationMs: 0, onHoldDurationMs: 0 };
        });

        let currentStatus: WorkOrder['status'] = 'Open';

        if (createdAt) {
            timings['Open'].start = dayjs(createdAt);
        }

        const sortedActivityLog = [...(workOrder.activityLog || [])].sort((a, b) =>
            dayjs(a.timestamp).diff(dayjs(b.timestamp))
        );

        for (const log of sortedActivityLog) {
            const eventTime = dayjs(log.timestamp);
            const statusChangeMatch = log.activity.match(/Status changed from '(.+)' to '(.+)'/);

            if (statusChangeMatch) {
                const newStatus = statusChangeMatch[2] as WorkOrder['status'];
                const prevKey = (currentStatus || 'Open') as string;
                const nextKey = (newStatus || 'Open') as string;

                if (currentStatus !== 'On Hold' && timings[prevKey].start && !timings[prevKey].end) {
                    timings[prevKey].end = eventTime;
                }

                if (newStatus !== 'On Hold' && timings[nextKey].start === null) {
                    timings[nextKey].start = eventTime;
                }
                currentStatus = newStatus;
            }
        }

        if (confirmedAt && timings['Confirmation'].start === null) {
            timings['Confirmation'].start = dayjs(confirmedAt);
        }
        if (workStartedAt && timings['In Progress'].start === null) {
            timings['In Progress'].start = dayjs(workStartedAt);
        }

        const stageOrder = ['Open', 'Confirmation', 'Ready', 'In Progress', 'Completed'];

        if (timings['In Progress'].start && !timings['Ready'].start) {
            const hasReachedInProgress = currentStepIndex >= steps.indexOf('In Progress');

            if (hasReachedInProgress) {
                const readyTransition = sortedActivityLog.find(log =>
                    log.activity.includes(`to 'Ready'`)
                );

                if (readyTransition) {
                    timings['Ready'].start = dayjs(readyTransition.timestamp);
                    timings['Ready'].end = timings['In Progress'].start;
                } else {
                    const readyStartTime = timings['Confirmation'].end ||
                        (timings['Confirmation'].start ?
                            timings['Confirmation'].start.add(1, 'minute') :
                            timings['In Progress'].start.subtract(1, 'minute'));

                    timings['Ready'].start = readyStartTime;
                    timings['Ready'].end = timings['In Progress'].start;
                }
            }
        }

        if (workOrder.status === 'Ready' && !timings['Ready'].start) {
            const readyLog = sortedActivityLog.find(log => log.activity.includes(`to 'Ready'`));
            if (readyLog) {
                timings['Ready'].start = dayjs(readyLog.timestamp);
            } else {
                const fallbackStart = timings['Confirmation'].end
                    || timings['Confirmation'].start
                    || (createdAt ? dayjs(createdAt) : now);
                timings['Ready'].start = fallbackStart;
            }
            if (timings['Confirmation'].start && !timings['Confirmation'].end) {
                timings['Confirmation'].end = timings['Ready'].start;
            }
        }

        for (let i = 0; i < stageOrder.length - 1; i++) {
            const currentStage = stageOrder[i];
            const nextStage = stageOrder[i + 1];

            if (timings[nextStage].start && timings[currentStage].start && !timings[currentStage].end) {
                timings[currentStage].end = timings[nextStage].start;
            }

            if (timings[currentStage].end && !timings[nextStage].start && i < stageOrder.length - 2) {
                const currentStepIndex = steps.indexOf(workOrder.status || 'Open');
                if (currentStepIndex > i + 1) {
                    timings[nextStage].start = timings[currentStage].end;
                }
            }
        }

        for (let i = 0; i < steps.length - 1; i++) {
            const step = steps[i];
            const next = steps[i + 1];
            if (timings[step].start && !timings[step].end && timings[next].start) {
                timings[step].end = timings[next].start;
            }
        }

        const finalStatus = workOrder.status;

        if (finalStatus === 'Completed') {
            if (workOrder.completedAt && !timings['Completed'].start) {
                timings['Completed'].start = dayjs(workOrder.completedAt);
            }
            if (timings['Completed'].start && !timings['Completed'].end) {
                timings['Completed'].end = workOrder.completedAt ? dayjs(workOrder.completedAt) : timings['Completed'].start;
            }
        } else if (finalStatus === 'On Hold') {
            if (timings['In Progress'].start && !timings['In Progress'].end) {
                timings['In Progress'].end = now;
            }
        } else if (finalStatus) {
            if (timings[finalStatus].start && !timings[finalStatus].end) {
                timings[finalStatus].end = now;
            }
        }

        const currentStepIdx = steps.indexOf(workOrder.status || 'Open');
        for (let i = 0; i < currentStepIdx; i++) {
            const stage = steps[i];
            if (timings[stage].start && !timings[stage].end) {
                const nextStageStart = i < steps.length - 1 ? timings[steps[i + 1]].start : null;
                timings[stage].end = nextStageStart || now;
            }
        }

        if (currentStepIdx > steps.indexOf('Ready') && !timings['Ready'].start) {
            const confirmationEnd = timings['Confirmation'].end;
            const inProgressStart = timings['In Progress'].start;

            if (confirmationEnd && inProgressStart) {
                timings['Ready'].start = confirmationEnd;
                timings['Ready'].end = inProgressStart;
            } else if (inProgressStart) {
                timings['Ready'].start = inProgressStart.subtract(1, 'minute');
                timings['Ready'].end = inProgressStart;
            }
        }

        const onHoldPeriods: { start: Dayjs; end: Dayjs }[] = [];
        let tempOnHoldStart: Dayjs | null = null;
        let currentStatusForOnHold: WorkOrder['status'] = 'Open';

        const allEventsForOnHold: { time: Dayjs; status: WorkOrder['status'] }[] = [];
        if (workOrder.created_at) {
            allEventsForOnHold.push({ time: dayjs(workOrder.created_at), status: 'Open' });
        }
        (workOrder.activityLog || []).forEach(log => {
            const statusChangeMatch = log.activity.match(/Status changed from '(.+)' to '(.+)'/);
            if (statusChangeMatch) {
                allEventsForOnHold.push({ time: dayjs(log.timestamp), status: statusChangeMatch[2] as WorkOrder['status'] });
            }
        });
        if (workOrder.status === 'Completed' && workOrder.completedAt) {
            allEventsForOnHold.push({ time: dayjs(workOrder.completedAt), status: 'Completed' });
        } else if (workOrder.status !== 'Completed') {
            allEventsForOnHold.push({ time: now, status: workOrder.status });
        }
        allEventsForOnHold.sort((a, b) => a.time.diff(b.time));

        for (const event of allEventsForOnHold) {
            if (event.status === 'On Hold' && !tempOnHoldStart) {
                tempOnHoldStart = event.time;
            } else if (currentStatusForOnHold === 'On Hold' && event.status !== 'On Hold' && tempOnHoldStart) {
                onHoldPeriods.push({ start: tempOnHoldStart, end: event.time });
                tempOnHoldStart = null;
            }
            currentStatusForOnHold = event.status;
        }
        if (tempOnHoldStart && currentStatusForOnHold === 'On Hold') {
            onHoldPeriods.push({ start: tempOnHoldStart, end: now });
        }

        steps.forEach(step => {
            const timing = timings[step];
            if (timing.start && timing.end) {
                const totalTimeInStage = timing.end.diff(timing.start);
                let onHoldTimeInThisStage = 0;

                for (const period of onHoldPeriods) {
                    const overlapStart = timing.start && period.start ? dayjs(Math.max(timing.start.valueOf(), period.start.valueOf())) : null;
                    const overlapEnd = timing.end && period.end ? dayjs(Math.min(timing.end.valueOf(), period.end.valueOf())) : null;

                    if (overlapStart && overlapEnd && overlapEnd.isAfter(overlapStart)) {
                        onHoldTimeInThisStage += overlapEnd.diff(overlapStart);
                    }
                }
                timing.onHoldDurationMs = onHoldTimeInThisStage;
                timing.activeDurationMs = totalTimeInStage - onHoldTimeInThisStage;
            }
        });

        return timings;
    }, [workOrder, now, steps]);

    const getStatusTimestamp = (stage: string): string | null => {
        const stageTiming = stageTimings[stage];
        if (stageTiming && stageTiming.start) {
            return stageTiming.start.format('MMM D, h:mm A');
        }

        const createdAtTS = (workOrder as any).createdAt ?? workOrder.created_at;
        const confirmedAt = (workOrder as any).confirmedAt ?? workOrder.confirmed_at;
        const workStartedAt = (workOrder as any).workStartedAt ?? workOrder.work_started_at;

        if (stage === 'Open' && createdAtTS) {
            return dayjs(createdAtTS).format('MMM D, h:mm A');
        }
        if (stage === 'Confirmation' && confirmedAt) {
            return dayjs(confirmedAt).format('MMM D, h:mm A');
        }
        if (stage === 'In Progress' && workStartedAt) {
            return dayjs(workStartedAt).format('MMM D, h:mm A');
        }
        if (stage === 'Completed' && workOrder.completedAt) {
            return dayjs(workOrder.completedAt).format('MMM D, h:mm A');
        }

        const logEntry = (workOrder.activityLog || []).find(log =>
            log.activity.includes(`to '${stage}'`)
        );
        return logEntry ? dayjs(logEntry.timestamp).format('MMM D, h:mm A') : null;
    };

    const totalElapsedInfo = useMemo(() => {
        const createdAt = (workOrder as any).createdAt ?? workOrder.created_at;
        if (!createdAt) return { totalMs: 0, activeMs: 0, onHoldMs: 0, percentComplete: 0 };

        const start = dayjs(createdAt);
        const totalMs = workOrder.status === 'Completed' && workOrder.completedAt
            ? dayjs(workOrder.completedAt).diff(start)
            : now.diff(start);

        let totalActiveMs = 0;
        let totalOnHoldMs = 0;

        steps.forEach(step => {
            const timing = stageTimings[step];
            if (timing) {
                totalActiveMs += timing.activeDurationMs;
                totalOnHoldMs += timing.onHoldDurationMs;
            }
        });

        const percentComplete = workOrder.status === 'Completed'
            ? 100
            : Math.round((currentStepIndex / (steps.length - 1)) * 100);

        return {
            totalMs,
            activeMs: totalActiveMs,
            onHoldMs: totalOnHoldMs,
            percentComplete
        };
    }, [workOrder, stageTimings, steps, currentStepIndex, now]);

    const slaStatus = useMemo((): 'on-time' | 'at-risk' | 'overdue' => {
        if (!workOrder.slaDue) return 'on-time';

        const slaDue = dayjs(workOrder.slaDue);
        const hoursRemaining = slaDue.diff(now, 'hours', true);

        if (workOrder.status === 'Completed') {
            return workOrder.completedAt && dayjs(workOrder.completedAt).isBefore(slaDue)
                ? 'on-time'
                : 'overdue';
        }

        if (hoursRemaining < 0) return 'overdue';
        if (hoursRemaining < 4) return 'at-risk';
        return 'on-time';
    }, [workOrder, now]);

    const getStepDetails = (step: string) => {
        const timing = stageTimings[step];
        const timestamp = getStatusTimestamp(step);

        const logEntry = (workOrder.activityLog || []).find(log =>
            log.activity.includes(`to '${step}'`)
        );
        const changedBy = logEntry?.userId || null;

        return {
            start: timing?.start ? timing.start.format('MMM D, YYYY h:mm A') : 'N/A',
            end: timing?.end ? timing.end.format('MMM D, YYYY h:mm A') : 'In Progress',
            activeDuration: timing ? formatDuration(timing.activeDurationMs) : 'N/A',
            pausedDuration: timing && timing.onHoldDurationMs > 0 ? formatDuration(timing.onHoldDurationMs) : 'None',
            changedBy: changedBy || 'System',
            timestamp
        };
    };

    return {
        steps,
        currentStepIndex,
        stageTimings,
        slaStatus,
        totalElapsedInfo,
        getStepDetails,
        getStatusTimestamp
    };
};
