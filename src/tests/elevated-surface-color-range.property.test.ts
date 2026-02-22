/**
 * Property-Based Test: Elevated Surface Color Range
 * Feature: pure-black-dark-theme
 * Property 2: Elevated Surface Color Range
 * 
 * Validates: Requirements 2.2, 2.3
 * 
 * For any elevated surface CSS variable (--card, --popover) in dark mode,
 * the lightness value should be between 4% and 10%.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';

describe('Feature: pure-black-dark-theme, Property 2: Elevated Surface Color Range', () => {
  let cssContent: string;

  beforeAll(() => {
    // Read the App.css file
    const cssPath = path.join(process.cwd(), 'src', 'App.css');
    cssContent = fs.readFileSync(cssPath, 'utf-8');
  });

  /**
   * Helper function to extract CSS variable value from .dark section
   */
  function extractDarkVariable(variableName: string): string | null {
    const darkMatch = cssContent.match(/\.dark\s*\{([^}]+)\}/s);
    if (!darkMatch) return null;
    
    const darkSection = darkMatch[1];
    const varMatch = darkSection.match(new RegExp(`${variableName}:\\s*([^;]+);`));
    if (!varMatch) return null;
    
    return varMatch[1].trim();
  }

  /**
   * Helper function to parse HSL value and extract lightness
   */
  function parseLightness(hslValue: string): number | null {
    const hslMatch = hslValue.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
    if (!hslMatch) return null;
    
    return parseInt(hslMatch[3]);
  }

  /**
   * Property: Elevated surface variables should have lightness between 4% and 10%
   * 
   * This property test verifies that --card and --popover variables in the .dark class
   * have lightness values within the acceptable range for subtle elevation.
   */
  it('should have --card and --popover lightness between 4% and 10%', () => {
    fc.assert(
      fc.property(
        // Generate different elevated surface variables to test
        fc.constantFrom('--card', '--popover'),
        (variableName) => {
          const value = extractDarkVariable(variableName);
          expect(value).not.toBeNull();
          
          const lightness = parseLightness(value!);
          expect(lightness).not.toBeNull();
          
          // Property assertion: Lightness must be between 4% and 10%
          expect(lightness).toBeGreaterThanOrEqual(4);
          expect(lightness).toBeLessThanOrEqual(10);
          
          return true;
        }
      ),
      { numRuns: 20 } // Reduced iterations for faster test execution
    );
  });

  /**
   * Property: Card and popover should have consistent values
   * 
   * This verifies that --card and --popover use the same value for consistency
   * as specified in the design document.
   */
  it('should have matching values for --card and --popover', () => {
    fc.assert(
      fc.property(
        fc.constant(cssContent),
        (css) => {
          const cardValue = extractDarkVariable('--card');
          const popoverValue = extractDarkVariable('--popover');
          
          expect(cardValue).not.toBeNull();
          expect(popoverValue).not.toBeNull();
          
          // Property assertion: Card and popover should match
          expect(cardValue).toBe(popoverValue);
          
          return true;
        }
      ),
      { numRuns: 20 } // Reduced iterations for faster test execution
    );
  });

  /**
   * Property: Elevated surfaces should be lighter than pure black background
   * 
   * This verifies that elevated surfaces have higher lightness than the background
   * to create visual hierarchy.
   */
  it('should have elevated surfaces lighter than background', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('--card', '--popover'),
        (variableName) => {
          const backgroundValue = extractDarkVariable('--background');
          const surfaceValue = extractDarkVariable(variableName);
          
          expect(backgroundValue).not.toBeNull();
          expect(surfaceValue).not.toBeNull();
          
          const backgroundLightness = parseLightness(backgroundValue!);
          const surfaceLightness = parseLightness(surfaceValue!);
          
          expect(backgroundLightness).not.toBeNull();
          expect(surfaceLightness).not.toBeNull();
          
          // Property assertion: Surface should be lighter than background
          expect(surfaceLightness!).toBeGreaterThan(backgroundLightness!);
          
          return true;
        }
      ),
      { numRuns: 20 } // Reduced iterations for faster test execution
    );
  });

  /**
   * Property: Foreground colors should have high contrast
   * 
   * This verifies that --card-foreground and --popover-foreground have
   * high lightness values for good contrast against dark surfaces.
   */
  it('should have foreground colors with high lightness (>= 95%)', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('--card-foreground', '--popover-foreground'),
        (variableName) => {
          const value = extractDarkVariable(variableName);
          expect(value).not.toBeNull();
          
          const lightness = parseLightness(value!);
          expect(lightness).not.toBeNull();
          
          // Property assertion: Foreground lightness should be >= 95%
          expect(lightness).toBeGreaterThanOrEqual(95);
          
          return true;
        }
      ),
      { numRuns: 20 } // Reduced iterations for faster test execution
    );
  });

  /**
   * Property: Elevated surfaces should use neutral hue
   * 
   * This verifies that elevated surfaces use neutral colors (hue = 0)
   * to maintain color neutrality.
   */
  it('should use neutral hue (0) for elevated surfaces', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('--card', '--popover'),
        (variableName) => {
          const value = extractDarkVariable(variableName);
          expect(value).not.toBeNull();
          
          const hslMatch = value!.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
          expect(hslMatch).not.toBeNull();
          
          const hue = parseInt(hslMatch![1]);
          
          // Property assertion: Hue should be 0 (neutral)
          expect(hue).toBe(0);
          
          return true;
        }
      ),
      { numRuns: 20 } // Reduced iterations for faster test execution
    );
  });

  /**
   * Specific value verification: Check exact values match design spec
   */
  it('should have --card set to "0 0% 6%" as specified', () => {
    const cardValue = extractDarkVariable('--card');
    expect(cardValue).toBe('0 0% 6%');
  });

  it('should have --popover set to "0 0% 6%" as specified', () => {
    const popoverValue = extractDarkVariable('--popover');
    expect(popoverValue).toBe('0 0% 6%');
  });

  it('should have --card-foreground set to "0 0% 98%" as specified', () => {
    const cardForegroundValue = extractDarkVariable('--card-foreground');
    expect(cardForegroundValue).toBe('0 0% 98%');
  });

  it('should have --popover-foreground set to "0 0% 98%" as specified', () => {
    const popoverForegroundValue = extractDarkVariable('--popover-foreground');
    expect(popoverForegroundValue).toBe('0 0% 98%');
  });
});
