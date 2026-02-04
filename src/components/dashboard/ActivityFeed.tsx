import { AlertCircle, Calendar, CheckCircle, Settings, User } from 'lucide-react';
/**
 * Activity Feed Component
 * 
 * Real-time activity feed for CMMS dashboard with desktop-optimized
 * interactions, hover states, and professional styling.
 */

import React, { useState, useMemo } from 'react';


import { Icon } from '@/components/icons/Icon';
import { motion, AnimatePresence } from 'framer-motion';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { cn } from '@/lib/utils';

dayjs.extend(relativeTime);

// ============================================
// INTERFACES
// ============================================

export interface Activity {
  id: string | number;
  type: 'work_order_completed' | 'asset_alert' | 'maintenance_scheduled' | 'user_action' | 'system_event';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  color: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  userName?: string;
  metadata?: Record<string, any>;
}

export interface ActivityFeedProps {
  activities?: Activity[];
  maxItems?: number;
  showViewAll?: boolean;
  onViewAll?: () => void;
  onActivityClick?: (activity: Activity) => void;
  className?: string;
  loading?: boolean;
}

// ============================================
// ACTIVITY TYPE CONFIGURATIONS
// ============================================

const activityTypeConfig = {
  work_order_completed: {
    defaultIcon: CheckmarkCircle01Icon,
    defaultColor: 'text-industrial-600',
    bgColor: 'bg-industrial-50',
    borderColor: 'border-industrial-200'
  },
  asset_alert: {
    defaultIcon: Alert01Icon,
    defaultColor: 'text-warning-600',
    bgColor: 'bg-warning-50',
    borderColor: 'border-warning-200'
  },
  maintenance_scheduled: {
    defaultIcon: Calendar01Icon,
    defaultColor: 'text-steel-600',
    bgColor: 'bg-steel-50',
    borderColor: 'border-steel-200'
  },
  user_action: {
    defaultIcon: UserIcon,
    defaultColor: 'text-machinery-600',
    bgColor: 'bg-machinery-50',
    borderColor: 'border-machinery-200'
  },
  system_event: {
    defaultIcon: Settings01Icon,
    defaultColor: 'text-machinery-600',
    bgColor: 'bg-machinery-50',
    borderColor: 'border-machinery-200'
  }
};

// ============================================
// MOCK DATA
// ============================================

const mockActivities: Activity[] = [
  {
    id: 1,
    type: 'work_order_completed',
    title: 'Work Order #WO-2024-001 completed',
    description: 'Pump maintenance completed by John Smith',
    timestamp: dayjs().subtract(2, 'minutes').toISOString(),
    icon: CheckCircle,
    color: 'text-industrial-600',
    priority: 'medium',
    userName: 'John Smith'
  },
  {
    id: 2,
    type: 'asset_alert',
    title: 'High temperature alert',
    description: 'Motor B-202 temperature exceeds threshold (85°C)',
    timestamp: dayjs().subtract(15, 'minutes').toISOString(),
    icon: AlertCircle,
    color: 'text-warning-600',
    priority: 'high'
  },
  {
    id: 3,
    type: 'maintenance_scheduled',
    title: 'Preventive maintenance scheduled',
    description: 'Valve C-303 scheduled for next week',
    timestamp: dayjs().subtract(1, 'hour').toISOString(),
    icon: Calendar,
    color: 'text-steel-600',
    priority: 'low',
    userName: 'System'
  },
  {
    id: 4,
    type: 'work_order_completed',
    title: 'Emergency repair completed',
    description: 'Conveyor belt repair finished ahead of schedule',
    timestamp: dayjs().subtract(2, 'hours').toISOString(),
    icon: CheckCircle,
    color: 'text-industrial-600',
    priority: 'high',
    userName: 'Mike Johnson'
  },
  {
    id: 5,
    type: 'user_action',
    title: 'New technician assigned',
    description: 'Sarah Wilson assigned to Area A maintenance team',
    timestamp: dayjs().subtract(3, 'hours').toISOString(),
    icon: UserPlus,
    color: 'text-machinery-600',
    priority: 'low',
    userName: 'Admin'
  }
];

// ============================================
// ACTIVITY ITEM COMPONENT
// ============================================

interface ActivityItemProps {
  activity: Activity;
  onClick?: (activity: Activity) => void;
  index: number;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ activity, onClick, index }) => {
  const config = activityTypeConfig[activity.type];
  const isClickable = !!onClick;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      className={cn(
        'group flex items-start gap-3 px-6 py-3 transition-colors duration-150',
        'hover:bg-slate-50 dark:hover:bg-slate-800',
        isClickable && 'cursor-pointer'
      )}
      onClick={isClickable ? () => onClick(activity) : undefined}
    >
      {/* Icon */}
      <div className={cn(
        'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center',
        config.bgColor
      )}>
        <Icon
          icon={activity.icon || config.defaultIcon}
          className={cn('w-5 h-5', activity.color || config.defaultColor)}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {activity.title}
        </p>
        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
          {activity.description}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {dayjs(activity.timestamp).fromNow()}
        </p>
      </div>

      {isClickable && (
        <Icon
          icon="tabler:chevron-right"
          className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1"
        />
      )}
    </motion.div>
  );
};

// ============================================
// LOADING SKELETON
// ============================================

const ActivityFeedSkeleton: React.FC = () => (
  <div className="space-y-4">
    {Array.from({ length: 3 }).map((_, index) => (
      <div key={index} className="flex items-start gap-3 p-3">
        <div className="w-8 h-8 bg-muted rounded-lg animate-pulse flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
          <div className="h-3 w-full bg-muted rounded animate-pulse" />
          <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
        </div>
      </div>
    ))}
  </div>
);

// ============================================
// MAIN COMPONENT
// ============================================

const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  maxItems = 5,
  showViewAll = true,
  onViewAll,
  onActivityClick,
  className,
  loading = false
}) => {
  const [filter, setFilter] = useState<'all' | 'alerts' | 'completed'>('all');

  const displayActivities = useMemo(() => {
    const data = activities || mockActivities;

    let filtered = data;
    if (filter === 'alerts') {
      filtered = data.filter(a => a.type === 'asset_alert');
    } else if (filter === 'completed') {
      filtered = data.filter(a => a.type === 'work_order_completed');
    }

    return filtered.slice(0, maxItems);
  }, [activities, filter, maxItems]);

  return (
    <div className={cn(className)}>
      {/* Filter Tabs */}
      <div className="flex bg-muted rounded-lg p-1 mb-4 mx-6 mt-4">
        {[
          { key: 'all', label: 'All' },
          { key: 'alerts', label: 'Alerts' },
          { key: 'completed', label: 'Completed' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={cn(
              'flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
              filter === tab.key
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Activity List */}
      <div className="divide-y divide-border">
        {loading ? (
          <ActivityFeedSkeleton />
        ) : displayActivities.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {displayActivities.map((activity, index) => (
              <ActivityItem
                key={activity.id}
                activity={activity}
                onClick={onActivityClick}
                index={index}
              />
            ))}
          </AnimatePresence>
        ) : (
          <div className="text-center py-12 px-6 text-muted-foreground">
            <InboxIcon size={40} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// EXPORTS
// ============================================

export default ActivityFeed;
export type { ActivityFeedProps, Activity };
