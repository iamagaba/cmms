import { useState, useMemo } from "react";
import { WorkOrder, Technician } from "@/types/supabase";

export type GroupByOption = 'status' | 'priority' | 'assignedTechnicianId' | 'technician';

export const useWorkOrderFilters = (allWorkOrders: WorkOrder[], technicians: Technician[]) => {
  const [vehicleFilter, setVehicleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [priorityFilter, setPriorityFilter] = useState<string | undefined>(undefined);
  const [technicianFilter, setTechnicianFilter] = useState<string | undefined>(undefined);
  const [channelFilter, setChannelFilter] = useState<string | undefined>(undefined);
  const [groupBy, setGroupBy] = useState<GroupByOption>('status');

  const filteredWorkOrders = useMemo(() => {
    if (!allWorkOrders) return [];
    
    return allWorkOrders.filter(wo => {
      const vehicleMatch = wo.vehicleId?.toLowerCase().includes(vehicleFilter.toLowerCase()) ?? true;
      const statusMatch = statusFilter ? wo.status === statusFilter : true;
      const priorityMatch = priorityFilter ? wo.priority === priorityFilter : true;
      const technicianMatch = technicianFilter ? wo.assignedTechnicianId === technicianFilter : true;
      const channelMatch = channelFilter ? wo.channel === channelFilter : true;
      
      return vehicleMatch && statusMatch && priorityMatch && technicianMatch && channelMatch;
    });
  }, [allWorkOrders, vehicleFilter, statusFilter, priorityFilter, technicianFilter, channelFilter]);

  const kanbanColumns = useMemo(() => {
    switch (groupBy) {
      case 'priority':
        return [
          { id: 'High', title: 'High' },
          { id: 'Medium', title: 'Medium' },
          { id: 'Low', title: 'Low' }
        ];
      case 'technician':
        return [
          { id: null, title: 'Unassigned' },
          ...(technicians || []).map(t => ({ id: t.id, title: t.name }))
        ];
      case 'status':
      default:
        return [
          { id: 'Open', title: 'Open' },
          { id: 'Confirmation', title: 'Confirmation' },
          { id: 'Ready', title: 'Ready' },
          { id: 'In Progress', title: 'In Progress' },
          { id: 'On Hold', title: 'On Hold' },
          { id: 'Completed', title: 'Completed' }
        ];
    }
  }, [groupBy, technicians]);

  const groupByField = useMemo(() => (
    groupBy === 'technician' ? 'assignedTechnicianId' : groupBy
  ), [groupBy]);

  return {
    // Filter states
    vehicleFilter,
    statusFilter,
    priorityFilter,
    technicianFilter,
    channelFilter,
    groupBy,
    
    // Filter setters
    setVehicleFilter,
    setStatusFilter,
    setPriorityFilter,
    setTechnicianFilter,
    setChannelFilter,
    setGroupBy,
    
    // Computed values
    filteredWorkOrders,
    kanbanColumns,
    groupByField
  };
};