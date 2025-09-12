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
          // Colors from Neptune Design System
          colorPrimary: 'var(--brand-tertiary)', // Main brand color
          colorSuccess: 'var(--tag-completed-text)', // Completed tag text
          colorWarning: 'var(--tag-high-text)', // High priority tag text
          colorError: 'var(--brand-secondary)', // Secondary brand color for errors
          colorInfo: 'var(--brand-tertiary)', // Tertiary brand color for info

          // Neutral colors
          colorText: 'var(--text-primary)',
          colorTextSecondary: 'var(--text-secondary)',
          colorBgLayout: 'var(--neutral-background)',
          colorBgContainer: 'var(--neutral-surface)', // Card, Modal background
          colorBorder: 'var(--neutral-border)',
          colorSplit: 'var(--neutral-border)', // Divider color

          // Typography
          fontFamily: 'var(--font-family-primary)', // Primary font Satoshi
          fontSize: 14, // Base font size for readability

          // Spacing & Border Radius
          borderRadius: 8, // Default border radius (sm)
          borderRadiusLG: 12, // Larger border radius (md)
          borderRadiusSM: 4, // Smaller border radius
          controlHeight: 40, // Standard control height for buttons, inputs

          // Spacing
          marginXXS: 4,
          marginXS: 8,
          marginSM: 12,
          margin: 16,
          marginMD: 20,
          marginLG: 24,
          marginXL: 32,
          marginXXL: 48,
        },
        components: {
          Layout: {
            headerBg: 'var(--neutral-surface)',
            headerPadding: '0 16px',
            headerHeight: 64, // Match HTML header height
            siderBg: 'var(--neutral-surface-accent-bg)', // Sidebar background
          },
          Menu: {
            itemBg: 'transparent',
            itemSelectedBg: 'var(--brand-tertiary)',
            itemSelectedColor: 'var(--text-on-primary)',
            itemHoverBg: 'var(--neutral-surface)',
            itemHoverColor: 'var(--text-primary)',
            itemBorderRadius: 8, // Match corner-radius-sm
            subMenuItemBg: 'transparent',
            itemHeight: 40, // Standard item height
            itemPaddingInline: 12, // Horizontal padding
            // collapsedItemBg: 'transparent', // Removed: Not a valid token
            collapsedIconSize: 20,
            collapsedWidth: 64,
          },
          Card: {
            padding: 20, // Match HTML card padding
            headerBg: 'transparent',
            // headerPadding: '16px 20px', // Removed: Not a valid token type
            borderRadiusLG: 12, // Match corner-radius-md
            boxShadow: 'var(--shadow-soft)',
            borderColor: 'var(--neutral-border)',
          },
          Table: {
            padding: 16,
            paddingSM: 12,
            headerBg: 'var(--neutral-background)',
            headerColor: 'var(--text-secondary)',
            headerBorderRadius: 8,
            rowSelectedBg: 'rgba(91, 73, 233, 0.05)', // Light accent for selected rows
            rowSelectedHoverBg: 'rgba(91, 73, 233, 0.1)',
            borderColor: 'var(--neutral-border)',
            borderRadiusLG: 8,
          },
          Form: {
            itemMarginBottom: 20, // Standard form item margin
            labelColor: 'var(--text-secondary)',
          },
          Input: {
            activeBorderColor: 'var(--state-focus-outline)',
            hoverBorderColor: 'var(--state-focus-outline)',
            // activeShadow: '0 0 0 2px rgba(255, 116, 66, 0.2)', // Removed: Not a valid token
            borderRadius: 8,
          },
          Select: {
            activeBorderColor: 'var(--state-focus-outline)',
            hoverBorderColor: 'var(--state-focus-outline)',
            // activeShadow: '0 0 0 2px rgba(255, 116, 66, 0.2)', // Removed: Not a valid token
            borderRadius: 8,
          },
          Button: {
            borderRadius: 8,
            borderRadiusSM: 6,
            colorPrimary: 'var(--brand-primary)',
            colorPrimaryHover: 'var(--brand-primary)', // Keep primary color on hover
            colorPrimaryActive: 'var(--brand-primary)', // Keep primary color on active
            colorText: 'var(--text-primary)',
            colorTextLightSolid: 'var(--text-on-primary)', // For primary buttons
            colorBorder: 'var(--neutral-border)',
            colorTextDisabled: 'var(--text-secondary)',
            colorBgContainerDisabled: 'var(--neutral-background)',
          },
          Tag: {
            defaultBg: 'var(--neutral-surface-accent-bg)',
            defaultColor: 'var(--text-tag)',
            colorText: 'var(--text-primary)',
          },
          Typography: {
            titleMarginBottom: 0.5,
            titleMarginTop: 0.5,
          },
          Space: {
            size: 16, // Default space size
          },
          Modal: {
            // contentBg: 'var(--neutral-surface)', // Removed: Not a valid token
            headerBg: 'var(--neutral-surface)',
            footerBg: 'var(--neutral-surface)',
            borderRadiusLG: 12,
          },
          Drawer: {
            // contentBg: 'var(--neutral-surface)', // Removed: Not a valid token
            headerBg: 'var(--neutral-surface)',
            footerBg: 'var(--neutral-surface)',
            borderRadiusLG: 12,
          },
          DatePicker: {
            activeBorderColor: 'var(--state-focus-outline)',
            hoverBorderColor: 'var(--state-focus-outline)',
            // activeShadow: '0 0 0 2px rgba(255, 116, 66, 0.2)', // Removed: Not a valid token
            borderRadius: 8,
          },
          Tabs: {
            itemColor: 'var(--text-secondary)',
            itemSelectedColor: 'var(--text-primary)',
            itemHoverColor: 'var(--text-primary)',
            inkBarColor: 'var(--brand-tertiary)',
          },
          Badge: {
            colorText: 'var(--text-on-primary)',
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