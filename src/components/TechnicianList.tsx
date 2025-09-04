import { technicians } from "../data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const statusClasses: Record<typeof technicians[0]['status'], string> = {
  available: "bg-green-500",
  busy: "bg-yellow-500",
  offline: "bg-gray-400",
};

const TechnicianList = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Technicians</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {technicians.map(tech => (
          <div key={tech.id} className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-9 w-9">
                <AvatarImage src={tech.avatar} alt={tech.name} />
                <AvatarFallback>{tech.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium leading-none">{tech.name}</p>
                <p className="text-sm text-muted-foreground capitalize">{tech.status}</p>
              </div>
            </div>
            <div className={cn("h-2.5 w-2.5 rounded-full", statusClasses[tech.status])} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default TechnicianList;