/**
 * Tailwind CSS Integration for Professional Design System
 * 
 * This module provides utilities to integrate the professional design system
 * with Tailwind CSS configuration, generating utility classes and CSS custom
 * properties that can be used throughout the desktop application.
 */

import { designTokens, type ThemeConfig, defaultThemeConfig } from './professional-design-tokens';
import { professionalColors } from './professional-colors';
import { professionalSpacing } from './professional-spacing';
import { professionalTypography } from './professional-typography';

// ============================================
// TAILWIND COLOR CONFIGURATION
// ============================================

/**
 * Generate Tailwind color configuration from design tokens
 */
export function generateTailwindColors() {
  return {
    // Professional CMMS Color System - Primary colors
    primary: professionalColors.steelBlue,
    steel: professionalColors.steelBlue,
    safety: professionalColors.safetyOrange,
    machinery: professionalColors.machineryGray,
    industrial: professionalColors.industrialGreen,
    maintenance: professionalColors.maintenanceYellow,
    warning: professionalColors.warningRed,
    
    // Semantic color aliases for easy usage
    success: professionalColors.industrialGreen[500],
    error: professionalColors.warningRed[500],
    info: professionalColors.steelBlue[500],
    alert: professionalColors.safetyOrange[500],
    
    // Surface colors for backgrounds
    surface: {
      DEFAULT: '#ffffff',
      secondary: professionalColors.machineryGray[50],
      tertiary: professionalColors.machineryGray[100],
    },
    
    // Legacy support (will be deprecated)
    gray: professionalColors.machineryGray,
  };
}

// ============================================
// TAILWIND SPACING CONFIGURATION
// ============================================

/**
 * Generate Tailwind spacing configuration from design tokens
 */
export function generateTailwindSpacing() {
  const spacing: Record<string, string> = {};
  
  // Convert design token spacing to Tailwind format
  Object.entries(professionalSpacing.scale).forEach(([key, value]) => {
    spacing[key] = value;
  });
  
  // Add semantic spacing aliases
  spacing['xs'] = professionalSpacing.semantic.xs;
  spacing['sm'] = professionalSpacing.semantic.sm;
  spacing['base'] = professionalSpacing.semantic.base;
  spacing['lg'] = professionalSpacing.semantic.lg;
  spacing['xl'] = professionalSpacing.semantic.xl;
  
  return spacing;
}

// ============================================
// TAILWIND TYPOGRAPHY CONFIGURATION
// ============================================

/**
 * Generate Tailwind typography configuration from design tokens
 */
export function generateTailwindTypography() {
  return {
    fontFamily: {
      sans: professionalTypography.fontFamilies.primary,
      display: professionalTypography.fontFamilies.display,
      mono: professionalTypography.fontFamilies.mono,
    },
    fontSize: professionalTypography.fontSizes,
    fontWeight: professionalTypography.fontWeights,
    lineHeight: professionalTypography.lineHeights,
    letterSpacing: professionalTypography.letterSpacing,
  };
}

// ============================================
// TAILWIND EFFECTS CONFIGURATION
// ============================================

/**
 * Generate Tailwind effects configuration from design tokens
 */
