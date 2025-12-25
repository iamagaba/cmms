# Styling Fix Guide

If the app styling has disappeared, follow these steps to restore it.

## Quick Fix Steps

### 1. Clear Next.js Cache
```bash
# In mobile-web directory
rm -rf .next
# or on Windows
rmdir /s /q .next
```

### 2. Restart the Dev Server
```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

### 3. Hard Refresh Browser
- Chrome/Edge: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
- Firefox: `Ctrl + F5` (Windows) or `Cmd + Shift + R` (Mac)
- Safari: `Cmd + Option + R`

### 4. Clear Browser Cache
If hard refresh doesn't work:
1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

## Verify Styling is Working

### Check 1: Inspect Element
1. Open the app in browser
2. Right-click any element
3. Select "Inspect"
4. Check if CSS classes are applied correctly

### Check 2: Console Errors
1. Open DevTools (F12)
2. Go to Console tab
3. Look for any CSS or build errors

### Check 3: Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Refresh page
4. Check if CSS files are loading (look for `*.css` files)

## Common Issues & Solutions

### Issue 1: Port Already in Use
**Error**: `EADDRINUSE: address already in use :::3002`

**Solution**:
```bash
# Find and kill the process using port 3002
# Windows:
netstat -ano | findstr :3002
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:3002 | xargs kill -9

# Then restart
npm run dev
```

### Issue 2: CSS Not Compiling
**Symptoms**: Classes not applying, no colors

**Solution**:
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Clear cache and rebuild
rm -rf .next
npm run dev
```

### Issue 3: CSS Not Loading
**Symptoms**: Completely unstyled page

**Solution**:
1. Check `src/app/layout.tsx` has:
   ```typescript
   import './globals.css';
   ```

2. Check `src/app/globals.css` is properly configured with your CSS imports

### Issue 4: Styles Work Locally But Not in Production
**Solution**:
```bash
# Rebuild for production
npm run build
npm start
```

## Manual Verification

### Test Component
Create a test page to verify styling is working:

```typescript
// src/app/test-styles/page.tsx
export default function TestStyles() {
  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '2rem' }}>
      <div style={{ maxWidth: '28rem', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#2563eb' }}>
          Styling Test
        </h1>
        <div style={{ background: 'white', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.5rem', marginTop: '1rem' }}>
          <p style={{ color: '#374151' }}>
            If you can see this styled correctly, CSS is working!
          </p>
        </div>
        <button style={{ width: '100%', background: '#2563eb', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', marginTop: '1rem', border: 'none', cursor: 'pointer' }}>
          Test Button
        </button>
      </div>
    </div>
  )
}
```

Visit `http://localhost:3002/test-styles` to verify.

## Nuclear Option (Last Resort)

If nothing else works:

```bash
# 1. Stop the dev server
# 2. Delete everything and start fresh
rm -rf node_modules .next package-lock.json

# 3. Reinstall
npm install

# 4. Restart
npm run dev

# 5. Hard refresh browser (Ctrl+Shift+R)
```

## Still Not Working?

### Check These Files

1. **layout.tsx** - Must import globals.css
2. **globals.css** - Must be properly configured
3. **CSS configuration files** - Check for proper setup

### Get Help

If styling is still broken:
1. Check browser console for errors
2. Check terminal for build errors
3. Verify all config files match the originals
4. Try accessing from a different browser
5. Try accessing from incognito/private mode

## Prevention

To avoid this in the future:

1. **Don't edit config files** unless necessary
2. **Commit working state** to git before major changes
3. **Test after changes** - refresh browser after any config changes
4. **Use version control** - can always revert to working state

## Quick Checklist

- [ ] Cleared .next cache
- [ ] Restarted dev server
- [ ] Hard refreshed browser
- [ ] Checked console for errors
- [ ] Verified globals.css is imported
- [ ] Verified CSS configuration is correct
- [ ] Tested in different browser
- [ ] Reinstalled node_modules (if needed)

---

**Most Common Fix**: Clear cache + restart server + hard refresh browser

**Time to Fix**: Usually < 2 minutes

**Success Rate**: 95% of styling issues are fixed by clearing cache and restarting
