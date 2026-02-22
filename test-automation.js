// Quick test script to verify Edge Functions are working
// Run with: node test-automation.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAutoAssignment() {
  console.log('Testing auto-assignment function...');
  try {
    const { data, error } = await supabase.functions.invoke('auto-assign-work-orders');
    
    if (error) {
      console.error('❌ Error:', error.message);
      return false;
    }
    
    console.log('✅ Auto-assignment response:', data);
    return true;
  } catch (err) {
    console.error('❌ Exception:', err.message);
    return false;
  }
}

async function testSLAMonitor() {
  console.log('\nTesting SLA monitor function...');
  try {
    const { data, error } = await supabase.functions.invoke('sla-monitor');
    
    if (error) {
      console.error('❌ Error:', error.message);
      return false;
    }
    
    console.log('✅ SLA monitor response:', data);
    return true;
  } catch (err) {
    console.error('❌ Exception:', err.message);
    return false;
  }
}

async function runTests() {
  console.log('=== Automation Edge Functions Test ===\n');
  
  const test1 = await testAutoAssignment();
  const test2 = await testSLAMonitor();
  
  console.log('\n=== Test Summary ===');
  console.log(`Auto-assignment: ${test1 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`SLA monitor: ${test2 ? '✅ PASS' : '❌ FAIL'}`);
  
  if (test1 && test2) {
    console.log('\n🎉 All tests passed! The automation system is ready to use.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the error messages above.');
  }
}

runTests();
