import { Vehicle } from '@/types/supabase';
import { getAssetCustodyBadge } from '@/utils/work-order-helpers';

interface AssetCustodyBadgeProps {
  vehicle: Pick<Vehicle, 'status'> | null | undefined;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Badge component to display asset custody status.
 * Shows whether an asset is in custody at service center or with customer.
 */
export const AssetCustodyBadge = ({ 
  vehicle, 
  showIcon = true,
  size = 'md' 
}: AssetCustodyBadgeProps) => {
  if (!vehicle) return null;

  const badge = getAssetCustodyBadge(vehicle);
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    gray: 'bg-gray-100 text-gray-700 border-gray-200',
    green: 'bg-green-100 text-green-800 border-green-200',
    red: 'bg-red-100 text-red-800 border-red-200'
  };

  return (
    <span 
      className={`inline-flex items-center gap-1 rounded-full border font-medium ${sizeClasses[size]} ${colorClasses[badge.color as keyof typeof colorClasses]}`}
      title={badge.description}
    >
      {showIcon && <span>{badge.icon}</span>}
      <span>{badge.label}</span>
    </span>
  );
};
