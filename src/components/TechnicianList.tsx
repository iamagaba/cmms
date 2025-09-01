import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { technicians } from "../data/mockData";
import { cn } from "@/lib/utils";

const statusClasses = {
  available: "bg-green-500",
  busy: "bg-yellow-500",
  offline: "bg-gray-500",
};

const TechnicianList = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Technicians</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {technicians.map(tech => (
            <div key={tech.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={tech.avatar} alt={tech.name} />
                  <AvatarFallback>{tech.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{tech.name}</p>
                  <p className="text-sm text-muted-foreground capitalize">{tech.status}</p>
                </div>
              </div>
              <div className={cn("h-2.5 w-2.5 rounded-full", statusClasses[tech.status])} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TechnicianList;