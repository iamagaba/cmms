# Mobile Web App Troubleshooting Guide

## Issues Reported
1. **App loads without styling** - CSS not applying
2. **Login doesn't work** - Authentication not proceeding

## Debugging Steps

### 1. Test Pages Created
- `/debug` - Tests styling, auth context, and Supabase connection
- `/simple-login` - Basic login test without complex components

### 2. Check Browser Console
Open browser developer tools (F12) and check for:
- JavaScript errors
- Network request failures
- CSS loading issues

### 3. Verify Styling
Visit `/debug` page to test if CSS is working:
- Blue box should appear with white text
- Green button should be styled

### 4. Test Authentication
Visit `/simple-login` page to test basic login:
- Enter your Fleet CMMS credentials
- Check console logs for detailed error messages
- Verify Supabase connection

### 5. Common Solutions

#### Styling Issues
```bash
# Clear Next.js cache
rm -rf .next
npm run build

# Restart development server
npm run dev
```

#### Authentication Issues
- Verify Supabase URL and key in `src/lib/supabase.ts`
- Check if user exists in the main app
- Verify network connectivity to Supabase

#### Development Server Issues
```bash
# Kill any existing processes on port 3002
npx kill-port 3002

# Start fresh
npm run dev
```

### 6. Manual Testing Steps

1. **Visit `/debug`**:
   - Should see blue styled box (tests CSS)
   - Click "Test Auth" (tests auth context)
   - Click "Test Supabase Connection" (tests database)

2. **Visit `/simple-login`**:
   - Enter valid credentials
   - Check result message
   - Check browser console for logs

3. **Visit `/login`**:
   - Should see styled login form
   - Try logging in with valid credentials

### 7. Expected Behavior
- Styling should load properly (CSS classes applied)
- Login should redirect to dashboard on success
- Protected routes should redirect to login when not authenticated

### 8. If Issues Persist
Check these files for potential problems:
- `src/app/layout.tsx` - AuthProvider setup
- `src/context/AuthContext.tsx` - Authentication logic
- `src/lib/supabase.ts` - Supabase configuration
- `src/app/globals.css` - CSS imports

### 9. Network Issues
If Supabase connection fails:
- Check internet connectivity
- Verify Supabase project is active
- Test main app to ensure Supabase is working