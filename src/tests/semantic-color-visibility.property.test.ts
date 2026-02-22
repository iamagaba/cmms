/**
 * Property-Based Test: Semantic Color Visibility
 * Feature: pure-black-dark-theme
 * Property 7: Semantic Color Visibility
 * 
 * Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5
 * 
 * For any semantic status color (--success, --warning, --info, --destructive) 
 * in dark mode, the contrast ratio against pure black should be at least 3:1.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';

describe('Feature: pure-black-dark-theme, Property 7: Semantic Color Visibility', () => {
  let cssContent: string;

  beforeAll(() => {
    // Read the App.css file
    const cssPath = path.join(process.cwd(), 'src', 'App.css');
    cssContent = fs.readFileSync(cssPath, 'utf-8');
  });

  /**
   * Helper function to extract a CSS variable value from the .dark section
   */
  function extractDarkVariable(variableName: string): string {
    const darkMatch = cssContent.match(/\.dark\s*\{([^}]+)\}/s);
    if (!darkMatch) {
      throw new Error('.dark section not found in CSS');
    }
    
    const darkSection = darkMatch[1];
    const varMatch = darkSection.match(new RegExp(`${variableName}:\\s*([^;]+);`));
    if (!varMatch) {
      throw new Error(`${variableName} not found in .dark section`);
    }
    
    return varMatch[1].trim();
  }

  /**
   * Helper function to parse HSL string to components
   */
  function parseHSL(hslString: string): { h: number; s: number; l: number } {
    const match = hslString.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
    if (!match) {
      throw new Error(`Invalid HSL format: ${hslString}`);
    }
    return {
      h: parseInt(match[1]),
      s: parseInt(match[2]),
      l: parseInt(match[3])
    };
  }

  /**
   * Helper function to convert HSL to RGB
   */
  function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
    // Normalize values
    h = h / 360;
    s = s / 100;
    l = l / 100;

    let r, g, b;

    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }

  /**
   * Helper function to calculate relative luminance
   */
  function getRelativeLuminance(rgb: { r: number; g: number; b: number }): number {
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
      val = val / 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  /**
   * Helper function to calculate contrast ratio between two colors
   */
  function getContrastRatio(
    color1: { r: number; g: number; b: number },
    color2: { r: number; g: number; b: number }
  ): number {
    const l1 = getRelativeLuminance(color1);
    const l2 = getRelativeLuminance(color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Property: All semantic status colors should have at least 3:1 contrast against pure black
   * 
   * This property test verifies that all semantic colors (success, warning, info, destructive)
   * meet WCAG AA requirements for UI components (minimum 3:1 contrast ratio).
   */
  it('should have all semantic colors with at least 3:1 contrast ratio against pure black', () => {
    fc.assert(
      fc.property(
        // Test all semantic color variables
        fc.constantFrom(
          '--success',
          '--warning',
          '--info',
          '--destructive'
        ),
        (semanticColorVar) => {
          const colorValue = extractDarkVariable(semanticColorVar);
          const colorHSL = parseHSL(colorValue);
          const colorRGB = hslToRgb(colorHSL.h, colorHSL.s, colorHSL.l);
          
          // Pure black RGB
          const pureBlack = { r: 0, g: 0, b: 0 };
          
          const contrastRatio = getContrastRatio(colorRGB, pureBlack);
          
          // Property assertion: contrast ratio must be at least 3:1 (WCAG AA for UI components)
          expect(contrastRatio).toBeGreaterThanOrEqual(3.0);
          
          return true;
        }
      ),
      { numRuns: 20 } // Use 20 iterations as specified
    );
  });

  /**
   * Test: Success color should be clearly visible on pure black
   * Validates: Requirement 7.3
   */
  it('should have --success with sufficient brightness for visibility', () => {
    fc.assert(
      fc.property(
        fc.constant(null),
        () => {
          const successValue = extractDarkVariable('--success');
          const successHSL = parseHSL(successValue);
          const successRGB = hslToRgb(successHSL.h, successHSL.s, successHSL.l);
          const pureBlack = { r: 0, g: 0, b: 0 };
          
          const contrastRatio = getContrastRatio(successRGB, pureBlack);
          
          // Success green should have good contrast
          expect(contrastRatio).toBeGreaterThanOrEqual(3.0);
          
          // Verify it's in the green hue range (120-150 degrees)
          expect(successHSL.h).toBeGreaterThanOrEqual(120);
          expect(successHSL.h).toBeLessThanOrEqual(150);
          
          return true;
        }
      ),
      { numRuns: 20 } // Use 20 iterations as specified
    );
  });

  /**
   * Test: Warning color should be clearly distinguishable
   * Validates: Requirement 7.4
   */
  it('should have --warning with clear amber/yellow color', () => {
    fc.assert(
      fc.property(
        fc.constant(null),
        () => {
          const warningValue = extractDarkVariable('--warning');
          const warningHSL = parseHSL(warningValue);
          const warningRGB = hslToRgb(warningHSL.h, warningHSL.s, warningHSL.l);
          const pureBlack = { r: 0, g: 0, b: 0 };
          
          const contrastRatio = getContrastRatio(warningRGB, pureBlack);
          
          // Warning amber should have good contrast
          expect(contrastRatio).toBeGreaterThanOrEqual(3.0);
          
          // Verify it's in the amber/yellow hue range (30-50 degrees)
          expect(warningHSL.h).toBeGreaterThanOrEqual(30);
          expect(warningHSL.h).toBeLessThanOrEqual(50);
          
          return true;
        }
      ),
      { numRuns: 20 } // Use 20 iterations as specified
    );
  });

  /**
   * Test: Info color should be distinct from primary
   * Validates: Requirement 7.2
   */
  it('should have --info with distinct blue color', () => {
    fc.assert(
      fc.property(
        fc.constant(null),
        () => {
          const infoValue = extractDarkVariable('--info');
          const infoHSL = parseHSL(infoValue);
          const infoRGB = hslToRgb(infoHSL.h, infoHSL.s, infoHSL.l);
          const pureBlack = { r: 0, g: 0, b: 0 };
          
          const contrastRatio = getContrastRatio(infoRGB, pureBlack);
          
          // Info blue should have good contrast
          expect(contrastRatio).toBeGreaterThanOrEqual(3.0);
          
          // Verify it's in the blue hue range (200-230 degrees)
          expect(infoHSL.h).toBeGreaterThanOrEqual(200);
          expect(infoHSL.h).toBeLessThanOrEqual(230);
          
          return true;
        }
      ),
      { numRuns: 20 } // Use 20 iterations as specified
    );
  });

  /**
   * Test: Destructive color should be prominent
   * Validates: Requirement 7.5
   */
  it('should have --destructive with prominent red color', () => {
    fc.assert(
      fc.property(
        fc.constant(null),
        () => {
          const destructiveValue = extractDarkVariable('--destructive');
          const destructiveHSL = parseHSL(destructiveValue);
          const destructiveRGB = hslToRgb(destructiveHSL.h, destructiveHSL.s, destructiveHSL.l);
          const pureBlack = { r: 0, g: 0, b: 0 };
          
          const contrastRatio = getContrastRatio(destructiveRGB, pureBlack);
          
          // Destructive red should have good contrast
          expect(contrastRatio).toBeGreaterThanOrEqual(3.0);
          
          // Verify it's in the red hue range (0-10 degrees or 350-360 degrees)
          expect(destructiveHSL.h >= 0 && destructiveHSL.h <= 10 || destructiveHSL.h >= 350 && destructiveHSL.h <= 360).toBe(true);
          
          return true;
        }
      ),
      { numRuns: 20 } // Use 20 iterations as specified
    );
  });

  /**
   * Test: Semantic color foregrounds should have high contrast against their backgrounds
   * Validates: Requirements 7.1, 7.2
   * 
   * Note: All semantic colors use dark text (10% lightness) on bright backgrounds
   * for optimal visibility and accessibility.
   */
  it('should have semantic color foregrounds with high contrast against their backgrounds', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          { bg: '--success', fg: '--success-foreground' },
          { bg: '--warning', fg: '--warning-foreground' },
          { bg: '--info', fg: '--info-foreground' },
          { bg: '--destructive', fg: '--destructive-foreground' }
        ),
        (colorPair) => {
          const bgValue = extractDarkVariable(colorPair.bg);
          const fgValue = extractDarkVariable(colorPair.fg);
          
          const bgHSL = parseHSL(bgValue);
          const fgHSL = parseHSL(fgValue);
          
          const bgRGB = hslToRgb(bgHSL.h, bgHSL.s, bgHSL.l);
          const fgRGB = hslToRgb(fgHSL.h, fgHSL.s, fgHSL.l);
          
          const contrastRatio = getContrastRatio(bgRGB, fgRGB);
          
          // Dark text on bright semantic color backgrounds should meet WCAG AA (4.5:1 minimum for normal text)
          expect(contrastRatio).toBeGreaterThanOrEqual(4.5);
          
          return true;
        }
      ),
      { numRuns: 20 } // Use 20 iterations as specified
    );
  });

  /**
   * Invariant check: Verify specific HSL values match design specification
   */
  it('should have semantic colors matching the design specification', () => {
    const successValue = extractDarkVariable('--success');
    const warningValue = extractDarkVariable('--warning');
    const infoValue = extractDarkVariable('--info');
    const destructiveValue = extractDarkVariable('--destructive');
    
    const successHSL = parseHSL(successValue);
    const warningHSL = parseHSL(warningValue);
    const infoHSL = parseHSL(infoValue);
    const destructiveHSL = parseHSL(destructiveValue);
    
    // Verify success: 142 70% 60% (bright green with dark text)
    expect(successHSL.h).toBe(142);
    expect(successHSL.s).toBe(70);
    expect(successHSL.l).toBe(60);
    
    // Verify warning: 38 92% 55%
    expect(warningHSL.h).toBe(38);
    expect(warningHSL.s).toBe(92);
    expect(warningHSL.l).toBe(55);
    
    // Verify info: 217 91% 65% (bright blue with dark text)
    expect(infoHSL.h).toBe(217);
    expect(infoHSL.s).toBe(91);
    expect(infoHSL.l).toBe(65);
    
    // Verify destructive: 0 85% 60% (bright red with dark text)
    expect(destructiveHSL.h).toBe(0);
    expect(destructiveHSL.s).toBe(85);
    expect(destructiveHSL.l).toBe(60);
  });

  /**
   * Invariant check: Verify foreground colors match design specification
   * All semantic colors use dark text (10% lightness) for optimal contrast
   */
  it('should have semantic color foregrounds matching the design specification', () => {
    const successFgValue = extractDarkVariable('--success-foreground');
    const warningFgValue = extractDarkVariable('--warning-foreground');
    const infoFgValue = extractDarkVariable('--info-foreground');
    const destructiveFgValue = extractDarkVariable('--destructive-foreground');
    
    const successFgHSL = parseHSL(successFgValue);
    const warningFgHSL = parseHSL(warningFgValue);
    const infoFgHSL = parseHSL(infoFgValue);
    const destructiveFgHSL = parseHSL(destructiveFgValue);
    
    // All semantic color foregrounds use dark text: 0 0% 10%
    expect(successFgHSL.h).toBe(0);
    expect(successFgHSL.s).toBe(0);
    expect(successFgHSL.l).toBe(10);
    
    expect(warningFgHSL.h).toBe(0);
    expect(warningFgHSL.s).toBe(0);
    expect(warningFgHSL.l).toBe(10);
    
    expect(infoFgHSL.h).toBe(0);
    expect(infoFgHSL.s).toBe(0);
    expect(infoFgHSL.l).toBe(10);
    
    expect(destructiveFgHSL.h).toBe(0);
    expect(destructiveFgHSL.s).toBe(0);
    expect(destructiveFgHSL.l).toBe(10);
  });
});
