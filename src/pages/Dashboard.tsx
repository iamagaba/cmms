import { useState } from "react";
import {
  Activity,
  CheckCircle,
  Clock,
  Users,
  Wrench,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import LocationList from "@/components/LocationList";
import TechnicianList from "@/components/TechnicianList";
import WorkOrderKanban from "@/components/WorkOrderKanban";
import { workOrders, locations } from "../data/mockData";

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

  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Overview</h1>
          <ToggleGroup 
            type="single" 
            defaultValue="all" 
            variant="outline"
            value={selectedLocation}
            onValueChange={(value) => value && setSelectedLocation(value)}
          >
            <ToggleGroupItem value="all" className="flex items-center gap-2">
              All Locations <Badge variant="secondary">{workOrders.length}</Badge>
            </ToggleGroupItem>
            {locations.map(loc => (
              <ToggleGroupItem key={loc.id} value={loc.id} className="flex items-center gap-2">
                {loc.name} <Badge variant="secondary">{workOrders.filter(wo => wo.locationId === loc.id).length}</Badge>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Work Orders</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Work Orders</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{openOrders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">SLA Performance</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{slaPerformance}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Completion Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3.2 Days</div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="grid gap-4 md:gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Work Order Board</h2>
          <WorkOrderKanban 
            workOrders={filteredWorkOrders} 
            groupBy="status"
            columns={kanbanColumns}
          />
        </div>
        <div className="flex flex-col gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Team & Locations</h2>
            <div className="flex flex-col gap-4">
              <TechnicianList />
              <LocationList />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;