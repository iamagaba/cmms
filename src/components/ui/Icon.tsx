import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { cn } from '@/lib/utils';

interface IconProps {
  icon: any;
  size?: number;
  className?: string;
  variant?: 'default' | 'bold' | 'sharp';
}

/**
 * Enhanced Icon Component
 * Wraps Hugeicons with industrial styling adjustments
 * 
 * Variants:
 * - default: Standard appearance
 * - bold: Increased stroke weight for more industrial feel
 * - sharp: Square corners for sharper, more technical look
 */
export const Icon: React.FC<IconProps> = ({ 
  icon, 
  size = 16, 
  className,
  variant = 'default'
}) => {
  const variantStyles = {
    default: '',
    bold: 'icon-bold',
    sharp: 'icon-sharp',
  };

  return (
    <span 
      className={cn(
        'inline-flex items-center justify-center',
        variantStyles[variant],
        className
      )}
      style={{
        // Increase stroke weight for bolder appearance
        ['--icon-stroke-width' as any]: variant === 'bold' ? '2.5' : '2.25',
      }}
    >
      <HugeiconsIcon 
        icon={icon} 
        size={size}
        className={cn(
          'transition-colors',
          variant === 'sharp' && '[&_svg]:stroke-linecap-square [&_svg]:stroke-linejoin-miter'
        )}
      />
    </span>
  );
};

// Convenience exports for common sizes
export const IconSm: React.FC<Omit<IconProps, 'size'>> = (props) => (
  <Icon {...props} size={12} variant="bold" />
);

export const IconMd: React.FC<Omit<IconProps, 'size'>> = (props) => (
  <Icon {...props} size={16} variant="default" />
);

export const IconLg: React.FC<Omit<IconProps, 'size'>> = (props) => (
  <Icon {...props} size={20} variant="default" />
);

// Industrial variant - bold and sharp
export const IconIndustrial: React.FC<Omit<IconProps, 'variant'>> = (props) => (
  <Icon {...props} variant="sharp" />
);
