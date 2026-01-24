# Scroll Position Preservation on Density Toggle

## Problem
When toggling between Cozy and Compact density modes, the page would jump to a different section because:
- Content height changes when density changes
- Browser maintains absolute scroll position (pixels from top)
- This causes the viewport to show different content after the toggle

## Solution
Implemented intelligent scroll position preservation that keeps the user focused on the same section when toggling density.

## How It Works

### 1. Anchor Points
Added `data-density-anchor` attribute to all major Card sections in the Design System V2 page:
- Quick Comparison
- Component Usage Guide
- Common CMMS Patterns
- Do's and Don'ts
- Responsive Patterns
- Copywriting Guidelines
- Quick Copy Templates
- Color Palette
- Button Component
- Form Elements
- Badge Component
- Table Component
- Alert Component
- Loading States
- Tabs Component

### 2. Smart Scroll Algorithm
When density changes, the `DensityToggle` component:

1. **Captures Current State**
   - Records current scroll position
   - Calculates viewport center point
   - Identifies all anchor elements on the page

2. **Finds Closest Anchor**
   - Measures distance from each anchor to viewport center
   - Selects the anchor element closest to what user is viewing

3. **Changes Density**
   - Updates the density mode (triggers CSS changes)
   - Waits for DOM to update using `requestAnimationFrame`

4. **Restores Position**
   - Recalculates the position of the closest anchor
   - Scrolls to keep that anchor centered in viewport
   - Uses `behavior: 'instant'` for immediate, smooth repositioning

### 3. Implementation Details

**DensityToggle.tsx**:
```typescript
const handleDensityChange = (newMode: 'cozy' | 'compact') => {
  // Store viewport state
  const scrollY = window.scrollY;
  const viewportHeight = window.innerHeight;
  const viewportCenter = scrollY + (viewportHeight / 2);
  
  // Find closest anchor element
  const elements = document.querySelectorAll('[data-density-anchor]');
  let closestElement: Element | null = null;
  let closestDistance = Infinity;
  
  elements.forEach((element) => {
    const rect = element.getBoundingClientRect();
    const elementCenter = rect.top + scrollY + (rect.height / 2);
    const distance = Math.abs(elementCenter - viewportCenter);
    
    if (distance < closestDistance) {
      closestDistance = distance;
      closestElement = element;
    }
  });
  
  // Change density
  setDensityMode(newMode);
  
  // Restore scroll position after DOM updates
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (closestElement) {
        const rect = closestElement.getBoundingClientRect();
        const elementTop = rect.top + window.scrollY;
        const targetScroll = elementTop - (viewportHeight / 2) + (rect.height / 2);
        window.scrollTo({ top: targetScroll, behavior: 'instant' });
      }
    });
  });
};
```

## Benefits

1. **No Jarring Jumps**: User stays focused on the same content
2. **Easy Comparison**: Can toggle density while viewing a specific component
3. **Better UX**: Smooth, predictable behavior
4. **Floating Button**: Combined with floating FAB, can toggle from anywhere on page

## User Experience

**Before**:
1. User scrolls to "Button Component" section
2. Clicks density toggle
3. Page jumps to "Copywriting Guidelines" section (confusing!)
4. User has to scroll back to find buttons

**After**:
1. User scrolls to "Button Component" section
2. Clicks density toggle
3. Page stays on "Button Component" section
4. User immediately sees the density difference in buttons

## Technical Notes

- Uses `requestAnimationFrame` twice to ensure DOM has fully updated
- `behavior: 'instant'` prevents animation that would be disorienting
- Anchor elements are the major Card sections (not every element)
- Falls back gracefully if no anchors found (maintains current scroll)
- Works with both inline and floating toggle variants

## Files Modified

1. **`src/components/DensityToggle.tsx`**
   - Added `handleDensityChange` function with scroll preservation logic
   - Updated button onClick handlers to use new function

2. **`src/components/demo/ShadcnDesignSystem.tsx`**
   - Added `data-density-anchor` to 15+ major Card sections
   - No other changes needed

---

**Status**: ✅ Complete
**Date**: January 19, 2026
**Impact**: Users can now toggle density while staying focused on the same section
