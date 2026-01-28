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

// Define replacement patterns for remaining colors
const replacements = [
  // Red colors (non-destructive contexts) -> muted
  { from: /bg-red-50(?! )/g, to: 'bg-destructive/5' },
  { from: /bg-red-100(?! )/g, to: 'bg-destructive/10' },
  { from: /text-red-600(?! )/g, to: 'text-destructive' },
  { from: /text-red-700(?! )/g, to: 'text-destructive' },
  { from: /border-red-200(?! )/g, to: 'border-destructive/20' },
  { from: /border-red-300(?! )/g, to: 'border-destructive/30' },
  
  // Slate/zinc/neutral colors -> muted
  { from: /bg-slate-50\b/g, to: 'bg-muted' },
  { from: /bg-slate-100\b/g, to: 'bg-muted' },
  { from: /text-slate-600\b/g, to: 'text-muted-foreground' },
  { from: /text-slate-700\b/g, to: 'text-foreground' },
  { from: /bg-zinc-50\b/g, to: 'bg-muted' },
  { from: /bg-zinc-100\b/g, to: 'bg-muted' },
  { from: /text-zinc-600\b/g, to: 'text-muted-foreground' },
  { from: /text-zinc-700\b/g, to: 'text-foreground' },
  
  // Indigo colors -> primary
  { from: /bg-indigo-50\b/g, to: 'bg-primary/5' },
  { from: /bg-indigo-100\b/g, to: 'bg-primary/10' },
  { from: /text-indigo-600\b/g, to: 'text-primary' },
  { from: /text-indigo-700\b/g, to: 'text-primary' },
  { from: /border-indigo-200\b/g, to: 'border-primary/20' },
  
  // Pink colors -> primary
  { from: /bg-pink-50\b/g, to: 'bg-primary/5' },
  { from: /bg-pink-100\b/g, to: 'bg-primary/10' },
  { from: /text-pink-600\b/g, to: 'text-primary' },
  { from: /text-pink-700\b/g, to: 'text-primary' },
  
  // Cyan/teal colors -> muted
  { from: /bg-cyan-50\b/g, to: 'bg-muted' },
  { from: /bg-cyan-100\b/g, to: 'bg-muted' },
  { from: /text-cyan-600\b/g, to: 'text-muted-foreground' },
  { from: /text-cyan-700\b/g, to: 'text-foreground' },
  { from: /bg-teal-50\b/g, to: 'bg-muted' },
  { from: /bg-teal-100\b/g, to: 'bg-muted' },
  { from: /text-teal-600\b/g, to: 'text-muted-foreground' },
  { from: /text-teal-700\b/g, to: 'text-foreground' },
  
  // Lime colors -> muted
  { from: /bg-lime-50\b/g, to: 'bg-muted' },
  { from: /bg-lime-100\b/g, to: 'bg-muted' },
  { from: /text-lime-600\b/g, to: 'text-muted-foreground' },
  { from: /text-lime-700\b/g, to: 'text-foreground' },
  
  // Stone colors -> muted
  { from: /bg-stone-50\b/g, to: 'bg-muted' },
  { from: /bg-stone-100\b/g, to: 'bg-muted' },
  { from: /text-stone-600\b/g, to: 'text-muted-foreground' },
  { from: /text-stone-700\b/g, to: 'text-foreground' },
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
