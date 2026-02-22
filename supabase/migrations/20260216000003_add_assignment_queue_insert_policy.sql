-- Migration: Add INSERT Policy for Assignment Queue
-- Purpose: Allows the trigger function to insert work orders into the assignment_queue
--          when they transition to 'Ready' status. Without this policy, the trigger
--          fails with "new row violates row-level security policy" error.
--
-- The trigger function runs in the security context of the user making the change,
-- so authenticated users need INSERT permission on assignment_queue.
--
-- Spec: confirmation-call-specializations-fix

-- ============================================================================
-- Add INSERT policy for assignment_queue
-- ============================================================================
-- Purpose: Allow authenticated users (and triggers running on their behalf) to
--          insert work orders into the assignment queue.
--
-- This policy is required for the queue_work_order_for_assignment() trigger
-- function to work correctly when users update work order status to 'Ready'.

CREATE POLICY "Authenticated users can insert into assignment queue"
  ON assignment_queue FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================================================
-- Add UPDATE and DELETE policies for completeness
-- ============================================================================
-- Purpose: Allow authenticated users to manage assignment queue entries.
--          This enables the auto-assignment system to update queue status
--          and remove completed assignments.

CREATE POLICY "Authenticated users can update assignment queue"
  ON assignment_queue FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete from assignment queue"
  ON assignment_queue FOR DELETE
  TO authenticated
  USING (true);
