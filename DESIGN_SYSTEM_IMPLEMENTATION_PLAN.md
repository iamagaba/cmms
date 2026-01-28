# Design System Implementation Plan

**Goal**: Achieve 100% shadcn/ui compliance and visual consistency across all pages by eliminating one-off styling decisions and fully adopting semantic tokens.

**Timeline**: 3 phases over 2-3 weeks (can be parallelized across team members)

---

## Priority Matrix

### P0 - Critical (Breaks Consistency) 🔴
**Impact**: High | **Effort**: Low-Medium | **Timeline**: Days 1-3

These issues create visual inconsistency and should be fixed immediately in all new work:

1. **Bespoke color usage** - `bg-white`, `text-gray-600`, `bg-emerald-50` instead of semantic tokens
2. **Icon sizing chaos** - Mix of `size={16}`, `size={18}`, and no standardization
3. **Custom card shells** - Ad-hoc `bg-muted/50 + border` instead of `Card` components
4. **Duplicate/broken layout code** - AppLayout mobile spacers, inconsistent padding

### P1 - High (User-Facing Polish) 🟡
**Impact**: High | **Effort**: Medium | **Timeline**: Days 4-7

Visible inconsistencies that users notice across pages:

1. **Page header variations** - Different title sizes, action button layouts, metadata formatting
2. **List/detail pattern drift** - Master-detail views have different row styles, selection states
3. **Status badge proliferation** - Custom pill implementations instead of `Badge` variants
4. **Empty state variations** - Multiple patterns for "no data" states

### P2 - Medium (Internal Consistency) 🟢
**Impact**: Medium | **Effort**: Low-Medium | **Timeline**: Days 8-12

Improves navigation and orientation but less visible:

1. **Missing breadcrumbs** - Detail pages lack consistent navigation context
2. **Sidebar/nav token usage** - Still using hardcoded colors instead of semantic tokens
3. **Card spacing inconsistency** - Mix of `space-y-4`, `space-y-6`, `gap-4` without pattern
4. **Loading state variations** - Different spinner/skeleton implementations

### P3 - Low (Nice-to-Have) 🔵
**Impact**: Low | **Effort**: Low | **Timeline**: Days 13-15

Polish and refinement:

1. **Chart card shells** - Wrap charts in consistent `Card` components
2. **Stat ribbon refinement** - Standardize internal layout and click treatment
3. **Mobile nav token migration** - Replace hardcoded `bg-white` with `bg-card`
4. **Documentation updates** - Update design system docs with new patterns

---

## Phase 1: Foundation & Quick Wins (Days 1-3) ✅ COMPLETE

**Goal**: Fix critical issues and establish patterns for all new work

**Status**: ✅ Complete (manual follow-up required for ~15 files)  
**Completion Date**: January 27, 2026  
**Summary**: See [PHASE_1_IMPLEMENTATION_COMPLETE.md](./PHASE_1_IMPLEMENTATION_COMPLETE.md)

### Day 1: Global Tokens & Primitives ✅

**Files**: `App.css`, `tailwind.config.js`, `src/styles/industrial-theme.css`, `eslint.config.js`, `CONTRIBUTING.md`

**Tasks**:
- [x] Audit `App.css` semantic tokens - ensure complete coverage
- [x] Remove/deprecate legacy `industrial-theme.css` overrides
- [x] Add ESLint rule to ban hardcoded colors in new PRs
- [x] Document "forbidden patterns" in `CONTRIBUTING.md`

**Deliverable**: ✅ Single source of truth for tokens, linting enforcement

---

### Day 2: Icon Standardization ✅

**Files**: 91 component files automatically migrated, ~15 need manual fixes

**Tasks**:
- [x] Create icon sizing reference component (`src/components/ui/icon-reference.tsx`)
- [x] Run codemod to replace HugeiconsIcon with Lucide React
- [x] Automated migration of 91 files
- [x] Create manual fix guide for dynamic icons
- [x] Update icon sizing to Tailwind classes

**Deliverable**: ✅ 100% consistent icon sizing framework (manual fixes pending)

**Estimated Files**: 91 files auto-migrated, ~15 files need manual review

