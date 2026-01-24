# shadcn/ui Migration Plan

## Overview

This document outlines the strategy for migrating from custom Professional CMMS components to shadcn/ui components. The migration will be gradual, maintaining application stability while modernizing the component library.

## Current State Analysis

### Already Installed shadcn Components
- ✅ `button.tsx` - Basic button component
- ✅ `dialog.tsx` - Dialog/modal component

### Custom Components to Migrate
- `ProfessionalButton.tsx` → shadcn `button`
- `ProfessionalInput.tsx` → shadcn `input`, `textarea`, `label`
- `ProfessionalCard.tsx` → shadcn `card`
- `ProfessionalBadge.tsx` → shadcn `badge`
- `ProfessionalDataTable.tsx` → shadcn `table` + `data-table`
- `ProfessionalMetricCard.tsx` → shadcn `card` (customized)
- Enterprise components (`Input`, `Panel`, `Badge`) → shadcn equivalents

## Migration Strategy

### Phase 1: Install Core shadcn Components (Week 1)
Install the essential shadcn/ui components needed for the migration.

**Components to Install:**
```bash
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add card
npx shadcn@latest add badge
npx shadcn@latest add table
npx shadcn@latest add select
npx shadcn@latest add textarea
npx shadcn@latest add checkbox
npx shadcn@latest add radio-group
npx shadcn@latest add switch
npx shadcn@latest add tabs
npx shadcn@latest add dropdown-menu
npx shadcn@latest add popover
npx shadcn@latest add tooltip
npx shadcn@latest add separator
npx shadcn@latest add skeleton
npx shadcn@latest add alert
npx shadcn@latest add toast
```

### Phase 2: Create Custom Variants (Week 1-2)
Extend shadcn components with your design system's custom variants and styles.

**Tasks:**
- [ ] Extend button variants (primary, secondary, danger, success)
- [ ] Add industrial color palette to shadcn components
- [ ] Create metric card variant
- [ ] Add status badge variants
- [ ] Implement density mode support

### Phase 3: Component-by-Component Migration (Week 2-6)

#### 3.1 Button Migration (Week 2)
**Current:** `ProfessionalButton` with variants: primary, secondary, outline, ghost, danger, success
**Target:** shadcn `button` with custom variants

**Migration Steps:**
1. Extend shadcn button with custom variants
2. Add icon support (left/right icons)
3. Add loading state
4. Add density mode support
5. Create migration helper/wrapper
6. Update all imports gradually

**Files to Update:** ~50+ files using `ProfessionalButton`

#### 3.2 Input Components Migration (Week 3)
**Current:** `ProfessionalInput`, `ProfessionalTextarea`, Enterprise `Input`
**Target:** shadcn `input`, `textarea`, `label`

**Migration Steps:**
1. Extend shadcn input with validation states
2. Add icon support
3. Create form field wrapper
4. Add error/success message display
5. Update all form components

**Files to Update:** ~30+ files using input components

#### 3.3 Card Migration (Week 3-4)
**Current:** `ProfessionalCard`, `ProfessionalMetricCard`
**Target:** shadcn `card` with custom variants

**Migration Steps:**
1. Extend shadcn card with variants (elevated, outlined, filled)
2. Create metric card variant
3. Add interactive card support
4. Add loading states
5. Update dashboard and detail pages

**Files to Update:** ~40+ files using card components

#### 3.4 Badge Migration (Week 4)
**Current:** `ProfessionalBadge`, `WorkOrderStatusBadge`, `PriorityBadge`, `AssetStatusBadge`
**Target:** shadcn `badge` with custom variants

**Migration Steps:**
1. Extend shadcn badge with status variants
2. Create specialized badge components (status, priority)
3. Add size variants
4. Update all status displays

**Files to Update:** ~25+ files using badge components

#### 3.5 Data Table Migration (Week 5-6)
**Current:** `ProfessionalDataTable`, `EnhancedDataTable`
**Target:** shadcn `table` + custom data-table implementation

**Migration Steps:**
1. Install shadcn table component
2. Build data-table wrapper with sorting/filtering
3. Add pagination support
4. Add bulk actions
5. Add mobile responsive view
6. Migrate all table implementations

