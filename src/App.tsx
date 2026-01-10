import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import AppLayout from "./components/layout/AppLayout";
import { ErrorProvider } from "./providers/ErrorProvider";
import { ComprehensiveErrorProvider } from "./components/error/ComprehensiveErrorProvider";

import { NotificationsProvider } from "./context/NotificationsContext";
import { SessionProvider, useSession } from "./context/SessionContext";
import { SystemSettingsProvider } from "./context/SystemSettingsContext";
import { RealtimeDataProvider } from "@/context/RealtimeDataContext";
import { DensityProvider } from "@/context/DensityContext";
import './App.css';
import './styles/industrial-theme.css';

// Create a minimal MUI theme for MUI X Charts
const muiTheme = createTheme({
  palette: {
    mode: 'light',
  },
});


// Mobile components removed - they should only be used in mobile-web/ directory

// Lazy-loaded page components
const Dashboard = lazy(() => import("./pages/ProfessionalCMMSDashboard"));
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
const DesignSystemDemo = lazy(() => import("./components/demo/DesignSystemDemo"));
const ChatPage = lazy(() => import("./pages/Chat"));
const TVDashboard = lazy(() => import("./pages/TVDashboard"));
const WhatsAppTest = lazy(() => import("./pages/WhatsAppTest"));
const IconTestPage = lazy(() => import("./pages/IconTestPage"));

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
    <div className="h-2 bg-gray-200 rounded w-full"></div>
    <div className="h-2 bg-gray-200 rounded w-full"></div>
    <div className="h-2 bg-gray-200 rounded w-3/4"></div>
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
  return (
    <Routes>
      <Route path="/login" element={<Suspense fallback={suspenseFallback}><Login /></Suspense>} />
      <Route path="/tv" element={<Suspense fallback={suspenseFallback}><ProtectedRoute><TVDashboard /></ProtectedRoute></Suspense>} />
      <Route element={<LayoutWrapper />}>
        <Route index element={<Suspense fallback={suspenseFallback}><ProtectedRoute><Dashboard /></ProtectedRoute></Suspense>} />
        <Route path="technicians" element={<Suspense fallback={suspenseFallback}><ProtectedRoute><TechniciansPage /></ProtectedRoute></Suspense>} />
        <Route path="work-orders" element={<Suspense fallback={suspenseFallback}><ProtectedRoute><WorkOrdersPage /></ProtectedRoute></Suspense>} />
        <Route path="work-orders/:id" element={<Suspense fallback={suspenseFallback}><ProtectedRoute><WorkOrderDetailsPage /></ProtectedRoute></Suspense>} />
        <Route path="assets" element={<Suspense fallback={suspenseFallback}><ProtectedRoute><AssetsPage /></ProtectedRoute></Suspense>} />
        <Route path="assets/:id" element={<Suspense fallback={suspenseFallback}><ProtectedRoute><AssetDetailsPage /></ProtectedRoute></Suspense>} />
        <Route path="customers" element={<Suspense fallback={suspenseFallback}><ProtectedRoute><CustomersPage /></ProtectedRoute></Suspense>} />
        <Route path="customers/:id" element={<Suspense fallback={suspenseFallback}><ProtectedRoute><CustomerDetailsPage /></ProtectedRoute></Suspense>} />
        <Route path="inventory" element={<Suspense fallback={suspenseFallback}><ProtectedRoute><InventoryPage /></ProtectedRoute></Suspense>} />
        <Route path="locations" element={<Suspense fallback={suspenseFallback}><ProtectedRoute><LocationsPage /></ProtectedRoute></Suspense>} />
        <Route path="scheduling" element={<Suspense fallback={suspenseFallback}><ProtectedRoute><SchedulingPage /></ProtectedRoute></Suspense>} />
        <Route path="reports" element={<Suspense fallback={suspenseFallback}><ProtectedRoute><ReportsPage /></ProtectedRoute></Suspense>} />
        <Route path="chat" element={<Suspense fallback={suspenseFallback}><ProtectedRoute><ChatPage /></ProtectedRoute></Suspense>} />
        <Route path="settings" element={<Suspense fallback={suspenseFallback}><ProtectedRoute><SettingsPage /></ProtectedRoute></Suspense>} />
        <Route path="design-system" element={<Suspense fallback={suspenseFallback}><ProtectedRoute><DesignSystemDemo /></ProtectedRoute></Suspense>} />
        <Route path="whatsapp-test" element={<Suspense fallback={suspenseFallback}><ProtectedRoute><WhatsAppTest /></ProtectedRoute></Suspense>} />
        <Route path="icon-test" element={<Suspense fallback={suspenseFallback}><ProtectedRoute><IconTestPage /></ProtectedRoute></Suspense>} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

const App = () => (
  <MuiThemeProvider theme={muiTheme}>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
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
            <SessionProvider>
              <SystemSettingsProvider>
                <NotificationsProvider>
                  <RealtimeDataProvider>
                    <DensityProvider>
                      <AppContent />
                    </DensityProvider>
                  </RealtimeDataProvider>
                </NotificationsProvider>
              </SystemSettingsProvider>
            </SessionProvider>
          </ErrorProvider>
        </ComprehensiveErrorProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </MuiThemeProvider>
);

export default App;
