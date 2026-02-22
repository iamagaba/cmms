/**
 * Property-Based Test: Pure Black Background CSS Variable
 * Feature: pure-black-dark-theme
 * Property 1: Pure Black Background CSS Variable
 * 
 * Validates: Requirements 1.2
 * 
 * For any inspection of the .dark class CSS, the --background variable 
 * should be set to 0 0% 0% (pure black).
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';

describe('Feature: pure-black-dark-theme, Property 1: Pure Black Background CSS Variable', () => {
  let cssContent: string;

  beforeAll(() => {
    // Read the App.css file
    const cssPath = path.join(process.cwd(), 'src', 'App.css');
    cssContent = fs.readFileSync(cssPath, 'utf-8');
  });

  /**
   * Property: The --background variable in .dark class should always be "0 0% 0%"
   * 
   * This property test verifies that regardless of how we inspect the CSS file,
   * the --background variable in the .dark class is consistently set to pure black.
   */
  it('should always have --background set to "0 0% 0%" in .dark class', () => {
    fc.assert(
      fc.property(
        // Generate arbitrary inspection methods (different ways to parse/check the CSS)
        fc.constantFrom(
          'regex-match',
          'line-by-line',
          'dark-section-extract',
          'variable-search'
        ),
        (inspectionMethod) => {
          let backgroundValue: string | null = null;

          switch (inspectionMethod) {
            case 'regex-match':
              // Method 1: Direct regex match for --background in .dark section
              const darkSectionMatch = cssContent.match(/\.dark\s*\{([^}]+)\}/s);
              if (darkSectionMatch) {
                const darkContent = darkSectionMatch[1];
                const bgMatch = darkContent.match(/--background:\s*([^;]+);/);
                if (bgMatch) {
                  backgroundValue = bgMatch[1].trim();
                }
              }
              break;

            case 'line-by-line':
              // Method 2: Parse line by line within .dark section
              const lines = cssContent.split('\n');
              let inDarkSection = false;
              for (const line of lines) {
                if (line.includes('.dark')) {
                  inDarkSection = true;
                }
                if (inDarkSection && line.includes('--background:')) {
                  const match = line.match(/--background:\s*([^;]+);/);
                  if (match) {
                    backgroundValue = match[1].trim();
                    break;
                  }
                }
                if (inDarkSection && line.includes('}') && !line.includes('{')) {
                  break;
                }
              }
              break;

            case 'dark-section-extract':
              // Method 3: Extract entire .dark section first, then find variable
              const darkMatch = cssContent.match(/\.dark\s*\{([^}]+)\}/s);
              if (darkMatch) {
                const darkSection = darkMatch[1];
                const lines = darkSection.split('\n');
                for (const line of lines) {
                  if (line.includes('--background:')) {
                    const match = line.match(/--background:\s*([^;]+);/);
                    if (match) {
                      backgroundValue = match[1].trim();
                      break;
                    }
                  }
                }
              }
              break;

            case 'variable-search':
              // Method 4: Search for all --background occurrences and find the one in .dark
              const allBackgrounds = cssContent.matchAll(/--background:\s*([^;]+);/g);
              const matches = Array.from(allBackgrounds);
              // The second occurrence should be in .dark (first is in :root)
              if (matches.length >= 2) {
                // Verify it's actually in the .dark section
                const secondMatch = matches[1];
                const matchIndex = secondMatch.index || 0;
                const beforeMatch = cssContent.substring(0, matchIndex);
                const lastDarkIndex = beforeMatch.lastIndexOf('.dark');
                const lastRootIndex = beforeMatch.lastIndexOf(':root');
                
                if (lastDarkIndex > lastRootIndex) {
                  backgroundValue = secondMatch[1].trim();
                }
              }
              break;
          }

          // Property assertion: --background in .dark must be "0 0% 0%"
          expect(backgroundValue).toBe('0 0% 0%');
          
          return true;
        }
      ),
      { numRuns: 20 } // Reduced iterations for faster test execution
    );
  });

  /**
   * Additional verification: Ensure the value represents pure black
   */
  it('should parse to pure black HSL values (H=0, S=0%, L=0%)', () => {
    fc.assert(
      fc.property(
        fc.constant(cssContent),
        (css) => {
          // Extract --background from .dark section
          const darkMatch = css.match(/\.dark\s*\{([^}]+)\}/s);
          expect(darkMatch).not.toBeNull();
          
          const darkSection = darkMatch![1];
          const bgMatch = darkSection.match(/--background:\s*([^;]+);/);
          expect(bgMatch).not.toBeNull();
          
          const backgroundValue = bgMatch![1].trim();
          
          // Parse HSL values
          const hslMatch = backgroundValue.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
          expect(hslMatch).not.toBeNull();
          
          const [, h, s, l] = hslMatch!;
          
          // Verify pure black: H=0, S=0%, L=0%
          expect(parseInt(h)).toBe(0);
          expect(parseInt(s)).toBe(0);
          expect(parseInt(l)).toBe(0);
          
          return true;
        }
      ),
      { numRuns: 20 } // Reduced iterations for faster test execution
    );
  });

  /**
   * Invariant check: The comment should indicate pure black
   */
  it('should have a comment indicating pure black', () => {
    const darkMatch = cssContent.match(/\.dark\s*\{([^}]+)\}/s);
    expect(darkMatch).not.toBeNull();
    
    const darkSection = darkMatch![1];
    const bgLine = darkSection.split('\n').find(line => line.includes('--background:'));
    
    expect(bgLine).toBeDefined();
    expect(bgLine).toMatch(/Pure Black|#000000|pure black/i);
  });
});
