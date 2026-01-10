# Shift Scheduling Implementation

## Overview
Implemented a ZoomShift-style employee shift scheduling system for managing technician work schedules. This replaces the previous work order scheduling functionality with a focused shift management tool.

## Scope

### Use Case: Technician Shift Scheduling
Track who's working, when, and where - focused purely on employee shift management.

## Features Implemented

### 1. Week View Schedule Grid
- **Layout**: Rows for technicians, columns for days of the week
- **Shift Blocks**: Visual blocks showing time ranges and locations
- **Color Coding**: Different colors for different service center locations
- **Weekly Hours**: Total hours displayed per technician

### 2. Shift Creation & Editing
- **Click to Create**: Click any empty cell to create a shift
- **Shift Details**:
  - Start/end time
  - Location/service center
  - Optional notes
- **Visual Indicators**:
  - Draft shifts: Dashed border
  - Published shifts: Solid border
  - Color-coded by location

### 3. Shift Actions
- **Edit**: Click shift block to edit details
- **Delete**: Hover over shift to reveal delete button
- **Drag Support**: Ready for future drag-to-resize/reassign functionality

### 4. Bulk Operations
- **Copy Week**: Copy entire week's schedule to another week
- **Publish Schedule**: Publish all draft shifts at once
- **Week Navigation**: Previous/Next week, Today button

### 5. Visual Features
- **Events Row**: Company-wide events/holidays displayed at top
- **Today Highlighting**: Current day highlighted in blue
- **Weekend Styling**: Weekends have different background color
- **Hover States**: Desktop-optimized hover interactions

### 6. Summary Metrics
- Total hours per technician (weekly)
- Hour totals displayed in technician name column

## Database Schema

### Tables Used
- **shifts**: Stores shift data
  - technician_id
  - start_datetime
  - end_datetime
  - location_id
  - shift_type (regular/overtime/on_call)
  - status (draft/published)
  - notes
  - break_duration_minutes

- **technicians**: Employee data
- **locations**: Service center locations
- **schedule_events**: Company-wide events/holidays

## Files Created

### Components
- `src/components/scheduling/ShiftBlock.tsx` - Individual shift display component
- `src/components/scheduling/ShiftEditorDialog.tsx` - Shift creation/editing modal
- `src/components/ui/dialog.tsx` - Reusable dialog component

### Hooks
- `src/hooks/useShifts.ts` - Shift data management with React Query
  - Fetch shifts for date range
  - Delete shift mutation
  - Publish shifts mutation
  - Copy week mutation

### Pages
- `src/pages/Scheduling.tsx` - Main scheduling page (replaced old version)

## User Workflows

### Creating a Weekly Schedule
1. Navigate to desired week
2. Click technician's cell on specific day
3. Set start/end time and location
4. Save (stays as draft)
5. Repeat for all technicians
6. Review coverage
7. Click "Publish" to make visible to team

### Copying Schedules
1. View week with existing schedule
2. Click "Copy" button
3. Enter target week date
4. System duplicates all shifts
5. Adjust as needed

### Editing Shifts
1. Click on shift block
2. Modify time, location, or notes
3. Save changes

## Permissions
- **Admins**: Can create, edit, delete, and publish shifts
- **Technicians**: Can view schedules (read-only)

## Design Patterns

### Desktop-Optimized
- Hover states for quick actions
- Mouse interactions for editing
- Multi-column grid layout
- Keyboard navigation ready

### Tailwind Styling
- Consistent spacing (p-2, p-3, p-4)
- Hover states (hover:bg-gray-50)
- Focus rings for accessibility
- Dark mode support throughout

## Future Enhancements (Not Implemented)

### Potential Additions
- Drag-and-drop shift reassignment
- Shift templates (recurring patterns)
- Export to PDF/print
- Shift conflict detection
- Mobile-responsive view
- Shift swap requests
- Overtime tracking
- Break time management

## Technical Notes

- Uses React Query for data fetching and caching
- Dayjs for date manipulation
- Radix UI for accessible dialog component
- Supabase for backend data storage
- TypeScript for type safety
- Desktop web only (`src/` directory)

## Testing Checklist

- [ ] Create shift for technician
- [ ] Edit existing shift
- [ ] Delete shift
- [ ] Copy week to another week
- [ ] Publish draft shifts
- [ ] Navigate between weeks
- [ ] View events row
- [ ] Check weekend styling
- [ ] Verify today highlighting
- [ ] Test with multiple locations
- [ ] Verify hour calculations

## Migration Notes

The previous `Scheduling.tsx` was focused on work order scheduling with calendar/timeline views. This has been completely replaced with shift management functionality. Work order scheduling is now handled separately (to be implemented in future if needed).
