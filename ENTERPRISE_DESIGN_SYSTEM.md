# Enterprise Design System - GOGO CMMS

## Design Principles
- **Border-based separation** over shadows and cards
- **Rectangular layouts** over rounded pills
- **Consistent density** across all components
- **Uniform text hierarchy** throughout
- **Minimal visual noise** - clean and professional

## Typography Scale

### Text Sizes
- **Primary content**: `text-sm` (14px) - Main labels, titles
- **Secondary content**: `text-xs` (12px) - Metadata, descriptions
- **Tertiary content**: `text-[10px]` (10px) - Timestamps, badges
- **Micro content**: `text-[9px]` (9px) - Very small labels

### Font Weights
- **Semibold**: `font-semibold` - Active states, headings
- **Medium**: `font-medium` - Default labels
- **Regular**: `font-normal` - Body text

## Icon Sizes
- **Navigation icons**: `w-5 h-5` (collapsed), `w-4 h-4` (expanded)
- **Content icons**: `w-3.5 h-3.5` (14px) - Standard
- **Small icons**: `w-3 h-3` (12px) - Compact areas

## Spacing Scale
- **Component padding**: `p-3`, `p-4`
- **Item spacing**: `gap-2.5`, `gap-3`, `gap-4`, `gap-5`
- **Vertical rhythm**: `py-2`, `py-2.5`, `py-3`
- **Section margins**: `mb-3`, `mb-4`

## Color Palette

### Active/Selected States
- Background: `bg-purple-50`
- Text: `text-purple-900`
- Border: `border-purple-600` (removed in current design)

### Text Hierarchy
- Primary: `text-gray-900`
- Secondary: `text-gray-600`
- Tertiary: `text-gray-500`
- Disabled: `text-gray-400`

### Borders & Dividers
- Primary: `border-gray-200`
- Light: `border-gray-100`

## Component Patterns

### 1. Sidebar Navigation
```tsx
// Full-height, edge-pinned
className="fixed left-0 top-0 bottom-0 bg-white border-r border-gray-200"

// Navigation items - rectangular, no rounded corners
className="flex items-center gap-2.5 py-2.5 px-4 w-full"
// Active state
className="bg-purple-50 text-purple-900"
```

### 2. Search Inputs
```tsx
// Compact, consistent sizing
className="w-full h-9 pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"

// Icon positioning
className="absolute left-0 pl-2.5 flex items-center pointer-events-none"
icon: "w-3.5 h-3.5 text-gray-400"
```

### 3. List Items
```tsx
// Work order list style
className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
// Selected state
className="bg-purple-50"

// Title
className="text-sm font-semibold text-gray-900"
// Metadata
className="text-xs text-gray-500"
```

### 4. Info Bars / Overview Cards
```tsx
// Horizontal info display
className="bg-white border-y border-gray-200 px-4 py-2.5"
className="flex items-center gap-5 text-xs"

// Label
className="text-gray-500"
// Value
className="font-medium text-gray-900"
```

### 5. Section Headers
```tsx
// Tab/section headings
className="px-3 py-2 border-b border-gray-200"
className="flex items-center gap-1.5"
icon: "w-3 h-3 text-gray-500"
heading: "text-xs font-semibold text-gray-900 uppercase tracking-wide"
```

### 6. Tabs
```tsx
// Tab list
className="border-b border-gray-200 px-3"

// Tab item
leftSection: icon "width={14} height={14}"
label: "text-xs"
```

### 7. Breadcrumbs
```tsx
// Container
className="px-4 py-2.5 bg-white border-b border-gray-200"

// Back button
className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-50"
icon: "w-4 h-4"
```

### 8. Stepper/Progress
```tsx
// Circle
className="w-8 h-8 rounded-full"
// Icon
className="w-4 h-4"
// Label
className="text-xs font-medium"
// Timestamp
className="text-[10px] text-gray-500"
```

## Layout Patterns

### Page Structure
```
┌─────────────────────────────────────┐
│ Breadcrumb (border-b)               │
├─────────────────────────────────────┤
│ Stepper/Progress (border-b)         │
├─────────────────────────────────────┤
│ Info Bar (border-y)                 │
├─────────────────────────────────────┤
│ Tabs (border-b)                     │
├─────────────────────────────────────┤
│ Content (p-3)                       │
│   ┌─────────────────────────────┐   │
│   │ Section Header (border-b)   │   │
│   ├─────────────────────────────┤   │
│   │ Content                     │   │
│   └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### Three-Column Layout
```
┌──────┬──────────┬────────────────┐
│ Nav  │ List     │ Details        │
│ 80px │ ~300px   │ Flex-1         │
│      │          │                │
│ Edge │ Border-r │ Main content   │
│ Pin  │          │                │
└──────┴──────────┴────────────────┘
```

## Anti-Patterns (Avoid These)

❌ Floating cards with shadows (`shadow-lg`, `rounded-xl`)
❌ Pill-shaped buttons in navigation (`rounded-full`)
❌ Inconsistent text sizes across similar components
❌ Heavy borders (`border-4` on active items)
❌ Excessive padding/margins creating "air"
❌ Mixed icon sizes in same context
❌ Scrollbars visible in navigation

## Migration Checklist

For each page/component:
- [ ] Remove card shadows, use borders
- [ ] Flatten rounded corners on navigation
- [ ] Standardize text sizes (text-xs, text-sm)
- [ ] Unify icon sizes (w-3.5 h-3.5, w-4 h-4)
- [ ] Apply consistent spacing (gap-3, gap-4, gap-5)
- [ ] Use border-based separation
- [ ] Remove left border indicators on active items
- [ ] Apply purple-50 background for selected states
- [ ] Ensure proper density (py-2, py-2.5, py-3)
- [ ] Add section headers where needed
