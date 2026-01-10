# Design System Quick Reference

## Icon Sizes

```typescript
ICON_SIZES = {
  xs: 12,   // Badges, dense UIs
  sm: 14,   // Compact buttons, table cells
  base: 16, // Default (most common)
  lg: 20,   // Prominent buttons, headers
  xl: 24,   // Hero sections, empty states
  '2xl': 32 // Marketing, illustrations
}
```

**Usage:**
```tsx
import { Icon } from '@/components/ui/Icon';
import { Search01Icon } from '@hugeicons/react';

<Icon icon={Search01Icon} size="base" />
```

## Border Radius

```typescript
rounded-sm (2px)        → Badges, tags, chips
rounded-md (4px)        → Buttons, inputs, tabs (DEFAULT)
rounded-component (6px) → Dropdowns, toasts, alerts
rounded-lg (8px)        → Cards, panels, modals
rounded-full (9999px)   → Avatars, circular buttons
```

**Decision Tree:**
- Circle/pill? → `rounded-full`
- Small (<32px)? → `rounded-sm`
- Interactive control? → `rounded-md`
- Floating element? → `rounded-component`
- Large container? → `rounded-lg`

## Typography

```typescript
Font Families:
- Geist → UI, body text, forms, tables
- Bricolage Grotesque → Headings, brand elements
- Geist Mono → Technical data, code, metrics
```


## Color Palette

```typescript
Primary: Purple (brand)
- purple-600 → Primary actions
- purple-700 → Hover states

Semantic:
- green-600 → Success, operational
- red-600 → Error, danger, critical
- amber-600 → Warning, caution
- blue-600 → Info, neutral actions

Neutrals:
- slate-50 to slate-900 → UI backgrounds, text
```

## Spacing Scale

```typescript
Compact Mode (isCompact = true):
- Buttons: h-7, h-8, h-9
- Padding: px-2.5, px-3, px-4
- Gaps: gap-1, gap-1.5, gap-2

Cozy Mode (isCompact = false):
- Buttons: h-8, h-9, h-10
- Padding: px-3, px-4, px-5
- Gaps: gap-1.5, gap-2, gap-2
```

## Component Standards

### Buttons
```tsx
<ProfessionalButton 
  variant="primary|secondary|outline|ghost|danger|success"
  size="sm|base|lg"
  icon={IconComponent}
  className="rounded-md" // Always 4px
/>
```

### Badges
```tsx
<ProfessionalBadge
  variant="default|success|warning|error|info|primary"
  size="xs|sm|base|lg"
  icon={IconComponent}
  className="rounded-sm" // Always 2px
/>
```

### Icons
```tsx
<Icon 
  icon={IconComponent}
  size="xs|sm|base|lg|xl|2xl"
  variant="default|bold|sharp"
/>
```
