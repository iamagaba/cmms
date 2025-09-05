import * as React from "react";
import { Table } from "antd";
import { WorkOrder, Technician, Location } from "@/types/supabase";
import { WorkOrderRow, getColumns } from "./WorkOrderTableColumns";

interface WorkOrderDataTableProps {
  workOrders: WorkOrder[];
  technicians: Technician[];
  locations: Location[];
  onEdit: (workOrderData: WorkOrder) => void;
  onDelete: (workOrderData: WorkOrder) => void;
  onUpdateWorkOrder: (id: string, updates: Partial<WorkOrder>) => void;
}

export function WorkOrderDataTable({ workOrders, technicians, locations, onEdit, onDelete, onUpdateWorkOrder }: WorkOrderDataTableProps) {

  const tableData: WorkOrderRow[] = React.useMemo(() => {
    return workOrders.map(wo => ({
      ...wo,
      technician: technicians.find(t => t.id === wo.assignedTechnicianId),
      location: locations.find(l => l.id === wo.locationId),
    }));
  }, [workOrders, technicians, locations]);

  const columns = getColumns(onEdit, onDelete, onUpdateWorkOrder, technicians);

  return (
    <Table
      dataSource={tableData}
      columns={columns}
      rowKey="id"
      pagination={{ pageSize: 10, hideOnSinglePage: true }}
      onRow={() => ({
        className: 'lift-on-hover-row'
      })}
    />
  );
}