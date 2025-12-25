# Enterprise Design System - Implementation Guide

## Overview

This guide explains how to use the enterprise design system components to maintain consistency across the entire application. The system is built on three layers:

1. **Atoms** - Basic UI components (Input, Badge, Panel)
2. **Layouts** - Page structure components (MasterDetailLayout, PageLayout)
3. **Utilities** - CSS classes for common patterns

## 🎯 Goals

- **Consistency**: Every page looks and feels the same
- **Maintainability**: Change design once, updates everywhere
- **Prevention**: Impossible to accidentally break the design
- **Speed**: Build new pages faster with pre-built components

---

## Layer 1: Atomic Components

### Input Component

**Purpose**: Standardized input fields with consistent sizing and styling.

**Standards Enforced**:
- Height: `h-9` (36px)
- Corners: `rounded-md`
- Border: `border-gray-200`
- Focus: `ring-1 ring-purple-600`

**Usage**:
```tsx
import { Input } from '@/components/ui/enterprise';

// Basic input
<Input placeholder="Search..." />

// With icon
<Input 
  placeholder="Search work orders..."
  leftIcon={<Icon icon="tabler:search" className="w-3.5 h-3.5 text-gray-400" />}
/>

// Controlled input
<Input 
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
/>
```

**Migration**:
```tsx
// ❌ OLD - Inconsistent styling
<input className="h-10 rounded-lg border px-4" />

// ✅ NEW - Standardized
<Input />
```

---

### Panel Component

**Purpose**: Standardized container that enforces "Border, No Shadow" rule.

**Standards Enforced**:
- Background: `bg-white`
- Border: `border-gray-200`
- Corners: `rounded-lg`
- No shadows

**Usage**:
```tsx
import { Panel, PanelHeader, PanelContent, PanelFooter } from '@/components/ui/enterprise';

<Panel>
  <PanelHeader>
    <h3 className="text-sm font-semibold">Work Order Details</h3>
  </PanelHeader>
  <PanelContent>
    <p>Content goes here</p>
  </PanelContent>
  <PanelFooter>
    <Button>Save</Button>
  </PanelFooter>
</Panel>
```

**Migration**:
```tsx
// ❌ OLD - Inconsistent card styling
<div className="bg-white rounded-xl shadow-lg p-6">
  <h3>Title</h3>
  <p>Content</p>
</div>

// ✅ NEW - Standardized
<Panel>
  <PanelHeader>Title</PanelHeader>
  <PanelContent>Content</PanelContent>
</Panel>
```

---

### Badge Component

**Purpose**: Standardized status indicators and labels.

**Standards Enforced**:
- Size: `text-xs`
- Padding: `px-2 py-0.5`
- Border-based design
- Predefined color variants

**Usage**:
```tsx
import { Badge, StatusBadge, PriorityBadge } from '@/components/ui/enterprise';

// Generic badge
<Badge variant="purple">Active</Badge>
<Badge variant="green">Completed</Badge>

// Status badge (auto-colors based on status)
<StatusBadge status="In Progress" />
<StatusBadge status="Completed" />

// Priority badge (auto-colors based on priority)
<PriorityBadge priority="High" />
<PriorityBadge priority="Low" />
```

**Available Variants**:
- `default` - Gray
- `purple` - Purple (active states)
- `green` - Green (success, completed)
- `blue` - Blue (info, open)
- `orange` - Orange (warning, in progress)
- `red` - Red (error, critical)
- `yellow` - Yellow (caution, medium priority)
- `gray` - Gray (inactive, on hold)

**Migration**:
```tsx
// ❌ OLD - Inconsistent badge styling
<span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
  Completed
</span>

// ✅ NEW - Standardized
<StatusBadge status="Completed" />
```

---

## Layer 2: Layout Components

### MasterDetailLayout

**Purpose**: 3-column layout for list-based pages (Work Orders, Assets, Inventory).

**Structure**:
- Left: Main navigation sidebar (280px expanded / 80px collapsed)
- Middle: List view (320px fixed)
- Right: Detail view (flexible)

**Usage**:
```tsx
import { MasterDetailLayout } from '@/components/layouts/MasterDetailLayout';
import ProfessionalSidebar from '@/components/layout/ProfessionalSidebar';

<MasterDetailLayout
  sidebar={<ProfessionalSidebar />}
  list={<WorkOrderList />}
  detail={<WorkOrderDetails />}
/>
```

