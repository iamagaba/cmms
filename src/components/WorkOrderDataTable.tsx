import * as React from "react";
import { Table } from "antd";
import { WorkOrder, Technician, Location } from "@/data/mockData";
import { WorkOrderRow, getColumns } from "./WorkOrderTableColumns";
import { WorkOrderFormDialog } from "./WorkOrderFormDialog";

interface WorkOrderDataTableProps {
  workOrders: WorkOrder[];
  technicians: Technician[];
  locations: Location[];
  onSave: (workOrderData: WorkOrder) => void;
  onDelete: (workOrderData: WorkOrder) => void;
}

export function WorkOrderDataTable({ workOrders, technicians, locations, onSave, onDelete }: WorkOrderDataTableProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingWorkOrder, setEditingWorkOrder] = React.useState<WorkOrder | null>(null);

  const tableData: WorkOrderRow[] = React.useMemo(() => {
    return workOrders.map(wo => ({
      ...wo,
      technician: technicians.find(t => t.id === wo.assignedTechnicianId),
      location: locations.find(l => l.id === wo.locationId),
    }));
  }, [workOrders, technicians, locations]);

  const handleSaveDialog = (workOrderData: WorkOrder) => {
    onSave(workOrderData);
    setIsDialogOpen(false);
    setEditingWorkOrder(null);
  };

  const handleEdit = (record: WorkOrderRow) => {
    setEditingWorkOrder(record);
    setIsDialogOpen(true);
  };

  const handleDelete = (record: WorkOrderRow) => {
    onDelete(record);
  };

  const columns = getColumns(handleEdit, handleDelete);

  return (
    <>
      <Table
        dataSource={tableData}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10, hideOnSinglePage: true }}
        onRow={() => ({
          className: 'lift-on-hover-row'
        })}
      />
      {isDialogOpen && (
        <WorkOrderFormDialog
          isOpen={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false);
            setEditingWorkOrder(null);
          }}
          onSave={handleSaveDialog}
          workOrder={editingWorkOrder}
        />
      )}
    </>
  );
}