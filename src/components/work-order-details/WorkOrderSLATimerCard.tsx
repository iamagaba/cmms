import { CheckCircle, X } from 'lucide-react';
import React, { useState, useEffect } from 'react';


import { WorkOrder } from '@/types/supabase';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

interface WorkOrderSLATimerCardProps {
  workOrder: WorkOrder;
}

export const WorkOrderSLATimerCard: React.FC<WorkOrderSLATimerCardProps> = ({ workOrder }) => {
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
    safe: { bg: 'bg-muted', border: 'border-emerald-200', text: 'text-foreground', bar: 'bg-emerald-500', icon: CheckCircle },
    warning: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', bar: 'bg-amber-500', icon: AlertCircle },
    critical: { bg: 'bg-muted', border: 'border-orange-200', text: 'text-muted-foreground', bar: 'bg-orange-500', icon: AlertCircle },
    overdue: { bg: 'bg-destructive/10', border: 'border-destructive/20', text: 'text-destructive', bar: 'bg-destructive', icon: X },
  };

  const config = urgencyConfig[urgency];

  return (
    <div className={`${config.bg} border ${config.border} rounded-lg overflow-hidden`}>
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <config.icon className={`w-5 h-5 ${config.text}`} />
          <span className={`text-sm font-semibold ${config.text}`}>
            {isOverdue ? 'SLA Overdue' : 'SLA Timer'}
          </span>
        </div>
        <div className={`text-right`}>
          <div className={`text-2xl font-bold ${config.text}`}>
            {isOverdue ? '-' : ''}{formatTime(remaining)}
          </div>
          <div className="text-xs text-muted-foreground">
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
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>Created: {created.format('MMM D, h:mm A')}</span>
          <span>Due: {slaDue.format('MMM D, h:mm A')}</span>
        </div>
      </div>
    </div>
  );
};

export default WorkOrderSLATimerCard;


