import { useState } from "react";
import { Grid, Typography, ToggleButtonGroup, ToggleButton, Badge, Box } from "@mui/material";
import KpiCard from "@/components/KpiCard";
import TechnicianStatusList from "@/components/TechnicianStatusList";
import WorkOrderKanban from "@/components/WorkOrderKanban";
import { workOrders, locations, technicians, WorkOrder } from "../data/mockData";
import { CheckCircleOutline, AccessTime, ErrorOutline, Build } from "@mui/icons-material";
import UrgentWorkOrders from "@/components/UrgentWorkOrders";
import { showSuccess } from "@/utils/toast";

// Mock data for sparkline charts
const generateChartData = () => Array.from({ length: 10 }, () => ({ value: Math.floor(Math.random() * 100) }));

const Dashboard = () => {
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [allWorkOrders, setAllWorkOrders] = useState(workOrders);

  const handleUpdateWorkOrder = (id: string, field: keyof WorkOrder, value: any) => {
    setAllWorkOrders(prevOrders =>
      prevOrders.map(wo =>
        wo.id === id ? { ...wo, [field]: value } : wo
      )
    );
    showSuccess(`Work order ${id} ${String(field)} updated.`);
  };

  const handleLocationChange = (event: React.MouseEvent<HTMLElement>, newLocation: string | null) => {
    if (newLocation !== null) {
      setSelectedLocation(newLocation);
    }
  };

  const filteredWorkOrders = selectedLocation === 'all'
    ? allWorkOrders
    : allWorkOrders.filter(wo => wo.locationId === selectedLocation);

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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <UrgentWorkOrders workOrders={allWorkOrders} technicians={technicians} />
      
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h1" fontWeight="bold">
            Overview
          </Typography>
          <ToggleButtonGroup
            value={selectedLocation}
            exclusive
            onChange={handleLocationChange}
            aria-label="location filter"
            size="small"
          >
            <ToggleButton value="all" aria-label="all locations">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                All Locations
                <Badge badgeContent={allWorkOrders.length} color="primary" />
              </Box>
            </ToggleButton>
            {locations.map(loc => (
              <ToggleButton key={loc.id} value={loc.id} aria-label={loc.name}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {loc.name}
                  <Badge badgeContent={allWorkOrders.filter(wo => wo.locationId === loc.id).length} color="primary" />
                </Box>
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} lg={3}>
            <KpiCard title="Total Work Orders" value={totalOrders.toString()} icon={<Build />} trend="+5%" trendDirection="up" chartData={generateChartData()} />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <KpiCard title="Open Work Orders" value={openOrders.toString()} icon={<ErrorOutline />} trend="+3" trendDirection="up" isUpGood={false} chartData={generateChartData()} />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <KpiCard title="SLA Performance" value={`${slaPerformance}%`} icon={<CheckCircleOutline />} trend="+1.2%" trendDirection="up" chartData={generateChartData()} />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <KpiCard title="Avg. Completion Time" value="3.2 Days" icon={<AccessTime />} trend="-0.2 Days" trendDirection="down" isUpGood={false} chartData={generateChartData()} />
          </Grid>
        </Grid>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} xl={8}>
          <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
            Work Order Board
          </Typography>
          <WorkOrderKanban 
            workOrders={filteredWorkOrders} 
            groupBy="status"
            columns={kanbanColumns}
            onUpdateWorkOrder={handleUpdateWorkOrder}
          />
        </Grid>
        <Grid item xs={12} xl={4}>
          <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
            Team Status
          </Typography>
          <TechnicianStatusList />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;