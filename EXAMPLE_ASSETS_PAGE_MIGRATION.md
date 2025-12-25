# Example: Assets Page Migration

This document shows a complete before/after example of migrating the Assets page to use the enterprise design system.

---

## ❌ BEFORE - Old Inconsistent Style

```tsx
// src/pages/AssetsPage.tsx (OLD VERSION)
import React, { useState } from 'react';
import { Icon } from '@iconify/react';

export default function AssetsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(null);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4">
          <h1 className="text-xl font-bold">CMMS</h1>
        </div>
        {/* Navigation items... */}
      </div>

      {/* Asset List */}
      <div className="w-80 bg-white shadow-md">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Assets</h2>
          
          {/* Search - Inconsistent styling */}
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search assets..."
              className="w-full h-12 pl-10 pr-4 rounded-xl border-2 border-gray-300 shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Icon 
              icon="tabler:search" 
              className="absolute left-3 top-4 w-5 h-5 text-gray-400"
            />
          </div>

          {/* Asset List - Inconsistent row styling */}
          <div className="space-y-2">
            {assets.map(asset => (
              <div
                key={asset.id}
                onClick={() => setSelectedAsset(asset)}
                className={`
                  p-4 rounded-lg cursor-pointer transition-all
                  ${selectedAsset?.id === asset.id 
                    ? 'bg-blue-100 border-2 border-blue-500' 
                    : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                  }
                `}
              >
                <h3 className="font-bold text-base">{asset.name}</h3>
                <p className="text-sm text-gray-600">{asset.licensePlate}</p>
                <div className="mt-2 flex gap-2">
                  <span className="bg-green-200 text-green-800 px-3 py-1 rounded-full text-xs">
                    {asset.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Asset Details */}
      <div className="flex-1 bg-white">
        {selectedAsset ? (
          <div className="p-8">
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4">{selectedAsset.name}</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-gray-500">License Plate</label>
                  <p className="text-base font-medium">{selectedAsset.licensePlate}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Make</label>
                  <p className="text-base font-medium">{selectedAsset.make}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Icon icon="tabler:package" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Select an asset to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

**Problems with the old version:**
- ❌ Inconsistent input heights (`h-12` instead of `h-9`)
- ❌ Rounded corners everywhere (`rounded-xl`, `rounded-2xl`)
- ❌ Shadows instead of borders (`shadow-lg`, `shadow-xl`)
- ❌ Inconsistent active states (blue instead of purple)
- ❌ Mixed spacing and padding
- ❌ Custom badge styling instead of standardized
- ❌ No reusable components

---

## ✅ AFTER - Enterprise Design System

```tsx
// src/pages/AssetsPage.tsx (NEW VERSION)
import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

// Enterprise components
import { MasterDetailLayout } from '@/components/layouts/MasterDetailLayout';
import { PageLayout, ContentContainer } from '@/components/layouts/PageLayout';
import { Input, Panel, PanelHeader, PanelContent, Badge, StatusBadge } from '@/components/ui/enterprise';
import ProfessionalSidebar from '@/components/layout/ProfessionalSidebar';
import ModernBreadcrumbs from '@/components/navigation/ModernBreadcrumbs';

