import { useParams, Link, useNavigate } from "react-router-dom";
import { technicians, workOrders, locations } from "@/data/mockData";
import { Avatar, Card, CardContent, Grid, Typography, Chip, Box, Button } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { ArrowBack, Email, Phone, Build, CalendarToday } from "@mui/icons-material";
import dayjs from "dayjs";
import NotFound from "./NotFound";

const statusColorMap: Record<string, "success" | "warning" | "default"> = {
  available: 'success',
  busy: 'warning',
  offline: 'default',
};

const statusTextMap: Record<string, string> = {
    available: 'Available',
    busy: 'Busy',
    offline: 'Offline',
};

const priorityColors: Record<string, "error" | "warning" | "success"> = {
    High: "error",
    Medium: "warning",
    Low: "success",
};

const DetailItem = ({ icon, label, children }: { icon: React.ReactNode, label: string, children: React.ReactNode }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5, px: 2 }}>
    <Box sx={{ color: 'text.secondary' }}>{icon}</Box>
    <Box>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="body2">{children}</Typography>
    </Box>
  </Box>
);

const TechnicianProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const technician = technicians.find(t => t.id === id);
  const assignedWorkOrders = workOrders.filter(wo => wo.assignedTechnicianId === id);

  if (!technician) {
    return <NotFound />;
  }

  const workOrderColumns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 120, renderCell: (params) => <Link to={`/work-orders/${params.value}`}><Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{params.value}</Typography></Link> },
    { field: 'vehicleId', headerName: 'Vehicle', flex: 1 },
    { field: 'priority', headerName: 'Priority', width: 120, renderCell: (params) => <Chip label={params.value} color={priorityColors[params.value]} size="small" /> },
    { field: 'locationId', headerName: 'Location', flex: 1, valueGetter: (params) => locations.find(l => l.id === params.value)?.name || 'N/A' },
    { field: 'slaDue', headerName: 'Due Date', width: 150, valueGetter: (params) => dayjs(params.value).format('MMM D, YYYY') },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/technicians')}>
            Back to Technicians
        </Button>
        <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
                <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                        <Avatar sx={{ width: 128, height: 128, mx: 'auto', mb: 2 }} src={technician.avatar}>{technician.name.split(' ').map(n => n[0]).join('')}</Avatar>
                        <Typography variant="h5" component="h1">{technician.name}</Typography>
                        <Chip label={statusTextMap[technician.status]} color={statusColorMap[technician.status]} sx={{ mt: 1 }} />
                    </CardContent>
                    <DetailItem icon={<Email />} label="Email"><a href={`mailto:${technician.email}`}>{technician.email}</a></DetailItem>
                    <DetailItem icon={<Phone />} label="Phone"><a href={`tel:${technician.phone}`}>{technician.phone}</a></DetailItem>
                    <DetailItem icon={<Build />} label="Specialization">{technician.specialization}</DetailItem>
                    <DetailItem icon={<CalendarToday />} label="Member Since">{dayjs(technician.joinDate).format('MMMM YYYY')}</DetailItem>
                </Card>
            </Grid>
            <Grid item xs={12} md={8}>
                <Card sx={{ height: '100%' }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>Assigned Work Orders ({assignedWorkOrders.length})</Typography>
                        <Box sx={{ height: 500, width: '100%' }}>
                            <DataGrid 
                                rows={assignedWorkOrders} 
                                columns={workOrderColumns} 
                                initialState={{
                                    pagination: {
                                      paginationModel: { page: 0, pageSize: 10 },
                                    },
                                }}
                                pageSizeOptions={[5, 10, 20]}
                            />
                        </Box>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    </Box>
  );
};

export default TechnicianProfilePage;