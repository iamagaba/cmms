import { Button, Dropdown, Menu } from "antd";
import { MoreOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Location } from "@/types/supabase";

export type LocationRow = Location & {
  openWorkOrders: number;
};

export const getColumns = (
  onEdit: (record: LocationRow) => void,
  onDelete: (record: LocationRow) => void
) => [
  {
    title: "Name",
    dataIndex: "name",
    sorter: (a: LocationRow, b: LocationRow) => (a.name || "").localeCompare(b.name || ""),
  },
  {
    title: "Address",
    dataIndex: "address",
  },
  {
    title: "Open Work Orders",
    dataIndex: "openWorkOrders",
    sorter: (a: LocationRow, b: LocationRow) => a.openWorkOrders - b.openWorkOrders,
  },
  {
    title: "Actions",
    key: "actions",
    align: "right" as const,
    render: (_: any, record: LocationRow) => (
      <Dropdown
        overlay={
          <Menu>
            <Menu.Item key="edit" icon={<EditOutlined />} onClick={(e) => { e.domEvent.stopPropagation(); onEdit(record); }}>
              Edit Details
            </Menu.Item>
            <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={(e) => { e.domEvent.stopPropagation(); onDelete(record); }}>
              Delete Location
            </Menu.Item>
          </Menu>
        }
        trigger={["click"]}
      >
        <Button type="text" icon={<MoreOutlined style={{ fontSize: '18px' }} />} onClick={(e) => e.stopPropagation()} />
      </Dropdown>
    ),
  },
];