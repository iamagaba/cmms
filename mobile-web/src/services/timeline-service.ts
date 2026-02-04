/**
 * Timeline Service for Mobile Web - Core data operations for activity timeline
 * Adapted from desktop version with mobile-specific optimizations
 */

import { supabase } from '@/lib/supabase';
import type { 
  Activity, 
  TimelineFilters, 
  TimelineService as ITimelineService,
  ActivityType
} from '@/types/activity-timeline';

/**
 * Custom error classes for better error handling
 */
export class TimelineServiceError extends Error {
  constructor(message: string, public code: string, public originalError?: Error) {
    super(message);
    this.name = 'TimelineServiceError';
  }
}

export class ValidationError extends TimelineServiceError {
  constructor(message: string, public field: string) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class DatabaseError extends TimelineServiceError {
  constructor(message: string, originalError?: Error) {
    super(message, 'DATABASE_ERROR', originalError);
    this.name = 'DatabaseError';
  }
}

/**
 * Data validation utilities
 */
class TimelineValidator {
  static validateWorkOrderId(workOrderId: string): void {
    if (!workOrderId || typeof workOrderId !== 'string') {
      throw new ValidationError('Work order ID is required and must be a string', 'workOrderId');
    }
    
    // Basic UUID format validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(workOrderId)) {
      throw new ValidationError('Work order ID must be a valid UUID', 'workOrderId');
    }
  }

  static validateUserId(userId: string): void {
    if (!userId || typeof userId !== 'string') {
      throw new ValidationError('User ID is required and must be a string', 'userId');
    }
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      throw new ValidationError('User ID must be a valid UUID', 'userId');
    }
  }

  static validateNoteContent(content: string): void {
    if (!content || typeof content !== 'string') {
      throw new ValidationError('Note content is required and must be a string', 'content');
    }
    
    if (content.trim().length === 0) {
      throw new ValidationError('Note content cannot be empty', 'content');
    }
    
    if (content.length > 10000) {
      throw new ValidationError('Note content cannot exceed 10,000 characters', 'content');
    }
  }

  static validateTimelineFilters(filters: TimelineFilters): void {
    if (!filters) return;

    // Validate date range
    if (filters.dateRange) {
      const { start, end } = filters.dateRange;
      if (!(start instanceof Date) || !(end instanceof Date)) {
        throw new ValidationError('Date range start and end must be Date objects', 'dateRange');
      }
      if (start > end) {
        throw new ValidationError('Date range start cannot be after end date', 'dateRange');
      }
    }

    // Validate pagination
    if (filters.limit !== undefined) {
      if (!Number.isInteger(filters.limit) || filters.limit < 1 || filters.limit > 1000) {
        throw new ValidationError('Limit must be an integer between 1 and 1000', 'limit');
      }
    }

    if (filters.offset !== undefined) {
      if (!Number.isInteger(filters.offset) || filters.offset < 0) {
        throw new ValidationError('Offset must be a non-negative integer', 'offset');
      }
    }
  }
}

/**
 * Timeline Service implementation for Mobile Web
 */
export class TimelineService implements ITimelineService {
  
