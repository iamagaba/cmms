import { Button, Dropdown, Menu, Tag, Typography } from "antd";
import { Icon } from '@iconify/react'; // Import Icon from Iconify
import { InventoryItem } from "@/types/supabase";
import dayjs from "dayjs";

const { Text } = Typography;

export const getColumns = (
  onEdit: (record: InventoryItem) => void,
  onDelete: (record: InventoryItem) => void
) => [
  {
    title: "Part Name",
    dataIndex: "name",
    sorter: (a: InventoryItem, b: InventoryItem) => a.name.localeCompare(b.name),
  },
  {
    title: "SKU",
    dataIndex: "sku",
    render: (sku: string) => <Text code>{sku}</Text>,
  },
  {
    title: "Quantity on Hand",
    dataIndex: "quantity_on_hand",
    sorter: (a: InventoryItem, b: InventoryItem) => a.quantity_on_hand - b.quantity_on_hand,
    render: (qty: number, record: InventoryItem) => (
      qty <= record.reorder_level 
        ? <Tag color="error">{qty} (Low Stock)</Tag> 
        : <Text>{qty}</Text>
    ),
  },
  {
    title: "Unit Price",
    dataIndex: "unit_price",
    render: (price: number) => `UGX ${price.toLocaleString('en-US')}`,
    sorter: (a: InventoryItem, b: InventoryItem) => a.unit_price - b.unit_price,
  },
  {
    title: "Last Updated",
    dataIndex: "updated_at",
    render: (date: string) => dayjs(date).format("MMM D, YYYY"),
    sorter: (a: InventoryItem, b: InventoryItem) => dayjs(a.updated_at).unix() - dayjs(b.updated_at).unix(),
  },
  {
    title: "Actions",
    key: "actions",
    align: "right" as const,
    render: (_: any, record: InventoryItem) => (
      <Dropdown
        overlay={
          <Menu>
            <Menu.Item key="edit" icon={<Icon icon="si:edit" />} onClick={() => onEdit(record)}>
              Edit Item
            </Menu.Item>
            <Menu.Item key="delete" icon={<Icon icon="si:trash" />} danger onClick={() => onDelete(record)}>
              Delete Item
            </Menu.Item>
          </Menu>
        }
        trigger={["click"]}
      >
        <Button type="text" icon={<Icon icon="si:more-horizontal" style={{ fontSize: '18px' }} />} />
      </Dropdown>
    ),
  },
];