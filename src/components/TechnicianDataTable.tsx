import * as React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Technician, WorkOrder } from "@/data/mockData";
import { TechnicianRow, getTechnicianColumns } from "./TechnicianTableColumns";
import { TechnicianFormDialog } from "./TechnicianFormDialog";
import { Paper } from "@mui/material";

interface TechnicianDataTableProps {
  initialData: Technician[];
  workOrders: WorkOrder[];
}

export function TechnicianDataTable({ initialData, workOrders }: TechnicianDataTableProps) {
  const [data, setData] = React.useState<Technician[]>(initialData);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingTechnician, setEditingTechnician] = React.useState<Technician | null>(null);

  const tableData: TechnicianRow[] = React.useMemo(() => {
    return data.map(tech => ({
      ...tech,
      openTasks: workOrders.filter(wo => wo.assignedTechnicianId === tech.id && wo.status !== 'Completed').length
    }));
  }, [data, workOrders]);

  const handleSave = (technicianData: Technician) => {
    const exists = data.some(t => t.id === technicianData.id);
    if (exists) {
      setData(data.map(t => (t.id === technicianData.id ? technicianData : t)));
    } else {
      setData([...data, technicianData]);
    }
    setEditingTechnician(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (record: TechnicianRow) => {
    setEditingTechnician(record);
    setIsDialogOpen(true);
  };

  const handleDelete = (record: TechnicianRow) => {
    setData(data.filter(t => t.id !== record.id));
  };

  const columns = getTechnicianColumns(handleEdit, handleDelete);

  return (
    <Paper sx={{ height: 600, width: '100%' }}>
      <DataGrid
        rows={tableData}
        columns={columns}
        getRowId={(row) => row.id}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        pageSizeOptions={[5, 10, 20]}
        checkboxSelection
        disableRowSelectionOnClick
      />
      {isDialogOpen && (
        <TechnicianFormDialog
          isOpen={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false);
            setEditingTechnician(null);
          }}
          onSave={handleSave}
          technician={editingTechnician}
        />
      )}
    </Paper>
  );
}