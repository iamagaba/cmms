# Reports Page Migration Plan

## Status: Ready for Migration

The Reports page is ready to be migrated from custom Tailwind components to shadcn/ui Design System V2.

**Date**: January 19, 2026
**Estimated Time**: 45-60 minutes
**Complexity**: Medium-High (large file with multiple sub-components)

---

## File Analysis

### Current State
- **File**: `src/pages/Reports.tsx`
- **Lines**: 1,608 lines
- **Components**: 6 report sub-components + main component
- **Charts**: Recharts library (keep as-is)
- **Custom Components**: Tailwind utility classes

### Sub-Components
1. **OverviewReport** - Metrics cards, pie charts, timeline
2. **TechnicianPerformanceReport** - Performance table, bar chart
3. **WorkOrderAnalysisReport** - Service type analysis, pie charts
4. **AssetReport** - Vehicle stats table, bar chart
5. **FinancialReport** - Revenue cards, cost breakdown charts
6. **FleetOverviewReport** - Fleet metrics, status distribution
7. **InventoryReport** - Already a separate component (no changes needed)

---

## Components to Replace

### 1. **Metric Cards** (Used in all reports)
**Current**:
```tsx
<div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-3">
  <div className="flex items-center justify-between mb-1">
    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Label</span>
    <div className="p-1 bg-primary-50 dark:bg-primary-900/30 rounded">
      <Icon />
    </div>
  </div>
  <div className="text-xl font-bold text-gray-900 dark:text-gray-100">Value</div>
  <div className="text-[10px] text-gray-400 dark:text-gray-500">Description</div>
</div>
```

**Replace with**:
```tsx
<Card>
  <CardContent className="pt-3 pb-3">
    <div className="flex items-center justify-between mb-1">
      <span className="text-xs font-medium text-muted-foreground">Label</span>
      <div className="p-1 bg-primary/10 rounded">
        <Icon className="text-primary" />
      </div>
    </div>
    <div className="text-xl font-bold">Value</div>
    <div className="text-[10px] text-muted-foreground">Description</div>
  </CardContent>
</Card>
```

### 2. **Chart Cards** (Used in all reports)
**Current**:
```tsx
<div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-3">
  <h3 clas