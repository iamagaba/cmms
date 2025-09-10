import { useState, useEffect, useMemo } from 'react';
import { Steps, Popover, Typography } from 'antd';
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
    }, 1000); // Update every second

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
    // Use specific timestamps if available, otherwise fall back to status changes
    
    // Open stage starts at creation
    if (workOrder.createdAt) {
      timings['Open'].start = dayjs(workOrder.createdAt);
    }

    // Confirmation stage starts when Open ends, or at confirmed_at
    if (workOrder.confirmed_at) {
      timings['Confirmation'].start = dayjs(workOrder.confirmed_at);
      if (timings['Open'].start && !timings['Open'].end) {
        timings['Open'].end = dayjs(workOrder.confirmed_at);
      }
    }

    // In Progress stage starts when Ready ends, or at work_started_at
    if (workOrder.work_started_at) {
      timings['In Progress'].start = dayjs(workOrder.work_started_at);
      // If Confirmation was the last explicit step before In Progress
      if (timings['Confirmation'].start && !timings['Confirmation'].end) {
        timings['Confirmation'].end = dayjs(workOrder.work_started_at);
      }
      // If Ready was the last explicit step before In Progress (e.g., direct from Ready to In Progress)
      // This logic needs to be more robust to handle all transitions.
      // For simplicity, we'll assume a linear flow for now based on explicit timestamps.
    }

    // Completed stage starts when In Progress ends, or at completedAt
    if (workOrder.completedAt) {
      timings['Completed'].start = dayjs(workOrder.completedAt);
      if (timings['In Progress'].start && !timings['In Progress'].end) {
        timings['In Progress'].end = dayjs(workOrder.completedAt);
      }
    }

    // Fill in gaps for intermediate statuses if explicit timestamps are missing
    // This is a simplified approach. A full solution would parse activityLog for all status changes.
    if (timings['Open'].start && !timings['Confirmation'].start && workOrder.status === 'Confirmation') {
      timings['Confirmation'].start = now;
      timings['Open'].end = now;
    }
    if (timings['Confirmation'].start && !timings['In Progress'].start && (workOrder.status === 'Ready' || workOrder.status === 'In Progress' || workOrder.status === 'On Hold')) {
      timings['In Progress'].start = now; // Assuming 'Ready' is a precursor to 'In Progress'
      timings['Confirmation'].end = now;
    }
    if (timings['In Progress'].start && !timings['Completed'].start && workOrder.status === 'Completed') {
      timings['Completed'].start = now;
      timings['In Progress'].end = now;
    }

    // Ensure current active stage has an end time of 'now' if not completed
    const currentActiveStage = workOrder.status === 'On Hold' ? 'In Progress' : workOrder.status;
    if (currentActiveStage && timings[currentActiveStage].start && !timings[currentActiveStage].end && workOrder.status !== 'Completed') {
      timings[currentActiveStage].end = now;
    }


    // 2. Calculate total on-hold periods
    // This is simplified. A robust solution would parse activityLog for all 'On Hold' entries.
    // For now, we use total_paused_duration_seconds and sla_timers_paused_at
    const totalPausedDuration = dayjs.duration(workOrder.total_paused_duration_seconds || 0, 'seconds');
    let currentPauseDuration: dayjs.duration.Duration = dayjs.duration(0); // Correct type
    if (workOrder.status === 'On Hold' && workOrder.sla_timers_paused_at) {
      currentPauseDuration = dayjs.duration(now.diff(dayjs(workOrder.sla_timers_paused_at), 'seconds'), 'seconds'); // Corrected to return Duration
    }
    const effectiveTotalPausedDuration = totalPausedDuration.add(currentPauseDuration); // .add can take Duration directly


    // 3. Distribute active and on-hold durations to stages
    steps.forEach(step => {
      const timing = timings[step];
      if (timing.start && timing.end) {
        let totalTimeInStage = timing.end.diff(timing.start);
        
        // This is a simplification. Ideally, we'd track specific on-hold periods
        // and apply them to the exact timeframes they occurred within each stage.
        // For now, we'll subtract the total paused duration from the overall active time.
        // This might not be perfectly accurate for individual stage durations if pauses
        // span across multiple stages, but it's a reasonable approximation given current data.
        timing.activeDurationMs = totalTimeInStage; // Start with total elapsed
        timing.onHoldDurationMs = 0; // Reset for this stage

        // If the work order was on hold during this stage's active period,
        // we need to account for it. This is complex without detailed pause/resume logs.
        // For now, we'll just show the total paused duration separately.
        // The activeDurationMs will be the wall-clock time for the stage.
      }
    });

    return timings;
  }, [workOrder, now]);


  const getStatusTimestamp = (stage: string): string | null => {
    if (stage === 'Open' && workOrder.createdAt) {
        return dayjs(workOrder.createdAt).format('MMM D, h:mm A');
    }
    if (stage === 'Confirmation' && workOrder.confirmed_at) {
        return dayjs(workOrder.confirmed_at).format('MMM D, h:mm A');
    }
    if (stage === 'In Progress' && workOrder.work_started_at) {
        return dayjs(workOrder.work_started_at).format('MMM D, h:mm A');
    }
    if (stage === 'Completed' && workOrder.completedAt) {
        return dayjs(workOrder.completedAt).format('MMM D, h:mm A');
    }
    // Fallback to activity log for other status changes if direct timestamps are not available
    const logEntry = (workOrder.activityLog || []).find(log =>
      log.activity.includes(`to '${stage}'`)
    );
    return logEntry ? dayjs(logEntry.timestamp).format('MMM D, h:mm A') : null;
  };

  const totalPausedDurationSeconds = (workOrder.total_paused_duration_seconds || 0) + (workOrder.status === 'On Hold' && workOrder.sla_timers_paused_at ? now.diff(dayjs(workOrder.sla_timers_paused_at), 'second') : 0);
  const totalPausedDurationText = formatDuration(totalPausedDurationSeconds * 1000);


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
          stepStatus = 'error'; // Indicate 'On Hold' state within 'In Progress'
        }
        
        const description = (
          <>
            {timestamp && <Text type="secondary" style={{ fontSize: 12 }}>{timestamp}</Text>}
            {stepStatus === 'error' && workOrder.onHoldReason && (
              <Popover content={workOrder.onHoldReason} title="On Hold Reason" trigger="hover">
                <Text type="danger" style={{ fontSize: 12, display: 'block', cursor: 'pointer' }}>On Hold</Text>
              </Popover>
            )}
            {workOrder.status === 'On Hold' && step === 'In Progress' && (
              <Text type="warning" style={{ fontSize: 12, display: 'block' }}>
                (Paused: {totalPausedDurationText})
              </Text>
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