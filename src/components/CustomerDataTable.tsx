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
  // Hide non-critical columns on small screens via responsive, and attach data-labels for stacked rows
  const columnsWithMobile = (columns as any[]).map((col) => {
    let responsive;
    // Keep Name and Phone at xs; hide Email on phones to reduce clutter
    if (col.dataIndex === 'email') responsive = ['sm'];
    return {
      ...col,
      responsive,
      onCell: (_: any) => ({ 'data-label': col.title }),
    };
  });

  return (
    <Table
      dataSource={customers}
      columns={columnsWithMobile as any}
      rowKey="id"
      size="small"
      pagination={{ pageSize: 10, hideOnSinglePage: true, position: ["bottomCenter"] }}
      className="stacked-table"
      onRow={(record) => ({
        className: 'lift-on-hover-row',
        onClick: () => navigate(`/customers/${record.id}`),
      })}
    />
  );
}