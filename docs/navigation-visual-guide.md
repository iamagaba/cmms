# Navigation Visual Guide

## Before & After

### Desktop Layout - Before
```
┌─────────────────────────────────────────────────────────┐
│ [☰] Sidebar                                             │
│  ├─ Dashboard                                           │
│  ├─ Work Orders                                         │
│  ├─ Assets                                              │
│  └─ ...                                                 │
│                                                         │
│  Main Content Area                                      │
│  (No quick search, no command palette)                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Desktop Layout - After
```
┌─────────────────────────────────────────────────────────┐
│ [☰] Sidebar    [🔍 Quick search... ⌘K]                 │
│  ├─ Dashboard                                           │
│  ├─ Work Orders                                         │
│  ├─ Assets                                              │
│  └─ ...                                                 │
│                                                         │
│  Main Content Area                                      │
│  (Command palette available with Cmd+K)                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Command Palette

### Visual Structure
```
┌─────────────────────────────────────────────────────────┐
│  🔍 Type a command or search...                         │
├─────────────────────────────────────────────────────────┤
│  Navigation                                             │
│  🏠 Dashboard                                           │
│  📋 Work Orders                                         │
│  🏢 Assets                                              │
│  👥 Customers                                           │
│  🔧 Technicians                                         │
│  📦 Inventory                                           │
│  📍 Service Centers                                     │
│  📅 Scheduling                                          │
│  📊 Reports                                             │
│  ⚙️  Settings                                           │
├─────────────────────────────────────────────────────────┤
│  Quick Actions                                          │
│  ➕ Create Work Order                                   │
│  ➕ Add Asset                                           │
│  ➕ Add Customer                                        │
├─────────────────────────────────────────────────────────┤
│  Recent Work Orders                                     │
│  📄 WO-12345 - Brake Repair                            │
│  📄 WO-12344 - Oil Change                              │
│  📄 WO-12343 - Tire Replacement                        │
├─────────────────────────────────────────────────────────┤
│  Recent Assets                                          │
│  🏢 ABC-123 - Honda CBR 2020                           │
│  🏢 XYZ-789 - Yamaha MT-07 2021                        │
└─────────────────────────────────────────────────────────┘
```

### Search in Action
```
User types: "wo"

┌─────────────────────────────────────────────────────────┐
│  🔍 wo                                                  │
├─────────────────────────────────────────────────────────┤
│  Navigation                                             │
│  📋 Work Orders                    ← Highlighted        │
├─────────────────────────────────────────────────────────┤
│  Quick Actions                                          │
│  ➕ Create Work Order                                   │
├─────────────────────────────────────────────────────────┤
│  Recent Work Orders                                     │
│  📄 WO-12345 - Brake Repair                            │
│  📄 WO-12344 - Oil Change                              │
└─────────────────────────────────────────────────────────┘
```

## Contextual Top Bar

### Work Order Details - Before
```
┌─────────────────────────────────────────────────────────┐
│  Work Order Details                                     │
│                                                         │
│  [Overview Cards]                                       │
│  [Stepper]                                              │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Overview │ Notes │ Details │ Parts │ History   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [Tab Content]                                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Work Order Details - After
```
┌─────────────────────────────────────────────────────────┐
│  ← Work Orders    WO-12345                              │
│                   Brake Repair                          │
│                                                         │
│  Overview │ Notes │ Details │ Parts │ History          │
│                                      [Assign] [Complete]│
├─────────────────────────────────────────────────────────┤
│  [Overview Cards]                                       │
│  [Stepper]                                              │
│                                                         │
│  [Tab Content]                                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Contextual Top Bar Components

```
┌─────────────────────────────────────────────────────────┐
│  [Back Button]  [Title]                    [Actions]    │
│                 [Subtitle]                              │
│                                                         │
│  [Tab 1] [Tab 2] [Tab 3] [Tab 4] [Tab 5]              │
└─────────────────────────────────────────────────────────┘

Components:
- Back Button: ← Work Orders
- Title: WO-12345 (large, bold)
- Subtitle: Brake Repair (smaller, muted)
- Tabs: Overview, Notes, Details, Parts, History (with icons)
- Actions: Assign, Complete buttons
```

## User Flows

### Quick Navigation Flow
```
1. User presses Cmd+K
   ↓
2. Command palette opens
   ↓
3. User types "assets"
   ↓
4. Assets option is highlighted
   ↓
5. User presses Enter
   ↓
6. Navigates to Assets page
   
Total time: ~2 seconds
```

### Work Order Detail Navigation
```
1. User is on Work Orders list
   ↓
2. Clicks a work order
   ↓
3. Detail page opens with contextual top bar
   ↓
4. User sees:
   - Back button to return to list
   - Work order number and title
   - Tabs for different sections
   - Quick action buttons
   ↓
5. User clicks "Notes" tab
   ↓
6. Content switches to notes (no page reload)
   
Total clicks: 2 (work order + tab)
```

## Responsive Behavior

### Desktop (>1024px)
- Command palette: Full width dialog (600px max)
- Search button: Visible in top bar
- Contextual top bar: Full width with all elements
- Tabs: Horizontal layout

### Tablet (768px - 1024px)
- Command palette: Full width dialog
- Search button: Icon only
- Contextual top bar: Stacked layout
- Tabs: Horizontal scrollable

### Mobile (<768px)
- Command palette: Full screen
- Search button: Not shown (use Cmd+K)
- Contextual top bar: Simplified
- Tabs: Horizontal scrollable with touch

## Color & Styling

### Command Palette
- Background: `bg-popover` (theme-aware)
- Text: `text-popover-foreground`
- Hover: `bg-accent`
- Border: `border-border`
- Icons: `w-4 h-4` (16px)

### Contextual Top Bar
- Background: `bg-background`
- Border: `border-b`
- Title: `text-2xl font-semibold`
- Subtitle: `text-sm text-muted-foreground`
- Tabs: shadcn/ui default styling
- Sticky: `sticky top-0 z-30`

## Accessibility

### Command Palette
- ✅ Keyboard navigation (arrow keys)
- ✅ Screen reader announcements
- ✅ Focus management
- ✅ Escape to close
- ✅ ARIA labels

### Contextual Top Bar
- ✅ Semantic HTML (nav, button)
- ✅ ARIA labels on buttons
- ✅ Keyboard accessible tabs
- ✅ Focus indicators
- ✅ Color contrast (WCAG AA)

## Performance

### Command Palette
- Lazy loads recent items
- Debounced search (if implemented)
- Renders only visible items
- Closes on navigation (cleans up)

### Contextual Top Bar
- CSS sticky (no JS scroll listeners)
- Tab content lazy loaded
- Minimal re-renders
- Optimized for 60fps scrolling
