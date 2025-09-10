import { useState, useEffect, useMemo } from 'react';
import { Steps, Popover, Typography, Tag, Tooltip, Skeleton, Space } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { WorkOrder, SlaPolicy } from '@/types/supabase';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircleOutlined, ClockCircleOutlined, WarningOutlined, PauseCircleOutlined } from '@ant-design/icons';

dayjs.extend(duration);

const { Step } = Steps;
const { Text } = Typography;

interface StageTiming {
  start: Dayjs | null;
  end: Dayjs | null;
  activeDurationMs: number;
  onHoldDurationMs: number;
  slaMet?: boolean;
  slaTarget?: string; // e.g., "15 mins", "4 hrs"
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

  // Fetch SLA policy for the work order's service category
  const { data: slaPolicy, isLoading: isLoadingSlaPolicy } = useQuery<SlaPolicy | null>({
    queryKey: ['sla_policy', workOrder.service_category_id],
    queryFn: async () => {
      if (!workOrder.service_category_id) return null;
      const { data, error } = await supabase
        .from('sla_policies')
        .select('*')
        .eq('service_category_id', workOrder.service_category_id)
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!workOrder.service_category_id,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      if (workOrder.status !== 'Completed') {
        setNow(dayjs());
      }
    }, 1000); // Update every second

    return () => clearInterval(timer);
  }, [workOrder.status]);

  const isWalkIn = workOrder.channel === 'Walk in';

  const stepsConfig = useMemo(() => {
    const config = [
      { key: 'Open', title: 'Created', timestamp: workOrder.createdAt },
      { key: 'Confirmation', title: 'Confirmed', timestamp: workOrder.confirmed_at, appliesToFieldRepair: true },
      { key: 'In Progress', title: 'Work Started', timestamp: workOrder.work_started_at },
      { key: 'Completed', title: 'Completed', timestamp: workOrder.completedAt },
    ];
    return config.filter(step => !step.appliesToFieldRepair || !isWalkIn);
  }, [workOrder.createdAt, workOrder.confirmed_at, workOrder.work_started_at, workOrder.completedAt, isWalkIn]);

  const currentStepIndex = stepsConfig.findIndex(step => {
    if (workOrder.status === 'Completed') return step.key === 'Completed';
    if (workOrder.status === 'On Hold') return step.key === 'In Progress'; // On Hold is a state within In Progress
    return step.key === workOrder.status;
  });

  const stageTimings = useMemo(() => {
    const timings: Record<string, StageTiming> = {};
    stepsConfig.forEach(step => {
      timings[step.key] = { start: null, end: null, activeDurationMs: 0, onHoldDurationMs: 0 };
    });

    const createdAt = workOrder.createdAt ? dayjs(workOrder.createdAt) : null;
    const confirmedAt = workOrder.confirmed_at ? dayjs(workOrder.confirmed_at) : null;
    const workStartedAt = workOrder.work_started_at ? dayjs(workOrder.work_started_at) : null;
    const completedAt = workOrder.completedAt ? dayjs(workOrder.completedAt) : null;

    // Calculate active durations for each stage
    if (createdAt) {
      timings['Open'].start = createdAt;
      if (confirmedAt) {
        timings['Open'].end = confirmedAt;
      } else if (workStartedAt && isWalkIn) { // For walk-ins, 'Open' directly transitions to 'In Progress'
        timings['Open'].end = workStartedAt;
      } else if (workOrder.status === 'Open' || (workOrder.status === 'On Hold' && !isWalkIn && !confirmedAt)) {
        timings['Open'].end = now;
      }
    }

    if (confirmedAt) {
      timings['Confirmation'].start = confirmedAt;
      if (workStartedAt) {
        timings['Confirmation'].end = workStartedAt;
      } else if (workOrder.status === 'Confirmation' || (workOrder.status === 'On Hold' && !isWalkIn && confirmedAt && !workStartedAt)) {
        timings['Confirmation'].end = now;
      }
    }

    if (workStartedAt) {
      timings['In Progress'].start = workStartedAt;
      if (completedAt) {
        timings['In Progress'].end = completedAt;
      } else if (workOrder.status === 'In Progress' || workOrder.status === 'On Hold') {
        timings['In Progress'].end = now;
      }
    }

    if (completedAt) {
      timings['Completed'].start = completedAt;
      timings['Completed'].end = completedAt; // End is same as start for completed
    }

    // Calculate total paused duration for the entire work order
    let currentTotalPausedSeconds = workOrder.total_paused_duration_seconds || 0;
    if (workOrder.status === 'On Hold' && workOrder.sla_timers_paused_at) {
      currentTotalPausedSeconds += dayjs().diff(dayjs(workOrder.sla_timers_paused_at), 'second');
    }
    const totalPausedMs = currentTotalPausedSeconds * 1000;

    // Distribute on-hold time and calculate active duration
    stepsConfig.forEach(step => {
      const timing = timings[step.key];
      if (timing.start && timing.end) {
        const totalTimeInStage = timing.end.diff(timing.start);
        
        // For simplicity, we'll distribute the total paused time proportionally
        // A more precise method would involve re-evaluating activity log for on-hold periods within each stage.
        // For now, we'll use the total paused duration for the entire work order.
        // This means the 'active' duration is total - (total_paused_duration_seconds if applicable)
        
        // This is a simplification. A more accurate distribution of on-hold time per stage
        // would require iterating through the activity log to find specific on-hold start/end events
        // that fall within each stage's start/end.
        // For now, we'll apply the total paused duration to the 'In Progress' stage,
        // as that's typically where work is paused.
        if (step.key === 'In Progress') {
          timing.onHoldDurationMs = totalPausedMs;
          timing.activeDurationMs = Math.max(0, totalTimeInStage - totalPausedMs);
        } else {
          timing.activeDurationMs = totalTimeInStage;
          timing.onHoldDurationMs = 0;
        }
      }
    });

    // Apply SLA targets and check compliance
    if (slaPolicy) {
      if (timings['Open'].end && slaPolicy.first_response_minutes && !isWalkIn) {
        const actualFirstResponseMs = timings['Open'].end.diff(timings['Open'].start);
        timings['Open'].slaMet = actualFirstResponseMs <= (slaPolicy.first_response_minutes * 60 * 1000);
        timings['Open'].slaTarget = `${slaPolicy.first_response_minutes} mins`;
      }
      if (timings['In Progress'].start && slaPolicy.response_hours) {
        const actualResponseMs = timings['In Progress'].start.diff(timings['Open'].start);
        timings['In Progress'].slaMet = actualResponseMs <= (slaPolicy.response_hours * 60 * 60 * 1000);
        timings['In Progress'].slaTarget = `${slaPolicy.response_hours} hrs`;
      }
      if (timings['Completed'].end && slaPolicy.resolution_hours) {
        const actualResolutionMs = timings['Completed'].end.diff(timings['Open'].start);
        timings['Completed'].slaMet = actualResolutionMs <= (slaPolicy.resolution_hours * 60 * 60 * 1000);
        timings['Completed'].slaTarget = `${slaPolicy.resolution_hours} hrs`;
      }
    }

    return timings;
  }, [workOrder, now, slaPolicy, stepsConfig, isWalkIn]);

  if (isLoadingSlaPolicy) {
    return <Skeleton active paragraph={{ rows: 1 }} />;
  }

  return (
    <Steps current={currentStepIndex} size="small">
      {stepsConfig.map((step, index) => {
        const timestamp = step.timestamp ? dayjs(step.timestamp).format('MMM D, h:mm A') : null;
        let stepStatus: 'wait' | 'process' | 'finish' | 'error' = 'wait';

        if (workOrder.status === 'Completed') {
          stepStatus = 'finish';
        } else if (index < currentStepIndex) {
          stepStatus = 'finish';
        } else if (index === currentStepIndex) {
          stepStatus = 'process';
        }

        if (workOrder.status === 'On Hold' && step.key === 'In Progress') {
          stepStatus = 'error'; // Indicate 'On Hold' as an error/paused state within In Progress
        }
        
        const durationInfo = stageTimings[step.key];
        const activeDurationText = durationInfo && durationInfo.activeDurationMs > 0 ? formatDuration(durationInfo.activeDurationMs) : null;
        const onHoldDurationText = durationInfo && durationInfo.onHoldDurationMs > 0 ? formatDuration(durationInfo.onHoldDurationMs) : null;

        const descriptionContent = (
          <Space direction="vertical" size={0} style={{ width: '100%' }}>
            {timestamp && <Text type="secondary" style={{ fontSize: 12 }}>{timestamp}</Text>}
            {durationInfo?.slaTarget && (
              <Text strong style={{ fontSize: 12, display: 'block' }}>
                Target: {durationInfo.slaTarget}
              </Text>
            )}
            {activeDurationText && (
              <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                {index === currentStepIndex && workOrder.status !== 'Completed' && workOrder.status !== 'On Hold' ? 'In progress for ' : 'Took '}
                {activeDurationText}
              </Text>
            )}
            {onHoldDurationText && (
              <Text type="warning" style={{ fontSize: 12, display: 'block' }}>
                <PauseCircleOutlined /> On Hold: {onHoldDurationText}
              </Text>
            )}
            {step.key === 'In Progress' && workOrder.status === 'On Hold' && workOrder.onHoldReason && (
              <Popover content={workOrder.onHoldReason} title="On Hold Reason" trigger="hover">
                <Text type="danger" style={{ fontSize: 12, display: 'block', cursor: 'pointer' }}>
                  <WarningOutlined /> Currently On Hold
                </Text>
              </Popover>
            )}
            {step.key === 'In Progress' && slaPolicy?.expected_repair_hours && (
              <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                Expected Repair: {slaPolicy.expected_repair_hours} hrs
              </Text>
            )}
            {durationInfo?.slaMet !== undefined && (
              <Tag 
                icon={durationInfo.slaMet ? <CheckCircleOutlined /> : <WarningOutlined />} 
                color={durationInfo.slaMet ? 'success' : 'error'} 
                style={{ marginTop: 4 }}
              >
                SLA {durationInfo.slaMet ? 'Met' : 'Missed'}
              </Tag>
            )}
          </Space>
        );

        return (
          <Step 
            key={step.key} 
            title={step.title} 
            status={stepStatus}
            description={descriptionContent}
          />
        );
      })}
    </Steps>
  );
};

export default WorkOrderProgressTracker;