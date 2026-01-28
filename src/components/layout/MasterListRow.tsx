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
        "p-3 border-b border-border last:border-b-0 hover:bg-accent/50 transition-all duration-200 cursor-pointer group",
        isSelected && "bg-accent border-primary/20 shadow-sm",
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
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-sm font-bold text-foreground truncate font-mono">
              {title}
            </h3>
            {badge && (
              <Badge variant={badge.variant || 'default'} className="flex-shrink-0">
                {badge.text}
              </Badge>
            )}
          </div>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-xs text-muted-foreground mb-1 truncate">
              {subtitle}
            </p>
          )}

          {/* Description */}
          {description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
              {description}
            </p>
          )}

          {/* Metadata */}
          {metadata && metadata.length > 0 && (
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
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