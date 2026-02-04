/**
 * Script to add sample timeline data for testing
 * This will create sample activities for existing work orders
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addSampleTimelineData() {
  try {
    console.log('Adding sample timeline data...');

    // Get first work order
    const { data: workOrders, error: workOrderError } = await supabase
      .from('work_orders')
      .select('id, work_order_number')
      .limit(1);

    if (workOrderError || !workOrders || workOrders.length === 0) {
      console.error('No work orders found:', workOrderError);
      return;
    }

    const workOrder = workOrders[0];
    console.log(`Adding activities for work order: ${workOrder.work_order_number}`);

    // Sample activities to add
    const sampleActivities = [
      {
        work_order_id: workOrder.id,
        activity_type: 'created',
        title: 'Work order created',
        description: 'Initial work order created for maintenance request',
        user_name: 'System Admin',
        metadata: {
          work_order_number: workOrder.work_order_number,
          priority: 'Medium',
          status: 'New'
        }
      },
      {
        work_order_id: workOrder.id,
        activity_type: 'assigned',
        title: 'Technician assigned',
        description: 'Assigned to John Smith for maintenance work',
        user_name: 'Dispatch Manager',
        metadata: {
          assigned_to: 'John Smith',
          assigned_by: 'Dispatch Manager'
        }
      },
      {
        work_order_id: workOrder.id,
        activity_type: 'started',
        title: 'Work started',
        description: 'Technician arrived on site and began work',
        user_name: 'John Smith',
        metadata: {
          location: 'Customer Site',
          start_time: new Date().toISOString()
        }
      },
      {
        work_order_id: workOrder.id,
        activity_type: 'note_added',
        title: 'Note added',
        description: 'Customer reported unusual noise from the equipment. Initial inspection shows potential bearing issue.',
        user_name: 'John Smith',
        metadata: {
          note_content: 'Customer reported unusual noise from the equipment. Initial inspection shows potential bearing issue.',
          note_type: 'diagnostic'
        }
      },
      {
        work_order_id: workOrder.id,
        activity_type: 'paused',
        title: 'Work paused',
        description: 'Work paused - waiting for replacement parts to arrive',
        user_name: 'John Smith',
        metadata: {
          reason: 'Waiting for parts',
          expected_resume: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        }
      }
    ];

    // Insert sample activities
    const { data: insertedActivities, error: insertError } = await supabase
      .from('work_order_activities')
      .insert(sampleActivities)
      .select();

    if (insertError) {
      console.error('Error inserting sample activities:', insertError);
      return;
    }

    console.log(`Successfully added ${insertedActivities.length} sample activities!`);
    console.log('Sample activities:', insertedActivities);

  } catch (error) {
    console.error('Error adding sample timeline data:', error);
  }
}

// Run the script
addSampleTimelineData();