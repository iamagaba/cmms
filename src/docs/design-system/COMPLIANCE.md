# shadcn/ui Aesthetic Compliance Guide

## Overview

This guide outlines the compliance standards for the Professional CMMS Design System. These standards ensure consistency, maintainability, and adherence to shadcn/ui best practices across the entire codebase.

## Universal Properties

These properties must hold true across the entire codebase. Violations are automatically detected by compliance tests.

### Property 1: No Arbitrary Typography Sizes

**Rule**: All text must use standard Tailwind size classes. No arbitrary font sizes allowed.

**✅ Allowed:**
```tsx
<h1 className="text-2xl font-bold">Page Title</h1>
<p className="text-sm">Body text</p>
<span className="text-xs">Caption</span>
```

**❌ Forbidden:**
```tsx
<h1 className="text-[28px]">Page Title</h1>
<p className="text-[13px]">Body text</p>
<span className="text-[10px]">Caption</span>
```

**Why**: Arbitrary sizes break the typography scale and create inconsistency.

**Standard Sizes:**
- `text-xs` (12px) - Captions, metadata
- `text-sm` (14px) - Body text (primary)
- `text-base` (16px) - Emphasized body text
- `text-lg` (18px) - Section headers
- `text-xl` (20px) - Subtitles
- `text-2xl` (24px) - Page titles

### Property 2: No Arbitrary Icon Sizes

**Rule**: All icons must use standard size classes. No arbitrary icon sizes allowed.

**✅ Allowed:**
```tsx
<Icon className="w-4 h-4" /> {/* 16px */}
<Icon className="w-5 h-5" /> {/* 20px */}
<Icon className="w-6 h-6" /> {/* 24px */}
<Icon className="w-8 h-8" /> {/* 32px */}
```

**❌ Forbidden:**
```tsx
<Icon size={10} />
<Icon size={13} />
<Icon size={14} />
<Icon className="w-[13px] h-[13px]" />
```

**Why**: Arbitrary icon sizes create visual inconsistency and break the design system hierarchy.

**Standard Sizes:**
- `w-4 h-4` (16px) - Small icons (buttons, inline with text)
- `w-5 h-5` (20px) - Standard icons (card headers, default)
- `w-6 h-6` (24px) - Large icons (page headers)
- `w-8 h-8` (32px) - Extra large icons (empty states)

### Property 3: No Custom Compact Utilities

**Rule**: All spacing must use standard Tailwind classes. No custom compact utilities allowed.

**✅ Allowed:**
```tsx
<div className="p-4">Content</div>
<div className="gap-4">Items</div>
<div className="space-y-6">Sections</div>
```

**❌ Forbidden:**
```tsx
<div className="p-compact">Content</div>
<div className="gap-compact">Items</div>
<div className="space-y-compact">Sections</div>
```

**Why**: Custom utilities deviate from standard Tailwind and shadcn/ui patterns, making the codebase harder to maintain.

**Standard Spacing:**
- `p-2` (8px) - Tight padding
- `p-4` (16px) - Standard padding
- `p-6` (24px) - Comfortable padding
- `gap-4` (16px) - Standard gap
- `space-y-4` (16px) - Form field spacing
- `space-y-6` (24px) - Section spacing

### Property 4: No Inline Badge Color Classes

**Rule**: All badges must use the Badge component with semantic variants. No inline color classes allowed.

**✅ Allowed:**
```tsx
<Badge variant="success">Completed</Badge>
<Badge variant="in-progress">In Progress</Badge>
<StatusBadge status="completed" />
<PriorityBadge priority="critical" />
```

**❌ Forbidden:**
```tsx
<span className="px-2 py-1 text-xs rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
  Completed
</span>
```

**Why**: Inline badge styling creates duplication and makes it difficult to maintain consistent badge appearance across the application.

**Badge Variants:**
- Status: `success`, `warning`, `error`, `info`
- Work Order Status: `open`, `in-progress`, `completed`, `cancelled`
- Priority: `critical`, `high`, `medium`, `low`

### Property 5: No Hardcoded Color Values

**Rule**: All colors must use CSS variable-based semantic tokens. No hardcoded Tailwind color classes allowed (except in badge.tsx and badge helper components).

