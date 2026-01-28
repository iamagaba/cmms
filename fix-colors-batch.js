import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

function getAllSourceFiles(dir = 'src', files = []) {
  const entries = readdirSync(dir);
  
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (!['node_modules', 'dist', 'build', '.git', '__tests__'].includes(entry)) {
        getAllSourceFiles(fullPath, files);
      }
    } else if (entry.endsWith('.tsx') || entry.endsWith('.ts')) {
      if (!entry.endsWith('.test.ts') && !entry.endsWith('.test.tsx')) {
        files.push(fullPath);
      }
    }
  }
  
  return files;
}

const sourceFiles = getAllSourceFiles();

// Define replacement patterns
const replacements = [
  // Purple colors -> primary
  { from: /bg-purple-50\b/g, to: 'bg-primary/5' },
  { from: /bg-purple-100\b/g, to: 'bg-primary/10' },
  { from: /text-purple-600\b/g, to: 'text-primary' },
  { from: /text-purple-700\b/g, to: 'text-primary' },
  { from: /border-purple-200\b/g, to: 'border-primary/20' },
  { from: /border-purple-800\b/g, to: 'border-primary/20' },
  
  // Emerald/green colors (except status badges) -> muted or foreground
  { from: /text-emerald-600(?! dark:text-emerald-400)/g, to: 'text-foreground' },
  { from: /text-emerald-700/g, to: 'text-foreground' },
  { from: /bg-emerald-100\b/g, to: 'bg-muted' },
  { from: /bg-emerald-50\b/g, to: 'bg-muted' },
  
  // Blue colors -> muted or foreground
  { from: /text-blue-600\b/g, to: 'text-muted-foreground' },
  { from: /text-blue-700\b/g, to: 'text-muted-foreground' },
  { from: /bg-blue-100\b/g, to: 'bg-muted' },
  { from: /bg-blue-50\b/g, to: 'bg-muted' },
  
  // Orange colors -> muted or foreground
  { from: /text-orange-600\b/g, to: 'text-muted-foreground' },
  { from: /text-orange-700\b/g, to: 'text-muted-foreground' },
  { from: /bg-orange-100\b/g, to: 'bg-muted' },
  { from: /bg-orange-50\b/g, to: 'bg-muted' },
];

let totalFiles = 0;
let totalReplacements = 0;

sourceFiles.forEach(file => {
  // Skip badge files and helper files
  if (file.includes('badge.tsx') || file.includes('Badge.tsx') || 
      file.includes('inventory-categorization-helpers') ||
      file.includes('stock-adjustment-helpers')) {
    return;
  }
  
  let content = readFileSync(file, 'utf-8');
  let fileChanged = false;
  let fileReplacements = 0;
  
  replacements.forEach(({ from, to }) => {
    const matches = content.match(from);
    if (matches) {
      content = content.replace(from, to);
      fileChanged = true;
      fileReplacements += matches.length;
    }
  });
  
  if (fileChanged) {
    writeFileSync(file, content, 'utf-8');
    totalFiles++;
    totalReplacements += fileReplacements;
    console.log(`✓ ${file} (${fileReplacements} replacements)`);
  }
});

console.log(`\n✅ Fixed ${totalFiles} files with ${totalReplacements} total replacements`);