**Files to Update:** ~15+ files using data tables

### Phase 4: Enterprise Components Migration (Week 6-7)

#### 4.1 Enterprise Input → shadcn Input
**Current:** `src/components/ui/enterprise/Input.tsx`
**Target:** shadcn `input` with enterprise styling

#### 4.2 Enterprise Panel → shadcn Card
**Current:** `src/components/ui/enterprise/Panel.tsx`
**Target:** shadcn `card` with panel variants

#### 4.3 Enterprise Badge → shadcn Badge
**Current:** `src/components/ui/enterprise/Badge.tsx`
**Target:** shadcn `badge` with enterprise variants

### Phase 5: Advanced Components (Week 7-8)

**Components to Add:**
```bash
npx shadcn@latest add form
npx shadcn@latest add command
npx shadcn@latest add calendar
npx shadcn@latest add date-picker
npx shadcn@latest add sheet
npx shadcn@latest add accordion
npx shadcn@latest add avatar
npx shadcn@latest add progress
npx shadcn@latest add slider
```

### Phase 6: Testing & Cleanup (Week 8-9)
- [ ] Visual regression testing
- [ ] Accessibility audit
- [ ] Performance testing
- [ ] Remove old Professional components
- [ ] Update documentation
- [ ] Clean up unused imports

## Component Mapping Reference

### Button Mapping
```tsx
// OLD - ProfessionalButton
import ProfessionalButton from '@/components/ui/ProfessionalButton';

<ProfessionalButton variant="primary" size="base" icon={AddIcon}>
  Create
</ProfessionalButton>

// NEW - shadcn Button
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

<Button variant="default" size="default">
  <Plus className="mr-2 h-4 w-4" />
  Create
</Button>
```

### Input Mapping
```tsx
// OLD - ProfessionalInput
import { ProfessionalInput } from '@/components/ui/ProfessionalInput';

<ProfessionalInput
  label="Email"
  error="Invalid email"
  required
/>

// NEW - shadcn Input
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

<div className="space-y-2">
  <Label htmlFor="email">Email *</Label>
  <Input id="email" type="email" />
  <p className="text-sm text-destructive">Invalid email</p>
</div>
```

### Card Mapping
```tsx
// OLD - ProfessionalCard
import { ProfessionalCard } from '@/components/ui/ProfessionalCard';

<ProfessionalCard
  title="Work Orders"
  subtitle="Recent activity"
  variant="elevated"
>
  Content
</ProfessionalCard>

// NEW - shadcn Card
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Work Orders</CardTitle>
    <CardDescription>Recent activity</CardDescription>
  </CardHeader>
  <CardContent>
    Content
  </CardContent>
</Card>
```

### Badge Mapping
```tsx
// OLD - ProfessionalBadge
import { WorkOrderStatusBadge } from '@/components/ui/ProfessionalBadge';

<WorkOrderStatusBadge status="in-progress" />

// NEW - shadcn Badge
import { Badge } from '@/components/ui/badge';

<Badge variant="secondary">In Progress</Badge>
```

## Design System Integration

### Color Palette Mapping
Update `src/App.css` to map your industrial theme to shadcn variables:

```css
:root {
  /* shadcn defaults */
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  
  /* Map to industrial theme */
  --primary: 262 83% 58%; /* purple-600 */
  --primary-foreground: 0 0% 100%;
  
  --secondary: 215 20% 65%; /* slate-400 */
  --secondary-foreground: 222.2 47.4% 11.2%;
  
  --destructive: 0 84% 60%; /* red-500 */
  --destructive-foreground: 0 0% 100%;
  
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 262 83% 58%;
  
  --radius: 0.5rem;
}
```

### Density Mode Support
Extend shadcn components with density variants:

```tsx
// src/lib/density-variants.ts
import { cva } from 'class-variance-authority';

export const densityVariants = cva('', {
  variants: {
    density: {
      compact: 'p-2 text-sm gap-1',
      comfortable: 'p-3 text-base gap-2',
      spacious: 'p-4 text-base gap-3',
    },
  },
  defaultVariants: {
    density: 'comfortable',
  },
});
```

