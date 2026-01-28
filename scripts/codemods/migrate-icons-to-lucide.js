#!/usr/bin/env node

/**
 * Codemod: Migrate HugeiconsIcon to Lucide React
 * 
 * This script:
 * 1. Replaces HugeiconsIcon imports with Lucide React icons
 * 2. Converts icon usage from HugeiconsIcon component to direct Lucide icons
 * 3. Standardizes icon sizing to Tailwind classes (w-4 h-4, w-5 h-5, w-6 h-6)
 * 4. Maps Hugeicons names to Lucide equivalents
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Icon mapping from Hugeicons to Lucide React
const ICON_MAP = {
  // Core icons
  'Home01Icon': 'Home',
  'ClipboardIcon': 'ClipboardList',
  'Building01Icon': 'Building2',
  'UserMultipleIcon': 'Users',
  'Wrench01Icon': 'Wrench',
  'Archive01Icon': 'Archive',
  'Location03Icon': 'MapPin',
  'Calendar01Icon': 'Calendar',
  'ChartLineData01Icon': 'TrendingUp',
  'MessageIcon': 'MessageSquare',
  'Settings01Icon': 'Settings',
  'Settings02Icon': 'Settings',
  'UserIcon': 'User',
  'PaintBoardIcon': 'Palette',
  
  // Actions
  'Add01Icon': 'Plus',
  'RefreshIcon': 'RefreshCw',
  'Cancel01Icon': 'X',
  'Tick01Icon': 'Check',
  'CheckmarkCircle01Icon': 'CheckCircle',
  'Loading01Icon': 'Loader2',
  'PauseIcon': 'Pause',
  
  // UI Elements
  'Search01Icon': 'Search',
  'InformationCircleIcon': 'Info',
  'Alert01Icon': 'AlertCircle',
  'TagIcon': 'Tag',
  'Clock01Icon': 'Clock',
  'MapsIcon': 'Map',
  
  // Auth & Security
  'Mail01Icon': 'Mail',
  'LockIcon': 'Lock',
  'EyeIcon': 'Eye',
  'ToolsIcon': 'Wrench',
  
  // Vehicles
  'Motorbike01Icon': 'Bike',
  
  // Navigation
  'ArrowLeft01Icon': 'ArrowLeft',
  'Menu02Icon': 'Menu',
};

// Size mapping based on context
const SIZE_MAP = {
  '16': 'w-4 h-4',
  '18': 'w-4 h-4', // Round down to 16px
  '20': 'w-5 h-5',
  '24': 'w-6 h-6',
  '32': 'w-8 h-8',
  '36': 'w-9 h-9',
};

function migrateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Check if file uses HugeiconsIcon
  if (!content.includes('HugeiconsIcon') && !content.includes('@hugeicons')) {
    return false;
  }
  
  console.log(`\nMigrating: ${filePath}`);
  
  // Step 1: Collect all Hugeicons imports
  const hugeiconsImports = new Set();
  const importRegex = /import\s+{([^}]+)}\s+from\s+['"]@hugeicons\/(?:react|core-free-icons)['"]/g;
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    const imports = match[1].split(',').map(i => i.trim());
    imports.forEach(imp => {
      if (imp && ICON_MAP[imp]) {
        hugeiconsImports.add(imp);
      }
    });
  }
  
  // Step 2: Remove HugeiconsIcon and Hugeicons imports
  content = content.replace(/import\s+{\s*HugeiconsIcon\s*}\s+from\s+['"]@hugeicons\/react['"];?\n?/g, '');
  content = content.replace(/import\s+{[^}]+}\s+from\s+['"]@hugeicons\/(?:react|core-free-icons)['"];?\n?/g, '');
  
  // Step 3: Add Lucide React imports
  if (hugeiconsImports.size > 0) {
    const lucideIcons = Array.from(hugeiconsImports)
      .map(icon => ICON_MAP[icon])
      .filter(Boolean)
      .sort();
    
    const lucideImport = `import { ${lucideIcons.join(', ')} } from 'lucide-react';\n`;
    
    // Find the best place to insert (after other imports)
    const lastImportMatch = content.match(/import[^;]+;(?:\n|$)/g);
    if (lastImportMatch) {
      const lastImport = lastImportMatch[lastImportMatch.length - 1];
      const insertIndex = content.lastIndexOf(lastImport) + lastImport.length;
      content = content.slice(0, insertIndex) + lucideImport + content.slice(insertIndex);
    } else {
      // No imports found, add at the top
      content = lucideImport + content;
    }
    
    modified = true;
  }
  
  // Step 4: Replace HugeiconsIcon usage with direct Lucide icons
  // Pattern: <HugeiconsIcon icon={IconName} size={16} className="..." />
  const hugeiconsUsageRegex = /<HugeiconsIcon\s+icon={([^}]+)}\s*(?:size={(\d+)})?\s*(?:className="([^"]*)")?\s*\/>/g;
  
  content = content.replace(hugeiconsUsageRegex, (match, iconName, size, className) => {
    const lucideIcon = ICON_MAP[iconName];
    if (!lucideIcon) {
      console.warn(`  ⚠️  No mapping for ${iconName}`);
      return match;
    }
    
    // Determine size class
    let sizeClass = 'w-5 h-5'; // Default to 20px
    if (size && SIZE_MAP[size]) {
      sizeClass = SIZE_MAP[size];
    }
    
    // Merge className
    let finalClassName = sizeClass;
    if (className) {
      // Remove any existing w-* h-* classes from className
      const cleanedClassName = className.replace(/\b[wh]-\d+\b/g, '').trim();
      finalClassName = cleanedClassName ? `${sizeClass} ${cleanedClassName}` : sizeClass;
    }
    
    modified = true;
    return `<${lucideIcon} className="${finalClassName}" />`;
  });
  
  // Step 5: Replace icon references in props (e.g., icon={IconName})
  hugeiconsImports.forEach(hugeIcon => {
    const lucideIcon = ICON_MAP[hugeIcon];
    if (lucideIcon) {
      // Replace in icon prop assignments
      const iconPropRegex = new RegExp(`icon:\\s*${hugeIcon}`, 'g');
      content = content.replace(iconPropRegex, `icon: ${lucideIcon}`);
      
      // Replace in JSX props
      const jsxPropRegex = new RegExp(`icon={${hugeIcon}}`, 'g');
      content = content.replace(jsxPropRegex, `icon={${lucideIcon}}`);
    }
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  ✅ Migrated successfully`);
    return true;
  }
  
  return false;
}

function walkDirectory(dir, callback) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and other build directories
      if (!['node_modules', 'dist', 'build', '.git'].includes(file)) {
        walkDirectory(filePath, callback);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      callback(filePath);
    }
  });
}

// Main execution
const srcDir = path.join(path.dirname(__dirname), '..', 'src');
let migratedCount = 0;

console.log('🔄 Starting Hugeicons → Lucide React migration...\n');
console.log('📁 Scanning directory:', srcDir);

walkDirectory(srcDir, (filePath) => {
  if (migrateFile(filePath)) {
    migratedCount++;
  }
});

console.log(`\n✨ Migration complete! ${migratedCount} files updated.`);
console.log('\n📝 Next steps:');
console.log('  1. Review the changes with git diff');
console.log('  2. Run npm install lucide-react (if not already installed)');
console.log('  3. Run npm uninstall @hugeicons/react @hugeicons/core-free-icons');
console.log('  4. Test the application');