  /**
   * Fetch activities for a work order with optional filtering
   * Optimized for mobile with smaller default page sizes
   */
  async getActivities(workOrderId: string, filters?: TimelineFilters): Promise<Activity[]> {
    try {
      // Validate inputs
      TimelineValidator.validateWorkOrderId(workOrderId);
      if (filters) {
        TimelineValidator.validateTimelineFilters(filters);
      }

      let query = supabase
        .from('work_order_activities')
        .select('*')
        .eq('work_order_id', workOrderId)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters) {
        // Date range filter
        if (filters.dateRange) {
          query = query
            .gte('created_at', filters.dateRange.start.toISOString())
            .lte('created_at', filters.dateRange.end.toISOString());
        }

        // Activity type filter
        if (filters.activityTypes && filters.activityTypes.length > 0) {
          query = query.in('activity_type', filters.activityTypes);
        }

        // Technician filter
        if (filters.technicianIds && filters.technicianIds.length > 0) {
          query = query.in('user_id', filters.technicianIds);
        }

        // Search query filter
        if (filters.searchQuery && filters.searchQuery.trim().length > 0) {
          const searchTerm = filters.searchQuery.trim().replace(/[%_]/g, '\\$&');
          query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
        }

        // Pagination with mobile-optimized defaults
        const limit = filters.limit || 25; // Smaller default for mobile
        const offset = filters.offset || 0;
        
        if (offset > 0) {
          query = query.range(offset, offset + limit - 1);
        } else {
          query = query.limit(limit);
        }
      } else {
        // Default limit for mobile
        query = query.limit(25);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Database error fetching activities:', error);
        throw new DatabaseError(`Failed to fetch activities: ${error.message}`, error);
      }

      return data || [];
    } catch (error) {
      if (error instanceof TimelineServiceError) {
        throw error;
      }
      
      console.error('Unexpected error in getActivities:', error);
      throw new TimelineServiceError(
        'An unexpected error occurred while fetching activities',
        'UNEXPECTED_ERROR',
        error as Error
      );
    }
  }

  /**
   * Add a note activity to the timeline
   * Mobile-optimized with simplified user handling
   */
  async addNote(workOrderId: string, content: string, userId: string): Promise<Activity> {
    try {
      // Validate inputs
      TimelineValidator.validateWorkOrderId(workOrderId);
      TimelineValidator.validateNoteContent(content);
      TimelineValidator.validateUserId(userId);

      // Verify work order exists
      const { data: workOrder, error: workOrderError } = await supabase
        .from('work_orders')
        .select('id')
        .eq('id', workOrderId)
        .single();

      if (workOrderError || !workOrder) {
        throw new ValidationError(`Work order not found: ${workOrderId}`, 'workOrderId');
      }

      // Get user information - simplified for mobile
      const { data: userProfile, error: userError } = await supabase
        .from('profiles')
        .select('first_name, last_name, avatar_url')
        .eq('id', userId)
        .single();

      if (userError) {
        console.warn('Could not fetch user profile:', userError);
      }

      const userName = userProfile 
        ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || 'Unknown User'
        : 'Unknown User';

      // Prepare note activity
      const noteActivity = {
        work_order_id: workOrderId,
        activity_type: 'note_added' as ActivityType,
        title: 'Note added',
        description: content.trim(),
        user_id: userId,
        user_name: userName,
        user_avatar: userProfile?.avatar_url || undefined,
        metadata: {
          note_content: content.trim()
        }
      };

      // Insert the activity
      const { data, error } = await supabase
        .from('work_order_activities')
        .insert(noteActivity)
        .select()
        .single();

      if (error) {
        console.error('Database error adding note:', error);
        throw new DatabaseError(`Failed to add note: ${error.message}`, error);
      }

      if (!data) {
        throw new DatabaseError('No data returned after inserting note activity');
      }

      return data;
    } catch (error) {
      if (error instanceof TimelineServiceError) {
        throw error;
      }
      
      console.error('Unexpected error in addNote:', error);
      throw new TimelineServiceError(
        'An unexpected error occurred while adding note',
        'UNEXPECTED_ERROR',
        error as Error
      );
    }
  }

  /**
   * Subscribe to real-time activity updates for a work order
   * Mobile-optimized with connection handling
   */
  subscribeToUpdates(workOrderId: string, callback: (activity: Activity) => void): () => void {
    try {
      // Validate inputs
      TimelineValidator.validateWorkOrderId(workOrderId);
      
      if (typeof callback !== 'function') {
        throw new ValidationError('Callback must be a function', 'callback');
      }

      const subscription = supabase
        .channel(`work_order_activities:${workOrderId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'work_order_activities',
            filter: `work_order_id=eq.${workOrderId}`
          },
          (payload) => {
            try {
              console.log('New activity received:', payload);
              if (payload.new && typeof payload.new === 'object') {
                const activity = payload.new as Activity;
                if (activity.id && activity.work_order_id && activity.activity_type) {
                  callback(activity);
                } else {
                  console.warn('Received invalid activity data:', activity);
                }
              }
            } catch (error) {
              console.error('Error processing new activity:', error);
            }
          }
        )
        .subscribe((status) => {
          console.log('Timeline subscription status:', status);
          if (status !== 'SUBSCRIBED') {
            console.error('Timeline subscription error or closed:', status);
          }
        });

      // Return unsubscribe function
      return () => {
        try {
          subscription.unsubscribe();
        } catch (error) {
          console.error('Error unsubscribing from timeline updates:', error);
        }
      };
    } catch (error) {
      console.error('Error setting up timeline subscription:', error);
      return () => {};
    }
  }

  /**
   * Export timeline data - simplified for mobile
   */
  async exportTimeline(
    workOrderId: string, 
    format: 'pdf' | 'csv', 
    filters?: TimelineFilters
  ): Promise<Blob> {
    try {
      // Validate inputs
      TimelineValidator.validateWorkOrderId(workOrderId);
      
      if (!format || !['pdf', 'csv'].includes(format)) {
        throw new ValidationError('Export format must be either "pdf" or "csv"', 'format');
      }

      const activities = await this.getActivities(workOrderId, filters);
      
      if (format === 'csv') {
        return this.exportToCSV(activities);
      } else {
        throw new TimelineServiceError(
          'PDF export not yet implemented for mobile. Please use CSV format.',
          'NOT_IMPLEMENTED'
        );
      }
    } catch (error) {
      if (error instanceof TimelineServiceError) {
        throw error;
      }
      
      console.error('Unexpected error in exportTimeline:', error);
      throw new TimelineServiceError(
        'An unexpected error occurred during export',
        'EXPORT_ERROR',
        error as Error
      );
    }
  }

  /**
   * Export activities to CSV format
   */
  private exportToCSV(activities: Activity[]): Blob {
    try {
      const headers = ['Date', 'Time', 'Type', 'Title', 'Description', 'User'];
      
      const rows = activities.map(activity => {
        try {
          const date = new Date(activity.created_at);
          return [
            date.toLocaleDateString(),
            date.toLocaleTimeString(),
            activity.activity_type || '',
            activity.title || '',
            activity.description || '',
            activity.user_name || ''
          ];
        } catch (error) {
          console.warn('Error processing activity for CSV export:', activity, error);
          return [
            'Invalid Date',
            'Invalid Time',
            activity.activity_type || '',
            activity.title || '',
            activity.description || '',
            activity.user_name || ''
          ];
        }
      });

      const csvContent = [headers, ...rows]
        .map(row => row.map(field => {
          const escaped = String(field).replace(/"/g, '""');
          return `"${escaped}"`;
        }).join(','))
        .join('\n');

      return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    } catch (error) {
      console.error('Error creating CSV:', error);
      throw new TimelineServiceError(
        'Failed to generate CSV export',
        'CSV_GENERATION_ERROR',
        error as Error
      );
    }
  }

  /**
   * Health check for mobile service monitoring
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    timestamp: string;
    details: {
      databaseConnection: boolean;
      realtimeAvailable: boolean;
    };
  }> {
    const timestamp = new Date().toISOString();
    
    try {
      // Test database connection
      const { error } = await supabase
        .from('work_order_activities')
        .select('id')
        .limit(1);

      const databaseConnection = !error;
      const realtimeAvailable = !!supabase && typeof supabase.channel === 'function';
      
      return {
        status: databaseConnection && realtimeAvailable ? 'healthy' : 'unhealthy',
        timestamp,
        details: {
          databaseConnection,
          realtimeAvailable
        }
      };
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        status: 'unhealthy',
        timestamp,
        details: {
          databaseConnection: false,
          realtimeAvailable: false
        }
      };
    }
  }
}

// Export singleton instance
export const timelineService = new TimelineService();