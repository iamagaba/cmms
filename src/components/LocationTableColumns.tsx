import { Button, Dropdown, Menu, Typography } from "antd";
import { MoreOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Location } from "@/data/mockData";

const { Text } = Typography;

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
    sorter: (a: LocationRow, b: LocationRow) => a.name.localeCompare(b.name),
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
            <Menu.Item key="edit" icon={<EditOutlined />} onClick={() => onEdit(record)}>
              Edit Details
            </Menu.Item>
            <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={() => onDelete(record)}>
              Delete Location
            </Menu.Item>
          </Menu>
        }
        trigger={["click"]}
      >
        <Button type="text" icon={<MoreOutlined style={{ fontSize: '18px' }} />} />
      </Dropdown>
    ),
  },
];