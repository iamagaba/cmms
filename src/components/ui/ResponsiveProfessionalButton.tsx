/**
 * Responsive Professional Button Component
 * 
 * An enhanced version of the ProfessionalButton with responsive capabilities,
 * touch-friendly sizing, and adaptive behavior for different screen sizes.
 * Extends the base button with responsive props and mobile optimizations.
 */

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { 
  useResponsive, 
  getTouchFriendlySize,
  getOptimalComponentSize,
  type ResponsiveProp,
  type TouchTargetSize 
} from '@/utils/responsive';
import ProfessionalButton, { type ProfessionalButtonProps } from './ProfessionalButton';

// ============================================
// RESPONSIVE BUTTON INTERFACES
// ============================================

export interface ResponsiveProfessionalButtonProps extends Omit<ProfessionalButtonProps, 'size' | 'fullWidth'> {
  /**
   * Responsive size that adapts to screen size
   */
  size?: ResponsiveProp<'sm' | 'base' | 'lg'>;
  
  /**
   * Responsive full width behavior
   */
  fullWidth?: ResponsiveProp<boolean>;
  
  /**
   * Touch target size for mobile devices
   */
  touchSize?: TouchTargetSize;
  
  /**
   * Auto-adapt size based on device type
   */
  adaptive?: boolean;
  
  /**
   * Mobile-specific variant override
   */
  mobileVariant?: ProfessionalButtonProps['variant'];
  
  /**
   * Hide text on mobile (icon only)
   */
  hideTextOnMobile?: boolean;
  
  /**
   * Responsive padding override
   */
  padding?: ResponsiveProp<string>;
  
  /**
   * Responsive margin override
   */
  margin?: ResponsiveProp<string>;
}

// ============================================
// RESPONSIVE BUTTON COMPONENT
// ============================================

const ResponsiveProfessionalButton = forwardRef<
  HTMLButtonElement,
  ResponsiveProfessionalButtonProps
>(({
  size = 'base',
  fullWidth = false,
  touchSize = 'base',
  adaptive = true,
  mobileVariant,
  hideTextOnMobile = false,
  padding,
  margin,
  variant,
  children,
  className,
  ...props
}, ref) => {
  const { currentBreakpoint, isMobile, isDesktop } = useResponsive();
  
  // Resolve responsive props
  const resolveResponsiveProp = <T,>(prop: ResponsiveProp<T>): T | undefined => {
    if (typeof prop === 'object' && prop !== null && !Array.isArray(prop)) {
      const breakpointOrder = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs'] as const;
      const currentIndex = breakpointOrder.indexOf(currentBreakpoint);
      
      for (let i = currentIndex; i < breakpointOrder.length; i++) {
        const bp = breakpointOrder[i];
        if ((prop as any)[bp] !== undefined) {
          return (prop as any)[bp];
        }
      }
      return undefined;
    }
    return prop as T;
  };
  
  // Resolve current values
  const currentSize = resolveResponsiveProp(size) || 'base';
  const currentFullWidth = resolveResponsiveProp(fullWidth) || false;
  const currentPadding = resolveResponsiveProp(padding);
  const currentMargin = resolveResponsiveProp(margin);
  
  // Adaptive sizing
  const adaptiveSize = adaptive ? getOptimalComponentSize(currentSize, isMobile) : currentSize;
  
  // Mobile variant override
  const effectiveVariant = (isMobile && mobileVariant) ? mobileVariant : variant;
  
  // Touch-friendly sizing
  const touchFriendlyHeight = getTouchFriendlySize(touchSize, isMobile);
  
  // Hide text on mobile if specified
  const buttonContent = (hideTextOnMobile && isMobile) ? null : children;
  
  // Generate responsive classes
  const responsiveClasses: string[] = [];
  
  if (currentPadding) {
    responsiveClasses.push(`px-${currentPadding}`);
  }
  
  if (currentMargin) {
    responsiveClasses.push(`m-${currentMargin}`);
  }
  
  // Touch-friendly minimum height on mobile
  if (isMobile) {
    responsiveClasses.push('touch-manipulation');
  }
  
  const combinedClassName = cn(
    responsiveClasses.join(' '),
    className
  );
  
  // Custom styles for touch targets
  const customStyles: React.CSSProperties = {};
  if (isMobile && touchSize) {
    customStyles.minHeight = touchFriendlyHeight;
  }

  return (
    <ProfessionalButton
      ref={ref}
      variant={effectiveVariant}
      size={adaptiveSize}
      fullWidth={currentFullWidth}
      className={combinedClassName}
      style={customStyles}
      {...props}
    >
      {buttonContent}
    </ProfessionalButton>
  );
});

ResponsiveProfessionalButton.displayName = 'ResponsiveProfessionalButton';

// ============================================
// RESPONSIVE BUTTON GROUP COMPONENT
// ============================================

