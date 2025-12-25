# Requirements Document

## Introduction

This specification addresses the complete removal of mock data from the application and ensures all components use real database data through Supabase integration. While the main application already uses database queries, there are test files and potentially some components that still contain hardcoded mock data that should be cleaned up for consistency and maintainability.

## Glossary

- **Mock Data**: Hardcoded sample data arrays or objects used for testing or development purposes
- **Supabase**: The PostgreSQL database service used by the application
- **React Query**: The data fetching library used for database queries (@tanstack/react-query)
- **Test Components**: Components used specifically for testing that may contain mock data
- **Real Data**: Data fetched from the actual Supabase database tables

## Requirements

### Requirement 1

**User Story:** As a developer, I want all mock data removed from the codebase, so that the application consistently uses real database data and maintains data integrity.

#### Acceptance Criteria

1. WHEN reviewing test files, THE System SHALL identify all hardcoded mock data arrays and objects
2. WHEN examining components, THE System SHALL ensure all data comes from Supabase queries
3. WHEN running the application, THE System SHALL fetch all data from the database tables
4. WHERE mock data exists in test files, THE System SHALL replace it with proper test fixtures or database mocks
5. THE System SHALL maintain existing Supabase query patterns for data fetching

### Requirement 2

**User Story:** As a developer, I want consistent data fetching patterns across all components, so that the codebase is maintainable and follows best practices.

#### Acceptance Criteria

1. THE System SHALL use React Query (useQuery) for all data fetching operations
2. THE System SHALL implement proper loading states for all database queries
3. THE System SHALL handle error states consistently across all components
4. THE System SHALL use proper TypeScript types for all database entities
5. WHERE components need data, THE System SHALL fetch from appropriate Supabase tables

### Requirement 3

**User Story:** As a developer, I want proper test data management, so that tests are reliable and don't interfere with real data.

#### Acceptance Criteria

1. THE System SHALL use proper mocking strategies for Supabase in tests
2. THE System SHALL replace hardcoded test data with factory functions or fixtures
3. THE System SHALL ensure tests don't depend on specific mock data values
4. THE System SHALL maintain test isolation and repeatability
5. WHERE tests need data, THE System SHALL use consistent test data patterns

### Requirement 4

**User Story:** As a system administrator, I want all application data to come from the database, so that data is persistent and can be managed through proper database operations.

#### Acceptance Criteria

1. THE System SHALL remove all static data arrays from components
2. THE System SHALL ensure all CRUD operations use Supabase client
3. THE System SHALL implement proper data validation for database operations
4. THE System SHALL handle database connection errors gracefully
5. THE System SHALL use proper caching strategies for frequently accessed data