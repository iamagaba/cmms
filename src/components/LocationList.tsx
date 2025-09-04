import { locations, workOrders } from "../data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MapPin } from "lucide-react";

const LocationList = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Locations</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {locations.map(loc => {
          const orderCount = workOrders.filter(wo => wo.locationId === loc.id).length;
          return (
            <div key={loc.id} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-9 w-9">
                  <AvatarFallback><MapPin className="h-4 w-4 text-muted-foreground" /></AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium leading-none">{loc.name}</p>
                  <p className="text-sm text-muted-foreground">{loc.address}</p>
                </div>
              </div>
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {orderCount}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default LocationList;