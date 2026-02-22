# Sparkline Feature for KPI Cards

## Overview
Added mini trend charts (sparklines) to the KPI cards on the Professional CMMS Dashboard to provide visual context for metrics at a glance.

## What Changed

### 1. StatRibbon Component (`src/components/dashboard/StatRibbon.tsx`)
- Uses **@mui/x-charts** (MUI X Charts) for consistency with the rest of the app
- Added optional `sparklineData` prop to stat interface
- Integrated small 64x32px sparkline charts next to KPI values
- Sparklines use color-coded lines matching the stat's theme color

### 2. KpiSparkline Component (`src/components/KpiSparkline.tsx`)
- Migrated from Recharts to **@mui/x-charts** for consistency
- Supports line, area, and bar chart variants
- Maintains same API for backward compatibility

### 3. Dashboard Metrics (`src/pages/ProfessionalCMMSDashboard.tsx`)
- Enhanced metrics calculation to generate 7-day historical data
- Added sparkline data for all 5 KPI cards:
  - **Work Orders**: Daily count of new work orders created
  - **New/Open**: Count of open orders at end of each day
  - **Avg Completion**: Average completion time in hours per day
  - **Overdue**: Count of overdue orders at end of each day
  - **SLA Compliance**: Daily compliance percentage

### 4. Dependencies
- **Removed**: Recharts (no longer needed)
- **Using**: @mui/x-charts (already installed, primary chart library for the app)

## Visual Design

The sparklines follow shadcn/ui design principles:
- **Minimal**: 64x32px, no axes or labels
- **Color-coded**: Match the stat's theme color (primary, emerald, red, etc.)
- **Subtle**: Provide context without overwhelming the main metric
- **Responsive**: Automatically hide on very small screens if needed

## Usage Example

```tsx
<StatRibbon
  stats={[
    {
      title: "Work Orders",
      value: 34,
      subtitle: "+3.1% vs last week",
      icon: Clipboard,
      color: "primary",
      sparklineData: [
        { value: 5 },
        { value: 7 },
        { value: 4 },
        { value: 8 },
        { value: 6 },
        { value: 5 },
        { value: 9 }
      ]
    }
  ]}
/>
```

## Benefits

1. **Quick Trend Recognition**: See if metrics are trending up or down at a glance
2. **Context Without Clutter**: Adds information without taking up extra space
3. **Visual Hierarchy**: Maintains focus on the main metric value
4. **Consistent Design**: Uses shadcn/ui color system and spacing
5. **Library Consistency**: Uses @mui/x-charts like the rest of the app

## Technical Details

- **Library**: @mui/x-charts (MUI X Charts)
- **Data Points**: 7 days of historical data
- **Performance**: Minimal overhead, no animations for instant rendering
- **Accessibility**: Sparklines are decorative; main metrics remain accessible
- **Consistency**: All charts in the app now use the same library
