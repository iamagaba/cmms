// ============================================
// PROFESSIONAL CMMS DESIGN SYSTEM
// ============================================

// Professional Design System - Primary Exports
export {
  designTokens as professionalDesignTokens,
  getToken,
  createCSSCustomProperties,
  validateTokens,
  applyThemeConfig,
  type ThemeConfig,
  defaultThemeConfig,
} from './professional-design-tokens';

// Tailwind CSS Integration
export {
  generateTailwindColors,
  generateTailwindSpacing,
  generateTailwindTypography,
  generateTailwindEffects,
  generateTailwindConfig,
  generateCSSCustomProperties,
  generateUtilityClasses,
  generateTypeScriptDefinitions,
} from './tailwind-integration';

// Design System Types
export type {
  DesignTokens,
  ColorScale,
  ButtonVariant,
  ButtonSize,
  InputState,
  InputSize,
  CardVariant,
  StatusType,
  NavigationState,
  CSSCustomProperty,
  DesignSystemUtilityClass,
  TailwindColorClass,
  ThemeContextValue,
  DesignSystemConfig,
  ValidationResult,
  MigrationPlan,
} from './design-system.d';

// Professional Color System
export {
  professionalColors,
  steelBlue,
  safetyOrange,
  machineryGray,
  industrialGreen,
  warningRed,
  maintenanceYellow,
} from './professional-colors';

// Professional Typography System
export {
  professionalTypography,
  getTypographyStyles,
  getResponsiveTypographyCSS,
} from './professional-typography';

// Professional Spacing System
export {
  professionalSpacing,
  getSpacing,
  getSemanticSpacing,
  getComponentSpacing,
  createResponsiveSpacingCSS,
  createDensitySpacingCSS,
} from './professional-spacing';

// Animation and Visual Effects
export {
  animationTokens,
  borderRadiusTokens,
  shadowTokens,
  zIndexTokens,
  breakpointTokens,
  sizeTokens,
} from './professional-design-tokens';

// Export Palette (if needed for backward compact, checking palette.ts content first is wise but retaining it is safer than breaking if used)
export { palette, brand } from './palette';