export function generateTailwindEffects() {
  return {
    boxShadow: {
      ...designTokens.shadow,
      // Add professional-specific shadows
      'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.1)',
      'sharp': '0 0 0 1px rgba(0,0,0,0.05), 0 1px 2px 0 rgba(0,0,0,0.05)',
    },
    borderRadius: {
      ...designTokens.borderRadius,
      // Add component-specific radius
      'industrial': '8px',
      'component': '6px',
    },
    animation: {
      'fade-in': 'fadeIn 250ms cubic-bezier(0.4, 0, 0.2, 1)',
      'slide-up': 'slideUp 250ms cubic-bezier(0.4, 0, 0.2, 1)',
      'scale-in': 'scaleIn 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    },
    keyframes: {
      fadeIn: {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' },
      },
      slideUp: {
        '0%': { transform: 'translateY(10px)', opacity: '0' },
        '100%': { transform: 'translateY(0)', opacity: '1' },
      },
      scaleIn: {
        '0%': { transform: 'scale(0.95)', opacity: '0' },
        '100%': { transform: 'scale(1)', opacity: '1' },
      },
    },
  };
}

// ============================================
// COMPLETE TAILWIND CONFIGURATION
// ============================================

/**
 * Generate complete Tailwind configuration object
 */
export function generateTailwindConfig(themeConfig: Partial<ThemeConfig> = {}) {
  const config = { ...defaultThemeConfig, ...themeConfig };
  
  return {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: generateTailwindColors(),
        spacing: generateTailwindSpacing(),
        ...generateTailwindTypography(),
        ...generateTailwindEffects(),
        
        // Breakpoints from design tokens
        screens: {
          'xs': designTokens.breakpoint.xs,
          'sm': designTokens.breakpoint.sm,
          'md': designTokens.breakpoint.md,
          'lg': designTokens.breakpoint.lg,
          'xl': designTokens.breakpoint.xl,
          '2xl': designTokens.breakpoint['2xl'],
        },
        
        // Z-index values
        zIndex: designTokens.zIndex,
      },
    },
    plugins: [],
  };
}

// ============================================
// CSS CUSTOM PROPERTIES GENERATION
// ============================================

/**
 * Generate CSS custom properties for dynamic theming
 */
export function generateCSSCustomProperties(themeConfig: Partial<ThemeConfig> = {}): string {
  const config = { ...defaultThemeConfig, ...themeConfig };
  const properties: string[] = [];
  
  // Color properties
  Object.entries(professionalColors).forEach(([colorName, colorScale]) => {
    if (typeof colorScale === 'object') {
      Object.entries(colorScale).forEach(([shade, value]) => {
        properties.push(`  --color-${colorName}-${shade}: ${value};`);
      });
    }
  });
  
  // Spacing properties
  Object.entries(professionalSpacing.scale).forEach(([key, value]) => {
    properties.push(`  --spacing-${key}: ${value};`);
  });
  
  // Typography properties
  Object.entries(professionalTypography.fontSizes).forEach(([size, value]) => {
    properties.push(`  --font-size-${size}: ${value};`);
  });
  
  Object.entries(professionalTypography.lineHeights).forEach(([size, value]) => {
    properties.push(`  --line-height-${size}: ${value};`);
  });
  
  // Effect properties
  Object.entries(designTokens.shadow).forEach(([level, value]) => {
    properties.push(`  --shadow-${level}: ${value};`);
  });
  
  Object.entries(designTokens.borderRadius).forEach(([size, value]) => {
    properties.push(`  --radius-${size}: ${value};`);
  });
  
  // Animation properties
  Object.entries(designTokens.animation.duration).forEach(([name, value]) => {
    properties.push(`  --duration-${name}: ${value};`);
  });
  
  Object.entries(designTokens.animation.easing).forEach(([name, value]) => {
    properties.push(`  --easing-${name}: ${value};`);
  });
  
  return `:root {\n${properties.join('\n')}\n}`;
}

// ============================================
// UTILITY CLASS GENERATORS
// ============================================

/**
 * Generate utility classes for design system components
 */
