# shadcn/ui Best Practices - Fixes Applied

## Summary

Fixed inconsistent usage of shadcn/ui components to follow enterprise CMMS design system standards.

## Changes Made

### 1. Settings.tsx - Fixed CardTitle Sizing

**Before:**
```tsx
<CardTitle className="flex items-center gap-2">
  <HugeiconsIcon icon={UserIcon} size={20} />
  Personal Information
</CardTitle>
```

**After:**
```tsx
<CardTitle className="text-sm flex items-center gap-2">
  <HugeiconsIcon icon={UserIcon} size={16} />
  Personal Information
</CardTitle>
```

**Changes:**
- ✅ Added `text-sm` to override default `text-2xl`
- ✅ Reduced icon size from 20px to 16px for consistency
- ✅ Applied to 4 CardTitle instances in Settings.tsx

### 2. Updated Steering Document

Added comprehensive shadcn/ui best practices section:
- **Typography overrides** - Always use text-sm for CardTitle
- **Spacing overrides** - Use pt-3 pb-3 instead of p-6
- **Icon sizing** - Use w-4 h-4 (16px) or w-3.5 h-3.5 (14px)
- **Button sizing** - Use size="sm" for compact UI
- **Checklist** - Quick reference for developers

## Best Practice Pattern

### ✅ Correct Usage (Enterprise CMMS)

```tsx
<Card>
  <CardHeader className="pb-2">
    <CardTitle className="text-sm flex items-center gap-2">
      <Icon className="w-4 h-4" />
      Section Title
    </CardTitle>
  </CardHeader>
  <CardContent className="pt-3 pb-3">
    <p className="text-xs">Body text content</p>
  </CardContent>
</Card>

<Button size="sm" variant="outline">
  <Icon className="w-3.5 h-3.5" />
  Action
</Button>
```

### ❌ Incorrect Usage (Avoid)

```tsx
<Card>
  <CardHeader> {/* p-6 default - too much padding */}
    <CardTitle> {/* text-2xl default - too large */}
      Section Title
    </CardTitle>
  </CardHeader>
  <CardContent> {/* p-6 default - too much padding */}
    <p>Body text</p>
  </CardContent>
</Card>

<Button> {/* h-10 default - use size="sm" for h-9 */}
  <Icon size={20} /> {/* Too large for compact UI */}
  Action
</Button>
```

## Why These Changes Matter

### 1. Visual Consistency
- All card titles now use consistent text-sm (14px) sizing
- Icons are consistently sized (14-16px range)
- Spacing is uniform across all cards

### 2. Enterprise CMMS Aesthetic
- Compact, professional appearance
- More information density without clutter
- Matches Reports page (gold standard)

### 3. shadcn/ui Compatibility
- Uses shadcn/ui components as intended (base structure)
- Overrides defaults to match design system
- No conflicts - just customization

## Verification

### Pages Already Following Best Practices
- ✅ **Reports.tsx** - All CardTitles use text-sm
- ✅ **WorkOrders.tsx** - Error card uses text-lg (acceptable for errors)

### Pages Fixed
- ✅ **Settings.tsx** - Fixed 4 CardTitle instances

### Remaining Work
Check other pages for similar issues:
- [ ] Dashboard pages
- [ ] Asset pages
- [ ] Inventory pages
- [ ] Other settings/admin pages

## Quick Reference

### Typography
```tsx
<CardTitle className="text-sm">Title</CardTitle>
<CardDescription className="text-xs">Description</CardDescription>
<p className="text-xs">Body text (12px minimum)</p>
<span className="text-[11px]">Metadata (11px)</span>
<span className="text-[10px]">Captions (10px minimum)</span>
```

### Icons
```tsx
<Icon className="w-4 h-4" /> // 16px - Card/dialog titles
<Icon className="w-3.5 h-3.5" /> // 14px - Inline content
<Icon className="w-3 h-3" /> // 12px - Compact areas
```

### Spacing
```tsx
<CardHeader className="pb-2"> // Compact header
<CardContent className="pt-3 pb-3"> // Compact content
<div className="gap-3"> // 12px gaps
<div className="space-y-4"> // 16px vertical spacing
```

### Buttons
```tsx
<Button size="sm"> // h-9 - Standard
<Button size="icon"> // Icon-only buttons
```

## Resources

- **Steering Document**: `.kiro/steering/app-version-separation.md`
- **Design System V2**: `http://localhost:5173/design-system-v2`
- **Enterprise Design**: `ENTERPRISE_DESIGN_SYSTEM.md`
- **Density Standard**: `DENSITY_SYSTEM_STANDARD.md`

---

**Status**: ✅ Settings.tsx fixed, steering document updated
**Next**: Audit remaining pages for consistency
