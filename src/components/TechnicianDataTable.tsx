import * as React from "react";
import { Table } from "antd";
import { Technician, WorkOrder } from "@/data/mockData";
import { TechnicianRow, getColumns } from "./TechnicianTableColumns";
import { TechnicianFormDialog } from "./TechnicianFormDialog";

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
    </>
  );
}