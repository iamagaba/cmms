# Design Tokens Reference

Design tokens are the visual design atoms of the Professional CMMS Design System. They provide a consistent foundation for all visual elements and enable systematic theming and customization.

## Token Architecture

The design system follows a three-tier token architecture:

```
Primitive Tokens → Semantic Tokens → Component Tokens → Components
```

### Primitive Tokens
Base values that define the raw materials of the design system.

### Semantic Tokens
Contextual meanings applied to primitive tokens for specific purposes.

### Component Tokens
Component-specific values that reference semantic tokens.

## Color Tokens

### Primary Colors

#### Steel Blue
Industrial-inspired primary color representing strength and reliability.

```typescript
export const steelBlue = {
  50: '#f0f9ff',   // Lightest tint
  100: '#e0f2fe',
  200: '#bae6fd',
  300: '#7dd3fc',
  400: '#38bdf8',
  500: '#0ea5e9',  // Base color
  600: '#0284c7',  // Primary brand color
  700: '#0369a1',
  800: '#075985',
  900: '#0c4a6e',  // Darkest shade
  950: '#082f49',  // Ultra dark
};
```

**Usage:**
- Primary buttons and CTAs
- Active navigation states
- Focus indicators
- Brand elements

#### Safety Orange
High-visibility accent color for important actions and alerts.

```typescript
export const safetyOrange = {
  50: '#fff7ed',
  100: '#ffedd5',
  200: '#fed7aa',
  300: '#fdba74',
  400: '#fb923c',
  500: '#f97316',  // Base color
  600: '#ea580c',  // Primary accent
  700: '#c2410c',
  800: '#9a3412',
  900: '#7c2d12',
  950: '#431407',
};
```

**Usage:**
- Warning alerts
- Important notifications
- Emergency actions
- Accent elements

### Neutral Colors

#### Machinery Gray
Professional grays inspired by industrial machinery and equipment.

```typescript
export const machineryGray = {
  50: '#f8fafc',   // Lightest backgrounds
  100: '#f1f5f9',  // Light backgrounds
  200: '#e2e8f0',  // Borders, dividers
  300: '#cbd5e1',  // Disabled states
  400: '#94a3b8',  // Placeholders
  500: '#64748b',  // Secondary text
  600: '#475569',  // Primary text
  700: '#334155',  // Headings
  800: '#1e293b',  // Dark text
  900: '#0f172a',  // Darkest text
  950: '#020617',  // Ultra dark
};
```

**Usage:**
- Text colors
- Background colors
- Borders and dividers
- Disabled states

### Status Colors

#### Success Green
Positive states and successful operations.

```typescript
export const successGreen = {
  50: '#f0fdf4',
  100: '#dcfce7',
  200: '#bbf7d0',
  300: '#86efac',
  400: '#4ade80',
  500: '#22c55e',  // Base success
  600: '#16a34a',  // Primary success
  700: '#15803d',
  800: '#166534',
  900: '#14532d',
  950: '#052e16',
};
```

#### Warning Red
Error states and destructive actions.

```typescript
export const warningRed = {
  50: '#fef2f2',
  100: '#fee2e2',
  200: '#fecaca',
  300: '#fca5a5',
  400: '#f87171',
  500: '#ef4444',  // Base error
  600: '#dc2626',  // Primary error
  700: '#b91c1c',
  800: '#991b1b',
  900: '#7f1d1d',
  950: '#450a0a',
};
```

#### Maintenance Yellow
Caution states and maintenance-related indicators.

```typescript
export const maintenanceYellow = {
  50: '#fefce8',
  100: '#fef9c3',
  200: '#fef08a',
  300: '#fde047',
  400: '#facc15',
  500: '#eab308',  // Base warning
  600: '#ca8a04',  // Primary warning
  700: '#a16207',
  800: '#854d0e',
  900: '#713f12',
  950: '#422006',
};
```

## Typography Tokens

### Font Families

```typescript
export const fontFamilies = {
  primary: [
    'Inter',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Oxygen',
    'Ubuntu',
    'Cantarell',
    'sans-serif'
  ],
  mono: [
    'JetBrains Mono',
    'Fira Code',
    'Monaco',
    'Consolas',
    'Liberation Mono',
    'Courier New',
    'monospace'
  ],
};
```

### Font Sizes

