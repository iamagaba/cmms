import { useParams, useNavigate } from "react-router-dom";
import { locations, workOrders, technicians, Technician, WorkOrder } from "@/data/mockData";
import { Avatar, Button, Card, CardContent, Grid, Box, Typography, List, ListItem, ListItemAvatar, ListItemText } from "@mui/material";
import { ArrowBack, Place } from "@mui/icons-material";
import { GoogleMap, MarkerF } from "@react-google-maps/api";
import { WorkOrderDataTable } from "@/components/WorkOrderDataTable";
import NotFound from "./NotFound";
import { useMemo, useState } from "react";
import { showSuccess } from "@/utils/toast";

const containerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '8px',
};

const LocationDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [allWorkOrders, setAllWorkOrders] = useState(workOrders);

  const location = locations.find(loc => loc.id === id);

  const locationWorkOrders = useMemo(() => {
    return allWorkOrders.filter(wo => wo.locationId === id);
  }, [id, allWorkOrders]);

  const locationTechnicians = useMemo(() => {
    const techIds = new Set(locationWorkOrders.map(wo => wo.assignedTechnicianId));
    return technicians.filter(tech => techIds.has(tech.id));
  }, [locationWorkOrders]);

  if (!location) {
    return <NotFound />;
  }
  
  const handleSaveWorkOrder = (workOrderData: typeof workOrders[0]) => {
    const exists = allWorkOrders.some(wo => wo.id === workOrderData.id);
    if (exists) {
      setAllWorkOrders(allWorkOrders.map(wo => wo.id === workOrderData.id ? workOrderData : wo));
    } else {
      setAllWorkOrders([workOrderData, ...allWorkOrders]);
    }
  };

  const handleDeleteWorkOrder = (workOrderData: typeof workOrders[0]) => {
    setAllWorkOrders(allWorkOrders.filter(wo => wo.id !== workOrderData.id));
  };

  const handleUpdateWorkOrder = (id: string, field: keyof WorkOrder, value: any) => {
    setAllWorkOrders(prevOrders =>
      prevOrders.map(wo =>
        wo.id === id ? { ...wo, [field]: value } : wo
      )
    );
    showSuccess(`Work order ${id} ${String(field)} updated.`);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/locations')}>
        Back to Locations
      </Button>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="h1">{location.name}</Typography>
                <Typography color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Place fontSize="small" /> {location.address}
                </Typography>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Technicians On-Site</Typography>
                <List>
                  {locationTechnicians.map((tech: Technician) => (
                    <ListItem key={tech.id} disablePadding>
                      <ListItemAvatar>
                        <Avatar src={tech.avatar} />
                      </ListItemAvatar>
                      <ListItemText
                        primary={<a href={`/technicians/${tech.id}`}>{tech.name}</a>}
                        secondary={tech.specialization}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Box>
        </Grid>
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={{ lat: location.lat, lng: location.lng }}
                zoom={14}
              >
                <MarkerF position={{ lat: location.lat, lng: location.lng }} label="L" />
                {locationTechnicians.map(tech => (
                  <MarkerF key={tech.id} position={{ lat: tech.lat, lng: tech.lng }} icon={{ path: google.maps.SymbolPath.CIRCLE, scale: 5, fillColor: 'blue', fillOpacity: 1, strokeWeight: 0 }} />
                ))}
              </GoogleMap>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Work Orders at {location.name}</Typography>
          <WorkOrderDataTable 
            workOrders={locationWorkOrders}
            technicians={technicians}
            locations={locations}
            onSave={handleSaveWorkOrder}
            onDelete={handleDeleteWorkOrder}
            onUpdateWorkOrder={handleUpdateWorkOrder}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default LocationDetailsPage;