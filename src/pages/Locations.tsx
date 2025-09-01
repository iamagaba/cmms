import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { locations, workOrders } from "@/data/mockData";
import { LocationDataTable } from "@/components/LocationDataTable";
import { useState } from "react";
import { LocationFormDialog } from "@/components/LocationFormDialog";
import { Location } from "@/data/mockData";

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
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar />
      <div className="flex flex-col">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/40">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold md:text-2xl">Location Management</h1>
            <Button size="sm" className="gap-1" onClick={() => setIsDialogOpen(true)}>
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add Location
              </span>
            </Button>
          </div>
          
          <LocationDataTable 
            initialData={allLocations} 
            workOrders={workOrders} 
          />
        </main>
      </div>
      {isDialogOpen && (
        <LocationFormDialog 
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSave={handleSave}
          location={null}
        />
      )}
    </div>
  );
};

export default LocationsPage;