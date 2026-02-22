import React from 'react';
import { Clock, User, Package, Flag, MapPin, MessageSquare, CheckCircle, Pause, RefreshCw, Plus } from 'lucide-react';
import { WorkOrder } from '@/types/supabase';
import { ScrollArea } from '@/components/ui/scroll-area';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface ActivityTimelineProps {
  workOrder: WorkOrder;
  profileMap: Map<string, string>;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  workOrder,
  profileMap,
}) => {
  const activityLog = workOrder.activityLog || [];

  const getActivityIcon = (activity: string) => {
    const lower = activity.toLowerCase();
    if (lower.includes('created')) return Plus;
    if (lower.includes('assigned')) return User;
    if (lower.includes('status')) return RefreshCw;
    if (lower.includes('completed')) return CheckCircle;
    if (lower.includes('hold')) return Pause;
    if (lower.includes('part')) return Package;
    if (lower.includes('note') || lower.includes('comment')) return MessageSquare;
    if (lower.includes('priority')) return Flag;
    if (lower.includes('location')) return MapPin;
    return Clock;
  };

  const getActivityColor = (activity: string): string => {
    const lower = activity.toLowerCase();
    if (lower.includes('completed')) return 'text-green-600 bg-green-100';
    if (lower.includes('hold')) return 'text-amber-600 bg-amber-100';
    if (lower.includes('assigned')) return 'text-blue-600 bg-blue-100';
    if (lower.includes('created')) return 'text-teal-600 bg-teal-100';
    if (lower.includes('progress')) return 'text-purple-600 bg-purple-100';
    if (lower.includes('part')) return 'text-orange-600 bg-orange-100';
    return 'text-slate-600 bg-slate-100';
  };

  const sortedLog = [...activityLog].sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="pb-6 border-b border-border">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-left">
        Activity Timeline
      </h3>

      {sortedLog.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-30" />
          <p className="text-xs text-muted-foreground">No activity recorded yet</p>
        </div>
      ) : (
        <ScrollArea className="h-[400px] pr-3">
          <div className="relative">
            {sortedLog.map((entry, index) => {
              const userName = entry.userId ? profileMap.get(entry.userId) || 'Unknown User' : 'System';
              const timestamp = dayjs(entry.timestamp);
              const isRecent = timestamp.isAfter(dayjs().subtract(1, 'hour'));
              const isLast = index === sortedLog.length - 1;
              const Icon = getActivityIcon(entry.activity);

              return (
                <div key={index} className="flex gap-3 relative pb-4 last:pb-0">
                  {/* Timeline connector line */}
                  {!isLast && (
                    <div
                      className="absolute left-4 w-px bg-border"
                      style={{
                        top: '32px',
                        height: 'calc(100% - 32px)'
                      }}
                    />
                  )}

                  {/* Activity icon */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 relative z-10 ${getActivityColor(entry.activity)}`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  {/* Activity content */}
                  <div className="flex-1 min-w-0 pt-1">
                    <p className="text-xs font-medium text-foreground leading-snug">
                      {entry.activity}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-xs text-muted-foreground">{userName}</span>
                      <span className="text-muted-foreground/50">•</span>
                      <span className={`text-xs ${isRecent ? 'text-teal-600 font-medium' : 'text-muted-foreground'}`}>
                        {timestamp.fromNow()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default ActivityTimeline;
