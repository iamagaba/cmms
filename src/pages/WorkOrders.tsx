import { useState, useMemo } from "react";
import { PlusCircle, List, LayoutGrid } from "lucide-react";
import { workOrders, technicians, locations, WorkOrder } from "@/data/mockData";
import { WorkOrderDataTable } from "@/components/WorkOrderDataTable";
import { WorkOrderFormDialog } from "@/components/WorkOrderFormDialog";
import WorkOrderKanban from "@/components/WorkOrderKanban";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type GroupByOption = 'status' | 'priority' | 'technician';

const WorkOrdersPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [allWorkOrders, setAllWorkOrders] = useState(workOrders);
  const [view, setView] = useState<'table' | 'kanban'>('table');
  const [groupBy, setGroupBy] = useState<GroupByOption>('status');

  // Filter states
  const [vehicleFilter, setVehicleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [technicianFilter, setTechnicianFilter] = useState<string>("");

  const handleSave = (workOrderData: WorkOrder) => {
    const exists = allWorkOrders.some(wo => wo.id === workOrderData.id);
    if (exists) {
      setAllWorkOrders(allWorkOrders.map(wo => wo.id === workOrderData.id ? workOrderData : wo));
    } else {
      setAllWorkOrders([workOrderData, ...allWorkOrders]);
    }
  };

  const handleDelete = (workOrderData: WorkOrder) => {
    setAllWorkOrders(allWorkOrders.filter(wo => wo.id !== workOrderData.id));
  };

  const filteredWorkOrders = allWorkOrders.filter(wo => {
    const vehicleMatch = wo.vehicleId.toLowerCase().includes(vehicleFilter.toLowerCase());
    const statusMatch = statusFilter ? wo.status === statusFilter : true;
    const priorityMatch = priorityFilter ? wo.priority === priorityFilter : true;
    const technicianMatch = technicianFilter ? wo.assignedTechnicianId === technicianFilter : true;
    return vehicleMatch && statusMatch && priorityMatch && technicianMatch;
  });

  const kanbanColumns = useMemo(() => {
    switch (groupBy) {
      case 'priority':
        return [
          { id: 'High', title: 'High' },
          { id: 'Medium', title: 'Medium' },
          { id: 'Low', title: 'Low' },
        ];
      case 'technician':
        return [
          { id: null, title: 'Unassigned' },
          ...technicians.map(t => ({ id: t.id, title: t.name })),
        ];
      case 'status':
      default:
        return [
          { id: 'Open', title: 'Open' },
          { id: 'In Progress', title: 'In Progress' },
          { id: 'On Hold', title: 'On Hold' },
          { id: 'Completed', title: 'Completed' },
        ];
    }
  }, [groupBy]);

  const groupByField = useMemo(() => {
    if (groupBy === 'technician') return 'assignedTechnicianId';
    return groupBy;
  }, [groupBy]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Work Order Management</h1>
        <div className="flex items-center gap-2">
            <ToggleGroup
                type="single"
                variant="outline"
                value={view}
                onValueChange={(value) => value && setView(value as 'table' | 'kanban')}
            >
                <ToggleGroupItem value="table" aria-label="Table view"><List className="h-4 w-4" /></ToggleGroupItem>
                <ToggleGroupItem value="kanban" aria-label="Kanban view"><LayoutGrid className="h-4 w-4" /></ToggleGroupItem>
            </ToggleGroup>
            <Button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                Add Work Order
            </Button>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <Input
              placeholder="Filter by Vehicle ID..."
              value={vehicleFilter}
              onChange={(e) => setVehicleFilter(e.target.value)}
              className="max-w-sm"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter by Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="On Hold">On Hold</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter by Priority" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={technicianFilter} onValueChange={setTechnicianFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter by Technician" /></SelectTrigger>
              <SelectContent>
                {technicians.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
            {view === 'kanban' && (
              <Select value={groupBy} onValueChange={(value) => setGroupBy(value as GroupByOption)}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Group by..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="status">Group by: Status</SelectItem>
                  <SelectItem value="priority">Group by: Priority</SelectItem>
                  <SelectItem value="technician">Group by: Technician</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {view === 'table' ? (
        <WorkOrderDataTable 
          workOrders={filteredWorkOrders} 
          technicians={technicians} 
          locations={locations} 
          onSave={handleSave}
          onDelete={handleDelete}
        />
      ) : (
        <WorkOrderKanban 
            workOrders={filteredWorkOrders} 
            groupBy={groupByField}
            columns={kanbanColumns}
        />
      )}

      {isDialogOpen && (
        <WorkOrderFormDialog 
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSave={handleSave}
          workOrder={null}
        />
      )}
    </div>
  );
};

export default WorkOrdersPage;