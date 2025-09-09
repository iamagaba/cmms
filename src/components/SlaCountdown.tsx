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
    return <Tag className="ant-tag-compact">No SLA</Tag>; // Apply compact class
  }

  const dueDate = dayjs(slaDue);

  if (status === 'Completed') {
    if (completedAt) {
      const completionDate = dayjs(completedAt);
      const wasOnTime = completionDate.isBefore(dueDate) || completionDate.isSame(dueDate);
      return (
        <Tooltip title={`Completed on ${completionDate.format('MMM D, YYYY h:mm A')}`}>
          <Tag icon={<CheckCircleOutlined />} color={wasOnTime ? "success" : "error"} className="ant-tag-compact"> {/* Apply compact class */}
            {wasOnTime ? 'Completed On Time' : 'Completed Late'}
          </Tag>
        </Tooltip>
      );
    }
    return <Tag icon={<CheckCircleOutlined />} color="success" className="ant-tag-compact">Completed</Tag>; // Apply compact class
  }

  const diff = dueDate.diff(now);
  const isOverdue = diff < 0;

  const formatDuration = (milliseconds: number) => {
    const totalSeconds = Math.abs(Math.floor(milliseconds / 1000));
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (num: number) => num.toString().padStart(2, '0');

    if (days > 0) {
      return `${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
    } else {
      return `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
    }
  };

  const formattedTime = formatDuration(diff);

  // Define warning threshold: less than 24 hours
  const isWarning = diff < 24 * 60 * 60 * 1000 && diff >= 0; 

  let tagColor: string;
  let tagIcon: React.ReactNode;
  let tagText: string;

  if (isOverdue) {
    tagColor = 'error';
    tagIcon = <WarningOutlined />;
    tagText = `Overdue by ${formattedTime}`;
  } else if (isWarning) {
    tagColor = 'warning';
    tagIcon = <ClockCircleOutlined />;
    tagText = `Due in ${formattedTime}`;
  } else {
    tagColor = 'processing'; // Default blue for "due in > 24 hours"
    tagIcon = <ClockCircleOutlined />;
    tagText = `Due in ${formattedTime}`;
  }

  return (
    <Tooltip title={`Due on ${dueDate.format('MMM D, YYYY h:mm A')}`}>
      <Tag icon={tagIcon} color={tagColor} className="ant-tag-compact">
        {tagText}
      </Tag>
    </Tooltip>
  );
};

export default SlaCountdown;