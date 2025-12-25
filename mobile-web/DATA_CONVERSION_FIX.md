# Data Conversion Fix - "Unknown Customer" Issue Resolved

## Root Cause Identified
The "Unknown Customer" issue was caused by a **data format mismatch** between the database and the mobile web app:

- **Database stores fields in snake_case**: `customer_name`, `customer_phone`, `vehicle_model`
- **Mobile web app was looking for camelCase**: `customerName`, `customerPhone`, `vehicleModel`
- **Main app uses conversion utilities** to transform snake_case to camelCase

## Solution Implemented

### 1. Created Data Conversion Utility
**File: `mobile-web/src/utils/data-helpers.ts`**
```typescript
export const snakeToCamelCase = (obj: any): any => {
  return transformKeys(obj, (key) => key.replace(/_([a-z])/g, (g) => g[1].toUpperCase()));
};
```

This utility converts database field names from:
- `customer_name` → `customerName`
- `customer_phone` → `customerPhone`
- `vehicle_model` → `vehicleModel`
- `customer_address` → `customerAddress`

### 2. Updated Work Orders List Page
**File: `mobile-web/src/app/work-orders/page.tsx`**
- Added import for `snakeToCamelCase`
- Applied conversion to fetched work orders:
```typescript
const transformedData = data.map(workOrder => snakeToCamelCase(workOrder) as WorkOrder)
setWorkOrders(transformedData)
```
- Added debug logging to verify transformation

### 3. Updated Work Order Details Page
**File: `mobile-web/src/app/work-orders/[id]/page.tsx`**
- Added import for `snakeToCamelCase`
- Applied conversion to individual work order:
```typescript
const transformedData = snakeToCamelCase(data) as WorkOrder
setWorkOrder(transformedData)
```

## Database Field Mapping

| Database Field (snake_case) | App Field (camelCase) | Description |
|----------------------------|---------------------|-------------|
| `customer_name` | `customerName` | Customer's full name |
| `customer_phone` | `customerPhone` | Customer's phone number |
| `vehicle_model` | `vehicleModel` | Vehicle make and model |
| `customer_address` | `customerAddress` | Customer's address |
| `work_order_number` | `workOrderNumber` | Work order ID |
| `assigned_technician_id` | `assignedTechnicianId` | Technician assignment |

## Expected Results

✅ **Customer names will now display correctly** instead of "Unknown Customer"
✅ **Vehicle information will show properly** 
✅ **Customer phone numbers will be accessible**
✅ **Addresses will display when available**
✅ **Search functionality will work with customer names**
✅ **All work order details will load accurately**

## Debug Information
Added console logging to verify data transformation:
- Work orders list: Logs first 2 transformed work orders
- Work order details: Logs individual transformed work order

## Alignment with Main App
The mobile web app now uses the **exact same data conversion approach** as the main application, ensuring consistent data handling across both platforms.

## Testing
- ✅ Build successful with no errors
- ✅ Data conversion utility properly transforms snake_case to camelCase
- ✅ Work order queries now include proper data transformation
- ✅ Debug logging added for verification

The mobile web app should now display all work order details correctly, matching the functionality of the main application.