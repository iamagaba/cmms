import { technicians, locations, WorkOrder } from "../data/mockData";
import WorkOrderCard from "./WorkOrderCard";
import { Grid, Typography, Chip, Box, Paper, Stack } from "@mui/material";

const statusColors: { [key: string]: string } = {
  Open: "info.main",
  "In Progress": "warning.main",
  "On Hold": "secondary.main",
  Completed: "success.main",
};

const priorityColors: { [key: string]: string } = {
    High: "error.main",
    Medium: "warning.main",
    Low: "success.main",
};

interface KanbanColumn {
    id: string | null;
    title: string;
}

interface WorkOrderKanbanProps {
    workOrders: WorkOrder[];
    groupBy: 'status' | 'priority' | 'assignedTechnicianId';
    columns: KanbanColumn[];
    onUpdateWorkOrder: (id: string, field: keyof WorkOrder, value: any) => void;
}

const WorkOrderKanban = ({ workOrders, groupBy, columns, onUpdateWorkOrder }: WorkOrderKanbanProps) => {
  const getColumnOrders = (columnId: string | null) => {
    return workOrders.filter(order => order[groupBy as keyof WorkOrder] === columnId);
  };

  const getColumnColor = (column: KanbanColumn) => {
    if (groupBy === 'status') {
        return statusColors[column.id as string] || 'primary.main';
    }
    if (groupBy === 'priority') {
        return priorityColors[column.id as string] || 'primary.main';
    }
    return 'primary.main';
  }

  return (
    <Grid container spacing={2} wrap="nowrap" className="hide-scrollbar" sx={{ width: '100%', overflowX: 'auto', pb: 2 }}>
      {columns.map(column => {
        const columnOrders = getColumnOrders(column.id);
        const columnColor = getColumnColor(column);
        return (
            <Grid item key={column.id || 'unassigned'} sx={{ minWidth: 320, width: 320 }}>
                <Paper sx={{ backgroundColor: 'grey.100', height: '100%' }}>
                    <Box sx={{ p: 1.5, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: '4px', height: '16px', backgroundColor: columnColor, borderRadius: '2px' }} />
                            <Typography variant="h6" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{column.title}</Typography>
                        </Box>
                        <Chip label={columnOrders.length} size="small" />
                    </Box>
                    <Box className="hide-scrollbar" sx={{ height: 'calc(100vh - 29rem)', overflowY: 'auto', p: 2 }}>
                        <Stack spacing={2}>
                            {columnOrders.map(order => {
                                const technician = technicians.find(t => t.id === order.assignedTechnicianId);
                                const location = locations.find(l => l.id === order.locationId);
                                return <WorkOrderCard key={order.id} order={order} technician={technician} location={location} onUpdateWorkOrder={onUpdateWorkOrder} />;
                            })}
                        </Stack>
                    </Box>
                </Paper>
            </Grid>
        )
      })}
    </Grid>
  );
};

export default WorkOrderKanban;