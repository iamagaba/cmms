# Asset Custody Tracking System

## Overview

This system automatically tracks whether bikes are in customer possession or at service centers undergoing repair. It solves the problem of distinguishing between:
- **Reported issues** (bike still with customer)
- **Active maintenance** (bike in custody at service center)

## How It Works

### Automatic Status Sync

The system uses the existing `vehicles.status` field which can be:
- `Normal` - Bike is with customer
- `In Repair` - Bike is at service center (in custody)
- `Decommissioned` - Bike is no longer in service
- `Available` - Bike is available (for company assets/emergency bikes)

### Database Trigger

A PostgreSQL trigger automatically syncs the asset status based on work order status changes:

**When work order → "In Progress" or "On Hold":**
- Asset status automatically changes to "In Repair"
- This indicates the bike is physically at your service center

**When work order → "Completed":**
- Asset status changes back to "Normal" (if no other active work orders exist)
- This indicates the bike has been returned to the customer

**Edge case handling:**
- If multiple work orders exist for the same bike, the asset remains "In Repair" until ALL work orders are completed

## Implementation Files

### Database
- `supabase/migrations/sync_asset_status_with_work_orders.sql` - Trigger that auto-syncs asset status

### Components
- `src/components/AssetCustodyBadge.tsx` - Visual badge showing custody status
- `src/utils/work-order-helpers.ts` - Helper functions for custody checks
- `src/utils/asset-custody-filters.ts` - Filter functions for custody-based queries

### UI Updates
- `src/components/UrgentWorkOrdersTable.tsx` - Added custody column
- `src/components/work-order-columns-constants.ts` - Added custody to available columns

## Usage Examples

### Check if Asset is in Custody

```typescript
import { isAssetInCustody } from '@/utils/work-order-helpers';

const vehicle = { status: 'In Repair' };
if (isAssetInCustody(vehicle)) {
  console.log('Bike is at service center');
}
```

### Display Custody Badge

```typescript
import { AssetCustodyBadge } from '@/components/AssetCustodyBadge';

<AssetCustodyBadge 
  vehicle={vehicle} 
  size="md" 
  showIcon={true} 
/>
```

### Filter Work Orders by Custody

```typescript
import { filterWorkOrdersInCustody } from '@/utils/asset-custody-filters';

// Get only work orders where bikes are in custody
const bikesInCustody = filterWorkOrdersInCustody(workOrders, vehicles);

// Get only work orders where bikes are still with customer
const bikesWithCustomer = filterWorkOrdersWithCustomer(workOrders, vehicles);
```

### Get Custody Statistics

```typescript
import { getCustodyStats } from '@/utils/asset-custody-filters';

const stats = getCustodyStats(vehicles);
console.log(`In custody: ${stats.inCustody}`);
console.log(`With customer: ${stats.withCustomer}`);
```

## Visual Indicators

The custody badge displays:
- 🔧 **In Custody** (blue) - Asset is at service center
- 📍 **With Customer** (gray) - Asset is in customer possession
- 🚫 **Decommissioned** (red) - Asset is no longer in service

## Benefits

1. **No duplicate data** - Uses existing asset status field
2. **Automatic sync** - No manual updates needed
3. **Clear visibility** - Easy to see where bikes are at a glance
4. **Accurate tracking** - Handles edge cases (multiple work orders)
5. **Queryable** - Can filter and report on custody status

## Deployment

To deploy this feature:

1. Run the migration:
```bash
# Apply to your Supabase database
psql -f supabase/migrations/sync_asset_status_with_work_orders.sql
```

2. The UI components are already integrated and will work immediately

3. Existing work orders will sync when their status changes

## Future Enhancements

Potential improvements:
- Add custody location tracking (which service center has the bike)
- Track custody transfer timestamps
- Add custody history/audit trail
- Dashboard widget showing bikes in custody by location
- Alerts for bikes in custody too long