**✅ Allowed:**
```tsx
<div className="bg-card text-foreground border-border">
<p className="text-muted-foreground">Secondary text</p>
<Button className="bg-primary text-primary-foreground">Action</Button>
```

**❌ Forbidden:**
```tsx
<div className="bg-white text-gray-900 border-gray-200">
<p className="text-gray-600">Secondary text</p>
<Button className="bg-purple-600 text-white">Action</Button>
```

**Why**: Hardcoded colors don't adapt to theme changes and break dark mode support.

**Semantic Tokens:**
- `bg-background` / `text-foreground` - Page background and primary text
- `bg-card` / `text-card-foreground` - Card backgrounds
- `bg-muted` / `text-muted-foreground` - Subtle backgrounds and secondary text
- `bg-accent` / `text-accent-foreground` - Hover states
- `bg-primary` / `text-primary-foreground` - Primary actions
- `bg-destructive` / `text-destructive-foreground` - Error states
- `border-border` - All borders
- `ring-ring` - Focus rings

**Exception**: Status colors (emerald, amber, rose, blue, orange, gray) are allowed in `badge.tsx` and badge helper components for semantic status indicators.

### Property 6: Color Contrast Compliance

**Rule**: All text/background combinations must meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text).

**Why**: Ensures readability and accessibility for all users, including those with visual impairments.

**Testing**: Use automated tools to verify contrast ratios:
- Normal text (< 18px): 4.5:1 minimum
- Large text (≥ 18px): 3:1 minimum
- Interactive elements: 3:1 minimum

## Component-Specific Guidelines

### Buttons

**Default Sizes:**
```tsx
<Button>Default (h-9)</Button>
<Button size="sm">Small (h-8)</Button>
<Button size="lg">Large (h-10)</Button>
<Button size="icon"><Icon className="w-4 h-4" /></Button>
```

**Rules:**
- ✅ Use default button sizes (h-9, h-8, h-10)
- ✅ Icons in buttons should be `w-4 h-4` (16px)
- ❌ Never override button heights with custom values

### Cards

**Semantic Structure:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content with default p-6 padding */}
  </CardContent>
