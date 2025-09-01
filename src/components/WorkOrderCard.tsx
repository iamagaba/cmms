import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MapPin, Wrench } from "lucide-react";
import { WorkOrder, Technician, Location } from "../data/mockData";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from 'date-fns';

interface WorkOrderCardProps {
  order: WorkOrder;
  technician: Technician | undefined;
  location: Location | undefined;
}

const priorityClasses = {
  High: "bg-red-500 text-white hover:bg-red-600",
  Medium: "bg-yellow-500 text-white hover:bg-yellow-600",
  Low: "bg-green-500 text-white hover:bg-green-600",
};

const WorkOrderCard = ({ order, technician, location }: WorkOrderCardProps) => {
  const slaDue = new Date(order.slaDue);
  const isOverdue = slaDue < new Date();

  return (
    <Card className="mb-4">
      <CardHeader className="p-4">
        <div className="flex justify-between items-start">
          <CardTitle className="text-sm font-bold">{order.vehicleId} - {order.vehicleModel}</CardTitle>
          <Badge className={cn("text-xs", priorityClasses[order.priority])}>{order.priority}</Badge>
        </div>
        <p className="text-xs text-muted-foreground">{order.customerName}</p>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-sm flex items-center gap-2 mb-2">
          <Wrench className="h-4 w-4 text-muted-foreground" />
          {order.service}
        </p>
        <p className="text-sm flex items-center gap-2 mb-4">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          {location?.name}
        </p>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={technician?.avatar} alt={technician?.name} />
              <AvatarFallback>{technician ? technician.name.charAt(0) : 'U'}</AvatarFallback>
            </Avatar>
            <span className="text-xs">{technician?.name || 'Unassigned'}</span>
          </div>
          <Tooltip>
            <TooltipTrigger>
              <p className={`text-xs font-medium ${isOverdue ? 'text-red-500' : 'text-gray-500'}`}>
                SLA: {formatDistanceToNow(slaDue, { addSuffix: true })}
              </p>
            </TooltipTrigger>
            <TooltipContent>
              <p>Due on {slaDue.toLocaleString()}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkOrderCard;