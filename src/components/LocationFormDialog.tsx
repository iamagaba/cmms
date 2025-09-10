import { useEffect, useState } from "react";
import { Modal, Form, Input, Button } from "antd";
import { Location } from "@/types/supabase";
import { MapboxLocationSearchInput } from "./MapboxLocationSearchInput";

interface LocationFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Location) => void;
  location?: Location | null;
}

export const LocationFormDialog = ({ isOpen, onClose, onSave, location }: LocationFormDialogProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedLocationData, setSelectedLocationData] = useState<{ lat: number; lng: number; label: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (location) {
        form.setFieldsValue(location);
        if (location.lat && location.lng && location.address) {
          setSelectedLocationData({ lat: location.lat, lng: location.lng, label: location.address });
        } else {
          setSelectedLocationData(null);
        }
      } else {
        form.resetFields();
        setSelectedLocationData(null);
      }
    }
  }, [isOpen, location, form]);

  const handleLocationSelect = (data: { lat: number; lng: number; label: string }) => {
    setSelectedLocationData(data);
    form.setFieldsValue({ address: data.label });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      const locationToSave: Location = {
        id: location?.id,
        ...values,
        lat: selectedLocationData?.lat || null,
        lng: selectedLocationData?.lng || null,
      };
      
      onSave(locationToSave);
      onClose();
    } catch (info) {
      console.log('Validate Failed:', info);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={location ? "Edit Location" : "Add Location"}
      open={isOpen}
      onOk={handleSubmit}
      onCancel={onClose}
      destroyOnClose
      footer={[
        <Button key="back" onClick={onClose} disabled={loading}>Cancel</Button>,
        <Button key="submit" type="primary" onClick={handleSubmit} loading={loading}>Save</Button>,
      ]}
    >
      <Form form={form} layout="vertical" name="location_form">
        <Form.Item name="name" label="Location Name" rules={[{ required: true, message: 'Please input the location name!' }]}>
          <Input placeholder="e.g. GOGO Station - Wandegeya" />
        </Form.Item>
        <Form.Item name="address" label="Address" rules={[{ required: true, message: 'Please input the address!' }]}>
          <MapboxLocationSearchInput 
            onLocationSelect={handleLocationSelect} 
            initialValue={location?.address || ''} 
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};