import React, { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  CheckmarkCircle01Icon,
  AlertCircleIcon,
  Cancel01Icon
} from '@hugeicons/core-free-icons';
import { WorkOrder } from '@/types/supabase';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { useDensitySpacing } from '@/hooks/useDensitySpacing';
import { useDensity } from '@/context/DensityContext';

dayjs.extend(duration);

interface WorkOrderSLATimerCardProps {
  workOrder: WorkOrder;
}

export const WorkOrderSLATimerCard: React.FC<WorkOrderSLATimerCardProps> = ({ workOrder }) => {
  const spacing = useDensitySpacing();
  const { isCompact } = useDensity();
  const [now, setNow] = useState(dayjs());

  // Update every minute
  useEffect(() => {
    const interval = setInterval(() => setNow(dayjs()), 60000);
    return () => clearInterval(interval);
  }, []);

  if (!workOrder.slaDue || workOrder.status === 'Completed') {
    return null;
  }

  const slaDue = dayjs(workOrder.slaDue);
  const created = dayjs(workOrder.created_at);
  const totalDuration = slaDue.diff(created);
  const elapsed = now.diff(created);
  const remaining = slaDue.diff(now);
  const isOverdue = remaining < 0;

  // Don't show the card if overdue
  if (isOverdue) {
    return null;
  }
  const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));

  // Format remaining/overdue time
  const formatTime = (ms: number): string => {
    const absDur = dayjs.duration(Math.abs(ms));
    const days = Math.floor(absDur.asDays());
    const hours = absDur.hours();
    const minutes = absDur.minutes();

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Determine urgency level
  const getUrgencyLevel = (): 'safe' | 'warning' | 'critical' | 'overdue' => {
    if (isOverdue) return 'overdue';
    const hoursRemaining = remaining / (1000 * 60 * 60);
    if (hoursRemaining <= 1) return 'critical';
    if (hoursRemaining <= 4) return 'warning';
    return 'safe';
  };

  const urgency = getUrgencyLevel();

  const urgencyConfig = {
    safe: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', bar: 'bg-emerald-500', icon: CheckmarkCircle01Icon },
    warning: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', bar: 'bg-amber-500', icon: AlertCircleIcon },
    critical: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', bar: 'bg-orange-500', icon: AlertCircleIcon },
    overdue: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', bar: 'bg-red-500', icon: Cancel01Icon },
  };

  const config = urgencyConfig[urgency];

  return (
    <div className={`${config.bg} border ${config.border} rounded-xl overflow-hidden`}>
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={config.icon} size={20} className={config.text} />
          <span className={`text-sm font-semibold ${config.text}`}>
            {isOverdue ? 'SLA Overdue' : 'SLA Timer'}
          </span>
        </div>
        <div className={`text-right`}>
          <div className={`text-2xl font-bold ${config.text}`}>
            {isOverdue ? '-' : ''}{formatTime(remaining)}
          </div>
          <div className="text-xs text-gray-500">
            {isOverdue ? 'overdue' : 'remaining'}
          </div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="px-4 pb-3">
        <div className="h-2 bg-white/50 rounded-full overflow-hidden">
          <div 
            className={`h-full ${config.bar} transition-all duration-500`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>Created: {created.format('MMM D, h:mm A')}</span>
          <span>Due: {slaDue.format('MMM D, h:mm A')}</span>
        </div>
      </div>
    </div>
  );
};

export default WorkOrderSLATimerCard;
