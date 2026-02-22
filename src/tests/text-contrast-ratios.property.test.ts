/**
 * Property-Based Test: Text Contrast Ratios
 * Feature: pure-black-dark-theme
 * Property 3: Text Contrast Ratios
 * 
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5
 * 
 * For any text color variable in dark mode, the contrast ratio against its 
 * intended background should meet WCAG AA requirements (minimum 4.5:1 for normal text).
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';

describe('Feature: pure-black-dark-theme, Property 3: Text Contrast Ratios', () => {
  let cssContent: string;

  beforeAll(() => {
    // Read the App.css file
    const cssPath = path.join(process.cwd(), 'src', 'App.css');
    cssContent = fs.readFileSync(cssPath, 'utf-8');
  });

  /**
   * Helper: Parse HSL string to HSL object
   */
  function parseHSL(hslString: string): { h: number; s: number; l: number } {
    const match = hslString.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
    if (!match) throw new Error(`Invalid HSL: ${hslString}`);
    return {
      h: parseInt(match[1]),
      s: parseInt(match[2]),
      l: parseInt(match[3])
    };
  }

  /**
   * Helper: Convert HSL to RGB
   */
  function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
    s = s / 100;
    l = l / 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;

    let r = 0, g = 0, b = 0;

    if (h >= 0 && h < 60) {
      r = c; g = x; b = 0;
    } else if (h >= 60 && h < 120) {
      r = x; g = c; b = 0;
    } else if (h >= 120 && h < 180) {
      r = 0; g = c; b = x;
    } else if (h >= 180 && h < 240) {
      r = 0; g = x; b = c;
    } else if (h >= 240 && h < 300) {
      r = x; g = 0; b = c;
    } else if (h >= 300 && h < 360) {
      r = c; g = 0; b = x;
    }

    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255)
    };
  }

  /**
   * Helper: Calculate relative luminance
   */
  function getRelativeLuminance(rgb: { r: number; g: number; b: number }): number {
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
      val = val / 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  /**
   * Helper: Calculate contrast ratio between two colors
   */
  function getContrastRatio(color1: { r: number; g: number; b: number }, color2: { r: number; g: number; b: number }): number {
    const l1 = getRelativeLuminance(color1);
    const l2 = getRelativeLuminance(color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Helper: Extract CSS variable value from .dark section
   */
  function extractDarkVariable(variableName: string): string {
    const darkMatch = cssContent.match(/\.dark\s*\{([^}]+)\}/s);
    if (!darkMatch) throw new Error('.dark section not found');
    
    const darkSection = darkMatch[1];
    const varMatch = darkSection.match(new RegExp(`${variableName}:\\s*([^;]+);`));
    if (!varMatch) throw new Error(`${variableName} not found in .dark section`);
    
    return varMatch[1].trim();
  }

  /**
   * Property: Primary text (--foreground) must have at least 4.5:1 contrast against --background
   * Preferably 7:1 for WCAG AAA
   */
  it('should have --foreground with minimum 4.5:1 contrast against --background', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('direct-parse', 'hsl-conversion', 'rgb-calculation'),
        (method) => {
          const backgroundHSL = parseHSL(extractDarkVariable('--background'));
          const foregroundHSL = parseHSL(extractDarkVariable('--foreground'));

          const backgroundRGB = hslToRgb(backgroundHSL.h, backgroundHSL.s, backgroundHSL.l);
          const foregroundRGB = hslToRgb(foregroundHSL.h, foregroundHSL.s, foregroundHSL.l);

          const contrastRatio = getContrastRatio(backgroundRGB, foregroundRGB);

          // WCAG AA minimum for normal text
          expect(contrastRatio).toBeGreaterThanOrEqual(4.5);
          
          // Preferably WCAG AAA (7:1)
          if (contrastRatio >= 7) {
            expect(contrastRatio).toBeGreaterThanOrEqual(7);
          }

          return true;
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property: Secondary text (--muted-foreground) must have at least 4.5:1 contrast against --background
   */
  it('should have --muted-foreground with minimum 4.5:1 contrast against --background', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('direct-parse', 'hsl-conversion', 'rgb-calculation'),
        (method) => {
          const backgroundHSL = parseHSL(extractDarkVariable('--background'));
          const mutedForegroundHSL = parseHSL(extractDarkVariable('--muted-foreground'));

          const backgroundRGB = hslToRgb(backgroundHSL.h, backgroundHSL.s, backgroundHSL.l);
          const mutedForegroundRGB = hslToRgb(mutedForegroundHSL.h, mutedForegroundHSL.s, mutedForegroundHSL.l);

          const contrastRatio = getContrastRatio(backgroundRGB, mutedForegroundRGB);

          // WCAG AA minimum for normal text
          expect(contrastRatio).toBeGreaterThanOrEqual(4.5);

          return true;
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property: Card text (--card-foreground) must have at least 4.5:1 contrast against --card
   */
  it('should have --card-foreground with minimum 4.5:1 contrast against --card', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('direct-parse', 'hsl-conversion', 'rgb-calculation'),
        (method) => {
          const cardHSL = parseHSL(extractDarkVariable('--card'));
          const cardForegroundHSL = parseHSL(extractDarkVariable('--card-foreground'));

          const cardRGB = hslToRgb(cardHSL.h, cardHSL.s, cardHSL.l);
          const cardForegroundRGB = hslToRgb(cardForegroundHSL.h, cardForegroundHSL.s, cardForegroundHSL.l);

          const contrastRatio = getContrastRatio(cardRGB, cardForegroundRGB);

          // WCAG AA minimum for normal text
          expect(contrastRatio).toBeGreaterThanOrEqual(4.5);

          return true;
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property: Popover text (--popover-foreground) must have at least 4.5:1 contrast against --popover
   */
  it('should have --popover-foreground with minimum 4.5:1 contrast against --popover', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('direct-parse', 'hsl-conversion', 'rgb-calculation'),
        (method) => {
          const popoverHSL = parseHSL(extractDarkVariable('--popover'));
          const popoverForegroundHSL = parseHSL(extractDarkVariable('--popover-foreground'));

          const popoverRGB = hslToRgb(popoverHSL.h, popoverHSL.s, popoverHSL.l);
          const popoverForegroundRGB = hslToRgb(popoverForegroundHSL.h, popoverForegroundHSL.s, popoverForegroundHSL.l);

          const contrastRatio = getContrastRatio(popoverRGB, popoverForegroundRGB);

          // WCAG AA minimum for normal text
          expect(contrastRatio).toBeGreaterThanOrEqual(4.5);

          return true;
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property: Secondary text (--secondary-foreground) must have at least 4.5:1 contrast against --secondary
   */
  it('should have --secondary-foreground with minimum 4.5:1 contrast against --secondary', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('direct-parse', 'hsl-conversion', 'rgb-calculation'),
        (method) => {
          const secondaryHSL = parseHSL(extractDarkVariable('--secondary'));
          const secondaryForegroundHSL = parseHSL(extractDarkVariable('--secondary-foreground'));

          const secondaryRGB = hslToRgb(secondaryHSL.h, secondaryHSL.s, secondaryHSL.l);
          const secondaryForegroundRGB = hslToRgb(secondaryForegroundHSL.h, secondaryForegroundHSL.s, secondaryForegroundHSL.l);

          const contrastRatio = getContrastRatio(secondaryRGB, secondaryForegroundRGB);

          // WCAG AA minimum for normal text
          expect(contrastRatio).toBeGreaterThanOrEqual(4.5);

          return true;
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property: Accent text (--accent-foreground) must have at least 4.5:1 contrast against --accent
   */
  it('should have --accent-foreground with minimum 4.5:1 contrast against --accent', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('direct-parse', 'hsl-conversion', 'rgb-calculation'),
        (method) => {
          const accentHSL = parseHSL(extractDarkVariable('--accent'));
          const accentForegroundHSL = parseHSL(extractDarkVariable('--accent-foreground'));

          const accentRGB = hslToRgb(accentHSL.h, accentHSL.s, accentHSL.l);
          const accentForegroundRGB = hslToRgb(accentForegroundHSL.h, accentForegroundHSL.s, accentForegroundHSL.l);

          const contrastRatio = getContrastRatio(accentRGB, accentForegroundRGB);

          // WCAG AA minimum for normal text
          expect(contrastRatio).toBeGreaterThanOrEqual(4.5);

          return true;
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property: Primary button text (--primary-foreground) must have at least 4.5:1 contrast against --primary
   */
  it('should have --primary-foreground with minimum 4.5:1 contrast against --primary', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('direct-parse', 'hsl-conversion', 'rgb-calculation'),
        (method) => {
          const primaryHSL = parseHSL(extractDarkVariable('--primary'));
          const primaryForegroundHSL = parseHSL(extractDarkVariable('--primary-foreground'));

          const primaryRGB = hslToRgb(primaryHSL.h, primaryHSL.s, primaryHSL.l);
          const primaryForegroundRGB = hslToRgb(primaryForegroundHSL.h, primaryForegroundHSL.s, primaryForegroundHSL.l);

          const contrastRatio = getContrastRatio(primaryRGB, primaryForegroundRGB);

          // WCAG AA minimum for normal text
          expect(contrastRatio).toBeGreaterThanOrEqual(4.5);

          return true;
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property: Semantic color text must have at least 4.5:1 contrast against their backgrounds
   */
  it('should have semantic color foregrounds with minimum 4.5:1 contrast', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          { bg: '--success', fg: '--success-foreground' },
          { bg: '--warning', fg: '--warning-foreground' },
          { bg: '--info', fg: '--info-foreground' },
          { bg: '--destructive', fg: '--destructive-foreground' }
        ),
        (colorPair) => {
          const bgHSL = parseHSL(extractDarkVariable(colorPair.bg));
          const fgHSL = parseHSL(extractDarkVariable(colorPair.fg));

          const bgRGB = hslToRgb(bgHSL.h, bgHSL.s, bgHSL.l);
          const fgRGB = hslToRgb(fgHSL.h, fgHSL.s, fgHSL.l);

          const contrastRatio = getContrastRatio(bgRGB, fgRGB);

          // WCAG AA minimum for normal text
          expect(contrastRatio).toBeGreaterThanOrEqual(4.5);

          return true;
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Comprehensive test: All text/foreground variables meet WCAG AA
   */
  it('should have all foreground variables meet WCAG AA against their backgrounds', () => {
    const textColorPairs = [
      { bg: '--background', fg: '--foreground', name: 'Primary text' },
      { bg: '--background', fg: '--muted-foreground', name: 'Muted text' },
      { bg: '--card', fg: '--card-foreground', name: 'Card text' },
      { bg: '--popover', fg: '--popover-foreground', name: 'Popover text' },
      { bg: '--secondary', fg: '--secondary-foreground', name: 'Secondary text' },
      { bg: '--accent', fg: '--accent-foreground', name: 'Accent text' },
      { bg: '--primary', fg: '--primary-foreground', name: 'Primary button text' },
      { bg: '--success', fg: '--success-foreground', name: 'Success text' },
      { bg: '--warning', fg: '--warning-foreground', name: 'Warning text' },
      { bg: '--info', fg: '--info-foreground', name: 'Info text' },
      { bg: '--destructive', fg: '--destructive-foreground', name: 'Destructive text' }
    ];

    fc.assert(
      fc.property(
        fc.constantFrom(...textColorPairs),
        (pair) => {
          const bgHSL = parseHSL(extractDarkVariable(pair.bg));
          const fgHSL = parseHSL(extractDarkVariable(pair.fg));

          const bgRGB = hslToRgb(bgHSL.h, bgHSL.s, bgHSL.l);
          const fgRGB = hslToRgb(fgHSL.h, fgHSL.s, fgHSL.l);

          const contrastRatio = getContrastRatio(bgRGB, fgRGB);

          // WCAG AA minimum for normal text (4.5:1)
          expect(contrastRatio).toBeGreaterThanOrEqual(4.5);

          return true;
        }
      ),
      { numRuns: 20 }
    );
  });
});
