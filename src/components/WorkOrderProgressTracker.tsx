import { useState, useEffect, useMemo } from 'react';
import { Steps, Popover, Typography, Tag, Space } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import duration, { Duration } from 'dayjs/plugin/duration';
import { WorkOrder, SlaPolicy } from '@/types/supabase';
import { CheckCircleOutlined, WarningOutlined, PauseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';

dayjs.extend(duration);

const { Step } = Steps;
const { Text } = Typography;

// Helper to format milliseconds into human-readable string
const formatDurationDisplay = (durationValue: number | Duration | null, unit: string) => {
  if (durationValue === null) return 'N/A';
  if (typeof durationValue === 'number') { // For raw minutes/hours
    return `${durationValue} ${unit}${durationValue !== 1 ? 's' : ''}`;
  }
  const totalSeconds = durationValue.asSeconds();
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  let parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 || (days === 0 && hours === 0 && totalSeconds > 0)) parts.push(`${minutes}m`);
  if (parts.length === 0 && totalSeconds === 0) return '0m';
  return parts.join(' ');
};

interface WorkOrderProgressTrackerProps {
  workOrder: WorkOrder;
  slaPolicy: SlaPolicy | null; // Added slaPolicy prop
}

const WorkOrderProgressTracker = ({ workOrder, slaPolicy }: WorkOrderProgressTrackerProps) => {
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

  // Helper to calculate active duration, excluding on-hold time
  const calculateActiveDuration = (start: Dayjs, end: Dayjs | null): Duration => {
    if (!end) end = now;
    let totalDurationSeconds = end.diff(start, 'second');

    // Subtract paused durations that occurred within this period
    if (workOrder.total_paused_duration_seconds && workOrder.createdAt) {
      const createdAt = dayjs(workOrder.createdAt);
      const totalPausedSeconds = workOrder.total_paused_duration_seconds;
      
      // This is a simplification. A more robust solution would iterate through activityLog
      // to find exact pause/resume times within the specific SLA period.
      // For now, we'll subtract total paused duration from total elapsed time if the period overlaps.
      if (start.isBefore(createdAt.add(totalPausedSeconds, 'seconds'))) {
        totalDurationSeconds -= totalPausedSeconds;
      }
    }
    return dayjs.duration(Math.max(0, totalDurationSeconds), 'seconds');
  };

  // SLA Calculations for display in descriptions
  const isWalkIn = workOrder.channel === 'Service Center';

  // First Response SLA (Creation to Confirmation)
  const firstResponseTargetMinutes = slaPolicy?.first_response_minutes || 0;
  const firstResponseActualDuration = workOrder.createdAt && workOrder.confirmed_at
    ? dayjs(workOrder.confirmed_at).diff(dayjs(workOrder.createdAt), 'minute')
    : null;
  const isFirstResponseMet = firstResponseActualDuration !== null && firstResponseActualDuration <= firstResponseTargetMinutes;
  const isFirstResponseOverdue = firstResponseActualDuration === null && !isWalkIn && workOrder.createdAt && now.diff(dayjs(workOrder.createdAt), 'minute') > firstResponseTargetMinutes;

  // Response Time SLA (Creation to Work Started)
  const responseTargetHours = slaPolicy?.response_hours || 0;
  const responseActualDuration = workOrder.createdAt && workOrder.work_started_at
    ? calculateActiveDuration(dayjs(workOrder.createdAt), dayjs(workOrder.work_started_at))
    : null;
  const isResponseMet = responseActualDuration !== null && responseActualDuration.asHours() <= responseTargetHours;
  const isResponseOverdue = responseActualDuration === null && workOrder.createdAt && now.diff(dayjs(workOrder.createdAt), 'hour') > responseTargetHours && workOrder.status !== 'Completed';

  // Resolution Time SLA (Creation to Completion)
  const resolutionTargetHours = slaPolicy?.resolution_hours || 0;
  const resolutionActualDuration = workOrder.createdAt && workOrder.completedAt
    ? calculateActiveDuration(dayjs(workOrder.createdAt), dayjs(workOrder.completedAt))
    : null;
  const isResolutionMet = resolutionActualDuration !== null && resolutionActualDuration.asHours() <= resolutionTargetHours;
  const isResolutionOverdue = resolutionActualDuration === null && workOrder.createdAt && now.diff(dayjs(workOrder.createdAt), 'hour') > resolutionTargetHours && workOrder.status !== 'Completed';


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
  const totalPausedDurationText = formatDurationDisplay(dayjs.duration(totalPausedDurationSeconds, 'seconds'), 'second');


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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {timestamp && <Text type="secondary" style={{ fontSize: 12 }}>{timestamp}</Text>}
            {workOrder.status === 'On Hold' && step === 'In Progress' && (
              <Popover content={workOrder.onHoldReason} title="On Hold Reason" trigger="hover">
                <Text type="danger" style={{ fontSize: 12, display: 'block', cursor: 'pointer' }}>
                  <PauseCircleOutlined /> On Hold
                </Text>
              </Popover>
            )}
            {workOrder.status === 'On Hold' && step === 'In Progress' && totalPausedDurationSeconds > 0 && (
              <Text type="warning" style={{ fontSize: 12, display: 'block' }}>
                (Paused: {totalPausedDurationText})
              </Text>
            )}

            {/* SLA Information */}
            {slaPolicy && (
              <>
                {step === 'Confirmation' && !isWalkIn && firstResponseTargetMinutes > 0 && (
                  <Space direction="vertical" size={0} style={{ marginTop: 4 }}>
                    <Text style={{ fontSize: 12 }}>Target: {firstResponseTargetMinutes} mins</Text>
                    {workOrder.status === 'Completed' || firstResponseActualDuration !== null ? (
                      <Text style={{ fontSize: 12 }}>
                        Actual: {formatDurationDisplay(firstResponseActualDuration, 'minute')}
                        <Tag color={isFirstResponseMet ? 'success' : 'error'} style={{ marginLeft: 4 }}>
                          {isFirstResponseMet ? 'Met' : 'Missed'}
                        </Tag>
                      </Text>
                    ) : isFirstResponseOverdue ? (
                      <Text style={{ fontSize: 12 }} type="danger">
                        <WarningOutlined /> Overdue
                      </Text>
                    ) : (
                      <Text style={{ fontSize: 12 }} type="secondary">
                        <ClockCircleOutlined /> Pending
                      </Text>
                    )}
                  </Space>
                )}

                {step === 'In Progress' && responseTargetHours > 0 && (
                  <Space direction="vertical" size={0} style={{ marginTop: 4 }}>
                    <Text style={{ fontSize: 12 }}>Target: {responseTargetHours} hrs</Text>
                    {workOrder.status === 'Completed' || responseActualDuration !== null ? (
                      <Text style={{ fontSize: 12 }}>
                        Actual: {formatDurationDisplay(responseActualDuration, 'hour')}
                        <Tag color={isResponseMet ? 'success' : 'error'} style={{ marginLeft: 4 }}>
                          {isResponseMet ? 'Met' : 'Missed'}
                        </Tag>
                      </Text>
                    ) : isResponseOverdue ? (
                      <Text style={{ fontSize: 12 }} type="danger">
                        <WarningOutlined /> Overdue
                      </Text>
                    ) : (
                      <Text style={{ fontSize: 12 }} type="secondary">
                        <ClockCircleOutlined /> Pending
                      </Text>
                    )}
                  </Space>
                )}

                {step === 'Completed' && resolutionTargetHours > 0 && (
                  <Space direction="vertical" size={0} style={{ marginTop: 4 }}>
                    <Text style={{ fontSize: 12 }}>Target: {resolutionTargetHours} hrs</Text>
                    {workOrder.status === 'Completed' ? (
                      <Text style={{ fontSize: 12 }}>
                        Actual: {formatDurationDisplay(resolutionActualDuration, 'hour')}
                        <Tag color={isResolutionMet ? 'success' : 'error'} style={{ marginLeft: 4 }}>
                          {isResolutionMet ? 'Met' : 'Missed'}
                        </Tag>
                      </Text>
                    ) : isResolutionOverdue ? (
                      <Text style={{ fontSize: 12 }} type="danger">
                        <WarningOutlined /> Overdue
                      </Text>
                    ) : (
                      <Text style={{ fontSize: 12 }} type="secondary">
                        <ClockCircleOutlined /> Pending
                      </Text>
                    )}
                  </Space>
                )}
              </>
            )}
          </div>
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