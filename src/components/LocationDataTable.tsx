import * as React from "react";
import { Table } from "antd";
import { Location, WorkOrder } from "@/data/mockData";
import { LocationRow, getColumns } from "./LocationTableColumns";
import { LocationFormDialog } from "./LocationFormDialog";

interface LocationDataTableProps {
  initialData: Location[];
  workOrders: WorkOrder[];
}

export function LocationDataTable({ initialData, workOrders }: LocationDataTableProps) {
  const [data, setData] = React.useState<Location[]>(initialData);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingLocation, setEditingLocation] = React.useState<Location | null>(null);

  const tableData: LocationRow[] = React.useMemo(() => {
    return data.map(loc => ({
      ...loc,
      openWorkOrders: workOrders.filter(wo => wo.locationId === loc.id && wo.status !== 'Completed').length
    }));
  }, [data, workOrders]);

  const handleSave = (locationData: Location) => {
    const exists = data.some(l => l.id === locationData.id);
    if (exists) {
      setData(data.map(l => (l.id === locationData.id ? locationData : l)));
    } else {
      setData([...data, locationData]);
    }
    setEditingLocation(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (record: LocationRow) => {
    setEditingLocation(record);
    setIsDialogOpen(true);
  };

  const handleDelete = (record: LocationRow) => {
    setData(data.filter(l => l.id !== record.id));
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
        <LocationFormDialog
          isOpen={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false);
            setEditingLocation(null);
          }}
          onSave={handleSave}
          location={editingLocation}
        />
      )}
    </>
  );
}