# UI Density Implementation Plan

## Goal
Transform from consumer/marketing design to pro/enterprise design with 30-50% more information density.

## Phase 1: Global Design System Changes
- [ ] Update Tailwind config for tighter spacing defaults
- [ ] Create new compact component variants
- [ ] Update global CSS variables

## Phase 2: Remove Card Metaphor
- [ ] Work Order Details page - convert cards to bordered sections
- [ ] Asset Details page - convert cards to bordered sections
- [ ] Dashboard - convert metric cards to compact layout
- [ ] Work Orders list - tighten table layout

## Phase 3: Optimize Key Components
- [ ] Data tables - reduce row height, tighter columns
- [ ] Forms/Drawers - horizontal labels, smaller inputs
- [ ] Stepper component - compact inline layout
- [ ] Header stats - convert to horizontal description list

## Phase 4: Typography & Spacing
- [ ] Reduce heading sizes (H1: 24px→18px, H2: 20px→16px)
- [ ] Reduce base font size in tables (14px→13px)
- [ ] Tighten button padding (px-4 py-3 → px-3 py-1.5)
- [ ] Reduce global gaps (gap-6 → gap-3)

## Implementation Order
1. Tailwind config updates
2. WorkOrderDetailsEnhanced (most complex)
3. AssetDetails
4. Data tables (WorkOrders, Assets)
5. Forms and drawers
6. Dashboard metrics

## Files to Modify
- tailwind.config.js
- src/pages/WorkOrderDetailsEnhanced.tsx
- src/pages/AssetDetails.tsx
- src/pages/WorkOrders.tsx
- src/pages/Assets.tsx
- src/components/work-order-details/* (all card components)
- src/components/AssetDataTable.tsx
- src/components/WorkOrderStepper/WorkOrderStepper.tsx
