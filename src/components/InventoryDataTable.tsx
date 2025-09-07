import { Table } from "antd";
import { InventoryItem } from "@/types/supabase";
import { getColumns } from "./InventoryTableColumns";

interface InventoryDataTableProps {
  items: InventoryItem[];
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
}

export function InventoryDataTable({ items, onEdit, onDelete }: InventoryDataTableProps) {
  const columns = getColumns(onEdit, onDelete);

  return (
    <Table
      dataSource={items}
      columns={columns}
      rowKey="id"
      size="small"
      pagination={{ pageSize: 15, hideOnSinglePage: true }}
    />
  );
}