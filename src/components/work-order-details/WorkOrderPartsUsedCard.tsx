import React from 'react';
import { Card, Button, Table, Popconfirm, Empty, Typography, Tooltip, theme } from 'antd';
import { Icon } from '@iconify/react';
import { WorkOrderPart } from '@/types/supabase';
import { AddPartToWorkOrderDialog } from '@/components/AddPartToWorkOrderDialog';

const { Text } = Typography;

interface WorkOrderPartsUsedCardProps {
  usedParts: WorkOrderPart[];
  handleRemovePart: (partId: string) => void;
  // Support either a simple callback or managed dialog props from parent
  onAddPart?: () => void;
  isAddPartDialogOpen?: boolean;
  setIsAddPartDialogOpen?: (open: boolean) => void;
  handleAddPart?: (itemId: string, quantity: number) => void;
  status?: string;
}

export const WorkOrderPartsUsedCard: React.FC<WorkOrderPartsUsedCardProps> = ({
  usedParts,
  handleRemovePart,
  onAddPart,
  isAddPartDialogOpen,
  setIsAddPartDialogOpen,
  handleAddPart,
  status,
}) => {
  const { token } = theme.useToken();
  const openAddPart = () => {
    if (setIsAddPartDialogOpen) setIsAddPartDialogOpen(true);
    else if (onAddPart) onAddPart();
  };

  const partsColumns = [
    {
      title: 'Part',
      dataIndex: ['inventory_items', 'name'],
      render: (name: string | undefined, record: WorkOrderPart) => {
        const item = (record as any).inventory_items as { name?: string; sku?: string } | undefined;
        const displayName = name ?? item?.name ?? 'Unknown part';
        const sku = item?.sku ? ` (${item.sku})` : '';
        return `${displayName}${sku}`;
      },
    },
    { 
      title: 'Qty', 
      dataIndex: 'quantity_used',
      render: (qty: number) => (qty ?? 0).toLocaleString(),
    },
    { 
      title: 'Unit Price', 
      dataIndex: 'price_at_time_of_use', // Corrected field name
      render: (price: number) => `UGX ${(price ?? 0).toLocaleString('en-US')}`,
    },
    { 
      title: 'Total', 
      render: (_: any, record: WorkOrderPart) => {
        const qty = Number((record as any).quantity_used) || 0;
        const price = Number((record as any).price_at_time_of_use) || 0;
        return `UGX ${(qty * price).toLocaleString('en-US')}`;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: WorkOrderPart) => (
        <Popconfirm
          title="Are you sure to delete this part?"
          onConfirm={() => handleRemovePart(record.id)}
          okText="Yes"
          cancelText="No"
        >
          <Button type="text" danger icon={<Icon icon="ph:trash-fill" />} size="small" />
        </Popconfirm>
      ),
    },
  ];
  const partsTotal = (usedParts || []).reduce((sum, part) => {
    const qty = Number((part as any).quantity_used) || 0;
    const price = Number((part as any).price_at_time_of_use) || 0;
    return sum + qty * price;
  }, 0);

  const canAddPart = status === 'In Progress' || status === 'Completed';
  return (
  <Card size="small"
      title="Parts Used"
      style={{
        borderRadius: 16,
        background: token.colorBgContainer,
        border: `1px solid ${token.colorSplit}`,
        boxShadow: token.boxShadowTertiary,
      }}
      bodyStyle={{ padding: 20 }}
      extra={
        canAddPart ? (
          <Button type="primary" icon={<Icon icon="ph:plus-fill" />} onClick={openAddPart}>
            Add Part
          </Button>
        ) : (
          <Tooltip title="Parts can only be added when the work order is In Progress or Completed.">
            <span>
              <Button type="primary" icon={<Icon icon="ph:plus-fill" />} disabled style={{ pointerEvents: 'none' }}>
                Add Part
              </Button>
            </span>
          </Tooltip>
        )
      }
    >
      <Table
        dataSource={usedParts || []}
        columns={partsColumns}
        rowKey="id"
        pagination={false}
        size="small"
        summary={() => (
          <Table.Summary.Row>
            <Table.Summary.Cell index={0} colSpan={3}>
              <Text strong>Total Cost</Text>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={3}>
              <Text strong>UGX {partsTotal.toLocaleString('en-US')}</Text>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={4} />
          </Table.Summary.Row>
        )}
        locale={{ emptyText: <Empty description="No parts used yet." image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
      />

      {isAddPartDialogOpen !== undefined && setIsAddPartDialogOpen && handleAddPart && (
        <AddPartToWorkOrderDialog
          isOpen={isAddPartDialogOpen}
          onClose={() => setIsAddPartDialogOpen(false)}
          onSave={(itemId, quantity) => handleAddPart(itemId, quantity)}
        />
      )}
    </Card>
  );
};