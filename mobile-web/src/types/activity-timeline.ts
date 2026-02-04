/**
 * TypeScript interfaces for the Vertical Activity Timeline feature (Mobile Web)
 * Adapted from desktop version with mobile-specific optimizations
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
  color: string; // Tailwind color class
  description: string;
}

/**
 * Timeline display configuration for mobile
 */
export interface TimelineDisplayConfig {
  showDateSeparators: boolean;
  groupByDate: boolean;
  showUserAvatars: boolean;
  showMetadata: boolean;
  enableRealTimeUpdates: boolean;
  maxActivitiesPerPage: number;
  enablePullToRefresh: boolean;
  touchOptimized: boolean;
}

/**
 * Timeline component props interface for mobile
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
 * Activity item component props for mobile
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
 * Timeline filters component props for mobile
 */
export interface TimelineFiltersProps {
  filters: TimelineFilters;
  onFiltersChange: (filters: TimelineFilters) => void;
  availableTechnicians?: Array<{ id: string; name: string }>;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Add note interface props for mobile
 */
export interface AddNoteInterfaceProps {
  workOrderId: string;
  onNoteAdded: (activity: Activity) => void;
  onCancel?: () => void;
  className?: string;
  isOpen: boolean;
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
 * Timeline service interface for mobile data operations
 */
export interface TimelineService {
  getActivities(workOrderId: string, filters?: TimelineFilters): Promise<Activity[]>;
  addNote(workOrderId: string, content: string, userId: string): Promise<Activity>;
  subscribeToUpdates(workOrderId: string, callback: (activity: Activity) => void): () => void;
  exportTimeline(workOrderId: string, format: 'pdf' | 'csv', filters?: TimelineFilters): Promise<Blob>;
}