/**
 * Icon Usage Analyzer
 * 
 * This script analyzes the codebase to find all Iconify icon usages
 * and generates a report to help with migration planning.
 * 
 * Run: node scripts/analyze-icons.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const iconUsageMap = new Map();
const fileIconMap = new Map();

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Match icon="tabler:icon-name" or icon='tabler:icon-name'
  const iconRegex = /icon=["']([^"']+)["']/g;
  let match;
  
  const iconsInFile = [];
  
  while ((match = iconRegex.exec(content)) !== null) {
    const iconName = match[1];
    iconsInFile.push(iconName);
    
    if (iconUsageMap.has(iconName)) {
      iconUsageMap.set(iconName, iconUsageMap.get(iconName) + 1);
    } else {
      iconUsageMap.set(iconName, 1);
    }
  }
  
  if (iconsInFile.length > 0) {
    fileIconMap.set(filePath, iconsInFile);
  }
}

function walkDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules, dist, build directories
      if (!['node_modules', 'dist', 'build', '.git'].includes(file)) {
        walkDirectory(filePath);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      analyzeFile(filePath);
    }
  }
}

function generateReport() {
  console.log('\n=== ICON USAGE ANALYSIS ===\n');
  
  // Sort by usage count
  const sortedIcons = Array.from(iconUsageMap.entries())
    .sort((a, b) => b[1] - a[1]);
  
  console.log(`Total unique icons: ${sortedIcons.length}`);
  console.log(`Total icon usages: ${sortedIcons.reduce((sum, [, count]) => sum + count, 0)}`);
  console.log(`Files with icons: ${fileIconMap.size}\n`);
  
  console.log('=== TOP 30 MOST USED ICONS ===\n');
  sortedIcons.slice(0, 30).forEach(([icon, count]) => {
    console.log(`${icon.padEnd(40)} ${count} usages`);
  });
  
  console.log('\n=== ALL ICONS (Alphabetical) ===\n');
  const alphabetical = Array.from(iconUsageMap.keys()).sort();
  alphabetical.forEach(icon => {
    console.log(`- ${icon} (${iconUsageMap.get(icon)} usages)`);
  });
  
  // Generate JSON report
  const report = {
    summary: {
      totalUniqueIcons: sortedIcons.length,
      totalUsages: sortedIcons.reduce((sum, [, count]) => sum + count, 0),
      filesWithIcons: fileIconMap.size,
    },
    topIcons: sortedIcons.slice(0, 30).map(([icon, count]) => ({ icon, count })),
    allIcons: alphabetical.map(icon => ({ icon, count: iconUsageMap.get(icon) })),
    fileBreakdown: Array.from(fileIconMap.entries()).map(([file, icons]) => ({
      file: file.replace(process.cwd(), ''),
      iconCount: icons.length,
      icons: [...new Set(icons)], // unique icons per file
    })),
  };
  
  fs.writeFileSync(
    'icon-usage-report.json',
    JSON.stringify(report, null, 2)
  );
  
  console.log('\n✓ Detailed report saved to: icon-usage-report.json\n');
}

// Run analysis
const srcDir = path.join(process.cwd(), 'src');
walkDirectory(srcDir);
generateReport();
