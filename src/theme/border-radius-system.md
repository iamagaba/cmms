# Border Radius System - Design Guidelines

## Overview

Our border radius system creates visual hierarchy and consistency across the application. The industrial CMMS aesthetic uses **sharper corners** than typical SaaS apps to convey precision and technical professionalism.

## Border Radius Scale

### Tailwind Classes & Usage

```typescript
// From tailwind.config.js
borderRadius: {
  sm: "2px",      // Minimal rounding
  md: "4px",      // Default rounding
  DEFAULT: "4px", // Same as md
  lg: "8px",      // Prominent rounding
  full: "9999px", // Perfect circles/pills
  
  // Component-specific aliases
  industrial: "8px",  // Same as lg
  component: "6px",   // Between md and lg
}
```

## Usage Guidelines

### `rounded-sm` (2px) - Minimal Rounding
**Use for:**
- ✅ Badges and status indicators
- ✅ Small chips and tags
- ✅ Table cell highlights
- ✅ Inline code blocks
- ✅ Compact UI elements in dense layouts

**Example:**
```tsx
<ProfessionalBadge className="rounded-sm">New</ProfessionalBadge>
<span className="px-2 py-0.5 bg-slate-100 rounded-sm text-xs">Tag</span>
```

**Why:** Minimal rounding maintains sharpness while preventing harsh 90° corners. Perfect for small elements where larger radius would look bulbous.

---

### `rounded-md` or `rounded` (4px) - Default Rounding
**Use for:**
- ✅ Buttons (primary, secondary, all variants)
- ✅ Input fields and text areas
- ✅ Select dropdowns
- ✅ Form controls
- ✅ Tabs
- ✅ Tooltips
- ✅ Small modals and popovers

**Example:**
```tsx
<ProfessionalButton className="rounded-md">Save</ProfessionalButton>
<input className="rounded border px-3 py-2" />
```

**Why:** This is the workhorse radius. It's professional, not too soft, not too sharp. Use this as your default unless you have a specific reason to deviate.

---

### `rounded-component` (6px) - Medium Rounding
**Use for:**
- ✅ Medium-sized cards (not full panels)
- ✅ Dropdown menus
- ✅ Toast notifications
- ✅ Alert boxes
- ✅ Search bars
- ✅ Filter panels

**Example:**
```tsx
<div className="bg-white border rounded-component p-4 shadow-md">
  <h3>Notification</h3>
  <p>Your work order has been updated.</p>
</div>
```

**Why:** Slightly more rounded than buttons/inputs to differentiate elevated UI elements. Creates subtle hierarchy.

---

### `rounded-lg` or `rounded-industrial` (8px) - Prominent Rounding
**Use for:**
- ✅ Large cards and panels
- ✅ Dashboard widgets
- ✅ Sidebar sections
- ✅ Modal dialogs
- ✅ Data tables (container)
- ✅ Chart containers
- ✅ Hero sections

**Example:**
```tsx
<div className="bg-white border rounded-lg p-6 shadow-lg">
  <h2>Work Order Details</h2>
  {/* Content */}
</div>
```

**Why:** Larger surfaces need more rounding to feel polished. The 8px radius is prominent without being overly soft or "consumer app" feeling.

---

### `rounded-full` (9999px) - Perfect Circles
**Use for:**
- ✅ Avatar images
- ✅ Icon-only buttons (circular)
- ✅ Notification dots
- ✅ Loading spinners
- ✅ Floating action buttons
- ✅ Status indicators (dots)

**Example:**
```tsx
<button className="w-10 h-10 rounded-full bg-purple-600 text-white">
  <Icon icon={PlusIcon} size="base" />
</button>
<span className="w-2 h-2 rounded-full bg-green-500" />
```

**Why:** Perfect circles for circular elements. Never use this on rectangular elements.

---

## Decision Tree

