# CMMS Density System Standard

## Problem Analysis

Looking at your screenshots at 100% zoom:

**Reports Page (Good ✅):**
- Sidebar width: 224px (56 collapsed)
- Text sizes: 12-14px body, 10-11px labels
- Icon sizes: 14px
- Spacing: Compact but readable
- Overall: Professional, dense, scannable

**Scheduling Page (Too Small ❌):**
- Calendar text: ~10px (too small)
- Technician names: Hard to read
- Calendar cells: Cramped
- Overall: Feels "zoomed out"

**Main Sidebar (Too Small ❌):**
- Navigation text: Too small
- Icons: Undersized when collapsed
- Overall: Inconsistent with Reports sidebar

## Root Cause

The app has **inconsistent density standards**. Some pages use the Reports page sizing (good), while others use smaller values that make text unreadable at 100% zoom.

## Solution: Unified Density Standard

### Typography Scale (Desktop CMMS)

```css
/* Page Titles */
--text-page-title: 14px (font-semibold)

/* Section Headers */
--text-section-header: 12px (font-semibold)

/* Body Text / Primary Labels */
--text-body: 12px (font-normal)
--text-body-medium: 12px (font-medium)

/* Secondary Labels / Metadata */
--text-secondary: 11px (font-normal)

/* Tertiary Labels / Captions */
--text-caption: 10px (font-medium, uppercase, tracking-wide)

/* Minimum Readable Size */
--text-minimum: 10px (never go below this)
```

### Icon Sizes

```css
/* Page/Section Icons */
--icon-large: 16px

/* Navigation Icons (expanded sidebar) */
--icon-medium: 14px

/* Inline Icons / Buttons */
--icon-small: 12-14px

/* Collapsed Sidebar Icons */
--icon-collapsed: 18px (larger for better visibility)
```

### Spacing Scale

```css
/* Component Padding */
--spacing-component-x: 12px (px-3)
--spacing-component-y: 10px (py-2.5)

/* Compact Component Padding */
--spacing-compact-x: 8px (px-2)
--spacing-compact-y: 6px (py-1.5)

/* Gaps */
--gap-tight: 4px (gap-1)
--gap-normal: 8px (gap-2)
--gap-comfortable: 12px (gap-3)
```

### Component Standards

#### Sidebar Navigation
```tsx
// Expanded width
width: 200px

// Collapsed width  
width: 56px

// Navigation item
padding: py-1.5 px-2
text: text-xs (12px)
icon: 14px (expanded), 18px (collapsed)
gap: gap-2 (8px)

// Header
padding: px-3 py-2.5
title: text-sm font-semibold (14px)
subtitle: text-[10px] (10px)
```

#### Page Headers
```tsx
padding: px-3 py-2.5 (or px-4 py-3 for more breathing room)
title: text-sm font-semibold (14px)
subtitle: text-xs (12px)
border-bottom: border-gray-200
```

#### Calendar/Grid Components
```tsx
// Header cells
text: text-xs font-semibold (12px)
padding: py-1.5 px-2

// Body cells
min-height: 80px (not 60px - too cramped)
padding: p-2 (not p-1.5)

// Cell labels
text: text-xs (12px, not 10px)
secondary: text-[11px] (11px)
```

#### Data Tables
```tsx
// Header
text: text-xs font-medium (12px)
padding: px-3 py-2

// Body cells
text: text-xs (12px)
padding: px-3 py-2
```

## Implementation Priority

### Phase 1: Fix Critical Issues (Now)
1. ✅ Scheduling calendar - increase text sizes and cell heights
2. ✅ Sidebar navigation - ensure consistent sizing with Reports
3. ✅ Create reusable density constants

### Phase 2: Standardize Remaining Pages
1. Work Orders page
2. Assets page
3. Dashboard
4. Settings

### Phase 3: Create Design Tokens
1. CSS variables for all sizes
2. Tailwind config extensions
3. TypeScript constants

## Key Principles

1. **Minimum 12px for body text** - Anything smaller is hard to read at 100% zoom
2. **Consistent icon sizing** - 14px for navigation, 16px for headers
3. **Breathing room** - Dense doesn't mean cramped
4. **Hierarchy** - Clear visual distinction between primary and secondary text
5. **Touch targets** - Minimum 32px height for interactive elements

## Before/After Comparison

### Scheduling Calendar

**Before:**
- Technician name: text-xs (12px) ✅
- Hours text: text-[10px] (10px) ❌ Too small
- Cell height: 60px ❌ Too cramped
- Cell padding: p-1.5 ❌ Too tight
- Date badge: text-[10px] ❌ Too small

**After:**
- Technician name: text-sm font-semibold (14px) ✅
- Hours text: text-xs (12px) ✅
- Cell height: 80px ✅ More comfortable
- Cell padding: p-2 ✅ Better spacing
- Date badge: text-xs (12px) ✅ Readable

### Sidebar Navigation

**Before:**
- Nav item text: text-xs (12px) ✅ Good
- Nav item icon: 14px (expanded) ✅ Good
- Collapsed icon: 18px ✅ Good
- Padding: py-1.5 px-2 ✅ Good

**After:**
- Keep all current sizes ✅ Already matches Reports

## Testing Checklist

- [ ] View at 100% zoom on 1920x1080 display
- [ ] All body text is 12px or larger
- [ ] Icons are clearly visible
- [ ] Interactive elements have adequate spacing
- [ ] Hierarchy is clear (titles > body > captions)
- [ ] Consistent across all pages

## Reference: Reports Page (Gold Standard)

The Reports page has the ideal density balance:
- Sidebar: 224px wide, text-xs (12px), icons 14px
- Page header: px-4 py-2, text-sm (14px)
- Cards: p-3, text-xs (12px) for body
- Labels: text-[10px] (10px) for captions only
- Spacing: Compact but never cramped

**Use Reports page as the reference for all other pages.**