```typescript
export const fontSizes = {
  xs: {
    fontSize: '0.75rem',    // 12px
    lineHeight: '1rem',     // 16px
    letterSpacing: '0.025em',
  },
  sm: {
    fontSize: '0.875rem',   // 14px
    lineHeight: '1.25rem',  // 20px
    letterSpacing: '0.025em',
  },
  base: {
    fontSize: '1rem',       // 16px
    lineHeight: '1.5rem',   // 24px
    letterSpacing: '0',
  },
  lg: {
    fontSize: '1.125rem',   // 18px
    lineHeight: '1.75rem',  // 28px
    letterSpacing: '-0.025em',
  },
  xl: {
    fontSize: '1.25rem',    // 20px
    lineHeight: '1.75rem',  // 28px
    letterSpacing: '-0.025em',
  },
  '2xl': {
    fontSize: '1.5rem',     // 24px
    lineHeight: '2rem',     // 32px
    letterSpacing: '-0.025em',
  },
  '3xl': {
    fontSize: '1.875rem',   // 30px
    lineHeight: '2.25rem',  // 36px
    letterSpacing: '-0.025em',
  },
  '4xl': {
    fontSize: '2.25rem',    // 36px
    lineHeight: '2.5rem',   // 40px
    letterSpacing: '-0.025em',
  },
};
```

### Font Weights

```typescript
export const fontWeights = {
  normal: 400,    // Regular text
  medium: 500,    // Emphasized text
  semibold: 600,  // Subheadings
  bold: 700,      // Headings
};
```

### Typography Presets

```typescript
export const typographyPresets = {
  // Headings
  h1: {
    ...fontSizes['4xl'],
    fontWeight: fontWeights.bold,
    fontFamily: fontFamilies.primary,
  },
  h2: {
    ...fontSizes['3xl'],
    fontWeight: fontWeights.bold,
    fontFamily: fontFamilies.primary,
  },
  h3: {
    ...fontSizes['2xl'],
    fontWeight: fontWeights.semibold,
    fontFamily: fontFamilies.primary,
  },
  h4: {
    ...fontSizes.xl,
    fontWeight: fontWeights.semibold,
    fontFamily: fontFamilies.primary,
  },
  
  // Body text
  body: {
    ...fontSizes.base,
    fontWeight: fontWeights.normal,
    fontFamily: fontFamilies.primary,
  },
  bodyLarge: {
    ...fontSizes.lg,
    fontWeight: fontWeights.normal,
    fontFamily: fontFamilies.primary,
  },
  bodySmall: {
    ...fontSizes.sm,
    fontWeight: fontWeights.normal,
    fontFamily: fontFamilies.primary,
  },
  
  // UI elements
  button: {
    ...fontSizes.sm,
    fontWeight: fontWeights.medium,
    fontFamily: fontFamilies.primary,
  },
  caption: {
    ...fontSizes.xs,
    fontWeight: fontWeights.normal,
    fontFamily: fontFamilies.primary,
  },
  label: {
    ...fontSizes.sm,
    fontWeight: fontWeights.medium,
    fontFamily: fontFamilies.primary,
  },
};
```

## Spacing Tokens

### Base Scale

The spacing system is based on a 4px grid for consistent rhythm and alignment.

```typescript
export const spacingScale = {
  0: '0px',
  px: '1px',
  0.5: '2px',   // 0.5 × 4px
  1: '4px',     // 1 × 4px
  1.5: '6px',   // 1.5 × 4px
  2: '8px',     // 2 × 4px
  2.5: '10px',  // 2.5 × 4px
  3: '12px',    // 3 × 4px
  3.5: '14px',  // 3.5 × 4px
  4: '16px',    // 4 × 4px (base unit)
  5: '20px',    // 5 × 4px
  6: '24px',    // 6 × 4px
  7: '28px',    // 7 × 4px
  8: '32px',    // 8 × 4px
  9: '36px',    // 9 × 4px
  10: '40px',   // 10 × 4px
  11: '44px',   // 11 × 4px (min touch target)
  12: '48px',   // 12 × 4px
  14: '56px',   // 14 × 4px
  16: '64px',   // 16 × 4px
  20: '80px',   // 20 × 4px
  24: '96px',   // 24 × 4px
  28: '112px',  // 28 × 4px
  32: '128px',  // 32 × 4px
  36: '144px',  // 36 × 4px
  40: '160px',  // 40 × 4px
  44: '176px',  // 44 × 4px
  48: '192px',  // 48 × 4px
  52: '208px',  // 52 × 4px
  56: '224px',  // 56 × 4px
  60: '240px',  // 60 × 4px
  64: '256px',  // 64 × 4px
  72: '288px',  // 72 × 4px
  80: '320px',  // 80 × 4px
  96: '384px',  // 96 × 4px
};
```

### Semantic Spacing

```typescript
export const semanticSpacing = {
  // Base measurements
  base: spacingScale[4],        // 16px - Base unit
  tight: spacingScale[2],       // 8px - Tight spacing
  loose: spacingScale[6],       // 24px - Loose spacing
  
  // Component spacing
  componentPadding: {
    sm: spacingScale[2],        // 8px
    md: spacingScale[4],        // 16px
    lg: spacingScale[6],        // 24px
  },
  
  // Layout spacing
  sectionGap: spacingScale[8],  // 32px
  pageMargin: spacingScale[6],  // 24px
  containerPadding: spacingScale[4], // 16px
  
  // Interactive elements
  buttonPadding: {
    sm: `${spacingScale[2]} ${spacingScale[3]}`, // 8px 12px
    md: `${spacingScale[3]} ${spacingScale[4]}`, // 12px 16px
    lg: `${spacingScale[4]} ${spacingScale[6]}`, // 16px 24px
  },
  
  inputPadding: spacingScale[3], // 12px
  
  // Touch targets
  minTouchTarget: spacingScale[11], // 44px
  touchTargetSpacing: spacingScale[2], // 8px
};
```

