import { workOrders, technicians, locations, WorkOrder } from "../data/mockData";
import WorkOrderCard from "./WorkOrderCard";

const columns: WorkOrder['status'][] = ['Open', 'In Progress', 'On Hold', 'Completed'];

const WorkOrderKanban = () => {
  const getColumnOrders = (status: WorkOrder['status']) => {
    return workOrders.filter(order => order.status === status);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {columns.map(status => (
        <div key={status} className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 h-fit">
          <h2 className="font-bold mb-4">{status} ({getColumnOrders(status).length})</h2>
          <div>
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