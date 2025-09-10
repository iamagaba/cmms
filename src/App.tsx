import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate, useSearchParams } from "react-router-dom";
import { Layout, App as AntApp, ConfigProvider, theme } from "antd";
import { LoadScript } from "@react-google-maps/api";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import TechniciansPage from "./pages/Technicians";
import WorkOrdersPage from "./pages/WorkOrders";
import LocationsPage from "./pages/Locations";
import SideNavigation from "./components/SideNavigation";
import TechnicianProfilePage from "./pages/TechnicianProfile";
import WorkOrderDetailsPage from "./pages/WorkOrderDetails";
import AnalyticsPage from "./pages/Analytics";
import SettingsPage from "./pages/Settings";
import { NotificationsProvider } from "./context/NotificationsContext";
import LocationDetailsPage from "./pages/LocationDetails";
import Login from "./pages/Login";
import { SessionProvider, useSession } from "./context/SessionContext";
import { useState, useEffect } from "react";
import AssetsPage from "./pages/Assets";
import AssetDetailsPage from "./pages/AssetDetails";
import InventoryPage from "./pages/Inventory";
import CustomersPage from "./pages/Customers";
import CustomerDetailsPage from "./pages/CustomerDetails";
import { SystemSettingsProvider, useSystemSettings } from "./context/SystemSettingsContext";
import CalendarPage from "./pages/Calendar";
import MapViewPage from "./pages/MapView";
import NotificationsPage from "./pages/NotificationsPage";

const { Content } = Layout;
const queryClient = new QueryClient();

const API_KEY = import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY || "";
const libraries: ("places")[] = ['places'];

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

  // Log a warning if Google Maps API key is missing
  useEffect(() => {
    if (!API_KEY) {
      console.warn("Google Maps API Key (VITE_APP_GOOGLE_MAPS_API_KEY) is missing. Map and location search features may not work.");
    }
  }, []);

  if (isLoading) return null;
  if (session && location.pathname === "/login") return <Navigate to="/" replace />;

  const isLoginPage = location.pathname === "/login";

  if (isLoginPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <SideNavigation collapsed={collapsed} onCollapse={setCollapsed} logoUrl={settings.logo_url} />
      <Layout>
        <Content className="fade-in main-content">
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
          fontFamily: 'PolySans Neutral, sans-serif',
          colorText: '#1f2937',
          colorTextSecondary: '#6b7280',
          borderRadius: 6,
          controlHeight: 32,
          colorBgLayout: '#f6f7f9',
          colorBorder: '#e5e7eb',
          colorSplit: '#f3f4f6',
        },
        components: {
          Table: { padding: 12, paddingSM: 8 },
          Card: { padding: 16 },
          Form: { itemMarginBottom: 16 },
          Layout: { headerBg: '#ffffff', headerPadding: '0 24px', headerHeight: 64, siderBg: '#ffffff' },
          Menu: { 
            itemBg: '#ffffff',
            itemSelectedBg: '#E8D9F7', // Lighter purple for selected background
            itemSelectedColor: '#6A0DAD', // Primary color for selected text/icon
            itemHoverBg: '#f0f0f0', // Subtle hover background
            itemHoverColor: '#6A0DAD', // Primary color for hover text/icon
            itemBorderRadius: 6, // Match general border radius
            subMenuItemBg: '#ffffff', // For submenus if any
          }
        }
      }}
    >
      <AntApp>
        <BrowserRouter>
          <SessionProvider>
            <SystemSettingsProvider>
              <NotificationsProvider>
                {API_KEY ? ( // Conditionally render LoadScript if API_KEY exists
                  <LoadScript googleMapsApiKey={API_KEY} libraries={libraries}>
                    <AppContent />
                  </LoadScript>
                ) : (
                  <AppContent /> // Render AppContent directly if API_KEY is missing
                )}
              </NotificationsProvider>
            </SystemSettingsProvider>
          </SessionProvider>
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  </QueryClientProvider>
);

export default App;