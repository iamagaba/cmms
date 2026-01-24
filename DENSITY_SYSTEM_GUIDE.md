# Density System Guide

## 🎯 What is the Density System?

Your app has a built-in **Density System** that lets you switch between two UI modes:

- **Cozy Mode** (Default) - Larger spacing, easier to read, more comfortable
- **Compact Mode** - Tighter spacing, more information on screen, like shadcn's official site

## 🔄 How to Switch Modes

### On Design System V2 Page
1. Visit: `http://localhost:8081/design-system-v2`
2. Look for the **Density Toggle** in the top-right corner
3. Click **Compact** to see the tighter, denser layout
4. Click **Cozy** to return to the default spacing

### In Your App
The density toggle should be available in your app's header or settings. Look for buttons labeled "Cozy" and "Compact".

## 📊 Visual Comparison

### Cozy Mode (Current Default)
```
Spacing:     Larger (p-6, gap-8, space-y-8)
Card Padding: 24px
Button Height: 40px
Table Rows:   48px
Use Case:     Easier to read, less overwhelming
```

### Compact Mode (Like shadcn.com)
```
Spacing:     Tighter (p-4, gap-4, space-y-4)
Card Padding: 16px
Button Height: 36px
Table Rows:   40px
Use Case:     More data on screen, professional
```

## 🎨 How It Works

The density system uses:
1. **React Context** - `DensityContext` provides the current mode
2. **CSS Data Attribute** - `data-density="compact"` on `<html>`
3. **Tailwind Classes** - Components adjust spacing based on mode
4. **LocalStorage** - Your preference is saved

## 💻 Using Density in Your Components

### Method 1: Use the Hook
```typescript
import { useDensity } from '@/context/DensityContext';

const MyComponent = () => {
  const { densityMode, isCompact } = useDensity();
  
  return (
    <div className={isCompact ? 'p-4' : 'p-6'}>
      Content
    </div>
  );
};
```

### Method 2: Use the Custom Hook
```typescript
import { useDensitySpacing } from '@/hooks/useDensitySpacing';

const MyComponent = () => {
  const spacing = useDensitySpacing();
  
  return (
    <div className={spacing.cardPadding}>
      <div className={spacing.sectionGap}>
        Content
      </div>
    </div>
  );
};
```

### Method 3: CSS Data Attribute
```css
/* In your CSS or Tailwind */
.my-component {
  padding: 24px;
}

[data-density="compact"] .my-component {
  padding: 16px;
}
```

## 📋 Spacing Guidelines

### Cozy Mode Spacing
- **Card Padding**: `p-6` (24px)
- **Section Gap**: `space-y-8` (32px)
- **Card Grid Gap**: `gap-6` (24px)
- **Form Field Gap**: `space-y-4` (16px)
- **Button Padding**: `px-4 py-2` (16px/8px)

### Compact Mode Spacing
- **Card Padding**: `p-4` (16px)
- **Section Gap**: `space-y-4` (16px)
- **Card Grid Gap**: `gap-4` (16px)
- **Form Field Gap**: `space-y-3` (12px)
- **Button Padding**: `px-3 py-1.5` (12px/6px)

## 🎯 When to Use Each Mode

### Use Cozy Mode When:
- Users are new to the system
- Content is text-heavy
- Accessibility is a priority
- Users prefer larger touch targets
- App is used on tablets/touch devices

### Use Compact Mode When:
- Users are power users
- Need to see more data at once
- Working with data tables
- Desktop-only application
- Users prefer information density

## 🔧 Customizing Density

### Add New Density Levels
Edit `src/context/DensityContext.tsx`:
```typescript
export type DensityMode = 'cozy' | 'compact' | 'ultra-compact';
```

### Create Custom Spacing Hook
Edit `src/hooks/useDensitySpacing.ts` to add your own spacing values.

## 📱 Mobile Considerations

On mobile devices, **Cozy mode is recommended** because:
- Larger touch targets (44x44px minimum)
- Easier to tap buttons
- Better readability on small screens
- Less accidental taps

You can force Cozy mode on mobile:
```typescript
const { densityMode } = useDensity();
const isMobile = window.innerWidth < 768;
const effectiveMode = isMobile ? 'cozy' : densityMode;
```

## 🎨 Design System Integration

The Design System V2 page now includes:
- ✅ Density Toggle in the header
- ✅ Visual comparison alert
- ✅ All components respond to density changes
- ✅ Spacing examples for both modes

## 🚀 Quick Tips

1. **Try Compact Mode** - Click the toggle on the Design System V2 page
2. **Compare Side-by-Side** - Open two browser windows with different modes
3. **Check Your Data Tables** - Compact mode shines with data-heavy pages
4. **User Preference** - Let users choose their preferred mode
5. **Persist Choice** - The system automatically saves to localStorage

## 📚 Related Files

- `src/context/DensityContext.tsx` - Density context provider
- `src/hooks/useDensitySpacing.ts` - Spacing utility hook
- `src/components/DensityToggle.tsx` - Toggle component
- `src/components/demo/ShadcnDesignSystem.tsx` - Design system with toggle

---

**Pro Tip**: The compact mode you see on shadcn's official site is similar to your Compact mode. Try it now on the Design System V2 page!
