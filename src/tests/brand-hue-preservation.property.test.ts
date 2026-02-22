/**
 * Property-Based Test: Brand Hue Preservation
 * Feature: pure-black-dark-theme
 * Property 6: Brand Hue Preservation
 * 
 * Validates: Requirements 5.3
 * 
 * For any brand color CSS variable (--primary) in dark mode, the hue component 
 * should remain within 170-176 degrees (Electric Teal range).
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';

describe('Feature: pure-black-dark-theme, Property 6: Brand Hue Preservation', () => {
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
   * Property: The --primary color should maintain Electric Teal hue (170-176 degrees)
   * 
   * This property test verifies that the primary brand color maintains its 
   * Electric Teal identity across the theme implementation.
   */
  it('should have --primary with hue in Electric Teal range (170-176 degrees)', () => {
    fc.assert(
      fc.property(
        // Generate different ways to verify hue
        fc.constantFrom(
          'direct-hue-check',
          'hue-range-validation',
          'brand-identity-check',
          'color-consistency-check'
        ),
        (verificationMethod) => {
          const primaryValue = extractDarkVariable('--primary');
          const primaryHSL = parseHSL(primaryValue);
          
          let hueInRange: boolean;
          
          switch (verificationMethod) {
            case 'direct-hue-check':
            case 'hue-range-validation':
            case 'brand-identity-check':
            case 'color-consistency-check':
              // All methods check the same hue range
              hueInRange = primaryHSL.h >= 170 && primaryHSL.h <= 176;
              break;
            default:
              throw new Error(`Unknown verification method: ${verificationMethod}`);
          }
          
          // Property assertion: hue must be in Electric Teal range
          expect(hueInRange).toBe(true);
          expect(primaryHSL.h).toBeGreaterThanOrEqual(170);
          expect(primaryHSL.h).toBeLessThanOrEqual(176);
          
          return true;
        }
      ),
      { numRuns: 20 } // Use 20 iterations as specified
    );
  });

  /**
   * Verify the exact hue value matches the design specification (173 degrees)
   */
  it('should have --primary with exact Electric Teal hue (173 degrees)', () => {
    const primaryValue = extractDarkVariable('--primary');
    const primaryHSL = parseHSL(primaryValue);
    
    // Verify exact hue from design specification
    expect(primaryHSL.h).toBe(173);
  });

  /**
   * Property: Hue should be consistent across light and dark modes
   * 
   * This ensures brand consistency across theme modes.
   */
  it('should maintain consistent Electric Teal hue across light and dark modes', () => {
    fc.assert(
      fc.property(
        fc.constant(null),
        () => {
          // Extract light mode primary
          const rootMatch = cssContent.match(/:root\s*\{([^}]+)\}/s);
          if (!rootMatch) {
            throw new Error(':root section not found in CSS');
          }
          
          const rootSection = rootMatch[1];
          const lightPrimaryMatch = rootSection.match(/--primary:\s*([^;]+);/);
          if (!lightPrimaryMatch) {
            throw new Error('--primary not found in :root section');
          }
          
          const lightPrimaryValue = lightPrimaryMatch[1].trim();
          const lightPrimaryHSL = parseHSL(lightPrimaryValue);
          
          // Extract dark mode primary
          const darkPrimaryValue = extractDarkVariable('--primary');
          const darkPrimaryHSL = parseHSL(darkPrimaryValue);
          
          // Both should have the same hue (173 degrees for Electric Teal)
          expect(lightPrimaryHSL.h).toBe(darkPrimaryHSL.h);
          expect(darkPrimaryHSL.h).toBe(173);
          
          return true;
        }
      ),
      { numRuns: 20 } // Use 20 iterations as specified
    );
  });

  /**
   * Verify saturation is maintained for brand vibrancy
   */
  it('should have --primary with high saturation (80%) for brand vibrancy', () => {
    const primaryValue = extractDarkVariable('--primary');
    const primaryHSL = parseHSL(primaryValue);
    
    // Verify saturation matches design specification
    expect(primaryHSL.s).toBe(80);
    
    // Saturation should be high for vibrant brand color
    expect(primaryHSL.s).toBeGreaterThanOrEqual(70);
  });
});
