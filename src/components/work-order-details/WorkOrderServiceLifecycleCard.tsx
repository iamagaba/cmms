import { Bike, CheckCircle, Clock, Loader2, Plus, X } from 'lucide-react';
import React from 'react';


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
  { key: 'Open', label: 'Created', icon: Plus },
  { key: 'Confirmation', label: 'Confirmed', icon: CheckCircle },
  { key: 'Ready', label: 'Ready', icon: Clock },
  { key: 'In Progress', label: 'In Progress', icon: Loader2 },
  { key: 'Completed', label: 'Completed', icon: CheckCircle },
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
    <div className="bg-white border border-border rounded-lg overflow-hidden shadow-sm">
      <div className="px-3 py-2 border-b border-border flex items-center justify-between">
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide">Service Lifecycle</h3>
        {usedPartsCount > 0 && (
          <span className="text-xs text-muted-foreground">{usedPartsCount} parts</span>
        )}
      </div>
      <div className="px-3 py-2">
        {isOnHold && (
          <div className="mb-2 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5 flex items-center gap-1.5">
            <Clock className="w-5 h-5 text-amber-600" />
            <span className="text-xs font-medium text-amber-700">On Hold</span>
          </div>
        )}

        {/* Emergency Bike Info */}
        {emergencyAssignment && emergencyBike && (
          <div className="mb-2 bg-muted border border-blue-200 rounded-lg px-2 py-1.5">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Bike className="w-5 h-5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Emergency Bike</span>
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

            const bgColor = isCompleted ? 'bg-emerald-500' : isCurrent ? 'bg-muted' : 'bg-muted';
            const iconColor = isCompleted ? 'text-white' : isCurrent ? 'text-muted-foreground' : 'text-muted-foreground';
            const textColor = isCurrent ? 'text-foreground' : isCompleted ? 'text-foreground' : 'text-muted-foreground';

            return (
              <div key={stage.key} className="flex items-start gap-2 relative">
                {!isLast && (
                  <div className={`absolute left-[11px] top-6 w-px h-6 ${isCompleted && currentIndex > index ? 'bg-emerald-500' : 'bg-border'}`} />
                )}
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${bgColor} ${isCurrent ? 'ring-2 ring-blue-500' : ''}`}>
                  <stage.icon className={`w-4 h-4 ${iconColor}`} />
                </div>
                <div className={`pb-4 ${isLast ? 'pb-0' : ''}`}>
                  <p className={`text-xs font-medium ${textColor}`}>{stage.label}</p>
                  {timestamp && <p className="text-xs text-muted-foreground mt-0.5">{timestamp}</p>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Time Metrics */}
        <div className="mt-2 pt-2 border-t border-border">
          <div className="bg-muted rounded-lg px-2 py-1.5">
            <p className="text-xs text-muted-foreground">Total Time</p>
            <p className="text-xs font-semibold text-foreground">{totalTime || '-'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkOrderServiceLifecycleCard;

