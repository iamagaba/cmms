# Asset Creation Fix

## Issue
When creating a new asset, only the customer was being saved but the asset didn't appear in the assets list.

## Root Cause
The issue was with React Query cache invalidation. The vehicles query was using a dynamic query key `['vehicles', searchTerm]`, but the mutation was invalidating with `{ queryKey: ['vehicles'], exact: false }`. This caused a mismatch when there was an active search term, preventing the query from being properly refetched.

## Solution

### 1. Simplified Query Key
Changed the vehicles query key from `['vehicles', searchTerm]` to just `['vehicles']` and moved the search filtering to the client side (which was already happening in the `filteredVehicles` useMemo).

**File**: `src/hooks/useAssetManagement.ts`
```typescript
// Before
queryKey: ['vehicles', searchTerm],

// After
queryKey: ['vehicles'],
```

### 2. Improved Cache Invalidation
Updated the mutation's onSuccess handler to both invalidate and refetch the vehicles query:

```typescript
onSuccess: () => {
    console.log('Asset save successful, invalidating all vehicle queries');
    queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    queryClient.refetchQueries({ queryKey: ['vehicles'] });
    showSuccess('Asset has been saved.');
},
```

### 3. Added Missing Field
Added `registration_number` field to the Vehicle interface since it's used in some parts of the app (like Reports.tsx):

**File**: `src/types/supabase.ts`
```typescript
export interface Vehicle {
  // ... other fields
  license_plate: string; // Required in database
  registration_number?: string | null; // Alias for license_plate in some contexts
  // ... other fields
}
```

## Testing
After these changes:
1. Create a new asset through the Asset Form Dialog
2. The asset should immediately appear in the assets list
3. The customer should be created/updated correctly
4. All asset details should be saved properly

## Files Modified
- `src/hooks/useAssetManagement.ts` - Fixed query key and cache invalidation
- `src/types/supabase.ts` - Added registration_number field to Vehicle interface
