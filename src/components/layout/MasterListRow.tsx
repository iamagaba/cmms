import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';

interface MasterListRowProps {
  title: string;
  subtitle?: string;
  description?: string;
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info';
  };
  icon?: React.ReactNode;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
  showChevron?: boolean;
  metadata?: Array<{
    label: string;
    value: string | number;
    icon?: React.ReactNode;
  }>;
}

/**
 * MasterListRow Component
 * 
 * Standardized row component for master-detail list views.
 * Provides consistent layout for list items with title, subtitle, badge, and metadata.
 * 
 * Used in: Assets, WorkOrders, Customers, Locations list items
 */
export function MasterListRow({
  title,
  subtitle,
  description,
  badge,
  icon,
  isSelected = false,
  onClick,
  className,
  children,
  showChevron = true,
  metadata
}: MasterListRowProps) {
  return (
    <div
      className={cn(
        "py-2 px-3 border-b border-border last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 cursor-pointer group",
        isSelected && "bg-background border-l-2 border-l-primary shadow-sm",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        {icon && (
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
            {icon}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title and Badge */}
          <div className="flex items-start justify-between gap-2 mb-0.5">
            <h3 className="text-sm font-bold text-foreground truncate font-mono">
              {title}
            </h3>
            {badge && (
              <Badge variant={badge.variant || 'default'} className="flex-shrink-0 py-0 h-5">
                {badge.text}
              </Badge>
            )}
          </div>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-xs text-muted-foreground mb-0.5 truncate">
              {subtitle}
            </p>
          )}

          {/* Description */}
          {description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {description}
            </p>
          )}

          {/* Metadata */}
          {metadata && metadata.length > 0 && (
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1.5">
              {metadata.map((item, index) => (
                <div key={index} className="flex items-center gap-1">
                  {item.icon}
                  <span className="font-medium">{item.label}:</span>
                  <span>{item.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Custom children */}
          {children}
        </div>

        {/* Chevron */}
        {showChevron && (
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
        )}
      </div>
    </div>
  );
}

export default MasterListRow;