import { useState } from 'react';
import { Modal, Input, Button, Spin, Row, Col, Card, Typography, List, Tag, Empty } from 'antd';
import { supabase } from '@/integrations/supabase/client';
import { Vehicle, Customer, WorkOrder } from '@/types/supabase';
import { showError } from '@/utils/toast';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

interface CreateWorkOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: (vehicle: Vehicle) => void;
}

type VehicleWithCustomer = Vehicle & { customers: Customer | null };

export const CreateWorkOrderDialog = ({ isOpen, onClose, onProceed }: CreateWorkOrderDialogProps) => {
  const [licensePlate, setLicensePlate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [foundVehicle, setFoundVehicle] = useState<VehicleWithCustomer | null>(null);
  const [existingWorkOrders, setExistingWorkOrders] = useState<WorkOrder[]>([]);

  const handleSearch = async () => {
    if (!licensePlate.trim()) {
      showError('Please enter a license plate.');
      return;
    }
    setIsLoading(true);
    setSearched(true);
    setFoundVehicle(null);
    setExistingWorkOrders([]);

    try {
      // Search for the vehicle
      const { data: vehicleData, error: vehicleError } = await supabase
        .from('vehicles')
        .select('*, customers(*)')
        .eq('license_plate', licensePlate.trim().toUpperCase())
        .single();

      if (vehicleError && vehicleError.code !== 'PGRST116') { // PGRST116 is "No rows found"
        throw vehicleError;
      }

      if (vehicleData) {
        setFoundVehicle(vehicleData as VehicleWithCustomer);
        // Search for existing work orders for this vehicle
        const { data: woData, error: woError } = await supabase
          .from('work_orders')
          .select('*')
          .eq('vehicle_id', vehicleData.id)
          .order('created_at', { ascending: false });

        if (woError) throw woError;
        setExistingWorkOrders(woData || []);
      }
    } catch (error: any) {
      showError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceed = () => {
    if (foundVehicle) {
      onProceed(foundVehicle);
    }
  };

  const handleClose = () => {
    setLicensePlate('');
    setSearched(false);
    setFoundVehicle(null);
    setExistingWorkOrders([]);
    onClose();
  };

  return (
    <Modal
      title="Create New Work Order: Step 1"
      open={isOpen}
      onCancel={handleClose}
      footer={null}
      width={800}
      destroyOnClose
    >
      <Row gutter={16} align="bottom">
        <Col flex="auto">
          <Text>Enter the vehicle's license plate to begin.</Text>
          <Input
            placeholder="e.g., UBF 123X"
            value={licensePlate}
            onChange={(e) => setLicensePlate(e.target.value)}
            onPressEnter={handleSearch}
          />
        </Col>
        <Col>
          <Button type="primary" onClick={handleSearch} loading={isLoading}>
            Search
          </Button>
        </Col>
      </Row>

      {isLoading && <div style={{ textAlign: 'center', padding: '48px 0' }}><Spin /></div>}

      {!isLoading && searched && (
        <div style={{ marginTop: 24 }}>
          {foundVehicle ? (
            <Row gutter={24}>
              <Col xs={24} md={10}>
                <Card>
                  <Title level={5}>Vehicle Found</Title>
                  <Text strong>{foundVehicle.year} {foundVehicle.make} {foundVehicle.model}</Text><br/>
                  <Text type="secondary">VIN: {foundVehicle.vin}</Text><br/>
                  <Text type="secondary">Owner: {foundVehicle.customers?.name || 'N/A'}</Text>
                  <Button type="primary" style={{ marginTop: 16, width: '100%' }} onClick={handleProceed}>
                    Create Work Order for this Vehicle
                  </Button>
                </Card>
              </Col>
              <Col xs={24} md={14}>
                <Card>
                  <Title level={5}>Existing Work Orders ({existingWorkOrders.length})</Title>
                  {existingWorkOrders.length > 0 ? (
                    <List
                      dataSource={existingWorkOrders}
                      renderItem={item => (
                        <List.Item>
                          <List.Item.Meta
                            title={<Link to={`/work-orders/${item.id}`} target="_blank" rel="noopener noreferrer">{item.workOrderNumber}</Link>}
                            description={item.service}
                          />
                          <Tag>{item.status}</Tag>
                        </List.Item>
                      )}
                    />
                  ) : (
                    <Empty description="No existing work orders found for this vehicle." />
                  )}
                </Card>
              </Col>
            </Row>
          ) : (
            <Empty description={`No vehicle found with license plate "${licensePlate}". You can add a new asset in the Assets page.`} />
          )}
        </div>
      )}
    </Modal>
  );
};