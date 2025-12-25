#!/usr/bin/env node

/**
 * Phase 2 Migration Script
 * 
 * Runs all component migration codemods for the Professional Design System
 * Usage: node scripts/migrate-phase2.js [--dry-run]
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const isDryRun = process.argv.includes('--dry-run');
const srcPath = path.join(__dirname, '../src');

console.log('🚀 Starting Phase 2: Component Library Migration');
console.log(`📁 Target directory: ${srcPath}`);
console.log(`🔍 Mode: ${isDryRun ? 'DRY RUN' : 'LIVE MIGRATION'}`);
console.log('');

// Check if jscodeshift is installed
try {
  execSync('jscodeshift --version', { stdio: 'ignore' });
} catch (error) {
  console.error('❌ jscodeshift is not installed globally');
  console.log('📦 Installing jscodeshift...');
  try {
    execSync('npm install -g jscodeshift', { stdio: 'inherit' });
    console.log('✅ jscodeshift installed successfully');
  } catch (installError) {
    console.error('❌ Failed to install jscodeshift');
    console.log('💡 Please run: npm install -g jscodeshift');
    process.exit(1);
  }
}

const codemods = [
  {
    name: 'Color Migration',
    file: 'migrate-colors.js',
    description: 'Migrates legacy color classes to Professional Design System colors'
  },
  {
    name: 'Button Migration', 
    file: 'migrate-buttons.js',
    description: 'Migrates button patterns to Professional Button components'
  },
  {
    name: 'Input Migration',
    file: 'migrate-inputs.js', 
    description: 'Migrates input patterns to Professional Input components'
  },
  {
    name: 'Card Migration',
    file: 'migrate-cards.js',
    description: 'Migrates card patterns to Professional Card components'
  }
];

let totalChanges = 0;
const results = [];

for (const codemod of codemods) {
  console.log(`🔄 Running ${codemod.name}...`);
  console.log(`   ${codemod.description}`);
  
  const codemodPath = path.join(__dirname, 'codemods', codemod.file);
  
  if (!fs.existsSync(codemodPath)) {
    console.error(`❌ Codemod file not found: ${codemodPath}`);
    continue;
  }
  
  try {
    const command = `jscodeshift -t ${codemodPath} ${srcPath} --parser=tsx ${isDryRun ? '--dry' : ''}`;
    const output = execSync(command, { encoding: 'utf8' });
    
    // Parse jscodeshift output to count changes
    const lines = output.split('\n');
    const resultsLine = lines.find(line => line.includes('Results:'));
    const changedFiles = lines.filter(line => line.includes('transformed')).length;
    
    results.push({
      name: codemod.name,
      success: true,
      changedFiles,
      output: output.trim()
    });
    
    totalChanges += changedFiles;
    
    if (changedFiles > 0) {
      console.log(`✅ ${codemod.name} completed - ${changedFiles} files modified`);
    } else {
      console.log(`ℹ️  ${codemod.name} completed - no changes needed`);
    }
    
  } catch (error) {
    console.error(`❌ ${codemod.name} failed:`);
    console.error(error.message);
    results.push({
      name: codemod.name,
      success: false,
      error: error.message
    });
  }
  
  console.log('');
}

// Summary
console.log('📊 Migration Summary');
console.log('='.repeat(50));

results.forEach(result => {
  if (result.success) {
    console.log(`✅ ${result.name}: ${result.changedFiles || 0} files modified`);
  } else {
    console.log(`❌ ${result.name}: Failed - ${result.error}`);
  }
});

console.log('');
console.log(`📈 Total files modified: ${totalChanges}`);

if (isDryRun) {
  console.log('');
  console.log('🔍 This was a dry run - no files were actually modified');
  console.log('💡 Run without --dry-run to apply changes');
} else if (totalChanges > 0) {
  console.log('');
  console.log('🎉 Phase 2 migration completed successfully!');
  console.log('');
  console.log('📋 Next steps:');
  console.log('1. Review the changes in your version control');
  console.log('2. Test the application to ensure everything works');
  console.log('3. Update imports to use Professional components where needed');
  console.log('4. Run the build process to verify no errors');
  console.log('');
  console.log('🔧 Recommended commands:');
  console.log('   npm run build     # Verify build works');
  console.log('   npm run test      # Run tests');
  console.log('   npm run lint      # Check for linting issues');
} else {
  console.log('');
  console.log('ℹ️  No changes were needed - your codebase is already up to date!');
}

console.log('');
console.log('📚 For more information, see:');
console.log('   - src/theme/migration-guide.md');
console.log('   - src/theme/DESIGN_TOKENS_DOCUMENTATION.md');
console.log('   - Component documentation in src/components/ui/');