export default function AssetsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [assets, setAssets] = useState([...]); // Your data

  const selectedAsset = assets.find(a => a.id === selectedAssetId);

  return (
    <MasterDetailLayout
      sidebar={<ProfessionalSidebar />}
      
      list={
        <div className="flex flex-col h-full">
          {/* Header with Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-900">Assets</h2>
              <span className="text-xs text-gray-500">{assets.length}</span>
            </div>
            
            {/* Standardized Search Input */}
            <Input
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={
                <Icon icon="tabler:search" className="w-3.5 h-3.5 text-gray-400" />
              }
            />
          </div>

          {/* Asset List */}
          <div className="flex-1 overflow-auto">
            {assets
              .filter(asset => 
                asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                asset.licensePlate.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map(asset => (
                <div
                  key={asset.id}
                  onClick={() => setSelectedAssetId(asset.id)}
                  className={cn(
                    'list-row',
                    selectedAssetId === asset.id && 'list-row-active'
                  )}
                >
                  {/* Row 1: Title and Status Dot */}
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={cn(
                      'text-sm font-semibold truncate pr-2',
                      selectedAssetId === asset.id ? 'text-purple-900' : 'text-gray-900'
                    )}>
                      {asset.name}
                    </h4>
                    <span 
                      className={cn(
                        'status-dot',
                        asset.status === 'Active' ? 'bg-emerald-500' : 'bg-gray-300'
                      )} 
                    />
                  </div>

                  {/* Row 2: License Plate */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <Icon icon="tabler:car" className="w-3.5 h-3.5 text-gray-400" />
                    <span>{asset.licensePlate}</span>
                  </div>

                  {/* Row 3: Make and Model */}
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">
                      {asset.make} {asset.model}
                    </span>
                    <StatusBadge status={asset.status} />
                  </div>
                </div>
              ))}
          </div>
        </div>
      }
      
      detail={
        selectedAsset ? (
          <PageLayout
            header={
              <ModernBreadcrumbs
                customBreadcrumbs={[
                  { label: 'Home', path: '/', icon: 'tabler:home' },
                  { label: 'Assets', path: '/assets', icon: 'tabler:package' },
                  { label: selectedAsset.name, path: `/assets/${selectedAsset.id}` },
                ]}
                actions={
                  <>
                    <button className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200">
                      Edit
                    </button>
                    <button className="px-3 py-1.5 text-sm bg-purple-600 text-white hover:bg-purple-700 rounded-md">
                      Create Work Order
                    </button>
                  </>
                }
              />
            }
            content={
              <ContentContainer>
                {/* Info Bar */}
                <div className="info-bar mb-3">
                  <div className="info-bar-item">
                    <Icon icon="tabler:car" className="w-3.5 h-3.5 text-purple-600" />
                    <span className="text-gray-500">License:</span>
                    <span className="font-medium text-gray-900">{selectedAsset.licensePlate}</span>
                  </div>
                  
                  <div className="info-bar-divider" />
                  
                  <div className="info-bar-item">
                    <Icon icon="tabler:building" className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-gray-500">Make:</span>
                    <span className="font-medium text-gray-900">{selectedAsset.make}</span>
                  </div>
                  
                  <div className="info-bar-divider" />
                  
                  <div className="info-bar-item">
                    <Icon icon="tabler:calendar" className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-gray-500">Year:</span>
                    <span className="font-medium text-gray-900">{selectedAsset.year}</span>
                  </div>
                </div>

                {/* Details Panel */}
                <Panel>
                  <PanelHeader>
                    <div className="flex items-center gap-2">
                      <Icon icon="tabler:info-circle" className="w-3.5 h-3.5 text-gray-500" />
                      <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
                        Asset Details
                      </h3>
                    </div>
                  </PanelHeader>
                  <PanelContent>
                    <div className="form-grid">
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">
                          Asset Name
                        </label>
                        <p className="text-sm text-gray-900">{selectedAsset.name}</p>
                      </div>
                      
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">
                          Status
                        </label>
                        <StatusBadge status={selectedAsset.status} />
                      </div>
                      
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">
                          VIN Number
                        </label>
                        <p className="text-sm text-gray-900">{selectedAsset.vin}</p>
                      </div>
                      
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">
                          Mileage
                        </label>
                        <p className="text-sm text-gray-900">{selectedAsset.mileage} km</p>
                      </div>
                    </div>
                  </PanelContent>
                </Panel>

                {/* Maintenance History Panel */}
                <Panel className="mt-4">
                  <PanelHeader>
                    <div className="flex items-center gap-2">
                      <Icon icon="tabler:history" className="w-3.5 h-3.5 text-gray-500" />
                      <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
                        Maintenance History
                      </h3>
                    </div>
                  </PanelHeader>
                  <PanelContent>
                    {/* Maintenance records... */}
                  </PanelContent>
                </Panel>
              </ContentContainer>
            }
          />
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

**Benefits of the new version:**
- ✅ Consistent input styling (`Input` component)
- ✅ Border-based design (no shadows)
- ✅ Standardized active states (purple)
- ✅ Reusable components (`Panel`, `Badge`, etc.)
- ✅ Consistent spacing and padding
- ✅ Utility classes for common patterns
- ✅ Matches Work Orders page exactly
- ✅ Easy to maintain and update

---

## Key Differences Summary

| Aspect | Old | New |
|--------|-----|-----|
| **Input Height** | `h-12` (48px) | `h-9` (36px) via `<Input />` |
| **Corners** | `rounded-xl`, `rounded-2xl` | `rounded-md`, `rounded-lg` |
| **Separation** | Shadows (`shadow-lg`) | Borders (`border-gray-200`) |
| **Active State** | Blue background | Purple background via `list-row-active` |
| **Badges** | Custom styling | `<StatusBadge />` component |
| **Layout** | Manual flex/grid | `<MasterDetailLayout />` |
| **Search** | Raw input | `<Input />` with icon |
| **Cards** | Custom divs | `<Panel />` component |
| **Empty State** | Custom styling | `empty-state` utility class |

---

## Migration Checklist

When migrating a page, follow this checklist:

- [ ] Replace layout structure with `MasterDetailLayout` or `TwoColumnLayout`
- [ ] Replace all `<input>` with `<Input />` component
- [ ] Replace card/panel divs with `<Panel />` component
- [ ] Replace custom badges with `<Badge />` or `<StatusBadge />`
- [ ] Use `list-row` and `list-row-active` for list items
- [ ] Use `info-bar` pattern for horizontal info strips
- [ ] Use `section-header` for section titles
- [ ] Use `empty-state` for empty states
- [ ] Remove all shadows (replace with borders)
- [ ] Standardize icon sizes (`w-3.5 h-3.5` for content, `w-4 h-4` for navigation)
- [ ] Standardize text sizes (`text-xs` for labels, `text-sm` for body)
- [ ] Use purple for active/selected states
- [ ] Test responsive behavior
- [ ] Verify accessibility (keyboard navigation, screen readers)

---

## Time Estimate

- **Simple page** (like Settings): 30-45 minutes
- **Medium page** (like Assets): 1-2 hours
- **Complex page** (like Work Orders): 2-3 hours (already done ✅)

---

**This example demonstrates the complete transformation from inconsistent styling to the enterprise design system.**
