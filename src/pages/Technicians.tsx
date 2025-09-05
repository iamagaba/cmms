import { useState } from "react";
import { Button, Typography, Box } from "@mui/material";
import { Add } from "@mui/icons-material";
import { technicians, workOrders, Technician } from "@/data/mockData";
import { TechnicianDataTable } from "@/components/TechnicianDataTable";
import { TechnicianFormDialog } from "@/components/TechnicianFormDialog";

const TechniciansPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [allTechnicians, setAllTechnicians] = useState(technicians);

  const handleSave = (technicianData: Technician) => {
    const exists = allTechnicians.some(t => t.id === technicianData.id);
    if (exists) {
      setAllTechnicians(allTechnicians.map(t => t.id === technicianData.id ? technicianData : t));
    } else {
      setAllTechnicians([...allTechnicians, technicianData]);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" component="h1" fontWeight="bold">
          Technician Management
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setIsDialogOpen(true)}>
          Add Technician
        </Button>
      </Box>
      
      <TechnicianDataTable initialData={allTechnicians} workOrders={workOrders} />

      {isDialogOpen && (
        <TechnicianFormDialog 
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSave={handleSave}
          technician={null}
        />
      )}
    </Box>
  );
};

export default TechniciansPage;