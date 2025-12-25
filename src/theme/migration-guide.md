# Professional Design System Migration Guide

## Overview

This guide provides a comprehensive strategy for migrating from the current component implementations to the new Professional CMMS Design System. The migration is designed to be gradual, allowing for incremental adoption while maintaining application stability.

## Migration Strategy

### Phase 1: Foundation Setup ✅
- [x] Design token integration with Tailwind CSS
- [x] CSS custom properties generation
- [x] TypeScript definitions
- [x] Utility class generation

### Phase 2: Component Library Migration ✅
- [x] Button components
- [x] Input components
- [x] Card components
- [x] Navigation components
- [x] Status indicators

### Phase 3: Layout and Structure ✅
- [x] Page layouts
- [x] Grid systems
- [x] Responsive patterns
- [x] Navigation structures

### Phase 4: Advanced Components ✅
- [x] Data tables
- [x] Forms
- [x] Modals and drawers
- [x] Charts and visualizations

### Phase 5: Theme System Integration ✅
- [x] Theme switching
- [x] Dark mode support
- [x] Density options
- [x] Brand customization

## Component Migration Mapping

### Buttons

#### Current Implementation
```tsx
// Old button styles
<button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
  Click me
</button>
```

#### New Design System Implementation
```tsx
// New design system button
<button className="btn-primary">
  Click me
</button>

// Or using component
import { Button } from '@/components/ui/Button';
<Button variant="primary">Click me</Button>
```

#### Migration Steps
1. Replace `bg-blue-*` with `btn-primary` utility class
2. Replace `bg-gray-*` with `btn-secondary` utility class
3. Replace custom hover states with design system variants
4. Update focus states to use `focus-ring` utility

### Input Components

#### Current Implementation
```tsx
// Old input styles
<input className="border border-gray-300 px-3 py-2 rounded focus:border-blue-500" />
```

#### New Design System Implementation
```tsx
// New design system input
<input className="input-base" />

// With error state
<input className="input-base input-error" />
```

#### Migration Steps
1. Replace `border-gray-*` with `input-base` utility class
2. Add error states using `input-error` class
3. Update focus states to use design system focus rings

### Card Components

#### Current Implementation
```tsx
// Old card styles
<div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
  Content
</div>
```

#### New Design System Implementation
```tsx
// New design system card
<div className="card-base p-6">
  Content
</div>

// Interactive card
<div className="card-interactive p-6">
  Content
</div>
```

### Status Indicators

#### Current Implementation
```tsx
// Old status badges
<span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
  Success
</span>
```

#### New Design System Implementation
```tsx
// New design system status
<span className="status-success">
  Success
</span>
```

## Color Migration

### Color Mapping Table

| Old Color | New Design System Color | Usage |
|-----------|------------------------|-------|
| `blue-*` | `steel-*` | Primary actions, links |
| `green-*` | `industrial-*` | Success states |
| `yellow-*` | `maintenance-*` | Warning states |
| `red-*` | `warning-*` | Error states |
| `orange-*` | `safety-*` | Alert states |
| `gray-*` | `machinery-*` | Neutral elements |

### Migration Commands

```bash
# Replace blue colors with steel
find src -name "*.tsx" -type f -exec sed -i 's/bg-blue-/bg-steel-/g' {} \;
find src -name "*.tsx" -type f -exec sed -i 's/text-blue-/text-steel-/g' {} \;
find src -name "*.tsx" -type f -exec sed -i 's/border-blue-/border-steel-/g' {} \;

# Replace green colors with industrial
find src -name "*.tsx" -type f -exec sed -i 's/bg-green-/bg-industrial-/g' {} \;
find src -name "*.tsx" -type f -exec sed -i 's/text-green-/text-industrial-/g' {} \;

# Replace red colors with warning
find src -name "*.tsx" -type f -exec sed -i 's/bg-red-/bg-warning-/g' {} \;
find src -name "*.tsx" -type f -exec sed -i 's/text-red-/text-warning-/g' {} \;
```

## Automated Migration Tools

### Codemod Scripts

Create the following codemod scripts for automated migration:

#### 1. Button Migration Codemod
```javascript
// scripts/codemods/migrate-buttons.js
const jscodeshift = require('jscodeshift');

module.exports = function transformer(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  // Replace common button patterns
  root
    .find(j.JSXElement, {
      openingElement: { name: { name: 'button' } }
    })
    .forEach(path => {
      const classNameAttr = path.value.openingElement.attributes.find(
        attr => attr.name && attr.name.name === 'className'
      );
      
      if (classNameAttr && classNameAttr.value) {
        let className = classNameAttr.value.value;
        
        // Replace primary button pattern
        if (className.includes('bg-blue-600') && className.includes('hover:bg-blue-700')) {
          className = className.replace(/bg-blue-\d+\s+hover:bg-blue-\d+\s+text-white/, 'btn-primary');
        }
        
        // Replace secondary button pattern
        if (className.includes('bg-gray-100') && className.includes('hover:bg-gray-200')) {
          className = className.replace(/bg-gray-\d+\s+hover:bg-gray-\d+/, 'btn-secondary');
        }
        
        classNameAttr.value.value = className;
      }
    });

  return root.toSource();
};
```

#### 2. Color Migration Codemod
```javascript
// scripts/codemods/migrate-colors.js
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

  // Replace color classes in className attributes
  root
    .find(j.JSXAttribute, { name: { name: 'className' } })
    .forEach(path => {
      if (path.value.value && path.value.value.value) {
        let className = path.value.value.value;
        
        Object.entries(colorMappings).forEach(([oldColor, newColor]) => {
          const regex = new RegExp(`\\b(bg-|text-|border-)${oldColor}-(\\d+)\\b`, 'g');
          className = className.replace(regex, `$1${newColor}-$2`);
        });
        
        path.value.value.value = className;
      }
    });

  return root.toSource();
};
```