**Next Steps**:
1. Install lucide-react: `npm install lucide-react`
2. Uninstall hugeicons: `npm uninstall @hugeicons/react @hugeicons/core-free-icons`
3. Fix dynamic icon usage (see `PHASE_1_ICON_MIGRATION_MANUAL_FIXES.md`)
4. Test application

---

### Day 3: Layout Shell Fixes ✅

**Files**: `src/components/layout/AppLayout.tsx`

**Tasks**:
- [x] **AppLayout.tsx**: Remove duplicate mobile spacers
- [x] Codify canonical page padding pattern
- [x] Document padding strategy in component comments
- [x] Clarify full-bleed page logic

**Deliverable**: ✅ Clean, predictable layout shell with no visual bugs

---

## Phase 2: High-Impact Visual Consistency (Days 4-7)

**Goal**: Eliminate user-facing inconsistencies across major pages

### Day 4: Page Header Standardization

**Files**: All page components (`*Page.tsx`, `*Details.tsx`)

**Tasks**:
- [ ] Create `PageHeader` component:
  ```tsx
  // src/components/layout/PageHeader.tsx
  interface PageHeaderProps {
    title: string;
    subtitle?: string;
    breadcrumbs?: React.ReactNode;
    actions?: React.ReactNode;
    icon?: React.ReactNode;
  }
  
  export function PageHeader({ title, subtitle, breadcrumbs, actions, icon }: PageHeaderProps) {
    return (
      <div className="space-y-1">
        {breadcrumbs}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                {icon}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold">{title}</h1>
              {subtitle && (
                <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex items-center gap-1.5">
              {actions}
            </div>
          )}
        </div>
      </div>
    );
  }
  ```

- [ ] Migrate pages to use `PageHeader`:
  - [ ] `ProfessionalCMMSDashboard.tsx`
  - [ ] `WorkOrdersPage.tsx`
  - [ ] `AssetsPage.tsx`
  - [ ] `CustomersPage.tsx`
  - [ ] `InventoryPage.tsx`
  - [ ] `ReportsPage.tsx`
  - [ ] `SettingsPage.tsx`

**Deliverable**: Consistent page headers across all major pages

**Estimated Files**: ~15 pages

---

### Day 5: Card Shell Standardization

**Files**: All components with custom card-like containers

**Tasks**:
- [ ] Audit all instances of:
  - `bg-muted/50 + border` combinations
  - `bg-white + shadow` combinations
  - Custom `rounded-lg + p-4` wrappers

- [ ] Replace with shadcn `Card` components:
  ```tsx
  // ❌ Before
  <div className="bg-muted/50 border border-border rounded-lg p-4">
    <h3 className="font-semibold mb-2">Title</h3>
    <p>Content</p>
  </div>
  
  // ✅ After
  <Card>
    <CardHeader>
      <CardTitle>Title</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm">Content</p>
    </CardContent>
  </Card>
  ```

- [ ] Priority files:
  - [ ] `ProfessionalCMMSDashboard.tsx` (StatRibbon, charts)
  - [ ] `AssetDetails.tsx` (info panels)
  - [ ] `CustomerDetails.tsx` (info sections)
  - [ ] `WorkOrderDetailsEnhanced.tsx` (detail sections)
  - [ ] `InventoryPage.tsx` (stock cards)

**Deliverable**: Consistent card shells using shadcn primitives

**Estimated Files**: ~40 components

---

### Day 6: Badge & Status Consolidation

**Files**: All components with status/priority indicators

**Tasks**:
- [ ] Audit custom badge implementations:
  ```bash
  # Find custom pill patterns
  rg "bg-amber-50|bg-emerald-50|bg-red-50" src/ --type tsx
  ```

- [ ] Route all status indicators through `Badge` variants:
  ```tsx
  // ❌ Before
  <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded text-xs">
    In Progress
  </span>
  
  // ✅ After
  <Badge variant="warning">In Progress</Badge>
  ```

- [ ] Ensure `StatusBadge` and `PriorityBadge` cover all use cases:
  - [ ] Work order statuses (open, in_progress, completed, on_hold)
  - [ ] Asset statuses (available, in_use, maintenance, retired)
  - [ ] Priority levels (low, medium, high, critical)
  - [ ] Inventory statuses (in_stock, low_stock, out_of_stock)

