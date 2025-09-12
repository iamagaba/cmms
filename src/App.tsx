import { lazy, Suspense, useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Layout, App as AntApp, ConfigProvider, theme, Spin } from "antd";
import SideNavigation from "./components/SideNavigation";
import { NotificationsProvider } from "./context/NotificationsContext";
import { SessionProvider, useSession } from "./context/SessionContext";
import { SystemSettingsProvider, useSystemSettings } from "./context/SystemSettingsContext";

// Lazy-loaded page components
const Dashboard = lazy(() => import("./pages/Dashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));
const TechniciansPage = lazy(() => import("./pages/Technicians"));
const WorkOrdersPage = lazy(() => import("./pages/WorkOrders"));
const LocationsPage = lazy(() => import("./pages/Locations"));
const TechnicianProfilePage = lazy(() => import("./pages/TechnicianProfile"));
const WorkOrderDetailsPage = lazy(() => import("./pages/WorkOrderDetails"));
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
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));

const { Content } = Layout;
const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, isLoading } = useSession();
  if (isLoading) return null;
  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AppContent = () => {
  const location = useLocation();
  const { session, isLoading } = useSession();
  const { settings } = useSystemSettings();
  const [collapsed, setCollapsed] = useState(false);

  if (isLoading) return null;
  if (session && location.pathname === "/login") return <Navigate to="/" replace />;

  const isLoginPage = location.pathname === "/login";

  const suspenseFallback = (
    <div className="min-h-screen flex items-center justify-center">
      <Spin size="large" tip="Loading page..." />
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
    <Layout style={{ minHeight: '100vh' }}>
      <SideNavigation collapsed={collapsed} onCollapse={setCollapsed} logoUrl={settings.logo_url} />
      <Layout>
        {/* GlobalHeader removed */}
        <Content className="fade-in main-content">
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
              <Route path="/map-view" element={<ProtectedRoute><MapViewPage /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Content>
      </Layout>
    </Layout>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ConfigProvider
      theme={{
        algorithm: [theme.defaultAlgorithm, theme.compactAlgorithm],
        token: {
          colorPrimary: '#6A0DAD',
          colorSuccess: '#22C55E',
          colorWarning: '#FAAD14',
          colorError: '#FF4D4F',
          colorInfo: '#0052CC',
          fontFamily: 'Inter',
          colorText: '#1f2937',
          colorTextSecondary: '#6b7280',
          borderRadius: 4,
          controlHeight: 24, // Further reduced control height
          colorBgLayout: '#f6f7f9',
          colorBorder: '#e5e7eb',
          colorSplit: '#f3f4f6',
          fontSize: 12, // Slightly smaller base font size for density
        },
        components: {
          Table: { 
            padding: 8, // Reduced table padding
            paddingSM: 4, // Reduced small table padding
            rowSelectedBg: '#f5f5f5',
            rowSelectedHoverBg: '#eeeeee',
          },
          Card: { padding: 8 }, // Reduced card padding
          Form: { itemMarginBottom: 8 }, // Reduced form item margin
          Layout: { headerBg: '#ffffff', headerPadding: '0 12px', headerHeight: 48, siderBg: '#ffffff' }, // Reduced header height and padding
          Menu: { 
            itemBg: '#ffffff',
            itemSelectedBg: '#E8D9F7',
            itemSelectedColor: '#6A0DAD',
            itemHoverBg: '#f0f0f0',
            itemHoverColor: '#6A0DAD',
            itemBorderRadius: 4,
            subMenuItemBg: '#ffffff',
            itemHeight: 32, // Reduced menu item height
            itemPaddingInline: 4, // Reduced horizontal padding for menu items
          },
          Typography: {
            titleMarginBottom: 0.25, // Further reduce margin below titles
            titleMarginTop: 0.25, // Further reduce margin above titles
          },
          Space: {
            size: 4, // Set a smaller default gap for Space component
          }
        }
      }}
    >
      <AntApp>
        <BrowserRouter>
          <SessionProvider>
            <SystemSettingsProvider>
              <NotificationsProvider>
                <AppContent />
              </NotificationsProvider>
            </SystemSettingsProvider>
          </SessionProvider>
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  </QueryClientProvider>
);

export default App;