**Example - Assets Page**:
```tsx
export default function AssetsPage() {
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  return (
    <MasterDetailLayout
      sidebar={<ProfessionalSidebar />}
      list={
        <div className="flex flex-col h-full">
          {/* Search Header */}
          <div className="p-4 border-b border-gray-200">
            <Input 
              placeholder="Search assets..."
              leftIcon={<Icon icon="tabler:search" className="w-3.5 h-3.5 text-gray-400" />}
            />
          </div>
          
          {/* Asset List */}
          <div className="flex-1 overflow-auto">
            {assets.map(asset => (
              <div 
                key={asset.id}
                className={cn(
                  'list-row',
                  selectedAssetId === asset.id && 'list-row-active'
                )}
                onClick={() => setSelectedAssetId(asset.id)}
              >
                <h4 className="text-sm font-semibold">{asset.name}</h4>
                <p className="text-xs text-gray-500">{asset.licensePlate}</p>
              </div>
            ))}
          </div>
        </div>
      }
      detail={
        selectedAssetId ? (
          <AssetDetails assetId={selectedAssetId} />
        ) : (
          <div className="empty-state">
            <Icon icon="tabler:package" className="empty-state-icon" />
            <p className="empty-state-text">Select an asset to view details</p>
          </div>
        )
      }
    />
  );
}
```

---

### TwoColumnLayout

**Purpose**: Simplified layout for pages without a middle list (Dashboard, Reports).

**Structure**:
- Left: Main navigation sidebar
- Right: Content area (flexible)

**Usage**:
```tsx
import { TwoColumnLayout } from '@/components/layouts/MasterDetailLayout';

<TwoColumnLayout
  sidebar={<ProfessionalSidebar />}
  content={<DashboardContent />}
/>
```

---

### PageLayout

**Purpose**: Standardized structure for detail/content pages with header and optional sidebar.

**Usage**:
```tsx
import { PageLayout, ContentContainer } from '@/components/layouts/PageLayout';
import ModernBreadcrumbs from '@/components/navigation/ModernBreadcrumbs';

<PageLayout
  header={
    <ModernBreadcrumbs 
      actions={
        <>
          <Button variant="outline">Cancel</Button>
          <Button>Save Changes</Button>
        </>
      }
    />
  }
  content={
    <ContentContainer>
      <Panel>
        <PanelHeader>Settings</PanelHeader>
        <PanelContent>
          <form>...</form>
        </PanelContent>
      </Panel>
    </ContentContainer>
  }
/>
```

---

## Layer 3: CSS Utility Classes

### List Patterns

**list-row**: Standard row in a master list
```tsx
<div className="list-row">
  <h4>Item Title</h4>
  <p>Item description</p>
</div>
```

**list-row-active**: Active/selected state
```tsx
<div className={cn('list-row', isSelected && 'list-row-active')}>
  <h4>Selected Item</h4>
</div>
```

---

### Header Patterns

**ribbon-header**: Standard header bar for detail pages
```tsx
<div className="ribbon-header">
  <Icon icon="tabler:info-circle" className="w-4 h-4" />
  <span>Work Order Details</span>
</div>
```

**section-header**: Header for content sections
```tsx
<div className="section-header">
  <Icon icon="tabler:notes" className="w-3.5 h-3.5 text-gray-500" />
  <h3 className="section-header-title">Notes</h3>
</div>
```

---

### Info Bar Pattern

**info-bar**: Horizontal information strip (like WorkOrderOverviewCards)
```tsx
<div className="info-bar">
  <div className="info-bar-item">
    <Icon icon="tabler:user" className="w-3.5 h-3.5 text-blue-600" />
    <span className="text-gray-500">Customer:</span>
    <span className="font-medium text-gray-900">John Doe</span>
  </div>
  
  <div className="info-bar-divider" />
  
  <div className="info-bar-item">
    <Icon icon="tabler:motorbike" className="w-3.5 h-3.5 text-purple-600" />
    <span className="text-gray-500">Asset:</span>
    <span className="font-medium text-gray-900">ABC-123</span>
  </div>
</div>
```

---

### Empty State Pattern

**empty-state**: Centered empty state message
```tsx
<div className="empty-state">
  <Icon icon="tabler:clipboard-off" className="empty-state-icon" />
  <p className="empty-state-text">No work orders found</p>
  <Button className="mt-4">Create Work Order</Button>
</div>
```

---

### Grid Patterns

**card-grid**: Responsive grid for cards
```tsx
<div className="card-grid">
  <Panel>Card 1</Panel>
  <Panel>Card 2</Panel>
  <Panel>Card 3</Panel>
</div>
```

**form-grid**: Two-column form layout
```tsx
<div className="form-grid">
  <div>
    <label>First Name</label>
    <Input />
  </div>
  <div>
    <label>Last Name</label>
    <Input />
  </div>
</div>
```

---

## Migration Strategy

