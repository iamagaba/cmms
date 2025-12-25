/**
 * Button Migration Codemod
 * 
 * Automatically migrates legacy button patterns to Professional Design System
 * Usage: jscodeshift -t scripts/codemods/migrate-buttons.js src/
 */

const jscodeshift = require('jscodeshift');

module.exports = function transformer(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  // Track if any changes were made
  let hasChanges = false;

  // Replace common button patterns
  root
    .find(j.JSXElement, {
      openingElement: { name: { name: 'button' } }
    })
    .forEach(path => {
      const classNameAttr = path.value.openingElement.attributes.find(
        attr => attr.name && attr.name.name === 'className'
      );
      
      if (classNameAttr && classNameAttr.value && classNameAttr.value.value) {
        let className = classNameAttr.value.value;
        let originalClassName = className;
        
        // Replace primary button pattern
        if (className.includes('bg-blue-600') && className.includes('hover:bg-blue-700')) {
          className = className.replace(
            /bg-blue-\d+\s+hover:bg-blue-\d+\s+text-white(\s+[^"]*)?/g, 
            'btn-primary'
          );
          hasChanges = true;
        }
        
        // Replace secondary button pattern
        if (className.includes('bg-gray-100') && className.includes('hover:bg-gray-200')) {
          className = className.replace(
            /bg-gray-\d+\s+hover:bg-gray-\d+/g, 
            'btn-secondary'
          );
          hasChanges = true;
        }
        
        // Replace outline button pattern
        if (className.includes('border-blue-') && className.includes('text-blue-')) {
          className = className.replace(
            /border-blue-\d+\s+text-blue-\d+(\s+[^"]*)?/g, 
            'btn-outline'
          );
          hasChanges = true;
        }
        
        // Replace danger button pattern
        if (className.includes('bg-red-') && className.includes('hover:bg-red-')) {
          className = className.replace(
            /bg-red-\d+\s+hover:bg-red-\d+\s+text-white(\s+[^"]*)?/g, 
            'btn-danger'
          );
          hasChanges = true;
        }
        
        // Replace success button pattern
        if (className.includes('bg-green-') && className.includes('hover:bg-green-')) {
          className = className.replace(
            /bg-green-\d+\s+hover:bg-green-\d+\s+text-white(\s+[^"]*)?/g, 
            'btn-success'
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

  // Replace ProfessionalButton imports if they don't exist
  const hasButtonImport = root
    .find(j.ImportDeclaration)
    .some(path => 
      path.value.source.value === '@/components/ui/ProfessionalButton' ||
      path.value.source.value.includes('ProfessionalButton')
    );

  if (hasChanges && !hasButtonImport) {
    // Add import for ProfessionalButton at the top
    const firstImport = root.find(j.ImportDeclaration).at(0);
    if (firstImport.length > 0) {
      firstImport.insertBefore(
        j.importDeclaration(
          [j.importDefaultSpecifier(j.identifier('ProfessionalButton'))],
          j.literal('@/components/ui/ProfessionalButton')
        )
      );
    }
  }

  return hasChanges ? root.toSource() : null;
};

module.exports.parser = 'tsx';