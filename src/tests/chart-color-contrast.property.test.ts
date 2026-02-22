/**
 * Property-Based Test: Chart Color Contrast
 * Feature: pure-black-dark-theme
 * Property 8: Chart Color Contrast
 * 
 * Validates: Requirements 8.1, 8.2, 8.4
 * 
 * For any chart color variable (--chart-1 through --chart-5) in dark mode, 
 * the contrast ratio against pure black should be at least 3:1.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';

describe('Feature: pure-black-dark-theme, Property 8: Chart Color Contrast', () => {
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
   * Property: All chart colors should have at least 3:1 contrast against pure black
   * 
   * This property test verifies that all chart colors meet WCAG AA requirements 
   * for UI components (minimum 3:1 contrast ratio) to ensure data visualization 
   * is clearly visible on pure black backgrounds.
   */
  it('should have all chart colors with at least 3:1 contrast ratio against pure black', () => {
    fc.assert(
      fc.property(
        // Test all chart color variables
        fc.constantFrom(
          '--chart-1',
          '--chart-2',
          '--chart-3',
          '--chart-4',
          '--chart-5'
        ),
        (chartColorVar) => {
          const colorValue = extractDarkVariable(chartColorVar);
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
   * Test: Chart colors should have sufficient brightness for visibility
   * Validates: Requirement 8.2
   */
  it('should have chart colors with sufficient brightness and saturation', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          '--chart-1',
          '--chart-2',
          '--chart-3',
          '--chart-4',
          '--chart-5'
        ),
        (chartColorVar) => {
          const colorValue = extractDarkVariable(chartColorVar);
          const colorHSL = parseHSL(colorValue);
          
          // Chart colors should have sufficient lightness (at least 45%) for visibility
          expect(colorHSL.l).toBeGreaterThanOrEqual(45);
          
          // Chart colors should have sufficient saturation (at least 60%) for vibrancy
          expect(colorHSL.s).toBeGreaterThanOrEqual(60);
          
          return true;
        }
      ),
      { numRuns: 20 } // Use 20 iterations as specified
    );
  });

  /**
   * Test: Chart colors should maintain sufficient contrast for data visualization
   * Validates: Requirement 8.4
   */
  it('should have chart colors with sufficient contrast for data visualization', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          '--chart-1',
          '--chart-2',
          '--chart-3',
          '--chart-4',
          '--chart-5'
        ),
        (chartColorVar) => {
          const colorValue = extractDarkVariable(chartColorVar);
          const colorHSL = parseHSL(colorValue);
          const colorRGB = hslToRgb(colorHSL.h, colorHSL.s, colorHSL.l);
          const pureBlack = { r: 0, g: 0, b: 0 };
          
          const contrastRatio = getContrastRatio(colorRGB, pureBlack);
          
          // For data visualization, we want good contrast (at least 3:1)
          expect(contrastRatio).toBeGreaterThanOrEqual(3.0);
          
          return true;
        }
      ),
      { numRuns: 20 } // Use 20 iterations as specified
    );
  });

  /**
   * Invariant check: Verify specific HSL values match design specification
   */
  it('should have chart colors matching the design specification', () => {
    const chart1Value = extractDarkVariable('--chart-1');
    const chart2Value = extractDarkVariable('--chart-2');
    const chart3Value = extractDarkVariable('--chart-3');
    const chart4Value = extractDarkVariable('--chart-4');
    const chart5Value = extractDarkVariable('--chart-5');
    
    const chart1HSL = parseHSL(chart1Value);
    const chart2HSL = parseHSL(chart2Value);
    const chart3HSL = parseHSL(chart3Value);
    const chart4HSL = parseHSL(chart4Value);
    const chart5HSL = parseHSL(chart5Value);
    
    // Verify chart-1: 173 80% 55% (brighter teal)
    expect(chart1HSL.h).toBe(173);
    expect(chart1HSL.s).toBe(80);
    expect(chart1HSL.l).toBe(55);
    
    // Verify chart-2: 27 96% 65% (bright orange)
    expect(chart2HSL.h).toBe(27);
    expect(chart2HSL.s).toBe(96);
    expect(chart2HSL.l).toBe(65);
    
    // Verify chart-3: 217 70% 55% (distinct blue)
    expect(chart3HSL.h).toBe(217);
    expect(chart3HSL.s).toBe(70);
    expect(chart3HSL.l).toBe(55);
    
    // Verify chart-4: 43 90% 50% (bright yellow - darker for distinguishability)
    expect(chart4HSL.h).toBe(43);
    expect(chart4HSL.s).toBe(90);
    expect(chart4HSL.l).toBe(50);
    
    // Verify chart-5: 142 70% 50% (green)
    expect(chart5HSL.h).toBe(142);
    expect(chart5HSL.s).toBe(70);
    expect(chart5HSL.l).toBe(50);
  });

  /**
   * Test: All chart colors should meet minimum contrast requirements
   * Validates: Requirements 8.1, 8.4
   */
  it('should have all chart colors meeting WCAG AA contrast requirements', () => {
    const chartColors = ['--chart-1', '--chart-2', '--chart-3', '--chart-4', '--chart-5'];
    const pureBlack = { r: 0, g: 0, b: 0 };
    
    chartColors.forEach(chartColorVar => {
      const colorValue = extractDarkVariable(chartColorVar);
      const colorHSL = parseHSL(colorValue);
      const colorRGB = hslToRgb(colorHSL.h, colorHSL.s, colorHSL.l);
      
      const contrastRatio = getContrastRatio(colorRGB, pureBlack);
      
      // All chart colors must meet WCAG AA for UI components (3:1)
      expect(contrastRatio).toBeGreaterThanOrEqual(3.0);
    });
  });
});
