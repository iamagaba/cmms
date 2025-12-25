/**
 * Professional CMMS Design System - Design Tokens
 * 
 * This file serves as the central hub for all design tokens in the system.
 * It combines colors, typography, spacing, and other design elements into
 * a cohesive token system that can be used throughout the application.
 */

import { professionalColors } from './professional-colors';
import { professionalTypography } from './professional-typography';
import { professionalSpacing } from './professional-spacing';

// ============================================
// ANIMATION TOKENS
// ============================================

export const animationTokens = {
  // Duration tokens
  duration: {
    instant: '0ms',
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
    slower: '500ms',
  },
  
  // Easing tokens
  easing: {
    linear: 'linear',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  
  // Common transitions
  transitions: {
    colors: 'background-color 250ms cubic-bezier(0.4, 0, 0.2, 1), border-color 250ms cubic-bezier(0.4, 0, 0.2, 1), color 250ms cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'transform 250ms cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: 'opacity 250ms cubic-bezier(0.4, 0, 0.2, 1)',
    all: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// ============================================
// BORDER RADIUS TOKENS
// ============================================

export const borderRadiusTokens = {
  none: '0px',
  sm: '2px',
  base: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  '2xl': '16px',
  '3xl': '24px',
  full: '9999px',
  
  // Component-specific radius
  button: '6px',
  input: '6px',
  card: '8px',
  modal: '12px',
  badge: '9999px',
} as const;

// ============================================
// SHADOW TOKENS
// ============================================

export const shadowTokens = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  
  // Industrial-specific shadows
  industrial: '0 4px 12px -2px rgba(7, 95, 166, 0.15)',
  elevated: '0 8px 32px -4px rgba(15, 23, 42, 0.12)',
  
  // Focus shadows
  focusRing: '0 0 0 3px rgba(0, 119, 206, 0.1)',
  focusRingError: '0 0 0 3px rgba(239, 68, 68, 0.1)',
} as const;

// ============================================
// Z-INDEX TOKENS
// ============================================

export const zIndexTokens = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1020,
  banner: 1030,
  overlay: 1040,
  modal: 1050,
  popover: 1060,
  skipLink: 1070,
  toast: 1080,
  tooltip: 1090,
} as const;

// ============================================
// BREAKPOINT TOKENS
// ============================================

export const breakpointTokens = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ============================================
// COMPONENT SIZE TOKENS
// ============================================

export const sizeTokens = {
  // Button sizes
  button: {
    sm: {
      height: '32px',
      paddingX: '12px',
      fontSize: '14px',
    },
    base: {
      height: '40px',
      paddingX: '16px',
      fontSize: '14px',
    },
    lg: {
      height: '48px',
      paddingX: '24px',
      fontSize: '16px',
    },
  },
  
  // Input sizes
  input: {
    sm: {
      height: '32px',
      paddingX: '12px',
      fontSize: '14px',
    },
    base: {
      height: '40px',
      paddingX: '12px',
      fontSize: '16px',
    },
    lg: {
      height: '48px',
      paddingX: '16px',
      fontSize: '16px',
    },
  },
  
  // Icon sizes
  icon: {
    xs: '12px',
    sm: '16px',
    base: '20px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
  },
  
  // Avatar sizes
  avatar: {
    xs: '24px',
    sm: '32px',
    base: '40px',
    lg: '48px',
    xl: '64px',
    '2xl': '96px',
  },
} as const;

// ============================================
// COMPREHENSIVE DESIGN TOKENS
// ============================================

export const designTokens = {
  // Core design elements
  colors: professionalColors,
  typography: professionalTypography,
  spacing: professionalSpacing,
  
  // Visual effects
  animation: animationTokens,
  borderRadius: borderRadiusTokens,
  shadow: shadowTokens,
  
  // Layout and structure
  zIndex: zIndexTokens,
  breakpoint: breakpointTokens,
  size: sizeTokens,
} as const;

// ============================================
// TOKEN UTILITIES
// ============================================

/**
 * Get a design token value by path
 * Example: getToken('colors.primary.steel.600')
 */
export function getToken(path: string): any {
  const keys = path.split('.');
  let value: any = designTokens;
  
  for (const key of keys) {
    value = value?.[key];
    if (value === undefined) {
      console.warn(`Design token not found: ${path}`);
      return undefined;
    }
  }
  
  return value;
}



/**
 * Validate design token structure
 */
export function validateTokens(): boolean {
  try {
    // Check if all required token categories exist
    const requiredCategories = ['colors', 'typography', 'spacing', 'animation', 'borderRadius', 'shadow'];
    
    for (const category of requiredCategories) {
      if (!designTokens[category as keyof typeof designTokens]) {
        console.error(`Missing design token category: ${category}`);
        return false;
      }
    }
    
    // Check if primary colors exist
    if (!professionalColors.steelBlue || !professionalColors.safetyOrange) {
      console.error('Missing primary color definitions');
      return false;
    }
    
    // Check if typography presets exist
    if (!professionalTypography.presets.body || !professionalTypography.presets.h1) {
      console.error('Missing typography presets');
      return false;
    }
    
    // Check if spacing scale exists
    if (!professionalSpacing.scale[4] || !professionalSpacing.semantic.base) {
      console.error('Missing spacing definitions');
      return false;
    }
    
    console.log('✅ Design tokens validation passed');
    return true;
  } catch (error) {
    console.error('Design tokens validation failed:', error);
    return false;
  }
}

// ============================================
// THEME CONFIGURATION
// ============================================

export interface ThemeConfig {
  mode: 'light' | 'dark';
  density: 'compact' | 'comfortable' | 'spacious';
  primaryColor: keyof typeof professionalColors;
  borderRadius: 'sharp' | 'rounded' | 'soft';
}

export const defaultThemeConfig: ThemeConfig = {
  mode: 'light',
  density: 'comfortable',
  primaryColor: 'steelBlue',
  borderRadius: 'rounded',
};

/**
 * Apply theme configuration to design tokens
 */
export function applyThemeConfig(config: Partial<ThemeConfig> = {}): typeof designTokens {
  const mergedConfig = { ...defaultThemeConfig, ...config };
  
  // Create a deep copy of design tokens
  const themedTokens = JSON.parse(JSON.stringify(designTokens));
  
  // Apply density multiplier to spacing
  if (mergedConfig.density !== 'comfortable') {
    const densityMultiplier = mergedConfig.density === 'compact' ? 0.75 : 1.25;
    
    // Apply multiplier to spacing values
    Object.keys(themedTokens.spacing).forEach(key => {
      const value = themedTokens.spacing[key];
      if (typeof value === 'string' && value.includes('rem')) {
        const numValue = parseFloat(value);
        themedTokens.spacing[key] = `${(numValue * densityMultiplier).toFixed(3)}rem`;
      }
    });
    
    // Apply to component spacing
    Object.keys(themedTokens.components).forEach(componentKey => {
      const component = themedTokens.components[componentKey];
      if (component.spacing) {
        Object.keys(component.spacing).forEach(spacingKey => {
          const value = component.spacing[spacingKey];
          if (typeof value === 'string' && value.includes('rem')) {
            const numValue = parseFloat(value);
            component.spacing[spacingKey] = `${(numValue * densityMultiplier).toFixed(3)}rem`;
          }
        });
      }
    });
  }
  
  // Apply border radius preference
  if (mergedConfig.borderRadius !== 'rounded') {
    const radiusMultiplier = mergedConfig.borderRadius === 'sharp' ? 0.25 : 1.75;
    
    Object.keys(themedTokens.effects.borderRadius).forEach(key => {
      const value = themedTokens.effects.borderRadius[key];
      if (typeof value === 'string' && value.includes('rem')) {
        const numValue = parseFloat(value);
        themedTokens.effects.borderRadius[key] = `${Math.max(0, numValue * radiusMultiplier).toFixed(3)}rem`;
      }
    });
  }
  
  // Apply dark mode color adjustments
  if (mergedConfig.mode === 'dark') {
    // Invert background colors for dark mode
    const darkModeColors = {
      ...themedTokens.colors,
      // Swap light and dark shades for backgrounds
      machinery: {
        ...themedTokens.colors.machinery,
        50: themedTokens.colors.machinery[900],
        100: themedTokens.colors.machinery[800],
        200: themedTokens.colors.machinery[700],
        300: themedTokens.colors.machinery[600],
        400: themedTokens.colors.machinery[500],
        500: themedTokens.colors.machinery[400],
        600: themedTokens.colors.machinery[300],
        700: themedTokens.colors.machinery[200],
        800: themedTokens.colors.machinery[100],
        900: themedTokens.colors.machinery[50],
      },
    };
    
    themedTokens.colors = darkModeColors;
    
    // Adjust shadows for dark mode
    themedTokens.effects.shadows = {
      ...themedTokens.effects.shadows,
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
      base: '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
    };
  }
  
  return themedTokens;
}

/**
 * Generate CSS custom properties from design tokens
 */
export function createCSSCustomProperties(tokens: typeof designTokens): string {
  const properties: string[] = [];
  
  // Color properties
  Object.entries(tokens.colors).forEach(([colorName, colorValue]) => {
    if (typeof colorValue === 'object') {
      Object.entries(colorValue).forEach(([shade, value]) => {
        properties.push(`  --color-${colorName}-${shade}: ${value};`);
      });
    } else {
      properties.push(`  --color-${colorName}: ${colorValue};`);
    }
  });
  
  // Spacing properties
  Object.entries(tokens.spacing).forEach(([key, value]) => {
    properties.push(`  --spacing-${key}: ${value};`);
  });
  
  // Typography properties
  Object.entries(tokens.typography.fontSizes).forEach(([size, value]) => {
    properties.push(`  --font-size-${size}: ${value};`);
  });
  
  Object.entries(tokens.typography.lineHeights).forEach(([size, value]) => {
    properties.push(`  --line-height-${size}: ${value};`);
  });
  
  // Effect properties
  Object.entries(tokens.effects.shadows).forEach(([level, value]) => {
    properties.push(`  --shadow-${level}: ${value};`);
  });
  
  Object.entries(tokens.effects.borderRadius).forEach(([size, value]) => {
    properties.push(`  --radius-${size}: ${value};`);
  });
  
  return `:root {\n${properties.join('\n')}\n}`;
}

// ============================================
// EXPORTS
// ============================================

export default designTokens;