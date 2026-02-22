/**
 * Unit Tests: CSS Variable Values
 * Feature: pure-black-dark-theme
 * 
 * Validates: Requirements 1.2, 2.2, 4.2, 6.2
 * 
 * Tests that specific CSS variable values are correctly set in dark mode.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('CSS Variable Values in Dark Mode', () => {
  let cssContent: string;

  beforeAll(() => {
    // Read the App.css file
    const cssPath = path.join(process.cwd(), 'src', 'App.css');
    cssContent = fs.readFileSync(cssPath, 'utf-8');
  });

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
   * Helper: Extract CSS variable value from :root section
   */
  function extractRootVariable(variableName: string): string {
    const rootMatch = cssContent.match(/:root\s*\{([^}]+)\}/s);
    if (!rootMatch) throw new Error(':root section not found');
    
    const rootSection = rootMatch[1];
    const varMatch = rootSection.match(new RegExp(`${variableName}:\\s*([^;]+);`));
    if (!varMatch) throw new Error(`${variableName} not found in :root section`);
    
    return varMatch[1].trim();
  }

  describe('Background Colors', () => {
    it('should have --background set to "0 0% 0%" (pure black) in dark mode', () => {
      const value = extractDarkVariable('--background');
      expect(value).toBe('0 0% 0%');
    });

    it('should have --foreground set to "0 0% 98%" in dark mode', () => {
      const value = extractDarkVariable('--foreground');
      expect(value).toBe('0 0% 98%');
    });
  });

  describe('Elevated Surface Colors', () => {
    it('should have --card set to "0 0% 6%" in dark mode', () => {
      const value = extractDarkVariable('--card');
      expect(value).toBe('0 0% 6%');
    });

    it('should have --card-foreground set to "0 0% 98%" in dark mode', () => {
      const value = extractDarkVariable('--card-foreground');
      expect(value).toBe('0 0% 98%');
    });

    it('should have --popover set to "0 0% 6%" in dark mode', () => {
      const value = extractDarkVariable('--popover');
      expect(value).toBe('0 0% 6%');
    });

    it('should have --popover-foreground set to "0 0% 98%" in dark mode', () => {
      const value = extractDarkVariable('--popover-foreground');
      expect(value).toBe('0 0% 98%');
    });
  });

  describe('Border Colors', () => {
    it('should have --border set to "0 0% 20%" in dark mode', () => {
      const value = extractDarkVariable('--border');
      expect(value).toBe('0 0% 20%');
    });

    it('should have --input set to "0 0% 20%" in dark mode', () => {
      const value = extractDarkVariable('--input');
      expect(value).toBe('0 0% 20%');
    });
  });

  describe('Muted Colors', () => {
    it('should have --muted set to "0 0% 12%" in dark mode', () => {
      const value = extractDarkVariable('--muted');
      expect(value).toBe('0 0% 12%');
    });

    it('should have --muted-foreground set to "0 0% 65%" in dark mode', () => {
      const value = extractDarkVariable('--muted-foreground');
      expect(value).toBe('0 0% 65%');
    });
  });

  describe('Brand Colors', () => {
    it('should have --primary set to "173 80% 50%" in dark mode', () => {
      const value = extractDarkVariable('--primary');
      expect(value).toBe('173 80% 50%');
    });

    it('should have --primary-foreground set to "0 0% 0%" in dark mode', () => {
      const value = extractDarkVariable('--primary-foreground');
      expect(value).toBe('0 0% 0%');
    });

    it('should have --secondary set to "0 0% 15%" in dark mode', () => {
      const value = extractDarkVariable('--secondary');
      expect(value).toBe('0 0% 15%');
    });

    it('should have --secondary-foreground set to "0 0% 98%" in dark mode', () => {
      const value = extractDarkVariable('--secondary-foreground');
      expect(value).toBe('0 0% 98%');
    });
  });

  describe('Accent Colors', () => {
    it('should have --accent set to "0 0% 12%" in dark mode', () => {
      const value = extractDarkVariable('--accent');
      expect(value).toBe('0 0% 12%');
    });

    it('should have --accent-foreground set to "0 0% 98%" in dark mode', () => {
      const value = extractDarkVariable('--accent-foreground');
      expect(value).toBe('0 0% 98%');
    });
  });

  describe('Semantic Status Colors', () => {
    it('should have --success set to "142 70% 60%" in dark mode', () => {
      const value = extractDarkVariable('--success');
      expect(value).toBe('142 70% 60%');
    });

    it('should have --success-foreground set to "0 0% 10%" in dark mode', () => {
      const value = extractDarkVariable('--success-foreground');
      expect(value).toBe('0 0% 10%');
    });

    it('should have --warning set to "38 92% 55%" in dark mode', () => {
      const value = extractDarkVariable('--warning');
      expect(value).toBe('38 92% 55%');
    });

    it('should have --warning-foreground set to "0 0% 10%" in dark mode', () => {
      const value = extractDarkVariable('--warning-foreground');
      expect(value).toBe('0 0% 10%');
    });

    it('should have --info set to "217 91% 65%" in dark mode', () => {
      const value = extractDarkVariable('--info');
      expect(value).toBe('217 91% 65%');
    });

    it('should have --info-foreground set to "0 0% 10%" in dark mode', () => {
      const value = extractDarkVariable('--info-foreground');
      expect(value).toBe('0 0% 10%');
    });

    it('should have --destructive set to "0 85% 60%" in dark mode', () => {
      const value = extractDarkVariable('--destructive');
      expect(value).toBe('0 85% 60%');
    });

    it('should have --destructive-foreground set to "0 0% 10%" in dark mode', () => {
      const value = extractDarkVariable('--destructive-foreground');
      expect(value).toBe('0 0% 10%');
    });
  });

  describe('Chart Colors', () => {
    it('should have --chart-1 set to "173 80% 55%" in dark mode', () => {
      const value = extractDarkVariable('--chart-1');
      expect(value).toBe('173 80% 55%');
    });

    it('should have --chart-2 set to "27 96% 65%" in dark mode', () => {
      const value = extractDarkVariable('--chart-2');
      expect(value).toBe('27 96% 65%');
    });

    it('should have --chart-3 set to "217 70% 55%" in dark mode', () => {
      const value = extractDarkVariable('--chart-3');
      expect(value).toBe('217 70% 55%');
    });

    it('should have --chart-4 set to "43 90% 50%" in dark mode', () => {
      const value = extractDarkVariable('--chart-4');
      expect(value).toBe('43 90% 50%');
    });

    it('should have --chart-5 set to "142 70% 50%" in dark mode', () => {
      const value = extractDarkVariable('--chart-5');
      expect(value).toBe('142 70% 50%');
    });
  });

  describe('Focus Ring', () => {
    it('should have --ring set to "173 80% 50%" in dark mode', () => {
      const value = extractDarkVariable('--ring');
      expect(value).toBe('173 80% 50%');
    });
  });

  describe('Light Mode Preservation', () => {
    it('should preserve light mode --background value', () => {
      const value = extractRootVariable('--background');
      // Light mode should remain unchanged (typically white or very light)
      expect(value).toBeTruthy();
      expect(value).not.toBe('0 0% 0%'); // Should not be pure black
    });

    it('should preserve light mode --foreground value', () => {
      const value = extractRootVariable('--foreground');
      // Light mode should remain unchanged (typically dark text)
      expect(value).toBeTruthy();
      expect(value).not.toBe('0 0% 98%'); // Should not be light text
    });

    it('should preserve light mode --card value', () => {
      const value = extractRootVariable('--card');
      // Light mode should remain unchanged
      expect(value).toBeTruthy();
      expect(value).not.toBe('0 0% 6%'); // Should not be dark card
    });
  });
});
