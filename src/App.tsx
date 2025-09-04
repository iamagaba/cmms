import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { App as AntApp, ConfigProvider, theme } from "antd";
import { LoadScript } from "@react-google-maps/api";
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

const queryClient = new QueryClient();

const API_KEY = import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY || "";
const libraries: ("places")[] = ['places'];

const AppContent = () => {
  const location = useLocation();

  if (location.pathname === "/404" || location.pathname === "*") {
    return (
      <Routes>
        <Route path="*" element={<NotFound />} />
      </Routes>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <AppHeader />
      <main className="flex-grow p-6">
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
      </main>
    </div>
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
          <LoadScript googleMapsApiKey={API_KEY} libraries={libraries}>
            <AppContent />
          </LoadScript>
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  </QueryClientProvider>
);

export default App;