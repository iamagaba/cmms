# Dark Mode Migration Guide

## Current Status

Dark mode is **partially implemented**. The theme toggle works and applies the `.dark` class to the `<html>` element, but many pages still use hardcoded colors instead of semantic tokens.

## The Problem

Many components use hardcoded Tailwind colors like:
- `bg-white` / `bg-gray-900` instead of `bg-background`
- `text-gray-900` / `text-gray-100` instead of `text-foreground`
- `border-gray-200` / `border-gray-800` instead of `border-border`

This means they either:
1. Don't respond to dark mode at all (stay white)
2. Use `dark:` variants with hardcoded colors (inconsistent theming)

## The Solution

Replace hardcoded colors with semantic tokens that automatically adapt to the theme.

### Color Token Mapping

| Current (Hardcoded) | Replace With (Semantic) | Purpose |
|---------------------|-------------------------|---------|
| `bg-white` / `dark:bg-gray-900` | `bg-background` | Main background |
| `bg-gray-50` / `dark:bg-gray-800` | `bg-card` or `bg-accent` | Card/panel backgrounds |
| `text-gray-900` / `dark:text-gray-100` | `text-foreground` | Primary text |
| `text-gray-600` / `dark:text-gray-400` | `text-muted-foreground` | Secondary text |
| `border-gray-200` / `dark:border-gray-800` | `border-border` | Borders |
| `bg-gray-100` / `dark:bg-gray-700` | `bg-muted` | Muted backgrounds |

### Examples

#### Before (Hardcoded):
```tsx
<div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
  <h1 className="text-gray-900 dark:text-gray-100">Title</h1>
  <p className="text-gray-600 dark:text-gray-400">Description</p>
</div>
```

#### After (Semantic):
```tsx
<div className="bg-background border border-border">
  <h1 className="text-foreground">Title</h1>
  <p className="text-muted-foreground">Description</p>
</div>
```

## Pages That Need Migration

Based on the search results, these pages need updates:

### High Priority (User-Facing):
- ✅ `src/components/layout/AppLayout.tsx` - DONE
- ✅ `src/components/layout/ProfessionalSidebar.tsx` - DONE
- ⚠️ `src/pages/Locations.tsx` - Partially done (uses dark: variants)
- ⚠️ `src/pages/Reports.tsx` - Partially done (uses dark: variants)
- ❌ `src/pages/Settings.tsx` - Needs migration
- ❌ `src/pages/WorkOrderDetailsEnhanced.tsx` - Needs migration
- ❌ `src/pages/ProfessionalCMMSDashboard.tsx` - Needs migration

### Medium Priority:
- `src/pages/Assets.tsx`
- `src/pages/Customers.tsx`
- `src/pages/Inventory.tsx`
- `src/pages/Technicians.tsx`
- `src/pages/WorkOrders.tsx`
- `src/pages/Scheduling.tsx`

### Low Priority (Test/Demo Pages):
- `src/pages/WhatsAppTest.tsx`
- `src/pages/TVDashboard.tsx` (intentionally uses custom dark mode)
- `src/pages/IconTestPage.tsx`

## Quick Fix Strategy

### Option 1: Gradual Migration (Recommended)
Migrate pages one at a time as you work on them. This is safer and allows for testing.

### Option 2: Bulk Find & Replace
Use find & replace with regex to update common patterns:

1. **Background colors:**
   - Find: `bg-white dark:bg-gray-900`
   - Replace: `bg-background`

2. **Card backgrounds:**
   - Find: `bg-gray-50 dark:bg-gray-800`
   - Replace: `bg-card`

3. **Primary text:**
   - Find: `text-gray-900 dark:text-gray-100`
   - Replace: `text-foreground`

4. **Secondary text:**
   - Find: `text-gray-600 dark:text-gray-400`
   - Replace: `text-muted-foreground`

5. **Borders:**
   - Find: `border-gray-200 dark:border-gray-800`
   - Replace: `border-border`

### Option 3: Add Global CSS Override (Temporary)
Add this to `src/App.css` as a temporary fix:

```css
/* Temporary dark mode overrides - remove after migration */
.dark {
  /* Override common hardcoded colors */
  --tw-bg-opacity: 1;
}

.dark .bg-white {
  background-color: hsl(var(--background)) !important;
}

.dark .text-gray-900 {
  color: hsl(var(--foreground)) !important;
}

.dark .border-gray-200 {
  border-color: hsl(var(--border)) !important;
}
```

**Note:** This is a hack and may cause issues. Use only as a temporary measure.

## Testing Checklist

After migrating a page, test:

- [ ] Page loads without errors
- [ ] Light mode looks correct
- [ ] Dark mode looks correct
- [ ] Theme toggle works smoothly
- [ ] No flash of wrong theme on page load
- [ ] All interactive elements are visible in both themes
- [ ] Text contrast meets accessibility standards

## Available Semantic Tokens

### Background Colors
- `bg-background` - Main app background
- `bg-card` - Card/panel background
- `bg-popover` - Popover/dropdown background
- `bg-muted` - Muted/disabled background
- `bg-accent` - Accent/hover background

### Text Colors
- `text-foreground` - Primary text
- `text-card-foreground` - Text on cards
- `text-popover-foreground` - Text in popovers
- `text-muted-foreground` - Secondary/muted text
- `text-accent-foreground` - Text on accent backgrounds

### Border Colors
- `border-border` - Standard borders
- `border-input` - Input field borders

### Interactive Colors
- `bg-primary` / `text-primary` - Primary action color (purple)
- `bg-secondary` / `text-secondary` - Secondary actions
- `bg-destructive` / `text-destructive` - Destructive actions (red)

### Special Colors (Status - OK to use)
These are semantic and work in both themes:
- `bg-emerald-500` / `text-emerald-600` - Success states
- `bg-amber-500` / `text-amber-600` - Warning states
- `bg-rose-500` / `text-rose-600` - Error states
- `bg-blue-500` / `text-blue-600` - Info states

## Need Help?

If you're unsure which semantic token to use:
1. Check `src/App.css` for available CSS variables
2. Look at `src/components/layout/ProfessionalSidebar.tsx` for examples
3. Refer to shadcn/ui documentation: https://ui.shadcn.com/docs/theming

## Automated Migration Script

You can create a script to help with migration:

```bash
# Find all files with hardcoded colors
grep -r "bg-white\|text-gray-900\|border-gray-200" src/pages/ --include="*.tsx"

# Count occurrences
grep -r "bg-white" src/pages/ --include="*.tsx" | wc -l
```

Then use your IDE's find & replace with regex to update patterns.
