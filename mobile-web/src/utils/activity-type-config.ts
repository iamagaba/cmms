/**
 * Activity Type Configuration for Mobile Web
 * Defines visual styling and metadata for different activity types
 * Uses industrial color system (steel blue, safety orange)
 */

import type { ActivityType, ActivityTypeConfig } from '@/types/activity-timeline';

/**
 * Configuration for each activity type including icons, colors, and labels
 * Using mobile-optimized industrial color system
 */
export const ACTIVITY_TYPE_CONFIGS: Record<ActivityType, ActivityTypeConfig> = {
  created: {
    type: 'created',
    label: 'Created',
    icon: 'Plus',
    color: 'text-primary-600', // Steel blue
    description: 'Work order was created'
  },
  assigned: {
    type: 'assigned',
    label: 'Assigned',
    icon: 'User',
    color: 'text-green-600',
    description: 'Technician was assigned to work order'
  },
  started: {
    type: 'started',
    label: 'Started',
    icon: 'Play',
    color: 'text-secondary-500', // Safety orange
    description: 'Work was started on the order'
  },
  paused: {
    type: 'paused',
    label: 'Paused',
    icon: 'Pause',
    color: 'text-yellow-600',
    description: 'Work was paused or put on hold'
  },
  completed: {
    type: 'completed',
    label: 'Completed',
    icon: 'Check',
    color: 'text-green-600',
    description: 'Work order was completed'
  },
  note_added: {
    type: 'note_added',
    label: 'Note Added',
    icon: 'MessageSquare',
    color: 'text-slate-600',
    description: 'A note was added to the work order'
  },
  status_changed: {
    type: 'status_changed',
    label: 'Status Changed',
    icon: 'ArrowRight',
    color: 'text-primary-600', // Steel blue
    description: 'Work order status was updated'
  },
  priority_changed: {
    type: 'priority_changed',
    label: 'Priority Changed',
    icon: 'AlertTriangle',
    color: 'text-red-600',
    description: 'Work order priority was updated'
  }
};

/**
 * Get configuration for a specific activity type
 */
export function getActivityTypeConfig(type: ActivityType): ActivityTypeConfig {
  return ACTIVITY_TYPE_CONFIGS[type];
}

/**
 * Get all available activity types for filtering
 */
export function getAllActivityTypes(): ActivityType[] {
  return Object.keys(ACTIVITY_TYPE_CONFIGS) as ActivityType[];
}

/**
 * Get activity types grouped by category for mobile filtering
 */
export function getActivityTypesByCategory() {
  return {
    lifecycle: ['created', 'assigned', 'started', 'paused', 'completed'] as ActivityType[],
    updates: ['status_changed', 'priority_changed'] as ActivityType[],
    communication: ['note_added'] as ActivityType[]
  };
}

/**
 * Format activity type for display
 */
export function formatActivityType(type: ActivityType): string {
  return ACTIVITY_TYPE_CONFIGS[type].label;
}

/**
 * Get icon name for activity type (Lucide React)
 */
export function getActivityTypeIcon(type: ActivityType): string {
  return ACTIVITY_TYPE_CONFIGS[type].icon;
}

/**
 * Get color class for activity type (mobile-optimized)
 */
export function getActivityTypeColor(type: ActivityType): string {
  return ACTIVITY_TYPE_CONFIGS[type].color;
}

/**
 * Get background color for activity type badges (mobile-specific)
 */
export function getActivityTypeBgColor(type: ActivityType): string {
  const colorMap: Record<ActivityType, string> = {
    created: 'bg-primary-100',
    assigned: 'bg-green-100',
    started: 'bg-secondary-100',
    paused: 'bg-yellow-100',
    completed: 'bg-green-100',
    note_added: 'bg-slate-100',
    status_changed: 'bg-primary-100',
    priority_changed: 'bg-red-100'
  };
  
  return colorMap[type];
}