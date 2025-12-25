# Quick Start - Enterprise Design System

**Get started in 5 minutes!**

---

## 🚀 Step 1: Import the Components

```tsx
// Atomic components
import { Input, Panel, PanelHeader, PanelContent, Badge, StatusBadge } from '@/components/ui/enterprise';

// Layouts
import { MasterDetailLayout } from '@/components/layouts/MasterDetailLayout';

// Navigation
import ProfessionalSidebar from '@/components/layout/ProfessionalSidebar';
```

---

## 🎯 Step 2: Choose Your Layout

### Option A: 3-Column Layout (List-based pages)
**Use for**: Work Orders, Assets, Inventory, Customers, Technicians

```tsx
<MasterDetailLayout
  sidebar={<ProfessionalSidebar />}
  list={<YourListComponent />}
  detail={<YourDetailComponent />}
/>
```

### Option B: 2-Column Layout (Content pages)
**Use for**: Dashboard, Reports, Settings

```tsx
<TwoColumnLayout
  sidebar={<ProfessionalSidebar />}
  content={<YourContentComponent />}
/>
```

---

## 📝 Step 3: Build Your List (if using 3-column)

```tsx
<div className="flex flex-col h-full">
  {/* Search Header */}
  <div className="p-4 border-b border-gray-200">
    <Input 
      placeholder="Search..."
      leftIcon={<Icon icon="tabler:search" className="w-3.5 h-3.5 text-gray-400" />}
    />
  </div>

  {/* List Items */}
  <div className="flex-1 overflow-auto">
    {items.map(item => (
      <div 
        key={item.id}
        className={cn('list-row', selected === item.id && 'list-row-active')}
        onClick={() => setSelected(item.id)}
      >
        <h4 className="text-sm font-semibold">{item.title}</h4>
        <p className="text-xs text-gray-500">{item.subtitle}</p>
      </div>
    ))}
  </div>
</div>
```

---

## 📄 Step 4: Build Your Detail View

```tsx
<div>
  {/* Info Bar */}
  <div className="info-bar">
    <div className="info-bar-item">
      <Icon icon="tabler:user" className="w-3.5 h-3.5 text-blue-600" />
      <span className="text-gray-500">Name:</span>
      <span className="font-medium text-gray-900">{item.name}</span>
    </div>
    <div className="info-bar-divider" />
    <div className="info-bar-item">
      <Icon icon="tabler:calendar" className="w-3.5 h-3.5 text-emerald-600" />
      <span className="text-gray-500">Date:</span>
      <span className="font-medium text-gray-900">{item.date}</span>
    </div>
  </div>

  {/* Content */}
  <div className="p-4">
    <Panel>
      <PanelHeader>
        <h3 className="text-xs font-semibold uppercase tracking-wide">Details</h3>
      </PanelHeader>
      <PanelContent>
        <div className="form-grid">
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Field 1</label>
            <p className="text-sm text-gray-900">{item.field1}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Field 2</label>
            <p className="text-sm text-gray-900">{item.field2}</p>
          </div>
        </div>
      </PanelContent>
    </Panel>
  </div>
</div>
```

---

## 🎨 Step 5: Use Common Patterns

### Search Input
```tsx
<Input 
  placeholder="Search..."
  leftIcon={<Icon icon="tabler:search" className="w-3.5 h-3.5 text-gray-400" />}
/>
```

### Status Badge
```tsx
<StatusBadge status="In Progress" />
<StatusBadge status="Completed" />
```

### Section Header
```tsx
<div className="section-header">
  <Icon icon="tabler:notes" className="w-3.5 h-3.5 text-gray-500" />
  <h3 className="section-header-title">Section Title</h3>
</div>
```

### Empty State
```tsx
<div className="empty-state">
  <Icon icon="tabler:inbox" className="empty-state-icon" />
  <p className="empty-state-text">No items found</p>
</div>
```

---

## ✅ Complete Example

```tsx
import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import { MasterDetailLayout } from '@/components/layouts/MasterDetailLayout';
import { Input, Panel, PanelHeader, PanelContent, StatusBadge } from '@/components/ui/enterprise';
import ProfessionalSidebar from '@/components/layout/ProfessionalSidebar';

export default function MyPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const items = [
    { id: '1', title: 'Item 1', status: 'Active', description: 'Description 1' },
    { id: '2', title: 'Item 2', status: 'Completed', description: 'Description 2' },
  ];
  
  const selectedItem = items.find(i => i.id === selectedId);

  return (
    <MasterDetailLayout
      sidebar={<ProfessionalSidebar />}
      
      list={
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200">
            <Input 
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Icon icon="tabler:search" className="w-3.5 h-3.5 text-gray-400" />}
            />
          </div>
          
          <div className="flex-1 overflow-auto">
            {items.map(item => (
              <div 
                key={item.id}
                className={cn('list-row', selectedId === item.id && 'list-row-active')}
                onClick={() => setSelectedId(item.id)}
              >
                <h4 className="text-sm font-semibold">{item.title}</h4>
                <StatusBadge status={item.status} />
              </div>
            ))}
          </div>
        </div>
      }
      
      detail={
        selectedItem ? (
          <div className="p-4">
            <Panel>
              <PanelHeader>
                <h3 className="text-xs font-semibold uppercase tracking-wide">Details</h3>
              </PanelHeader>
              <PanelContent>
                <p>{selectedItem.description}</p>
              </PanelContent>
            </Panel>
          </div>
        ) : (
          <div className="empty-state">
            <Icon icon="tabler:inbox" className="empty-state-icon" />
            <p className="empty-state-text">Select an item to view details</p>
          </div>
        )
      }
    />
  );
}
```

---

## 📚 Need More Help?

- **Full Guide**: `ENTERPRISE_DESIGN_IMPLEMENTATION_GUIDE.md`
- **Migration Example**: `EXAMPLE_ASSETS_PAGE_MIGRATION.md`
- **Reference**: Work Orders page (`src/pages/WorkOrderDetailsEnhanced.tsx`)

---

**That's it! You're ready to build enterprise-grade pages. 🎉**
