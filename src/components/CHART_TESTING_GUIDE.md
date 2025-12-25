# Chart Components Testing Guide

## Quick Test Checklist

### MaintenanceCostChart Testing

**Location:** Asset Details page (bottom section)

**Test Cases:**

1. **Basic Rendering**
   - [ ] Chart displays with title "Maintenance Costs Over Time"
   - [ ] X-axis shows dates in YYYY-MM-DD format
   - [ ] Y-axis shows cost values
   - [ ] Line is purple (theme.colors.purple[6])
   - [ ] Chart is responsive and fills container

2. **Data Display**
   - [ ] Line connects all data points
   - [ ] Dots appear at each data point
   - [ ] Active dot enlarges on hover
   - [ ] Grid lines are visible and subtle

3. **Interactions**
   - [ ] Hover over line shows tooltip
   - [ ] Tooltip displays date and cost in UGX format
   - [ ] Tooltip has white background with border
   - [ ] Legend shows "Cost (UGX)" label

4. **Edge Cases**
   - [ ] Empty data array shows empty chart
   - [ ] Single data point displays correctly
   - [ ] Large numbers format with commas

### ComponentFailureChart Testing

**Location:** Asset Details page (bottom section)

**Test Cases:**

1. **Basic Rendering**
   - [ ] Chart displays with title "Component Failure Frequency"
   - [ ] Pie chart is centered
   - [ ] Each slice has different color from data viz palette
   - [ ] Chart is responsive and fills container

2. **Data Display**
   - [ ] Slices sized proportionally to values
   - [ ] Percentages shown inside slices (if > 5%)
   - [ ] Legend shows all component names
   - [ ] Colors match between pie and legend

3. **Interactions**
   - [ ] Hover over slice shows tooltip
   - [ ] Tooltip displays component name and count
   - [ ] Tooltip has white background with border
   - [ ] Slice color matches in tooltip

4. **Edge Cases**
   - [ ] Empty data array shows empty chart
   - [ ] Single component displays full circle
   - [ ] Many components display with cycling colors

## Visual Inspection Points

### Color Verification
- **Line Chart:** Purple line (#7838C7)
- **Pie Chart:** Uses data viz color palette (purple, pink, cyan, blue, amber, emerald, etc.)
- **Grid:** Light gray (#E5E7EB)
- **Text:** Dark gray (#374151)
- **Tooltips:** White background with light gray border

### Typography Verification
- **Title:** Mantine Title component, order 4
- **Axis Labels:** 12px, theme font family
- **Legend:** 14px, theme font family
- **Tooltip:** 14px, theme font family

### Spacing Verification
- **Card Padding:** lg (24px)
- **Title Margin Bottom:** md (16px)
- **Chart Height:** 300px
- **Chart Margins:** top: 5, right: 30, left: 20, bottom: 5

## Browser Testing

Test in the following browsers:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if available)

## Responsive Testing

Test at the following breakpoints:
- [ ] Mobile (< 768px)
- [ ] Tablet (768px - 1024px)
- [ ] Desktop (> 1024px)

## Performance Testing

- [ ] Charts render within 1 second with 100 work orders
- [ ] No console errors or warnings
- [ ] Smooth hover interactions
- [ ] No memory leaks on repeated renders

## Comparison with Previous Implementation

### What Should Look the Same:
- Overall chart layout and positioning
- Data representation (same values, same trends)
- Interactive behavior (tooltips, hover states)
- Responsive behavior

### What May Look Different (Intentional):
- Exact colors (now using Mantine theme)
- Tooltip styling (now using Mantine design)
- Font family (now using theme font)
- Animation timing (Recharts default)
- Label positioning (Recharts default)

## Known Limitations

1. **Percentage Labels:** Only show on pie slices > 5% to avoid overlap
2. **Color Cycling:** If more than 10 components, colors will repeat
3. **Date Format:** Fixed to YYYY-MM-DD format
4. **Currency:** Hardcoded to UGX

## Troubleshooting

### Chart Not Displaying
- Check browser console for errors
- Verify workOrders prop is passed correctly
- Verify Recharts is installed: `npm list recharts`

### Colors Look Wrong
- Verify Mantine theme is loaded
- Check theme provider wraps the component
- Verify palette.ts exports are correct

### Tooltip Not Showing
- Verify hover is working (check cursor changes)
- Check z-index of tooltip container
- Verify tooltip content is rendering (React DevTools)

### Performance Issues
- Check data array size
- Consider implementing data sampling for large datasets
- Verify no unnecessary re-renders

## Manual Test Script

```typescript
// Test data for manual testing
const testWorkOrders = [
  {
    id: '1',
    created_at: '2024-01-01',
    partsUsed: [
      { name: 'Brake Pad', quantity: 2 },
      { name: 'Oil Filter', quantity: 1 }
    ]
  },
  {
    id: '2',
    created_at: '2024-01-15',
    partsUsed: [
      { name: 'Brake Pad', quantity: 1 },
      { name: 'Air Filter', quantity: 1 }
    ]
  },
  {
    id: '3',
    created_at: '2024-02-01',
    partsUsed: [
      { name: 'Oil Filter', quantity: 2 },
      { name: 'Spark Plug', quantity: 4 }
    ]
  }
];

// Expected Results:
// MaintenanceCostChart: 3 data points showing cost trend
// ComponentFailureChart: 4 slices (Brake Pad: 3, Oil Filter: 3, Air Filter: 1, Spark Plug: 4)
```

## Sign-off

- [ ] All test cases passed
- [ ] Visual inspection completed
- [ ] Browser testing completed
- [ ] Responsive testing completed
- [ ] Performance acceptable
- [ ] No regressions identified

**Tested By:** _______________  
**Date:** _______________  
**Notes:** _______________