- [ ] Priority files:
  - [ ] `WorkOrderDataTable.tsx`
  - [ ] `AssetDataTable.tsx`
  - [ ] `WorkOrderDetailsEnhanced.tsx`
  - [ ] `AssetDetails.tsx`
  - [ ] `CustomerDetails.tsx`

**Deliverable**: Single badge system for all status indicators

**Estimated Files**: ~30 components

---

### Day 7: List/Detail Pattern Unification

**Files**: Master-detail view pages

**Tasks**:
- [ ] Create `MasterListShell` component:
  ```tsx
  // src/components/layout/MasterListShell.tsx
  interface MasterListShellProps {
    title: string;
    searchPlaceholder: string;
    searchValue: string;
    onSearchChange: (value: string) => void;
    filterButton?: React.ReactNode;
    primaryAction?: React.ReactNode;
    children: React.ReactNode;
  }
  ```

- [ ] Create `MasterListRow` component:
  ```tsx
  // src/components/layout/MasterListRow.tsx
  interface MasterListRowProps {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    metadata?: React.ReactNode;
    isSelected?: boolean;
    onClick: () => void;
  }
  
  // Standard styling:
  // - Left border-l-2 border-l-primary when selected
  // - bg-muted when selected
  // - hover:bg-muted/50 when not selected
  // - Icon tile: w-8 h-8 bg-muted rounded-lg
  ```

- [ ] Migrate master-detail pages:
  - [ ] `WorkOrdersPage.tsx`
  - [ ] `AssetsPage.tsx`
  - [ ] `CustomersPage.tsx`
  - [ ] `InventoryPage.tsx`

**Deliverable**: Consistent list/detail pattern across all pages

**Estimated Files**: 4 major pages + shared components

---

## Phase 3: Polish & Refinement (Days 8-12)

**Goal**: Complete the consistency pass and add navigation improvements

### Day 8: Breadcrumb Integration

**Files**: Detail pages

**Tasks**:
- [ ] Add `SimpleBreadcrumbs` to all detail views:
  - [ ] `AssetDetails.tsx` - "Assets → [plate]"
  - [ ] `CustomerDetails.tsx` - "Customers → [name]"
  - [ ] `WorkOrderDetailsEnhanced.tsx` - "Work Orders → [WO-123]"
  - [ ] `InventoryItemDetails.tsx` - "Inventory → [item]"

- [ ] Placement: Directly above page title in `PageHeader`

- [ ] Ensure consistent styling:
  ```tsx
  <SimpleBreadcrumbs
    items={[
      { label: 'Assets', href: '/assets' },
      { label: asset.license_plate }
    ]}
  />
  ```

**Deliverable**: Consistent breadcrumb navigation in all detail views

**Estimated Files**: ~8 detail pages

---

### Day 9: Empty State Standardization

**Files**: All components with "no data" states

**Tasks**:
- [ ] Create `EmptyState` component:
  ```tsx
  // src/components/ui/empty-state.tsx
  interface EmptyStateProps {
    icon: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
  }
  
  export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          {icon}
        </div>
        <h3 className="text-sm font-medium mb-1">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground mb-4 max-w-sm">
            {description}
          </p>
        )}
        {action}
      </div>
    );
  }
  ```

- [ ] Replace all empty state variations:
  - [ ] "No assets selected"
  - [ ] "No work orders for this asset"
  - [ ] "No customer selected"
  - [ ] "No inventory items"
  - [ ] "No search results"
  - [ ] "No data available"

**Deliverable**: Single empty state pattern across app

**Estimated Files**: ~25 components

---

### Day 10: Navigation Token Migration

**Files**: `MobileBottomNav.tsx`, `ResponsiveNavigation.tsx`

**Tasks**:
- [ ] **MobileBottomNav.tsx**:
  - [ ] Replace `bg-white border-machinery-200` with `bg-card border-border`
  - [ ] Ensure icons use `w-5 h-5`
  - [ ] Labels: `text-xs font-medium text-muted-foreground`
  - [ ] Active state: `text-primary`

- [ ] **ResponsiveNavigation.tsx**:
  - [ ] Audit all color usage
  - [ ] Replace hardcoded colors with semantic tokens
  - [ ] Ensure consistent active/hover states

**Deliverable**: Navigation fully using semantic tokens

---

### Day 11: Dashboard Polish

