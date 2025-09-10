import { Card, Typography, Tag, Space, Tooltip, Progress } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, WarningOutlined, PauseCircleOutlined } from '@ant-design/icons';
import { WorkOrder, SlaPolicy } from '@/types/supabase';
import dayjs, { Dayjs } from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

const { Title, Text, Paragraph } = Typography; // Import Paragraph

interface SlaStatusCardProps {
  workOrder: WorkOrder;
  slaPolicy: SlaPolicy | null;
}

const SlaStatusCard = ({ workOrder, slaPolicy }: SlaStatusCardProps) => {
  const now = dayjs();

  const isWalkIn = workOrder.channel === 'Service Center'; // Corrected to 'Service Center' for walk-ins

  // Calculate total active duration (excluding on-hold time)
  const calculateActiveDuration = (start: Dayjs, end: Dayjs | null): dayjs.duration.Duration => { // Corrected type
    if (!end) end = now;
    let totalDuration = end.diff(start, 'second');

    // Subtract paused durations that occurred within this period
    if (workOrder.total_paused_duration_seconds && workOrder.createdAt) {
      const createdAt = dayjs(workOrder.createdAt);
      const pausedDuration = dayjs.duration(workOrder.total_paused_duration_seconds, 'seconds');
      
      // Only subtract if the pause happened after the start of the current period
      // This is a simplification; a more robust solution would iterate through activityLog
      // to find exact pause/resume times within the specific SLA period.
      // For now, we'll subtract total paused duration from total elapsed time.
      if (start.isBefore(createdAt.add(pausedDuration))) { // If the start of the period is before the end of the total paused time
        totalDuration -= workOrder.total_paused_duration_seconds;
      }
    }
    return dayjs.duration(Math.max(0, totalDuration), 'seconds');
  };

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

  // Expected Repair Time (Work Started to Completion)
  const expectedRepairTargetHours = slaPolicy?.expected_repair_hours || 0;
  const actualRepairDuration = workOrder.work_started_at && workOrder.completedAt
    ? calculateActiveDuration(dayjs(workOrder.work_started_at), dayjs(workOrder.completedAt))
    : null;

  const getSlaStatusTag = (met: boolean | null, overdue: boolean, target: number, actual: number | dayjs.duration.Duration | null, unit: string, isApplicable: boolean = true) => { // Corrected type
    if (!isApplicable) return <Tag color="default">N/A</Tag>;
    if (workOrder.status === 'Completed') {
      return <Tag color={met ? 'success' : 'error'}>{met ? 'Met' : 'Missed'}</Tag>;
    }
    if (workOrder.status === 'On Hold') {
      return <Tag icon={<PauseCircleOutlined />} color="warning">On Hold</Tag>;
    }
    if (overdue) {
      return <Tag icon={<WarningOutlined />} color="error">Overdue</Tag>;
    }
    if (actual !== null) {
      return <Tag icon={<ClockCircleOutlined />} color="processing">In Progress</Tag>;
    }
    return <Tag color="default">Pending</Tag>;
  };

  const formatDurationDisplay = (durationValue: number | dayjs.duration.Duration | null, unit: string) => { // Corrected type
    if (durationValue === null) return 'N/A';
    if (typeof durationValue === 'number') {
      return `${durationValue} ${unit}`;
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

  const getProgressPercentage = (actual: number | dayjs.duration.Duration | null, target: number, unit: string) => { // Corrected type
    if (actual === null || target === 0) return 0;
    let actualValue = typeof actual === 'number' ? actual : actual.as(unit === 'minute' ? 'minutes' : 'hours');
    return Math.min(100, (actualValue / target) * 100);
  };

  return (
    <Card title="SLA Status" style={{ marginBottom: 16 }}>
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {!isWalkIn && (
          <div className="sla-item">
            <Title level={5} style={{ margin: 0 }}>First Response</Title>
            <Text type="secondary">Target: {firstResponseTargetMinutes} mins</Text>
            <Space>
              {getSlaStatusTag(isFirstResponseMet, isFirstResponseOverdue, firstResponseTargetMinutes, firstResponseActualDuration, 'minute')}
              {firstResponseActualDuration !== null && <Text>Actual: {formatDurationDisplay(firstResponseActualDuration, 'minute')}</Text>}
            </Space>
            <Progress 
              percent={getProgressPercentage(firstResponseActualDuration, firstResponseTargetMinutes, 'minute')} 
              status={isFirstResponseOverdue ? 'exception' : 'active'} 
              showInfo={false} 
              strokeColor={isFirstResponseOverdue ? 'red' : (isFirstResponseMet ? 'green' : 'blue')}
            />
          </div>
        )}

        <div className="sla-item">
          <Title level={5} style={{ margin: 0 }}>Response Time</Title>
          <Text type="secondary">Target: {responseTargetHours} hrs</Text>
          <Space>
            {getSlaStatusTag(isResponseMet, isResponseOverdue, responseTargetHours, responseActualDuration, 'hour')}
            {responseActualDuration !== null && <Text>Actual: {formatDurationDisplay(responseActualDuration, 'hour')}</Text>}
          </Space>
          <Progress 
            percent={getProgressPercentage(responseActualDuration, responseTargetHours, 'hour')} 
            status={isResponseOverdue ? 'exception' : 'active'} 
            showInfo={false} 
            strokeColor={isResponseOverdue ? 'red' : (isResponseMet ? 'green' : 'blue')}
          />
        </div>

        <div className="sla-item">
          <Title level={5} style={{ margin: 0 }}>Resolution Time</Title>
          <Text type="secondary">Target: {resolutionTargetHours} hrs</Text>
          <Space>
            {getSlaStatusTag(isResolutionMet, isResolutionOverdue, resolutionTargetHours, resolutionActualDuration, 'hour')}
            {resolutionActualDuration !== null && <Text>Actual: {formatDurationDisplay(resolutionActualDuration, 'hour')}</Text>}
          </Space>
          <Progress 
            percent={getProgressPercentage(resolutionActualDuration, resolutionTargetHours, 'hour')} 
            status={isResolutionOverdue ? 'exception' : 'active'} 
            showInfo={false} 
            strokeColor={isResolutionOverdue ? 'red' : (isResolutionMet ? 'green' : 'blue')}
          />
        </div>

        <div className="sla-item">
          <Title level={5} style={{ margin: 0 }}>Expected Repair Time</Title>
          <Text type="secondary">Expected: {expectedRepairTargetHours} hrs</Text>
          <Space>
            {workOrder.status === 'Completed' && actualRepairDuration !== null ? (
              <Tag color={actualRepairDuration.asHours() <= expectedRepairTargetHours ? 'success' : 'error'}>
                {actualRepairDuration.asHours() <= expectedRepairTargetHours ? 'Met' : 'Exceeded'}
              </Tag>
            ) : (
              <Tag color="default">Pending</Tag>
            )}
            {actualRepairDuration !== null && <Text>Actual: {formatDurationDisplay(actualRepairDuration, 'hour')}</Text>}
          </Space>
          <Progress 
            percent={getProgressPercentage(actualRepairDuration, expectedRepairTargetHours, 'hour')} 
            status={actualRepairDuration && actualRepairDuration.asHours() > expectedRepairTargetHours ? 'exception' : 'active'} 
            showInfo={false} 
            strokeColor={actualRepairDuration && actualRepairDuration.asHours() > expectedRepairTargetHours ? 'red' : 'blue'}
          />
        </div>
      </Space>
      {workOrder.status === 'On Hold' && workOrder.onHoldReason && (
        <div style={{ marginTop: 16 }}>
          <Text strong type="warning"><WarningOutlined /> On Hold Reason:</Text>
          <Paragraph>{workOrder.onHoldReason}</Paragraph>
        </div>
      )}
    </Card>
  );
};

export default SlaStatusCard;