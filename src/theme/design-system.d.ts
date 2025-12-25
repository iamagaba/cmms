/**
 * Professional CMMS Design System - TypeScript Definitions
 * 
 * This file provides comprehensive TypeScript definitions for the design system,
 * including design tokens, component variants, and utility class names.
 * Auto-generated from professional design tokens.
 */

// ============================================
// DESIGN TOKEN INTERFACES
// ============================================

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

// ============================================
// COMPONENT VARIANT TYPES
// ============================================

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'base' | 'lg';

export type InputState = 'default' | 'error' | 'success';
export type InputSize = 'sm' | 'base' | 'lg';

export type CardVariant = 'base' | 'elevated' | 'interactive';

export type StatusType = 'success' | 'warning' | 'error' | 'info';

export type NavigationState = 'default' | 'active' | 'hover';

// ============================================
// CSS CUSTOM PROPERTY TYPES
// ============================================

export type CSSCustomProperty = 
  | `--color-${string}-${string}`
  | `--spacing-${string}`
  | `--font-size-${string}`
  | `--line-height-${string}`
  | `--shadow-${string}`
  | `--radius-${string}`
  | `--duration-${string}`
  | `--easing-${string}`;

// ============================================
// UTILITY CLASS NAME TYPES
// ============================================

// Button utility classes
export type ButtonUtilityClass = 
  | 'btn-primary'
  | 'btn-secondary'
  | 'btn-outline'
  | 'btn-ghost'
  | 'btn-danger'
  | 'btn-sm'
  | 'btn-lg';

// Input utility classes
export type InputUtilityClass = 
  | 'input-base'
  | 'input-error'
  | 'input-success';

// Card utility classes
export type CardUtilityClass = 
  | 'card-base'
  | 'card-elevated'
  | 'card-interactive';

// Status utility classes
export type StatusUtilityClass = 
  | 'status-success'
  | 'status-warning'
  | 'status-error'
  | 'status-info';

// Navigation utility classes
export type NavigationUtilityClass = 
  | 'nav-item'
  | 'nav-item-active';

// Layout utility classes
export type LayoutUtilityClass = 
  | 'page-container'
  | 'section-spacing';

// Focus utility classes
export type FocusUtilityClass = 
  | 'focus-ring'
  | 'focus-ring-error';

// Animation utility classes
export type AnimationUtilityClass = 
  | 'animate-fade-in'
  | 'animate-slide-up'
  | 'animate-scale-in';

// Combined utility class type
export type DesignSystemUtilityClass = 
  | ButtonUtilityClass
  | InputUtilityClass
  | CardUtilityClass
  | StatusUtilityClass
  | NavigationUtilityClass
  | LayoutUtilityClass
  | FocusUtilityClass
  | AnimationUtilityClass;

// ============================================
// TAILWIND COLOR TYPES
// ============================================

export type TailwindColorName = 
  | 'primary'
  | 'steel'
  | 'safety'
  | 'machinery'
  | 'industrial'
  | 'maintenance'
  | 'warning'
  | 'success'
  | 'error'
  | 'info'
  | 'alert'
  | 'surface'
  | 'gray';

export type TailwindColorShade = 
  | '50'
  | '100'
  | '200'
  | '300'
  | '400'
  | '500'
  | '600'
  | '700'
  | '800'
  | '900'
  | '950'
  | 'DEFAULT';

export type TailwindColorClass = `${TailwindColorName}-${TailwindColorShade}`;

// ============================================
// COMPONENT PROP INTERFACES
// ============================================

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export interface InputProps {
  state?: InputState;
  size?: InputSize;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
  required?: boolean;
}

export interface CardProps {
  variant?: CardVariant;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export interface StatusBadgeProps {
  type: StatusType;
  children: React.ReactNode;
  className?: string;
}

// ============================================
// THEME CONTEXT TYPES
// ============================================

export interface ThemeContextValue {
  config: ThemeConfig;
  updateConfig: (config: Partial<ThemeConfig>) => void;
  tokens: DesignTokens;
  cssProperties: Record<string, string>;
}

// ============================================
// DESIGN SYSTEM CONFIGURATION
// ============================================

export interface DesignSystemConfig {
  theme: ThemeConfig;
  customTokens?: Partial<DesignTokens>;
  utilityClasses?: Record<string, string>;
  breakpoints?: Record<string, string>;
}

// ============================================
// VALIDATION TYPES
// ============================================

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface TokenValidationOptions {
  checkContrast?: boolean;
  checkAccessibility?: boolean;
  checkConsistency?: boolean;
}

// ============================================
// MIGRATION TYPES
// ============================================

export interface MigrationStep {
  id: string;
  name: string;
  description: string;
  completed: boolean;
  optional: boolean;
}

export interface MigrationPlan {
  steps: MigrationStep[];
  currentStep: number;
  totalSteps: number;
}

// ============================================
// UTILITY FUNCTION TYPES
// ============================================

export type GetTokenFunction = (path: string) => any;
export type ValidateTokensFunction = () => ValidationResult;
export type ApplyThemeConfigFunction = (config: Partial<ThemeConfig>) => DesignTokens;
export type GenerateCSSPropertiesFunction = (tokens: DesignTokens) => string;

// ============================================
// MODULE AUGMENTATION FOR TAILWIND
// ============================================

declare module 'tailwindcss/types/config' {
  interface CustomThemeConfig {
    designSystem?: DesignSystemConfig;
  }
}

// ============================================
// EXPORTS
// ============================================

export {
  type DesignTokens,
  type ColorScale,
  type ThemeConfig,
  type ButtonVariant,
  type ButtonSize,
  type InputState,
  type InputSize,
  type CardVariant,
  type StatusType,
  type NavigationState,
  type CSSCustomProperty,
  type DesignSystemUtilityClass,
  type TailwindColorClass,
  type ThemeContextValue,
  type DesignSystemConfig,
  type ValidationResult,
  type MigrationPlan,
};