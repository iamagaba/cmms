/**
 * TimelineItem Component
 * Individual activity display component with type-specific styling
 * Uses shadcn/ui components with default styling as per application isolation rules
 */

import React from 'react';
import { 
  Plus, 
  User, 
  Play, 
  Pause, 
  Check, 
  MessageSquare, 
  ArrowRight, 
  AlertTriangle 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getActivityTypeConfig } from '@/utils/activity-type-config';
import type { Activity, ActivityItemProps } from '@/types/activity-timeline';

/**
 * Icon mapping for activity types using Lucide React icons
 * All icons use consistent w-5 h-5 sizing as per requirements
 */
const ACTIVITY_ICONS = {
  created: Plus,
  assigned: User,
  started: Play,
  paused: Pause,
  completed: Check,
  note_added: MessageSquare,
  status_changed: ArrowRight,
  priority_changed: AlertTriangle,
} as const;

/**
 * Color mapping for activity type indicators
 * Uses semantic colors for better visual distinction
 */
const ACTIVITY_COLORS = {
  created: 'border-blue-500 text-blue-600 bg-blue-50',
  assigned: 'border-green-500 text-green-600 bg-green-50',
  started: 'border-orange-500 text-orange-600 bg-orange-50',
  paused: 'border-yellow-500 text-yellow-600 bg-yellow-50',
  completed: 'border-green-500 text-green-600 bg-green-50',
  note_added: 'border-gray-500 text-gray-600 bg-gray-50',
  status_changed: 'border-blue-500 text-blue-600 bg-blue-50',
  priority_changed: 'border-red-500 text-red-600 bg-red-50',
} as const;

/**
 * TimelineItem - Individual activity display component
 * 
 * Features:
 * - Distinct visual indicators for each activity type (Requirements 1.5, 2.2)
 * - Lucide React icons with consistent w-5 h-5 sizing
 * - Hover interactions and keyboard navigation (Requirement 6.1)
 * - Uses shadcn/ui default styling patterns
 * - Accessible with proper ARIA labels and keyboard support
 */
export function TimelineItem({ 
  activity, 
  showAvatar = true, 
  showMetadata = true, 
  isLatest = false,
  onClick,
  className 
}: ActivityItemProps) {
  const config = getActivityTypeConfig(activity.activity_type);
  const IconComponent = ACTIVITY_ICONS[activity.activity_type];
  const colorClasses = ACTIVITY_COLORS[activity.activity_type];

  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  // Handle click events
  const handleClick = (event: React.MouseEvent) => {
    if (onClick) {
      event.preventDefault();
      onClick(activity);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (onClick && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick(activity);
    }
  };

  // Render metadata based on activity type
  const renderMetadata = () => {
    if (!showMetadata || !activity.metadata) return null;

    const { metadata } = activity;

    switch (activity.activity_type) {
      case 'assigned':
        return (
          <div className="text-xs text-muted-foreground mt-1">
            {metadata.assigned_by && metadata.assigned_to && (
              <>Assigned by {metadata.assigned_by} to {metadata.assigned_to}</>
            )}
          </div>
        );
      
      case 'status_changed':
        return (
          <div className="text-xs text-muted-foreground mt-1">
            {metadata.previous_value && metadata.new_value && (
              <>Changed from <span className="font-medium">{metadata.previous_value}</span> to <span className="font-medium">{metadata.new_value}</span></>
            )}
          </div>
        );
      
      case 'priority_changed':
        return (
          <div className="text-xs text-muted-foreground mt-1">
            {metadata.previous_value && metadata.new_value && (
              <>Priority changed from <span className="font-medium">{metadata.previous_value}</span> to <span className="font-medium">{metadata.new_value}</span></>
            )}
          </div>
        );
      
      case 'note_added':
        return (
          <div className="text-xs text-muted-foreground mt-1">
            {metadata.note_content && (
              <div className="bg-muted/50 rounded p-2 mt-2">
                <p className="text-sm">{metadata.note_content}</p>
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div 
      className={cn(
        // Base styling using shadcn/ui patterns
        "flex gap-3 p-4 rounded-lg border bg-card transition-all duration-200",
        // Hover interactions (Requirement 6.1)
        "hover:bg-accent/50 hover:shadow-sm",
        // Focus styles for keyboard navigation
        onClick && "cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        // Latest activity highlight
        isLatest && "ring-2 ring-primary/20 bg-primary/5",
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? "button" : undefined}
      aria-label={onClick ? `View details for ${activity.title}` : undefined}
    >
      {/* Activity type indicator with distinct visual styling */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div 
          className={cn(
            "w-10 h-10 rounded-full border-2 flex items-center justify-center",
            colorClasses
          )}
          aria-label={`${config.label} activity`}
        >
          <IconComponent className="w-5 h-5" />
        </div>
        
        {/* Timeline connector line */}
        <div className="w-px bg-border flex-1 mt-2 min-h-[20px]" />
      </div>
      
      {/* Activity content */}
      <div className="flex-1 min-w-0">
        {/* Header with title and timestamp */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium leading-tight">
              {activity.title}
            </h4>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-muted-foreground">
                {config.label}
              </span>
              {isLatest && (
                <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
                  Latest
                </span>
              )}
            </div>
          </div>
          
          <time 
            className="text-xs text-muted-foreground flex-shrink-0"
            dateTime={activity.created_at}
            title={new Date(activity.created_at).toLocaleString()}
          >
            {formatTimestamp(activity.created_at)}
          </time>
        </div>
        
        {/* Description */}
        {activity.description && (
          <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
            {activity.description}
          </p>
        )}
        
        {/* Metadata based on activity type */}
        {renderMetadata()}
        
        {/* User information */}
        {showAvatar && (
          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border/50">
            {activity.user_avatar ? (
              <img 
                src={activity.user_avatar} 
                alt={activity.user_name}
                className="w-5 h-5 rounded-full border border-border"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-muted border border-border flex items-center justify-center">
                <span className="text-xs font-medium text-muted-foreground">
                  {activity.user_name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <span className="text-xs text-muted-foreground font-medium">
              {activity.user_name}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default TimelineItem;