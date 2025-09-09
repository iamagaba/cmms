import * as React from "react";
import { Table } from "antd";
import { WorkOrder, Technician, Location, Customer, Vehicle, Profile } from "@/types/supabase";
import { WorkOrderRow, getColumns } from "./WorkOrderTableColumns";

interface WorkOrderDataTableProps {
  workOrders: WorkOrder[];
  technicians: Technician[];
  locations: Location[];
  customers: Customer[];
  vehicles: Vehicle[];
  profiles: Profile[]; // Added profiles prop
  onEdit: (workOrderData: WorkOrder) => void;
  onDelete: (workOrderData: WorkOrder) => void;
  onUpdateWorkOrder: (id: string, updates: Partial<WorkOrder>) => void;
  onViewDetails: (workOrderId: string) => void;
}

export function WorkOrderDataTable({ workOrders, technicians, locations, customers, vehicles, profiles, onEdit, onDelete, onUpdateWorkOrder, onViewDetails }: WorkOrderDataTableProps) {

  const tableData: WorkOrderRow[] = React.useMemo(() => {
    const techMap = new Map(technicians.map(t => [t.id, t]));
    const locMap = new Map(locations.map(l => [l.id, l]));
    const custMap = new Map(customers.map(c => [c.id, c]));
    const vehMap = new Map(vehicles.map(v => [v.id, v]));
    const profileMap = new Map(profiles.map(p => [p.id, p])); // Create profile map

    return workOrders.map(wo => ({
      ...wo,
      technician: wo.assignedTechnicianId ? techMap.get(wo.assignedTechnicianId) : undefined,
      location: wo.locationId ? locMap.get(wo.locationId) : undefined,
      customer: wo.customerId ? custMap.get(wo.customerId) : undefined,
      vehicle: wo.vehicleId ? vehMap.get(wo.vehicleId) : undefined,
      createdByProfile: wo.created_by ? profileMap.get(wo.created_by) : undefined, // Assign createdByProfile
    }));
  }, [workOrders, technicians, locations, customers, vehicles, profiles]);

  const columns = getColumns(onEdit, onDelete, onUpdateWorkOrder, technicians, profiles); // Pass profiles to getColumns

  return (
    <Table
      dataSource={tableData}
      columns={columns}
      rowKey="id"
      size="small"
      pagination={{ pageSize: 10, hideOnSinglePage: true }}
      onRow={(record) => ({
        className: 'lift-on-hover-row',
        onClick: () => onViewDetails(record.id),
      })}
    />
  );
}