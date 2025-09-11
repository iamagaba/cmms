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

  const { data: items, isLoading } = useQuery<InventoryItem[]>({
    queryKey: ['inventory_items'],
    queryFn: async () => {
      const { data, error } = await supabase.from('inventory_items').select('*').order('name');
      if (error) throw new Error(error.message);
      return data || [];
    }
  });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      onSave(values.itemId, values.quantity);
      onClose();
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
      onClose={onClose}
      open={isOpen}
      width={720}
      destroyOnClose
      footer={
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button key="back" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button key="submit" type="primary" onClick={handleSubmit} loading={loading}>Add Part</Button>
        </Space>
      }
    >
      {isLoading ? <Skeleton active /> : (
        <Form form={form} layout="vertical" name="add_part_form">
          <Form.Item name="itemId" label="Select Part" rules={[{ required: true }]}>
            <Select showSearch placeholder="Search for a part by name or SKU" filterOption={(input, option) => String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())}>
              {(items || []).map(item => (
                <Option key={item.id} value={item.id} label={`${item.name} (${item.sku})`}>
                  {item.name} ({item.sku}) - <span style={{ color: '#888' }}>{item.quantity_on_hand} in stock</span>
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