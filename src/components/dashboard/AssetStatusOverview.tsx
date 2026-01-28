import { AlertCircle, CheckCircle, Wrench, TrendingUp, TrendingDown, Minus, Power } from 'lucide-react';
/**
 * Asset Status Overview Component
 * 
 * Desktop-optimized asset status display with hover interactions,
 * detailed tooltips, and professional CMMS styling.
 */

import React, { useState } from 'react';


import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';


// ============================================
// INTERFACES
// ============================================

export interface AssetStatus {
  id: string;
  label: string;
  count: number;
  icon: string;
  color: string;
  bgColor: string;
  description: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  details?: {
    critical?: number;
    warning?: number;
    normal?: number;
  };
}

export interface AssetStatusOverviewProps {
  statuses?: AssetStatus[];
  onStatusClick?: (status: AssetStatus) => void;
  className?: string;
  loading?: boolean;
}

// ============================================
// DEFAULT STATUS DATA
// ============================================

const defaultStatuses: AssetStatus[] = [
  {
    id: 'operational',
    label: 'Operational',
    count: 142,
    icon: CheckCircle,
    color: 'text-industrial-600',
    bgColor: 'bg-industrial-100',
    description: 'Assets running normally',
    trend: { value: 2, direction: 'up' },
    details: { normal: 142 }
  },
  {
    id: 'maintenance',
    label: 'Under Maintenance',
    count: 8,
    icon: Wrench,
    color: 'text-maintenance-600',
    bgColor: 'bg-maintenance-100',
    description: 'Assets currently being serviced',
    trend: { value: 1, direction: 'down' },
    details: { warning: 5, normal: 3 }
  },
  {
    id: 'attention',
    label: 'Needs Attention',
    count: 3,
    icon: AlertCircle,
    color: 'text-warning-600',
    bgColor: 'bg-warning-100',
    description: 'Assets requiring immediate attention',
    trend: { value: 1, direction: 'up' },
    details: { critical: 1, warning: 2 }
  },
  {
    id: 'offline',
    label: 'Offline',
    count: 2,
    icon: Power,
    color: 'text-machinery-600',
    bgColor: 'bg-machinery-100',
    description: 'Assets currently offline',
    trend: { value: 0, direction: 'neutral' },
    details: { warning: 2 }
  }
];

// ============================================
// STATUS CARD COMPONENT
// ============================================

interface StatusCardProps {
  status: AssetStatus;
  onClick?: (status: AssetStatus) => void;
  index: number;
}

const StatusCard: React.FC<StatusCardProps> = ({ status, onClick, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const isClickable = !!onClick;

  const getTrendIcon = () => {
    switch (status.trend?.direction) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      default: return Minus;
    }
  };

  const getTrendColor = () => {
    switch (status.trend?.direction) {
      case 'up': return status.id === 'attention' ? 'text-warning-600' : 'text-foreground';
      case 'down': return status.id === 'attention' ? 'text-foreground' : 'text-rose-600';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={isClickable ? { y: -2 } : undefined}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card
        className={cn(
          'transition-all duration-200 relative overflow-hidden',
          isClickable && 'cursor-pointer hover:shadow-md',
          isHovered && 'ring-2 ring-ring/30'
        )}
        onClick={isClickable ? () => onClick(status) : undefined}
      >
        {/* Background pattern */}
        <div className="absolute top-0 right-0 w-16 h-16 opacity-5">
          <status.icon className={cn('w-5 h-5', status.color)} />
        </div>

        <CardContent className="relative z-10">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className={cn('p-2 rounded-lg', status.bgColor)}>
              <status.icon className={cn('w-5 h-5', status.color)} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-foreground truncate">
                {status.label}
              </h4>
              <p className="text-xs text-muted-foreground truncate">
                {status.description}
              </p>
            </div>
          </div>

          {/* Count */}
          <div className="mb-4">
            <div className="text-2xl font-bold text-foreground">
              {status.count.toLocaleString()}
            </div>
          </div>

          {/* Details and Trend */}
          <div className="flex items-center justify-between">
            {/* Status breakdown */}
            {status.details && (
              <div className="flex items-center gap-2">
                {status.details.critical && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-rose-500 rounded-full" />
                    <span className="text-xs text-muted-foreground">{status.details.critical}</span>
                  </div>
                )}
                {status.details.warning && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-amber-500 rounded-full" />
                    <span className="text-xs text-muted-foreground">{status.details.warning}</span>
                  </div>
                )}
                {status.details.normal && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                    <span className="text-xs text-muted-foreground">{status.details.normal}</span>
                  </div>
                )}
              </div>
            )}

            {/* Trend */}
            {status.trend && status.trend.direction !== 'neutral' && (
              <div className={cn('flex items-center gap-1 text-xs font-medium', getTrendColor())}>
                {React.createElement(getTrendIcon(), { className: "w-4 h-4" })}
                <span>{status.trend.value}</span>
              </div>
            )}
          </div>

          {/* Hover indicator */}
          {isClickable && (
            <div className={cn(
              'absolute bottom-0 left-0 right-0 h-0.5 bg-primary transform transition-transform duration-200',
              isHovered ? 'scale-x-100' : 'scale-x-0'
            )} />
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// ============================================
// LOADING SKELETON
// ============================================

const AssetStatusSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className="animate-pulse">
          <CardContent>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-muted rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-20 bg-muted rounded" />
                <div className="h-3 w-24 bg-muted rounded" />
              </div>
            </div>
            <div className="h-8 w-12 bg-muted rounded mb-4" />
            <div className="flex justify-between">
              <div className="h-3 w-16 bg-muted rounded" />
              <div className="h-3 w-8 bg-muted rounded" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

const AssetStatusOverview: React.FC<AssetStatusOverviewProps> = ({
  statuses,
  onStatusClick,
  className,
  loading = false
}) => {
  const displayStatuses = statuses || defaultStatuses;
  const totalAssets = displayStatuses.reduce((sum, status) => sum + status.count, 0);

  if (loading) {
    return (
      <div className={className}>
        <AssetStatusSkeleton />
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Summary */}
      <Card>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold text-foreground">
                {totalAssets.toLocaleString()} Total Assets
              </h4>
              <p className="text-sm text-muted-foreground">
                Across all locations and categories
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {Math.round((displayStatuses.find(s => s.id === 'operational')?.count || 0) / totalAssets * 100)}%
              </div>
              <div className="text-xs text-muted-foreground">Operational</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayStatuses.map((status, index) => (
          <StatusCard
            key={status.id}
            status={status}
            onClick={onStatusClick}
            index={index}
          />
        ))}
      </div>

      {/* Legend */}
      <Card>
        <CardContent>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Status indicators:</span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-rose-500 rounded-full" />
                <span className="text-muted-foreground">Critical</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-amber-500 rounded-full" />
                <span className="text-muted-foreground">Warning</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                <span className="text-muted-foreground">Normal</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ============================================
// EXPORTS
// ============================================

export default AssetStatusOverview;
export type { AssetStatusOverviewProps, AssetStatus };