export interface ResponsiveButtonGroupProps {
  children: React.ReactNode;
  orientation?: ResponsiveProp<'horizontal' | 'vertical'>;
  spacing?: ResponsiveProp<string>;
  fullWidth?: ResponsiveProp<boolean>;
  className?: string;
}

const ResponsiveButtonGroup: React.FC<ResponsiveButtonGroupProps> = ({
  children,
  orientation = { xs: 'vertical', sm: 'horizontal' },
  spacing = '2',
  fullWidth = false,
  className,
}) => {
  const { currentBreakpoint } = useResponsive();
  
  const resolveResponsiveProp = <T,>(prop: ResponsiveProp<T>): T | undefined => {
    if (typeof prop === 'object' && prop !== null && !Array.isArray(prop)) {
      const breakpointOrder = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs'] as const;
      const currentIndex = breakpointOrder.indexOf(currentBreakpoint);
      
      for (let i = currentIndex; i < breakpointOrder.length; i++) {
        const bp = breakpointOrder[i];
        if ((prop as any)[bp] !== undefined) {
          return (prop as any)[bp];
        }
      }
      return undefined;
    }
    return prop as T;
  };
  
  const currentOrientation = resolveResponsiveProp(orientation) || 'horizontal';
  const currentSpacing = resolveResponsiveProp(spacing) || '2';
  const currentFullWidth = resolveResponsiveProp(fullWidth) || false;
  
  const classes = cn(
    'flex',
    currentOrientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap',
    currentOrientation === 'vertical' ? `gap-y-${currentSpacing}` : `gap-${currentSpacing}`,
    currentFullWidth && 'w-full',
    className
  );

  return (
    <div className={classes}>
      {children}
    </div>
  );
};

// ============================================
// RESPONSIVE ICON BUTTON COMPONENT
// ============================================

export interface ResponsiveIconButtonProps extends Omit<ResponsiveProfessionalButtonProps, 'children'> {
  icon: string;
  label: string;
  showLabelOnDesktop?: boolean;
}

const ResponsiveIconButton: React.FC<ResponsiveIconButtonProps> = ({
  icon,
  label,
  showLabelOnDesktop = false,
  size = 'base',
  ...props
}) => {
  const { isMobile, isDesktop } = useResponsive();
  
  const shouldShowLabel = showLabelOnDesktop && isDesktop;

  return (
    <ResponsiveProfessionalButton
      icon={icon}
      size={size}
      aria-label={label}
      title={label}
      {...props}
    >
      {shouldShowLabel ? label : null}
    </ResponsiveProfessionalButton>
  );
};

// ============================================
// RESPONSIVE FAB (FLOATING ACTION BUTTON)
// ============================================

export interface ResponsiveFABProps extends Omit<ResponsiveProfessionalButtonProps, 'variant' | 'size'> {
  icon: string;
  label: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size?: 'base' | 'lg';
  extended?: ResponsiveProp<boolean>;
}

const ResponsiveFAB: React.FC<ResponsiveFABProps> = ({
  icon,
  label,
  position = 'bottom-right',
  size = 'lg',
  extended = { xs: false, md: true },
  className,
  ...props
}) => {
  const { currentBreakpoint } = useResponsive();
  
  const resolveResponsiveProp = <T,>(prop: ResponsiveProp<T>): T | undefined => {
    if (typeof prop === 'object' && prop !== null && !Array.isArray(prop)) {
      const breakpointOrder = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs'] as const;
      const currentIndex = breakpointOrder.indexOf(currentBreakpoint);
      
      for (let i = currentIndex; i < breakpointOrder.length; i++) {
        const bp = breakpointOrder[i];
        if ((prop as any)[bp] !== undefined) {
          return (prop as any)[bp];
        }
      }
      return undefined;
    }
    return prop as T;
  };
  
  const isExtended = resolveResponsiveProp(extended) || false;
  
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  };
  
  const fabClasses = cn(
    'fixed z-50 shadow-lg',
    positionClasses[position],
    isExtended ? 'rounded-full px-6' : 'rounded-full w-14 h-14 p-0',
    className
  );

  return (
    <ResponsiveProfessionalButton
      variant="primary"
      size={size}
      icon={icon}
      className={fabClasses}
      aria-label={label}
      title={label}
      {...props}
    >
      {isExtended ? label : null}
    </ResponsiveProfessionalButton>
  );
};

// ============================================
// EXPORTS
// ============================================

export default ResponsiveProfessionalButton;
export {
  ResponsiveButtonGroup,
  ResponsiveIconButton,
  ResponsiveFAB,
};

export type {
  ResponsiveProfessionalButtonProps,
  ResponsiveButtonGroupProps,
  ResponsiveIconButtonProps,
  ResponsiveFABProps,
};