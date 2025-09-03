import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { technicians } from "../data/mockData";

const statusVariant: Record<typeof technicians[0]['status'], 'default' | 'secondary' | 'outline'> = {
  available: "default",
  busy: "secondary",
  offline: "outline",
};

const TechnicianList = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Technicians</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        {technicians.map(tech => (
          <div key={tech.id} className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={tech.avatar} />
                <AvatarFallback>{tech.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium leading-none">{tech.name}</p>
                <p className="text-sm text-muted-foreground">{tech.specialization}</p>
              </div>
            </div>
            <Badge variant={statusVariant[tech.status]} className="capitalize">{tech.status}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default TechnicianList;