### Responsive Spacing

```typescript
export const responsiveSpacing = {
  // Container padding by breakpoint
  containerPadding: {
    sm: spacingScale[4],   // 16px on mobile
    md: spacingScale[6],   // 24px on tablet
    lg: spacingScale[8],   // 32px on desktop
  },
  
  // Section gaps by breakpoint
  sectionGap: {
    sm: spacingScale[6],   // 24px on mobile
    md: spacingScale[8],   // 32px on tablet
    lg: spacingScale[12],  // 48px on desktop
  },
};
```

## Shadow Tokens

### Elevation System

```typescript
export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
};
```

### Semantic Shadows

```typescript
export const semanticShadows = {
  card: shadows.sm,
  cardHover: shadows.md,
  modal: shadows.xl,
  dropdown: shadows.lg,
  tooltip: shadows.base,
  focus: '0 0 0 3px rgb(59 130 246 / 0.5)', // Steel blue focus ring
};
```

## Border Radius Tokens

```typescript
export const borderRadius = {
  none: '0px',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',   // Fully rounded
};
```

## Animation Tokens

### Duration

```typescript
export const animationDuration = {
  fast: '150ms',
  base: '200ms',
  slow: '300ms',
  slower: '500ms',
};
```

### Easing

```typescript
export const animationEasing = {
  linear: 'linear',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
};
```

## Usage Guidelines

### Accessing Tokens

```typescript
import { 
  professionalColors,
  professionalTypography,
  professionalSpacing 
} from '@/theme';

// Use in components
const buttonStyles = {
  backgroundColor: professionalColors.steelBlue[600],
  color: professionalColors.white,
  padding: professionalSpacing.semantic.buttonPadding.md,
  fontSize: professionalTypography.fontSizes.sm.fontSize,
  borderRadius: borderRadius.md,
};
```

### CSS Custom Properties

```css
:root {
  /* Colors */
  --color-primary-50: #f0f9ff;
  --color-primary-600: #0284c7;
  --color-primary-900: #0c4a6e;
  
  /* Spacing */
  --spacing-1: 4px;
  --spacing-4: 16px;
  --spacing-8: 32px;
  
  /* Typography */
  --font-size-sm: 0.875rem;
  --line-height-sm: 1.25rem;
}

/* Use in CSS */
.button {
  background-color: var(--color-primary-600);
  padding: var(--spacing-3) var(--spacing-4);
  font-size: var(--font-size-sm);
}
```

### Tailwind Integration

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        steel: {
          50: '#f0f9ff',
          600: '#0284c7',
          900: '#0c4a6e',
        },
      },
      spacing: {
        '1': '4px',
        '4': '16px',
        '8': '32px',
      },
      fontSize: {
        'sm': ['0.875rem', '1.25rem'],
        'base': ['1rem', '1.5rem'],
      },
    },
  },
};
```

## Token Validation

### Type Safety

```typescript
// Ensure type safety with TypeScript
type ColorScale = {
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
};

type SpacingValue = string;
type FontSize = {
  fontSize: string;
  lineHeight: string;
  letterSpacing?: string;
};
```

### Runtime Validation

```typescript
export function validateDesignTokens(): boolean {
  // Validate color scales
  const requiredColorStops = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
  
  for (const [colorName, colorScale] of Object.entries(professionalColors)) {
    if (typeof colorScale === 'object') {
      for (const stop of requiredColorStops) {
        if (!colorScale[stop]) {
          console.error(`Missing color stop ${stop} in ${colorName}`);
          return false;
        }
      }
    }
  }
  
  // Validate spacing scale
  const requiredSpacingStops = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24];
  
  for (const stop of requiredSpacingStops) {
    if (!professionalSpacing.scale[stop]) {
      console.error(`Missing spacing stop ${stop}`);
      return false;
    }
  }
  
  return true;
}
```

## Migration Guide

### From Hardcoded Values

```typescript
// Before
const oldStyles = {
  color: '#0284c7',
  padding: '12px 16px',
  fontSize: '14px',
};

// After
const newStyles = {
  color: professionalColors.steelBlue[600],
  padding: professionalSpacing.semantic.buttonPadding.md,
  fontSize: professionalTypography.fontSizes.sm.fontSize,
};
```

### From Other Design Systems

```typescript
// From Material-UI
const muiButton = {
  color: theme.palette.primary.main,
  padding: theme.spacing(1, 2),
};

// To Professional CMMS
const cmmsButton = {
  color: professionalColors.steelBlue[600],
  padding: professionalSpacing.semantic.buttonPadding.md,
};
```