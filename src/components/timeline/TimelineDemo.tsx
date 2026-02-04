/**
 * Timeline Demo Component
 * Shows the timeline feature with sample data for demonstration
 */

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TimelineItem } from './TimelineItem';
import { TimelineFilters } from './TimelineFilters';
import { AddNoteInterface } from './AddNoteInterface';
import type { Activity } from '@/types/activity-timeline';

interface TimelineDemoProps {
  workOrderId: string;
  className?: string;
}

/**
 * Demo timeline with sample data to showcase the feature
 */
export function TimelineDemo({ workOrderId, className }: TimelineDemoProps) {
  const [activities, setActivities] = React.useState<Activity[]>([]);

  // Sample activities for demonstration
  React.useEffect(() => {
    const sampleActivities: Activity[] = [
      {
        id: '7',
        work_order_id: workOrderId,
        activity_type: 'note_added',
        title: 'Note added',
        description: 'Contacted customer to inform about delay. Customer is understanding and agreed to reschedule.',
        user_id: 'user-1',
        user_name: 'John Smith',
        user_avatar: undefined,
        created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
        metadata: {
          note_content: 'Contacted customer to inform about delay. Customer is understanding and agreed to reschedule.',
          note_type: 'customer_communication'
        }
      },
      {
        id: '6',
        work_order_id: workOrderId,
        activity_type: 'paused',
        title: 'Work paused',
        description: 'Work paused - waiting for replacement parts to arrive',
        user_id: 'user-1',
        user_name: 'John Smith',
        user_avatar: undefined,
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        metadata: {
          reason: 'Waiting for parts',
          expected_resume: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        }
      },
      {
        id: '5',
        work_order_id: workOrderId,
        activity_type: 'note_added',
        title: 'Note added',
        description: 'Ordered replacement bearing (Part #BRG-4521). Expected delivery tomorrow morning.',
        user_id: 'user-1',
        user_name: 'John Smith',
        user_avatar: undefined,
        created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
        metadata: {
          note_content: 'Ordered replacement bearing (Part #BRG-4521). Expected delivery tomorrow morning.',
          note_type: 'parts_order'
        }
      },
      {
        id: '4',
        work_order_id: workOrderId,
        activity_type: 'note_added',
        title: 'Note added',
        description: 'Customer reported unusual noise from the equipment. Initial inspection shows potential bearing issue.',
        user_id: 'user-1',
        user_name: 'John Smith',
        user_avatar: undefined,
        created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
        metadata: {
          note_content: 'Customer reported unusual noise from the equipment. Initial inspection shows potential bearing issue.',
          note_type: 'diagnostic'
        }
      },
      {
        id: '3',
        work_order_id: workOrderId,
        activity_type: 'started',
        title: 'Work started',
        description: 'Technician arrived on site and began work',
        user_id: 'user-1',
        user_name: 'John Smith',
        user_avatar: undefined,
        created_at: new Date(Date.now() - 90 * 60 * 1000).toISOString(), // 1.5 hours ago
        metadata: {
          location: 'Customer Site',
          arrival_time: new Date(Date.now() - 90 * 60 * 1000).toISOString()
        }
      },
      {
        id: '2',
        work_order_id: workOrderId,
        activity_type: 'assigned',
        title: 'Technician assigned',
        description: 'Assigned to John Smith for maintenance work',
        user_id: 'user-2',
        user_name: 'Dispatch Manager',
        user_avatar: undefined,
        created_at: new Date(Date.now() - 105 * 60 * 1000).toISOString(), // 1 hour 45 minutes ago
        metadata: {
          assigned_to: 'John Smith',
          assigned_by: 'Dispatch Manager'
        }
      },
      {
        id: '1',
        work_order_id: workOrderId,
        activity_type: 'created',
        title: 'Work order created',
        description: 'Initial work order created for maintenance request',
        user_id: 'system',
        user_name: 'System Admin',
        user_avatar: undefined,
        created_at: new Date(Date.now() - 120 * 60 * 1000).toISOString(), // 2 hours ago
        metadata: {
          work_order_number: 'WO-2024-001',
          priority: 'Medium',
          status: 'New'
        }
      }
    ];

    setActivities(sampleActivities);
  }, [workOrderId]);

  // Mock technicians data
  const availableTechnicians = React.useMemo(() => [
    { id: '1', name: 'John Smith' },
    { id: '2', name: 'Sarah Johnson' },
    { id: '3', name: 'Mike Davis' },
    { id: '4', name: 'Lisa Chen' },
    { id: '5', name: 'David Wilson' },
  ], []);

  const handleNoteAdded = (content: string) => {
    const newActivity: Activity = {
      id: `note-${Date.now()}`,
      work_order_id: workOrderId,
      activity_type: 'note_added',
      title: 'Note added',
      description: content,
      user_id: 'current-user',
      user_name: 'Current User',
      user_avatar: undefined,
      created_at: new Date().toISOString(),
      metadata: {
        note_content: content,
        note_type: 'user_note'
      }
    };

    setActivities(prev => [newActivity, ...prev]);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Activity Timeline
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Demo Mode
          </div>
        </CardTitle>
        
        <TimelineFilters
          filters={{}}
          onFiltersChange={() => {}}
          availableTechnicians={availableTechnicians}
        />
        
        <div className="text-sm text-muted-foreground">
          {activities.length} {activities.length === 1 ? 'activity' : 'activities'}
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[600px]">
          <div className="space-y-4 p-4">
            {/* Add Note Interface */}
            <div className="border rounded-lg p-4 bg-muted/50">
              <h4 className="text-sm font-medium mb-2">Add Note (Demo)</h4>
              <textarea
                className="w-full p-2 border rounded text-sm"
                placeholder="Add a note to the timeline..."
                rows={3}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    const content = (e.target as HTMLTextAreaElement).value.trim();
                    if (content) {
                      handleNoteAdded(content);
                      (e.target as HTMLTextAreaElement).value = '';
                    }
                  }
                }}
              />
              <div className="text-xs text-muted-foreground mt-1">
                Press Ctrl+Enter to add note
              </div>
            </div>
            
            {activities.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-muted-foreground">No activities yet</div>
              </div>
            ) : (
              <div className="space-y-0">
                {activities.map((activity, index) => (
                  <TimelineItem
                    key={activity.id}
                    activity={activity}
                    isLatest={index === 0}
                    showAvatar={true}
                    showMetadata={true}
                    onClick={(activity) => {
                      console.log('Activity clicked:', activity);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default TimelineDemo;