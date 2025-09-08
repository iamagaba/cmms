import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Layout, App as AntApp, ConfigProvider, theme } from "antd";
import { LoadScript } from "@react-google-maps/api";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import TechniciansPage from "./pages/Technicians";
import WorkOrdersPage from "./pages/WorkOrders";
import LocationsPage from "./pages/Locations";
import AppHeader from "./components/Header";
import SideNavigation from "./components/SideNavigation";
import TechnicianProfilePage from "./pages/TechnicianProfile";
import WorkOrderDetailsPage from "./pages/WorkOrderDetails";
import AnalyticsPage from "./pages/Analytics";
import MapViewPage from "./pages/MapView";
import SettingsPage from "./pages/Settings";
import { NotificationsProvider } from "./context/NotificationsContext";
import LocationDetailsPage from "./pages/LocationDetails";
import CalendarPage from "./pages/Calendar";
import Login from "./pages/Login";
import { SessionProvider, useSession } from "./context/SessionContext";
import { useState } from "react";
import AssetsPage from "./pages/Assets";
import AssetDetailsPage from "./pages/AssetDetails";
import InventoryPage from "./pages/Inventory";
import CustomersPage from "./pages/Customers";
import CustomerDetailsPage from "./pages/CustomerDetails";

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
  const [collapsed, setCollapsed] = useState(false);

  if (isLoading) return null;
  if (session && location.pathname === "/login") return <Navigate to="/" replace />;

  if (["/404", "*", "/login"].includes(location.pathname)) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f6f7f9' }}>
      <AppHeader />
      <Layout>
        <SideNavigation collapsed={collapsed} onCollapse={setCollapsed} />
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
            <Route path="/map" element={<ProtectedRoute><MapViewPage /></ProtectedRoute>} />
            <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
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
        algorithm: [theme.defaultAlgorithm, theme.compactAlgorithm], // Apply compact algorithm
        token: {
          // Brand & Semantic Colors
          colorPrimary: '#6A0DAD',
          colorSuccess: '#22C55E',
          colorWarning: '#FAAD14',
          colorError: '#FF4D4F',
          colorInfo: '#0052CC',

          // Typography
          fontFamily: 'Lato, sans-serif',
          colorText: '#1f2937',
          colorTextSecondary: '#6b7280',

          // Layout & Spacing - Denser values
          borderRadius: 6, // Sharper corners
          controlHeight: 32, // Smaller inputs, buttons, etc.
          colorBgLayout: '#f6f7f9',
          
          // Borders
          colorBorder: '#e5e7eb',
          colorSplit: '#f3f4f6',
        },
        components: {
          Table: {
            // Reduce padding in table cells for more density
            padding: 12,
            paddingSM: 8,
          },
          Card: {
            // Reduce padding inside cards
            padding: 16,
          },
          Form: {
            // Reduce margin between form items
            itemMarginBottom: 16,
          }
        }
      }}
    >
      <AntApp>
        <BrowserRouter>
          <SessionProvider>
            <NotificationsProvider>
              <LoadScript googleMapsApiKey={API_KEY} libraries={libraries}>
                <AppContent />
              </LoadScript>
            </NotificationsProvider>
          </SessionProvider>
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  </QueryClientProvider>
);

export default App;