```
Is it a circle/pill shape?
├─ YES → rounded-full
└─ NO ↓

Is it smaller than 32px in height?
├─ YES → rounded-sm (badges, tags, chips)
└─ NO ↓

Is it an interactive control? (button, input, select)
├─ YES → rounded-md (4px)
└─ NO ↓

Is it a floating/elevated element? (dropdown, toast, alert)
├─ YES → rounded-component (6px)
└─ NO ↓

Is it a large container? (card, panel, modal)
└─ YES → rounded-lg (8px)
```

## Component-Specific Standards

### Buttons
```tsx
// All button variants use rounded-md (4px)
<ProfessionalButton variant="primary" className="rounded-md">
<ProfessionalButton variant="outline" className="rounded-md">
<ProfessionalIconButton className="rounded-md"> // Square icon buttons
<ProfessionalIconButton className="rounded-full"> // Circular icon buttons
```

### Badges
```tsx
// All badges use rounded-sm (2px) for sharpness
<ProfessionalBadge className="rounded-sm">
<WorkOrderStatusBadge className="rounded-sm">
<PriorityBadge className="rounded-sm">
```

### Cards
```tsx
// Small cards (< 300px wide)
<div className="rounded-component"> // 6px

// Large cards/panels (> 300px wide)
<div className="rounded-lg"> // 8px

// Dashboard widgets
<div className="rounded-industrial"> // 8px (alias for lg)
```

### Forms
```tsx
// All form inputs use rounded-md (4px)
<input className="rounded" />
<textarea className="rounded" />
<select className="rounded" />
```

### Modals & Dialogs
```tsx
// All modals use rounded-lg (8px)
<Dialog className="rounded-lg">
<Drawer className="rounded-lg">
```

## Anti-Patterns ❌

### Don't Mix Radii on Related Elements
```tsx
// ❌ BAD - Inconsistent radii in button group
<div className="flex gap-2">
  <button className="rounded-sm">Cancel</button>
  <button className="rounded-lg">Save</button>
</div>

// ✅ GOOD - Consistent radii
<div className="flex gap-2">
  <button className="rounded-md">Cancel</button>
  <button className="rounded-md">Save</button>
</div>
```

### Don't Use Arbitrary Values
```tsx
// ❌ BAD - Custom radius not in design system
<div className="rounded-[12px]">

// ✅ GOOD - Use system values
<div className="rounded-lg">
```

### Don't Use rounded-full on Rectangles
```tsx
// ❌ BAD - Pill shape on rectangular button
<button className="px-6 py-2 rounded-full">Save</button>

// ✅ GOOD - Appropriate radius for button
<button className="px-6 py-2 rounded-md">Save</button>
```

## Visual Hierarchy

The border radius scale creates subtle hierarchy:

```
Smallest radius (2px)  → Least important / Most compact
      ↓
Default radius (4px)   → Standard interactive elements
      ↓
Medium radius (6px)    → Elevated/floating elements
      ↓
Large radius (8px)     → Important containers / Panels
      ↓
Full radius (9999px)   → Special circular elements
```

## Industrial Design Philosophy

Our CMMS app uses **sharper corners** than consumer apps because:

1. **Precision**: Industrial equipment has precise edges, not soft curves
2. **Professionalism**: Sharper = more technical and serious
3. **Density**: Smaller radii allow tighter layouts without visual clutter
4. **Hierarchy**: Subtle radius differences create clear hierarchy

Compare to consumer apps (often 12-16px radius), we max out at 8px for large containers.

## Migration Notes

If you find components using inconsistent radii:

1. Check component size/type
2. Refer to decision tree above
3. Update to appropriate system value
4. Remove any arbitrary `rounded-[Xpx]` values

## Quick Reference

| Element Type | Radius Class | Pixels | Use Case |
|-------------|--------------|--------|----------|
| Badge, Tag, Chip | `rounded-sm` | 2px | Small inline elements |
| Button, Input, Tab | `rounded-md` or `rounded` | 4px | Interactive controls |
| Dropdown, Toast, Alert | `rounded-component` | 6px | Floating elements |
| Card, Panel, Modal | `rounded-lg` or `rounded-industrial` | 8px | Large containers |
| Avatar, Icon Button | `rounded-full` | 9999px | Circular elements |

---

**Last Updated:** January 2026  
**Maintained by:** Design System Team
