import React from 'react';
import { Table, Card, Input, Button, Space, Dropdown, Menu, Typography, theme } from 'antd';
import type { TableProps } from 'antd/es/table';
import type { ColumnType } from 'antd/es/table/interface';
import { Icon } from '@iconify/react';

const { Search } = Input;
const { Text } = Typography;

interface DataTableAction<T> {
  key: string;
  label: string;
  icon?: string;
  onClick: (record: T) => void;
  type?: 'link' | 'text' | 'default' | 'primary' | 'dashed';
  danger?: boolean;
  disabled?: (record: T) => boolean;
}

interface ToolbarButton {
  key: string;
  label: string;
  icon?: string;
  onClick: () => void;
  type?: 'link' | 'text' | 'default' | 'primary' | 'dashed';
  danger?: boolean;
  disabled?: boolean;
}

export interface DataTableProps<T> extends Omit<TableProps<T>, 'columns'> {
  columns: (Omit<ColumnType<T>, 'render'> & {
    render?: (value: any, record: T, index: number) => React.ReactNode;
    searchable?: boolean;
  })[];
  toolbar?: {
    title?: string;
    subtitle?: string;
    searchPlaceholder?: string;
    buttons?: ToolbarButton[];
  };
  rowActions?: DataTableAction<T>[];
  onSearch?: (value: string) => void;
  loading?: boolean;
  scrollX?: number;
  bordered?: boolean;
}

const DataTable = <T extends object>({
  columns,
  toolbar,
  rowActions,
  onSearch,
  loading,
  scrollX = 1000,
  bordered = false,
  ...tableProps
}: DataTableProps<T>) => {
  const { token } = theme.useToken();

  const handleSearch = (value: string) => {
    onSearch?.(value);
  };

  const tableColumns: ColumnType<T>[] = [
    ...columns.map(column => ({
      ...column,
      title:
        typeof (column as any).title === 'function'
          ? (column as any).title
          : (
            <Text strong style={{ color: token.colorText }}>
              {(column as any).title as React.ReactNode}
            </Text>
          ),
    })),
    ...(rowActions
      ? [
          {
            title: 'Actions',
            key: 'actions',
            width: 100,
            align: 'right' as const,
            render: (_: any, record: T) => (
              <Dropdown
                overlay={
                  <Menu>
                    {rowActions.map(action => (
                      <Menu.Item
                        key={action.key}
                        onClick={() => action.onClick(record)}
                        disabled={action.disabled?.(record)}
                        icon={action.icon && <Icon icon={action.icon} />}
                        danger={action.danger}
                      >
                        {action.label}
                      </Menu.Item>
                    ))}
                  </Menu>
                }
                trigger={['click']}
              >
                <Button
                  type="text"
                  icon={<Icon icon="si:ellipsis-v" />}
                  onClick={e => e.stopPropagation()}
                />
              </Dropdown>
            ),
          },
        ]
      : []),
  ];

  return (
  <Card size="small" bordered={bordered}>
      {toolbar && (
        <div style={{ marginBottom: 16 }}>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            {(toolbar.title || toolbar.subtitle) && (
              <div>
                {toolbar.title && <Text strong>{toolbar.title}</Text>}
                {toolbar.subtitle && (
                  <Text type="secondary" style={{ display: 'block', fontSize: '14px' }}>
                    {toolbar.subtitle}
                  </Text>
                )}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
              <Search
                placeholder={toolbar.searchPlaceholder || 'Search...'}
                allowClear
                onSearch={handleSearch}
                style={{ maxWidth: 300 }}
              />
              {toolbar.buttons && (
                <Space>
                  {toolbar.buttons.map(button => (
                    <Button
                      key={button.key}
                      type={button.type || 'default'}
                      icon={button.icon && <Icon icon={button.icon} />}
                      onClick={button.onClick}
                      disabled={button.disabled}
                      danger={button.danger}
                    >
                      {button.label}
                    </Button>
                  ))}
                </Space>
              )}
            </div>
          </Space>
        </div>
      )}

      <Table
        {...tableProps}
        columns={tableColumns}
        loading={loading}
        scroll={{ x: scrollX }}
        bordered={bordered}
      />
    </Card>
  );
};

export default DataTable;