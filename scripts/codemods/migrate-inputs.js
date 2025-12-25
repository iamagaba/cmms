/**
 * Input Migration Codemod
 * 
 * Automatically migrates legacy input patterns to Professional Design System
 * Usage: jscodeshift -t scripts/codemods/migrate-inputs.js src/
 */

const jscodeshift = require('jscodeshift');

module.exports = function transformer(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  let hasChanges = false;

  // Replace input patterns
  root
    .find(j.JSXElement, {
      openingElement: { name: { name: 'input' } }
    })
    .forEach(path => {
      const classNameAttr = path.value.openingElement.attributes.find(
        attr => attr.name && attr.name.name === 'className'
      );
      
      if (classNameAttr && classNameAttr.value && classNameAttr.value.value) {
        let className = classNameAttr.value.value;
        let originalClassName = className;
        
        // Replace common input patterns
        if (className.includes('border-gray-300') && className.includes('focus:border-blue-500')) {
          className = className.replace(
            /border-gray-\d+.*?focus:border-blue-\d+.*?/g,
            'input-base'
          );
          hasChanges = true;
        }
        
        // Replace error input patterns
        if (className.includes('border-red-') || className.includes('focus:border-red-')) {
          className = className.replace(
            /border-red-\d+.*?focus:border-red-\d+.*?/g,
            'input-base input-error'
          );
          hasChanges = true;
        }
        
        // Replace success input patterns
        if (className.includes('border-green-') || className.includes('focus:border-green-')) {
          className = className.replace(
            /border-green-\d+.*?focus:border-green-\d+.*?/g,
            'input-base input-success'
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

  // Replace textarea patterns
  root
    .find(j.JSXElement, {
      openingElement: { name: { name: 'textarea' } }
    })
    .forEach(path => {
      const classNameAttr = path.value.openingElement.attributes.find(
        attr => attr.name && attr.name.name === 'className'
      );
      
      if (classNameAttr && classNameAttr.value && classNameAttr.value.value) {
        let className = classNameAttr.value.value;
        let originalClassName = className;
        
        // Replace common textarea patterns
        if (className.includes('border-gray-300') && className.includes('focus:border-blue-500')) {
          className = className.replace(
            /border-gray-\d+.*?focus:border-blue-\d+.*?/g,
            'input-base'
          );
          hasChanges = true;
        }
        
        if (className !== originalClassName) {
          classNameAttr.value.value = className;
        }
      }
    });

  // Replace select patterns
  root
    .find(j.JSXElement, {
      openingElement: { name: { name: 'select' } }
    })
    .forEach(path => {
      const classNameAttr = path.value.openingElement.attributes.find(
        attr => attr.name && attr.name.name === 'className'
      );
      
      if (classNameAttr && classNameAttr.value && classNameAttr.value.value) {
        let className = classNameAttr.value.value;
        let originalClassName = className;
        
        // Replace common select patterns
        if (className.includes('border-gray-300') && className.includes('focus:border-blue-500')) {
          className = className.replace(
            /border-gray-\d+.*?focus:border-blue-\d+.*?/g,
            'input-base'
          );
          hasChanges = true;
        }
        
        if (className !== originalClassName) {
          classNameAttr.value.value = className;
        }
      }
    });

  // Add import for ProfessionalInput if changes were made
  const hasInputImport = root
    .find(j.ImportDeclaration)
    .some(path => 
      path.value.source.value === '@/components/ui/ProfessionalInput' ||
      path.value.source.value.includes('ProfessionalInput')
    );

  if (hasChanges && !hasInputImport) {
    const firstImport = root.find(j.ImportDeclaration).at(0);
    if (firstImport.length > 0) {
      firstImport.insertBefore(
        j.importDeclaration(
          [
            j.importDefaultSpecifier(j.identifier('ProfessionalInput')),
            j.importSpecifier(j.identifier('ProfessionalTextarea')),
            j.importSpecifier(j.identifier('ProfessionalSelect'))
          ],
          j.literal('@/components/ui/ProfessionalInput')
        )
      );
    }
  }

  return hasChanges ? root.toSource() : null;
};

module.exports.parser = 'tsx';