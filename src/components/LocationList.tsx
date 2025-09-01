import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { locations } from "../data/mockData";

const LocationList = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Locations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {locations.map(loc => (
            <div key={loc.id} className="flex items-start gap-3">
              <div className="mt-1 bg-muted p-2 rounded-full">
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">{loc.name}</p>
                <p className="text-sm text-muted-foreground">{loc.address}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationList;