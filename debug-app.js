// Simple debug script to check what's happening
console.log('=== DEBUG SCRIPT START ===');

// Check if the app is loading
setTimeout(() => {
    const root = document.getElementById('root');
    console.log('Root element:', root);
    console.log('Root innerHTML length:', root?.innerHTML?.length || 0);
    console.log('Root children count:', root?.children?.length || 0);
    
    if (root && root.innerHTML.length === 0) {
        console.error('❌ ROOT IS EMPTY - This is the blank page issue');
    } else if (root && root.innerHTML.length > 0) {
        console.log('✅ Root has content');
        console.log('First 200 chars:', root.innerHTML.substring(0, 200));
    }
    
    // Check for React errors
    const errors = document.querySelectorAll('[data-testid="error"]');
    if (errors.length > 0) {
        console.error('❌ Found error elements:', errors);
    }
    
    // Check console for errors
    console.log('=== CONSOLE ERRORS CHECK ===');
    console.log('Check browser console for any red error messages');
    
}, 3000);

console.log('=== DEBUG SCRIPT END ===');