**Files**: `ProfessionalCMMSDashboard.tsx` and child components

**Tasks**:
- [ ] **StatRibbon**:
  - [ ] Standardize internal layout:
    ```tsx
    // Label
    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
    
    // Value
    <p className="text-2xl font-bold">
    
    // Subtitle
    <p className="text-xs text-muted-foreground">
    ```
  - [ ] Make entire card clickable (not just text link)
  - [ ] Use color accents sparingly (only for status-like stats)

- [ ] **WorkOrderTrendsChart**:
  - [ ] Wrap in `Card` with `CardHeader` (title + 7/14 day controls)
  - [ ] Ensure chart uses semantic colors from theme

- [ ] **PriorityWorkOrders & TechniciansList**:
  - [ ] Wrap each in `Card` component
  - [ ] Use consistent `space-y-6` between cards

- [ ] **Loading state**:
  - [ ] Replace custom spinner with card-based skeleton
  - [ ] Match `WorkOrdersPage` skeleton style

**Deliverable**: Dashboard fully compliant with design system

---

### Day 12: Spacing Consistency Audit

**Files**: All pages and major components

**Tasks**:
- [ ] Document canonical spacing patterns:
  ```tsx
  // Between cards/sections
  space-y-6 (24px)
  
  // Between form fields
  space-y-4 (16px)
  
  // Between related items
  gap-4 (16px)
  
  // Tight grouping (button groups, inline elements)
  gap-1.5 (6px)
  
  // Card internal padding
  p-6 (24px) - major sections
  p-4 (16px) - compact stats
  ```

- [ ] Run audit script:
  ```bash
  # Find inconsistent spacing
  rg "space-y-[^46]|gap-[^14]" src/ --type tsx
  ```

- [ ] Normalize spacing in priority pages:
  - [ ] Dashboard
  - [ ] Work Orders
  - [ ] Assets
  - [ ] Customers
  - [ ] Inventory

**Deliverable**: Consistent spacing rhythm across app

---

## Phase 4: Documentation & Enforcement (Days 13-15)

**Goal**: Prevent regression and enable team adoption

### Day 13: Design System Documentation

**Files**: `src/docs/design-system/`

**Tasks**:
- [ ] Update `COMPLIANCE.md` with new patterns:
  - [ ] `PageHeader` usage
  - [ ] `MasterListShell` / `MasterListRow` patterns
  - [ ] `EmptyState` component
  - [ ] Icon sizing reference
  - [ ] Spacing scale

- [ ] Create visual reference page:
  ```tsx
  // src/pages/DesignSystemReference.tsx
  // Show all components with correct usage
  ```

- [ ] Add "before/after" examples for common mistakes

- [ ] Document forbidden patterns:
  - [ ] Hardcoded colors
  - [ ] Custom card shells
  - [ ] Inconsistent icon sizing
  - [ ] Ad-hoc badge implementations

**Deliverable**: Complete design system documentation

---

### Day 14: PR Review Checklist

**Files**: `.github/PULL_REQUEST_TEMPLATE.md`, `CONTRIBUTING.md`

**Tasks**:
- [ ] Create design system compliance checklist:
  ```markdown
  ## Design System Compliance
  
  - [ ] Uses semantic tokens (no `bg-white`, `text-gray-600`)
  - [ ] Icons use Tailwind classes (`w-4 h-4`, `w-5 h-5`, `w-6 h-6`)
  - [ ] Cards use shadcn `Card` component (not custom shells)
  - [ ] Status indicators use `Badge` variants
  - [ ] Page headers use `PageHeader` component
  - [ ] Empty states use `EmptyState` component
  - [ ] Spacing follows canonical patterns (`space-y-6`, `gap-4`)
  - [ ] No ESLint warnings for restricted patterns
  ```

- [ ] Add automated checks:
  ```yaml
  # .github/workflows/design-system-check.yml
  - name: Check design system compliance
    run: |
      npm run lint
      npm run check-design-system
  ```

- [ ] Create `check-design-system` script:
  ```js
  // scripts/check-design-system.js
  // Scan for forbidden patterns and report violations
  ```

**Deliverable**: Automated compliance checking

---

### Day 15: Team Training & Rollout

