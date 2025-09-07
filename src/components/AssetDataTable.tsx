import * as React from "react";
import { Table } from "antd";
import { Vehicle, Customer } from "@/types/supabase";
import { AssetRow, getColumns } from "./AssetTableColumns";
import { useNavigate } from "react-router-dom";

interface AssetDataTableProps {
  vehicles: Vehicle[];
  customers: Customer[];
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicle: Vehicle) => void;
}

export function AssetDataTable({ vehicles, customers, onEdit, onDelete }: AssetDataTableProps) {
  const navigate = useNavigate();
  
  const tableData: AssetRow[] = React.useMemo(() => {
    const customerMap = new Map(customers.map(c => [c.id, c]));
    return vehicles.map(v => ({
      ...v,
      customer: v.customer_id ? customerMap.get(v.customer_id) : undefined,
    }));
  }, [vehicles, customers]);

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
        onClick: () => navigate(`/assets/${record.id}`),
      })}
    />
  );
}