# Contributing to Fleet CMMS

Thank you for contributing to Fleet CMMS! This guide will help you maintain consistency with our design system and coding standards.

## Design System Compliance

We use **shadcn/ui** with semantic tokens for a consistent, maintainable design system. All new code must follow these guidelines.

### ✅ DO: Use Semantic Tokens

```tsx
// ✅ CORRECT - Use semantic tokens
<div className="bg-card text-foreground border border-border">
  <p className="text-muted-foreground">Secondary text</p>
</div>

// ✅ CORRECT - Use shadcn/ui components with defaults
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle> {/* text-2xl default */}
  </CardHeader>
  <CardContent>
    <p className="text-sm">Body text</p>
  </CardContent>
</Card>

// ✅ CORRECT - Use Badge variants
<Badge variant="warning">In Progress</Badge>
<Badge variant="success">Completed</Badge>
```

### ❌ DON'T: Use Hardcoded Colors

```tsx
// ❌ WRONG - Hardcoded colors
<div className="bg-white text-gray-900 border-gray-200">
  <p className="text-gray-600">Secondary text</p>
</div>

// ❌ WRONG - Custom pill implementations
<span className="px-2 py-1 bg-amber-50 text-amber-700 rounded">
  In Progress
</span>

// ❌ WRONG - Custom card shells
<div className="bg-muted/50 border border-border rounded-lg p-4">
  <h3 className="font-semibold mb-2">Title</h3>
</div>
```

## Forbidden Patterns

The following patterns are **forbidden** and will cause ESLint errors:

### 1. Hardcoded Background Colors

❌ `bg-white` → ✅ `bg-card` or `bg-background`  
❌ `bg-gray-50` → ✅ `bg-muted`  
❌ `bg-gray-100` → ✅ `bg-accent`  
❌ `bg-emerald-50` → ✅ `bg-success` (with proper variant)  
❌ `bg-amber-50` → ✅ `bg-warning` (with proper variant)  
❌ `bg-red-50` → ✅ `bg-destructive` (with proper variant)

### 2. Hardcoded Text Colors

❌ `text-gray-900` → ✅ `text-foreground`  
❌ `text-gray-600` → ✅ `text-muted-foreground`  
❌ `text-gray-500` → ✅ `text-muted-foreground`  
❌ `text-gray-400` → ✅ `text-muted-foreground`

### 3. Hardcoded Border Colors

❌ `border-gray-200` → ✅ `border-border`  
❌ `border-gray-300` → ✅ `border-border`

### 4. Custom Card Implementations

❌ Custom `<div>` with card-like styling → ✅ Use `<Card>` component

### 5. Custom Badge/Pill Implementations

❌ Custom `<span>` with badge styling → ✅ Use `<Badge>` component

## Icon Usage

We use **Lucide React** for all icons with standardized sizing.

### Icon Sizing

```tsx
import { Home, Settings, User } from 'lucide-react';
import { ICON_SIZES } from '@/components/ui/icon-reference';

// ✅ CORRECT - Use Tailwind size classes
<Home className="w-4 h-4" />  // 16px - buttons, inline
<Settings className="w-5 h-5" />  // 20px - standard (default)
<User className="w-6 h-6" />  // 24px - page titles

// ✅ CORRECT - Use size constants
<Home className={ICON_SIZES.sm} />  // 16px
<Settings className={ICON_SIZES.md} />  // 20px
<User className={ICON_SIZES.lg} />  // 24px

// ❌ WRONG - Don't use size prop
<Home size={16} />
<Settings size={20} />
```

### Icon Size Guidelines

- **16px (`w-4 h-4`)**: Buttons, inline labels, small badges, table cells
- **20px (`w-5 h-5`)**: Card headers, navigation, form labels (DEFAULT)
- **24px (`w-6 h-6`)**: Page titles, section headers, prominent actions
- **32px (`w-8 h-8`)**: Hero sections, empty states, large cards

## Component Patterns

### Page Headers

Use the `PageHeader` component for consistent page headers:

