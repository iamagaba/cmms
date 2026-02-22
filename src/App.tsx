import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import { ErrorProvider } from "./providers/ErrorProvider";
import { ComprehensiveErrorProvider } from "./components/error/ComprehensiveErrorProvider";

import { NotificationsProvider } from "./context/NotificationsContext";
import { SessionProvider, useSession } from "./context/SessionContext";
import { ActiveSystemProvider, useActiveSystem } from "./context/ActiveSystemContext";
import { SystemSettingsProvider } from "./context/SystemSettingsContext";
import { ThemeProvider } from "./providers/ThemeProvider";
import './App.css';
import { RealtimeDataProvider } from "./context/RealtimeDataContext";
import SystemGuard from "./components/auth/SystemGuard";
import { isSupabaseConfigured } from "./integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";

// Lazy-loaded page components
const Dashboard = lazy(() => import("./pages/UnifiedDashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));
const TechniciansPage = lazy(() => import("./pages/Technicians"));
const WorkOrdersPage = lazy(() => import("./pages/WorkOrders"));
const WorkOrderDetailsPage = lazy(() => import("./pages/WorkOrderDetailsEnhanced"));
const SettingsPage = lazy(() => import("./pages/Settings"));
const Login = lazy(() => import("./pages/Login"));
const AssetsPage = lazy(() => import("./pages/Assets"));
const AssetDetailsPage = lazy(() => import("./pages/AssetDetails"));
const CustomersPage = lazy(() => import("./pages/Customers"));
const CustomerDetailsPage = lazy(() => import("./pages/CustomerDetails"));
const InventoryPage = lazy(() => import("./pages/Inventory"));
const LocationsPage = lazy(() => import("./pages/Locations"));
const SchedulingPage = lazy(() => import("./pages/Scheduling"));
const ReportsPage = lazy(() => import("./pages/Reports"));
const ShadcnDesignSystem = lazy(() => import("./components/demo/ShadcnDesignSystem"));

const ChatPage = lazy(() => import("./pages/Chat"));
const TVDashboard = lazy(() => import("./pages/TVDashboard"));
const WhatsAppTest = lazy(() => import("./pages/WhatsAppTest"));
const IconTestPage = lazy(() => import("./pages/IconTestPage"));

// Ticketing system pages
const TicketingDashboard = lazy(() => import("./pages/TicketingDashboard"));
const TicketsPage = lazy(() => import("./pages/Tickets"));

import { WorkOrdersSkeleton } from "./components/skeletons/WorkOrdersSkeleton";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1,
    },
  },
});

const LoadingSkeleton = () => (
  <div className="p-6 space-y-4 animate-pulse">
    <div className="h-2 bg-muted rounded w-full"></div>
    <div className="h-2 bg-muted rounded w-full"></div>
    <div className="h-2 bg-muted rounded w-3/4"></div>
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, isLoading } = useSession();
  if (isLoading) {
    return <LoadingSkeleton />;
  }
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const CMMSRoute = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <SystemGuard requiredSystem="cmms">
      {children}
    </SystemGuard>
  </ProtectedRoute>
);

const TicketingRoute = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <SystemGuard requiredSystem="ticketing">
      {children}
    </SystemGuard>
  </ProtectedRoute>
);

// Layout wrapper that uses Outlet for proper nested routing
const LayoutWrapper = () => {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
};

const suspenseFallback = <LoadingSkeleton />;

