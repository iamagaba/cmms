/**
 * Professional CMMS Design System - Typography System
 * 
 * This typography system is designed for maintenance management applications,
 * prioritizing readability, hierarchy, and professional appearance.
 * 
 * Typography Philosophy:
 * - Inter font family for excellent readability at all sizes
 * - Clear hierarchy with consistent scale ratios
 * - Optimized line heights for scanning and reading
 * - Professional weight distribution for industrial contexts
 */

export const fontFamilies = {
  // Geist for UI/Product - clean, neutral, highly legible
  sans: ['Geist', 'system-ui', '-apple-system', 'sans-serif'],
  // Bricolage Grotesque for Brand/Display - industrial character with personality
  display: ['"Bricolage Grotesque"', 'Geist', 'system-ui', 'sans-serif'],
  // Geist for Utility/Technical Content - consistent with UI
  utility: ['Geist', 'system-ui', 'sans-serif'],
  // Geist Mono for Technical Data/Metrics - perfect pairing with Geist Sans
  mono: ['"Geist Mono"', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
} as const;

// Semantic Tier Mapping for ease of use in Tailwind/CSS
export const fontTiers = {
  ui: fontFamilies.sans,
  brand: fontFamilies.display,
  utility: fontFamilies.utility,
  data: fontFamilies.mono,
} as const;

// ============================================
// FONT SIZES
// ============================================

/**
 * Type scale based on 1rem (16px) base with 1.25 ratio
 * Provides clear hierarchy while maintaining readability
 */
export const fontSizes = {
  // Micro text for labels and captions
  xs: {
    fontSize: '0.75rem',    // 12px
    lineHeight: '1rem',     // 16px
  },

  // Small text for secondary information
  sm: {
    fontSize: '0.875rem',   // 14px
    lineHeight: '1.25rem',  // 20px
  },

  // Base text size for body content
  base: {
    fontSize: '1rem',       // 16px
    lineHeight: '1.5rem',   // 24px
  },

  // Large text for emphasis
  lg: {
    fontSize: '1.125rem',   // 18px
    lineHeight: '1.75rem',  // 28px
  },

  // Extra large for section headers
  xl: {
    fontSize: '1.25rem',    // 20px
    lineHeight: '1.75rem',  // 28px
  },

  // 2X large for page headers
  '2xl': {
    fontSize: '1.5rem',     // 24px
    lineHeight: '2rem',     // 32px
  },

  // 3X large for major headings
  '3xl': {
    fontSize: '1.875rem',   // 30px
    lineHeight: '2.25rem',  // 36px
  },

  // 4X large for hero text
  '4xl': {
    fontSize: '2.25rem',    // 36px
    lineHeight: '2.5rem',   // 40px
  },

  // 5X large for display text
  '5xl': {
    fontSize: '3rem',       // 48px
    lineHeight: '1',        // 48px
  },
} as const;

// ============================================
// FONT WEIGHTS
// ============================================

/**
 * Font weight scale optimized for Inter font family
 * Provides clear hierarchy without being overwhelming
 */
export const fontWeights = {
  normal: 400,    // Regular text
  medium: 500,    // Emphasized text
  semibold: 600,  // Subheadings
  bold: 700,      // Headings and strong emphasis
} as const;

// ============================================
// LINE HEIGHTS
// ============================================

/**
 * Line height scale for different text contexts
 * Optimized for readability and visual rhythm
 */
export const lineHeights = {
  none: '1',
  tight: '1.25',
  snug: '1.375',
  normal: '1.5',
  relaxed: '1.625',
  loose: '2',
} as const;

// ============================================
// LETTER SPACING
// ============================================

/**
 * Letter spacing for different text styles
 * Subtle adjustments for improved readability
 */
export const letterSpacing = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0em',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
} as const;

// ============================================
// TYPOGRAPHY PRESETS
// ============================================

/**
 * Pre-configured typography styles for common use cases
 * Combines font size, weight, line height, and spacing
 */
