import { useDensity } from '@/context/DensityContext';

/**
 * Hook to get density-aware spacing and sizing values
 * Use this throughout the app for consistent density behavior
 */
export const useDensitySpacing = () => {
  const { isCompact } = useDensity();
  
  return {
    // Page-level spacing
    page: isCompact ? 'p-2 lg:p-3' : 'p-3 lg:p-4',
    pageX: isCompact ? 'px-2 lg:px-3' : 'px-3 lg:px-4',
    pageY: isCompact ? 'py-2 lg:py-3' : 'py-3 lg:py-4',
    
    // Card/Panel spacing
    card: isCompact ? 'p-2' : 'p-3 lg:p-4',
    cardX: isCompact ? 'px-2' : 'px-3 lg:px-4',
    cardY: isCompact ? 'py-2' : 'py-3 lg:py-4',
    
    // Section spacing
    section: isCompact ? 'space-y-2' : 'space-y-3 lg:space-y-4',
    sectionX: isCompact ? 'space-x-2' : 'space-x-3 lg:space-x-4',
    
    // Gap utilities
    gap: isCompact ? 'gap-2' : 'gap-3 lg:gap-4',
    gapX: isCompact ? 'gap-x-2' : 'gap-x-3 lg:gap-x-4',
    gapY: isCompact ? 'gap-y-2' : 'gap-y-3 lg:gap-y-4',
    
    // Form elements
    input: isCompact ? 'h-8 px-3 py-1.5 text-xs' : 'h-10 px-3 py-2 text-sm',
    inputHeight: isCompact ? 'h-8' : 'h-10',
    
    // Buttons
    button: isCompact ? 'h-8 px-3 py-1.5 text-xs' : 'h-10 px-4 py-2 text-sm',
    buttonHeight: isCompact ? 'h-8' : 'h-10',
    buttonSm: isCompact ? 'h-7 px-2 py-1 text-[10px]' : 'h-8 px-3 py-1.5 text-xs',
    buttonLg: isCompact ? 'h-9 px-4 py-2 text-sm' : 'h-11 px-5 py-2.5 text-base',
    
    // Table rows
    row: isCompact ? 'h-8' : 'h-10',
    rowPadding: isCompact ? 'px-2 py-1' : 'px-3 py-2',
    
    // Typography
    text: {
      heading: isCompact ? 'text-sm font-semibold' : 'text-base font-semibold',
      subheading: isCompact ? 'text-xs font-medium' : 'text-sm font-medium',
      body: isCompact ? 'text-xs' : 'text-sm',
      label: isCompact ? 'text-[10px] font-medium uppercase tracking-wide' : 'text-xs font-medium uppercase tracking-wide',
      data: isCompact ? 'text-xs font-mono' : 'text-sm font-mono',
      caption: isCompact ? 'text-[10px]' : 'text-xs',
    },
    
    // Icon sizes
    icon: {
      xs: isCompact ? 12 : 14,
      sm: isCompact ? 14 : 16,
      md: isCompact ? 16 : 18,
      lg: isCompact ? 18 : 20,
      xl: isCompact ? 20 : 24,
    },
    
    // Margins
    mb: isCompact ? 'mb-2' : 'mb-3 lg:mb-4',
    mt: isCompact ? 'mt-2' : 'mt-3 lg:mt-4',
    mx: isCompact ? 'mx-2' : 'mx-3 lg:mx-4',
    my: isCompact ? 'my-2' : 'my-3 lg:my-4',
    
    // Border radius
    rounded: isCompact ? 'rounded' : 'rounded-md',
    roundedLg: isCompact ? 'rounded-md' : 'rounded-lg',
    
    // Raw values (for inline styles or calculations)
    raw: {
      inputHeight: isCompact ? 32 : 40,
      buttonHeight: isCompact ? 32 : 40,
      cardPadding: isCompact ? 8 : 12,
      sectionGap: isCompact ? 8 : 12,
      rowHeight: isCompact ? 32 : 40,
      pagePadding: isCompact ? 8 : 12,
    }
  };
};
