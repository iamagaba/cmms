# Tailwind Density Transformation Checklist

## Global Changes to Apply

### 1. Border Radius Reduction ✅ (Partially Done)
- [x] `rounded-xl` → `rounded-lg` (Dashboard cards)
- [x] `rounded-xl` → `rounded-lg` (Drawer)
- [ ] `rounded-lg` → `rounded-md` (Inputs, buttons)
- [ ] `rounded-lg` → `rounded` (Small elements)

### 2. Shadow Reduction ✅ (Done)
- [x] Removed `shadow-lg`, `shadow-md` from cards
- [x] Using `border border-gray-200` instead
- [x] Hover effects use `hover:border-color` not `hover:shadow`

### 3. Input & Button Heights ⚠️ (Needs Work)
**Current:** `h-12` (48px) - Mobile-friendly
**Target:** `h-9` (36px) or `h-8` (32px) - Desktop-optimized

**Changes Needed:**
- [ ] All form inputs: `h-12` → `h-9`
- [ ] All buttons: `h-12` → `h-9`
- [ ] Input text: `text-base` → `text-sm`
- [ ] Button padding: `px-6` → `px-4`, `py-3` → `py-2`

### 4. Table Row Padding ✅ (Done)
- [x] `py-4` → `py-2` (ModernAssetDataTable)
- [x] `px-4` → `px-3` (ModernAssetDataTable)
- [x] Font: `text-sm` for primary, `text-xs` for secondary

### 5. Card Padding ✅ (Done)
- [x] `p-6` → `p-3` (Dashboard, Drawer, Details)
- [x] `gap-6` → `gap-3` (Grid gaps)
- [x] `space-y-6` → `space-y-3` (Vertical spacing)

### 6. Typography Scale ✅ (Done)
- [x] Headers: `text-lg` → `text-sm`
- [x] Labels: `text-sm` → `text-xs`
- [x] Body: `text-base` → `text-sm`
- [x] Secondary: `text-sm` → `text-xs`

### 7. Icon Sizes ✅ (Done)
- [x] Large icons: `w-6 h-6` → `w-4.5 h-4.5`
- [x] Medium icons: `w-5 h-5` → `w-3.5 h-3.5`
- [x] Small icons: `w-4 h-4` → `w-3 h-3`

## Component-Specific Tasks

### Forms (High Priority)
- [ ] AssetFormDialog: Reduce input heights
- [ ] Work Order creation forms: Compact inputs
- [ ] Search inputs: `h-12` → `h-9`
- [ ] Filter dropdowns: Smaller height

### Buttons (High Priority)
- [ ] Primary buttons: `h-12 px-6` → `h-9 px-4`
- [ ] Secondary buttons: Match primary
- [ ] Icon buttons: `p-3` → `p-2`
- [ ] Button text: `text-base` → `text-sm`

### Cards (Medium Priority)
- [ ] Use divide-y utilities instead of margin spacing
- [ ] Flatten nested cards
- [ ] Remove double borders

### Grids (Medium Priority)
- [ ] Increase column counts where possible
- [ ] 2-column → 3 or 4 columns on desktop
- [ ] Better use of horizontal space

## Files to Update

### High Priority:
1. [ ] `src/components/AssetFormDialog.tsx` - Form inputs
2. [ ] `src/components/work-orders/CreateWorkOrderForm.tsx` - Form inputs
3. [ ] `src/components/tailwind-components/Button.tsx` - Global button component
4. [ ] `src/components/tailwind-components/Input.tsx` - Global input component

### Medium Priority:
5. [ ] `src/pages/Assets.tsx` - Search and filters
6. [ ] `src/pages/WorkOrders.tsx` - Search and filters
7. [ ] `src/components/work-order-details/WorkOrderCustomerVehicleCard.tsx` - Use divide-y
8. [ ] `src/components/work-order-details/WorkOrderLocationMapCard.tsx` - Compact layout

### Low Priority:
9. [ ] Modal dialogs - Reduce padding
10. [ ] Notification toasts - Smaller size
11. [ ] Dropdown menus - Tighter spacing

## Quick Wins (Can be done with find/replace)

### Safe Global Replacements:
```bash
# Reduce button padding
px-6 py-3 → px-4 py-2

# Reduce card padding (where not already done)
p-6 → p-4

# Reduce gaps
gap-6 → gap-4
gap-4 → gap-3

# Reduce spacing
space-y-6 → space-y-4
space-y-4 → space-y-3

# Reduce margins
mb-6 → mb-4
mb-4 → mb-3
mt-6 → mt-4
mt-4 → mt-3
```

### Conditional Replacements (Need review):
```bash
# Only in form contexts
h-12 → h-9
h-11 → h-9

# Only in text contexts
text-base → text-sm (in forms, tables)
text-lg → text-sm (in headers)

# Only in border radius
rounded-xl → rounded-lg (large cards)
rounded-lg → rounded-md (inputs, buttons)
```

## Implementation Strategy

### Phase 1: Forms & Buttons (Biggest Visual Impact)
1. Update global Button component
2. Update global Input component
3. Update AssetFormDialog
4. Update Work Order forms

### Phase 2: Remaining Cards
1. WorkOrderCustomerVehicleCard - use divide-y
2. WorkOrderLocationMapCard - flatten
3. WorkOrderAppointmentCard - compact

### Phase 3: Polish
1. Modal dialogs
2. Dropdowns
3. Notifications
4. Tooltips

## Expected Results

### Before (Current State):
- Form input height: 48px
- Button height: 48px
- Card padding: 24px
- Grid gaps: 24px

### After (Target State):
- Form input height: 36px (25% reduction)
- Button height: 36px (25% reduction)
- Card padding: 16px (33% reduction)
- Grid gaps: 12px (50% reduction)

### Total Space Savings:
- Forms: ~30% more compact
- Cards: ~35% more compact
- Overall: ~40-50% more information density

## Notes

- Maintain minimum 32px height for touch targets on mobile
- Keep text readable (minimum 10px font size)
- Preserve accessibility (color contrast, focus states)
- Test on different screen sizes
