import { useState, useEffect, useMemo } from 'react';
import { Steps, Popover, Typography } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import duration from 'dayjs/plugin/duration';
import max from 'dayjs/plugin/max'; // Explicitly import the plugin function
import min from 'dayjs/plugin/min'; // Explicitly import the plugin function
import { WorkOrder } from '@/types/supabase';

dayjs.extend(duration);
dayjs.extend(max); // Extend with the imported plugin function
dayjs.extend(min); // Extend with the imported plugin function

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
  const d = dayjs.duration(ms);
  const days = Math.floor(d.asDays());
  const hours = d.hours() % 24;
  const minutes = d.minutes();

  let parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 || (days === 0 && hours === 0 && ms > 0)) parts.push(`${minutes}m`);
  if (parts.length === 0 && ms === 0) return '0m';
  return parts.join(' ');
};

interface WorkOrderProgressTrackerProps {
  workOrder: WorkOrder;
}

const WorkOrderProgressTracker = ({ workOrder }: WorkOrderProgressTrackerProps) => {
  const [now, setNow] = useState(dayjs());

  useEffect(() => {
    const timer = setInterval(() => {
      if (workOrder.status !== 'Completed') {
        setNow(dayjs());
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [workOrder.status]);

  const steps = ['Open', 'Confirmation', 'Ready', 'In Progress', 'Completed'];
  let currentStepIndex = steps.indexOf(workOrder.status || 'Open');
  if (workOrder.status === 'On Hold') {
    currentStepIndex = steps.indexOf('In Progress'); // 'On Hold' is a state within 'In Progress' for the tracker
  }

  const stageTimings = useMemo(() => {
    const timings: Record<string, StageTiming> = {};
    steps.forEach(step => {
      timings[step] = { start: null, end: null, activeDurationMs: 0, onHoldDurationMs: 0 };
    });

    // 1. Determine the start and end times for each *sequential* stage
    let currentStatus: WorkOrder['status'] = 'Open';
    
    if (workOrder.createdAt) {
      timings['Open'].start = dayjs(workOrder.createdAt);
    }

    const sortedActivityLog = [...(workOrder.activityLog || [])].sort((a, b) =>
      dayjs(a.timestamp).diff(dayjs(b.timestamp))
    );

    for (const log of sortedActivityLog) {
      const eventTime = dayjs(log.timestamp);
      const statusChangeMatch = log.activity.match(/Status changed from '(.+)' to '(.+)'/);

      if (statusChangeMatch) {
        const newStatus = statusChangeMatch[2] as WorkOrder['status'];

        // Set end time for the previous stage
        if (currentStatus !== 'On Hold' && timings[currentStatus].start && !timings[currentStatus].end) {
          timings[currentStatus].end = eventTime;
        }

        // Set start time for the new stage (if not 'On Hold')
        if (newStatus !== 'On Hold' && timings[newStatus].start === null) {
          timings[newStatus].start = eventTime;
        }
        currentStatus = newStatus;
      }
    }

    // Set end time for the current/last active stage
    const finalStatus = workOrder.status;
    if (finalStatus === 'Completed' && workOrder.completedAt) {
      if (timings['Completed'].start && !timings['Completed'].end) {
        timings['Completed'].end = dayjs(workOrder.completedAt);
      }
    } else if (finalStatus !== 'On Hold' && timings[finalStatus || 'Open'].start && !timings[finalStatus || 'Open'].end) {
      timings[finalStatus || 'Open'].end = now;
    } else if (finalStatus === 'On Hold' && timings['In Progress'].start && !timings['In Progress'].end) {
      // If currently on hold, the 'In Progress' stage's active period ends now
      timings['In Progress'].end = now;
    }


    // 2. Calculate total on-hold periods
    const onHoldPeriods: { start: Dayjs; end: Dayjs }[] = [];
    let tempOnHoldStart: Dayjs | null = null;
    let currentStatusForOnHold: WorkOrder['status'] = 'Open'; // Track status for on-hold logic

    // Re-process events to find on-hold periods
    const allEventsForOnHold: { time: Dayjs; status: WorkOrder['status'] }[] = [];
    if (workOrder.createdAt) {
      allEventsForOnHold.push({ time: dayjs(workOrder.createdAt), status: 'Open' });
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
    // If currently on hold
    if (tempOnHoldStart && currentStatusForOnHold === 'On Hold') {
      onHoldPeriods.push({ start: tempOnHoldStart, end: now });
    }

    // 3. Distribute active and on-hold durations to stages
    steps.forEach(step => {
      const timing = timings[step];
      if (timing.start && timing.end) {
        let totalTimeInStage = timing.end.diff(timing.start);
        let onHoldTimeInThisStage = 0;

        for (const period of onHoldPeriods) {
          const overlapStart = timing.start && period.start ? (dayjs as any).max(timing.start, period.start) : null;
          const overlapEnd = timing.end && period.end ? (dayjs as any).min(timing.end, period.end) : null;

          if (overlapStart && overlapEnd && overlapEnd.isAfter(overlapStart)) {
            onHoldTimeInThisStage += overlapEnd.diff(overlapStart);
          }
        }
        timing.onHoldDurationMs = onHoldTimeInThisStage;
        timing.activeDurationMs = totalTimeInStage - onHoldTimeInThisStage;
      }
    });

    return timings;
  }, [workOrder, now]);


  const getStatusTimestamp = (stage: string): string | null => {
    if (stage === 'Open' && workOrder.createdAt) {
        return dayjs(workOrder.createdAt).format('MMM D, h:mm A');
    }
    if (stage === 'Completed' && workOrder.completedAt) {
        return dayjs(workOrder.completedAt).format('MMM D, h:mm A');
    }
    const logEntry = (workOrder.activityLog || []).find(log =>
      log.activity.includes(`to '${stage}'`)
    );
    return logEntry ? dayjs(logEntry.timestamp).format('MMM D, h:mm A') : null;
  };

  return (
    <Steps current={currentStepIndex} size="small">
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
        const activeDurationText = durationInfo && durationInfo.activeDurationMs > 0 ? formatDuration(durationInfo.activeDurationMs) : null;
        const onHoldDurationText = durationInfo && durationInfo.onHoldDurationMs > 0 ? formatDuration(durationInfo.onHoldDurationMs) : null;

        const description = (
          <>
            {timestamp && <Text type="secondary" style={{ fontSize: 12 }}>{timestamp}</Text>}
            {activeDurationText && (
              <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                {index === currentStepIndex && workOrder.status !== 'Completed' && workOrder.status !== 'On Hold' ? 'In progress for ' : 'Took '}
                {activeDurationText}
              </Text>
            )}
            {onHoldDurationText && (
              <Text type="warning" style={{ fontSize: 12, display: 'block' }}>
                (On Hold: {onHoldDurationText})
              </Text>
            )}
            {stepStatus === 'error' && workOrder.onHoldReason && (
              <Popover content={workOrder.onHoldReason} title="On Hold Reason" trigger="hover">
                <Text type="danger" style={{ fontSize: 12, display: 'block', cursor: 'pointer' }}>On Hold</Text>
              </Popover>
            )}
          </>
        );

        return (
          <Step 
            key={step} 
            title={step} 
            status={stepStatus}
            description={description}
          />
        );
      })}
    </Steps>
  );
};

export default WorkOrderProgressTracker;