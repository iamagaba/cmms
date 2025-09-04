import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Layout, App as AntApp, ConfigProvider, theme } from "antd";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import TechniciansPage from "./pages/Technicians";
import WorkOrdersPage from "./pages/WorkOrders";
import LocationsPage from "./pages/Locations";
import AppHeader from "./components/Header";
import TechnicianProfilePage from "./pages/TechnicianProfile";
import WorkOrderDetailsPage from "./pages/WorkOrderDetails";
import AnalyticsPage from "./pages/Analytics";
import MapViewPage from "./pages/MapView";

const { Content } = Layout;
const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();

  // Hide layout on NotFound page
  if (location.pathname === "/404" || location.pathname === "*") {
    return (
      <Routes>
        <Route path="*" element={<NotFound />} />
      </Routes>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppHeader />
      <Content style={{ padding: '24px' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/technicians" element={<TechniciansPage />} />
          <Route path="/technicians/:id" element={<TechnicianProfilePage />} />
          <Route path="/work-orders" element={<WorkOrdersPage />} />
          <Route path="/work-orders/:id" element={<WorkOrderDetailsPage />} />
          <Route path="/locations" element={<LocationsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/map" element={<MapViewPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Content>
    </Layout>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1677ff',
        },
      }}
    >
      <AntApp>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  </QueryClientProvider>
);

export default App;