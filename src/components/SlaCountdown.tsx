import { useState, useEffect } from 'react';
import { Tag, Tooltip } from 'antd';
import { ClockCircleOutlined, CheckCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { WorkOrder } from '@/types/supabase';
import dayjs from 'dayjs';

interface SlaCountdownProps {
  slaDue: string | null;
  status: WorkOrder['status'];
  completedAt: string | null;
}

const SlaCountdown = ({ slaDue, status, completedAt }: SlaCountdownProps) => {
  const [now, setNow] = useState(dayjs());

  useEffect(() => {
    const timer = setInterval(() => {
      if (status !== 'Completed') {
        setNow(dayjs());
      }
    }, 1000); // Update every second

    return () => clearInterval(timer);
  }, [status]);

  if (!slaDue) {
    return <Tag>No SLA</Tag>;
  }

  const dueDate = dayjs(slaDue);

  if (status === 'Completed') {
    if (completedAt) {
      const completionDate = dayjs(completedAt);
      const wasOnTime = completionDate.isBefore(dueDate) || completionDate.isSame(dueDate);
      return (
        <Tooltip title={`Completed on ${completionDate.format('MMM D, YYYY h:mm A')}`}>
          <Tag icon={<CheckCircleOutlined />} color={wasOnTime ? "success" : "error"}>
            {wasOnTime ? 'Completed On Time' : 'Completed Late'}
          </Tag>
        </Tooltip>
      );
    }
    return <Tag icon={<CheckCircleOutlined />} color="success">Completed</Tag>;
  }

  const diff = dueDate.diff(now);
  const isOverdue = diff < 0;

  const formatDuration = (milliseconds: number) => {
    const totalSeconds = Math.abs(Math.floor(milliseconds / 1000));
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (days > 1) return `${days} days ${hours}h`;
    if (days === 1) return `${days} day ${hours}h`;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formattedTime = formatDuration(diff);

  if (isOverdue) {
    return (
      <Tooltip title={`Overdue since ${dueDate.format('MMM D, YYYY h:mm A')}`}>
        <Tag icon={<WarningOutlined />} color="error">Overdue by {formattedTime}</Tag>
      </Tooltip>
    );
  }

  const isWarning = diff < 24 * 60 * 60 * 1000; // Less than 24 hours

  return (
    <Tooltip title={`Due on ${dueDate.format('MMM D, YYYY h:mm A')}`}>
      <Tag icon={<ClockCircleOutlined />} color={isWarning ? 'warning' : 'processing'}>Due in {formattedTime}</Tag>
    </Tooltip>
  );
};

export default SlaCountdown;