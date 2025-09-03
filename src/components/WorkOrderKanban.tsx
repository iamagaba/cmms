import { technicians, locations, WorkOrder } from "../data/mockData";
import WorkOrderCard from "./WorkOrderCard";
import { Badge } from "@/components/ui/badge";

const statusColors: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
  Open: "default",
  "In Progress": "secondary",
  "On Hold": "outline",
  Completed: "default", // Will use custom class for green
};

const priorityColors: { [key: string]: 'default' | 'secondary' | 'destructive' } = {
    High: "destructive",
    Medium: "secondary",
    Low: "default",
};

interface KanbanColumn {
    id: string | null;
    title: string;
}

interface WorkOrderKanbanProps {
    workOrders: WorkOrder[];
    groupBy: 'status' | 'priority' | 'assignedTechnicianId';
    columns: KanbanColumn[];
}

const WorkOrderKanban = ({ workOrders, groupBy, columns }: WorkOrderKanbanProps) => {
  const getColumnOrders = (columnId: string | null) => {
    return workOrders.filter(order => order[groupBy as keyof WorkOrder] === columnId);
  };

  const getColumnBadgeVariant = (column: KanbanColumn) => {
    if (groupBy === 'status') {
        return statusColors[column.id as string] || 'default';
    }
    if (groupBy === 'priority') {
        return priorityColors[column.id as string] || 'default';
    }
    return 'secondary';
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {columns.map(column => {
        const columnOrders = getColumnOrders(column.id);
        const badgeVariant = getColumnBadgeVariant(column);
        return (
            <div key={column.id || 'unassigned'}>
                <div className="flex items-center gap-2 mb-4 pb-2 border-b">
                    <h3 className="font-semibold text-sm whitespace-nowrap overflow-hidden text-ellipsis">{column.title}</h3>
                    <Badge 
                      variant={badgeVariant}
                      className={column.id === 'Completed' ? 'bg-green-100 text-green-800' : ''}
                    >
                      {columnOrders.length}
                    </Badge>
                </div>
                <div className="flex flex-col gap-4 h-[calc(100vh-32rem)] overflow-y-auto p-1">
                    {columnOrders.map(order => {
                      const technician = technicians.find(t => t.id === order.assignedTechnicianId);
                      const location = locations.find(l => l.id === order.locationId);
                      return <WorkOrderCard key={order.id} order={order} technician={technician} location={location} />;
                    })}
                </div>
            </div>
        )
      })}
    </div>
  );
};

export default WorkOrderKanban;