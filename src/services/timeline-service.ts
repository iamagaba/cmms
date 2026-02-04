/**
 * Timeline Service - Core data operations for activity timeline
 * Handles CRUD operations, real-time subscriptions, and data formatting
 * Enhanced with comprehensive error handling and data validation
 */

import { supabase } from '@/integrations/supabase/client';
import type { 
  Activity, 
  TimelineFilters, 
  CreateActivityInput, 
  CreateNoteInput,
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

  static validateActivityType(activityType: ActivityType): void {
    const validTypes: ActivityType[] = [
      'created', 'assigned', 'started', 'paused', 'completed', 
      'note_added', 'status_changed', 'priority_changed'
    ];
    
    if (!validTypes.includes(activityType)) {
      throw new ValidationError(`Invalid activity type: ${activityType}`, 'activityType');
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
      if (start > new Date()) {
        throw new ValidationError('Date range start cannot be in the future', 'dateRange');
      }
    }

    // Validate activity types
    if (filters.activityTypes) {
      if (!Array.isArray(filters.activityTypes)) {
        throw new ValidationError('Activity types must be an array', 'activityTypes');
      }
      filters.activityTypes.forEach(type => this.validateActivityType(type));
    }

    // Validate technician IDs
    if (filters.technicianIds) {
      if (!Array.isArray(filters.technicianIds)) {
        throw new ValidationError('Technician IDs must be an array', 'technicianIds');
      }
      filters.technicianIds.forEach(id => {
        if (typeof id !== 'string' || id.trim().length === 0) {
          throw new ValidationError('All technician IDs must be non-empty strings', 'technicianIds');
        }
      });
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

    // Validate search query
    if (filters.searchQuery !== undefined) {
      if (typeof filters.searchQuery !== 'string') {
        throw new ValidationError('Search query must be a string', 'searchQuery');
      }
      if (filters.searchQuery.length > 500) {
        throw new ValidationError('Search query cannot exceed 500 characters', 'searchQuery');
      }
    }
  }

  static validateCreateActivityInput(input: CreateActivityInput): void {
    if (!input) {
      throw new ValidationError('Activity input is required', 'input');
    }

    this.validateWorkOrderId(input.work_order_id);
    this.validateActivityType(input.activity_type);

    if (!input.title || typeof input.title !== 'string' || input.title.trim().length === 0) {
      throw new ValidationError('Activity title is required and must be a non-empty string', 'title');
    }

    if (input.title.length > 255) {
      throw new ValidationError('Activity title cannot exceed 255 characters', 'title');
    }

    if (!input.user_name || typeof input.user_name !== 'string' || input.user_name.trim().length === 0) {
      throw new ValidationError('User name is required and must be a non-empty string', 'user_name');
    }

    if (input.description && typeof input.description !== 'string') {
      throw new ValidationError('Activity description must be a string', 'description');
    }

    if (input.description && input.description.length > 10000) {
      throw new ValidationError('Activity description cannot exceed 10,000 characters', 'description');
    }

    if (input.user_id) {
      this.validateUserId(input.user_id);
    }
  }
}

/**
 * Timeline Service implementation
 * Provides data layer operations for the activity timeline feature
 * Enhanced with comprehensive error handling and data validation
 */
export class TimelineService implements ITimelineService {
  
  /**
   * Fetch activities for a work order with optional filtering
   * Enhanced with comprehensive validation and error handling
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

      // Apply filters with validation
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

        // Search query filter with SQL injection protection
        if (filters.searchQuery && filters.searchQuery.trim().length > 0) {
          const searchTerm = filters.searchQuery.trim().replace(/[%_]/g, '\\$&'); // Escape SQL wildcards
          query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
        }

        // Pagination with defaults
        const limit = filters.limit || 50;
        const offset = filters.offset || 0;
        
        if (offset > 0) {
          query = query.range(offset, offset + limit - 1);
        } else {
          query = query.limit(limit);
        }
      } else {
        // Default limit to prevent excessive data loading
        query = query.limit(50);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Database error fetching activities:', error);
        throw new DatabaseError(`Failed to fetch activities: ${error.message}`, error);
      }

      // Validate returned data structure
      const activities = data || [];
      activities.forEach((activity, index) => {
        if (!activity.id || !activity.work_order_id || !activity.activity_type) {
          console.warn(`Invalid activity data at index ${index}:`, activity);
        }
      });

      return activities;
    } catch (error) {
      if (error instanceof TimelineServiceError) {
        throw error; // Re-throw our custom errors
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
   * Enhanced with comprehensive validation and error handling
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

      // Get user information with error handling
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

      // Prepare note activity input
      const noteInput: CreateActivityInput = {
        work_order_id: workOrderId,
        activity_type: 'note_added',
        title: 'Note added',
        description: content.trim(),
        user_id: userId,
        user_name: userName,
        user_avatar: userProfile?.avatar_url || undefined,
        metadata: {
          note_content: content.trim()
        }
      };

      // Validate the complete input
      TimelineValidator.validateCreateActivityInput(noteInput);

      // Insert the activity
      const { data, error } = await supabase
        .from('work_order_activities')
        .insert(noteInput)
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
        throw error; // Re-throw our custom errors
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
   * Create a manual activity entry
   * Enhanced with comprehensive validation and error handling
   */
  async createActivity(input: CreateActivityInput): Promise<Activity> {
    try {
      // Validate input
      TimelineValidator.validateCreateActivityInput(input);

      // Verify work order exists
      const { data: workOrder, error: workOrderError } = await supabase
        .from('work_orders')
        .select('id')
        .eq('id', input.work_order_id)
        .single();

      if (workOrderError || !workOrder) {
        throw new ValidationError(`Work order not found: ${input.work_order_id}`, 'work_order_id');
      }

      // If user_id is provided, verify user exists
      if (input.user_id) {
        const { data: userProfile, error: userError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', input.user_id)
          .single();

        if (userError || !userProfile) {
          console.warn(`User profile not found for ID: ${input.user_id}`);
        }
      }

      const { data, error } = await supabase
        .from('work_order_activities')
        .insert(input)
        .select()
        .single();

      if (error) {
        console.error('Database error creating activity:', error);
        throw new DatabaseError(`Failed to create activity: ${error.message}`, error);
      }

      if (!data) {
        throw new DatabaseError('No data returned after inserting activity');
      }

      return data;
    } catch (error) {
      if (error instanceof TimelineServiceError) {
        throw error; // Re-throw our custom errors
      }
      
      console.error('Unexpected error in createActivity:', error);
      throw new TimelineServiceError(
        'An unexpected error occurred while creating activity',
        'UNEXPECTED_ERROR',
        error as Error
      );
    }
  }

  /**
   * Subscribe to real-time activity updates for a work order
   * Enhanced with comprehensive error handling and connection management
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
                // Validate the received activity data
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
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'work_order_activities',
            filter: `work_order_id=eq.${workOrderId}`
          },
          (payload) => {
            try {
              console.log('Activity updated:', payload);
              if (payload.new && typeof payload.new === 'object') {
                // Validate the received activity data
                const activity = payload.new as Activity;
                if (activity.id && activity.work_order_id && activity.activity_type) {
                  callback(activity);
                } else {
                  console.warn('Received invalid updated activity data:', activity);
                }
              }
            } catch (error) {
              console.error('Error processing updated activity:', error);
            }
          }
        )
        .subscribe((status) => {
          console.log('Timeline subscription status:', status);
          if (status === 'SUBSCRIPTION_ERROR' || status === 'CLOSED') {
            console.error('Timeline subscription error or closed:', status);
          }
        });

      // Return enhanced unsubscribe function with error handling
      return () => {
        try {
          subscription.unsubscribe();
        } catch (error) {
          console.error('Error unsubscribing from timeline updates:', error);
        }
      };
    } catch (error) {
      console.error('Error setting up timeline subscription:', error);
      // Return a no-op unsubscribe function if setup fails
      return () => {};
    }
  }

  /**
   * Export timeline data with enhanced error handling and validation
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

      if (filters) {
        TimelineValidator.validateTimelineFilters(filters);
      }

      const activities = await this.getActivities(workOrderId, filters);
      
      if (activities.length === 0) {
        console.warn('No activities found for export');
      }
      
      if (format === 'csv') {
        return this.exportToCSV(activities);
      } else {
        // PDF export would require additional libraries like jsPDF
        throw new TimelineServiceError(
          'PDF export not yet implemented. Please use CSV format.',
          'NOT_IMPLEMENTED'
        );
      }
    } catch (error) {
      if (error instanceof TimelineServiceError) {
        throw error; // Re-throw our custom errors
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
   * Export activities to CSV format with enhanced error handling
   */
  private exportToCSV(activities: Activity[]): Blob {
    try {
      const headers = ['Date', 'Time', 'Type', 'Title', 'Description', 'User', 'Metadata'];
      
      const rows = activities.map(activity => {
        try {
          const date = new Date(activity.created_at);
          return [
            date.toLocaleDateString(),
            date.toLocaleTimeString(),
            activity.activity_type || '',
            activity.title || '',
            activity.description || '',
            activity.user_name || '',
            activity.metadata ? JSON.stringify(activity.metadata) : ''
          ];
        } catch (error) {
          console.warn('Error processing activity for CSV export:', activity, error);
          return [
            'Invalid Date',
            'Invalid Time',
            activity.activity_type || '',
            activity.title || '',
            activity.description || '',
            activity.user_name || '',
            ''
          ];
        }
      });

      const csvContent = [headers, ...rows]
        .map(row => row.map(field => {
          // Escape quotes and wrap in quotes
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
   * Get activity statistics for a work order with enhanced error handling
   */
  async getActivityStats(workOrderId: string): Promise<{
    totalActivities: number;
    activitiesByType: Record<ActivityType, number>;
    activitiesByUser: Record<string, number>;
  }> {
    try {
      // Validate input
      TimelineValidator.validateWorkOrderId(workOrderId);

      const activities = await this.getActivities(workOrderId);
      
      const stats = {
        totalActivities: activities.length,
        activitiesByType: {} as Record<ActivityType, number>,
        activitiesByUser: {} as Record<string, number>
      };

      activities.forEach(activity => {
        try {
          // Count by type
          if (activity.activity_type) {
            stats.activitiesByType[activity.activity_type] = 
              (stats.activitiesByType[activity.activity_type] || 0) + 1;
          }

          // Count by user
          if (activity.user_name) {
            stats.activitiesByUser[activity.user_name] = 
              (stats.activitiesByUser[activity.user_name] || 0) + 1;
          }
        } catch (error) {
          console.warn('Error processing activity for stats:', activity, error);
        }
      });

      return stats;
    } catch (error) {
      if (error instanceof TimelineServiceError) {
        throw error; // Re-throw our custom errors
      }
      
      console.error('Unexpected error in getActivityStats:', error);
      throw new TimelineServiceError(
        'An unexpected error occurred while calculating activity statistics',
        'STATS_ERROR',
        error as Error
      );
    }
  }

  /**
   * Validate database connection and table access
   */
  async validateConnection(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('work_order_activities')
        .select('id')
        .limit(1);

      if (error) {
        console.error('Database connection validation failed:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error validating database connection:', error);
      return false;
    }
  }

  /**
   * Health check method for service monitoring
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
      const databaseConnection = await this.validateConnection();
      
      // Check if Supabase client is available
      const realtimeAvailable = !!supabase && typeof supabase.channel === 'function';
      
      const isHealthy = databaseConnection && realtimeAvailable;
      
      return {
        status: isHealthy ? 'healthy' : 'unhealthy',
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