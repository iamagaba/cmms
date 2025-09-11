import { useEffect, useState } from "react";
import { Drawer, Form, Input, Button, InputNumber, Row, Col, Space } from "antd";
import { InventoryItem } from "@/types/supabase";

const { TextArea } = Input;

interface InventoryItemFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<InventoryItem>) => void;
  item?: InventoryItem | null;
}

export const InventoryItemFormDialog = ({ isOpen, onClose, onSave, item }: InventoryItemFormDialogProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (item) {
        form.setFieldsValue(item);
      } else {
        form.resetFields();
      }
    }
  }, [isOpen, item, form]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      const itemToSave: Partial<InventoryItem> = {
        id: item?.id,
        ...values,
      };
      onSave(itemToSave);
      onClose();
    } catch (info) {
      console.log('Validate Failed:', info);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      title={item ? "Edit Inventory Item" : "Add Inventory Item"}
      placement="right"
      onClose={onClose}
      open={isOpen}
      width={720}
      destroyOnClose
      footer={
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button key="back" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button key="submit" type="primary" onClick={handleSubmit} loading={loading}>Save</Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical" name="inventory_item_form">
        <Row gutter={16}>
          <Col span={16}><Form.Item name="name" label="Part Name" rules={[{ required: true }]}><Input placeholder="e.g. Brake Pad Set - Model S" /></Form.Item></Col>
          <Col span={8}><Form.Item name="sku" label="SKU / Part #" rules={[{ required: true }]}><Input placeholder="e.g. BP-001" /></Form.Item></Col>
          <Col span={24}><Form.Item name="description" label="Description"><TextArea rows={2} placeholder="Details about the part, compatibility, etc." /></Form.Item></Col>
          <Col span={8}><Form.Item name="quantity_on_hand" label="Quantity" rules={[{ required: true, type: 'number' }]}><InputNumber style={{ width: '100%' }} min={0} /></Form.Item></Col>
          <Col span={8}><Form.Item name="reorder_level" label="Reorder Level" rules={[{ required: true, type: 'number' }]}><InputNumber style={{ width: '100%' }} min={0} /></Form.Item></Col>
          <Col span={8}><Form.Item name="unit_price" label="Unit Price (UGX)" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} min={0} /></Form.Item></Col>
        </Row>
      </Form>
    </Drawer>
  );
};