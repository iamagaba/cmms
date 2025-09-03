import { Link } from "react-router-dom";
import { formatDistanceToNow } from 'date-fns';
import { MapPin, Calendar, User } from "lucide-react";
import { WorkOrder, Technician, Location } from "../data/mockData";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils";

interface WorkOrderCardProps {
  order: WorkOrder;
  technician: Technician | undefined;
  location: Location | undefined;
}

const priorityVariant: Record<WorkOrder['priority'], 'destructive' | 'secondary' | 'default'> = {
  High: "destructive",
  Medium: "secondary",
  Low: "default",
};

const priorityBorder: Record<WorkOrder['priority'], string> = {
  High: "border-destructive",
  Medium: "border-yellow-500",
  Low: "border-transparent",
}

const WorkOrderCard = ({ order, technician, location }: WorkOrderCardProps) => {
  const slaDue = new Date(order.slaDue);
  const isOverdue = slaDue < new Date();

  return (
    <TooltipProvider>
      <Link to={`/work-orders/${order.id}`}>
        <Card className={cn("hover:shadow-md transition-shadow", priorityBorder[order.priority])}>
          <CardHeader className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-base">{order.vehicleId}</CardTitle>
                <CardDescription>{order.customerName} • {order.vehicleModel}</CardDescription>
              </div>
              <Badge variant={priorityVariant[order.priority]}>{order.priority}</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-sm mb-3">{order.service}</p>
            <div className="flex flex-col gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-3 w-3" />
                <span>{location?.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                <Tooltip>
                  <TooltipTrigger>
                    <span className={cn(isOverdue && "text-destructive")}>
                      Due {formatDistanceToNow(slaDue, { addSuffix: true })}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>SLA: {slaDue.toLocaleString()}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={technician?.avatar} />
                <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
              </Avatar>
              <span className="text-xs">{technician?.name || 'Unassigned'}</span>
            </div>
            <span className="text-xs text-muted-foreground">{order.id}</span>
          </CardFooter>
        </Card>
      </Link>
    </TooltipProvider>
  );
};

export default WorkOrderCard;