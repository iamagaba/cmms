import { useState, useEffect } from 'react';
import { Tag, Tooltip } from 'antd';
import { Icon } from '@iconify/react'; // Using Iconify for the icon
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
          <Tag icon={<Icon icon="ph:check-circle-fill" />} color={wasOnTime ? "success" : "error"}>
            {wasOnTime ? 'Completed On Time' : 'Completed Late'}
          </Tag>
        </Tooltip>
      );
    }
    return <Tag icon={<Icon icon="ph:check-circle-fill" />} color="success">Completed</Tag>;
  }

  const diff = dueDate.diff(now); // Difference in milliseconds
  const isOverdue = diff < 0;
  const absDiff = Math.abs(diff);

  const oneDayInMs = 24 * 60 * 60 * 1000;

  let tagColor: string;
  let tagIcon: React.ReactNode;
  let tagText: string;

  const totalSeconds = Math.floor(absDiff / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  const pad = (num: number) => num.toString().padStart(2, '0');

  if (isOverdue) {
    tagColor = 'error';
    tagIcon = <Icon icon="ph:warning-fill" />;
    if (absDiff >= oneDayInMs) { // Overdue by days
      tagText = `${days}d ${pad(hours)}h`;
    } else { // Overdue by hours/minutes
      tagText = `${pad(hours)}h ${pad(minutes)}m`;
    }
  } else if (absDiff < oneDayInMs) { // Due within 24 hours
    tagColor = 'warning';
    tagIcon = <Icon icon="ph:hourglass-fill" />;
    tagText = `${pad(hours)}h ${pad(minutes)}m`;
  } else { // Due in more than 24 hours
    tagColor = 'processing';
    tagIcon = <Icon icon="ph:hourglass-fill" />;
    tagText = `${days}d ${pad(hours)}h`;
  }

  return (
    <Tooltip title={`Due on ${dueDate.format('MMM D, YYYY h:mm A')}`}>
      <Tag icon={tagIcon} color={tagColor}>
        {tagText}
      </Tag>
    </Tooltip>
  );
};

export default SlaCountdown;