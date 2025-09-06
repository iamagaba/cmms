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
import SideNavigation from "./components/SideNavigation"; // Import the new SideNavigation
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
import { useState } from "react"; // Import useState

const { Content } = Layout;
const queryClient = new QueryClient();

const API_KEY = import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY || "";
const libraries: ("places")[] = ['places'];

// A component to protect routes
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, isLoading } = useSession();

  if (isLoading) {
    return null; // Or a loading spinner, handled by SessionProvider
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppContent = () => {
  const location = useLocation();
  const { session, isLoading } = useSession();
  const [collapsed, setCollapsed] = useState(false); // State for sidebar collapse

  // If session is loading, render nothing here as SessionProvider handles the loading state
  if (isLoading) {
    return null;
  }

  // Redirect authenticated users from login page to dashboard
  if (session && location.pathname === "/login") {
    return <Navigate to="/" replace />;
  }

  // Hide layout on NotFound page or Login page
  if (location.pathname === "/404" || location.pathname === "*" || location.pathname === "/login") {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppHeader />
      <Layout> {/* Nested Layout for Sider and Content */}
        <SideNavigation collapsed={collapsed} onCollapse={setCollapsed} />
        <Content style={{ padding: '24px', margin: '0 16px', overflow: 'initial' }}>
          <Routes>
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/technicians" element={<ProtectedRoute><TechniciansPage /></ProtectedRoute>} />
            <Route path="/technicians/:id" element={<ProtectedRoute><TechnicianProfilePage /></ProtectedRoute>} />
            <Route path="/work-orders" element={<ProtectedRoute><WorkOrdersPage /></ProtectedRoute>} />
            <Route path="/work-orders/:id" element={<ProtectedRoute><WorkOrderDetailsPage /></ProtectedRoute>} />
            <Route path="/locations" element={<ProtectedRoute><LocationsPage /></ProtectedRoute>} />
            <Route path="/locations/:id" element={<ProtectedRoute><LocationDetailsPage /></ProtectedRoute>} />
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
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#6A0DAD', // GOGO Brand Purple
          fontFamily: 'Inter, sans-serif',
        },
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