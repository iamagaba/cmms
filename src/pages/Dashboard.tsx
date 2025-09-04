import { useState } from "react";
import { Typography, Segmented, Badge, Space } from "antd";
import KpiCard from "@/components/KpiCard";
import LocationList from "@/components/LocationList";
import TechnicianList from "@/components/TechnicianList";
import WorkOrderKanban from "@/components/WorkOrderKanban";
import { workOrders, locations } from "../data/mockData";
import { Wrench, AlertTriangle, CheckCircle, Clock } from "lucide-react";

const { Title } = Typography;

const Dashboard = () => {
  const [selectedLocation, setSelectedLocation] = useState<string>('all');

  const filteredWorkOrders = selectedLocation === 'all'
    ? workOrders
    : workOrders.filter(wo => wo.locationId === selectedLocation);

  const totalOrders = filteredWorkOrders.length;
  const openOrders = filteredWorkOrders.filter(o => o.status === 'Open' || o.status === 'In Progress').length;
  const completedOrders = filteredWorkOrders.filter(o => o.status === 'Completed').length;
  const slaMet = filteredWorkOrders.filter(o => o.status === 'Completed' && new Date(o.slaDue) >= new Date()).length;
  const slaPerformance = completedOrders > 0 ? ((slaMet / completedOrders) * 100).toFixed(0) : 0;

  const kanbanColumns = [
    { id: 'Open', title: 'Open' },
    { id: 'In Progress', title: 'In Progress' },
    { id: 'On Hold', title: 'On Hold' },
    { id: 'Completed', title: 'Completed' },
  ];

  const locationOptions = [
    { 
      label: (
        <Space>
          <span>All Locations</span>
          <Badge count={workOrders.length} showZero color="#1677ff" />
        </Space>
      ), 
      value: 'all' 
    },
    ...locations.map(loc => {
      const count = workOrders.filter(wo => wo.locationId === loc.id).length;
      return {
        label: (
          <Space>
            <span>{loc.name}</span>
            <Badge count={count} showZero color="#1677ff" />
          </Space>
        ),
        value: loc.id
      }
    })
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex justify-between items-center mb-4">
          <Title level={4} style={{ margin: 0 }}>Overview</Title>
          <Segmented
            options={locationOptions}
            value={selectedLocation}
            onChange={(value) => setSelectedLocation(value as string)}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard title="Total Work Orders" value={totalOrders.toString()} icon={<Wrench className="h-4 w-4" />} />
          <KpiCard title="Open Work Orders" value={openOrders.toString()} icon={<AlertTriangle className="h-4 w-4" />} />
          <KpiCard title="SLA Performance" value={`${slaPerformance}%`} icon={<CheckCircle className="h-4 w-4" />} />
          <KpiCard title="Avg. Completion Time" value="3.2 Days" icon={<Clock className="h-4 w-4" />} />
        </div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Title level={4} className="mb-4">Work Order Board</Title>
          <WorkOrderKanban 
            workOrders={filteredWorkOrders} 
            groupBy="status"
            columns={kanbanColumns}
          />
        </div>
        <div className="md:col-span-1 flex flex-col gap-6">
          <Title level={4} className="mb-0">Team & Locations</Title>
          <TechnicianList />
          <LocationList />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;