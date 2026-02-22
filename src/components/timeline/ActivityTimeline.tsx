/**
 * Activity Timeline Component
 * Displays real activity timeline for work orders
 */

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { TimelineItem } from './TimelineItem';
import { TimelineFilters } from './TimelineFilters';
import type { Activity, ActivityType } from '@/types/activity-timeline';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ActivityTimelineProps {
  workOrderId: string;
  className?: string;
}

/**
 * Activity Timeline - Real implementation using work order activity log
 */
export function ActivityTimeline({ workOrderId, className }: ActivityTimelineProps) {
  const [noteContent, setNoteContent] = React.useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch work order to get activity log
  const { data: workOrder } = useQuery({
    queryKey: ['work_order', workOrderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('work_orders')
        .select('*, profiles(*)')
        .eq('id', workOrderId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!workOrderId,
  });

  // Fetch all profiles for user name mapping
  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email');

      if (error) throw error;
      return data;
    },
  });

  // Build profile map
  const profileMap = React.useMemo(() => {
    const map = new Map<string, string>();
    profiles.forEach(p => {
      const name = p.full_name || p.email || 'Unknown User';
      map.set(p.id, name);
    });
    return map;
  }, [profiles]);

  // Convert activity log to Activity format
  const activities: Activity[] = React.useMemo(() => {
    if (!workOrder?.activity_log) return [];

    return workOrder.activity_log.map((entry: any, index: number) => {
      // Determine activity type from activity text
      const activityText = entry.activity?.toLowerCase() || '';
      let activityType: ActivityType = 'note_added';
      
      if (activityText.includes('created')) activityType = 'created';
      else if (activityText.includes('assigned')) activityType = 'assigned';
      else if (activityText.includes('started')) activityType = 'started';
      else if (activityText.includes('paused') || activityText.includes('hold')) activityType = 'paused';
      else if (activityText.includes('completed')) activityType = 'completed';
      else if (activityText.includes('status')) activityType = 'status_changed';
      else if (activityText.includes('priority')) activityType = 'priority_changed';

      const userName = entry.userId ? profileMap.get(entry.userId) || 'Unknown User' : 'System';

      return {
        id: `activity-${index}`,
        work_order_id: workOrderId,
        activity_type: activityType,
        title: entry.activity,
        description: entry.activity,
        user_id: entry.userId || 'system',
        user_name: userName,
        user_avatar: undefined,
        created_at: entry.timestamp,
        metadata: {}
      };
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [workOrder?.activity_log, profileMap, workOrderId]);

  // Mutation to add note
  const addNoteMutation = useMutation({
    mutationFn: async (content: string) => {
      const currentLog = workOrder?.activity_log || [];
      const newEntry = {
        activity: content,
        timestamp: new Date().toISOString(),
        userId: (await supabase.auth.getUser()).data.user?.id
      };

      const { error } = await supabase
        .from('work_orders')
        .update({
          activity_log: [...currentLog, newEntry]
        })
        .eq('id', workOrderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work_order', workOrderId] });
      setNoteContent('');
      toast({
        title: 'Note added',
        description: 'Your note has been added to the timeline.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add note',
        variant: 'destructive',
      });
    },
  });

  const handleNoteAdded = () => {
    const content = noteContent.trim();
    if (!content) return;
    addNoteMutation.mutate(content);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleNoteAdded();
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Activity Timeline</CardTitle>
          <p className="text-xs text-muted-foreground">
            {activities.length} {activities.length === 1 ? 'activity' : 'activities'}
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Add Note Interface */}
        <div className="border rounded-md p-3 bg-muted/30">
          <h4 className="text-xs font-medium mb-2">Add Note</h4>
          <Textarea
            placeholder="Add a note to the timeline..."
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            className="resize-none text-sm"
            disabled={addNoteMutation.isPending}
          />
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground">
              Press Ctrl+Enter to add note
            </p>
            <Button 
              size="sm" 
              onClick={handleNoteAdded}
              disabled={!noteContent.trim() || addNoteMutation.isPending}
              className="h-7 text-xs"
            >
              {addNoteMutation.isPending ? 'Adding...' : 'Add Note'}
            </Button>
          </div>
        </div>
        
        {/* Timeline Activities */}
        <ScrollArea className="h-[350px]">
          {activities.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-muted-foreground">No activities yet</p>
            </div>
          ) : (
            <div className="pr-3">
              {activities.map((activity, index) => (
                <TimelineItem
                  key={activity.id}
                  activity={activity}
                  isLatest={index === 0}
                  showAvatar={true}
                  showMetadata={true}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default ActivityTimeline;