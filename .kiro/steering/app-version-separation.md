---
inclusion: always
---

# Application Isolation Rules

## CRITICAL: Three Separate Applications

This workspace contains **three isolated applications** that must never share code or dependencies:

- **`src/`** - Desktop web (React + Vite)
- **`mobile-web/`** - Mobile web (Next.js PWA)  
- **`mobile/`** - Native mobile (React Native + Expo)

## Mandatory Import Boundaries

**NEVER import across application directories:**

```typescript
// ❌ FORBIDDEN - Will cause build failures
import { Component } from '../mobile-web/components/Component';
import { useHook } from '../../mobile/src/hooks/useHook';
import utils from '@/mobile-web/utils';

// ✅ REQUIRED - Stay within application boundary
import { Component } from '@/components/Component';
import { useHook } from '@/hooks/useHook';
import utils from '@/utils';
```

## Application Characteristics

### Desktop Web (`src/`)
- **UI**: Data tables, hover states, keyboard navigation, complex forms
- **Tech**: Vite + React, Tailwind CSS utility classes
- **Patterns**: Mouse interactions, desktop layouts, multi-column views
- **Styling**: Responsive design with Tailwind breakpoints, custom component variants

### Mobile Web (`mobile-web/`)
- **UI**: Touch gestures, swipe actions, mobile-first responsive
- **Tech**: Next.js, PWA capabilities, Tailwind CSS, offline sync
- **Patterns**: Touch interactions, single-column layouts, haptic feedback
- **Styling**: Mobile-first Tailwind utilities, touch-optimized spacing

### Native Mobile (`mobile/`)
- **UI**: Native components, platform navigation
- **Tech**: React Native + Expo, NativeWind (Tailwind for RN), device APIs
- **Patterns**: Native performance, app store distribution
- **Styling**: NativeWind utilities, platform-specific adaptations

## Tailwind CSS Guidelines

### Shared Design Tokens
While code cannot be shared, **design consistency** should be maintained through:
- **Colors**: Use consistent color palette across all apps
- **Spacing**: Apply uniform spacing scale (4px, 8px, 16px, 24px, etc.)
- **Typography**: Maintain consistent font sizes and line heights
- **Breakpoints**: Align responsive breakpoints where applicable

### Platform-Specific Tailwind Usage

**Desktop (`src/`):**
```css
/* Hover states, focus rings, larger click targets */
hover:bg-blue-600 focus:ring-2 focus:ring-blue-500
/* Multi-column layouts */
grid-cols-3 lg:grid-cols-4
/* Desktop-optimized spacing */
p-6 gap-8
```

**Mobile Web (`mobile-web/`):**
```css
/* Touch-friendly sizing, mobile-first responsive */
min-h-[44px] touch-manipulation
/* Single-column focus */
grid-cols-1 sm:grid-cols-2
/* Mobile-optimized spacing */
p-4 gap-4
```

**Native Mobile (`mobile/`):**
```javascript
// NativeWind syntax for React Native
className="bg-blue-500 p-4 rounded-lg"
// Platform-specific adaptations
className={`p-4 ${Platform.OS === 'ios' ? 'pt-safe' : 'pt-4'}`}
```

## AI Assistant Rules

**BEFORE any file operation:**

1. **Determine target app** from file path:
   - `src/**` → Desktop only
   - `mobile-web/**` → Mobile web only
   - `mobile/**` → Native mobile only

2. **Validate imports** - All must stay within same application directory

3. **Check platform compatibility**:
   - Touch/swipe → Mobile apps only
   - Data tables/hover → Desktop only
   - Native APIs → Native mobile only

4. **Apply appropriate Tailwind patterns**:
   - Desktop: Hover states, focus rings, complex layouts
   - Mobile Web: Touch-friendly sizing, mobile-first responsive
   - Native: NativeWind syntax, platform adaptations

5. **Duplicate rather than share** - Copy code instead of cross-referencing

## Pre-Task Validation

- [ ] Target application identified from file path
- [ ] All imports within application boundary
- [ ] Platform-appropriate patterns used
- [ ] No cross-application dependencies
- [ ] Application can build independently

## Forbidden Patterns

### Code Sharing
- Cross-directory imports (`../mobile-web/`, `../../mobile/`)
- Shared state between applications
- Mobile components in desktop app
- Desktop patterns in mobile apps
- Mixed UI paradigms within single app

### Tailwind Anti-Patterns
- Using desktop hover states in mobile apps
- Applying mobile touch targets to desktop interfaces
- Mixing NativeWind syntax in web applications
- Using web-specific Tailwind classes in React Native
- Inconsistent design tokens across applications

## Recommended Patterns

### Component Duplication Strategy
When similar functionality is needed across apps:

```typescript
// ✅ GOOD - Duplicate with platform-appropriate styling
// Desktop (src/components/Button.tsx)
<button className="px-6 py-2 hover:bg-blue-600 focus:ring-2">

// Mobile Web (mobile-web/components/Button.tsx)  
<button className="px-4 py-3 min-h-[44px] touch-manipulation">

// Native (mobile/components/Button.tsx)
<Pressable className="px-4 py-3 bg-blue-500 rounded-lg">
```

### Design System Consistency
- Maintain visual consistency through shared design tokens
- Document color palette, spacing scale, and typography in each app
- Use consistent naming conventions for similar components
- Align user experience patterns while respecting platform conventions

**STRICT ENFORCEMENT REQUIRED** - Cross-application dependencies break builds and create maintenance issues.