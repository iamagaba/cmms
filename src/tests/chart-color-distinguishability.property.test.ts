/**
 * Property-Based Test: Chart Color Distinguishability
 * Feature: pure-black-dark-theme
 * Property 9: Chart Color Distinguishability
 * 
 * Validates: Requirements 8.3
 * 
 * For any pair of chart colors in dark mode, the hue difference should be at least 
 * 30 degrees OR there should be significant lightness/saturation difference 
 * (at least 15% difference in either).
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';

describe('Feature: pure-black-dark-theme, Property 9: Chart Color Distinguishability', () => {
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
   * Helper function to calculate the minimum hue difference between two hues
   * Accounts for circular nature of hue (0-360 degrees)
   */
  function getHueDifference(h1: number, h2: number): number {
    const diff = Math.abs(h1 - h2);
    // Account for circular nature of hue (e.g., 350° and 10° are only 20° apart)
    return Math.min(diff, 360 - diff);
  }

  /**
   * Helper function to check if two colors are distinguishable
   * Colors are distinguishable if:
   * - Hue difference is at least 30 degrees, OR
   * - Lightness difference is at least 15%, OR
   * - Saturation difference is at least 15%
   */
  function areColorsDistinguishable(
    hsl1: { h: number; s: number; l: number },
    hsl2: { h: number; s: number; l: number }
  ): boolean {
    const hueDiff = getHueDifference(hsl1.h, hsl2.h);
    const saturationDiff = Math.abs(hsl1.s - hsl2.s);
    const lightnessDiff = Math.abs(hsl1.l - hsl2.l);
    
    return hueDiff >= 30 || saturationDiff >= 15 || lightnessDiff >= 15;
  }

  /**
   * Property: All pairs of chart colors should be distinguishable
   * 
   * This property test verifies that any two chart colors can be easily 
   * distinguished from each other, either by hue difference (30+ degrees) 
   * or by significant lightness/saturation difference (15+ percentage points).
   */
  it('should have all chart color pairs distinguishable from each other', () => {
    fc.assert(
      fc.property(
        // Generate all unique pairs of chart colors
        fc.constantFrom(
          { color1: '--chart-1', color2: '--chart-2' },
          { color1: '--chart-1', color2: '--chart-3' },
          { color1: '--chart-1', color2: '--chart-4' },
          { color1: '--chart-1', color2: '--chart-5' },
          { color1: '--chart-2', color2: '--chart-3' },
          { color1: '--chart-2', color2: '--chart-4' },
          { color1: '--chart-2', color2: '--chart-5' },
          { color1: '--chart-3', color2: '--chart-4' },
          { color1: '--chart-3', color2: '--chart-5' },
          { color1: '--chart-4', color2: '--chart-5' }
        ),
        (colorPair) => {
          const color1Value = extractDarkVariable(colorPair.color1);
          const color2Value = extractDarkVariable(colorPair.color2);
          
          const color1HSL = parseHSL(color1Value);
          const color2HSL = parseHSL(color2Value);
          
          // Property assertion: colors must be distinguishable
          const distinguishable = areColorsDistinguishable(color1HSL, color2HSL);
          
          expect(distinguishable).toBe(true);
          
          return true;
        }
      ),
      { numRuns: 20 } // Use 20 iterations as specified
    );
  });

  /**
   * Test: Chart colors should have diverse hues
   * Validates: Requirement 8.3
   */
  it('should have chart colors with diverse hues across the color spectrum', () => {
    const chartColors = ['--chart-1', '--chart-2', '--chart-3', '--chart-4', '--chart-5'];
    const hues: number[] = [];
    
    chartColors.forEach(chartColorVar => {
      const colorValue = extractDarkVariable(chartColorVar);
      const colorHSL = parseHSL(colorValue);
      hues.push(colorHSL.h);
    });
    
    // Check that we have good hue diversity
    // At least 3 colors should have hue differences of 30+ degrees from each other
    let diversePairs = 0;
    for (let i = 0; i < hues.length; i++) {
      for (let j = i + 1; j < hues.length; j++) {
        const hueDiff = getHueDifference(hues[i], hues[j]);
        if (hueDiff >= 30) {
          diversePairs++;
        }
      }
    }
    
    // With 5 colors, we should have at least 6 pairs with 30+ degree hue difference
    expect(diversePairs).toBeGreaterThanOrEqual(6);
  });

  /**
   * Test: Specific color pairs should be easily distinguishable
   * Validates: Requirement 8.3
   */
  it('should have chart-1 (teal) and chart-3 (blue) distinguishable', () => {
    fc.assert(
      fc.property(
        fc.constant(null),
        () => {
          const chart1Value = extractDarkVariable('--chart-1');
          const chart3Value = extractDarkVariable('--chart-3');
          
          const chart1HSL = parseHSL(chart1Value);
          const chart3HSL = parseHSL(chart3Value);
          
          const hueDiff = getHueDifference(chart1HSL.h, chart3HSL.h);
          
          // Teal (173°) and blue (217°) should have at least 30° hue difference
          expect(hueDiff).toBeGreaterThanOrEqual(30);
          
          return true;
        }
      ),
      { numRuns: 20 } // Use 20 iterations as specified
    );
  });

  /**
   * Test: Warm colors should be distinguishable from each other
   * Validates: Requirement 8.3
   */
  it('should have warm chart colors (orange and yellow) distinguishable', () => {
    fc.assert(
      fc.property(
        fc.constant(null),
        () => {
          const chart2Value = extractDarkVariable('--chart-2'); // Orange
          const chart4Value = extractDarkVariable('--chart-4'); // Yellow
          
          const chart2HSL = parseHSL(chart2Value);
          const chart4HSL = parseHSL(chart4Value);
          
          const distinguishable = areColorsDistinguishable(chart2HSL, chart4HSL);
          
          // Orange and yellow should be distinguishable
          expect(distinguishable).toBe(true);
          
          return true;
        }
      ),
      { numRuns: 20 } // Use 20 iterations as specified
    );
  });

  /**
   * Test: Cool colors should be distinguishable from warm colors
   * Validates: Requirement 8.3
   */
  it('should have cool colors distinguishable from warm colors', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          { cool: '--chart-1', warm: '--chart-2' }, // Teal vs Orange
          { cool: '--chart-1', warm: '--chart-4' }, // Teal vs Yellow
          { cool: '--chart-3', warm: '--chart-2' }, // Blue vs Orange
          { cool: '--chart-3', warm: '--chart-4' }  // Blue vs Yellow
        ),
        (colorPair) => {
          const coolValue = extractDarkVariable(colorPair.cool);
          const warmValue = extractDarkVariable(colorPair.warm);
          
          const coolHSL = parseHSL(coolValue);
          const warmHSL = parseHSL(warmValue);
          
          const hueDiff = getHueDifference(coolHSL.h, warmHSL.h);
          
          // Cool and warm colors should have significant hue difference (at least 30°)
          expect(hueDiff).toBeGreaterThanOrEqual(30);
          
          return true;
        }
      ),
      { numRuns: 20 } // Use 20 iterations as specified
    );
  });

  /**
   * Invariant check: Verify hue diversity across all chart colors
   */
  it('should have chart colors spanning multiple hue ranges', () => {
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
    
    // Verify we have colors in different hue ranges:
    // - Teal/Cyan: 170-180° (chart-1: 173°)
    // - Orange: 20-35° (chart-2: 27°)
    // - Blue: 210-230° (chart-3: 217°)
    // - Yellow: 40-50° (chart-4: 43°)
    // - Green: 120-150° (chart-5: 142°)
    
    expect(chart1HSL.h).toBeGreaterThanOrEqual(170);
    expect(chart1HSL.h).toBeLessThanOrEqual(180);
    
    expect(chart2HSL.h).toBeGreaterThanOrEqual(20);
    expect(chart2HSL.h).toBeLessThanOrEqual(35);
    
    expect(chart3HSL.h).toBeGreaterThanOrEqual(210);
    expect(chart3HSL.h).toBeLessThanOrEqual(230);
    
    expect(chart4HSL.h).toBeGreaterThanOrEqual(40);
    expect(chart4HSL.h).toBeLessThanOrEqual(50);
    
    expect(chart5HSL.h).toBeGreaterThanOrEqual(120);
    expect(chart5HSL.h).toBeLessThanOrEqual(150);
  });

  /**
   * Test: All chart color pairs should meet distinguishability criteria
   * Validates: Requirement 8.3
   */
  it('should have all chart color pairs meeting distinguishability criteria', () => {
    const chartColors = ['--chart-1', '--chart-2', '--chart-3', '--chart-4', '--chart-5'];
    
    // Test all unique pairs
    for (let i = 0; i < chartColors.length; i++) {
      for (let j = i + 1; j < chartColors.length; j++) {
        const color1Value = extractDarkVariable(chartColors[i]);
        const color2Value = extractDarkVariable(chartColors[j]);
        
        const color1HSL = parseHSL(color1Value);
        const color2HSL = parseHSL(color2Value);
        
        const distinguishable = areColorsDistinguishable(color1HSL, color2HSL);
        
        expect(distinguishable).toBe(true);
      }
    }
  });

  /**
   * Test: Chart colors should maintain visual harmony while being distinguishable
   * Validates: Requirement 8.5
   */
  it('should have chart colors that are visually harmonious', () => {
    const chartColors = ['--chart-1', '--chart-2', '--chart-3', '--chart-4', '--chart-5'];
    const saturations: number[] = [];
    const lightnesses: number[] = [];
    
    chartColors.forEach(chartColorVar => {
      const colorValue = extractDarkVariable(chartColorVar);
      const colorHSL = parseHSL(colorValue);
      saturations.push(colorHSL.s);
      lightnesses.push(colorHSL.l);
    });
    
    // All saturations should be relatively high (60%+) for vibrancy
    saturations.forEach(s => {
      expect(s).toBeGreaterThanOrEqual(60);
    });
    
    // All lightnesses should be in a reasonable range (45-70%) for visibility
    lightnesses.forEach(l => {
      expect(l).toBeGreaterThanOrEqual(45);
      expect(l).toBeLessThanOrEqual(70);
    });
    
    // Saturation variance should not be too extreme (within 40% range)
    const maxSaturation = Math.max(...saturations);
    const minSaturation = Math.min(...saturations);
    expect(maxSaturation - minSaturation).toBeLessThanOrEqual(40);
    
    // Lightness variance should not be too extreme (within 25% range)
    const maxLightness = Math.max(...lightnesses);
    const minLightness = Math.min(...lightnesses);
    expect(maxLightness - minLightness).toBeLessThanOrEqual(25);
  });
});
