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
        <ul className="space-y-4">
          {locations.map(loc => (
            <li key={loc.id} className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium">{loc.name}</p>
                <p className="text-sm text-muted-foreground">{loc.address}</p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default LocationList;