# Fix Instructions for Mobile Web App

## Issues Identified
1. **Styling not loading** - Likely due to development server cache
2. **Login not working** - May be related to authentication context or server issues

## Step-by-Step Fix

### 1. Stop the Development Server
First, stop any running development server:
- Press `Ctrl+C` in the terminal running the dev server
- Or close the terminal window

### 2. Clear Next.js Cache
```bash
cd mobile-web
rm -rf .next
rm -rf node_modules/.cache
```

### 3. Kill Any Processes on Port 3002
```bash
# Windows (run in PowerShell as Administrator)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3002).OwningProcess | Stop-Process -Force

# Or use this alternative
npx kill-port 3002
```

### 4. Restart Development Server
```bash
npm run dev
```

### 5. Test the Application

#### A. Test Styling (Visit: http://localhost:3002/debug)
- Should see a blue box with white text
- Should see a green styled button
- If styling doesn't work, there's a CSS issue

#### B. Test Basic Login (Visit: http://localhost:3002/simple-login)
- Enter your GOGO Electric credentials
- Check the result message
- Check browser console for any errors

#### C. Test Full Login (Visit: http://localhost:3002/login)
- Should see the styled login form
- Try logging in with valid credentials
- Should redirect to dashboard on success

### 6. Alternative Solutions

#### If Styling Still Doesn't Work:
```bash
# Reinstall dependencies
rm -rf node_modules
npm install

# Rebuild the app
npm run build
npm run dev
```

#### If Login Still Doesn't Work:
1. Check browser console for errors
2. Verify Supabase credentials in `src/lib/supabase.ts`
3. Test with the main app to ensure your credentials work
4. Check network connectivity

### 7. Manual Testing Checklist

- [ ] Visit `/debug` - Styling and connections work
- [ ] Visit `/simple-login` - Basic auth works  
- [ ] Visit `/login` - Full login form works
- [ ] Visit `/` - Dashboard loads (after login)
- [ ] Visit `/work-orders` - Work orders display correctly
- [ ] Test logout from profile page

### 8. Expected Results After Fix

✅ **Styling**: CSS classes should apply properly
✅ **Login**: Should authenticate and redirect to dashboard
✅ **Work Orders**: Should display customer names correctly
✅ **Navigation**: Should work between all pages
✅ **Logout**: Should work from profile page

### 9. If Issues Persist

The debug pages will help identify the specific problem:
- `/debug` - Tests all core functionality
- `/simple-login` - Tests authentication without complex UI

Check the browser console for specific error messages and let me know what you see.

## Quick Commands Summary
```bash
# Stop server (Ctrl+C)
# Clear cache
rm -rf .next

# Kill port (if needed)
npx kill-port 3002

# Restart
npm run dev

# Test URLs
# http://localhost:3002/debug
# http://localhost:3002/simple-login  
# http://localhost:3002/login
```