export function generateUtilityClasses(): string {
  const utilities: string[] = [];
  
  // Button utilities
  utilities.push(`
/* Button Component Utilities */
.btn-primary {
  @apply bg-steel-600 hover:bg-steel-700 text-white font-medium px-4 py-2 rounded-component transition-colors duration-normal;
}

.btn-secondary {
  @apply bg-machinery-100 hover:bg-machinery-200 text-machinery-800 font-medium px-4 py-2 rounded-component transition-colors duration-normal;
}

.btn-outline {
  @apply border border-steel-600 text-steel-600 hover:bg-steel-50 font-medium px-4 py-2 rounded-component transition-colors duration-normal;
}

.btn-ghost {
  @apply text-steel-600 hover:bg-steel-50 font-medium px-4 py-2 rounded-component transition-colors duration-normal;
}

.btn-danger {
  @apply bg-warning-600 hover:bg-warning-700 text-white font-medium px-4 py-2 rounded-component transition-colors duration-normal;
}
`);
  
  // Input utilities
  utilities.push(`
/* Input Component Utilities */
.input-base {
  @apply border border-machinery-300 bg-white text-machinery-900 px-3 py-2 rounded-component focus:outline-none focus:ring-2 focus:ring-steel-500 focus:border-steel-500 transition-colors duration-normal;
}

.input-error {
  @apply border-warning-500 focus:ring-warning-500 focus:border-warning-500;
}

.input-success {
  @apply border-industrial-500 focus:ring-industrial-500 focus:border-industrial-500;
}
`);
  
  // Card utilities
  utilities.push(`
/* Card Component Utilities */
.card-base {
  @apply bg-white border border-machinery-200 rounded-card shadow-base;
}

.card-elevated {
  @apply bg-white border border-machinery-200 rounded-card shadow-elevated;
}

.card-interactive {
  @apply bg-white border border-machinery-200 rounded-card shadow-base hover:shadow-md transition-shadow duration-normal cursor-pointer;
}
`);
  
  // Status utilities
  utilities.push(`
/* Status Component Utilities */
.status-success {
  @apply bg-industrial-100 text-industrial-800 border border-industrial-200;
}

.status-warning {
  @apply bg-maintenance-100 text-maintenance-800 border border-maintenance-200;
}

.status-error {
  @apply bg-warning-100 text-warning-800 border border-warning-200;
}

.status-info {
  @apply bg-steel-100 text-steel-800 border border-steel-200;
}
`);
  
  return utilities.join('\n');
}

// ============================================
// TYPESCRIPT DEFINITIONS
// ============================================

/**
 * Generate TypeScript definitions for design tokens
 */
export function generateTypeScriptDefinitions(): string {
  return `
// Design System TypeScript Definitions
// Auto-generated from professional design tokens

export interface DesignTokens {
  colors: {
    steelBlue: ColorScale;
    safetyOrange: ColorScale;
    machineryGray: ColorScale;
    industrialGreen: ColorScale;
    maintenanceYellow: ColorScale;
    warningRed: ColorScale;
  };
  spacing: Record<string, string>;
  typography: {
    fontSizes: Record<string, string>;
    fontWeights: Record<string, number>;
    lineHeights: Record<string, string>;
    letterSpacing: Record<string, string>;
  };
  effects: {
    shadows: Record<string, string>;
    borderRadius: Record<string, string>;
  };
}

export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

export interface ThemeConfig {
  mode: 'light' | 'dark';
  density: 'compact' | 'comfortable' | 'spacious';
  primaryColor: keyof DesignTokens['colors'];
  borderRadius: 'sharp' | 'rounded' | 'soft';
}

// Tailwind CSS class name types
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type InputState = 'default' | 'error' | 'success';
export type CardVariant = 'base' | 'elevated' | 'interactive';
export type StatusType = 'success' | 'warning' | 'error' | 'info';

// CSS Custom Property names
export type CSSCustomProperty = 
  | \`--color-\${string}-\${string}\`
  | \`--spacing-\${string}\`
  | \`--font-size-\${string}\`
  | \`--line-height-\${string}\`
  | \`--shadow-\${string}\`
  | \`--radius-\${string}\`
  | \`--duration-\${string}\`
  | \`--easing-\${string}\`;
`;
}

// ============================================
// EXPORTS
// ============================================

export {
  generateTailwindColors,
  generateTailwindSpacing,
  generateTailwindTypography,
  generateTailwindEffects,
  generateTailwindConfig,
  generateCSSCustomProperties,
  generateUtilityClasses,
  generateTypeScriptDefinitions,
};