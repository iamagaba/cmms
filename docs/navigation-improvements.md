# Navigation Improvements

This document describes the new navigation features added to the desktop CMMS application.

## 1. Command Palette (Quick Switcher)

A VS Code-style command palette for fast navigation and actions.

### Features

- **Keyboard shortcut**: `Cmd+K` (Mac) or `Ctrl+K` (Windows/Linux)
- **Quick navigation** to all main sections
- **Recent items** - Shows last 5 work orders and assets
- **Quick actions** - Create work orders, assets, customers
- **Search** - Type to filter commands

### Usage

1. Press `Cmd+K` or click the search button in the top bar
2. Type to search for pages, work orders, or assets
3. Use arrow keys to navigate, Enter to select
4. Press Escape to close

### Location

- Desktop: Top bar next to sidebar toggle button
- Component: `src/components/navigation/CommandPalette.tsx`

### Customization

To add new commands, edit `CommandPalette.tsx`:

```tsx
<CommandGroup heading="Your Section">
  <CommandItem onSelect={() => handleSelect(() => navigate('/your-route'))}>
    <YourIcon className="w-4 h-4 mr-2" />
    <span>Your Command</span>
  </CommandItem>
</CommandGroup>
```

## 2. Contextual Top Bar

A sticky top bar for detail pages with breadcrumbs, tabs, and actions.

### Features

- **Back navigation** - Quick return to list views
- **Page title & subtitle** - Clear context
- **Contextual tabs** - Navigate between sections
- **Action buttons** - Primary actions always visible
- **Sticky positioning** - Stays visible while scrolling

### Usage

Currently implemented on:
- Work Order Details page

### Example Implementation

```tsx
<ContextualTopBar
  title="WO-12345"
  subtitle="Brake Repair"
  backUrl="/work-orders"
  backLabel="Work Orders"
  tabs={[
    { value: 'overview', label: 'Overview', icon: <Info className="w-4 h-4" /> },
    { value: 'notes', label: 'Notes', icon: <MessageSquare className="w-4 h-4" /> },
  ]}
  activeTab={activeTab}
  onTabChange={setActiveTab}
  actions={
    <>
      <Button variant="outline">Assign</Button>
      <Button>Complete</Button>
    </>
  }
/>
```

### Component Location

`src/components/layout/ContextualTopBar.tsx`

## Design Principles

Both features follow the app's design system:

- **shadcn/ui components** - Uses default styling
- **Consistent spacing** - Follows 4px grid
- **Keyboard accessible** - Full keyboard navigation
- **Theme aware** - Works in light and dark modes
- **Mobile responsive** - Command palette adapts to screen size

## Future Enhancements

Potential improvements:

1. **Command palette**:
   - Add keyboard shortcuts display
   - Include customer search
   - Add technician quick actions
   - Recent searches history

2. **Contextual top bar**:
   - Add to Asset Details page
   - Add to Customer Details page
   - Include breadcrumb navigation
   - Add status indicators

## Performance Notes

- Command palette data fetches only when opened
- Recent items limited to 5 per category
- Tabs use React state (no URL changes)
- Sticky positioning uses CSS (no JS scroll listeners)