### Phase 1: New Pages (Immediate)
All new pages MUST use the enterprise components:
```tsx
// ✅ Correct approach for new pages
import { MasterDetailLayout } from '@/components/layouts/MasterDetailLayout';
import { Input, Panel } from '@/components/ui/enterprise';
```

### Phase 2: High-Traffic Pages (Week 1)
Migrate the most-used pages first:
1. Dashboard
2. Work Orders (already done ✅)
3. Assets
4. Technicians

### Phase 3: Remaining Pages (Week 2-3)
Migrate all other pages:
- Customers
- Inventory
- Scheduling
- Reports
- Settings

### Phase 4: Cleanup (Week 4)
- Remove old component variants
- Update documentation
- Create Storybook examples

---

## Design Tokens Reference

### Spacing Scale
- `0.5` = 2px
- `1` = 4px
- `1.5` = 6px
- `2` = 8px
- `2.5` = 10px
- `3` = 12px
- `4` = 16px
- `5` = 20px
- `6` = 24px

### Typography Scale
- `text-xs` = 12px (labels, timestamps, badges)
- `text-sm` = 14px (body text, navigation)
- `text-base` = 16px (headings, emphasis)
- `text-lg` = 18px (page titles)

### Icon Sizes
- `w-3 h-3` = 12px (tiny indicators)
- `w-3.5 h-3.5` = 14px (content icons, badges)
- `w-4 h-4` = 16px (navigation icons, buttons)
- `w-5 h-5` = 20px (collapsed sidebar icons)

### Border Radius
- `rounded` = 4px (inputs, small elements)
- `rounded-md` = 6px (inputs, buttons)
- `rounded-lg` = 8px (panels, cards)
- `rounded-xl` = 12px (large containers)

### Colors
- **Primary**: Purple (`purple-50` to `purple-900`)
- **Success**: Emerald (`emerald-50` to `emerald-900`)
- **Warning**: Orange (`orange-50` to `orange-900`)
- **Error**: Red (`red-50` to `red-900`)
- **Info**: Blue (`blue-50` to `blue-900`)
- **Neutral**: Gray (`gray-50` to `gray-900`)

---

## Anti-Patterns to Avoid

### ❌ Don't Mix Old and New Styles
```tsx
// ❌ BAD - Mixing raw HTML with enterprise components
<div className="bg-white shadow-lg rounded-xl p-6">
  <Input placeholder="Search..." />
</div>

// ✅ GOOD - Use Panel component
<Panel>
  <PanelContent>
    <Input placeholder="Search..." />
  </PanelContent>
</Panel>
```

### ❌ Don't Override Component Styles
```tsx
// ❌ BAD - Fighting the component's built-in styles
<Input className="h-12 rounded-lg" />

// ✅ GOOD - Use the component as-is
<Input />
```

### ❌ Don't Create Custom Variants
```tsx
// ❌ BAD - Creating one-off styles
<div className="bg-white border-2 border-blue-500 rounded-2xl shadow-xl">

// ✅ GOOD - Use standard Panel
<Panel>
```

### ❌ Don't Use Shadows
```tsx
// ❌ BAD - Shadows break the enterprise look
<div className="shadow-lg">

// ✅ GOOD - Use borders
<div className="border border-gray-200">
```

---

## Quick Reference

### Import Paths
```tsx
// Atomic components
import { Input, Panel, Badge } from '@/components/ui/enterprise';

// Layouts
import { MasterDetailLayout, TwoColumnLayout } from '@/components/layouts/MasterDetailLayout';
import { PageLayout, ContentContainer } from '@/components/layouts/PageLayout';

// Navigation
import ProfessionalSidebar from '@/components/layout/ProfessionalSidebar';
import ModernBreadcrumbs from '@/components/navigation/ModernBreadcrumbs';
```

### Common Patterns
```tsx
// Search input with icon
<Input 
  leftIcon={<Icon icon="tabler:search" className="w-3.5 h-3.5 text-gray-400" />}
  placeholder="Search..."
/>

// List item with active state
<div className={cn('list-row', isActive && 'list-row-active')}>

// Section header
<div className="section-header">
  <Icon icon="tabler:notes" className="w-3.5 h-3.5 text-gray-500" />
  <h3 className="section-header-title">Section Title</h3>
</div>

// Info bar
<div className="info-bar">
  <div className="info-bar-item">...</div>
  <div className="info-bar-divider" />
  <div className="info-bar-item">...</div>
</div>
```

---

## Support

For questions or issues with the enterprise design system:
1. Check this guide first
2. Review the Work Orders page implementation (reference example)
3. Check the component source code in `src/components/ui/enterprise/`
4. Consult the design system documentation at `/design-system`

---

**Last Updated**: December 2024
**Version**: 1.0.0
