# Icon System Migration Guide

## Overview

This guide helps migrate from mixed icon libraries (Lucide React, direct Hugeicons usage) to our standardized Icon component system.

## The Problem

Currently, the codebase has inconsistent icon usage:
- Multiple libraries: Lucide React, Hugeicons, custom SVGs
- Inconsistent sizing: `size={16}`, `w-4 h-4`, `w-6 h-6`
- Inconsistent stroke weights: 1.5, 2.0, 2.25, 2.5
- No single source of truth

## The Solution

**Single Icon Component** with standardized sizes and consistent styling.

## Standardized Icon Sizes

```typescript
export const ICON_SIZES = {
  xs: 12,   // Tiny icons in dense UIs, badges
  sm: 14,   // Small icons in compact buttons, table cells
  base: 16, // Default icon size for most UI elements
  lg: 20,   // Large icons in prominent buttons, headers
  xl: 24,   // Extra large icons in hero sections, empty states
  '2xl': 32, // Oversized icons for marketing, illustrations
}
```

## Migration Steps

### Step 1: Remove Lucide React Imports

```tsx
// ❌ OLD - Remove these
import { ChevronDown, Search, Filter } from 'lucide-react';

// ✅ NEW - Use Hugeicons
import { ArrowDown01Icon, Search01Icon, FilterIcon } from '@hugeicons/react';
import { Icon } from '@/components/ui/Icon';
```


### Step 2: Replace Icon Usage

```tsx
// ❌ OLD - Lucide with Tailwind classes
<Search className="w-5 h-5 text-gray-500" />
<Filter className="w-4 h-4" />
<ChevronDown size={20} />

// ✅ NEW - Standardized Icon component
<Icon icon={Search01Icon} size="base" className="text-gray-500" />
<Icon icon={FilterIcon} size="sm" />
<Icon icon={ArrowDown01Icon} size="lg" />
```

### Step 3: Update Button Icons

```tsx
// ❌ OLD
<ProfessionalButton icon="search">Search</ProfessionalButton>

// ✅ NEW
import { Search01Icon } from '@hugeicons/react';
<ProfessionalButton icon={Search01Icon}>Search</ProfessionalButton>
```

### Step 4: Update Badge Icons

```tsx
// ❌ OLD
<ProfessionalBadge icon="check">Active</ProfessionalBadge>

// ✅ NEW
import { Tick01Icon } from '@hugeicons/react';
<ProfessionalBadge icon={Tick01Icon}>Active</ProfessionalBadge>
```

## Size Conversion Chart

| Old Tailwind | Old Pixels | New Named Size | New Pixels |
|--------------|------------|----------------|------------|
| `w-3 h-3` | 12px | `size="xs"` | 12px |
| `w-4 h-4` | 16px | `size="sm"` | 14px |
| `w-5 h-5` | 20px | `size="base"` | 16px |
| `w-6 h-6` | 24px | `size="lg"` | 20px |
| `w-8 h-8` | 32px | `size="xl"` | 24px |


## Common Icon Mappings (Lucide → Hugeicons)

```typescript
// Navigation
ChevronDown → ArrowDown01Icon
ChevronUp → ArrowUp01Icon
ChevronLeft → ArrowLeft01Icon
ChevronRight → ArrowRight01Icon

// Actions
Plus → Add01Icon
X → Cancel01Icon
Check → Tick01Icon
Trash → Delete01Icon
Edit → Edit01Icon
Save → Save01Icon

// UI Elements
Search → Search01Icon
Filter → FilterIcon
Settings → Settings01Icon
Menu → Menu01Icon
MoreVertical → MoreVertical01Icon
MoreHorizontal → MoreHorizontal01Icon

// Status
AlertCircle → AlertCircleIcon
CheckCircle → CheckmarkCircle01Icon
XCircle → CancelCircle01Icon
Info → InformationCircleIcon

// Files & Data
Download → Download01Icon
Upload → Upload01Icon
File → File01Icon
Folder → Folder01Icon
```

## Usage Examples

### In Components
```tsx
import { Icon, ICON_SIZES } from '@/components/ui/Icon';
import { Search01Icon, FilterIcon } from '@hugeicons/react';

function SearchBar() {
  return (
    <div className="relative">
      <Icon 
        icon={Search01Icon} 
        size="base" 
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
      />
      <input className="pl-10" />
    </div>
  );
}
```


### In Buttons
```tsx
import { ProfessionalButton } from '@/components/ui/ProfessionalButton';
import { Add01Icon, Delete01Icon } from '@hugeicons/react';

<ProfessionalButton icon={Add01Icon} variant="primary">
  Create Work Order
</ProfessionalButton>

<ProfessionalButton icon={Delete01Icon} variant="danger">
  Delete
</ProfessionalButton>
```

### In Badges
```tsx
import { ProfessionalBadge } from '@/components/ui/ProfessionalBadge';
import { Tick01Icon } from '@hugeicons/react';

<ProfessionalBadge icon={Tick01Icon} variant="success">
  Completed
</ProfessionalBadge>
```

## Benefits

1. **Consistency**: All icons use same stroke weight and styling
2. **Type Safety**: Named sizes prevent arbitrary values
3. **Maintainability**: Single component to update styling
4. **Performance**: One icon library instead of multiple
5. **Accessibility**: Consistent sizing improves usability

## Finding Hugeicons

Browse icons at: https://hugeicons.com/
Or search in your IDE after importing from `@hugeicons/react`

## Quick Reference

```tsx
// Import
import { Icon, ICON_SIZES } from '@/components/ui/Icon';
import { YourIcon } from '@hugeicons/react';

// Basic usage
<Icon icon={YourIcon} size="base" />

// With custom size
<Icon icon={YourIcon} size={ICON_SIZES.lg} />

// With className
<Icon icon={YourIcon} size="sm" className="text-blue-600" />

// Industrial variant (sharp corners)
<Icon icon={YourIcon} size="base" variant="sharp" />
```
