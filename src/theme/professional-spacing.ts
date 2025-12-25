/**
 * Professional CMMS Design System - Spacing and Layout System
 * 
 * This spacing system provides consistent rhythm and hierarchy throughout
 * the application. Based on a 4px base unit for pixel-perfect alignment
 * and optimal visual balance.
 * 
 * Spacing Philosophy:
 * - 4px base unit for consistent alignment
 * - Semantic spacing names for contextual usage
 * - Responsive spacing that adapts to screen density
 * - Component-specific spacing for consistent patterns
 */

// ============================================
// BASE SPACING SCALE
// ============================================

/**
 * Base spacing scale using 4px increments
 * Provides consistent rhythm and alignment
 */
export const spacingScale = {
  0: '0px',
  px: '1px',
  0.5: '2px',
  1: '4px',
  1.5: '6px',
  2: '8px',
  2.5: '10px',
  3: '12px',
  3.5: '14px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  11: '44px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
  28: '112px',
  32: '128px',
  36: '144px',
  40: '160px',
  44: '176px',
  48: '192px',
  52: '208px',
  56: '224px',
  60: '240px',
  64: '256px',
  72: '288px',
  80: '320px',
  96: '384px',
} as const;

// ============================================
// SEMANTIC SPACING TOKENS
// ============================================

/**
 * Semantic spacing tokens for contextual usage
 * Provides meaningful names for common spacing patterns
 */
export const semanticSpacing = {
  // Micro spacing for fine adjustments
  micro: spacingScale[1],      // 4px
  
  // Extra small spacing for tight layouts
  xs: spacingScale[2],         // 8px
  
  // Small spacing for compact components
  sm: spacingScale[3],         // 12px
  
  // Base spacing for standard components
  base: spacingScale[4],       // 16px
  
  // Medium spacing for comfortable layouts
  md: spacingScale[6],         // 24px
  
  // Large spacing for generous layouts
  lg: spacingScale[8],         // 32px
  
  // Extra large spacing for major sections
  xl: spacingScale[12],        // 48px
  
  // 2X large spacing for page-level separation
  '2xl': spacingScale[16],     // 64px
  
  // 3X large spacing for major page sections
  '3xl': spacingScale[24],     // 96px
  
  // 4X large spacing for hero sections
  '4xl': spacingScale[32],     // 128px
} as const;

// ============================================
// COMPONENT SPACING TOKENS
// ============================================

/**
 * Component-specific spacing for consistent patterns
 * Ensures components have predictable internal spacing
 */
export const componentSpacing = {
  // Button spacing
  button: {
    paddingX: {
      sm: spacingScale[3],     // 12px
      base: spacingScale[4],   // 16px
      lg: spacingScale[6],     // 24px
    },
    paddingY: {
      sm: spacingScale[2],     // 8px
      base: spacingScale[2.5], // 10px
      lg: spacingScale[3],     // 12px
    },
    gap: spacingScale[2],      // 8px (icon to text)
  },
  
  // Input spacing
  input: {
    paddingX: spacingScale[3], // 12px
    paddingY: spacingScale[2.5], // 10px
    gap: spacingScale[2],      // 8px (label to input)
  },
  
  // Card spacing
  card: {
    padding: {
      sm: spacingScale[4],     // 16px
      base: spacingScale[6],   // 24px
      lg: spacingScale[8],     // 32px
    },
    gap: spacingScale[4],      // 16px (between elements)
  },
  
  // Modal spacing
  modal: {
    padding: spacingScale[6],  // 24px
    gap: spacingScale[6],      // 24px
    headerGap: spacingScale[4], // 16px
  },
  
  // Table spacing
  table: {
    cellPadding: {
      x: spacingScale[3],      // 12px
      y: spacingScale[3],      // 12px
    },
    headerPadding: {
      x: spacingScale[3],      // 12px
      y: spacingScale[4],      // 16px
    },
  },
  
  // Navigation spacing
  navigation: {
    itemPadding: {
      x: spacingScale[3],      // 12px
      y: spacingScale[2.5],    // 10px
    },
    gap: spacingScale[1],      // 4px (between items)
    sectionGap: spacingScale[6], // 24px (between sections)
  },
  
  // Form spacing
  form: {
    fieldGap: spacingScale[4], // 16px (between fields)
    sectionGap: spacingScale[8], // 32px (between sections)
    labelGap: spacingScale[2], // 8px (label to input)
  },
} as const;

// ============================================
// LAYOUT SPACING TOKENS
// ============================================

/**
 * Layout-specific spacing for page structure
 * Defines consistent spacing for major layout elements
 */
export const layoutSpacing = {
  // Page container spacing
  container: {
    paddingX: {
      mobile: spacingScale[4],   // 16px
      tablet: spacingScale[6],   // 24px
      desktop: spacingScale[8],  // 32px
    },
    paddingY: {
      mobile: spacingScale[4],   // 16px
      tablet: spacingScale[6],   // 24px
      desktop: spacingScale[8],  // 32px
    },
  },
  
  // Section spacing
  section: {
    gap: {
      mobile: spacingScale[8],   // 32px
      tablet: spacingScale[12],  // 48px
      desktop: spacingScale[16], // 64px
    },
    paddingY: {
      mobile: spacingScale[12],  // 48px
      tablet: spacingScale[16],  // 64px
      desktop: spacingScale[24], // 96px
    },
  },
  
  // Grid spacing
  grid: {
    gap: {
      mobile: spacingScale[4],   // 16px
      tablet: spacingScale[6],   // 24px
      desktop: spacingScale[8],  // 32px
    },
  },
  
  // Sidebar spacing
  sidebar: {
    width: {
      collapsed: spacingScale[16], // 64px
      expanded: spacingScale[64],  // 256px
    },
    padding: spacingScale[4],      // 16px
    itemGap: spacingScale[1],      // 4px
  },
  
  // Header spacing
  header: {
    height: spacingScale[16],      // 64px
    paddingX: spacingScale[6],     // 24px
    paddingY: spacingScale[4],     // 16px
  },
} as const;

