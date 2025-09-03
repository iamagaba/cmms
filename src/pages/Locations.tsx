import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { locations, workOrders, Location } from "@/data/mockData";
import { LocationDataTable } from "@/components/LocationDataTable";
import { LocationFormDialog } from "@/components/LocationFormDialog";
import { Button } from "@/components/ui/button";

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
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Location Management</h1>
        <Button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          Add Location
        </Button>
      </div>
      
      <LocationDataTable 
        initialData={allLocations} 
        workOrders={workOrders} 
      />

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