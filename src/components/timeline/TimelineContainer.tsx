/**
 * TimelineContainer Component
 * Main container component for the vertical activity timeline feature
 * Uses shadcn/ui components with default styling as per application isolation rules
 */

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTimeline } from '@/hooks/useTimeline';
import { TimelineItem } from './TimelineItem';
import { TimelineFilters } from './TimelineFilters';
import { AddNoteInterface } from './AddNoteInterface';
import type { TimelineFilters as ITimelineFilters, Activity } from '@/types/activity-timeline';

interface TimelineContainerProps {
  workOrderId: string;
  filters?: ITimelineFilters;
  onActivityAdd?: (activity: Activity) => void;
  className?: string;
}

/**
 * TimelineContainer - Main timeline display component
 * 
 * Features:
 * - Uses shadcn/ui Card components with default styling (shadow-sm, rounded-lg, p-6)
 * - Implements ScrollArea for timeline scrolling with 600px height
 * - Integrates TimelineFilters component for filtering functionality
 * - Real-time updates via useTimeline hook
 * - Follows Requirements 1.1, 1.2, 6.1, 3.1, 3.2, 3.3
 */
export function TimelineContainer({ 
  workOrderId, 
  filters, 
  onActivityAdd,
  className 
}: TimelineContainerProps) {
  const {
    activities,
    loading,
    error,
    refetch,
    addNote,
    updateFilters,
    isConnected
  } = useTimeline({
    workOrderId,
    filters,
    enableRealTime: true
  });

  // Handle activity addition callback
  React.useEffect(() => {
    if (activities.length > 0 && onActivityAdd) {
      // Call callback with the most recent activity when new ones are added
      const latestActivity = activities[0];
      onActivityAdd(latestActivity);
    }
  }, [activities, onActivityAdd]);

  // Mock technicians data - in a real app, this would come from a hook or prop
  const availableTechnicians = React.useMemo(() => [
    { id: '1', name: 'John Smith' },
    { id: '2', name: 'Sarah Johnson' },
    { id: '3', name: 'Mike Davis' },
    { id: '4', name: 'Lisa Chen' },
    { id: '5', name: 'David Wilson' },
  ], []);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Activity Timeline
          {/* Real-time connection indicator */}
          {isConnected && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Live
            </div>
          )}
        </CardTitle>
        
        {/* Timeline Filters Integration */}
        <TimelineFilters
          filters={filters || {}}
          onFiltersChange={updateFilters}
          availableTechnicians={availableTechnicians}
        />
        
        <div className="text-sm text-muted-foreground">
          {activities.length} {activities.length === 1 ? 'activity' : 'activities'}
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[600px]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">Loading timeline...</div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-2">
              <div className="text-sm text-destructive">Error loading timeline</div>
              <div className="text-xs text-muted-foreground">{error}</div>
              <button 
                onClick={refetch}
                className="text-xs text-primary hover:underline"
              >
                Try again
              </button>
            </div>
          ) : (
            <div className="space-y-4 p-4">
              {/* Add Note Interface */}
              <AddNoteInterface
                workOrderId={workOrderId}
                onNoteAdded={(activity) => {
                  // The real-time subscription should handle this, but we can also manually add
                  console.log('Note added:', activity);
                  if (onActivityAdd) {
                    onActivityAdd(activity);
                  }
                }}
              />
              
              {activities.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-sm text-muted-foreground">No activities yet</div>
                </div>
              ) : (
                <div className="space-y-0">
                  {/* Timeline items using the new TimelineItem component */}
                  {activities.map((activity, index) => (
                    <TimelineItem
                      key={activity.id}
                      activity={activity}
                      isLatest={index === 0}
                      showAvatar={true}
                      showMetadata={true}
                      onClick={(activity) => {
                        // Handle activity click - could open details modal, etc.
                        console.log('Activity clicked:', activity);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default TimelineContainer;