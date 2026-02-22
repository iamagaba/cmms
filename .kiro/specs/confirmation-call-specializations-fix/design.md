# Design Document

## Overview

This design addresses a critical database error in the work order confirmation call process. The root cause is a missing `service_categories` table that is referenced by the `queue_work_order_for_assignment()` trigger function. The solution involves creating the missing table, updating the trigger function to handle missing data gracefully, and ensuring backward compatibility with existing work orders.

The fix will be implemented as a new database migration that creates the service_categories table, updates the trigger function, and populates default categories. This approach ensures the system can immediately resume normal operation while providing a foundation for future service category management.

## Architecture

### Database Schema Changes

The solution adds a new `service_categories` table to the existing database schema:

```
┌─────────────────────┐
│  service_categories │
├─────────────────────┤
│ id (UUID, PK)       │
│ name (TEXT)         │
│ description (TEXT)  │
│ specializations     │
│   (TEXT[])          │
│ created_at          │
│ updated_at          │
└─────────────────────┘
         ▲
         │
         │ (FK: service_category_id)
         │
┌─────────────────────┐
│    work_orders      │
├─────────────────────┤
│ id (UUID, PK)       │
│ service_category_id │
│ status              │
│ priority            │
│ ...                 │
└─────────────────────┘
```

### Trigger Function Flow

```
Work Order Status → 'Ready'
         │
         ▼
queue_work_order_for_assignment() trigger
         │
         ├─→ Check: auto_assignment_enabled?
         │         │
         │         ├─→ NO: Exit
         │         │
         │         └─→ YES: Continue
         │
         ├─→ Lookup: service_categories.specializations
         │         │
         │         ├─→ Found: Use specializations
         │         │
         │         └─→ Not Found: Use empty array '{}'
         │
         └─→ Insert into assignment_queue
```

## Components and Interfaces

### 1. Service Categories Table

**Purpose**: Store service category definitions with required specializations

