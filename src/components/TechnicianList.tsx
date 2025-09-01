import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { technicians } from "../data/mockData";
import { cn } from "@/lib/utils";

const statusClasses = {
  available: "bg-green-500 hover:bg-green-600",
  busy: "bg-yellow-500 hover:bg-yellow-600",
  offline: "bg-gray-500 hover:bg-gray-600",
};

const TechnicianList = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Technicians</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {technicians.map(tech => (
            <li key={tech.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={tech.avatar} alt={tech.name} />
                  <AvatarFallback>{tech.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span>{tech.name}</span>
              </div>
              <Badge className={cn("capitalize text-white", statusClasses[tech.status])}>{tech.status}</Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default TechnicianList;