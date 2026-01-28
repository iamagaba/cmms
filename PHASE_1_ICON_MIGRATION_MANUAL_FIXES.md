# Phase 1: Icon Migration Manual Fixes

The automated codemod successfully migrated 91 files from HugeiconsIcon to Lucide React. However, some icons need manual mapping because they don't have direct equivalents or are used dynamically.

## Missing Icon Mappings

Add these mappings to your icon usage:

### Common Icons

```tsx
// Hugeicons → Lucide React
FilterIcon → Filter
ArrowRight01Icon → ArrowRight
MoreHorizontalIcon → MoreHorizontal
MoreVerticalIcon → MoreVertical
Delete01Icon → Trash2
AlertCircleIcon → AlertCircle
ArrowUp01Icon → ArrowUp
ArrowDown01Icon → ArrowDown
PencilEdit01Icon → Edit
PencilEdit02Icon → Edit2
Tag01Icon → Tag
Table01Icon → Table
Folder01Icon → Folder
PackageIcon → Package
InboxIcon → Inbox
Car01Icon → Car
Call02Icon → Phone
UserCircleIcon → UserCircle
TimelineIcon → Clock
ListViewIcon → List
GridIcon → Grid
ReloadIcon → RotateCw
BugIcon → Bug
WifiOffIcon → WifiOff
Menu01Icon → Menu
ArrowDataTransferHorizontalIcon → ArrowLeftRight
Building02Icon → Building2
PackageReceiveIcon → PackageCheck
PackageRemoveIcon → PackageMinus
NoteIcon → FileText
Loading03Icon → Loader
ViewIcon → Eye
ChartBarOffIcon → BarChart3
DoubleArrowLeft01Icon → ChevronsLeft
DoubleArrowRight01Icon → ChevronsRight
ArrowRight02Icon → ChevronRight
FilterHorizontalIcon → SlidersHorizontal
Edit02Icon → Edit
Delete02Icon → Trash
Sun01Icon → Sun
Moon01Icon → Moon
ThumbsDownIcon → ThumbsDown
Idea01Icon → Lightbulb
FlowIcon → Workflow
Store01Icon → Store
FlagIcon → Flag
Clock02Icon → Clock
Keyboard01Icon → Keyboard
PlusMinusIcon → PlusCircle (or MinusCircle depending on context)
SecurityCheckIcon → ShieldCheck
UserGroupIcon → Users
Tick02Icon → CheckCheck
Layout02Icon → Layout
SmartPhone01Icon → Smartphone
```

## Dynamic Icon Usage

Some files use icons dynamically (e.g., `icon={someVariable}`). These need manual review:

### Files with Dynamic Icons

1. **src/components/buttons/EnhancedButton.tsx**
   - Uses `icon` prop dynamically
   - Solution: Pass Lucide icon component directly

2. **src/components/dashboard/DashboardSection.tsx**
   - Uses `icon` prop
   - Solution: Pass Lucide icon component

3. **src/components/dashboard/ModernKPICard.tsx**
   - Uses `getTrendIcon(trend.direction)`
   - Solution: Return Lucide icon component from function

4. **src/components/dashboard/PriorityWorkOrders.tsx**
   - Uses conditional: `isOverdue ? AlertCircle : Calendar`
   - Solution: Already correct pattern with Lucide

5. **src/components/dashboard/ProfessionalDashboard.tsx**
   - Uses `activity.icon`
   - Solution: Store Lucide icon components in activity objects

6. **src/components/dashboard/QuickActionsPanel.tsx**
   - Uses `action.icon`
   - Solution: Store Lucide icon components in action objects

7. **src/components/CategoryMultiSelect.tsx**
   - Uses `getCategoryIcon(category)`
   - Solution: Return Lucide icon component from function

8. **src/components/error/ErrorBoundary.tsx** & **ErrorFallback.tsx**
   - Uses `icon` prop with conditionals
   - Solution: Pass Lucide icon components

9. **src/components/navigation/ModernBreadcrumbs.tsx**
   - Uses `item.icon`
   - Solution: Store Lucide icon components in breadcrumb items

10. **src/components/reports/InventoryReport.tsx**
    - Uses `tab.icon` and `icon` prop
    - Solution: Store Lucide icon components in tab objects

## Example Fixes

### Before (Hugeicons)
```tsx
import { HugeiconsIcon } from '@hugeicons/react';
import { FilterIcon } from '@hugeicons/core-free-icons';

<HugeiconsIcon icon={FilterIcon} size={16} />
```

### After (Lucide)
```tsx
import { Filter } from 'lucide-react';

<Filter className="w-4 h-4" />
```

### Dynamic Icon Pattern

```tsx
// Before
const getTrendIcon = (direction: string) => {
  return direction === 'up' ? ArrowUp01Icon : ArrowDown01Icon;
};

<HugeiconsIcon icon={getTrendIcon(trend)} size={16} />

// After
import { ArrowUp, ArrowDown } from 'lucide-react';

const TrendIcon = trend === 'up' ? ArrowUp : ArrowDown;

<TrendIcon className="w-4 h-4" />
```

### Icon in Props

```tsx
// Before
interface ActionProps {
  icon: any; // Hugeicons icon
}

// After
import { LucideIcon } from 'lucide-react';

interface ActionProps {
  icon: LucideIcon; // Lucide icon component
}

// Usage
<QuickAction icon={Plus} label="Create" />
```

## Next Steps

1. ✅ Automated migration complete (91 files)
2. ⏳ Manual fixes needed for dynamic icons (~15 files)
3. ⏳ Install lucide-react: `npm install lucide-react`
4. ⏳ Uninstall hugeicons: `npm uninstall @hugeicons/react @hugeicons/core-free-icons`
5. ⏳ Test application thoroughly
6. ⏳ Fix any remaining TypeScript errors

## Testing Checklist

After manual fixes:

- [ ] All pages load without icon errors
- [ ] Navigation icons display correctly
- [ ] Button icons render properly
- [ ] Status badges show correct icons
- [ ] Empty states display icons
- [ ] Dynamic icons work (filters, trends, etc.)
- [ ] Dark mode icons are visible
- [ ] Icon sizes are consistent (16px, 20px, 24px)
- [ ] No console errors related to icons
- [ ] Build completes successfully

## Icon Size Verification

Run this search to find any remaining `size={` props:

```bash
rg "size=\{" src/ --type tsx
```

All should be replaced with Tailwind classes:
- `size={16}` → `className="w-4 h-4"`
- `size={20}` → `className="w-5 h-5"`
- `size={24}` → `className="w-6 h-6"`