```tsx
import { PageHeader } from '@/components/layout/PageHeader';
import { Plus, RefreshCw } from 'lucide-react';

<PageHeader
  title="Work Orders"
  subtitle="Manage maintenance requests and tasks"
  breadcrumbs={<SimpleBreadcrumbs items={[...]} />}
  icon={<ClipboardList className="w-5 h-5" />}
  actions={
    <>
      <Button variant="outline" size="sm">
        <RefreshCw className="w-4 h-4" />
        Refresh
      </Button>
      <Button size="sm">
        <Plus className="w-4 h-4" />
        Create
      </Button>
    </>
  }
/>
```

### Cards

Always use shadcn/ui `Card` components:

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

// ✅ CORRECT
<Card>
  <CardHeader>
    <CardTitle>Statistics</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-sm">Content here</p>
  </CardContent>
</Card>

// ❌ WRONG
<div className="bg-card border border-border rounded-lg shadow-sm p-6">
  <h3 className="text-lg font-semibold mb-4">Statistics</h3>
  <p className="text-sm">Content here</p>
</div>
```

### Status Badges

Use `Badge` component with semantic variants:

```tsx
import { Badge } from '@/components/ui/badge';

// ✅ CORRECT
<Badge variant="default">Open</Badge>
<Badge variant="warning">In Progress</Badge>
<Badge variant="success">Completed</Badge>
<Badge variant="destructive">Critical</Badge>

// ❌ WRONG
<span className="px-2 py-1 bg-amber-50 text-amber-700 rounded text-xs">
  In Progress
</span>
```

### Empty States

Use the `EmptyState` component:

```tsx
import { EmptyState } from '@/components/ui/empty-state';
import { Inbox } from 'lucide-react';

<EmptyState
  icon={<Inbox className="w-16 h-16" />}
  title="No work orders found"
  description="Create your first work order to get started"
  action={
    <Button size="sm">
      <Plus className="w-4 h-4" />
      Create Work Order
    </Button>
  }
/>
```

## Typography Scale

Follow shadcn/ui defaults:

```tsx
// Page titles
<h1 className="text-2xl font-bold">Page Title</h1>

// Section headers
<h2 className="text-lg font-semibold">Section Header</h2>

// Body text (default)
<p className="text-sm">Body text content</p>

// Secondary/metadata text
<p className="text-sm text-muted-foreground">Secondary information</p>

// Small text/captions
<p className="text-xs text-muted-foreground">Caption text</p>
```

## Spacing Scale

Use consistent spacing:

```tsx
// Between cards/sections
<div className="space-y-6">

// Between form fields
<div className="space-y-4">

// Between related items
<div className="gap-4">

// Tight grouping (button groups)
<div className="gap-1.5">

// Card padding
<CardContent> {/* p-6 default */}
<CardContent className="p-4"> {/* Compact variant */}
```

## Pull Request Checklist

Before submitting a PR, ensure:

- [ ] Uses semantic tokens (no `bg-white`, `text-gray-600`)
- [ ] Icons use Tailwind classes (`w-4 h-4`, `w-5 h-5`, `w-6 h-6`)
- [ ] Cards use shadcn `Card` component (not custom shells)
- [ ] Status indicators use `Badge` variants
- [ ] Page headers use `PageHeader` component (if applicable)
- [ ] Empty states use `EmptyState` component (if applicable)
- [ ] Spacing follows canonical patterns (`space-y-6`, `gap-4`)
- [ ] No ESLint warnings for restricted patterns
- [ ] Components tested in both light and dark mode

## Testing

```bash
# Run linting
npm run lint

# Run type checking
npm run type-check

# Run tests
npm test

# Build to verify no errors
npm run build
```

## Getting Help

- **Design System Docs**: See `src/docs/design-system/`
- **Icon Reference**: See `src/components/ui/icon-reference.tsx`
- **Component Examples**: See `src/pages/DesignSystemReference.tsx`
- **Questions**: Ask in team chat or create a discussion

## Resources

- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Lucide React Icons](https://lucide.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Radix UI Primitives](https://www.radix-ui.com)

---

Thank you for helping maintain a consistent, high-quality codebase! 🎉
