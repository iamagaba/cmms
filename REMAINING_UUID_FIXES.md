# Remaining UUID Display Fixes

## Summary
I've created utility functions and fixed the most critical files. Here's what's been done and what remains:

## ✅ Completed Fixes

1. **Created Utility Functions** (`src/utils/work-order-display.ts`)
   - `getWorkOrderNumber()` - Generates human-readable work order numbers
   - `getCustomerDisplayName()` - Customer names with fallbacks
   - `getTechnicianDisplayName()` - Technician names with fallbacks
   - `getVehicleDisplayName()` - Vehicle identifiers with fallbacks
   - `getLocationDisplayName()` - Location names with fallbacks
   - `getUserDisplayName()` - User/profile names with fallbacks

2. **Fixed Files**
   - ✅ `src/components/EnhancedWorkOrderDataTable.tsx`
   - ✅ `src/pages/WorkOrders.tsx` (CSV export and delete confirmation)

## 🔧 Files That Still Need Fixing

### Pattern to Find and Replace

Search for: `\.id\.substring\(|\.id\.slice\(|\.id\}`

Replace pattern:
```typescript
// Before:
wo.workOrderNumber || `WO-${wo.id.substring(0, 8).toUpperCase()}`

// After:
import { getWorkOrderNumber } from '@/utils/work-order-display';
getWorkOrderNumber(wo)
```

### Files to Update (in order of priority):

1. **src/pages/Technicians.tsx** (Line 652)
   ```typescript
   {wo.work_order_number || `WO-${wo.id.substring(0, 6).toUpperCase()}`}
   ```

2. **src/pages/CustomerDetails.tsx** (Line 368)
   ```typescript
   {wo.workOrderNumber || `WO-${wo.id}`}
   ```

3. **src/pages/Assets.tsx** (Line 736)
   ```typescript
   {workOrder.workOrderNumber || `WO-${workOrder.id.substring(0, 6).toUpperCase()}`}
   ```

4. **src/pages/AssetDetails.tsx** (Line 425)
   ```typescript
   {wo.workOrderNumber || `WO-${wo.id.substring(0, 8).toUpperCase()}`}
   ```

5. **src/pages/WorkOrderDetailsEnhanced.tsx** (Line 748)
   ```typescript
   workOrderNumber={workOrder.workOrderNumber || workOrder.id}
   ```

6. **src/components/work-order-details/WorkOrderSidebar.tsx** (Line 179)
   ```typescript
   const woNumber = workOrder.work_order_number || `WO-${workOrder.id.substring(0, 6).toUpperCase()}`;
   ```

7. **src/components/work-order-details/WorkOrderRelatedHistoryCard.tsx** (Line 120)
   ```typescript
   {rWo.workOrderNumber || `WO-${rWo.id.substring(0, 6).toUpperCase()}`}
   ```

8. **src/components/WorkOrderDetailsDrawer.tsx** (Line 705)
   ```typescript
   workOrderNumber={workOrder.workOrderNumber || workOrder.id || ''}
   ```

9. **src/components/tv/TVWidgets.tsx** (Line 120)
   ```typescript
   {wo.work_order_number || `WO-${wo.id.slice(-6).toUpperCase()}`}
   ```

10. **src/components/maps/WorkOrdersMap.tsx** (Line 281)
    ```typescript
    ${wo.workOrderNumber || wo.id.substring(0, 8)}
    ```

11. **src/components/dashboard/PriorityWorkOrders.tsx** (Line 58)
    ```typescript
    {order.workOrderNumber || `WO-${order.id.substring(0, 6).toUpperCase()}`}
    ```

## Quick Fix Commands

For each file, you need to:
1. Add import: `import { getWorkOrderNumber } from '@/utils/work-order-display';`
2. Replace the pattern with: `getWorkOrderNumber(workOrder)`

## Testing After Fixes

Test these screens to ensure no UUIDs are visible:
- [ ] Work Orders list page
- [ ] Work Order details page
- [ ] Technician details page (work order list)
- [ ] Customer details page (work order list)
- [ ] Asset details page (work order history)
- [ ] Dashboard (priority work orders)
- [ ] TV Dashboard
- [ ] Map view (work order popups)
- [ ] CSV exports

## Benefits

After these fixes:
- ✅ No raw UUIDs displayed to users
- ✅ Consistent work order number format across the app
- ✅ Graceful fallbacks when data is missing
- ✅ Better user experience with readable identifiers
- ✅ Timestamp-based work order numbers when official number is missing
