# Enterprise Design Migration Plan

## Overview
Systematically apply the enterprise design from Work Order Details page across the entire GOGO CMMS application.

## Phase 1: Core Components (Priority: HIGH) - 2-3 hours

### 1.1 Global Navigation (Already Complete ✅)
- [x] Main sidebar - edge-pinned, no scrollbar
- [x] Navigation items - rectangular, consistent sizing
- [x] Search bar - compact, uniform styling
- [x] Remove Design System from nav

### 1.2 Breadcrumb Component (Already Complete ✅)
- [x] Simplified back button
- [x] Consistent spacing
- [x] Proper text sizing

### 1.3 Reusable Card Components
**Files to update:**
- `src/components/ui/Card.tsx` (if exists)
- Create `src/components/ui/EnterpriseCard.tsx`

**Changes:**
- Remove shadow-based cards
- Use border-based separation
- Standard padding: `p-3` or `p-4`
- Border: `border border-gray-200`

### 1.4 Section Headers Component
**Create:** `src/components/ui/SectionHeader.tsx`

```tsx
interface SectionHeaderProps {
  icon?: string;
  title: string;
  count?: number;
  actions?: React.ReactNode;
}

// Standard header for all sections
<div className="px-3 py-2 border-b border-gray-200">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-1.5">
      {icon && <Icon icon={icon} className="w-3 h-3 text-gray-500" />}
      <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
        {title}
      </h3>
      {count && (
        <span className="bg-gray-200 text-gray-600 text-[10px] px-1.5 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </div>
    {actions}
  </div>
</div>
```

## Phase 2: List Pages (Priority: HIGH) - 3-4 hours

### 2.1 Work Orders Page
**File:** `src/pages/WorkOrders.tsx`

**Changes:**
- [ ] Update page header/breadcrumb
- [ ] Apply enterprise table styling
- [ ] Standardize filter pills
- [ ] Update search bar styling
- [ ] Consistent button styling

### 2.2 Assets Page
**File:** `src/pages/Assets.tsx`

**Changes:**
- [ ] Match Work Orders page layout
- [ ] Update asset list items
- [ ] Standardize filters
- [ ] Apply consistent spacing

### 2.3 Customers Page
**File:** `src/pages/Customers.tsx`

**Changes:**
- [ ] Update customer list styling
- [ ] Standardize card layouts
- [ ] Apply border-based design

### 2.4 Technicians Page
**File:** `src/pages/Technicians.tsx`

**Changes:**
- [ ] Update technician cards
- [ ] Standardize list items
- [ ] Apply consistent spacing

## Phase 3: Detail Pages (Priority: MEDIUM) - 4-5 hours

### 3.1 Asset Details
**File:** `src/pages/AssetDetails.tsx`

**Changes:**
- [ ] Copy Work Order Details structure
- [ ] Add section headers
- [ ] Standardize info bar
- [ ] Update tabs styling
- [ ] Apply consistent spacing

### 3.2 Customer Details
**File:** `src/pages/CustomerDetails.tsx`

**Changes:**
- [ ] Match Asset Details layout
- [ ] Add section headers
- [ ] Standardize forms
- [ ] Update card styling

### 3.3 Technician Details (if exists)
**Changes:**
- [ ] Apply same patterns as above

## Phase 4: Dashboard (Priority: MEDIUM) - 2-3 hours

### 4.1 Main Dashboard
**File:** `src/pages/ProfessionalCMMSDashboard.tsx`

**Changes:**
- [ ] Update stat cards - remove shadows, use borders
- [ ] Standardize chart containers
- [ ] Update urgent work orders table
- [ ] Apply consistent spacing
- [ ] Flatten card designs

**Before:**
```tsx
<div className="bg-white rounded-xl shadow-lg p-6">
```

**After:**
```tsx
<div className="bg-white border border-gray-200 p-4">
```

## Phase 5: Forms & Dialogs (Priority: MEDIUM) - 3-4 hours

### 5.1 Work Order Form
**File:** `src/components/work-orders/CreateWorkOrderForm.tsx`

**Changes:**
- [ ] Standardize input heights (h-9)
- [ ] Consistent text sizes
- [ ] Update button styling
- [ ] Apply proper spacing

### 5.2 Asset Form
**Changes:**
- [ ] Match Work Order Form styling
- [ ] Standardize all inputs

### 5.3 Dialogs/Modals
**Files:** All dialog components

**Changes:**
- [ ] Consistent header styling
- [ ] Standard padding
- [ ] Border-based separation
- [ ] Uniform button styling

