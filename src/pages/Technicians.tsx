import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { technicians, workOrders, Technician } from "@/data/mockData";
import { TechnicianDataTable } from "@/components/TechnicianDataTable";
import { TechnicianFormDialog } from "@/components/TechnicianFormDialog";
import { Button } from "@/components/ui/button";

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
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Technician Management</h1>
        <Button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          Add Technician
        </Button>
      </div>
      
      <TechnicianDataTable initialData={allTechnicians} workOrders={workOrders} />

      {isDialogOpen && (
        <TechnicianFormDialog 
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSave={handleSave}
          technician={null}
        />
      )}
    </div>
  );
};

export default TechniciansPage;