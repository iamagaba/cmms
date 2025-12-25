import { useState, useEffect, useMemo } from 'react';
import { Steps, Popover, Typography } from 'antd';
import React from 'react';
import dayjs, { Dayjs } from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { WorkOrder } from '@/types/supabase';

dayjs.extend(duration);

const { Step } = Steps;
const { Text } = Typography;

interface StageTiming {
  start: Dayjs | null;
  end: Dayjs | null;
  activeDurationMs: number;
  onHoldDurationMs: number; // Total on-hold time that occurred *during* this stage's period
}

// Helper to format milliseconds into human-readable string
const formatDuration = (ms: number): string => {
  if (ms < 0) return '';
  
  const totalSeconds = Math.floor(ms / 1000);

  if (totalSeconds < 60) { // If less than 1 minute
    return '0m'; // Show 0 minutes
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

interface WorkOrderProgressTrackerProps {
  workOrder: WorkOrder;
  type?: 'default' | 'inline' | 'navigation';
  showDescriptions?: boolean;
  customDotColors?: boolean; // when true, use system status colors for dots
}

const WorkOrderProgressTracker = ({ workOrder, type = 'default', showDescriptions = true, customDotColors = false }: WorkOrderProgressTrackerProps) => {
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
    currentStepIndex = steps.indexOf('In Progress'); // 'On Hold' is a state within 'In Progress' for the tracker
  }

  const stageTimings = useMemo(() => {
    // Support both snake_case and camelCase, as data mapping can vary
    const createdAt = (workOrder as any).createdAt ?? workOrder.created_at ?? null;
    const confirmedAt = (workOrder as any).confirmedAt ?? workOrder.confirmed_at ?? null;
    const workStartedAt = (workOrder as any).workStartedAt ?? workOrder.work_started_at ?? null;

    const timings: Record<string, StageTiming> = {};
    steps.forEach(step => {
      timings[step] = { start: null, end: null, activeDurationMs: 0, onHoldDurationMs: 0 };
    });

    // 1. Determine the start and end times for each *sequential* stage
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

        // Set end time for the previous stage
        if (currentStatus !== 'On Hold' && timings[prevKey].start && !timings[prevKey].end) {
          timings[prevKey].end = eventTime;
        }

        // Set start time for the new stage (if not 'On Hold')
        if (newStatus !== 'On Hold' && timings[nextKey].start === null) {
          timings[nextKey].start = eventTime;
        }
        currentStatus = newStatus;
      }
    }

    // Enhanced fallbacks for known timestamps when logs are missing or coarse:
    
    // Set database timestamp fallbacks for stages that have specific database fields
    if (confirmedAt && timings['Confirmation'].start === null) {
      timings['Confirmation'].start = dayjs(confirmedAt);
    }
    if (workStartedAt && timings['In Progress'].start === null) {
      timings['In Progress'].start = dayjs(workStartedAt);
    }
    
    // Ensure sequential stage transitions are properly connected
    // If we have database timestamps but missing activity log transitions, infer the missing connections
    const stageOrder = ['Open', 'Confirmation', 'Ready', 'In Progress', 'Completed'];
    
    // Special handling for Ready status - it often gets skipped in direct transitions
    // If we have 'In Progress' start time but no 'Ready' timing, infer the Ready stage
    if (timings['In Progress'].start && !timings['Ready'].start) {
      // Check if the work order ever went through Ready status by looking at current/past status
      const currentStepIndex = steps.indexOf(workOrder.status || 'Open');
      const hasReachedInProgress = currentStepIndex >= steps.indexOf('In Progress');
      
      if (hasReachedInProgress) {
        // Look for any explicit Ready transition in activity log first
        const readyTransition = sortedActivityLog.find(log => 
          log.activity.includes(`to 'Ready'`)
        );
        
        if (readyTransition) {
          timings['Ready'].start = dayjs(readyTransition.timestamp);
          timings['Ready'].end = timings['In Progress'].start;
        } else {
          // If Confirmation ended, use that as Ready start, otherwise use a reasonable fallback
          const readyStartTime = timings['Confirmation'].end || 
                                 (timings['Confirmation'].start ? 
                                  timings['Confirmation'].start.add(1, 'minute') : 
                                  timings['In Progress'].start.subtract(1, 'minute'));
          
          timings['Ready'].start = readyStartTime;
          timings['Ready'].end = timings['In Progress'].start;
        }
      }
    }

    // If the current status is Ready but we still don't have a Ready start,
    // derive a sensible fallback so timestamp and time-in-status render.
    if (workOrder.status === 'Ready' && !timings['Ready'].start) {
      // Prefer an explicit activity log transition to 'Ready'
      const readyLog = sortedActivityLog.find(log => log.activity.includes(`to 'Ready'`));
      if (readyLog) {
        timings['Ready'].start = dayjs(readyLog.timestamp);
      } else {
        // Fallbacks: use Confirmation completion if known, otherwise Confirmation start,
        // then createdAt as a last resort
        const fallbackStart = timings['Confirmation'].end
          || timings['Confirmation'].start
          || (createdAt ? dayjs(createdAt) : now);
        timings['Ready'].start = fallbackStart;
      }
      // Ensure sequential connection: Confirmation should end when Ready starts
      if (timings['Confirmation'].start && !timings['Confirmation'].end) {
        timings['Confirmation'].end = timings['Ready'].start;
      }
    }
    
    for (let i = 0; i < stageOrder.length - 1; i++) {
      const currentStage = stageOrder[i];
      const nextStage = stageOrder[i + 1];
      
      // If the next stage has a start time but current stage has no end time, connect them
      if (timings[nextStage].start && timings[currentStage].start && !timings[currentStage].end) {
        timings[currentStage].end = timings[nextStage].start;
      }
      
      // If current stage has an end time but next stage has no start time, infer the start
      if (timings[currentStage].end && !timings[nextStage].start && i < stageOrder.length - 2) {
        // Only infer if we know the work order has progressed past this stage
        const currentStepIndex = steps.indexOf(workOrder.status || 'Open');
        if (currentStepIndex > i + 1) {
          timings[nextStage].start = timings[currentStage].end;
        }
      }
    }

    // After establishing starts (including fallbacks), set missing ends from next stage's start
    for (let i = 0; i < steps.length - 1; i++) {
      const step = steps[i];
      const next = steps[i + 1];
      if (timings[step].start && !timings[step].end && timings[next].start) {
        timings[step].end = timings[next].start;
      }
    }

    // Set end time for the current/last active stage
    const finalStatus = workOrder.status;
    
    if (finalStatus === 'Completed') {
      // For completed work orders, ensure the Completed stage has proper timing
      if (workOrder.completedAt && !timings['Completed'].start) {
        timings['Completed'].start = dayjs(workOrder.completedAt);
      }
      if (timings['Completed'].start && !timings['Completed'].end) {
        timings['Completed'].end = workOrder.completedAt ? dayjs(workOrder.completedAt) : timings['Completed'].start;
      }
    } else if (finalStatus === 'On Hold') {
      // For on-hold work orders, the 'In Progress' stage's active period should end now
      if (timings['In Progress'].start && !timings['In Progress'].end) {
        timings['In Progress'].end = now;
      }
    } else if (finalStatus) {
      // For active work orders, set end time to now for duration calculation
      if (timings[finalStatus].start && !timings[finalStatus].end) {
        timings[finalStatus].end = now;
      }
    }
    
    // Final cleanup: ensure all completed stages have end times
    const currentStepIdx = steps.indexOf(workOrder.status || 'Open');
    for (let i = 0; i < currentStepIdx; i++) {
      const stage = steps[i];
      if (timings[stage].start && !timings[stage].end) {
        // If this is a completed stage but has no end time, use the next stage's start or now
        const nextStageStart = i < steps.length - 1 ? timings[steps[i + 1]].start : null;
        timings[stage].end = nextStageStart || now;
      }
    }
    
    // Additional Ready status handling: if Ready stage is passed but has no timing at all
    if (currentStepIdx > steps.indexOf('Ready') && !timings['Ready'].start) {
      // This handles cases where Ready was skipped entirely
      const confirmationEnd = timings['Confirmation'].end;
      const inProgressStart = timings['In Progress'].start;
      
      if (confirmationEnd && inProgressStart) {
        // Create a minimal Ready period between Confirmation end and In Progress start
        timings['Ready'].start = confirmationEnd;
        timings['Ready'].end = inProgressStart;
      } else if (inProgressStart) {
        // Fallback: assume Ready lasted 1 minute before In Progress
        timings['Ready'].start = inProgressStart.subtract(1, 'minute');
        timings['Ready'].end = inProgressStart;
      }
    }


    // 2. Calculate total on-hold periods
  const onHoldPeriods: { start: Dayjs; end: Dayjs }[] = [];
  let tempOnHoldStart: Dayjs | null = null;
  let currentStatusForOnHold: WorkOrder['status'] = 'Open'; // Track status for on-hold logic

    // Re-process events to find on-hold periods
    const allEventsForOnHold: { time: Dayjs; status: WorkOrder['status'] }[] = [];
    if (workOrder.created_at) {
      allEventsForOnHold.push({ time: dayjs(workOrder.created_at), status: 'Open' });
    }
    (workOrder.activityLog || []).forEach(log => {
      const statusChangeMatch = log.activity.match(/Status changed from '(.+)' to '(.+)'/);
      if (statusChangeMatch) {
        allEventsForOnHold.push({ time: dayjs(log.timestamp), status: statusChangeMatch[2] as WorkOrder['status'] });
      }
    }
    );
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
    // If currently on hold
    if (tempOnHoldStart && currentStatusForOnHold === 'On Hold') {
      onHoldPeriods.push({ start: tempOnHoldStart, end: now });
    }

    // 3. Distribute active and on-hold durations to stages
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
    // First, try to get timestamp from the calculated stage timings
    const stageTiming = stageTimings[stage];
    if (stageTiming && stageTiming.start) {
      return stageTiming.start.format('MMM D, h:mm A');
    }
    
    // Fallback: try direct database fields for specific statuses
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
    
    // Final fallback: search activity log for status transitions
    const logEntry = (workOrder.activityLog || []).find(log =>
      log.activity.includes(`to '${stage}'`)
    );
    return logEntry ? dayjs(logEntry.timestamp).format('MMM D, h:mm A') : null;
  };

  return (
    <div style={customDotColors ? { '--ant-steps-nav-content-max-width': 'auto' } as React.CSSProperties : undefined}>
      <Steps 
        current={currentStepIndex} 
        size="small" 
        type={type as any} 
        style={customDotColors ? {
          '--ant-steps-icon-size': '10px',
          '--ant-steps-dot-size': '10px',
        } as React.CSSProperties : undefined}
      >
        {steps.map((step, index) => {
        const timestamp = getStatusTimestamp(step);
        let stepStatus: 'wait' | 'process' | 'finish' | 'error' = 'wait';

        if (workOrder.status === 'Completed') {
          stepStatus = 'finish';
        } else if (index < currentStepIndex) {
          stepStatus = 'finish';
        } else if (index === currentStepIndex) {
          stepStatus = 'process';
        }

        if (workOrder.status === 'On Hold' && step === 'In Progress') {
          stepStatus = 'error';
        }
        
        const durationInfo = stageTimings[step];

        // Only show duration for stages that have actually been reached or are currently active
        const hasBeenReached = index <= currentStepIndex || stepStatus === 'finish';
        const isCurrentOngoing = index === currentStepIndex && workOrder.status !== 'Completed' && workOrder.status !== 'On Hold';
        const isPastStage = index < currentStepIndex || stepStatus === 'finish';

        // For past stages, show 'Took' even when the duration rounds to 0m (start === end).
        // For the current stage, only show when actively accumulating (>0).
        let activeDurationText: string | null = null;
        if (hasBeenReached && durationInfo) {
          const formatted = formatDuration(Math.max(durationInfo.activeDurationMs, 0));
          if (isPastStage && durationInfo.start) {
            activeDurationText = formatted; // allow '0m' for completed stages like Ready
          } else if (isCurrentOngoing && durationInfo.activeDurationMs > 0) {
            activeDurationText = formatted;
          }
        }

        const onHoldDurationText = hasBeenReached && durationInfo && durationInfo.onHoldDurationMs > 0 ? formatDuration(durationInfo.onHoldDurationMs) : null;

        const description = (
          <>
            {timestamp && <Text type="secondary">{timestamp}</Text>}
            {activeDurationText && (
              <Text type="secondary" style={{ display: 'block' }}>
                {isCurrentOngoing ? 'In progress for ' : 'Took '}
                {activeDurationText}
              </Text>
            )}
            {onHoldDurationText && (
              <Text type="warning" style={{ display: 'block' }}>
                (On Hold: {onHoldDurationText})
              </Text>
            )}
            {stepStatus === 'error' && workOrder.onHoldReason && (
              <Popover content={workOrder.onHoldReason} title="On Hold Reason" trigger="hover">
                <Text type="danger" style={{ display: 'block', cursor: 'pointer' }}>On Hold</Text>
              </Popover>
            )}
          </>
        );

        return (
          <Step 
            key={step} 
            title={step} 
            status={stepStatus}
            description={showDescriptions ? description : undefined}
          />
        );
      })}
    </Steps>
    </div>
  );
};

export default WorkOrderProgressTracker;