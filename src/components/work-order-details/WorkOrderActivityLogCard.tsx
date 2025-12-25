import React from 'react';
import { Icon } from '@iconify/react';
import { WorkOrder } from '@/types/supabase';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface WorkOrderActivityLogCardProps {
  workOrder: WorkOrder;
  profileMap: Map<string, string>;
}

export const WorkOrderActivityLogCard: React.FC<WorkOrderActivityLogCardProps> = ({
  workOrder,
  profileMap,
}) => {
  const activityLog = workOrder.activityLog || [];

  const getActivityIcon = (activity: string): string => {
    const lower = activity.toLowerCase();
    if (lower.includes('created')) return 'tabler:circle-plus';
    if (lower.includes('assigned')) return 'tabler:user-check';
    if (lower.includes('status')) return 'tabler:refresh';
    if (lower.includes('completed')) return 'tabler:circle-check-filled';
    if (lower.includes('hold')) return 'tabler:clock-pause';
    if (lower.includes('part')) return 'tabler:package';
    if (lower.includes('note') || lower.includes('comment')) return 'tabler:message';
    if (lower.includes('sla')) return 'tabler:clock';
    if (lower.includes('priority')) return 'tabler:flag';
    if (lower.includes('location')) return 'tabler:map-pin';
    return 'tabler:activity';
  };

  const getActivityColor = (activity: string): string => {
    const lower = activity.toLowerCase();
    if (lower.includes('completed')) return 'text-emerald-600 bg-emerald-100';
    if (lower.includes('hold')) return 'text-amber-600 bg-amber-100';
    if (lower.includes('assigned')) return 'text-blue-600 bg-blue-100';
    if (lower.includes('created')) return 'text-purple-600 bg-purple-100';
    if (lower.includes('progress')) return 'text-orange-600 bg-orange-100';
    return 'text-gray-600 bg-gray-100';
  };

  const sortedLog = [...activityLog].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="bg-white">
      <div className="px-3 py-2 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">Activity</h3>
          {activityLog.length > 0 && (
            <span className="bg-gray-200 text-gray-700 text-[10px] font-medium px-1.5 py-0.5 rounded-full">
              {activityLog.length}
            </span>
          )}
        </div>
      </div>
      <div className="px-3 py-2">
        {sortedLog.length === 0 ? (
          <div className="text-center py-4">
            <Icon icon="tabler:history-off" className="w-6 h-6 text-gray-300 mx-auto mb-1" />
            <p className="text-xs text-gray-400">No activity recorded yet</p>
          </div>
        ) : (
          <div className="relative">
            {sortedLog.map((entry, index) => {
              const userName = entry.userId ? profileMap.get(entry.userId) || 'Unknown User' : 'System';
              const timestamp = dayjs(entry.timestamp);
              const isRecent = timestamp.isAfter(dayjs().subtract(1, 'hour'));
              const isLast = index === sortedLog.length - 1;

              return (
                <div key={index} className="flex gap-2 relative pb-2.5 last:pb-0">
                  {/* Timeline connector line */}
                  {!isLast && (
                    <div 
                      className="absolute left-3 w-px bg-gray-200" 
                      style={{ 
                        top: '28px',
                        height: 'calc(100% - 32px)'
                      }}
                    />
                  )}
                  
                  {/* Activity icon */}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 relative z-10 ${getActivityColor(entry.activity)}`}>
                    <Icon icon={getActivityIcon(entry.activity)} className="w-3 h-3" />
                  </div>
                  
                  {/* Activity content */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-xs text-gray-900 leading-snug">{entry.activity}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs text-gray-500">{userName}</span>
                      <span className="text-gray-300">•</span>
                      <span className={`text-xs ${isRecent ? 'text-primary-600 font-medium' : 'text-gray-400'}`}>
                        {timestamp.fromNow()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkOrderActivityLogCard;
