import { useState } from "react";
import { Button, Typography, Box, Grid } from "@mui/material";
import { Add } from "@mui/icons-material";
import { locations, workOrders, Location } from "@/data/mockData";
import { LocationFormDialog } from "@/components/LocationFormDialog";
import { LocationCard } from "@/components/LocationCard";

const LocationsPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [allLocations, setAllLocations] = useState(locations);

  const handleSave = (locationData: Location) => {
    const exists = allLocations.some(l => l.id === locationData.id);
    if (exists) {
      setAllLocations(allLocations.map(l => l.id === locationData.id ? locationData : l));
    } else {
      setAllLocations([...allLocations, locationData]);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" component="h1" fontWeight="bold">Service Locations</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setIsDialogOpen(true)}>
          Add Location
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        {allLocations.map(location => (
          <Grid item key={location.id} xs={12} sm={6} md={4} lg={3}>
            <LocationCard location={location} workOrders={workOrders} />
          </Grid>
        ))}
      </Grid>

      {isDialogOpen && (
        <LocationFormDialog 
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSave={handleSave}
          location={null}
        />
      )}
    </Box>
  );
};

export default LocationsPage;