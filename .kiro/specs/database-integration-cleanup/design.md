# Design Document

## Overview

This design outlines the systematic approach to remove all mock data from the application and ensure complete database integration. The main application already uses Supabase queries effectively, but there are test files and potentially some components that contain hardcoded mock data that needs cleanup.

## Architecture

### Current State Analysis
- Main application components already use React Query with Supabase
- Test files contain hardcoded mock data arrays
- All major pages (Dashboard, WorkOrders, Technicians, etc.) use proper database queries
- Supabase client is properly configured and integrated

### Target State
- Zero hardcoded mock data in the entire codebase
- Consistent data fetching patterns across all components
- Proper test mocking strategies
- All data operations use Supabase client

## Components and Interfaces

### Data Fetching Layer
```typescript
// Existing pattern (already implemented)
const { data: workOrders, isLoading, error } = useQuery<WorkOrder[]>({
  queryKey: ['work_orders'],
  queryFn: async () => {
    const { data, error } = await supabase.from('work_orders').select('*');
    if (error) throw new Error(error.message);
    return data || [];
  }
});
```

### Test Data Management
```typescript
// New pattern for tests
const createMockWorkOrder = (overrides?: Partial<WorkOrder>): WorkOrder => ({
  id: 'test-id',
  title: 'Test Work Order',
  status: 'Open',
  ...overrides
});

// Mock Supabase in tests
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => Promise.resolve({ data: [], error: null })),
      insert: vi.fn(() => Promise.resolve({ data: [], error: null })),
      update: vi.fn(() => Promise.resolve({ data: [], error: null })),
      delete: vi.fn(() => Promise.resolve({ data: [], error: null }))
    }))
  }
}));
```

## Data Models

### Existing Database Entities
- WorkOrder
- Technician
- Location
- Customer
- Vehicle
- Asset
- InventoryItem
- Profile

### Query Patterns
All components should follow the established pattern:
1. Use React Query's useQuery for data fetching
2. Implement proper loading states
3. Handle errors consistently
4. Use TypeScript types for type safety

## Error Handling

### Database Query Errors
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['entity'],
  queryFn: async () => {
    const { data, error } = await supabase.from('table').select('*');
    if (error) throw new Error(error.message);
    return data || [];
  },
  onError: (error) => {
    showError(`Failed to load data: ${error.message}`);
  }
});
```

### Test Error Handling
```typescript
// Mock error scenarios in tests
const mockSupabaseError = {
  from: vi.fn(() => ({
    select: vi.fn(() => Promise.resolve({ 
      data: null, 
      error: { message: 'Database connection failed' } 
    }))
  }))
};
```

## Testing Strategy

### Unit Tests
- Replace hardcoded mock data with factory functions
- Mock Supabase client consistently
- Test loading and error states
- Ensure tests don't depend on specific data values

### Integration Tests
- Use test database or proper mocking
- Test complete data flow from database to UI
- Verify error handling scenarios
- Test data mutations and updates

### Test Data Factories
```typescript
// Create reusable test data factories
export const createTestWorkOrder = (overrides?: Partial<WorkOrder>): WorkOrder => ({
  id: faker.string.uuid(),
  title: faker.lorem.sentence(),
  description: faker.lorem.paragraph(),
  status: 'Open',
  priority: 'Medium',
  created_at: faker.date.recent().toISOString(),
  updated_at: faker.date.recent().toISOString(),
  ...overrides
});
```

## Implementation Plan

### Phase 1: Audit and Identification
1. Scan all files for hardcoded data arrays
2. Identify test files with mock data
3. Document current data fetching patterns
4. Create inventory of components needing updates

### Phase 2: Test File Cleanup
1. Replace hardcoded mock data in test files
2. Implement proper Supabase mocking
3. Create test data factories
4. Update test assertions to be data-agnostic

### Phase 3: Component Verification
1. Verify all components use database queries
2. Ensure consistent error handling
3. Implement proper loading states
4. Add missing TypeScript types

### Phase 4: Quality Assurance
1. Run comprehensive tests
2. Verify no hardcoded data remains
3. Test error scenarios
4. Validate performance impact

## Performance Considerations

### Query Optimization
- Use React Query's caching effectively
- Implement proper stale time settings
- Avoid unnecessary re-fetches
- Use query invalidation strategically

### Loading States
- Implement skeleton loaders for better UX
- Use Suspense boundaries where appropriate
- Provide meaningful loading indicators
- Handle partial data loading

## Security Considerations

### Data Access
- Ensure proper RLS (Row Level Security) policies
- Validate user permissions for data access
- Implement proper authentication checks
- Use secure query patterns

### Test Data
- Ensure test data doesn't contain sensitive information
- Use faker.js for generating realistic test data
- Implement proper test data cleanup
- Avoid hardcoded credentials or tokens

## Migration Strategy

### Backward Compatibility
- Maintain existing API contracts
- Ensure no breaking changes to component interfaces
- Preserve existing functionality during cleanup
- Test thoroughly before deployment

### Rollback Plan
- Keep backup of original test files
- Document all changes made
- Implement feature flags if needed
- Have rollback procedures ready