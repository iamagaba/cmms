import { Search } from 'lucide-react';
import React from 'react';

import { cn } from '@/lib/utils';

// ============================================
// ICON SIZE CONSTANTS - Design System Standard
// ============================================

/**
 * Standardized icon sizes for the entire application
 * Use these constants instead of arbitrary pixel values
 */
export const ICON_SIZES = {
  xs: 12,   // Tiny icons in dense UIs, badges
  sm: 14,   // Small icons in compact buttons, table cells
  base: 16, // Default icon size for most UI elements
  lg: 20,   // Large icons in prominent buttons, headers
  xl: 24,   // Extra large icons in hero sections, empty states
  '2xl': 32, // Oversized icons for marketing, illustrations
} as const;

export type IconSize = keyof typeof ICON_SIZES;

// ============================================
// COMPONENT INTERFACES
// ============================================

interface IconProps {
  icon: any;
  size?: IconSize | number; // Accept both named sizes and custom numbers
  className?: string;
  variant?: 'default' | 'bold' | 'sharp';
}

// ============================================
// MAIN ICON COMPONENT
// ============================================

/**
 * Standardized Icon Component - SINGLE SOURCE OF TRUTH
 * 
 * This is the ONLY way icons should be rendered in the application.
 * DO NOT use Lucide React or other icon libraries directly.
 * 
 * Usage:
 * ```tsx
 * import { Icon, ICON_SIZES } from '@/components/ui/Icon';
 * 
 * 
 * <Icon icon={Search} size="base" />
 * <Icon icon={Search} size={ICON_SIZES.lg} />
 * ```
 * 
 * Variants:
 * - default: Standard appearance (stroke-width: 2.25)
 * - bold: Increased stroke weight for more industrial feel (stroke-width: 2.5)
 * - sharp: Square corners for sharper, more technical look
 */
export const Icon: React.FC<IconProps> = ({ 
  icon, 
  size = 'base', 
  className,
  variant = 'default'
}) => {
  // Convert named size to pixel value
  const pixelSize = typeof size === 'string' ? ICON_SIZES[size] : size;
  
  const variantStyles = {
    default: '',
    bold: 'icon-bold',
    sharp: 'icon-sharp',
  };

  // Adjust stroke width based on icon size for optimal appearance
  const getStrokeWidth = () => {
    if (variant === 'bold') return '2.5';
    if (pixelSize <= 14) return '2.5'; // Smaller icons need bolder strokes
    if (pixelSize >= 24) return '2.15'; // Larger icons can be lighter
    return '2.25'; // Default for 16-20px icons
  };

  return (
    <span 
      className={cn(
        'inline-flex items-center justify-center flex-shrink-0',
        variantStyles[variant],
        className
      )}
      style={{
        ['--icon-stroke-width' as any]: getStrokeWidth(),
      }}
    >
      <icon 
        size={pixelSize}
        className={cn(
          'transition-colors',
          variant === 'sharp' && '[&_svg]:stroke-linecap-square [&_svg]:stroke-linejoin-miter'
        )}
      />
    </span>
  );
};

// ============================================
// CONVENIENCE EXPORTS FOR COMMON SIZES
// ============================================

/**
 * Pre-sized icon components for common use cases
 * These enforce consistency and reduce decision fatigue
 */

export const IconXs: React.FC<Omit<IconProps, 'size'>> = (props) => (
  <Icon {...props} size="xs" />
);

export const IconSm: React.FC<Omit<IconProps, 'size'>> = (props) => (
  <Icon {...props} size="sm" />
);

export const IconBase: React.FC<Omit<IconProps, 'size'>> = (props) => (
  <Icon {...props} size="base" />
);

export const IconLg: React.FC<Omit<IconProps, 'size'>> = (props) => (
  <Icon {...props} size="lg" />
);

export const IconXl: React.FC<Omit<IconProps, 'size'>> = (props) => (
  <Icon {...props} size="xl" />
);

// Industrial variant - bold and sharp for technical contexts
export const IconIndustrial: React.FC<Omit<IconProps, 'variant'>> = (props) => (
  <Icon {...props} variant="sharp" />
);

// ============================================
// MIGRATION HELPER - Tailwind Class to Size
// ============================================

/**
 * Helper to convert Tailwind size classes to icon sizes
 * Useful during migration from Lucide to Hugeicons
 * 
 * @deprecated Use ICON_SIZES directly instead
 */
export const tailwindToIconSize = (className: string): IconSize => {
  if (className.includes('w-3') || className.includes('h-3')) return 'xs';
  if (className.includes('w-4') || className.includes('h-4')) return 'sm';
  if (className.includes('w-5') || className.includes('h-5')) return 'base';
  if (className.includes('w-6') || className.includes('h-6')) return 'lg';
  if (className.includes('w-8') || className.includes('h-8')) return 'xl';
  return 'base';
};
