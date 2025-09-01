import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MapPin, Calendar } from "lucide-react";
import { WorkOrder, Technician, Location } from "../data/mockData";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from 'date-fns';

interface WorkOrderCardProps {
  order: WorkOrder;
  technician: Technician | undefined;
  location: Location | undefined;
}

const priorityClasses = {
  High: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800",
  Medium: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800",
  Low: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800",
};

const priorityBorderClasses = {
  High: "border-l-4 border-l-red-500",
  Medium: "border-l-4 border-l-yellow-500",
  Low: "border-l-4 border-l-transparent",
}

const WorkOrderCard = ({ order, technician, location }: WorkOrderCardProps) => {
  const slaDue = new Date(order.slaDue);
  const isOverdue = slaDue < new Date();

  return (
    <Card className={cn("hover:shadow-lg transition-shadow", priorityBorderClasses[order.priority])}>
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-base font-bold leading-tight">{order.vehicleId}</CardTitle>
          <Badge variant="outline" className={cn("text-xs shrink-0", priorityClasses[order.priority])}>{order.priority}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{order.customerName} • {order.vehicleModel}</p>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <p className="text-sm font-medium mb-3">{order.service}</p>
        <div className="text-xs text-muted-foreground space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-3 w-3" />
            <span>{location?.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3" />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <span className={cn(isOverdue && "text-destructive font-semibold")}>
                    Due {formatDistanceToNow(slaDue, { addSuffix: true })}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>SLA: {slaDue.toLocaleString()}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={technician?.avatar} alt={technician?.name} />
            <AvatarFallback className="text-xs">{technician ? technician.name.split(' ').map(n => n[0]).join('') : 'U'}</AvatarFallback>
          </Avatar>
          <span className="text-xs font-medium">{technician?.name || 'Unassigned'}</span>
        </div>
        <span className="text-xs text-muted-foreground">{order.id}</span>
      </CardFooter>
    </Card>
  );
};

export default WorkOrderCard;