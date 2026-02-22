/**
 * TimelineItem Component
 * Individual activity display component with type-specific styling
 * Redesigned to match application UI consistency
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
 */
const ACTIVITY_COLORS = {
  created: 'text-blue-600 bg-blue-100',
  assigned: 'text-green-600 bg-green-100',
  started: 'text-orange-600 bg-orange-100',
  paused: 'text-yellow-600 bg-yellow-100',
  completed: 'text-green-600 bg-green-100',
  note_added: 'text-slate-600 bg-slate-100',
  status_changed: 'text-blue-600 bg-blue-100',
  priority_changed: 'text-red-600 bg-red-100',
} as const;

/**
 * TimelineItem - Individual activity display component
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

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
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

    // For note_added, show the note content in a subtle box
    if (activity.activity_type === 'note_added' && metadata.note_content) {
      return (
        <div className="bg-muted/30 rounded-md p-2 mt-1.5 text-xs text-muted-foreground leading-snug">
          {metadata.note_content}
        </div>
      );
    }

    return null;
  };

  return (
    <div 
      className={cn(
        "flex gap-2.5 py-3 border-b last:border-b-0",
        onClick && "cursor-pointer hover:bg-muted/30 px-2 -mx-2 rounded-md",
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? "button" : undefined}
      aria-label={onClick ? `View details for ${activity.title}` : undefined}
    >
      {/* Activity type indicator */}
      <div className="flex-shrink-0">
        <div 
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center",
            colorClasses
          )}
          aria-label={`${config.label} activity`}
        >
          <IconComponent className="w-4 h-4" />
        </div>
      </div>
      
      {/* Activity content */}
      <div className="flex-1 min-w-0 pt-0.5">
        {/* Header with title and timestamp */}
        <div className="flex items-start justify-between gap-2 mb-0.5">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-foreground leading-tight">
              {activity.title}
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              {config.label}
              {isLatest && (
                <span className="ml-2 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">
                  Latest
                </span>
              )}
            </p>
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
          <p className="text-sm text-muted-foreground mb-1.5 leading-snug">
            {activity.description}
          </p>
        )}
        
        {/* Metadata based on activity type */}
        {renderMetadata()}
        
        {/* User information */}
        {showAvatar && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center">
              <span className="text-[10px] font-medium text-muted-foreground">
                {activity.user_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {activity.user_name}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default TimelineItem;