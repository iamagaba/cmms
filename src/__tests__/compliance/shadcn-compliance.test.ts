/**
 * shadcn/ui Aesthetic Compliance Tests
 * 
 * These tests scan the codebase to ensure adherence to shadcn/ui design principles.
 * They verify universal properties that should hold across all components.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

// Helper function to recursively get all TypeScript/TSX files
function getAllSourceFiles(dir: string = 'src', files: string[] = []): string[] {
  const entries = readdirSync(dir);
  
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Skip node_modules, dist, build, etc.
      if (!['node_modules', 'dist', 'build', '.git', '__tests__'].includes(entry)) {
        getAllSourceFiles(fullPath, files);
      }
    } else if (entry.endsWith('.tsx') || entry.endsWith('.ts')) {
      // Skip test files
      if (!entry.endsWith('.test.ts') && !entry.endsWith('.test.tsx')) {
        files.push(fullPath);
      }
    }
  }
  
  return files;
}

describe('shadcn/ui Compliance Tests', () => {
  const sourceFiles = getAllSourceFiles();
  
  describe('Property 1: No Arbitrary Typography Sizes', () => {
    it('should not use arbitrary font sizes like text-[10px]', () => {
      const arbitrarySizePattern = /text-\[\d+px\]/g;
      const violations: { file: string; matches: string[] }[] = [];
      
      sourceFiles.forEach(file => {
        const content = readFileSync(file, 'utf-8');
        const matches = content.match(arbitrarySizePattern);
        
        if (matches) {
          violations.push({ file, matches });
        }
      });
      
      if (violations.length > 0) {
        console.log('\n❌ Found arbitrary font sizes:');
        violations.forEach(({ file, matches }) => {
          console.log(`  ${file}:`);
          matches.forEach(match => console.log(`    - ${match}`));
        });
      }
      
      expect(violations).toHaveLength(0);
    });
  });
  
  describe('Property 2: No Arbitrary Icon Sizes', () => {
    it('should not use arbitrary icon size props like size={10}', () => {
      const arbitraryIconSizePattern = /size=\{(?:10|11|12|13|14|15|17|18|19|21|22|23|25|26|27|28|29|30|31)\}/g;
      const violations: { file: string; matches: string[] }[] = [];
      
      sourceFiles.forEach(file => {
        const content = readFileSync(file, 'utf-8');
        const matches = content.match(arbitraryIconSizePattern);
        
        if (matches) {
          violations.push({ file, matches });
        }
      });
      
      if (violations.length > 0) {
        console.log('\n❌ Found arbitrary icon sizes:');
        violations.forEach(({ file, matches }) => {
          console.log(`  ${file}:`);
          matches.forEach(match => console.log(`    - ${match}`));
        });
      }
      
      expect(violations).toHaveLength(0);
    });
    
    it('should not use arbitrary icon className sizes like w-[13px]', () => {
      // Only flag small arbitrary sizes (10-30px) that are likely to be icons
      // Larger sizes (e.g., h-[500px] for maps, w-[200px] for sidebars) are acceptable for layout
      const arbitraryIconSizePattern = /[wh]-\[([1-2][0-9]|30)px\]/g;
      const violations: { file: string; matches: string[] }[] = [];
      
      sourceFiles.forEach(file => {
        const content = readFileSync(file, 'utf-8');
        const matches = content.match(arbitraryIconSizePattern);
        
        if (matches) {
          // Filter out common non-icon patterns
          const iconMatches = matches.filter(match => {
            // Allow h-[26px] for license plates and similar UI elements
            if (match === 'h-[26px]') return false;
            return true;
          });
          
          if (iconMatches.length > 0) {
            violations.push({ file, matches: iconMatches });
          }
        }
      });
      
      if (violations.length > 0) {
        console.log('\n❌ Found arbitrary icon className sizes (10-30px range):');
        violations.forEach(({ file, matches }) => {
          console.log(`  ${file}:`);
          matches.forEach(match => console.log(`    - ${match}`));
        });
      }
      
      expect(violations).toHaveLength(0);
    });
  });
  
  describe('Property 3: No Custom Compact Utilities', () => {
    it('should not use custom compact utility classes', () => {
      const compactUtilityPattern = /(p-compact|gap-compact|space-[xy]-compact|px-compact|py-compact)/g;
      const violations: { file: string; matches: string[] }[] = [];
      
      sourceFiles.forEach(file => {
        const content = readFileSync(file, 'utf-8');
        const matches = content.match(compactUtilityPattern);
        
        if (matches) {
          violations.push({ file, matches });
        }
      });
      
      if (violations.length > 0) {
        console.log('\n❌ Found custom compact utilities:');
        violations.forEach(({ file, matches }) => {
          console.log(`  ${file}:`);
          matches.forEach(match => console.log(`    - ${match}`));
        });
      }
      
      expect(violations).toHaveLength(0);
    });
  });
  
  describe('Property 4: No Inline Badge Color Classes', () => {
    it('should not use inline badge color combinations', () => {
      // Pattern to detect common inline badge styling patterns
      const inlineBadgePattern = /className=["'][^"']*bg-(emerald|amber|rose|blue|orange|gray)-50[^"']*text-\1-\d+[^"']*border-\1-\d+[^"']*["']/g;
      const violations: { file: string; matches: string[] }[] = [];
      
      sourceFiles.forEach(file => {
        const content = readFileSync(file, 'utf-8');
        const matches = content.match(inlineBadgePattern);
        
        if (matches) {
          violations.push({ file, matches });
        }
      });
      
      if (violations.length > 0) {
        console.log('\n❌ Found inline badge color classes:');
        violations.forEach(({ file, matches }) => {
          console.log(`  ${file}:`);
          matches.forEach(match => console.log(`    - ${match.substring(0, 100)}...`));
        });
      }
      
      expect(violations).toHaveLength(0);
    });
  });
  
  describe('Property 5: No Hardcoded Color Values', () => {
    it('should not use hardcoded Tailwind color classes (excluding status colors)', () => {
      // Pattern matches bg-{color}-{number}, text-{color}-{number}, etc.
      // Excludes status colors for badges (emerald, amber, rose, blue, orange, gray)
      // These are allowed in badge.tsx and badge helper components
      const hardcodedColorPattern = /(bg|text|border)-(purple|indigo|pink|cyan|teal|lime|green|yellow|red|slate|zinc|neutral|stone)-\d+/g;
      const violations: { file: string; matches: string[] }[] = [];
      
      sourceFiles.forEach(file => {
        const content = readFileSync(file, 'utf-8');
        const matches = content.match(hardcodedColorPattern);
        
        // Allow hardcoded colors in badge.tsx and badge helper components
        // Allow neutral colors in TV dashboard components (intentional for large displays)
        // Allow colors in demo/design-system components (educational/showcase)
        // Allow colors in chat components (WhatsApp branding)
        const isBadgeComponent = file.includes('badge.tsx') || file.includes('Badge.tsx');
        const isTVComponent = file.includes('/tv/') || file.includes('\\tv\\') || file.includes('TVDashboard');
        const isHelperFile = file.includes('-helpers.ts');
        const isDemoComponent = file.includes('/demo/') || file.includes('\\demo\\');
        const isChatComponent = file.includes('/chat/') || file.includes('\\chat\\') || file.includes('WhatsAppTest');
        
        if (matches && !isBadgeComponent && !isTVComponent && !isHelperFile && !isDemoComponent && !isChatComponent) {
          violations.push({ file, matches });
        }
      });
      
      if (violations.length > 0) {
        console.log('\n❌ Found hardcoded color values:');
        console.log('Note: TV dashboard, demo/design-system, and chat components are excluded (intentional colors)');
        violations.forEach(({ file, matches }) => {
          console.log(`  ${file}:`);
          matches.forEach(match => console.log(`    - ${match}`));
        });
      }
      
      expect(violations).toHaveLength(0);
    });
  });
  
  describe('Compliance Summary', () => {
    it('should report total files scanned', () => {
      console.log(`\n✅ Scanned ${sourceFiles.length} source files for compliance`);
      expect(sourceFiles.length).toBeGreaterThan(0);
    });
  });
});
