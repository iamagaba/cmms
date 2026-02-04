-- Add sample timeline data for testing the vertical activity timeline feature
-- This script adds sample activities to existing work orders

-- First, let's check if we have any work orders
DO $$
DECLARE
    sample_work_order_id UUID;
    sample_user_id UUID;
BEGIN
    -- Get the first work order ID
    SELECT id INTO sample_work_order_id 
    FROM work_orders 
    LIMIT 1;
    
    -- Get a user ID (or use a default one)
    SELECT id INTO sample_user_id 
    FROM auth.users 
    LIMIT 1;
    
    -- If we found a work order, add sample activities
    IF sample_work_order_id IS NOT NULL THEN
        
        -- Insert sample timeline activities
        INSERT INTO work_order_activities (
            work_order_id,
            activity_type,
            title,
            description,
            user_id,
            user_name,
            user_avatar,
            metadata,
            created_at
        ) VALUES 
        (
            sample_work_order_id,
            'created',
            'Work order created',
            'Initial work order created for maintenance request',
            sample_user_id,
            'System Admin',
            NULL,
            '{"work_order_number": "WO-2024-001", "priority": "Medium", "status": "New"}',
            NOW() - INTERVAL '2 hours'
        ),
        (
            sample_work_order_id,
            'assigned',
            'Technician assigned',
            'Assigned to John Smith for maintenance work',
            sample_user_id,
            'Dispatch Manager',
            NULL,
            '{"assigned_to": "John Smith", "assigned_by": "Dispatch Manager"}',
            NOW() - INTERVAL '1 hour 45 minutes'
        ),
        (
            sample_work_order_id,
            'started',
            'Work started',
            'Technician arrived on site and began work',
            sample_user_id,
            'John Smith',
            NULL,
            '{"location": "Customer Site", "arrival_time": "' || (NOW() - INTERVAL '1 hour 30 minutes')::text || '"}',
            NOW() - INTERVAL '1 hour 30 minutes'
        ),
        (
            sample_work_order_id,
            'note_added',
            'Note added',
            'Customer reported unusual noise from the equipment. Initial inspection shows potential bearing issue.',
            sample_user_id,
            'John Smith',
            NULL,
            '{"note_content": "Customer reported unusual noise from the equipment. Initial inspection shows potential bearing issue.", "note_type": "diagnostic"}',
            NOW() - INTERVAL '1 hour'
        ),
        (
            sample_work_order_id,
            'note_added',
            'Note added',
            'Ordered replacement bearing (Part #BRG-4521). Expected delivery tomorrow morning.',
            sample_user_id,
            'John Smith',
            NULL,
            '{"note_content": "Ordered replacement bearing (Part #BRG-4521). Expected delivery tomorrow morning.", "note_type": "parts_order"}',
            NOW() - INTERVAL '45 minutes'
        ),
        (
            sample_work_order_id,
            'paused',
            'Work paused',
            'Work paused - waiting for replacement parts to arrive',
            sample_user_id,
            'John Smith',
            NULL,
            '{"reason": "Waiting for parts", "expected_resume": "' || (NOW() + INTERVAL '1 day')::text || '"}',
            NOW() - INTERVAL '30 minutes'
        ),
        (
            sample_work_order_id,
            'note_added',
            'Note added',
            'Contacted customer to inform about delay. Customer is understanding and agreed to reschedule.',
            sample_user_id,
            'John Smith',
            NULL,
            '{"note_content": "Contacted customer to inform about delay. Customer is understanding and agreed to reschedule.", "note_type": "customer_communication"}',
            NOW() - INTERVAL '15 minutes'
        );
        
        RAISE NOTICE 'Successfully added sample timeline activities for work order ID: %', sample_work_order_id;
        
    ELSE
        RAISE NOTICE 'No work orders found. Please create a work order first.';
    END IF;
    
END $$;