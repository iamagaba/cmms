import { useState, useEffect } from 'react';
import { Drawer, Form, Select, Input, Button, Typography, Space, Table, InputNumber, Popconfirm, Empty, Row, Col, Spin } from 'antd';
import { Icon } from '@iconify/react'; // Import Icon from Iconify
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { InventoryItem, WorkOrderPart } from '@/types/supabase';

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

const predefinedFaultCodes = [
  'FC-BATT-001: Low Cell Voltage',
  'FC-MOT-002: Stator Winding Fault',
  'FC-BRK-003: ABS Sensor Failure',
  'FC-ELEC-004: Wiring Harness Damage',
  'FC-SW-005: Firmware Corruption',
  'FC-MECH-006: Frame Crack',
  'FC-MAINT-007: Scheduled Service',
  'FC-OTHER-008: Unspecified',
];

interface MaintenanceCompletionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (faultCode: string, maintenanceNotes: string | null) => void;
  usedParts: WorkOrderPart[]; // Now receives used parts directly
  onAddPart: (itemId: string, quantity: number) => void; // Callback for adding a part
  onRemovePart: (partId: string) => void; // Callback for removing a part
  initialFaultCode?: string | null;
  initialMaintenanceNotes?: string | null;
}

export const MaintenanceCompletionDrawer = ({
  isOpen,
  onClose,
  onSave,
  usedParts,
  onAddPart,
  onRemovePart,
  initialFaultCode,
  initialMaintenanceNotes,
}: MaintenanceCompletionDrawerProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [showCustomFaultCode, setShowCustomFaultCode] = useState(false);
  const [showPartSelection, setShowPartSelection] = useState(false); // State to toggle part selection UI
  const [selectedPartId, setSelectedPartId] = useState<string | undefined>(undefined);
  const [selectedPartQuantity, setSelectedPartQuantity] = useState<number | undefined>(undefined);

  const { data: inventoryItems, isLoading: isLoadingInventory } = useQuery<InventoryItem[]>({
    queryKey: ['inventory_items'],
    queryFn: async () => {
      const { data, error } = await supabase.from('inventory_items').select('*').order('name');
      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: isOpen, // Only fetch when drawer is open
  });

  useEffect(() => {
    if (isOpen) {
      form.setFieldsValue({
        faultCode: initialFaultCode && predefinedFaultCodes.includes(initialFaultCode) ? initialFaultCode : (initialFaultCode ? 'other' : undefined),
        customFaultCode: initialFaultCode && !predefinedFaultCodes.includes(initialFaultCode) ? initialFaultCode : undefined,
        maintenanceNotes: initialMaintenanceNotes,
      });
      setShowCustomFaultCode(initialFaultCode && !predefinedFaultCodes.includes(initialFaultCode));
      setShowPartSelection(false); // Reset part selection visibility
      setSelectedPartId(undefined);
      setSelectedPartQuantity(undefined);
    } else {
      form.resetFields();
      setShowCustomFaultCode(false);
    }
  }, [isOpen, form, initialFaultCode, initialMaintenanceNotes]);

  const handleFaultCodeChange = (value: string) => {
    if (value === 'other') {
      setShowCustomFaultCode(true);
    } else {
      setShowCustomFaultCode(false);
      form.setFieldsValue({ customFaultCode: undefined });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      const faultCode = values.faultCode === 'other' ? values.customFaultCode : values.faultCode;
      onSave(faultCode, values.maintenanceNotes);
      onClose();
    } catch (info) {
      console.log('Validate Failed:', info);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAddPart = () => {
    if (selectedPartId && selectedPartQuantity && selectedPartQuantity > 0) {
      onAddPart(selectedPartId, selectedPartQuantity);
      setSelectedPartId(undefined);
      setSelectedPartQuantity(undefined);
      setShowPartSelection(false); // Hide part selection after adding
    }
  };

  const partsColumns = [
    { title: 'Part', dataIndex: ['inventory_items', 'name'], render: (name: string, record: WorkOrderPart) => `${name} (${record.inventory_items.sku})` },
    { title: 'Qty', dataIndex: 'quantity_used' },
    { title: 'Unit Price', dataIndex: 'price_at_at_time_of_use', render: (price: number) => `UGX ${price.toLocaleString('en-US')}` },
    { title: 'Total', render: (_: any, record: WorkOrderPart) => `UGX ${(record.quantity_used * record.price_at_at_time_of_use).toLocaleString('en-US')}` },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: WorkOrderPart) => (
        <Popconfirm
          title="Are you sure to delete this part?"
          onConfirm={() => onRemovePart(record.id)}
          okText="Yes"
          cancelText="No"
        >
          <Button type="text" danger icon={<Icon icon="si:trash" />} size="small" />
        </Popconfirm>
      ),
    },
  ];
  const partsTotal = (usedParts || []).reduce((sum, part) => sum + (part.quantity_used * part.price_at_at_time_of_use), 0);
  const usedPartsCount = usedParts?.length || 0;

  return (
    <Drawer
      title="Complete Work Order"
      open={isOpen}
      onClose={onClose}
      destroyOnClose
      width={720} // Standard drawer width
      footer={
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button key="back" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button key="submit" type="primary" onClick={handleSubmit} loading={loading} disabled={loading || usedPartsCount === 0}>
            <Icon icon="si:check-circle" /> Mark as Completed
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical" name="maintenance_completion_form">
        <Form.Item
          name="faultCode"
          label="Identified Fault Code"
          rules={[{ required: true, message: 'Please select an identified fault code!' }]}
        >
          <Select placeholder="Select or specify fault code" onChange={handleFaultCodeChange}>
            {predefinedFaultCodes.map(code => (
              <Option key={code} value={code}>{code}</Option>
            ))}
            <Option key="other" value="other">Other (Please specify)</Option>
          </Select>
        </Form.Item>
        {showCustomFaultCode && (
          <Form.Item
            name="customFaultCode"
            label="Custom Fault Code"
            rules={[{ required: true, message: 'Please provide a custom fault code!' }]}
          >
            <Input placeholder="e.g. FC-BATT-999: Unknown Battery Issue" />
          </Form.Item>
        )}
        <Form.Item
          name="maintenanceNotes"
          label="Maintenance Decision / Repair Notes"
          rules={[{ required: true, message: 'Please provide maintenance notes!' }]}
        >
          <TextArea rows={4} placeholder="Describe the repair performed, root cause, and any recommendations..." />
        </Form.Item>

        <Space style={{ marginTop: 16, marginBottom: 8, width: '100%', justifyContent: 'space-between' }}>
          <Text strong>Parts Used ({usedPartsCount} items)</Text>
          <Button
            type="dashed"
            icon={showPartSelection ? <Icon icon="si:x" /> : <Icon icon="si:plus" />}
            onClick={() => setShowPartSelection(!showPartSelection)}
            size="small"
          >
            {showPartSelection ? 'Cancel Add Part' : 'Add Part'}
          </Button>
        </Space>

        {isLoadingInventory ? <Spin /> : (
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
        )}
      </Form>
    </Drawer>
  );
};