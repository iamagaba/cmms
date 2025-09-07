import * as React from "react";
import { Table } from "antd";
import { Location, WorkOrder } from "@/types/supabase";
import { LocationRow, getColumns } from "./LocationTableColumns";

interface LocationDataTableProps {
  locations: Location[];
  workOrders: WorkOrder[];
  onEdit: (location: Location) => void;
  onDelete: (location: Location) => void;
}

export function LocationDataTable({ locations, workOrders, onEdit, onDelete }: LocationDataTableProps) {
  const tableData: LocationRow[] = React.useMemo(() => {
    return locations.map(loc => ({
      ...loc,
      openWorkOrders: workOrders.filter(wo => wo.locationId === loc.id && wo.status !== 'Completed').length
    }));
  }, [locations, workOrders]);

  const columns = getColumns(onEdit, onDelete);

  return (
    <Table
      dataSource={tableData}
      columns={columns}
      rowKey="id"
      size="small"
      pagination={{ pageSize: 10, hideOnSinglePage: true }}
      onRow={(record) => ({
        className: 'lift-on-hover-row',
        onClick: () => onEdit(record),
      })}
    />
  );
}