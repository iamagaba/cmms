import * as React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Paper } from "@mui/material";
import { WorkOrder, Technician, Location } from "@/data/mockData";
import { WorkOrderRow, getColumns } from "./WorkOrderTableColumns";
import { WorkOrderFormDialog } from "./WorkOrderFormDialog";

interface WorkOrderDataTableProps {
  workOrders: WorkOrder[];
  technicians: Technician[];
  locations: Location[];
  onSave: (workOrderData: WorkOrder) => void;
  onDelete: (workOrderData: WorkOrder) => void;
  onUpdateWorkOrder: (id: string, field: keyof WorkOrder, value: any) => void;
}

export function WorkOrderDataTable({ workOrders, technicians, locations, onSave, onDelete, onUpdateWorkOrder }: WorkOrderDataTableProps) {
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

  const columns = getColumns(handleEdit, handleDelete, onUpdateWorkOrder);

  return (
    <>
      <Paper sx={{ height: 'calc(100vh - 300px)', width: '100%' }}>
        <DataGrid
          rows={tableData}
          columns={columns}
          getRowId={(row) => row.id}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 20 },
            },
          }}
          pageSizeOptions={[10, 20, 50]}
          disableRowSelectionOnClick
        />
      </Paper>
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