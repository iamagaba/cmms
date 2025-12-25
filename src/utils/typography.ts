/**
 * Typography utility system for consistent text styling across the app
 */

export const fontSizes = {
  xs: '12px',      // Caption, small labels
  sm: '13px',      // Small text, secondary info
  base: '14px',    // Body text, default
  md: '16px',      // Emphasis, large body
  lg: '18px',      // Subtitles, section headers
  xl: '20px',      // Card titles, page subtitles
  '2xl': '24px',   // Page titles, headings
  '3xl': '28px',   // Large headings
  '4xl': '32px',   // Display text, hero numbers
} as const;

export const fontWeights = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

export const lineHeights = {
  tight: 1.2,      // Headings, numbers, compact text
  normal: 1.5,     // Body text, default
  relaxed: 1.75,   // Long-form content, descriptions
} as const;

export const letterSpacing = {
  tight: '-0.5px',   // Large headings, numbers
  normal: '0',       // Default
  wide: '0.5px',     // All caps, labels
} as const;

/**
 * Typography presets for common use cases
 */
export const typographyPresets = {
  // Display text (hero sections, large numbers)
  display: {
    fontSize: fontSizes['4xl'],
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.tight,
    letterSpacing: letterSpacing.tight,
  },
  
  // Page titles
  h1: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.tight,
    letterSpacing: letterSpacing.normal,
  },
  
  // Section headings
  h2: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.tight,
    letterSpacing: letterSpacing.normal,
  },
  
  // Card titles, subsection headings
  h3: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacing.normal,
  },
  
  // Small headings
  h4: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacing.normal,
  },
  
  // Body text (large)
  bodyLarge: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacing.normal,
  },
  
  // Body text (default)
  body: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacing.normal,
  },
  
  // Body text (small)
  bodySmall: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacing.normal,
  },
  
  // Caption text
  caption: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacing.normal,
  },
  
  // Labels
  label: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacing.normal,
  },
  
  // Button text
  button: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacing.normal,
  },
  
  // Code/monospace
  code: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacing.normal,
    fontFamily: 'monospace',
  },
} as const;

/**
 * Get typography styles for a specific preset
 */
export function getTypographyStyles(preset: keyof typeof typographyPresets): React.CSSProperties {
  return typographyPresets[preset];
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(maxLines: number = 1): React.CSSProperties {
  if (maxLines === 1) {
    return {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    };
  }
  
  return {
    display: '-webkit-box',
    WebkitLineClamp: maxLines,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };
}

/**
 * Responsive font size helper
 */
export function responsiveFontSize(
  mobile: keyof typeof fontSizes,
  desktop: keyof typeof fontSizes
): string {
  return `clamp(${fontSizes[mobile]}, 2vw, ${fontSizes[desktop]})`;
}
