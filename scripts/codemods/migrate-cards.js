/**
 * Card Migration Codemod
 * 
 * Automatically migrates legacy card patterns to Professional Design System
 * Usage: jscodeshift -t scripts/codemods/migrate-cards.js src/
 */

const jscodeshift = require('jscodeshift');

module.exports = function transformer(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  let hasChanges = false;

  // Replace card patterns
  root
    .find(j.JSXElement, {
      openingElement: { name: { name: 'div' } }
    })
    .forEach(path => {
      const classNameAttr = path.value.openingElement.attributes.find(
        attr => attr.name && attr.name.name === 'className'
      );
      
      if (classNameAttr && classNameAttr.value && classNameAttr.value.value) {
        let className = classNameAttr.value.value;
        let originalClassName = className;
        
        // Replace basic card pattern
        if (className.includes('bg-white') && 
            className.includes('border') && 
            className.includes('rounded') &&
            className.includes('shadow')) {
          
          // Determine card variant based on shadow
          if (className.includes('shadow-lg') || className.includes('shadow-xl')) {
            className = className.replace(
              /bg-white\s+border\s+border-gray-\d+\s+rounded[^"]*shadow[^"]*p-\d+/g,
              'card-elevated p-6'
            );
          } else if (className.includes('shadow-sm')) {
            className = className.replace(
              /bg-white\s+border\s+border-gray-\d+\s+rounded[^"]*shadow-sm[^"]*p-\d+/g,
              'card-base p-6'
            );
          } else {
            className = className.replace(
              /bg-white\s+border\s+border-gray-\d+\s+rounded[^"]*shadow[^"]*p-\d+/g,
              'card-base p-6'
            );
          }
          hasChanges = true;
        }
        
        // Replace interactive card pattern
        if (className.includes('cursor-pointer') && 
            className.includes('hover:shadow')) {
          className = className.replace(
            /cursor-pointer.*?hover:shadow[^"]*bg-white[^"]*border[^"]*rounded[^"]*p-\d+/g,
            'card-interactive p-6'
          );
          hasChanges = true;
        }
        
        // Replace metric card pattern (common dashboard card)
        if (className.includes('bg-white') && 
            className.includes('p-6') &&
            (className.includes('text-center') || className.includes('flex-col'))) {
          className = className.replace(
            /bg-white\s+border[^"]*rounded[^"]*shadow[^"]*p-6/g,
            'card-base p-6'
          );
          hasChanges = true;
        }
        
        // Clean up extra spaces
        className = className.replace(/\s+/g, ' ').trim();
        
        if (className !== originalClassName) {
          classNameAttr.value.value = className;
        }
      }
    });

  // Replace status badge patterns
  root
    .find(j.JSXElement, {
      openingElement: { name: { name: 'span' } }
    })
    .forEach(path => {
      const classNameAttr = path.value.openingElement.attributes.find(
        attr => attr.name && attr.name.name === 'className'
      );
      
      if (classNameAttr && classNameAttr.value && classNameAttr.value.value) {
        let className = classNameAttr.value.value;
        let originalClassName = className;
        
        // Replace success badge pattern
        if (className.includes('bg-green-100') && className.includes('text-green-800')) {
          className = className.replace(
            /bg-green-\d+\s+text-green-\d+\s+px-\d+\s+py-\d+\s+rounded[^"]*text-\w+/g,
            'status-success'
          );
          hasChanges = true;
        }
        
        // Replace warning badge pattern
        if (className.includes('bg-yellow-100') && className.includes('text-yellow-800')) {
          className = className.replace(
            /bg-yellow-\d+\s+text-yellow-\d+\s+px-\d+\s+py-\d+\s+rounded[^"]*text-\w+/g,
            'status-warning'
          );
          hasChanges = true;
        }
        
        // Replace error badge pattern
        if (className.includes('bg-red-100') && className.includes('text-red-800')) {
          className = className.replace(
            /bg-red-\d+\s+text-red-\d+\s+px-\d+\s+py-\d+\s+rounded[^"]*text-\w+/g,
            'status-error'
          );
          hasChanges = true;
        }
        
        // Replace info badge pattern
        if (className.includes('bg-blue-100') && className.includes('text-blue-800')) {
          className = className.replace(
            /bg-blue-\d+\s+text-blue-\d+\s+px-\d+\s+py-\d+\s+rounded[^"]*text-\w+/g,
            'status-info'
          );
          hasChanges = true;
        }
        
        if (className !== originalClassName) {
          classNameAttr.value.value = className;
        }
      }
    });

  // Add import for ProfessionalCard if changes were made
  const hasCardImport = root
    .find(j.ImportDeclaration)
    .some(path => 
      path.value.source.value === '@/components/ui/ProfessionalCard' ||
      path.value.source.value.includes('ProfessionalCard')
    );

  if (hasChanges && !hasCardImport) {
    const firstImport = root.find(j.ImportDeclaration).at(0);
    if (firstImport.length > 0) {
      firstImport.insertBefore(
        j.importDeclaration(
          [
            j.importDefaultSpecifier(j.identifier('ProfessionalCard')),
            j.importSpecifier(j.identifier('MetricCard')),
            j.importSpecifier(j.identifier('DataCard'))
          ],
          j.literal('@/components/ui/ProfessionalCard')
        )
      );
    }
  }

  return hasChanges ? root.toSource() : null;
};

module.exports.parser = 'tsx';