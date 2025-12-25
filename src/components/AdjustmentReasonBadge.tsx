import React from 'react';
import { Icon } from '@iconify/react';
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
  const icon = getReasonIcon(reason);
  const label = ADJUSTMENT_REASON_LABELS[reason] || reason;

  const sizeClasses = size === 'sm' 
    ? 'px-2 py-0.5 text-xs' 
    : 'px-2.5 py-1 text-sm';

  return (
    <span 
      className={`inline-flex items-center gap-1 rounded border font-medium ${colorClass} ${sizeClasses}`}
    >
      {showIcon && <Icon icon={icon} className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />}
      {label}
    </span>
  );
};
