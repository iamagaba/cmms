import { Table, Empty, Button } from "antd";
import { InventoryItem } from "@/types/supabase";
import { getColumns } from "./InventoryTableColumns";

interface InventoryDataTableProps {
  items: InventoryItem[];
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
}

export function InventoryDataTable({ items, onEdit, onDelete }: InventoryDataTableProps) {
  const columns = getColumns(onEdit, onDelete);
  const columnsWithMobile = (columns as any[]).map((col) => {
    let responsive;
    // Show Part Name, SKU, Quantity on phones; hide Unit Price and Last Updated on xs
    if (col.dataIndex === 'unit_price' || col.dataIndex === 'updated_at') responsive = ['sm'];
    return {
      ...col,
      responsive,
      onCell: (_: any) => ({ 'data-label': col.title }),
    };
  });

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
        <Table
          dataSource={items}
          columns={columnsWithMobile as any}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 15, hideOnSinglePage: true, position: ["bottomCenter"] }}
          className="stacked-table"
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <>
                    <div>No inventory items found</div>
                    <Button type="primary" style={{ marginTop: 12 }} onClick={() => window.location.reload()}>
                      Refresh
                    </Button>
                  </>
                }
              />
            ),
          }}
        />
    </div>
  );
}