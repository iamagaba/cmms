import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { AdjustmentReason, ADJUSTMENT_REASON_LABELS } from '@/types/supabase';
import { getReasonBadgeColor, getReasonIcon } from '@/utils/stock-adjustment-helpers';

interface AdjustmentReasonBadgeProps {
  reason: AdjustmentReason;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

export const AdjustmentReasonBadge: React.FC<AdjustmentReasonBadgeProps> = ({
  reason,
  showIcon = true,
  size = 'sm',
}) => {
  const colorClass = getReasonBadgeColor(reason);
  const IconComponent = getReasonIcon(reason);
  const label = ADJUSTMENT_REASON_LABELS[reason] || reason;

  const sizeClasses = size === 'sm'
    ? 'px-2 py-0.5 text-xs'
    : 'px-2.5 py-1 text-sm';
  
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-sm font-semibold tracking-wide ${colorClass} ${sizeClasses}`}
    >
      {showIcon && <IconComponent className={iconSize} />}
      {label}
    </span>
  );
};
