import React from 'react';
import { Card, Button, Table, Popconfirm, Empty, Typography } from 'antd';
import { Icon } from '@iconify/react'; // Import Icon from Iconify
import { WorkOrder, WorkOrderPart } from '@/types/supabase';
import { AddPartToWorkOrderDialog } from '@/components/AddPartToWorkOrderDialog';

const { Text } = Typography;

interface WorkOrderPartsUsedCardProps {
  workOrder: WorkOrder;
  usedParts: WorkOrderPart[];
  isAddPartDialogOpen: boolean;
  setIsAddPartDialogOpen: (isOpen: boolean) => void;
  handleAddPart: (itemId: string, quantity: number) => void;
  handleRemovePart: (partId: string) => void;
}

export const WorkOrderPartsUsedCard: React.FC<WorkOrderPartsUsedCardProps> = ({
  workOrder,
  usedParts,
  isAddPartDialogOpen,
  setIsAddPartDialogOpen,
  handleAddPart,
  handleRemovePart,
}) => {
  const partsColumns = [
    { title: 'Part', dataIndex: ['inventory_items', 'name'], render: (name: string, record: WorkOrderPart) => `${name} (${record.inventory_items.sku})` },
    { 
      title: 'Qty', 
      dataIndex: 'quantity_used',
      render: (qty: number) => qty != null ? qty.toLocaleString() : 'N/A',
    },
    { 
      title: 'Unit Price', 
      dataIndex: 'price_at_time_of_use', // Corrected field name
      render: (price: number) => price != null ? `UGX ${price.toLocaleString('en-US')}` : 'N/A',
    },
    { 
      title: 'Total', 
      render: (_: any, record: WorkOrderPart) => 
        record.quantity_used != null && record.price_at_time_of_use != null // Corrected field name
          ? `UGX ${(record.quantity_used * record.price_at_time_of_use).toLocaleString('en-US')}` // Corrected field name
          : 'N/A',
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
  const partsTotal = (usedParts || []).reduce((sum, part) => sum + (part.quantity_used * part.price_at_time_of_use), 0); // Corrected field name

  return (
    <Card
      title="Parts Used"
      extra={
        <Button type="primary" icon={<Icon icon="ph:plus-fill" />} onClick={() => setIsAddPartDialogOpen(true)}>
          Add Part
        </Button>
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
            <Table.Summary.Cell index={4}></Table.Summary.Cell> {/* Empty cell for actions column */}
          </Table.Summary.Row>
        )}
        locale={{ emptyText: <Empty description="No parts used yet." image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
      />
      {isAddPartDialogOpen && (
        <AddPartToWorkOrderDialog
          isOpen={isAddPartDialogOpen}
          onClose={() => setIsAddPartDialogOpen(false)}
          onSave={handleAddPart}
        />
      )}
    </Card>
  );
};