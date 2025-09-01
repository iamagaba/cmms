import Header from "@/components/Header";
import KpiCard from "@/components/KpiCard";
import LocationList from "@/components/LocationList";
import Sidebar from "@/components/Sidebar";
import TechnicianList from "@/components/TechnicianList";
import WorkOrderKanban from "@/components/WorkOrderKanban";
import { workOrders } from "../data/mockData";
import { CheckCircle, Clock, AlertCircle, Wrench } from "lucide-react";

const Dashboard = () => {
  const totalOrders = workOrders.length;
  const openOrders = workOrders.filter(o => o.status === 'Open' || o.status === 'In Progress').length;
  const completedOrders = workOrders.filter(o => o.status === 'Completed').length;
  const slaMet = workOrders.filter(o => o.status === 'Completed' && new Date(o.slaDue) >= new Date()).length;
  const slaPerformance = completedOrders > 0 ? ((slaMet / completedOrders) * 100).toFixed(0) : 0;

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar />
      <div className="flex flex-col">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/40">
          <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
            <KpiCard title="Total Work Orders" value={totalOrders.toString()} icon={Wrench} />
            <KpiCard title="Open Work Orders" value={openOrders.toString()} icon={AlertCircle} />
            <KpiCard title="SLA Performance" value={`${slaPerformance}%`} icon={CheckCircle} />
            <KpiCard title="Avg. Completion Time" value="3.2 Days" icon={Clock} />
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
            <div className="xl:col-span-3">
              <WorkOrderKanban />
            </div>
            <div className="space-y-6">
              <TechnicianList />
              <LocationList />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;