/**
 * Asset Status Overview Component
 * 
 * Desktop-optimized asset status display with hover interactions,
 * detailed tooltips, and professional CMMS styling.
 */

import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  CheckmarkCircle01Icon,
  Wrench01Icon,
  Alert01Icon,
  PowerIcon,
  AnalyticsUpIcon,
  AnalyticsDownIcon,
  MinusSignIcon
} from '@hugeicons/core-free-icons';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import ProfessionalCard from '@/components/ui/ProfessionalCard';
import { useDensitySpacing } from '@/hooks/useDensitySpacing';
import { useDensity } from '@/context/DensityContext';

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
    icon: CheckmarkCircle01Icon,
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
    icon: Wrench01Icon,
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
    icon: Alert01Icon,
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
    icon: PowerIcon,
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
      case 'up': return AnalyticsUpIcon;
      case 'down': return AnalyticsDownIcon;
      default: return MinusSignIcon;
    }
  };

  const getTrendColor = () => {
    switch (status.trend?.direction) {
      case 'up': return status.id === 'attention' ? 'text-warning-600' : 'text-industrial-600';
      case 'down': return status.id === 'attention' ? 'text-industrial-600' : 'text-warning-600';
      default: return 'text-machinery-500';
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
      <ProfessionalCard 
        className={cn(
          spacing.card,
          'transition-all duration-200 relative overflow-hidden',
          isClickable && 'cursor-pointer hover:shadow-md',
          isHovered && 'ring-2 ring-steel-200'
        )}
        onClick={isClickable ? () => onClick(status) : undefined}
      >
        {/* Background pattern */}
        <div className="absolute top-0 right-0 w-16 h-16 opacity-5">
          <HugeiconsIcon icon={status.icon} size={20} className={cn(status.color)} />
        </div>

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <div className={cn('p-2 rounded-lg', status.bgColor)}>
              <HugeiconsIcon icon={status.icon} size={20} className={cn(status.color)} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-machinery-900 truncate">
                {status.label}
              </h4>
              <p className="text-xs text-machinery-600 truncate">
                {status.description}
              </p>
            </div>
          </div>

          {/* Count */}
          <div className="mb-3">
            <div className="text-2xl font-bold text-machinery-900">
              {status.count.toLocaleString()}
            </div>
          </div>

          {/* Details and Trend */}
          <div className="flex items-center justify-between">
            {/* Status breakdown */}
            {status.details && (
              <div className="flex items-center gap-1">
                {status.details.critical && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-warning-500 rounded-full" />
                    <span className="text-xs text-machinery-600">{status.details.critical}</span>
                  </div>
                )}
                {status.details.warning && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-maintenance-500 rounded-full" />
                    <span className="text-xs text-machinery-600">{status.details.warning}</span>
                  </div>
                )}
                {status.details.normal && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-industrial-500 rounded-full" />
                    <span className="text-xs text-machinery-600">{status.details.normal}</span>
                  </div>
                )}
              </div>
            )}

            {/* Trend */}
            {status.trend && status.trend.direction !== 'neutral' && (
              <div className={cn('flex items-center gap-1 text-xs font-medium', getTrendColor())}>
                <HugeiconsIcon icon={getTrendIcon()} size={12} />
                <span>{status.trend.value}</span>
              </div>
            )}
          </div>

          {/* Hover indicator */}
          {isClickable && (
            <div className={cn(
              'absolute bottom-0 left-0 right-0 h-0.5 bg-steel-500 transform transition-transform duration-200',
              isHovered ? 'scale-x-100' : 'scale-x-0'
            )} />
          )}
        </div>
      </ProfessionalCard>
    </motion.div>
  );
};

// ============================================
// LOADING SKELETON
// ============================================

const AssetStatusSkeleton: React.FC = () => {
  const spacing = useDensitySpacing();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <ProfessionalCard key={index} className={`${spacing.card} animate-pulse`}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-machinery-200 rounded-lg" />
          <div className="flex-1 space-y-1">
            <div className="h-4 w-20 bg-machinery-200 rounded" />
            <div className="h-3 w-24 bg-machinery-200 rounded" />
          </div>
        </div>
        <div className="h-8 w-12 bg-machinery-200 rounded mb-3" />
        <div className="flex justify-between">
          <div className="h-3 w-16 bg-machinery-200 rounded" />
          <div className="h-3 w-8 bg-machinery-200 rounded" />
        </div>
      </ProfessionalCard>
    ))}
  </div>
);

// ============================================
// MAIN COMPONENT
// ============================================

const AssetStatusOverview: React.FC<AssetStatusOverviewProps> = ({
  statuses,
  onStatusClick,
  className,
  loading = false
}) => {
  const spacing = useDensitySpacing();
  const { isCompact } = useDensity();
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
    <div className={className}>
      {/* Summary */}
      <div className={`${spacing.mb} ${spacing.card} bg-machinery-50 rounded-lg`}>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold text-machinery-900">
              {totalAssets.toLocaleString()} Total Assets
            </h4>
            <p className="text-sm text-machinery-600">
              Across all locations and categories
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-steel-600">
              {Math.round((displayStatuses.find(s => s.id === 'operational')?.count || 0) / totalAssets * 100)}%
            </div>
            <div className="text-xs text-machinery-600">Operational</div>
          </div>
        </div>
      </div>

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
      <div className={`${spacing.mt} ${spacing.card} bg-machinery-50 rounded-lg`}>
        <div className="flex items-center justify-between text-xs">
          <span className="text-machinery-600">Status indicators:</span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-warning-500 rounded-full" />
              <span className="text-machinery-600">Critical</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-maintenance-500 rounded-full" />
              <span className="text-machinery-600">Warning</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-industrial-500 rounded-full" />
              <span className="text-machinery-600">Normal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// EXPORTS
// ============================================

export default AssetStatusOverview;
export type { AssetStatusOverviewProps, AssetStatus };