**Schema**:
```sql
CREATE TABLE service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  specializations TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

**Indexes**:
- Primary key index on `id` (automatic)
- Unique index on `name` (for lookup and duplicate prevention)
- Index on `created_at` (for sorting and filtering)

**Constraints**:
- `name` must be unique and not null
- `specializations` defaults to empty array if not provided

### 2. Updated Trigger Function

**Purpose**: Queue work orders for assignment with proper error handling

**Function Signature**:
```sql
CREATE OR REPLACE FUNCTION queue_work_order_for_assignment()
RETURNS TRIGGER
```

**Logic Changes**:
- Replace direct SELECT with COALESCE to handle NULL results
- Use empty array '{}' as fallback when service_category_id is NULL or lookup fails
- Maintain existing priority calculation logic
- Preserve ON CONFLICT DO NOTHING behavior

**Updated Query**:
```sql
COALESCE(
  (SELECT specializations 
   FROM service_categories 
   WHERE id = NEW.service_category_id), 
  '{}'
)
```

### 3. Migration File

**File**: `supabase/migrations/20260207000001_fix_service_categories.sql`

**Sections**:
1. Create service_categories table
2. Create indexes
3. Enable Row Level Security
4. Create RLS policies
5. Update trigger function
6. Insert default categories
7. Create update timestamp trigger

## Data Models

### Service Category Model

```typescript
interface ServiceCategory {
  id: string;                    // UUID
  name: string;                  // e.g., "Electrical", "HVAC"
  description: string | null;    // Optional description
  specializations: string[];     // e.g., ["Licensed Electrician", "High Voltage Certified"]
  created_at: Date;
  updated_at: Date;
}
```

### Default Categories

The migration will insert these default categories:

1. **General Maintenance**
   - Specializations: []
   - Description: "General maintenance and repair work"

2. **Electrical**
   - Specializations: ["Licensed Electrician"]
   - Description: "Electrical system maintenance and repair"

3. **HVAC**
   - Specializations: ["HVAC Certified"]
   - Description: "Heating, ventilation, and air conditioning"

4. **Plumbing**
   - Specializations: ["Licensed Plumber"]
   - Description: "Plumbing system maintenance and repair"

5. **Mechanical**
   - Specializations: ["Mechanical Technician"]
   - Description: "Mechanical system maintenance and repair"

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Trigger executes without errors for all work orders

*For any* work order (with or without service_category_id), when its status changes to 'Ready', the trigger function should execute successfully without throwing database errors.

**Validates: Requirements 1.1, 1.2**

### Property 2: Assignment queue records contain all required fields

*For any* work order that is queued for assignment, the assignment_queue record should contain the work order ID, calculated priority score, required specializations array (empty or populated), and preferred location ID.

**Validates: Requirements 1.4**

### Property 3: Trigger handles missing service categories gracefully

*For any* work order with NULL service_category_id or invalid service_category_id, the trigger function should use an empty array '{}' for required_specializations and successfully insert the work order into the assignment queue.

**Validates: Requirements 4.1, 4.2, 4.3**

### Property 4: Auto-assignment setting controls queue insertion

*For any* work order with status 'Ready', the work order should only be added to the assignment queue when the auto_assignment_enabled setting is true.

**Validates: Requirements 4.4**

### Property 5: Migration is idempotent

*For any* number of migration executions, running the migration multiple times should result in the same final database state with no duplicate records and no errors.

**Validates: Requirements 3.4, 6.4**

## Error Handling

### Trigger Function Error Handling

The updated trigger function uses defensive programming to handle errors:

1. **NULL service_category_id**: COALESCE returns empty array '{}'
2. **Invalid service_category_id**: SELECT returns NULL, COALESCE returns empty array '{}'
3. **Missing auto_assignment_enabled setting**: EXISTS returns false, work order not queued
4. **Duplicate queue insertion**: ON CONFLICT DO NOTHING prevents errors

### Migration Error Handling

The migration uses safe SQL patterns:

1. **CREATE TABLE IF NOT EXISTS**: Prevents errors if table already exists
2. **CREATE INDEX IF NOT EXISTS**: Prevents errors if indexes already exist
3. **INSERT ... ON CONFLICT DO NOTHING**: Prevents duplicate category errors
4. **CREATE OR REPLACE FUNCTION**: Safely updates existing trigger function

### Rollback Strategy

If the migration fails:
1. PostgreSQL automatically rolls back the entire transaction
2. No partial changes are committed
3. The database remains in its pre-migration state
4. The migration can be fixed and re-run

## Testing Strategy

### Unit Testing Approach

Unit tests will focus on specific scenarios and edge cases:

1. **Schema Validation Tests** (Examples):
   - Verify service_categories table exists with correct columns
   - Verify column types (UUID for id, TEXT[] for specializations)
   - Verify indexes exist (name unique index, created_at index)
   - Verify RLS is enabled
   - Verify RLS policies allow authenticated CRUD operations

2. **Default Data Tests** (Examples):
   - Verify all 5 default categories are inserted
   - Verify each category has expected name and specializations
   - Verify categories have valid UUIDs and timestamps

3. **Migration Safety Tests** (Examples):
   - Count work_orders before and after migration (should be equal)
   - Count assignment_queue before and after migration (should be equal)
   - Verify service_category_id references are preserved

### Property-Based Testing Approach

Property tests will verify universal behaviors across many generated inputs:

1. **Trigger Execution Property**:
   - Generate random work orders (various states, with/without service_category_id)
   - Change status to 'Ready'
   - Verify no database errors occur
   - Minimum 100 iterations

2. **Queue Record Completeness Property**:
   - Generate random work orders
   - Trigger queue insertion
   - Verify all required fields are present and valid
   - Minimum 100 iterations

3. **Graceful Degradation Property**:
   - Generate work orders with NULL or invalid service_category_id
   - Trigger queue insertion
   - Verify empty array is used for specializations
   - Minimum 100 iterations

4. **Auto-Assignment Toggle Property**:
   - Generate random work orders
   - Toggle auto_assignment_enabled setting
   - Verify queue insertion only occurs when enabled
   - Minimum 100 iterations

5. **Idempotency Property**:
   - Run migration multiple times (2-5 times)
   - Verify database state is consistent
   - Verify no duplicate categories exist
   - Verify no errors occur

### Testing Configuration

- **Property test library**: pgTAP for PostgreSQL testing
- **Minimum iterations**: 100 per property test
- **Test tagging**: Each test references its design property
- **Tag format**: `-- Feature: confirmation-call-specializations-fix, Property {number}: {property_text}`

### Integration Testing

Integration tests will verify the end-to-end flow:

1. Create a work order with service_category_id
2. Submit confirmation call (changes status to 'Ready')
3. Verify work order appears in assignment_queue
4. Verify specializations are correctly populated
5. Verify no errors occur

### Manual Testing Checklist

After deployment:
- [ ] Submit confirmation call for work order with service category
- [ ] Submit confirmation call for work order without service category
- [ ] Verify assignment queue contains both work orders
- [ ] Verify no errors in application logs
- [ ] Verify no errors in database logs
