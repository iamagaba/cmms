// Simple test to check database function
// Open the browser console at http://localhost:8082 and paste this code

async function testDatabaseFunction() {
  // Import supabase from the app's modules
  const { supabase } = await import('/src/integrations/supabase/client.ts');
  
  console.log('Testing if add_part_to_work_order function exists...');
  
  try {
    // Try to call the function with dummy data
    const { data, error } = await supabase.rpc('add_part_to_work_order', {
      p_work_order_id: '00000000-0000-0000-0000-000000000000',
      p_item_id: '00000000-0000-0000-0000-000000000000',
      p_quantity_used: 1
    });
    
    if (error) {
      console.log('Function call failed:', error.message);
      if (error.message.includes('function add_part_to_work_order(uuid, uuid, integer) does not exist')) {
        console.log('❌ Function NOT found in database');
        return false;
      } else {
        console.log('✅ Function exists (failed due to invalid data)');
        return true;
      }
    } else {
      console.log('✅ Function exists and worked');
      return true;
    }
  } catch (error) {
    console.error('Error testing function:', error);
    return false;
  }
}

// Call the test function
testDatabaseFunction().then(exists => {
  console.log('Function exists:', exists);
});