import React from 'react';
import { Tag, Tooltip } from 'antd';
import { BikeIcon } from 'lucide-react'; // Using lucide-react for the icon
import { WorkOrder } from '@/types/supabase';
import dayjs from 'dayjs';

interface EmergencyBikeTagProps {
  workOrder: WorkOrder;
}

const EMERGENCY_BIKE_THRESHOLD_HOURS = 6;

export const EmergencyBikeTag: React.FC<EmergencyBikeTagProps> = ({ workOrder }) => {
  const isEligible = React.useMemo(() => {
    if (workOrder.status !== 'In Progress' || !workOrder.work_started_at) {
      return false;
    }

    // Check for active emergency bike assignment
    if (workOrder.active_emergency_bike_assignment && !workOrder.active_emergency_bike_assignment.returned_at) {
      return false; // Already has an active emergency bike
    }

    const workStartedAt = dayjs(workOrder.work_started_at);
    const now = dayjs();
    const totalPausedSeconds = workOrder.total_paused_duration_seconds || 0;

    const elapsedActiveTimeSeconds = now.diff(workStartedAt, 'second') - totalPausedSeconds;
    const thresholdSeconds = EMERGENCY_BIKE_THRESHOLD_HOURS * 3600;

    return elapsedActiveTimeSeconds >= thresholdSeconds;
  }, [workOrder]);

  if (!isEligible) {
    return null;
  }

  return (
    <Tooltip title={`Work order in progress for over ${EMERGENCY_BIKE_THRESHOLD_HOURS} hours. Consider assigning an emergency bike.`}>
      <Tag icon={<BikeIcon size={14} />} color="purple" className="ant-tag-compact">
        Emergency Bike Needed
      </Tag>
    </Tooltip>
  );
};