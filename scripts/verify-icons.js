#!/usr/bin/env node

/**
 * Icon Import Verification Script
 * 
 * This script verifies that all lucide-react icons used in design system
 * components are properly imported. Run this before committing changes
 * to design system files.
 * 
 * Usage: node scripts/verify-icons.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const DESIGN_SYSTEM_PATH = 'src/components/demo/design-system';

// Common lucide-react icons used in the design system
const KNOWN_ICONS = [
  'AlertCircle', 'ArrowLeft', 'Calendar', 'Car', 'Check', 'CheckCircle',
  'ChevronRight', 'Clock', 'ClipboardList', 'Edit', 'Eye', 'EyeOff',
  'Folder', 'Info', 'Inbox', 'LayoutGrid', 'MoreVertical', 'Package',
  'Palette', 'Plus', 'RefreshCw', 'Settings', 'Smartphone', 'Tag',
  'Trash2', 'User', 'X'
];

function extractImportedIcons(content) {
  const importMatch = content.match(/import\s+{([^}]+)}\s+from\s+['"]lucide-react['"]/);
  if (!importMatch) return [];
  
  return importMatch[1]
    .split(',')
    .map(icon => icon.trim())
    .map(icon => icon.includes(' as ') ? icon.split(' as ')[0].trim() : icon)
    .filter(Boolean);
}

function extractUsedIcons(content) {
  const usedIcons = new Set();
  
  // Match icon components: <IconName className=
  const iconPattern = /<([A-Z][a-zA-Z]+)\s+className=/g;
  let match;
  
  while ((match = iconPattern.exec(content)) !== null) {
    const iconName = match[1];
    // Filter out non-icon components (Card, Button, etc.)
    if (KNOWN_ICONS.includes(iconName)) {
      usedIcons.add(iconName);
    }
  }
  
  return Array.from(usedIcons);
}

function verifyFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const imported = extractImportedIcons(content);
  const used = extractUsedIcons(content);
  
  const missing = used.filter(icon => !imported.includes(icon));
  const unused = imported.filter(icon => !used.includes(icon) && !icon.includes('Icon'));
  
  return { missing, unused };
}

function main() {
  console.log('🔍 Verifying icon imports in design system components...\n');
  
  const files = glob.sync(`${DESIGN_SYSTEM_PATH}/*.tsx`);
  let hasErrors = false;
  let totalFiles = 0;
  let filesWithIssues = 0;
  
  files.forEach(file => {
    totalFiles++;
    const { missing, unused } = verifyFile(file);
    const fileName = path.basename(file);
    
    if (missing.length > 0 || unused.length > 0) {
      filesWithIssues++;
      console.log(`❌ ${fileName}`);
      
      if (missing.length > 0) {
        console.log(`   Missing imports: ${missing.join(', ')}`);
        hasErrors = true;
      }
      
      if (unused.length > 0) {
        console.log(`   ⚠️  Unused imports: ${unused.join(', ')}`);
      }
      
      console.log('');
    }
  });
  
  if (!hasErrors && filesWithIssues === 0) {
    console.log(`✅ All ${totalFiles} files verified successfully!`);
    console.log('   No missing or unused icon imports found.\n');
  } else if (!hasErrors) {
    console.log(`✅ No missing imports found in ${totalFiles} files.`);
    console.log(`⚠️  ${filesWithIssues} file(s) have unused imports (not critical).\n`);
  } else {
    console.log(`❌ Found issues in ${filesWithIssues} out of ${totalFiles} files.`);
    console.log('   Please fix missing imports before committing.\n');
    process.exit(1);
  }
}

main();
