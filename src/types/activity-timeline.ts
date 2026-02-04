/**
 * TypeScript interfaces for the Vertical Activity Timeline feature
 * These types define the data models for activity tracking and timeline display
 */

/**
 * Activity types that can be tracked in the timeline
 */
export type ActivityType = 
  | 'created'
  | 'assigned' 
  | 'started'
  | 'paused'
  | 'completed'
  | 'note_added'
  | 'status_changed'
  | 'priority_changed';

/**
 * Metadata structure for different activity types
 * Contains activity-specific data like previous/new values, assignments, etc.
 */
export interface ActivityMetadata {
  // For status and priority changes
  previous_value?: string;
  new_value?: string;
  
  // For assignment activities
  assigned_to?: string;
  assigned_by?: string;
  previous_technician_id?: string;
  new_technician_id?: string;
  
  // For note activities
  note_content?: string;
  
  // For work order creation
  work_order_number?: string;
  priority?: string;
  status?: string;
  
  // For attachments (future enhancement)
  attachments?: string[];
  
  // Additional context data
  [key: string]: any;
}

/**
 * Main Activity interface representing a single timeline entry
 */
export interface Activity {
  id: string;
  work_order_id: string;
  activity_type: ActivityType;
  title: string;
  description?: string;
  user_id?: string;
  user_name: string;
  user_avatar?: string;
  created_at: string;
  metadata?: ActivityMetadata;
}

/**
 * Filters for timeline display and data querying
 */
export interface TimelineFilters {
  // Date range filtering
  dateRange?: {
    start: Date;
    end: Date;
  };
  
  // Activity type filtering
  activityTypes?: ActivityType[];
  
  // User/technician filtering
  technicianIds?: string[];
  
  // Text search across activity titles and descriptions
  searchQuery?: string;
  
  // Pagination
  limit?: number;
  offset?: number;
}

/**
 * Activity type configuration for UI display
 */
export interface ActivityTypeConfig {
  type: ActivityType;
  label: string;
  icon: string; // Lucide icon name
  color: string; // CSS color class or hex
  description: string;
}

/**
 * Timeline display configuration
 */
export interface TimelineDisplayConfig {
  showDateSeparators: boolean;
  groupByDate: boolean;
  showUserAvatars: boolean;
  showMetadata: boolean;
  enableRealTimeUpdates: boolean;
  maxActivitiesPerPage: number;
}

/**
 * Real-time subscription configuration
 */
export interface RealtimeSubscriptionConfig {
  workOrderId: string;
  onActivityAdded?: (activity: Activity) => void;
  onActivityUpdated?: (activity: Activity) => void;
  onError?: (error: Error) => void;
  onConnectionChange?: (connected: boolean) => void;
}

/**
 * Timeline service interface for data operations
 */
export interface TimelineService {
  /**
   * Fetch activities for a work order with optional filtering
   */
  getActivities(workOrderId: string, filters?: TimelineFilters): Promise<Activity[]>;
  
  /**
   * Add a note activity to the timeline
   */
  addNote(workOrderId: string, content: string, userId: string): Promise<Activity>;
  
  /**
   * Subscribe to real-time activity updates
   */
  subscribeToUpdates(
    workOrderId: string, 
    callback: (activity: Activity) => void
  ): () => void;
  
  /**
   * Export timeline data in specified format
   */
  exportTimeline(
    workOrderId: string, 
    format: 'pdf' | 'csv', 
    filters?: TimelineFilters
  ): Promise<Blob>;
}

/**
 * Real-time update manager interface
 */
export interface RealtimeManager {
  /**
   * Subscribe to work order activity updates
   */
  subscribe(config: RealtimeSubscriptionConfig): RealtimeSubscription;
  
  /**
   * Unsubscribe from updates
   */
  unsubscribe(subscription: RealtimeSubscription): void;
  
  /**
   * Handle connection loss and recovery
   */
  handleConnectionLoss(): void;
  
  /**
   * Sync pending updates when connection is restored
   */
  syncPendingUpdates(): Promise<void>;
}

/**
 * Real-time subscription handle
 */
export interface RealtimeSubscription {
  id: string;
  workOrderId: string;
  unsubscribe: () => void;
  isActive: boolean;
}

/**
 * Activity creation input for manual activity creation
 */
export interface CreateActivityInput {
  work_order_id: string;
  activity_type: ActivityType;
  title: string;
  description?: string;
  user_id?: string;
  user_name: string;
  user_avatar?: string;
  metadata?: ActivityMetadata;
}

/**
 * Note creation input for adding notes to timeline
 */
export interface CreateNoteInput {
  work_order_id: string;
  content: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
}

/**
 * Timeline export options
 */
export interface ExportOptions {
  format: 'pdf' | 'csv';
  includeMetadata: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  activityTypes?: ActivityType[];
  filename?: string;
}

/**
 * Activity statistics for analytics
 */
export interface ActivityStats {
  totalActivities: number;
  activitiesByType: Record<ActivityType, number>;
  activitiesByUser: Record<string, number>;
  averageActivitiesPerDay: number;
  mostActiveDay: string;
  timelineSpan: {
    start: string;
    end: string;
    durationDays: number;
  };
}

/**
 * Timeline component props interface
 */
export interface TimelineComponentProps {
  workOrderId: string;
  filters?: TimelineFilters;
  config?: Partial<TimelineDisplayConfig>;
  onActivityAdd?: (activity: Activity) => void;
  onFilterChange?: (filters: TimelineFilters) => void;
  className?: string;
}

/**
 * Activity item component props
 */
export interface ActivityItemProps {
  activity: Activity;
  showAvatar?: boolean;
  showMetadata?: boolean;
  isLatest?: boolean;
  onClick?: (activity: Activity) => void;
  className?: string;
}

/**
 * Timeline filters component props
 */
export interface TimelineFiltersProps {
  filters: TimelineFilters;
  onFiltersChange: (filters: TimelineFilters) => void;
  availableTechnicians?: Array<{ id: string; name: string }>;
  className?: string;
}

/**
 * Add note interface props
 */
export interface AddNoteInterfaceProps {
  workOrderId: string;
  onNoteAdded: (activity: Activity) => void;
  onCancel?: () => void;
  className?: string;
}