export const typographyPresets = {
  // Display text for hero sections
  display: {
    fontFamily: fontFamilies.display,
    fontSize: fontSizes['5xl'].fontSize,
    lineHeight: fontSizes['5xl'].lineHeight,
    fontWeight: fontWeights.bold,
    letterSpacing: letterSpacing.tight,
  },

  // Main page headings
  h1: {
    fontFamily: fontFamilies.display,
    fontSize: fontSizes['3xl'].fontSize,
    lineHeight: fontSizes['3xl'].lineHeight,
    fontWeight: fontWeights.bold,
    letterSpacing: letterSpacing.tight,
  },

  // Section headings
  h2: {
    fontFamily: fontFamilies.display,
    fontSize: fontSizes['2xl'].fontSize,
    lineHeight: fontSizes['2xl'].lineHeight,
    fontWeight: fontWeights.semibold,
    letterSpacing: letterSpacing.tight,
  },

  // Subsection headings
  h3: {
    fontFamily: fontFamilies.display,
    fontSize: fontSizes.xl.fontSize,
    lineHeight: fontSizes.xl.lineHeight,
    fontWeight: fontWeights.semibold,
    letterSpacing: letterSpacing.normal,
  },

  // Component headings
  h4: {
    fontFamily: fontFamilies.display,
    fontSize: fontSizes.lg.fontSize,
    lineHeight: fontSizes.lg.lineHeight,
    fontWeight: fontWeights.semibold,
    letterSpacing: letterSpacing.normal,
  },

  // Body text - large
  bodyLarge: {
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes.lg.fontSize,
    lineHeight: fontSizes.lg.lineHeight,
    fontWeight: fontWeights.normal,
    letterSpacing: letterSpacing.normal,
  },

  // Body text - regular
  body: {
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes.base.fontSize,
    lineHeight: fontSizes.base.lineHeight,
    fontWeight: fontWeights.normal,
    letterSpacing: letterSpacing.normal,
  },

  // Body text - small
  bodySmall: {
    fontFamily: fontFamilies.utility,
    fontSize: fontSizes.sm.fontSize,
    lineHeight: fontSizes.sm.lineHeight,
    fontWeight: fontWeights.normal,
    letterSpacing: letterSpacing.normal,
  },

  // Caption text
  caption: {
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes.xs.fontSize,
    lineHeight: fontSizes.xs.lineHeight,
    fontWeight: fontWeights.normal,
    letterSpacing: letterSpacing.wide,
  },

  // Labels and form text
  label: {
    fontFamily: fontFamilies.utility,
    fontSize: fontSizes.sm.fontSize,
    lineHeight: fontSizes.sm.lineHeight,
    fontWeight: fontWeights.medium,
    letterSpacing: letterSpacing.normal,
  },

  // Button text
  button: {
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes.sm.fontSize,
    lineHeight: fontSizes.sm.lineHeight,
    fontWeight: fontWeights.medium,
    letterSpacing: letterSpacing.wide,
  },

  // Code and monospace text
  code: {
    fontFamily: fontFamilies.mono,
    fontSize: fontSizes.sm.fontSize,
    lineHeight: fontSizes.sm.lineHeight,
    fontWeight: fontWeights.normal,
    letterSpacing: letterSpacing.normal,
  },

  // Overline text (uppercase labels)
  overline: {
    fontFamily: fontFamilies.utility,
    fontSize: fontSizes.xs.fontSize,
    lineHeight: fontSizes.xs.lineHeight,
    fontWeight: fontWeights.semibold,
    letterSpacing: letterSpacing.widest,
    textTransform: 'uppercase' as const,
  },
} as const;

// ============================================
// RESPONSIVE TYPOGRAPHY
// ============================================

/**
 * Responsive typography scales for different screen sizes
 * Ensures optimal readability across devices
 */
export const responsiveTypography = {
  // Mobile typography (320px - 640px)
  mobile: {
    display: {
      fontSize: fontSizes['4xl'].fontSize,
      lineHeight: fontSizes['4xl'].lineHeight,
    },
    h1: {
      fontSize: fontSizes['2xl'].fontSize,
      lineHeight: fontSizes['2xl'].lineHeight,
    },
    h2: {
      fontSize: fontSizes.xl.fontSize,
      lineHeight: fontSizes.xl.lineHeight,
    },
    h3: {
      fontSize: fontSizes.lg.fontSize,
      lineHeight: fontSizes.lg.lineHeight,
    },
  },

  // Tablet typography (640px - 1024px)
  tablet: {
    display: {
      fontSize: fontSizes['5xl'].fontSize,
      lineHeight: fontSizes['5xl'].lineHeight,
    },
    h1: {
      fontSize: fontSizes['3xl'].fontSize,
      lineHeight: fontSizes['3xl'].lineHeight,
    },
    h2: {
      fontSize: fontSizes['2xl'].fontSize,
      lineHeight: fontSizes['2xl'].lineHeight,
    },
  },

  // Desktop typography (1024px+)
  desktop: {
    // Uses default typography presets
  },
} as const;

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Generate CSS styles from typography preset
 */
export function getTypographyStyles(preset: keyof typeof typographyPresets) {
  const styles: any = typographyPresets[preset];
  return {
    fontFamily: Array.isArray(styles.fontFamily) ? styles.fontFamily.join(', ') : styles.fontFamily,
    fontSize: styles.fontSize,
    lineHeight: styles.lineHeight,
    fontWeight: styles.fontWeight,
    letterSpacing: styles.letterSpacing,
    ...(styles.textTransform && { textTransform: styles.textTransform }),
  };
}

/**
 * Generate responsive typography CSS
 */
export function getResponsiveTypographyCSS() {
  return `
    /* Mobile typography */
    @media (max-width: 640px) {
      .text-display {
        font-size: ${responsiveTypography.mobile.display.fontSize};
        line-height: ${responsiveTypography.mobile.display.lineHeight};
      }
      .text-h1 {
        font-size: ${responsiveTypography.mobile.h1.fontSize};
        line-height: ${responsiveTypography.mobile.h1.lineHeight};
      }
      .text-h2 {
        font-size: ${responsiveTypography.mobile.h2.fontSize};
        line-height: ${responsiveTypography.mobile.h2.lineHeight};
      }
      .text-h3 {
        font-size: ${responsiveTypography.mobile.h3.fontSize};
        line-height: ${responsiveTypography.mobile.h3.lineHeight};
      }
    }
    
    /* Tablet typography */
    @media (min-width: 641px) and (max-width: 1024px) {
      .text-display {
        font-size: ${responsiveTypography.tablet.display.fontSize};
        line-height: ${responsiveTypography.tablet.display.lineHeight};
      }
      .text-h1 {
        font-size: ${responsiveTypography.tablet.h1.fontSize};
        line-height: ${responsiveTypography.tablet.h1.lineHeight};
      }
      .text-h2 {
        font-size: ${responsiveTypography.tablet.h2.fontSize};
        line-height: ${responsiveTypography.tablet.h2.lineHeight};
      }
    }
  `;
}

// ============================================
// EXPORTS
// ============================================

export const professionalTypography = {
  fontFamilies,
  fontSizes,
  fontWeights,
  lineHeights,
  letterSpacing,
  presets: typographyPresets,
  responsive: responsiveTypography,
  getStyles: getTypographyStyles,
  getResponsiveCSS: getResponsiveTypographyCSS,
} as const;

export default professionalTypography;