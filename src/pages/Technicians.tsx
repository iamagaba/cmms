import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { technicians, workOrders } from "@/data/mockData";
import { TechnicianDataTable } from "@/components/TechnicianDataTable";
import { useState } from "react";
import { TechnicianFormDialog } from "@/components/TechnicianFormDialog";

const TechniciansPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // In a real app, this state would be managed by a global state manager or fetched from an API
  const [allTechnicians, setAllTechnicians] = useState(technicians);

  const handleSave = (technicianData) => {
    const exists = allTechnicians.some(t => t.id === technicianData.id);
    if (exists) {
      setAllTechnicians(allTechnicians.map(t => t.id === technicianData.id ? technicianData : t));
    } else {
      setAllTechnicians([...allTechnicians, technicianData]);
    }
  };

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar />
      <div className="flex flex-col">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/40">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold md:text-2xl">Technician Management</h1>
            <Button size="sm" className="gap-1" onClick={() => setIsDialogOpen(true)}>
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add Technician
              </span>
            </Button>
          </div>
          
          <div className="rounded-lg border shadow-sm">
             <TechnicianDataTable initialData={allTechnicians} workOrders={workOrders} />
          </div>
        </main>
      </div>
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