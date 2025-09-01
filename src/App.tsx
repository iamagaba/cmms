import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Layout, App as AntApp, ConfigProvider, theme } from "antd";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import TechniciansPage from "./pages/Technicians";
import WorkOrdersPage from "./pages/WorkOrders";
import LocationsPage from "./pages/Locations";
import AppSidebar from "./components/Sidebar";
import AppHeader from "./components/Header";
import { useState } from "react";
import TechnicianProfilePage from "./pages/TechnicianProfile";

const { Content } = Layout;
const queryClient = new QueryClient();

const AppContent = () => {
  const [collapsed, setCollapsed] = useState(false);
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
      <AppSidebar collapsed={collapsed} />
      <Layout>
        <AppHeader collapsed={collapsed} setCollapsed={setCollapsed} />
        <Content style={{ margin: '24px 16px', padding: 24, background: '#f0f2f5' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/technicians" element={<TechniciansPage />} />
            <Route path="/technicians/:id" element={<TechnicianProfilePage />} />
            <Route path="/work-orders" element={<WorkOrdersPage />} />
            <Route path="/locations" element={<LocationsPage />} />
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