### Running Codemods

```bash
# Install jscodeshift if not already installed
npm install -g jscodeshift

# Run button migration
jscodeshift -t scripts/codemods/migrate-buttons.js src/

# Run color migration
jscodeshift -t scripts/codemods/migrate-colors.js src/

# Run with dry-run to preview changes
jscodeshift -t scripts/codemods/migrate-buttons.js src/ --dry
```

## Backward Compatibility

### Legacy Support Layer

To ensure smooth migration, we maintain backward compatibility:

```css
/* Legacy color aliases - will be deprecated in v2.0 */
.bg-blue-600 { @apply bg-steel-600; }
.bg-blue-700 { @apply bg-steel-700; }
.text-blue-600 { @apply text-steel-600; }
.border-blue-600 { @apply border-steel-600; }

.bg-green-500 { @apply bg-industrial-500; }
.text-green-800 { @apply text-industrial-800; }

.bg-red-500 { @apply bg-warning-500; }
.text-red-800 { @apply text-warning-800; }

/* Legacy button styles */
.btn-old-primary {
  @apply btn-primary;
}
```

### Deprecation Warnings

Add console warnings for deprecated classes:

```typescript
// src/utils/deprecation-warnings.ts
export function checkDeprecatedClasses() {
  if (process.env.NODE_ENV === 'development') {
    const deprecatedClasses = [
      'bg-blue-600',
      'bg-blue-700',
      'text-blue-600',
      'bg-green-500',
      'bg-red-500'
    ];
    
    deprecatedClasses.forEach(className => {
      const elements = document.querySelectorAll(`.${className}`);
      if (elements.length > 0) {
        console.warn(`Deprecated class "${className}" found. Please migrate to design system classes.`);
      }
    });
  }
}
```

## Gradual Rollout Plan

### Week 1-2: Foundation
- [x] Set up design tokens
- [x] Integrate with Tailwind CSS
- [x] Create utility classes
- [ ] Update build process

### Week 3-4: Core Components
- [ ] Migrate button components
- [ ] Migrate input components
- [ ] Migrate card components
- [ ] Update component documentation

### Week 5-6: Navigation and Layout
- [ ] Migrate sidebar navigation
- [ ] Update page layouts
- [ ] Migrate breadcrumbs
- [ ] Update responsive patterns

### Week 7-8: Data Display
- [ ] Migrate data tables
- [ ] Update status indicators
- [ ] Migrate metric cards
- [ ] Update chart colors

### Week 9-10: Advanced Features
- [ ] Implement theme switching
- [ ] Add dark mode support
- [ ] Implement density options
- [ ] Add customization features

### Week 11-12: Testing and Optimization
- [ ] Comprehensive testing
- [ ] Performance optimization
- [ ] Bundle size analysis
- [ ] Documentation completion

## Testing Strategy

### Visual Regression Testing
```bash
# Install visual testing tools
npm install --save-dev @storybook/test-runner chromatic

# Run visual regression tests
npm run test:visual
```

### Component Testing
```typescript
// Example component test
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button Migration', () => {
  it('should render with design system styles', () => {
    render(<Button variant="primary">Test</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('btn-primary');
  });
});
```

### Accessibility Testing
```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('Button should be accessible', async () => {
  const { container } = render(<Button variant="primary">Test</Button>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## Performance Considerations

### Bundle Size Impact
- Monitor bundle size changes during migration
- Use tree-shaking to eliminate unused styles
- Implement lazy loading for theme variants

### Runtime Performance
- CSS custom properties provide better performance than JavaScript theming
- Minimize style recalculations during theme switches
- Use CSS containment for isolated components

## Rollback Strategy

### Emergency Rollback
If issues arise during migration:

1. **Immediate Rollback**
   ```bash
   git revert <migration-commit>
   npm run build
   npm run deploy
   ```

2. **Partial Rollback**
   - Disable specific design system features
   - Fall back to legacy styles
   - Maintain application functionality

3. **Component-Level Rollback**
   ```typescript
   // Feature flag for gradual rollout
   const useDesignSystem = process.env.REACT_APP_USE_DESIGN_SYSTEM === 'true';
   
   return useDesignSystem ? <NewButton /> : <LegacyButton />;
   ```

## Success Metrics

### Technical Metrics
- [ ] 100% component migration completion
- [ ] Zero accessibility violations
- [ ] <5% bundle size increase
- [ ] <100ms theme switching time

### User Experience Metrics
- [ ] Consistent visual hierarchy
- [ ] Improved color contrast ratios
- [ ] Better mobile responsiveness
- [ ] Enhanced keyboard navigation

### Developer Experience Metrics
- [ ] Reduced CSS duplication
- [ ] Faster component development
- [ ] Improved design consistency
- [ ] Better documentation coverage

## Support and Resources

### Documentation
- [Design System Documentation](./design-system-docs.md)
- [Component API Reference](./component-api.md)
- [Migration Examples](./migration-examples.md)

### Team Support
- Design system team: Available for migration questions
- Code review: Required for all migration PRs
- Testing support: Automated testing for all migrated components

### Tools and Resources
- [Figma Design System](https://figma.com/design-system)
- [Storybook Component Library](http://localhost:6006)
- [Migration Checklist](./migration-checklist.md)

## Conclusion

This migration strategy ensures a smooth transition to the Professional CMMS Design System while maintaining application stability and user experience. The gradual rollout approach allows for testing and validation at each step, minimizing risk and ensuring successful adoption.

For questions or support during migration, please reach out to the design system team or refer to the comprehensive documentation provided.