**Tasks**:
- [ ] Record walkthrough video showing:
  - [ ] New component patterns
  - [ ] How to use `PageHeader`, `EmptyState`, etc.
  - [ ] Common mistakes and how to fix them

- [ ] Host team review session:
  - [ ] Demo before/after comparisons
  - [ ] Walk through design system docs
  - [ ] Answer questions

- [ ] Create quick reference card:
  ```markdown
  # Design System Quick Reference
  
  ## Colors
  ✅ bg-card, bg-muted, text-muted-foreground
  ❌ bg-white, text-gray-600, bg-emerald-50
  
  ## Icons
  ✅ className="w-4 h-4" (16px)
  ✅ className="w-5 h-5" (20px)
  ✅ className="w-6 h-6" (24px)
  ❌ size={16}
  
  ## Cards
  ✅ <Card><CardHeader><CardTitle>
  ❌ <div className="bg-muted/50 border...">
  
  ## Badges
  ✅ <Badge variant="warning">
  ❌ <span className="bg-amber-50...">
  ```

**Deliverable**: Team trained and ready to maintain standards

---

## Success Metrics

### Quantitative
- [ ] **0 ESLint violations** for restricted patterns
- [ ] **100% of pages** use `PageHeader` component
- [ ] **100% of cards** use shadcn `Card` component
- [ ] **100% of status indicators** use `Badge` variants
- [ ] **100% of icons** use Tailwind sizing classes
- [ ] **0 hardcoded colors** in new PRs (enforced by linting)

### Qualitative
- [ ] **Visual consistency** - All pages feel like they come from the same kit
- [ ] **Developer velocity** - New features use design system by default
- [ ] **Maintainability** - Easy to update theme/tokens globally
- [ ] **Accessibility** - Consistent focus states, color contrast, keyboard nav

---

## Risk Mitigation

### Risk: Breaking existing functionality
**Mitigation**: 
- Test each page after migration
- Use feature flags for major changes
- Deploy incrementally (one page at a time)

### Risk: Team resistance to new patterns
**Mitigation**:
- Show clear before/after improvements
- Make patterns easy to use (good DX)
- Provide excellent documentation
- Lead by example in code reviews

### Risk: Regression after implementation
**Mitigation**:
- Automated linting rules
- PR checklist enforcement
- Regular design system audits
- Team training and documentation

---

## Rollout Strategy

### Week 1 (Phase 1)
- **Day 1-3**: Foundation work (tokens, icons, layout)
- **Impact**: Immediate improvement in new work
- **Team**: 1 developer

### Week 2 (Phase 2)
- **Day 4-7**: High-impact visual consistency
- **Impact**: Users notice improved polish
- **Team**: 2-3 developers (can parallelize)

### Week 3 (Phase 3-4)
- **Day 8-12**: Polish and refinement
- **Day 13-15**: Documentation and enforcement
- **Impact**: Long-term maintainability
- **Team**: 1-2 developers + design review

---

## Next Steps

1. **Review and approve** this plan with team leads
2. **Assign owners** for each phase
3. **Create tracking board** (Jira/Linear/GitHub Projects)
4. **Kick off Phase 1** - Foundation & Quick Wins
5. **Daily standups** to track progress and blockers
6. **Weekly demos** to show progress to stakeholders

---

## Appendix: File Impact Summary

### High-Touch Files (>10 changes)
- `ProfessionalCMMSDashboard.tsx` - Dashboard overhaul
- `WorkOrdersPage.tsx` - List/detail pattern
- `AssetsPage.tsx` - List/detail pattern
- `CustomersPage.tsx` - List/detail pattern
- `InventoryPage.tsx` - List/detail pattern
- `AppLayout.tsx` - Layout fixes
- `ProfessionalSidebar.tsx` - Icon sizing, tokens

### Medium-Touch Files (5-10 changes)
- All detail pages (`*Details.tsx`)
- All data tables (`*DataTable.tsx`)
- Navigation components
- Card-based components

### Low-Touch Files (1-4 changes)
- Individual form components
- Utility components
- Dialog/modal components

### New Files Created
- `PageHeader.tsx`
- `MasterListShell.tsx`
- `MasterListRow.tsx`
- `EmptyState.tsx`
- `icon-reference.tsx`
- `check-design-system.js`
- Design system documentation updates

**Total Estimated Files**: ~200 files touched, ~10 new files created
