# Component Migration Execution Plan

## Status: IN PROGRESS

This document tracks the migration from custom Professional components to shadcn/ui components.

---

## Phase 1: Delete Custom Component Files ✅

### Files to Delete:
1. ✅ src/components/ui/ProfessionalButton.tsx
2. ✅ src/components/ui/ProfessionalCard.tsx
3. ✅ src/components/ui/ProfessionalInput.tsx
4. ✅ src/components/ui/ProfessionalBadge.tsx
5. ✅ src/components/ui/ProfessionalMetricCard.tsx
6. ✅ src/components/ui/ResponsiveProfessionalButton.tsx
7. ✅ src/components/ui/enterprise/Panel.tsx
8. ✅ src/components/ui/enterprise/Input.tsx
9. ✅ src/components/ui/enterprise/Badge.tsx
10. ✅ src/components/ui/enterprise/index.ts (entire folder)

---

## Phase 2: Update Import Statements

### Files Using ProfessionalButton (19 files):
- src/pages/Login.tsx
- src/pages/ImprovedDashboard.tsx
- src/components/advanced/ProfessionalModal.tsx
- src/components/advanced/ProfessionalForm.tsx
- src/components/advanced/ProfessionalDataTable.tsx
- src/components/advanced/AdvancedThemeControls.tsx
- src/components/dashboard/ActivityFeed.tsx
- src/components/dashboard/DashboardSection.tsx
- src/components/dashboard/ProfessionalDashboard.tsx
- src/components/navigation/ResponsiveNavigation.tsx
- src/components/layout/ProfessionalPageLayout.tsx
- src/components/layout/ProfessionalNavigation.tsx
- src/components/tables/ProfessionalWorkOrderTable.tsx
- src/components/tables/ModernWorkOrderDataTable.tsx
- src/components/ui/EnhancedDataTable.tsx
- src/components/ui/ProfessionalEnhancedDataTable.tsx
- src/components/ui/ProfessionalDataTable.tsx
- src/components/ui/ThemeControls.tsx
- src/components/ui/__tests__/phase2-integration.test.tsx

### Files Using ProfessionalCard:
- Multiple dashboard and layout components

### Files Using ProfessionalInput:
- Form components across the app

### Files Using ProfessionalBadge:
- Data tables and status displays

### Files Using enterprise components:
- Legacy design system demo

---

## Phase 3: Component Replacement Mappings

### ProfessionalButton → Button
```tsx
// OLD
import ProfessionalButton from '@/components/ui/ProfessionalButton';
<ProfessionalButton variant="primary" size="base" icon={SaveIcon}>
  Save
</ProfessionalButton>

// NEW
import { Button } from '@/components/ui/button';
<Button variant="default" size="default">
  <HugeiconsIcon icon={SaveIcon} size={16} />
  Save
</Button>
```

**Variant Mapping:**
- `primary` → `default`
- `secondary` → `secondary`
- `outline` → `outline`
- `ghost` → `ghost`
- `danger` → `destructive`
- `success` → Custom (add to button.tsx)

**Size Mapping:**
- `sm` → `sm`
- `base` → `default`
- `lg` → `lg`

### ProfessionalCard → Card
```tsx
// OLD
import ProfessionalCard from '@/components/ui/ProfessionalCard';
<ProfessionalCard title="Title" subtitle="Subtitle">
  Content
</ProfessionalCard>

// NEW
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Subtitle</CardDescription>
  </CardHeader>
  <CardContent>
    Content
  </CardContent>
</Card>
```

### ProfessionalInput → Input
```tsx
// OLD
import ProfessionalInput from '@/components/ui/ProfessionalInput';
<ProfessionalInput leftIcon={<SearchIcon />} placeholder="Search..." />

// NEW
import { Input } from '@/components/ui/input';
<div className="relative">
  <HugeiconsIcon icon={SearchIcon} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
  <Input placeholder="Search..." className="pl-10" />
</div>
```

### ProfessionalBadge → Badge
```tsx
// OLD
import { WorkOrderStatusBadge, PriorityBadge } from '@/components/ui/ProfessionalBadge';
<WorkOrderStatusBadge status="in-progress" />
<PriorityBadge priority="high" />

// NEW
import { Badge } from '@/components/ui/badge';
<Badge variant="status-in-progress">In Progress</Badge>
<Badge variant="priority-high">High</Badge>
```

### enterprise/Panel → Card
```tsx
// OLD
import { Panel, PanelHeader, PanelContent } from '@/components/ui/enterprise';
<Panel>
  <PanelHeader>Header</PanelHeader>
  <PanelContent>Content</PanelContent>
</Panel>

// NEW
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
<Card>
  <CardHeader>
    <CardTitle>Header</CardTitle>
  </CardHeader>
  <CardContent>
    Content
  </CardContent>
</Card>
```

---

## Phase 4: Special Cases

### ResponsiveProfessionalButton
Replace with shadcn Button + Tailwind responsive classes:
```tsx
// OLD
<ResponsiveProfessionalButton size={{ base: 'sm', md: 'base', lg: 'lg' }}>
  Save
</ResponsiveProfessionalButton>

// NEW
<Button className="h-8 md:h-10 lg:h-11 px-3 md:px-4 lg:px-6">
  Save
</Button>
```

### ProfessionalMetricCard
Replace with Card + custom content:
```tsx
// OLD
<ProfessionalMetricCard 
  value="1,234"
  label="Total Orders"
  change={{ value: "+12%", type: "increase" }}
/>

// NEW
<Card>
  <CardContent className="pt-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-gray-500">Total Orders</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">1,234</p>
        <p className="text-xs text-emerald-600 mt-1">+12%</p>
      </div>
    </div>
  </CardContent>
</Card>
```

---

## Phase 5: Update shadcn Button with Success Variant

Add success variant to button.tsx:
```tsx
success: "bg-emerald-600 text-white hover:bg-emerald-700"
```

---

## Execution Order

1. ✅ Add success variant to shadcn Button
2. ✅ Delete all custom component files
3. ⏳ Update all import statements (automated find/replace)
4. ⏳ Fix component usage (manual review needed)
5. ⏳ Test each page
6. ⏳ Remove unused dependencies (Framer Motion if not used elsewhere)

---

## Risk Mitigation

- Create git branch before starting
- Test after each major change
- Keep backup of deleted files
- Update tests as needed

---

## Estimated Timeline

- Phase 1: 1 hour (delete files)
- Phase 2-4: 2-3 days (update all usages)
- Phase 5: 1 day (testing and fixes)

**Total: 3-4 days**
