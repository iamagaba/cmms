import { workOrders, technicians, locations, WorkOrder } from "../data/mockData";
import WorkOrderCard from "./WorkOrderCard";

const columns: WorkOrder['status'][] = ['Open', 'In Progress', 'On Hold', 'Completed'];

const statusColors = {
  Open: "border-blue-500",
  "In Progress": "border-yellow-500",
  "On Hold": "border-orange-500",
  Completed: "border-green-500",
};

const WorkOrderKanban = () => {
  const getColumnOrders = (status: WorkOrder['status']) => {
    return workOrders.filter(order => order.status === status);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {columns.map(status => (
        <div key={status}>
          <div className={`flex items-center gap-2 mb-4 pb-2 border-b-2 ${statusColors[status]}`}>
            <h2 className="font-semibold text-lg">{status}</h2>
            <span className="text-sm font-bold bg-muted text-muted-foreground rounded-full px-2 py-0.5">
              {getColumnOrders(status).length}
            </span>
          </div>
          <div className="space-y-4 h-[calc(100vh-22rem)] overflow-y-auto pr-2 -mr-2">
            {getColumnOrders(status).map(order => {
              const technician = technicians.find(t => t.id === order.assignedTechnicianId);
              const location = locations.find(l => l.id === order.locationId);
              return <WorkOrderCard key={order.id} order={order} technician={technician} location={location} />;
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default WorkOrderKanban;