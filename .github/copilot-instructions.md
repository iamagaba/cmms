# AI Assistant Instructions for Hopping Tiger CMMS

This document outlines the key patterns and practices for the Hopping Tiger CMMS (Computerized Maintenance Management System) project to help AI assistants be productive quickly.

## Project Overview

This is a modern React TypeScript application built with Vite for maintenance management. Key characteristics:

- Frontend stack: React + TypeScript + Vite
- UI Library: Ant Design
- Data management: TanStack Query for server state
- Authentication: Supabase Auth
- PWA enabled with service worker support

## Key Architecture Patterns

### Component Organization

1. **Page Components** (`src/pages/`)
   - Lazy-loaded route components
   - Example: `WorkOrdersPage.tsx`, `TechniciansPage.tsx`

2. **Reusable Components** (`src/components/`)
   - Shared UI components following consistent patterns:
   - Props interface defined at top of file
   - Styled with CSS modules or inline styles
   - Example: `WorkOrderCard.tsx`, `StatusChip.tsx`

3. **Context Providers** (`src/context/`)
   - Global state management using React Context
   - Each context has its provider and hook
   - Example: `SessionContext.tsx`, `NotificationsContext.tsx`

### Data Flow

1. Authentication flow handled by `SessionProvider`
2. Protected routes wrapped with `ProtectedRoute` component
3. TanStack Query used for server state management
4. Supabase client for database interactions

## Common Patterns

### Component Structure
```tsx
interface ComponentProps {
  // Props defined at top
}

const Component = ({ prop1, prop2 }: ComponentProps) => {
  // Local styles via theme tokens
  const { token } = useToken();

  // Event handlers
  const handleEvent = () => {
    // Implementation
  };

  return (
    // JSX
  );
};
```

### Status Management
- Use `StatusChip` component for consistent status displays
- Status types defined in `@/types/supabase`
- Status changes handled via dropdown menus

## Development Workflow

1. Development:
   ```bash
   pnpm dev    # Start dev server at :8080
   ```

2. Building:
   ```bash
   pnpm build         # Production build
   pnpm build:dev    # Development build
   ```

3. Linting:
   ```bash
   pnpm lint
   ```

## Common Integration Points

1. **Authentication**
   - Use `useSession()` hook to access auth state
   - Protected routes handled automatically

2. **Service Worker**
   - PWA configuration in `vite.config.ts`
   - Service worker registration in `App.tsx`

3. **Map Integration**
   - Mapbox GL used for location services
   - See `MapboxDisplayMap.tsx` for implementation patterns

## File/Component Naming

- PascalCase for component files: `WorkOrderCard.tsx`
- camelCase for utility files: `useDebounce.ts`
- Kebab-case for CSS modules: `work-order-card.css`
- Test files next to implementation: `Component.test.tsx`

## Project Structure Navigation

Key directories for common tasks:
- `/src/components/` - Reusable UI components
- `/src/context/` - Global state management
- `/src/pages/` - Route components
- `/src/types/` - TypeScript type definitions
- `/src/utils/` - Shared utilities
- `/src/hooks/` - Custom React hooks
- `/public/` - Static assets

## Don't

- Mix Ant Design and shadcn styling approaches
- Access Supabase client directly (use hooks/contexts)
- Add new global state without considering existing contexts
- Skip type definitions for new features