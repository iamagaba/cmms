# Requirements Document

## Introduction

This specification addresses a critical database error that occurs when submitting confirmation calls for work orders. The system fails with "column 'specializations' does not exist" because the trigger function `queue_work_order_for_assignment()` attempts to query a `service_categories` table that was never created in the database schema. Since specializations are not currently needed for the confirmation call workflow, this fix removes the specializations dependency entirely to unblock work order progression.

## Glossary

- **Work_Order**: A maintenance task record in the CMMS system
- **Confirmation_Call**: The process of confirming work order details before assignment
- **Assignment_Queue**: A table that holds work orders ready for automatic technician assignment
- **Trigger_Function**: A PostgreSQL function that executes automatically when specific database events occur
- **Auto_Assignment**: The automated process of matching work orders to available technicians

## Requirements

### Requirement 1: Fix Database Schema Error

**User Story:** As a system administrator, I want the confirmation call process to complete successfully, so that work orders can be assigned to technicians without errors.

#### Acceptance Criteria

1. WHEN a work order status changes to 'Ready', THE Trigger_Function SHALL execute without throwing database errors
2. WHEN the trigger function executes, THE Database SHALL NOT attempt to query non-existent service_categories table
3. WHEN a work order is added to the assignment queue, THE System SHALL record the work order ID, priority, and preferred location
4. THE Trigger_Function SHALL NOT include specializations in the assignment queue logic

### Requirement 2: Maintain Data Integrity

**User Story:** As a database administrator, I want the fix to preserve existing data, so that no work orders or related records are lost.

#### Acceptance Criteria

1. WHEN the migration runs, THE System SHALL preserve all existing work_orders records
2. WHEN the migration runs, THE System SHALL preserve all existing assignment_queue records
3. THE Migration SHALL be idempotent and safe to run multiple times

### Requirement 3: Update Trigger Function

**User Story:** As a system administrator, I want the trigger function to work without specializations, so that work orders can be queued immediately.

#### Acceptance Criteria

1. WHEN a work order transitions to 'Ready' status, THE Trigger_Function SHALL queue it for assignment without checking specializations
2. THE Trigger_Function SHALL continue to check auto_assignment_enabled setting before queuing work orders
3. THE Trigger_Function SHALL NOT reference the service_categories table
4. THE Trigger_Function SHALL NOT include required_specializations in the assignment queue insert
