import { Table } from "antd";
import { Customer } from "@/types/supabase";
import { getColumns } from "./CustomerTableColumns";
import { useNavigate } from "react-router-dom";

interface CustomerDataTableProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

export function CustomerDataTable({ customers, onEdit, onDelete }: CustomerDataTableProps) {
  const navigate = useNavigate();
  const columns = getColumns(onEdit, onDelete);

  return (
    <Table
      dataSource={customers}
      columns={columns}
      rowKey="id"
      size="small"
      pagination={{ pageSize: 10, hideOnSinglePage: true }}
      onRow={(record) => ({
        className: 'lift-on-hover-row',
        onClick: () => navigate(`/customers/${record.id}`),
      })}
    />
  );
}