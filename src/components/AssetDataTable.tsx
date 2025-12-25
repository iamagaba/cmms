import * as React from "react";
import { Table } from "antd";
import { Vehicle, Customer } from "@/types/supabase";
import { AssetRow, getColumns } from "./AssetTableColumns";
import { useNavigate } from "react-router-dom";
import { TableEmptyState } from "./TableEmptyState";
import { ResizableTitle } from "./ResizableTitle";

interface AssetDataTableProps {
  vehicles: Vehicle[];
  customers: Customer[];
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicle: Vehicle) => void;
}

export function AssetDataTable({ vehicles, customers, onEdit, onDelete }: AssetDataTableProps) {
  const navigate = useNavigate();
  const [columnWidths, setColumnWidths] = React.useState<Record<string, number>>({});
  
  const tableData: AssetRow[] = React.useMemo(() => {
    const customerMap = new Map(customers.map(c => [c.id, c]));
    return vehicles.map(v => ({
      ...v,
      customer: v.customer_id ? customerMap.get(v.customer_id) : undefined,
    }));
  }, [vehicles, customers]);

  const handleColumnResize = React.useCallback((index: number, width: number) => {
    setColumnWidths(prev => ({
      ...prev,
      [index]: width,
    }));
  }, []);

  const columns = React.useMemo(() => {
    const cols = getColumns(onEdit, onDelete);
    return cols.map((col, index) => ({
      ...col,
      width: columnWidths[index] || col.width || 150,
      onHeaderCell: (column: any) => ({
        width: column.width,
  onResize: ((_: React.SyntheticEvent, { size }: { size: { width: number } }) => {
          handleColumnResize(index, size.width);
        }) as any,
      }),
    }));
  }, [columnWidths, onEdit, onDelete, handleColumnResize]);

  return (
    <Table
      dataSource={tableData}
      columns={columns}
      rowKey="id"
      size="small"
      pagination={{ pageSize: 10, hideOnSinglePage: true, position: ['bottomCenter'] }}
      sticky
      className="asset-data-table"
      rowClassName={(_, index) => index % 2 === 0 ? 'asset-table-row asset-table-row-even' : 'asset-table-row asset-table-row-odd'}
      onRow={(record) => ({
        className: 'lift-on-hover-row',
        onClick: () => navigate(`/assets/${record.id}`),
      })}
      components={{
        header: {
          cell: ResizableTitle,
        },
      }}
      locale={{
        emptyText: (
          <TableEmptyState
            title="No Assets Found"
            description="There are no vehicles or equipment in the system yet."
            icon="ant-design:car-outlined"
          />
        )
      }}
    />
  );
}