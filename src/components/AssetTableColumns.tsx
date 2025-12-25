import { Button, Dropdown, Menu, Typography, Space } from "antd";
import type { ColumnsType } from "antd/es/table";
// import { Grid } from "antd";
import { Icon } from '@iconify/react'; // Import Icon from Iconify
import { Vehicle, Customer } from "@/types/supabase";
import { Link } from "react-router-dom";

// const { useBreakpoint } = Grid;

const { Text } = Typography;

export type AssetRow = Vehicle & {
  customer?: Customer;
};

export const getColumns = (
  onEdit: (record: AssetRow) => void,
  onDelete: (record: AssetRow) => void
): ColumnsType<AssetRow> => [
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
    responsive: ['md'],
  },
  {
    title: "Owner",
    dataIndex: "customer",
    render: (customer?: Customer) => customer?.name || <Text type="secondary">Unassigned</Text>,
    sorter: (a: AssetRow, b: AssetRow) => (a.customer?.name || "").localeCompare(b.customer?.name || ""),
    responsive: ['md'],
  },
  {
    title: "Actions",
    key: "actions",
    align: "right" as const,
    render: (_: any, record: AssetRow) => {
      const menu = (
        <Menu>
          <Menu.Item 
            key="edit" 
            icon={<Icon icon="ant-design:edit-outlined" style={{ fontSize: '14px' }} />} 
            onClick={(e) => { e.domEvent.stopPropagation(); onEdit(record); }}>
            Edit Details
          </Menu.Item>
          <Menu.Item 
            key="delete" 
            icon={<Icon icon="ant-design:delete-outlined" style={{ fontSize: '14px' }} />} 
            danger 
            onClick={(e) => { e.domEvent.stopPropagation(); onDelete(record); }}>
            Delete Asset
          </Menu.Item>
        </Menu>
      );

      return (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<Icon icon="ant-design:edit-outlined" style={{ fontSize: '14px' }} />}
            onClick={(e) => { e.stopPropagation(); onEdit(record); }}
            title="Edit Asset"
          />
          <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
            <Button
              type="text"
              size="small"
              icon={<Icon icon="ant-design:more-outlined" style={{ fontSize: '14px' }} />}
              onClick={(e) => e.stopPropagation()}
              title="More Actions"
            />
          </Dropdown>
        </Space>
      );
    },
  },
];