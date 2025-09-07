import { Button, Dropdown, Menu, Typography } from "antd";
import { MoreOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Vehicle, Customer } from "@/types/supabase";
import { Link } from "react-router-dom";

const { Text } = Typography;

export type AssetRow = Vehicle & {
  customer?: Customer;
};

export const getColumns = (
  onEdit: (record: AssetRow) => void,
  onDelete: (record: AssetRow) => void
) => [
  {
    title: "License Plate",
    dataIndex: "license_plate",
    render: (license_plate: string, record: AssetRow) => (
      <Link to={`/assets/${record.id}`}>
        <Text strong>{license_plate}</Text>
      </Link>
    ),
    sorter: (a: AssetRow, b: AssetRow) => a.license_plate.localeCompare(b.license_plate),
  },
  {
    title: "Vehicle",
    dataIndex: "make",
    render: (_: any, record: AssetRow) => `${record.year} ${record.make} ${record.model}`,
    sorter: (a: AssetRow, b: AssetRow) => `${a.year} ${a.make}`.localeCompare(`${b.year} ${b.make}`),
  },
  {
    title: "Mileage (KMs)",
    dataIndex: "mileage",
    render: (mileage?: number) => mileage ? mileage.toLocaleString() : 'N/A',
    sorter: (a: AssetRow, b: AssetRow) => (a.mileage || 0) - (b.mileage || 0),
  },
  {
    title: "Owner",
    dataIndex: "customer",
    render: (customer?: Customer) => customer?.name || <Text type="secondary">Unassigned</Text>,
    sorter: (a: AssetRow, b: AssetRow) => (a.customer?.name || "").localeCompare(b.customer?.name || ""),
  },
  {
    title: "Actions",
    key: "actions",
    align: "right" as const,
    render: (_: any, record: AssetRow) => (
      <Dropdown
        overlay={
          <Menu>
            <Menu.Item key="edit" icon={<EditOutlined />} onClick={(e) => { e.domEvent.stopPropagation(); onEdit(record); }}>
              Edit Details
            </Menu.Item>
            <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={(e) => { e.domEvent.stopPropagation(); onDelete(record); }}>
              Delete Asset
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