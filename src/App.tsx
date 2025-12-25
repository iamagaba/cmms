import { lazy, Suspense, useState, useEffect } from "react";
import { registerServiceWorker } from "@/utils/push";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Layout, App as AntApp, ConfigProvider, Spin } from "antd";
import { antdLightTheme, antdDarkTheme } from "@/theme/palette";
import SideNavigation from "./components/SideNavigation";
import { useLocalStorage } from "@/hooks/useLocalStorage";

import { NotificationsProvider } from "./context/NotificationsContext";
import { SessionProvider, useSession } from "./context/SessionContext";
import { SystemSettingsProvider, useSystemSettings } from "./context/SystemSettingsContext";
import { RealtimeDataProvider } from "@/context/RealtimeDataContext";
import CommandPalette from './components/CommandPalette';

// Lazy-loaded page components
const Dashboard = lazy(() => import("./pages/Dashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));
const TechniciansPage = lazy(() => import("./pages/Technicians"));
const WorkOrdersPage = lazy(() => import("./pages/WorkOrders"));
const LocationsPage = lazy(() => import("./pages/Locations"));
const TechnicianProfilePage = lazy(() => import("./pages/TechnicianProfile"));
const WorkOrderDetailsPage = lazy(() => import("./pages/WorkOrderDetailsEnhanced"));
const AnalyticsPage = lazy(() => import("./pages/Analytics"));
const SettingsPage = lazy(() => import("./pages/Settings"));
const LocationDetailsPage = lazy(() => import("./pages/LocationDetails"));
const Login = lazy(() => import("./pages/Login"));
const AssetsPage = lazy(() => import("./pages/Assets"));
const AssetDetailsPage = lazy(() => import("./pages/AssetDetails"));
const InventoryPage = lazy(() => import("./pages/Inventory"));
const CustomersPage = lazy(() => import("./pages/Customers"));
const CustomerDetailsPage = lazy(() => import("./pages/CustomerDetails"));
const CalendarPage = lazy(() => import("./pages/Calendar"));
const MapViewPage = lazy(() => import("./pages/MapView"));
const SchedulingPage = lazy(() => import("./pages/Scheduling"));

const { Content } = Layout;
const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, isLoading } = useSession();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" tip="Loading session..." />
      </div>
    );
  }
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const AppContent = () => {
  const location = useLocation();
  const { session, isLoading } = useSession();
  const { settings } = useSystemSettings();
  const [collapsed, setCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useLocalStorage('isDarkMode', false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  useEffect(() => {
    // Only register the service worker in production to avoid MIME type errors in Vite dev
    if (import.meta.env.PROD) {
      registerServiceWorker();
    }
  }, []);

  // Pass theme toggle to SideNavigation
  const handleThemeChange = (isDark: boolean) => {
    setIsDarkMode(isDark);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" tip="Initializing..." />
      </div>
    );
  }

  if (session && location.pathname === "/login") {
    return <Navigate to="/" replace />;
  }

  const isLoginPage = location.pathname === "/login";

  const suspenseFallback = (
    <div className="min-h-screen flex items-center justify-center">
      <Spin size="large" />
    </div>
  );

  if (isLoginPage) {
    return (
      <Suspense fallback={suspenseFallback}>
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <ConfigProvider theme={{ ...(isDarkMode ? antdDarkTheme : antdLightTheme), cssVar: true }}>
      <AntApp>
        <Layout style={{ minHeight: '100vh', display: 'flex', flexDirection: 'row' }}>
          <SideNavigation 
            collapsed={collapsed} 
            onCollapse={setCollapsed} 
            logoUrl={settings.logo_url}
            isDarkMode={isDarkMode}
            onThemeChange={handleThemeChange}
          />
          <Layout style={{ marginLeft: collapsed ? 64 : 220, transition: 'margin-left 0.2s', flex: 1 }}>
            {/* <GlobalHeader /> */}
            <Content className="fade-in main-content" style={{ padding: 16, overflow: 'visible' }}>
              {/* Breadcrumb and search bar will be rendered in each page via AppBreadcrumb */}
              <Suspense fallback={suspenseFallback}>
                <Routes>
                  <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/technicians" element={<ProtectedRoute><TechniciansPage /></ProtectedRoute>} />
                  <Route path="/technicians/:id" element={<ProtectedRoute><TechnicianProfilePage /></ProtectedRoute>} />
                  <Route path="/work-orders" element={<ProtectedRoute><WorkOrdersPage /></ProtectedRoute>} />
                  <Route path="/work-orders/:id" element={<ProtectedRoute><WorkOrderDetailsPage /></ProtectedRoute>} />
                  <Route path="/locations" element={<ProtectedRoute><LocationsPage /></ProtectedRoute>} />
                  <Route path="/locations/:id" element={<ProtectedRoute><LocationDetailsPage /></ProtectedRoute>} />
                  <Route path="/assets" element={<ProtectedRoute><AssetsPage /></ProtectedRoute>} />
                  <Route path="/assets/:id" element={<ProtectedRoute><AssetDetailsPage /></ProtectedRoute>} />
                  <Route path="/inventory" element={<ProtectedRoute><InventoryPage /></ProtectedRoute>} />
                  <Route path="/customers" element={<ProtectedRoute><CustomersPage /></ProtectedRoute>} />
                  <Route path="/customers/:id" element={<ProtectedRoute><CustomerDetailsPage /></ProtectedRoute>} />
                  <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                  <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
                  <Route path="/scheduling" element={<ProtectedRoute><SchedulingPage /></ProtectedRoute>} />
                  <Route path="/map-view" element={<ProtectedRoute><MapViewPage /></ProtectedRoute>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </Content>
          </Layout>
        </Layout>
        <CommandPalette open={commandPaletteOpen} setOpen={setCommandPaletteOpen} />
      </AntApp>
    </ConfigProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <SessionProvider>
        <SystemSettingsProvider>
          <NotificationsProvider>
            <RealtimeDataProvider>
              <AppContent />
            </RealtimeDataProvider>
          </NotificationsProvider>
        </SystemSettingsProvider>
      </SessionProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