// ============================================
// RESPONSIVE SPACING
// ============================================

/**
 * Responsive spacing multipliers for different screen sizes
 * Allows spacing to adapt to screen density and available space
 */
export const responsiveSpacing = {
  // Mobile spacing (320px - 640px)
  mobile: {
    multiplier: 0.75,
    container: layoutSpacing.container.paddingX.mobile,
    section: layoutSpacing.section.gap.mobile,
    grid: layoutSpacing.grid.gap.mobile,
  },
  
  // Tablet spacing (640px - 1024px)
  tablet: {
    multiplier: 0.875,
    container: layoutSpacing.container.paddingX.tablet,
    section: layoutSpacing.section.gap.tablet,
    grid: layoutSpacing.grid.gap.tablet,
  },
  
  // Desktop spacing (1024px+)
  desktop: {
    multiplier: 1,
    container: layoutSpacing.container.paddingX.desktop,
    section: layoutSpacing.section.gap.desktop,
    grid: layoutSpacing.grid.gap.desktop,
  },
} as const;

// ============================================
// DENSITY SPACING
// ============================================

/**
 * Density-based spacing for different UI densities
 * Allows users to choose between compact, comfortable, and spacious layouts
 */
export const densitySpacing = {
  // Compact density for power users
  compact: {
    multiplier: 0.75,
    button: {
      paddingX: spacingScale[2.5], // 10px
      paddingY: spacingScale[1.5], // 6px
    },
    card: {
      padding: spacingScale[3],    // 12px
    },
    form: {
      fieldGap: spacingScale[3],   // 12px
    },
  },
  
  // Comfortable density (default)
  comfortable: {
    multiplier: 1,
    button: componentSpacing.button,
    card: componentSpacing.card,
    form: componentSpacing.form,
  },
  
  // Spacious density for accessibility
  spacious: {
    multiplier: 1.25,
    button: {
      paddingX: spacingScale[5],   // 20px
      paddingY: spacingScale[3.5], // 14px
    },
    card: {
      padding: spacingScale[8],    // 32px
    },
    form: {
      fieldGap: spacingScale[6],   // 24px
    },
  },
} as const;

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get spacing value by key
 */
export function getSpacing(key: keyof typeof spacingScale): string {
  return spacingScale[key];
}

/**
 * Get semantic spacing value
 */
export function getSemanticSpacing(key: keyof typeof semanticSpacing): string {
  return semanticSpacing[key];
}

/**
 * Get component spacing for a specific component and property
 */
export function getComponentSpacing(
  component: keyof typeof componentSpacing,
  property: string
): string | Record<string, string> {
  const componentConfig = componentSpacing[component];
  const keys = property.split('.');
  
  let value: any = componentConfig;
  for (const key of keys) {
    value = value?.[key];
  }
  
  return value;
}

/**
 * Create responsive spacing CSS custom properties
 */
export function createResponsiveSpacingCSS(): string {
  return `
    :root {
      --spacing-container: ${responsiveSpacing.desktop.container};
      --spacing-section: ${responsiveSpacing.desktop.section};
      --spacing-grid: ${responsiveSpacing.desktop.grid};
    }
    
    @media (max-width: 640px) {
      :root {
        --spacing-container: ${responsiveSpacing.mobile.container};
        --spacing-section: ${responsiveSpacing.mobile.section};
        --spacing-grid: ${responsiveSpacing.mobile.grid};
      }
    }
    
    @media (min-width: 641px) and (max-width: 1024px) {
      :root {
        --spacing-container: ${responsiveSpacing.tablet.container};
        --spacing-section: ${responsiveSpacing.tablet.section};
        --spacing-grid: ${responsiveSpacing.tablet.grid};
      }
    }
  `;
}

/**
 * Create density-based spacing CSS custom properties
 */
export function createDensitySpacingCSS(density: keyof typeof densitySpacing): string {
  const config = densitySpacing[density];
  
  return `
    :root {
      --density-multiplier: ${config.multiplier};
      --button-padding-x: ${config.button.paddingX};
      --button-padding-y: ${config.button.paddingY};
      --card-padding: ${config.card.padding};
      --form-field-gap: ${config.form.fieldGap};
    }
  `;
}

/**
 * Apply spacing multiplier to a spacing value
 */
export function applySpacingMultiplier(spacing: string, multiplier: number): string {
  const numericValue = parseFloat(spacing);
  const unit = spacing.replace(numericValue.toString(), '');
  return `${numericValue * multiplier}${unit}`;
}

// ============================================
// EXPORTS
// ============================================

export const professionalSpacing = {
  scale: spacingScale,
  semantic: semanticSpacing,
  component: componentSpacing,
  layout: layoutSpacing,
  responsive: responsiveSpacing,
  density: densitySpacing,
  
  // Utility functions
  get: getSpacing,
  getSemantic: getSemanticSpacing,
  getComponent: getComponentSpacing,
  createResponsiveCSS: createResponsiveSpacingCSS,
  createDensityCSS: createDensitySpacingCSS,
  applyMultiplier: applySpacingMultiplier,
} as const;

export default professionalSpacing;