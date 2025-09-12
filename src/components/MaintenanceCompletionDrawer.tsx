import { useState, useEffect } from 'react';
import { Drawer, Form, Select, Input, Button, Typography, Space, Table, InputNumber, Popconfirm, Empty, Row, Col, Spin, Card } from 'antd';
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
  const [partForm] = Form.useForm(); // Form for adding parts
  const [loading, setLoading] = useState(false);
  const [showCustomFaultCode, setShowCustomFaultCode] = useState(false);

  // Fetch inventory items for the inline part selection
  const { data: inventoryItems, isLoading: isLoadingInventory } = useQuery<InventoryItem[]>({
    queryKey: ['inventory_items'],
    queryFn: async () => {
      const { data, error } = await supabase.from('inventory_items').select('*').order('name');
      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: isOpen, // Only fetch when the drawer is open
  });

  useEffect(() => {
    if (isOpen) {
      form.setFieldsValue({
        faultCode: initialFaultCode && predefinedFaultCodes.includes(initialFaultCode) ? initialFaultCode : (initialFaultCode ? 'other' : undefined),
        customFaultCode: initialFaultCode && !predefinedFaultCodes.includes(initialFaultCode) ? initialFaultCode : undefined,
        maintenanceNotes: initialMaintenanceNotes,
      });
      setShowCustomFaultCode(initialFaultCode && !predefinedFaultCodes.includes(initialFaultCode));
      partForm.resetFields(); // Reset part form when drawer opens
    } else {
      form.resetFields();
      setShowCustomFaultCode(false);
    }
  }, [isOpen, form, partForm, initialFaultCode, initialMaintenanceNotes]);

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

  const handleAddPartSubmit = async () => {
    try {
      const values = await partForm.validateFields();
      onAddPart(values.itemId, values.quantity);
      partForm.resetFields(); // Clear part form after adding
    } catch (info) {
      console.log('Validate Failed (Add Part):', info);
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
          <Button type="text" danger icon={<Icon icon="ph:trash-fill" />} size="small" />
        </Popconfirm>
      ),
    },
  ];
  const partsTotal = (usedParts || []).reduce((sum, part) => sum + (part.quantity_used * part.inventory_items.unit_price), 0);
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
            <Icon icon="ph:check-circle-fill" /> Mark as Completed
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
        </Space>

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

        {/* Inline form for adding parts */}
        <Card size="small" style={{ marginTop: 16 }}>
          <Text strong style={{ marginBottom: 8, display: 'block' }}>Add New Part</Text>
          <Form form={partForm} layout="vertical" name="add_part_inline_form" onFinish={handleAddPartSubmit}>
            <Row gutter={16}>
              <Col span={14}>
                <Form.Item name="itemId" label="Select Part" rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                  <Select
                    showSearch
                    placeholder="Search for a part by name or SKU"
                    filterOption={(input, option) =>
                      String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    loading={isLoadingInventory}
                  >
                    {(inventoryItems || []).map(item => (
                      <Option key={item.id} value={item.id} label={`${item.name} (${item.sku})`}>
                        {item.name} ({item.sku}) - <span style={{ color: '#888' }}>{item.quantity_on_hand} in stock</span>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={5}>
                <Form.Item name="quantity" label="Qty" rules={[{ required: true, type: 'number', min: 1 }]} style={{ marginBottom: 0 }}>
                  <InputNumber style={{ width: '100%' }} placeholder="1" min={1} />
                </Form.Item>
              </Col>
              <Col span={5}>
                <Form.Item label=" " style={{ marginBottom: 0 }}> {/* Empty label to align button */}
                  <Button type="primary" htmlType="submit" icon={<Icon icon="ph:plus-fill" />} block>
                    Add
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>
      </Form>
    </Drawer>
  );
};