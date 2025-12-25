import React from 'react';
import { Icon } from '@iconify/react';
import { WorkOrder, Vehicle, EmergencyBikeAssignment } from '@/types/supabase';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import duration from 'dayjs/plugin/duration';

dayjs.extend(relativeTime);
dayjs.extend(duration);

interface WorkOrderServiceLifecycleCardProps {
  workOrder: WorkOrder;
  handleUpdateWorkOrder?: (updates: Partial<WorkOrder>) => void;
  usedPartsCount?: number;
  emergencyBike?: Vehicle | null;
  emergencyAssignment?: EmergencyBikeAssignment | null;
}

const LIFECYCLE_STAGES = [
  { key: 'Open', label: 'Created', icon: 'tabler:circle-plus' },
  { key: 'Confirmation', label: 'Confirmed', icon: 'tabler:circle-check' },
  { key: 'Ready', label: 'Ready', icon: 'tabler:circle-dot' },
  { key: 'In Progress', label: 'In Progress', icon: 'tabler:progress' },
  { key: 'Completed', label: 'Completed', icon: 'tabler:circle-check-filled' },
];

const STATUS_ORDER = ['Open', 'Confirmation', 'Ready', 'In Progress', 'Completed'];

export const WorkOrderServiceLifecycleCard: React.FC<WorkOrderServiceLifecycleCardProps> = ({
  workOrder,
  handleUpdateWorkOrder,
  usedPartsCount = 0,
  emergencyBike,
  emergencyAssignment,
}) => {
  const currentStatus = workOrder.status || 'Open';
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);
  const isOnHold = currentStatus === 'On Hold';

  const createdAt = workOrder.created_at ? dayjs(workOrder.created_at) : null;
  const confirmedAt = workOrder.confirmed_at ? dayjs(workOrder.confirmed_at) : null;
  const workStartedAt = workOrder.work_started_at ? dayjs(workOrder.work_started_at) : null;
  const completedAt = workOrder.completedAt ? dayjs(workOrder.completedAt) : null;

  const formatDuration = (start: dayjs.Dayjs | null, end: dayjs.Dayjs | null) => {
    if (!start || !end) return null;
    const diff = end.diff(start);
    const dur = dayjs.duration(diff);
    if (dur.asHours() < 1) return `${Math.round(dur.asMinutes())}m`;
    if (dur.asDays() < 1) return `${Math.floor(dur.asHours())}h ${Math.round(dur.minutes())}m`;
    return `${Math.floor(dur.asDays())}d ${Math.floor(dur.hours())}h`;
  };

  const totalTime = formatDuration(createdAt, completedAt || dayjs());

  return (
    <div className="bg-white">
      <div className="px-3 py-2 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">Service Lifecycle</h3>
        {usedPartsCount > 0 && (
          <span className="text-xs text-gray-500">{usedPartsCount} parts</span>
        )}
      </div>
      <div className="px-3 py-2">
        {isOnHold && (
          <div className="mb-2 bg-amber-50 border border-amber-200 rounded px-2 py-1.5 flex items-center gap-1.5">
            <Icon icon="tabler:clock-pause" className="w-3 h-3 text-amber-600" />
            <span className="text-xs font-medium text-amber-700">On Hold</span>
          </div>
        )}

        {/* Emergency Bike Info */}
        {emergencyAssignment && emergencyBike && (
          <div className="mb-2 bg-blue-50 border border-blue-200 rounded px-2 py-1.5">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Icon icon="tabler:motorbike" className="w-3 h-3 text-blue-600" />
              <span className="text-xs font-medium text-blue-700">Emergency Bike</span>
            </div>
            <p className="text-xs text-blue-800">
              {emergencyBike.license_plate} • {emergencyBike.make} {emergencyBike.model}
            </p>
          </div>
        )}

        {/* Timeline */}
        <div className="relative">
          {LIFECYCLE_STAGES.map((stage, index) => {
            const isCompleted = currentIndex >= index;
            const isCurrent = STATUS_ORDER[index] === currentStatus;
            const isLast = index === LIFECYCLE_STAGES.length - 1;

            let timestamp: string | null = null;
            if (stage.key === 'Open' && createdAt) timestamp = createdAt.format('MMM D, h:mm A');
            if (stage.key === 'Confirmation' && confirmedAt) timestamp = confirmedAt.format('MMM D, h:mm A');
            if (stage.key === 'In Progress' && workStartedAt) timestamp = workStartedAt.format('MMM D, h:mm A');
            if (stage.key === 'Completed' && completedAt) timestamp = completedAt.format('MMM D, h:mm A');

            const bgColor = isCompleted ? 'bg-emerald-500' : isCurrent ? 'bg-blue-100' : 'bg-gray-100';
            const iconColor = isCompleted ? 'text-white' : isCurrent ? 'text-blue-600' : 'text-gray-400';
            const textColor = isCurrent ? 'text-gray-900' : isCompleted ? 'text-gray-700' : 'text-gray-400';

            return (
              <div key={stage.key} className="flex items-start gap-2 relative">
                {!isLast && (
                  <div className={`absolute left-[11px] top-6 w-px h-6 ${isCompleted && currentIndex > index ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                )}
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${bgColor} ${isCurrent ? 'ring-2 ring-blue-500' : ''}`}>
                  <Icon icon={stage.icon} className={`w-3 h-3 ${iconColor}`} />
                </div>
                <div className={`pb-4 ${isLast ? 'pb-0' : ''}`}>
                  <p className={`text-xs font-medium ${textColor}`}>{stage.label}</p>
                  {timestamp && <p className="text-xs text-gray-500 mt-0.5">{timestamp}</p>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Time Metrics */}
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="bg-gray-50 rounded px-2 py-1.5">
            <p className="text-xs text-gray-500">Total Time</p>
            <p className="text-xs font-semibold text-gray-900">{totalTime || '-'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkOrderServiceLifecycleCard;
