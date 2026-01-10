# Density System - Quick Reference Card

## 🚀 Quick Start

### Import the Hook
```tsx
import { useDensitySpacing } from '@/hooks/useDensitySpacing';
```

### Use in Component
```tsx
const MyComponent = () => {
  const spacing = useDensitySpacing();
  
  return (
    <div className={spacing.page}>
      <div className={spacing.card}>
        <input className={spacing.input} placeholder="Search..." />
        <button className={spacing.button}>Save</button>
      </div>
    </div>
  );
};
```

---

## 📐 Spacing Values

### Layout
```tsx
spacing.page      // p-2 lg:p-3 (compact) | p-3 lg:p-4 (cozy)
spacing.card      // p-2 (compact) | p-3 lg:p-4 (cozy)
spacing.section   // space-y-2 (compact) | space-y-3 lg:space-y-4 (cozy)
spacing.gap       // gap-2 (compact) | gap-3 lg:gap-4 (cozy)
```

### Form Elements
```tsx
spacing.input         // h-8 px-3 py-1.5 text-xs (compact) | h-10 px-3 py-2 text-sm (cozy)
spacing.button        // h-8 px-3 py-1.5 text-xs (compact) | h-10 px-4 py-2 text-sm (cozy)
spacing.inputHeight   // h-8 (compact) | h-10 (cozy)
spacing.buttonHeight  // h-8 (compact) | h-10 (cozy)
```

### Typography
```tsx
spacing.text.heading     // text-sm font-semibold (compact) | text-base font-semibold (cozy)
spacing.text.body        // text-xs (compact) | text-sm (cozy)
spacing.text.label       // text-[10px] (compact) | text-xs (cozy)
spacing.text.data        // text-xs font-mono (compact) | text-sm font-mono (cozy)
```

### Icons
```tsx
spacing.icon.xs   // 12 (compact) | 14 (cozy)
spacing.icon.sm   // 14 (compact) | 16 (cozy)
spacing.icon.md   // 16 (compact) | 18 (cozy)
spacing.icon.lg   // 18 (compact) | 20 (cozy)
spacing.icon.xl   // 20 (compact) | 24 (cozy)
```

---

## 🎨 CSS Variables

### Available Variables
```css
--density-input-height    /* 32px (compact) | 40px (cozy) */
--density-button-height   /* 32px (compact) | 40px (cozy) */
--density-card-padding    /* 12px (compact) | 16px (cozy) */
--density-section-gap     /* 12px (compact) | 16px (cozy) */
--density-row-height      /* 32px (compact) | 40px (cozy) */
--density-page-padding    /* 12px (compact) | 16px (cozy) */
```

### Usage
```tsx
<input className="[height:var(--density-input-height)]" />
<div style={{ padding: 'var(--density-card-padding)' }} />
```

---

## 🔧 Context API

### Get Density State
```tsx
import { useDensity } from '@/context/DensityContext';

const { isCompact, densityMode, setDensityMode } = useDensity();

// Use in conditional logic
const rowHeight = isCompact ? 'h-8' : 'h-10';
const fontSize = isCompact ? 'text-xs' : 'text-sm';
```

---

## 📊 Common Patterns

### Page Layout
```tsx
const MyPage = () => {
  const spacing = useDensitySpacing();
  
  return (
    <div className={spacing.page}>
      <div className={spacing.section}>
        <h1 className={spacing.text.heading}>Page Title</h1>
        <p className={spacing.text.body}>Description</p>
      </div>
    </div>
  );
};
```

### Card Component
```tsx
const MyCard = () => {
  const spacing = useDensitySpacing();
  
  return (
    <div className={`bg-white border rounded-lg ${spacing.card}`}>
      <h2 className={spacing.text.heading}>Card Title</h2>
      <p className={spacing.text.body}>Card content</p>
    </div>
  );
};
```

### Form
```tsx
const MyForm = () => {
  const spacing = useDensitySpacing();
  
  return (
    <form className={spacing.section}>
      <input 
        className={spacing.input}
        placeholder="Name"
      />
      <input 
        className={spacing.input}
        placeholder="Email"
      />
      <button className={spacing.button}>
        Submit
      </button>
    </form>
  );
};
```

### Data Table
```tsx
const MyTable = () => {
  const spacing = useDensitySpacing();
  const { isCompact } = useDensity();
  
  return (
    <table>
      <thead>
        <tr className={spacing.row}>
          <th className={spacing.text.label}>ID</th>
          <th className={spacing.text.label}>Name</th>
        </tr>
      </thead>
      <tbody>
        {data.map(item => (
          <tr key={item.id} className={spacing.row}>
            <td className={spacing.text.data}>{item.id}</td>
            <td className={spacing.text.body}>{item.name}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
```

### Icon with Density
```tsx
const MyIcon = () => {
  const spacing = useDensitySpacing();
  
  return (
    <HugeiconsIcon 
      icon={SearchIcon} 
      size={spacing.icon.md} 
    />
  );
};
```

---

## 🎯 Best Practices

### ✅ DO
- Use `useDensitySpacing()` for consistent values
- Apply density to all new components
- Test in both Cozy and Compact modes
- Use CSS variables for dynamic styling
- Maintain minimum 32px button heights

### ❌ DON'T
- Hardcode spacing values (use hook instead)
- Go below 10px font size
- Go below 32px button height
- Mix density approaches (pick one)
- Forget to test both modes

---

## 🔍 Debugging

### Check Current Mode
```tsx
const { densityMode, isCompact } = useDensity();
console.log('Current mode:', densityMode); // 'cozy' or 'compact'
console.log('Is compact:', isCompact);     // true or false
```

### Check CSS Variables
```tsx
// In browser console
getComputedStyle(document.documentElement)
  .getPropertyValue('--density-input-height'); // '2rem' or '2.5rem'
```

### Check Data Attribute
```tsx
// In browser console
document.documentElement.getAttribute('data-density'); // 'compact' or 'cozy'
```

---

## 📏 Size Reference

### Compact Mode (Dense)
- Input: 32px (h-8)
- Button: 32px (h-8)
- Row: 32px (h-8)
- Card Padding: 12px (p-3)
- Page Padding: 12px (p-3)
- Font: 12px (text-xs)

### Cozy Mode (Comfortable)
- Input: 40px (h-10)
- Button: 40px (h-10)
- Row: 40px (h-10)
- Card Padding: 16px (p-4)
- Page Padding: 16px (p-4)
- Font: 14px (text-sm)

---

## 🚀 Migration Guide

### Converting Existing Component

**Before:**
```tsx
const MyComponent = () => (
  <div className="p-4">
    <input className="h-10 px-3 py-2 text-sm" />
    <button className="h-10 px-4 py-2 text-sm">Save</button>
  </div>
);
```

**After:**
```tsx
const MyComponent = () => {
  const spacing = useDensitySpacing();
  
  return (
    <div className={spacing.card}>
      <input className={spacing.input} />
      <button className={spacing.button}>Save</button>
    </div>
  );
};
```

---

## 📦 Raw Values (for calculations)

```tsx
const spacing = useDensitySpacing();

spacing.raw.inputHeight    // 32 | 40
spacing.raw.buttonHeight   // 32 | 40
spacing.raw.cardPadding    // 8  | 12
spacing.raw.sectionGap     // 8  | 12
spacing.raw.rowHeight      // 32 | 40
spacing.raw.pagePadding    // 8  | 12
```

**Usage:**
```tsx
const totalHeight = spacing.raw.inputHeight + spacing.raw.cardPadding * 2;
```

---

## 🎨 Component-Specific Overrides

### When You Need Custom Density
```tsx
const MySpecialComponent = () => {
  const { isCompact } = useDensity();
  
  // Custom logic for this component
  const customHeight = isCompact ? 'h-6' : 'h-12';
  const customPadding = isCompact ? 'p-1' : 'p-5';
  
  return (
    <div className={`${customHeight} ${customPadding}`}>
      Special content
    </div>
  );
};
```

---

## 📱 Responsive Considerations

### Desktop Only (≥1024px)
```tsx
// Density only applies on desktop
<div className={`p-4 lg:${spacing.card}`}>
```

### Mobile Override
```tsx
// Always use larger sizes on mobile
<button className={`h-11 lg:${spacing.buttonHeight}`}>
```

---

## ⚡ Performance Tips

1. **Memoize spacing object** (already done in hook)
2. **Use CSS variables** for dynamic values
3. **Avoid inline calculations** (use raw values)
4. **Batch updates** when changing mode

---

## 🔗 Related Files

- Hook: `src/hooks/useDensitySpacing.ts`
- Context: `src/context/DensityContext.tsx`
- CSS: `src/theme/design-system.css`
- Toggle: `src/components/DensityToggle.tsx`

---

## 📚 Documentation

- Full Guide: `PHASE_1_DENSITY_ACTIVATION_COMPLETE.md`
- Visual Guide: `DENSITY_VISUAL_GUIDE.md`
- Summary: `UI_DENSITY_IMPLEMENTATION_SUMMARY.md`
- This Card: `DENSITY_QUICK_REFERENCE.md`

---

**Print this card and keep it handy while developing! 📌**
