# Dark Mode Implementation

Dark mode has been successfully implemented in the GOGO CMMS desktop application using shadcn/ui's built-in theming system.

## Current Status

✅ **Dark mode is now working!** 

The theme toggle is functional and dark mode is applied across the application. Some pages use semantic tokens (fully migrated), while others use temporary CSS overrides until they can be properly migrated.

### What's Working:
- Theme toggle in sidebar (Light / Dark / System modes)
- Theme persistence in localStorage
- Smooth theme transitions
- System preference detection
- Temporary CSS overrides for unmigrated pages

### Migration Status:
- ✅ **Fully Migrated**: Sidebar, AppLayout, ThemeToggle
- ⚠️ **Temporary Overrides**: Most pages (using CSS !important rules)
- 📋 **To Do**: Gradual migration to semantic tokens (see DARK_MODE_MIGRATION_GUIDE.md)

## Implementation Details

### 1. Theme Provider (`src/providers/ThemeProvider.tsx`)

The `ThemeProvider` manages the theme state and applies the appropriate class to the document root:

- Stores theme preference in localStorage
- Applies `.dark` or `.light` class to `<html>` element
- Listens for system preference changes when in "System" mode
- Provides `useTheme()` hook for components to access theme state

### 2. Theme Toggle Component (`src/components/ThemeToggle.tsx`)

A dropdown menu button that allows users to switch between themes:

- Sun/Moon icon that animates based on current theme
- Dropdown menu with three options: Light, Dark, System
- Visual indicator (✓) shows current selection
- Uses shadcn/ui Button and DropdownMenu components

### 3. CSS Variables (`src/App.css`)

Dark mode colors are defined using CSS variables with HSL values:

```css
:root {
  /* Light mode colors */
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --primary: 262.1 83.3% 57.8%;
  /* ... more variables */
}

.dark {
  /* Dark mode colors */
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  --primary: 263.4 70% 50.4%;
  /* ... more variables */
}
```

### 4. Integration

The theme provider is integrated at the app root level in `src/App.tsx`:

```tsx
<ThemeProvider>
  <ComprehensiveErrorProvider>
    {/* ... rest of app */}
  </ComprehensiveErrorProvider>
</ThemeProvider>
```

The theme toggle is placed in the sidebar footer (`src/components/layout/ProfessionalSidebar.tsx`).

## Usage

### For Users

1. **Access the theme toggle**: Hover over the sidebar to expand it, then click the sun/moon icon at the bottom
2. **Select a theme**:
   - **Light**: Always use light theme
   - **Dark**: Always use dark theme
   - **System**: Follow your operating system's theme preference

Your theme preference is automatically saved and will persist across sessions.

### For Developers

#### Using Theme in Components

```tsx
import { useTheme } from '@/providers/ThemeProvider';

function MyComponent() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  
  // theme: 'light' | 'dark' | 'system' (user's preference)
  // resolvedTheme: 'light' | 'dark' (actual theme being displayed)
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <p>Resolved theme: {resolvedTheme}</p>
      <button onClick={() => setTheme('dark')}>Switch to Dark</button>
    </div>
  );
}
```

#### Using Semantic Color Tokens

Always use semantic color tokens instead of hardcoded colors to ensure proper dark mode support:

```tsx
// ✅ CORRECT - Uses semantic tokens
<div className="bg-background text-foreground">
  <Card className="bg-card border-border">
    <p className="text-muted-foreground">Secondary text</p>
  </Card>
</div>

// ❌ WRONG - Hardcoded colors won't adapt to dark mode
<div className="bg-white text-black">
  <Card className="bg-gray-100 border-gray-200">
    <p className="text-gray-500">Secondary text</p>
  </Card>
</div>
```

#### Common Semantic Tokens

- **Backgrounds**: `bg-background`, `bg-card`, `bg-popover`
- **Text**: `text-foreground`, `text-muted-foreground`, `text-card-foreground`
- **Borders**: `border-border`, `border-input`
- **Interactive**: `bg-primary`, `text-primary`, `bg-accent`, `text-accent-foreground`
- **Status**: `bg-destructive`, `text-destructive-foreground`

## Testing Dark Mode

1. Start the development server: `npm run dev`
2. Open the application in your browser
3. Click the theme toggle in the sidebar
4. Test all three modes (Light, Dark, System)
5. Verify theme persists after page reload
6. Check that all pages and components look correct in both themes

## Browser Support

Dark mode works in all modern browsers that support:
- CSS custom properties (CSS variables)
- `prefers-color-scheme` media query
- localStorage API

This includes Chrome, Firefox, Safari, and Edge (latest versions).

## Troubleshooting

### Theme not persisting
- Check browser localStorage is enabled
- Clear localStorage and try again: `localStorage.clear()`

### Colors not changing
- Ensure components use semantic color tokens (e.g., `bg-background` instead of `bg-white`)
- Check that the `.dark` class is applied to the `<html>` element

### System theme not working
- Verify your OS has a dark mode setting
- Check browser supports `prefers-color-scheme` media query
- Try manually selecting Light or Dark mode instead

## Future Enhancements

Potential improvements for dark mode:

- [ ] Add theme transition animations
- [ ] Create custom color schemes (e.g., high contrast mode)
- [ ] Add keyboard shortcut for theme toggle (e.g., Ctrl+Shift+T)
- [ ] Implement per-page theme overrides for specific use cases
- [ ] Add theme preview in settings page
