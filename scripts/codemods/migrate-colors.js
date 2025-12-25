/**
 * Color Migration Codemod
 * 
 * Automatically migrates legacy color classes to Professional Design System colors
 * Usage: jscodeshift -t scripts/codemods/migrate-colors.js src/
 */

const jscodeshift = require('jscodeshift');

const colorMappings = {
  'blue': 'steel',
  'green': 'industrial', 
  'red': 'warning',
  'yellow': 'maintenance',
  'orange': 'safety'
};

module.exports = function transformer(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  let hasChanges = false;

  // Replace color classes in className attributes
  root
    .find(j.JSXAttribute, { name: { name: 'className' } })
    .forEach(path => {
      if (path.value.value && path.value.value.value) {
        let className = path.value.value.value;
        let originalClassName = className;
        
        Object.entries(colorMappings).forEach(([oldColor, newColor]) => {
          // Replace background colors
          const bgRegex = new RegExp(`\\b(bg-)${oldColor}-(\\d+)\\b`, 'g');
          className = className.replace(bgRegex, `$1${newColor}-$2`);
          
          // Replace text colors
          const textRegex = new RegExp(`\\b(text-)${oldColor}-(\\d+)\\b`, 'g');
          className = className.replace(textRegex, `$1${newColor}-$2`);
          
          // Replace border colors
          const borderRegex = new RegExp(`\\b(border-)${oldColor}-(\\d+)\\b`, 'g');
          className = className.replace(borderRegex, `$1${newColor}-$2`);
          
          // Replace ring colors
          const ringRegex = new RegExp(`\\b(ring-)${oldColor}-(\\d+)\\b`, 'g');
          className = className.replace(ringRegex, `$1${newColor}-$2`);
          
          // Replace hover states
          const hoverBgRegex = new RegExp(`\\b(hover:bg-)${oldColor}-(\\d+)\\b`, 'g');
          className = className.replace(hoverBgRegex, `$1${newColor}-$2`);
          
          const hoverTextRegex = new RegExp(`\\b(hover:text-)${oldColor}-(\\d+)\\b`, 'g');
          className = className.replace(hoverTextRegex, `$1${newColor}-$2`);
          
          const hoverBorderRegex = new RegExp(`\\b(hover:border-)${oldColor}-(\\d+)\\b`, 'g');
          className = className.replace(hoverBorderRegex, `$1${newColor}-$2`);
          
          // Replace focus states
          const focusRingRegex = new RegExp(`\\b(focus:ring-)${oldColor}-(\\d+)\\b`, 'g');
          className = className.replace(focusRingRegex, `$1${newColor}-$2`);
          
          const focusBorderRegex = new RegExp(`\\b(focus:border-)${oldColor}-(\\d+)\\b`, 'g');
          className = className.replace(focusBorderRegex, `$1${newColor}-$2`);
        });
        
        if (className !== originalClassName) {
          path.value.value.value = className;
          hasChanges = true;
        }
      }
    });

  // Also handle template literals and string concatenations
  root
    .find(j.TemplateLiteral)
    .forEach(path => {
      path.value.quasis.forEach(quasi => {
        if (quasi.value && quasi.value.raw) {
          let content = quasi.value.raw;
          let originalContent = content;
          
          Object.entries(colorMappings).forEach(([oldColor, newColor]) => {
            const regex = new RegExp(`\\b(bg-|text-|border-|ring-|hover:bg-|hover:text-|hover:border-|focus:ring-|focus:border-)${oldColor}-(\\d+)\\b`, 'g');
            content = content.replace(regex, `$1${newColor}-$2`);
          });
          
          if (content !== originalContent) {
            quasi.value.raw = content;
            quasi.value.cooked = content;
            hasChanges = true;
          }
        }
      });
    });

  return hasChanges ? root.toSource() : null;
};

module.exports.parser = 'tsx';