import { useParams, useNavigate, Link } from "react-router-dom";
import { workOrders, technicians, locations } from "@/data/mockData";
import { Avatar, Button, Card, CardContent, CardHeader, Grid, Box, Chip, Typography, List, ListItem, ListItemText, Divider } from "@mui/material";
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot } from '@mui/lab';
import { ArrowBack, Person, Place, Phone, CalendarToday, Build } from "@mui/icons-material";
import dayjs from "dayjs";
import NotFound from "./NotFound";

const statusColors: Record<string, "info" | "warning" | "secondary" | "success"> = { Open: "info", "In Progress": "warning", "On Hold": "secondary", Completed: "success" };
const priorityColors: Record<string, "error" | "warning" | "success"> = { High: "error", Medium: "warning", Low: "success" };

const API_KEY = import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY || "";

const DetailItem = ({ icon, label, children }: { icon?: React.ReactNode, label: string, children: React.ReactNode }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
      {icon}
      <Typography variant="body2">{label}</Typography>
    </Box>
    <Typography variant="body2" sx={{ textAlign: 'right' }}>{children}</Typography>
  </Box>
);

const WorkOrderDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const workOrder = workOrders.find(wo => wo.id === id);

  if (!workOrder) {
    return <NotFound />;
  }

  const technician = technicians.find(t => t.id === workOrder.assignedTechnicianId);
  const location = locations.find(l => l.id === workOrder.locationId);
  const hasClientLocation = workOrder.customerLat != null && workOrder.customerLng != null;

  const getMapUrl = () => {
    if (!API_KEY) return "";
    
    let markers = [];
    if (location) {
      markers.push(`markers=color:blue%7Clabel:S%7C${location.lat},${location.lng}`);
    }
    if (hasClientLocation) {
      markers.push(`markers=color:orange%7Clabel:C%7C${workOrder.customerLat},${workOrder.customerLng}`);
    }

    if (markers.length === 0) return "";

    return `https://maps.googleapis.com/maps/api/staticmap?size=600x300&maptype=roadmap&${markers.join('&')}&key=${API_KEY}`;
  };

  const mapUrl = getMapUrl();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/work-orders')}>
          Back to Work Orders
        </Button>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5" component="h1" fontWeight="bold">Work Order: {workOrder.id}</Typography>
          <Chip label={workOrder.status} color={statusColors[workOrder.status]} />
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h6">{workOrder.service}</Typography>
                <Typography variant="body2" color="text.secondary" paragraph>{workOrder.serviceNotes}</Typography>
                {workOrder.partsUsed.length > 0 && (
                  <>
                    <Typography variant="subtitle2" sx={{ mt: 2 }}>Parts Used</Typography>
                    <List dense>
                      {workOrder.partsUsed.map(item => (
                        <ListItem key={item.name} disableGutters>
                          <ListItemText primary={item.name} secondary={`Qty: ${item.quantity}`} />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader title="Customer & Vehicle Details" />
              <CardContent>
                <DetailItem label="Customer">{workOrder.customerName}</DetailItem>
                <Divider />
                <DetailItem icon={<Phone fontSize="small" />} label="Phone"><a href={`tel:${workOrder.customerPhone}`}>{workOrder.customerPhone}</a></DetailItem>
                <Divider />
                <DetailItem label="Vehicle ID">{workOrder.vehicleId}</DetailItem>
                <Divider />
                <DetailItem label="Vehicle Model">{workOrder.vehicleModel}</DetailItem>
              </CardContent>
            </Card>
          </Box>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Card>
              <CardHeader title="Details" />
              <CardContent>
                <DetailItem label="Priority"><Chip label={workOrder.priority} color={priorityColors[workOrder.priority]} size="small" /></DetailItem>
                <Divider />
                <DetailItem icon={<CalendarToday fontSize="small" />} label="SLA Due">{dayjs(workOrder.slaDue).format('MMM D, YY h:mm A')}</DetailItem>
                <Divider />
                <DetailItem icon={<Place fontSize="small" />} label="Service Location">{location?.name || 'N/A'}</DetailItem>
                <Divider />
                <DetailItem label="Client Location">
                  {workOrder.customerAddress ? (
                    <Typography variant="body2">{workOrder.customerAddress}</Typography>
                  ) : hasClientLocation ? (
                    `${workOrder.customerLat?.toFixed(4)}, ${workOrder.customerLng?.toFixed(4)}`
                  ) : (
                    <Typography variant="body2" color="text.secondary">Not Captured</Typography>
                  )}
                </DetailItem>
                <Divider />
                <DetailItem icon={<Build fontSize="small" />} label="Assigned To">
                  {technician ? (
                    <Link to={`/technicians/${technician.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 24, height: 24 }} src={technician.avatar}><Person fontSize="small" /></Avatar>
                        {technician.name}
                      </Box>
                    </Link>
                  ) : (
                    <Typography variant="body2" color="text.secondary">Unassigned</Typography>
                  )}
                </DetailItem>
              </CardContent>
            </Card>
            <Card>
              <CardHeader title="Location on Map" />
              <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                {API_KEY ? (
                    mapUrl ? (
                        <img 
                            src={mapUrl} 
                            alt="Map of service and client locations" 
                            style={{ width: '100%', height: 'auto', display: 'block' }} 
                        />
                    ) : <Box sx={{p: 2}}><Typography color="text.secondary">No location data to display.</Typography></Box>
                ) : <Box sx={{p: 2}}><Typography color="text.secondary">Google Maps API Key not configured.</Typography></Box>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader title="Activity Log" />
              <CardContent>
                <Timeline sx={{ p: 0, m: 0 }}>
                  {workOrder.activityLog.map((item, index) => (
                    <TimelineItem key={index}>
                      <TimelineSeparator>
                        <TimelineDot />
                        {index < workOrder.activityLog.length - 1 && <TimelineConnector />}
                      </TimelineSeparator>
                      <TimelineContent>
                        <Typography variant="subtitle2">{item.activity}</Typography>
                        <Typography variant="caption" color="text.secondary">{dayjs(item.timestamp).format('MMM D, YYYY h:mm A')}</Typography>
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default WorkOrderDetailsPage;