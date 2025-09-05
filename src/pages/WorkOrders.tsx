import { useState, useMemo } from "react";
import { Button, Typography, Box, ToggleButtonGroup, ToggleButton, TextField, Select, Paper, Grid, Accordion, AccordionSummary, AccordionDetails, FormControl, InputLabel, MenuItem, InputAdornment } from "@mui/material";
import { Add, TableView, GridView, FilterList, Search } from "@mui/icons-material";
import { workOrders, technicians, locations, WorkOrder } from "@/data/mockData";
import { WorkOrderDataTable } from "@/components/WorkOrderDataTable";
import { WorkOrderFormDialog } from "@/components/WorkOrderFormDialog";
import WorkOrderKanban from "@/components/WorkOrderKanban";
import { showSuccess } from "@/utils/toast";

type GroupByOption = 'status' | 'priority' | 'technician';

const WorkOrdersPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [allWorkOrders, setAllWorkOrders] = useState(workOrders);
  const [view, setView] = useState<'table' | 'kanban'>('table');
  const [groupBy, setGroupBy] = useState<GroupByOption>('status');

  // Filter states
  const [vehicleFilter, setVehicleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [technicianFilter, setTechnicianFilter] = useState<string>("");

  const handleSave = (workOrderData: WorkOrder) => {
    const exists = allWorkOrders.some(wo => wo.id === workOrderData.id);
    if (exists) {
      setAllWorkOrders(allWorkOrders.map(wo => wo.id === workOrderData.id ? workOrderData : wo));
    } else {
      setAllWorkOrders([workOrderData, ...allWorkOrders]);
    }
    showSuccess(`Work order ${workOrderData.id} has been saved.`);
  };

  const handleDelete = (workOrderData: WorkOrder) => {
    setAllWorkOrders(allWorkOrders.filter(wo => wo.id !== workOrderData.id));
    showSuccess(`Work order ${workOrderData.id} has been deleted.`);
  };

  const handleUpdateWorkOrder = (id: string, field: keyof WorkOrder, value: any) => {
    setAllWorkOrders(prevOrders => 
      prevOrders.map(wo => 
        wo.id === id ? { ...wo, [field]: value } : wo
      )
    );
    showSuccess(`Work order ${id} ${String(field)} updated.`);
  };

  const filteredWorkOrders = allWorkOrders.filter(wo => {
    const vehicleMatch = wo.vehicleId.toLowerCase().includes(vehicleFilter.toLowerCase());
    const statusMatch = statusFilter ? wo.status === statusFilter : true;
    const priorityMatch = priorityFilter ? wo.priority === priorityFilter : true;
    const technicianMatch = technicianFilter ? wo.assignedTechnicianId === technicianFilter : true;
    return vehicleMatch && statusMatch && priorityMatch && technicianMatch;
  });

  const kanbanColumns = useMemo(() => {
    switch (groupBy) {
      case 'priority':
        return [ { id: 'High', title: 'High' }, { id: 'Medium', title: 'Medium' }, { id: 'Low', title: 'Low' } ];
      case 'technician':
        return [ { id: null, title: 'Unassigned' }, ...technicians.map(t => ({ id: t.id, title: t.name })) ];
      case 'status':
      default:
        return [ { id: 'Open', title: 'Open' }, { id: 'In Progress', title: 'In Progress' }, { id: 'On Hold', title: 'On Hold' }, { id: 'Completed', title: 'Completed' } ];
    }
  }, [groupBy]);

  const groupByField = useMemo(() => (groupBy === 'technician' ? 'assignedTechnicianId' : groupBy), [groupBy]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" component="h1" fontWeight="bold">Work Order Management</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <ToggleButtonGroup value={view} exclusive onChange={(e, v) => v && setView(v)} size="small">
            <ToggleButton value="table"><TableView /> Table</ToggleButton>
            <ToggleButton value="kanban"><GridView /> Board</ToggleButton>
          </ToggleButtonGroup>
          <Button variant="contained" startIcon={<Add />} onClick={() => setIsDialogOpen(true)}>Add Work Order</Button>
        </Box>
      </Box>
      
      <Accordion>
        <AccordionSummary expandIcon={<FilterList />}>
          <Typography>Filters & View Options</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} sm={6} md={3}><TextField label="Filter by Vehicle ID..." variant="outlined" size="small" fullWidth onChange={(e) => setVehicleFilter(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }} /></Grid>
            <Grid item xs={12} sm={6} md={2}><FormControl fullWidth size="small"><InputLabel>Status</InputLabel><Select label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><MenuItem value=""><em>All</em></MenuItem><MenuItem value="Open">Open</MenuItem><MenuItem value="In Progress">In Progress</MenuItem><MenuItem value="On Hold">On Hold</MenuItem><MenuItem value="Completed">Completed</MenuItem></Select></FormControl></Grid>
            <Grid item xs={12} sm={6} md={2}><FormControl fullWidth size="small"><InputLabel>Priority</InputLabel><Select label="Priority" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}><MenuItem value=""><em>All</em></MenuItem><MenuItem value="High">High</MenuItem><MenuItem value="Medium">Medium</MenuItem><MenuItem value="Low">Low</MenuItem></Select></FormControl></Grid>
            <Grid item xs={12} sm={6} md={3}><FormControl fullWidth size="small"><InputLabel>Technician</InputLabel><Select label="Technician" value={technicianFilter} onChange={(e) => setTechnicianFilter(e.target.value)}><MenuItem value=""><em>All</em></MenuItem>{technicians.map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}</Select></FormControl></Grid>
            {view === 'kanban' && <Grid item xs={12} sm={6} md={2}><FormControl fullWidth size="small"><InputLabel>Group by</InputLabel><Select label="Group by" value={groupBy} onChange={(e) => setGroupBy(e.target.value as GroupByOption)}><MenuItem value="status">Status</MenuItem><MenuItem value="priority">Priority</MenuItem><MenuItem value="technician">Technician</MenuItem></Select></FormControl></Grid>}
          </Grid>
        </AccordionDetails>
      </Accordion>

      {view === 'table' ? (
        <WorkOrderDataTable workOrders={filteredWorkOrders} technicians={technicians} locations={locations} onSave={handleSave} onDelete={handleDelete} onUpdateWorkOrder={handleUpdateWorkOrder} />
      ) : (
        <WorkOrderKanban workOrders={filteredWorkOrders} groupBy={groupByField} columns={kanbanColumns} onUpdateWorkOrder={handleUpdateWorkOrder} />
      )}

      {isDialogOpen && <WorkOrderFormDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} onSave={handleSave} workOrder={null} />}
    </Box>
  );
};

export default WorkOrdersPage;