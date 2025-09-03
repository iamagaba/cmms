import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package } from "lucide-react"
import { locations, workOrders } from "../data/mockData";

const LocationList = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Locations</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        {locations.map(loc => {
          const orderCount = workOrders.filter(wo => wo.locationId === loc.id).length;
          return (
            <div key={loc.id} className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-muted rounded-md">
                  <Package className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">{loc.name}</p>
                  <p className="text-sm text-muted-foreground">{loc.address}</p>
                </div>
              </div>
              <Badge variant="secondary">{orderCount} Orders</Badge>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default LocationList;