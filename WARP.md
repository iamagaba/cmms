# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a **React-based work order management system** built for field service operations (bike/scooter maintenance). The application manages technicians, work orders, assets, customers, inventory, and locations with real-time tracking and emergency bike assignment capabilities.

## Development Commands

### Core Commands
- **Start development server**: `pnpm dev` (runs on localhost:8080)
- **Build for production**: `pnpm build`
- **Build for development**: `pnpm build:dev`
- **Lint code**: `pnpm lint`
- **Preview build**: `pnpm preview`

### Testing
This project does not currently have test scripts configured. When adding tests, follow the pattern of creating test files alongside components.

## Architecture & Code Organization

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Routing**: React Router (routes defined in `src/App.tsx`)
- **State Management**: @tanstack/react-query for server state
- **UI Components**: Ant Design + shadcn/ui + Tailwind CSS
- **Authentication**: Supabase Auth with session management
- **Maps**: Mapbox GL for location services
- **Build Tool**: Vite with SWC

### Directory Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components (DO NOT EDIT)
│   ├── *Dialog.tsx     # Modal/dialog components
│   ├── *DataTable.tsx  # Table components with CRUD operations
│   └── *Card.tsx       # Card display components
├── context/            # React Context providers
│   ├── SessionContext.tsx      # Authentication state
│   ├── NotificationsContext.tsx # App notifications
│   └── SystemSettingsContext.tsx # App settings
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
├── pages/              # Page components (route components)
├── types/              # TypeScript type definitions
│   └── supabase.ts     # Database schema types
└── utils/              # Helper functions
```

### Key Architectural Patterns

#### 1. **Protected Route Pattern**
All routes except `/login` are wrapped in `ProtectedRoute` component that checks session state.

#### 2. **Data Layer Pattern**
- All database interactions use @tanstack/react-query
- Supabase client handles authentication and data fetching
- Snake_case database fields are transformed to camelCase in frontend

#### 3. **Component Organization**
- **DataTable components**: Handle CRUD operations for entities (Assets, Customers, etc.)
- **Dialog/Drawer components**: Modal forms for creating/editing
- **Card components**: Display summary information
- **Context providers**: Wrap App.tsx to provide global state

#### 4. **Emergency Bike System**
Special business logic for emergency bike assignments when work orders exceed time thresholds (6 hours).

### Important Business Logic

#### Work Order Status Flow
```
New → Confirmation → Scheduled → In Progress → Completed
                               ↓
                            On Hold (with reason tracking)
```

#### SLA Timer Management
- Timers start when work begins (`work_started_at`)
- Timers pause when status changes to "On Hold" (`sla_timers_paused_at`)
- Total paused duration tracked in `total_paused_duration_seconds`
- Emergency bike eligibility calculated based on active work time

#### Activity Logging
All work order updates automatically generate activity log entries with timestamps and change descriptions.

## Development Guidelines

### Component Development
- Put new pages in `src/pages/`
- Put reusable components in `src/components/`
- Always update the main page (`src/pages/Index.tsx`) to include new components if they need to be visible
- Use shadcn/ui components when possible (they're already installed)
- Use Tailwind CSS for all styling

### Data Handling
- Use camelCase in frontend code, snake_case in database queries
- Transform data using `snakeToCamelCase` and `camelToSnakeCase` utilities
- Always use @tanstack/react-query for data fetching and caching
- Implement optimistic updates where appropriate

### Authentication
- Check session state using `useSession()` hook
- All protected routes automatically redirect to `/login` if not authenticated
- Session management is handled by `SessionContext`

### Path Aliases
- Use `@/` for imports from `src/` directory (configured in vite.config.ts and tsconfig.json)

### Key Dependencies
- `@supabase/supabase-js`: Database and auth client
- `@tanstack/react-query`: Server state management  
- `mapbox-gl`: Map functionality
- `dayjs`: Date manipulation with plugins (relativeTime, isBetween)
- `lucide-react`: Icon library
- `recharts`: Charts and analytics

## Special Considerations

### Emergency Bike Logic
The system tracks work orders that exceed 6 hours of active work time and flags them for emergency bike assignment. This calculation considers paused time during "On Hold" status.

### Real-time Features
The app uses Supabase's real-time subscriptions in some components. When modifying data, ensure proper cache invalidation with react-query.

### Map Integration
Mapbox integration requires API keys. Location-based features include search, display, and coordinate storage for work orders and locations.

### Responsive Design
The application uses Ant Design's responsive layout system with collapsible navigation. Ensure new components work across device sizes.