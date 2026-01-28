import { readFileSync, readdirSync, statSync } from 'fs';
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

// Check for hardcoded colors
const hardcodedColorPattern = /(bg|text|border)-(purple|indigo|pink|cyan|teal|lime|green|yellow|red|slate|zinc|neutral|stone)-\d+/g;
const colorViolations = [];

sourceFiles.forEach(file => {
  const content = readFileSync(file, 'utf-8');
  const matches = content.match(hardcodedColorPattern);
  
  if (matches && !file.includes('badge.tsx') && !file.includes('Badge.tsx')) {
    colorViolations.push({ file, count: matches.length });
  }
});

// Check for arbitrary icon sizes
const arbitraryIconSizePattern = /size=\{(?:10|11|12|13|14|15|17|18|19|21|22|23|25|26|27|28|29|30|31)\}/g;
const iconSizeViolations = [];

sourceFiles.forEach(file => {
  const content = readFileSync(file, 'utf-8');
  const matches = content.match(arbitraryIconSizePattern);
  
  if (matches) {
    iconSizeViolations.push({ file, count: matches.length });
  }
});

// Check for arbitrary icon className sizes
const arbitraryIconClassPattern = /[wh]-\[([1-2][0-9]|30)px\]/g;
const iconClassViolations = [];

sourceFiles.forEach(file => {
  const content = readFileSync(file, 'utf-8');
  const matches = content.match(arbitraryIconClassPattern);
  
  if (matches) {
    const iconMatches = matches.filter(match => match !== 'h-[26px]');
    if (iconMatches.length > 0) {
      iconClassViolations.push({ file, count: iconMatches.length });
    }
  }
});

console.log('\n=== HARDCODED COLOR VIOLATIONS ===');
console.log(`Total files: ${colorViolations.length}`);
colorViolations.sort((a, b) => b.count - a.count).forEach(({ file, count }) => {
  console.log(`${file} (${count} violations)`);
});

console.log('\n=== ARBITRARY ICON SIZE VIOLATIONS (size={N}) ===');
console.log(`Total files: ${iconSizeViolations.length}`);
iconSizeViolations.sort((a, b) => b.count - a.count).forEach(({ file, count }) => {
  console.log(`${file} (${count} violations)`);
});

console.log('\n=== ARBITRARY ICON CLASS VIOLATIONS (w-[Npx]) ===');
console.log(`Total files: ${iconClassViolations.length}`);
iconClassViolations.sort((a, b) => b.count - a.count).forEach(({ file, count }) => {
  console.log(`${file} (${count} violations)`);
});

console.log('\n=== SUMMARY ===');
console.log(`Hardcoded colors: ${colorViolations.length} files`);
console.log(`Icon size props: ${iconSizeViolations.length} files`);
console.log(`Icon class sizes: ${iconClassViolations.length} files`);
