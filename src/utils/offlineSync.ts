import db from '@/utils/localDatabase';
import { supabase } from '@/integrations/supabase/client';
import { WorkOrder } from '@/types/supabase';

// Function to synchronize local work orders with the server
export async function syncWorkOrders() {
  try {
    // Get all local work orders that need to be synced (marked as dirty or new)
    const localWorkOrders = await db.workOrders.toArray();
    
    // Filter for work orders that have been modified locally
    const unsyncedWorkOrders = localWorkOrders.filter(wo => wo.updated_at); // Simplified check
    
    // Sync each unsynced work order
    for (const workOrder of unsyncedWorkOrders) {
      // Attempt to update the work order on the server
      const { error } = await supabase
        .from('work_orders')
        .update({
          // Include all relevant fields here
          status: workOrder.status,
          // Add other fields as needed
        })
        .eq('id', workOrder.id);
      
      if (error) {
        console.error(`Failed to sync work order ${workOrder.id}:`, error.message);
        // Optionally, mark the work order as needing resync
        continue;
      }
      
      // If successful, mark the work order as synced
      // In a real implementation, you'd want to track sync status
      console.log(`Successfully synced work order ${workOrder.id}`);
    }
    
    // Fetch new work orders from the server
    const { data: newWorkOrders, error: fetchError } = await supabase
      .from('work_orders')
      .select('*')
      .gt('updated_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // Last 24 hours
    
    if (fetchError) {
      console.error('Failed to fetch new work orders:', fetchError.message);
      return;
    }
    
    // Store new work orders in local database
    for (const workOrder of newWorkOrders) {
      await db.workOrders.put(workOrder);
    }
    
    console.log(`Synced ${unsyncedWorkOrders.length} local work orders and fetched ${newWorkOrders.length} new work orders.`);
  } catch (error) {
    console.error('Error during sync:', error);
  }
}

// Function to save a work order locally
export async function saveWorkOrderLocally(workOrder: WorkOrder) {
  try {
    await db.workOrders.put(workOrder);
    console.log(`Work order ${workOrder.id} saved locally`);
  } catch (error) {
    console.error('Error saving work order locally:', error);
  }
}

// Function to check if the app is online
export function isOnline(): boolean {
  return navigator.onLine;
}

// Set up a listener for online/offline events
export function setupOnlineListener() {
  window.addEventListener('online', () => {
    console.log('App is now online');
    syncWorkOrders();
  });
  
  window.addEventListener('offline', () => {
    console.log('App is now offline');
  });
}