## Migration Helpers

### Create Compatibility Layer
Create wrapper components for gradual migration:

```tsx
// src/components/compat/Button.tsx
import { Button as ShadcnButton } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Wrapper that accepts both old and new props
export function Button({ variant, ...props }) {
  // Map old variants to new
  const variantMap = {
    primary: 'default',
    secondary: 'secondary',
    outline: 'outline',
    ghost: 'ghost',
    danger: 'destructive',
  };
  
  return <ShadcnButton variant={variantMap[variant] || variant} {...props} />;
}
```

### Automated Migration Script
Create codemod for automated updates:

```javascript
// scripts/migrate-to-shadcn.js
const jscodeshift = require('jscodeshift');

module.exports = function transformer(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  // Replace ProfessionalButton imports
  root
    .find(j.ImportDeclaration, {
      source: { value: '@/components/ui/ProfessionalButton' }
    })
    .forEach(path => {
      path.value.source.value = '@/components/ui/button';
      // Update import specifier
      path.value.specifiers = [
        j.importSpecifier(j.identifier('Button'))
      ];
    });

  return root.toSource();
};
```

## Testing Strategy

### Visual Regression Testing
```bash
# Install Chromatic or Percy
npm install --save-dev @chromatic-com/storybook

# Run visual tests
npm run test:visual
```

### Component Testing
```tsx
// Example test for migrated button
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button Migration', () => {
  it('renders with correct variant', () => {
    render(<Button variant="default">Click me</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
  
  it('maintains accessibility', () => {
    const { container } = render(<Button>Click me</Button>);
    expect(container.firstChild).toHaveAttribute('type', 'button');
  });
});
```

## Rollback Strategy

### Feature Flags
Use feature flags for gradual rollout:

```tsx
// src/lib/feature-flags.ts
export const USE_SHADCN_COMPONENTS = process.env.REACT_APP_USE_SHADCN === 'true';

// In components
import { USE_SHADCN_COMPONENTS } from '@/lib/feature-flags';
import { Button as ShadcnButton } from '@/components/ui/button';
import ProfessionalButton from '@/components/ui/ProfessionalButton';

const Button = USE_SHADCN_COMPONENTS ? ShadcnButton : ProfessionalButton;
```

### Git Strategy
- Create feature branch: `feature/shadcn-migration`
- Merge components incrementally
- Tag stable points for easy rollback

## Success Metrics

### Technical Metrics
- [ ] 100% component migration
- [ ] Zero accessibility regressions
- [ ] <10% bundle size increase
- [ ] All tests passing

### Code Quality Metrics
- [ ] Reduced component code by 30%
- [ ] Improved type safety
- [ ] Better documentation
- [ ] Consistent API across components

## Timeline Summary

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Phase 1: Install Components | Week 1 | All shadcn components installed |
| Phase 2: Custom Variants | Week 1-2 | Extended components with design system |
| Phase 3: Component Migration | Week 2-6 | All components migrated |
| Phase 4: Enterprise Migration | Week 6-7 | Enterprise components updated |
| Phase 5: Advanced Components | Week 7-8 | Advanced features added |
| Phase 6: Testing & Cleanup | Week 8-9 | Production ready |

**Total Duration:** 9 weeks

## Next Steps

1. **Review and approve this plan** with the team
2. **Set up feature branch** for migration work
3. **Install Phase 1 components** (see commands above)
4. **Create custom variant extensions** for design system
5. **Begin button migration** as pilot component
6. **Establish testing workflow** for each component
7. **Document learnings** for team reference

## Resources

- [shadcn/ui Documentation](https://ui.shadcn.com)
- [shadcn/ui GitHub](https://github.com/shadcn-ui/ui)
- [Radix UI Primitives](https://www.radix-ui.com)
- [CVA (Class Variance Authority)](https://cva.style)
- [Tailwind CSS](https://tailwindcss.com)

## Support

For questions or issues during migration:
- Check shadcn/ui documentation
- Review this migration plan
- Consult with design system team
- Create issues in project tracker

---

**Document Version:** 1.0  
**Last Updated:** January 19, 2026  
**Status:** Ready for Review