</Card>
```

**Rules:**
- ✅ Use CardHeader + CardTitle + CardDescription structure
- ✅ CardContent has default `p-6` padding
- ✅ CardTitle uses `text-2xl` by default
- ❌ Don't override card padding unless absolutely necessary

### Forms

**Semantic Structure:**
```tsx
<Form>
  <FormField
    control={form.control}
    name="field"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Label</FormLabel>
        <FormControl>
          <Input {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
</Form>
```

**Rules:**
- ✅ Use FormField + FormItem + FormLabel + FormControl structure
- ✅ Input components use default height (h-9)
- ✅ Use `space-y-4` for form field spacing
- ❌ Don't create custom form layouts without semantic structure

### Tables

**Semantic Structure:**
```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead className="text-xs font-medium uppercase">Header</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow className="hover:bg-accent">
      <TableCell className="text-sm">Cell</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

**Rules:**
- ✅ Use `text-sm` for table cells
- ✅ Use `text-xs font-medium uppercase` for headers
- ✅ Use `hover:bg-accent` for row hover states
- ✅ Use `border-border` for borders
- ❌ Don't use custom table styling

### Dialogs

**Semantic Structure:**
```tsx
<Dialog>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    {/* Content */}
  </DialogContent>
</Dialog>
```

**Rules:**
- ✅ Use DialogHeader + DialogTitle + DialogDescription structure
- ✅ Use default dialog padding
- ✅ Include DialogDescription for accessibility
- ❌ Don't skip semantic structure

## Running Compliance Tests

### Automated Tests

Run the compliance test suite to check for violations:

```bash
npm test -- src/__tests__/compliance/shadcn-compliance.test.ts --run
```

This will scan the entire codebase and report:
- Arbitrary font sizes
- Arbitrary icon sizes
- Custom compact utilities
- Inline badge color classes
- Hardcoded color values

### Manual Testing Checklist

For each component or page:

1. **Typography Verification**:
   - [ ] Page titles use `text-2xl font-bold`
   - [ ] Body text uses `text-sm`
   - [ ] Captions use `text-xs`
   - [ ] No arbitrary font sizes

2. **Icon Sizing Verification**:
   - [ ] Standard icons use `w-5 h-5` (20px)
   - [ ] Small icons use `w-4 h-4` (16px)
   - [ ] Large icons use `w-6 h-6` (24px)
   - [ ] No arbitrary icon sizes

3. **Spacing Verification**:
   - [ ] Cards use `p-6` for content padding
   - [ ] Standard gaps use `gap-4`
   - [ ] Section spacing uses `space-y-6`
   - [ ] No compact utilities

4. **Component Structure Verification**:
   - [ ] Cards use CardHeader + CardTitle + CardContent
   - [ ] Dialogs use DialogHeader + DialogTitle
   - [ ] Forms use FormField + FormItem structure
   - [ ] Tables use proper Table components

5. **Color Verification**:
   - [ ] Primary actions use `bg-primary`
   - [ ] Secondary text uses `text-muted-foreground`
   - [ ] Borders use `border-border`
   - [ ] No hardcoded color values

6. **Badge Verification**:
   - [ ] Status badges use StatusBadge component
   - [ ] Priority badges use PriorityBadge component
   - [ ] No inline color classes
   - [ ] Consistent badge styling

7. **Accessibility Verification**:
   - [ ] All interactive elements have focus states
   - [ ] Color contrast meets WCAG AA standards
   - [ ] Form fields have associated labels
   - [ ] Buttons have descriptive text or aria-labels

8. **Dark Mode Verification**:
   - [ ] All colors work in dark mode
   - [ ] Contrast is maintained
   - [ ] Shadows are visible
   - [ ] Borders are visible

## Fixing Violations

### Arbitrary Font Sizes

**Before:**
```tsx
<h1 className="text-[28px] font-bold">Title</h1>
<p className="text-[13px]">Body text</p>
```

**After:**
```tsx
<h1 className="text-2xl font-bold">Title</h1>
<p className="text-sm">Body text</p>
```

### Arbitrary Icon Sizes

**Before:**
```tsx
<Icon size={13} />
<Icon className="w-[14px] h-[14px]" />
```

**After:**
```tsx
<Icon className="w-4 h-4" />
<Icon className="w-5 h-5" />
```

### Custom Compact Utilities

**Before:**
```tsx
<div className="p-compact gap-compact space-y-compact">
```

**After:**
```tsx
<div className="p-4 gap-4 space-y-4">
```

### Inline Badge Colors

**Before:**
```tsx
<span className="px-2 py-1 text-xs rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
  Completed
</span>
```

**After:**
```tsx
<Badge variant="success">Completed</Badge>
{/* or */}
<StatusBadge status="completed" />
```

### Hardcoded Colors

**Before:**
```tsx
<div className="bg-white text-gray-900 border-gray-200">
<p className="text-gray-600">Secondary text</p>
<Button className="bg-purple-600 text-white">Action</Button>
```

**After:**
```tsx
<div className="bg-card text-foreground border-border">
<p className="text-muted-foreground">Secondary text</p>
<Button className="bg-primary text-primary-foreground">Action</Button>
```

## Continuous Compliance

### Pre-commit Hooks

Set up pre-commit hooks to run compliance tests automatically:

```bash
# .husky/pre-commit
npm run test:compliance
```

### CI/CD Integration

Add compliance tests to your CI/CD pipeline:

```yaml
# .github/workflows/compliance.yml
- name: Run compliance tests
  run: npm run test:compliance
```

### ESLint Rules

Configure ESLint to prevent common violations:

```javascript
// .eslintrc.js
module.exports = {
  rules: {
    'tailwindcss/no-arbitrary-value': 'error',
    'tailwindcss/enforces-shorthand': 'error',
  },
};
```

## Resources

- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Design System README](./README.md)

## Questions?

If you have questions about compliance standards or need clarification on specific cases, please:

1. Check the [Design System README](./README.md)
2. Review the [shadcn/ui documentation](https://ui.shadcn.com)
3. Run the compliance tests to see specific violations
4. Ask the team for guidance on edge cases
