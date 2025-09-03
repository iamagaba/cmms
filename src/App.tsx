import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
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
import { Toaster } from "@/components/ui/sonner";

const queryClient = new QueryClient();

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
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <AppHeader />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
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
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
    <Toaster />
  </QueryClientProvider>
);

export default App;