import { useState } from "react";
import { Drawer, Form, Select, Button, InputNumber, Skeleton, Space } from "antd";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { InventoryItem } from "@/types/supabase";

const { Option } = Select;

interface AddPartToWorkOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemId: string, quantity: number) => void;
}

export const AddPartToWorkOrderDialog = ({ isOpen, onClose, onSave }: AddPartToWorkOrderDialogProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Don't fetch data if dialog is not open
  const shouldFetch = isOpen;

  const { data: items, isLoading, error: queryError } = useQuery<InventoryItem[]>({
    queryKey: ['inventory_items'],
    queryFn: async () => {
      const { data, error } = await supabase.from('inventory_items').select('*').order('name');
      if (error) throw new Error(error.message);
      return data || [];
    },
    retry: 1,
    enabled: shouldFetch
  });

  if (queryError) {
    console.error('Error loading inventory items:', queryError);
  }

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      onSave(values.itemId, values.quantity);
      // Don't reset form here - let the parent component handle it
      // form.resetFields() will be called when dialog closes via onClose
    } catch (info) {
      console.log('Validate Failed:', info);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      title="Add Part to Work Order"
      placement="right"
      onClose={() => {
        form.resetFields();
        onClose();
      }}
      open={isOpen}
      width={720}
      destroyOnClose
      footer={
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button 
            key="back" 
            onClick={() => {
              form.resetFields();
              onClose();
            }} 
            disabled={loading}
          >
            Cancel
          </Button>
          <Button key="submit" type="primary" onClick={handleSubmit} loading={loading}>Add Part</Button>
        </Space>
      }
    >
      {!isOpen ? null : queryError ? (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p>Error loading inventory items: {queryError.message}</p>
          <Button onClick={() => onClose()}>Close</Button>
        </div>
      ) : isLoading ? (
        <Skeleton active />
      ) : (
        <Form form={form} layout="vertical" name="add_part_form">
          <Form.Item name="itemId" label="Select Part" rules={[{ required: true }]}>
            <Select 
              showSearch 
              placeholder="Search for a part by name or SKU" 
              filterOption={(input, option) => {
                const label = String(option?.label ?? '');
                return label.toLowerCase().includes(input.toLowerCase());
              }}
            >
              {(items || []).map(item => (
                <Option key={item.id} value={item.id} label={`${item.name} (${item.sku})`}>
                  {item.name} ({item.sku}) - <span style={{ color: 'var(--ant-colorTextSecondary)' }}>{item.quantity_on_hand} in stock</span>
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="quantity" label="Quantity Used" rules={[{ required: true, type: 'number', min: 1 }]}>
            <InputNumber style={{ width: '100%' }} placeholder="e.g. 2" />
          </Form.Item>
        </Form>
      )}
    </Drawer>
  );
};