const AppContent = () => {
  const { activeSystem } = useActiveSystem();

  return (
    <Routes>
      <Route path="/login" element={<Suspense fallback={suspenseFallback}><Login /></Suspense>} />
      <Route path="/tv" element={<Suspense fallback={suspenseFallback}><ProtectedRoute><TVDashboard /></ProtectedRoute></Suspense>} />
      <Route element={<LayoutWrapper />}>
        <Route index element={<Suspense fallback={suspenseFallback}><ProtectedRoute><Dashboard key={activeSystem} /></ProtectedRoute></Suspense>} />

        {/* CMMS Specific Routes */}
        <Route path="technicians" element={<Suspense fallback={suspenseFallback}><CMMSRoute><TechniciansPage /></CMMSRoute></Suspense>} />
        <Route path="work-orders" element={<Suspense fallback={<WorkOrdersSkeleton />}><CMMSRoute><WorkOrdersPage /></CMMSRoute></Suspense>} />
        <Route path="work-orders/:id" element={<Suspense fallback={suspenseFallback}><CMMSRoute><WorkOrderDetailsPage /></CMMSRoute></Suspense>} />
        <Route path="assets" element={<Suspense fallback={suspenseFallback}><CMMSRoute><AssetsPage /></CMMSRoute></Suspense>} />
        <Route path="assets/:id" element={<Suspense fallback={suspenseFallback}><CMMSRoute><AssetDetailsPage /></CMMSRoute></Suspense>} />
        <Route path="inventory" element={<Suspense fallback={suspenseFallback}><CMMSRoute><InventoryPage /></CMMSRoute></Suspense>} />
        <Route path="locations" element={<Suspense fallback={suspenseFallback}><CMMSRoute><LocationsPage /></CMMSRoute></Suspense>} />
        <Route path="scheduling" element={<Suspense fallback={suspenseFallback}><CMMSRoute><SchedulingPage /></CMMSRoute></Suspense>} />
        <Route path="reports" element={<Suspense fallback={suspenseFallback}><CMMSRoute><ReportsPage /></CMMSRoute></Suspense>} />
        <Route path="settings" element={<Suspense fallback={suspenseFallback}><CMMSRoute><SettingsPage /></CMMSRoute></Suspense>} />

        {/* Customer Care (Ticketing) Specific Routes */}
        <Route path="customer-care" element={<Suspense fallback={suspenseFallback}><TicketingRoute><TicketingDashboard /></TicketingRoute></Suspense>} />
        <Route path="customer-care/tickets" element={<Suspense fallback={suspenseFallback}><TicketingRoute><TicketsPage /></TicketingRoute></Suspense>} />
        <Route path="customer-care/work-orders" element={<Suspense fallback={<WorkOrdersSkeleton />}><TicketingRoute><WorkOrdersPage readOnly /></TicketingRoute></Suspense>} />
        <Route path="customer-care/chat" element={<Suspense fallback={suspenseFallback}><TicketingRoute><ChatPage /></TicketingRoute></Suspense>} />
        <Route path="customer-care/customers" element={<Suspense fallback={suspenseFallback}><TicketingRoute><CustomersPage /></TicketingRoute></Suspense>} />
        <Route path="customer-care/settings" element={<Suspense fallback={suspenseFallback}><TicketingRoute><SettingsPage /></TicketingRoute></Suspense>} />

        {/* Shared / Other Routes */}
        <Route path="customers" element={<Suspense fallback={suspenseFallback}><CMMSRoute><CustomersPage /></CMMSRoute></Suspense>} />
        <Route path="customers/:id" element={<Suspense fallback={suspenseFallback}><CMMSRoute><CustomerDetailsPage /></CMMSRoute></Suspense>} />
        <Route path="design-system-v2" element={<Suspense fallback={suspenseFallback}><ProtectedRoute><ShadcnDesignSystem /></ProtectedRoute></Suspense>} />

        <Route path="whatsapp-test" element={<Suspense fallback={suspenseFallback}><ProtectedRoute><WhatsAppTest /></ProtectedRoute></Suspense>} />
        <Route path="icon-test" element={<Suspense fallback={suspenseFallback}><ProtectedRoute><IconTestPage /></ProtectedRoute></Suspense>} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <ThemeProvider>
        <ComprehensiveErrorProvider
          enableGlobalErrorHandling={true}
          enablePerformanceMonitoring={false}
          enableErrorReporting={true}
          enableErrorDashboard={true}
          maxRetries={3}
          feature="app"
        >
          <ErrorProvider
            enableGlobalErrorHandling={false}
            enablePerformanceMonitoring={false}
            maxRetries={3}
          >
            {isSupabaseConfigured ? (
              <SessionProvider>
                <ActiveSystemProvider>
                  <SystemSettingsProvider>
                    <NotificationsProvider>
                      <RealtimeDataProvider>
                        <AppContent />
                      </RealtimeDataProvider>
                    </NotificationsProvider>
                  </SystemSettingsProvider>
                </ActiveSystemProvider>
              </SessionProvider>
            ) : (
              <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
                <Card className="w-full max-w-xl">
                  <CardHeader>
                    <CardTitle>Setup required</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Supabase environment variables are missing.
                    </p>
                    <div className="text-sm">
                      <div className="font-medium">Add these to your `.env.local`:</div>
                      <div className="mt-2 rounded-md border border-border bg-muted p-3 font-mono text-xs whitespace-pre-wrap">
                        VITE_SUPABASE_URL=...
                        {"\n"}VITE_SUPABASE_PUBLISHABLE_KEY=...
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </ErrorProvider>
        </ComprehensiveErrorProvider>
      </ThemeProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
