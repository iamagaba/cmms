# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## What this repo is
This repository contains three related apps plus Supabase backend assets:

- Desktop web app (Vite + React) in `src/` (root `package.json`).
- Mobile web app (Next.js) in `mobile-web/`.
- Native mobile app (React Native CLI) in `mobile/`.
- Supabase SQL migrations and Edge Functions in `supabase/`.

## Common development commands

### Desktop web app (root)
Node requirement: `node >= 20` (see root `package.json`).

```bash
npm install
npm run dev        # Vite dev server (see `vite.config.ts`), http://localhost:8080
npm run build      # production build -> `dist/` (see `vercel.json`)
npm run preview    # preview the production build
npm run lint       # eslint
npm test           # vitest (watch mode)
npm run test:coverage  # vitest run --coverage
```

Run a single test file / a single test (Vitest):

```bash
npm test -- src/components/WorkOrderFormDrawer.test.tsx
npm test -- -t "WorkOrderFormDrawer"  # match test name
```

Useful repo scripts:

```bash
npm run build:analyze     # generates `dist/stats.html` and opens bundle visualizer
npm run create-test-user  # creates/updates a Supabase auth user + profile row (requires env vars)

npm run migrate:design-system
npm run migrate:buttons
npm run migrate:colors
npm run migrate:dry-run
```

Environment variables:
- Root `.env` is a template; copy to `.env.local` and fill in required values.
- The Supabase client used by the Vite app requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` (see `src/integrations/supabase/client.ts`).
- Mapbox requires `VITE_APP_MAPBOX_API_KEY` (see `.env` / `.env.example`).

For test-user automation details, see `docs/CREATE_TEST_USER_GUIDE.md`.

### Mobile web app (Next.js) (`mobile-web/`)

```bash
cd mobile-web
npm install
npm run dev         # http://localhost:3002
npm run build
npm run start       # production server on 3002
npm run lint
npm run type-check  # tsc --noEmit
npm test            # vitest
```

Run a single test (Vitest):

```bash
npm test -- src/**/some.test.ts
npm test -- -t "renders" 
```

### Native mobile app (React Native CLI) (`mobile/`)
Node requirement: `node >= 18` (see `mobile/package.json`).

```bash
cd mobile
npm install
npm start          # Metro
npm run android
npm run ios        # macOS only
npm run lint
npm run typecheck  # tsc --noEmit
npm test           # jest
```

Run a single Jest test / pattern:

```bash
npm test -- WorkOrder
npm test -- src/screens/workorders/__tests__/workorders.test.tsx
```

### TestSprite artifacts
`testsprite_tests/` contains TestSprite-generated plans and rerun instructions.
- See `testsprite_tests/HOW_TO_RERUN_TESTS.md` for the current rerun workflow.

### Supabase backend assets
- SQL migrations live in `supabase/migrations/`.
- Edge Functions live in `supabase/functions/`.
- Ad-hoc SQL scripts live in `supabase/sql/`.

A small smoke-test script for Edge Functions exists at `test-automation.js`:

```bash
node test-automation.js
```

(It expects Supabase env vars at runtime; see the script for exact variable names.)

## High-level architecture (desktop web app)

### Entry points and routing
- App entry: `src/main.tsx` mounts `<App />` and imports global styles.
- Top-level composition: `src/App.tsx` wires up:
  - TanStack Query (`QueryClientProvider`).
  - React Router (`BrowserRouter`, nested routes + `Outlet`).
  - Auth/system gating via `ProtectedRoute` + `SystemGuard`.
  - Lazy-loaded page modules under `src/pages/`.

Key route groups:
- CMMS routes (e.g. `/work-orders`, `/assets`, `/technicians`) are wrapped with `SystemGuard requiredSystem="cmms"`.
- Ticketing routes live under `/customer-care/*` and are wrapped with `requiredSystem="ticketing"`.

### Providers and cross-cutting state
`src/App.tsx` wraps the UI with multiple providers. The ones most relevant for feature work are:
- `SessionProvider` (`src/context/SessionContext.tsx`):
  - Reads Supabase auth session and subscribes to auth state changes.
  - Loads the current user profile from the `profiles` table.
- `RealtimeDataProvider` (`src/context/RealtimeDataContext.tsx`):
  - Maintains in-memory “live” work orders and technicians.
  - Subscribes to Supabase realtime (`work_orders`, `technicians`) and refetches/enhances rows with joins.

Supabase client:
- `src/integrations/supabase/client.ts` creates the browser client using `import.meta.env.VITE_SUPABASE_*` and stores the auth token under `storageKey: 'fleet-cmms-auth-token'`.

### UI layout
- `src/components/layout/AppLayout.tsx` is the primary shell:
  - Desktop: `ProfessionalSidebar` + optional `TopBar`.
  - Mobile: a fixed header + drawer + bottom navigation.
  - Keyboard shortcuts include Cmd/Ctrl+K (command palette) and Cmd/Ctrl+? (shortcuts dialog).

### Data access patterns
- Many pages/components read “live” work order/technician lists from `useRealtimeData()`.
- Feature logic is commonly encapsulated in hooks under `src/hooks/`.
- Timeline/activity features use a dedicated data layer under `src/services/`:
  - `src/services/timeline-service.ts`: CRUD + validation around `work_order_activities`.
  - `src/services/realtime-manager.ts`: more robust realtime subscription management (reconnect/backoff/offline queueing) for timeline updates.

### Conventions that are enforced by tooling
Design system rules are enforced by ESLint:
- Root `eslint.config.js` includes `no-restricted-syntax` rules that error on hardcoded Tailwind colors (e.g. `bg-white`, `bg-gray-*`, `text-gray-*`, `bg-red-*`, etc.).
- The rationale and examples live in `CONTRIBUTING.md`, `DEVELOPER_GUIDELINES.md`, and `DESIGN_SYSTEM_GUIDE.md`.

Imports:
- `@/*` maps to `src/*` (see `tsconfig.json` and `vite.config.ts`).
- `vite.config.ts` also aliases several `@mantine/*` modules to local mocks under `src/mocks/`.
