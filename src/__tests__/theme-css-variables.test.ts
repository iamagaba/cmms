import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * Unit tests for CSS variable values in the pure black dark theme
 * 
 * These tests verify that the CSS variables defined in App.css are correctly
 * set for both light and dark modes, ensuring the pure black theme is properly
 * implemented.
 * 
 * Requirements: 1.2, 2.2, 4.2, 5.3, 10.3
 */

// Helper function to parse CSS variables from App.css
function parseCSSVariables(cssContent: string, selector: string): Record<string, string> {
  const variables: Record<string, string> = {};
  
  // Find the selector block
  const selectorRegex = new RegExp(`${selector.replace(/\./g, '\\.')}\\s*{([^}]+)}`, 's');
  const match = cssContent.match(selectorRegex);
  
  if (!match) {
    return variables;
  }
  
  const block = match[1];
  
  // Extract all CSS variables, handling inline comments
  const varRegex = /--([a-z0-9-]+):\s*([^;]+);/g;
  let varMatch;
  
  while ((varMatch = varRegex.exec(block)) !== null) {
    const varName = varMatch[1];
    let varValue = varMatch[2].trim();
    
    // Remove inline comments (/* ... */)
    varValue = varValue.replace(/\/\*.*?\*\//g, '').trim();
    
    // Skip if the value is empty after removing comments
    if (varValue) {
      variables[varName] = varValue;
    }
  }
  
  return variables;
}

describe('Theme CSS Variables', () => {
  let cssContent: string;
  let rootVariables: Record<string, string>;
  let darkVariables: Record<string, string>;

  beforeAll(() => {
    // Read the App.css file
    const cssPath = path.join(__dirname, '..', 'App.css');
    cssContent = fs.readFileSync(cssPath, 'utf-8');
    
    // Parse variables for both themes
    rootVariables = parseCSSVariables(cssContent, ':root');
    darkVariables = parseCSSVariables(cssContent, '.dark');
  });

  describe('Dark Mode CSS Variables', () => {
    it('should set --background to pure black (0 0% 0%) in dark mode', () => {
      expect(darkVariables['background']).toBe('0 0% 0%');
    });

    it('should set --card to 0 0% 6% in dark mode', () => {
      expect(darkVariables['card']).toBe('0 0% 6%');
    });

    it('should set --border to 0 0% 20% in dark mode', () => {
      expect(darkVariables['border']).toBe('0 0% 20%');
    });

    it('should set --primary hue in teal range (170-176 degrees) in dark mode', () => {
      const primary = darkVariables['primary'];
      
      // Parse HSL value (format: "H S% L%")
      const match = primary.match(/^(\d+)\s+(\d+)%\s+(\d+)%$/);
      expect(match).not.toBeNull();
      
      if (match) {
        const hue = parseInt(match[1], 10);
        expect(hue).toBeGreaterThanOrEqual(170);
        expect(hue).toBeLessThanOrEqual(176);
      }
    });

    it('should set --popover to match --card (0 0% 6%) in dark mode', () => {
      expect(darkVariables['popover']).toBe('0 0% 6%');
    });

    it('should set --muted to 0 0% 12% in dark mode', () => {
      expect(darkVariables['muted']).toBe('0 0% 12%');
    });

    it('should set --input to match --border (0 0% 20%) in dark mode', () => {
      expect(darkVariables['input']).toBe('0 0% 20%');
    });

    it('should set --foreground to high contrast white (0 0% 98%) in dark mode', () => {
      expect(darkVariables['foreground']).toBe('0 0% 98%');
    });
  });

  describe('Light Mode CSS Variables', () => {
    it('should keep --background as pure white (0 0% 100%) in light mode', () => {
      expect(rootVariables['background']).toBe('0 0% 100%');
    });

    it('should keep --card as white (0 0% 100%) in light mode', () => {
      expect(rootVariables['card']).toBe('0 0% 100%');
    });

    it('should keep --border as light gray (214.3 31.8% 91.4%) in light mode', () => {
      expect(rootVariables['border']).toBe('214.3 31.8% 91.4%');
    });

    it('should keep --primary hue in teal range (170-176 degrees) in light mode', () => {
      const primary = rootVariables['primary'];
      
      // Parse HSL value
      const match = primary.match(/^(\d+)\s+(\d+)%\s+(\d+)%$/);
      expect(match).not.toBeNull();
      
      if (match) {
        const hue = parseInt(match[1], 10);
        expect(hue).toBeGreaterThanOrEqual(170);
        expect(hue).toBeLessThanOrEqual(176);
      }
    });

    it('should keep --foreground as deep navy (222 47% 11%) in light mode', () => {
      expect(rootVariables['foreground']).toBe('222 47% 11%');
    });
  });

  describe('Semantic Status Colors in Dark Mode', () => {
    it('should set --success to visible green (142 70% 45%) in dark mode', () => {
      expect(darkVariables['success']).toBe('142 70% 45%');
    });

    it('should set --warning to bright amber (38 92% 55%) in dark mode', () => {
      expect(darkVariables['warning']).toBe('38 92% 55%');
    });

    it('should set --info to bright blue (217 91% 60%) in dark mode', () => {
      expect(darkVariables['info']).toBe('217 91% 60%');
    });

    it('should set --destructive to visible red (0 85% 55%) in dark mode', () => {
      expect(darkVariables['destructive']).toBe('0 85% 55%');
    });
  });

  describe('Chart Colors in Dark Mode', () => {
    it('should set --chart-1 to bright teal (173 80% 55%) in dark mode', () => {
      expect(darkVariables['chart-1']).toBe('173 80% 55%');
    });

    it('should set --chart-2 to solar orange (27 96% 65%) in dark mode', () => {
      expect(darkVariables['chart-2']).toBe('27 96% 65%');
    });

    it('should set --chart-3 to distinct blue (217 70% 55%) in dark mode', () => {
      expect(darkVariables['chart-3']).toBe('217 70% 55%');
    });

    it('should set --chart-4 to bright yellow (43 90% 65%) in dark mode', () => {
      expect(darkVariables['chart-4']).toBe('43 90% 65%');
    });

    it('should set --chart-5 to success green (142 70% 50%) in dark mode', () => {
      expect(darkVariables['chart-5']).toBe('142 70% 50%');
    });
  });
});
