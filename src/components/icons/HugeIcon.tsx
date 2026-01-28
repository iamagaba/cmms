/**
 * HugeIcon Wrapper Component
 * 
 * Provides a consistent API for Hugeicons that matches our existing usage patterns.
 * This wrapper makes migration easier and allows for future icon system changes.
 * 
 * Usage:
 * import { HugeIcon } from '@/components/icons/HugeIcon';
 * import { User02Icon } from '@hugeicons/core-free-icons';
 * 
 * <HugeIcon icon={User02Icon} className="w-4 h-4 text-gray-400" />
 */

import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';

interface HugeIconProps {
  icon: any; // IconSvgObject type from @hugeicons/core-free-icons
  size?: number;
  className?: string;
  strokeWidth?: number;
}

export const HugeIcon: React.FC<HugeIconProps> = ({
  icon,
  size = 24,
  className = '',
  strokeWidth,
  ...props
}) => {
  return (
    <icon
      size={size}
      className={className}
      strokeWidth={strokeWidth}
      {...props}
    />
  );
};

/**
 * Helper function to convert Tailwind size classes to pixel values
 * Useful during migration from Iconify
 */
export const tailwindSizeToPixels = (className: string): number => {
  const sizeMap: Record<string, number> = {
    'w-3 h-3': 12,
    'w-3.5 h-3.5': 14,
    'w-4 h-4': 16,
    'w-5 h-5': 20,
    'w-6 h-6': 24,
    'w-8 h-8': 32,
    'w-10 h-10': 40,
    'w-12 h-12': 48,
  };

  for (const [key, value] of Object.entries(sizeMap)) {
    if (className.includes(key)) {
      return value;
    }
  }

  return 24; // default
};

export default HugeIcon;


