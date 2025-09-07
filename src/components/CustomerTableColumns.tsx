import { Button, Dropdown, Menu, Typography } from "antd";
import { MoreOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Customer } from "@/types/supabase";
import { Link } from "react-router-dom";

const { Text } = Typography;

export const getColumns = (
  onEdit: (record: Customer) => void,
  onDelete: (record: Customer) => void
) => [
  {
    title: "Name",
    dataIndex: "name",
    sorter: (a: Customer, b: Customer) => a.name.localeCompare(b.name),
    render: (name: string, record: Customer) => (
      <Link to={`/customers/${record.id}`}>
        <Text strong>{name}</Text>
      </Link>
    ),
  },
  {
    title: "Email",
    dataIndex: "email",
  },
  {
    title: "Phone",
    dataIndex: "phone",
  },
  {
    title: "Actions",
    key: "actions",
    align: "right" as const,
    render: (_: any, record: Customer) => (
      <Dropdown
        overlay={
          <Menu>
            <Menu.Item key="edit" icon={<EditOutlined />} onClick={(e) => { e.domEvent.stopPropagation(); onEdit(record); }}>
              Edit Details
            </Menu.Item>
            <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={(e) => { e.domEvent.stopPropagation(); onDelete(record); }}>
              Delete Customer
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