## Phase 6: Settings & Reports (Priority: LOW) - 2-3 hours

### 6.1 Settings Page
**File:** `src/pages/Settings.tsx`

**Changes:**
- [ ] Update settings sections
- [ ] Standardize form inputs
- [ ] Apply border-based cards

### 6.2 Reports Page
**File:** `src/pages/Reports.tsx`

**Changes:**
- [ ] Update report cards
- [ ] Standardize filters
- [ ] Apply consistent layout

## Phase 7: Inventory & Scheduling (Priority: LOW) - 2-3 hours

### 7.1 Inventory Page
**Changes:**
- [ ] Apply list page patterns
- [ ] Standardize item cards

### 7.2 Scheduling Page
**Changes:**
- [ ] Update calendar styling
- [ ] Standardize event cards

## Implementation Strategy

### Step-by-Step Process

1. **Start with one page at a time**
   - Pick a page (e.g., Assets)
   - Apply all design patterns
   - Test thoroughly
   - Move to next page

2. **Create reusable components first**
   - `EnterpriseCard.tsx`
   - `SectionHeader.tsx`
   - `EnterpriseSearchInput.tsx`
   - `EnterpriseListItem.tsx`

3. **Use find & replace for common patterns**
   ```
   Find: rounded-xl shadow-lg
   Replace: border border-gray-200
   
   Find: text-base
   Replace: text-sm
   
   Find: p-6
   Replace: p-4
   ```

4. **Test after each page**
   - Visual consistency check
   - Responsive behavior
   - Interaction states

### Quality Checklist (Per Page)

- [ ] All text uses standard sizes (text-xs, text-sm)
- [ ] All icons use standard sizes (w-3.5 h-3.5, w-4 h-4)
- [ ] No floating cards with shadows
- [ ] Border-based separation throughout
- [ ] Consistent spacing (gap-3, gap-4, gap-5)
- [ ] Purple-50 for selected/active states
- [ ] Section headers where appropriate
- [ ] Proper density (not too much air)
- [ ] Search inputs match standard (h-9, text-xs)
- [ ] Buttons consistent with design system

## Estimated Timeline

- **Phase 1**: Already complete ✅
- **Phase 2**: 3-4 hours (List pages)
- **Phase 3**: 4-5 hours (Detail pages)
- **Phase 4**: 2-3 hours (Dashboard)
- **Phase 5**: 3-4 hours (Forms)
- **Phase 6**: 2-3 hours (Settings/Reports)
- **Phase 7**: 2-3 hours (Inventory/Scheduling)

**Total: 16-22 hours** (2-3 days of focused work)

## Quick Wins (Do These First)

1. **Global CSS updates** - Update base styles
2. **Create reusable components** - Build once, use everywhere
3. **Dashboard** - High visibility, big impact
4. **List pages** - Users see these most often

## Testing Strategy

1. **Visual regression** - Compare before/after screenshots
2. **Responsive testing** - Check mobile, tablet, desktop
3. **Interaction testing** - Hover states, active states
4. **Cross-browser** - Chrome, Firefox, Safari, Edge

## Rollout Strategy

### Option A: Big Bang (Not Recommended)
- Update everything at once
- High risk of bugs
- Difficult to track issues

### Option B: Incremental (Recommended)
- One page/section at a time
- Deploy after each completion
- Easy to identify and fix issues
- Users see gradual improvement

### Option C: Feature Flag
- Implement new design behind flag
- Test with subset of users
- Roll out gradually
- Easy rollback if needed

## Recommended Approach

**Week 1:**
- Day 1-2: Create reusable components
- Day 3: Dashboard update
- Day 4-5: List pages (Work Orders, Assets)

**Week 2:**
- Day 1-2: Detail pages (Asset, Customer)
- Day 3: Forms and dialogs
- Day 4-5: Settings, Reports, remaining pages

## Success Metrics

- [ ] Visual consistency across all pages
- [ ] Reduced CSS bundle size (fewer shadows, simpler styles)
- [ ] Improved perceived performance (less visual noise)
- [ ] Positive user feedback
- [ ] Easier maintenance (consistent patterns)

## Need Help?

Reference these files:
- `ENTERPRISE_DESIGN_SYSTEM.md` - Design patterns
- `src/pages/WorkOrderDetailsEnhanced.tsx` - Reference implementation
- `src/components/layout/ProfessionalSidebar.tsx` - Navigation reference
- `src/components/work-order-details/` - Component examples
