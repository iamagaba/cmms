import { useState, useMemo } from 'react';
import { Modal, Button, Spin, Row, Col, Card, Typography, List, Tag, Empty, AutoComplete } from 'antd';
import { supabase } from '@/integrations/supabase/client';
import { Vehicle, Customer, WorkOrder } from '@/types/supabase';
import { showError } from '@/utils/toast';
import { Link } from 'react-router-dom';
import debounce from 'lodash.debounce';

const { Title, Text } = Typography;

interface CreateWorkOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: (vehicle: Vehicle) => void;
}

type VehicleWithCustomer = Vehicle & { customers: Customer | null };
interface VehicleOption {
  value: string;
  label: React.ReactNode;
  vehicle: VehicleWithCustomer;
}

export const CreateWorkOrderDialog = ({ isOpen, onClose, onProceed }: CreateWorkOrderDialogProps) => {
  const [searchValue, setSearchValue] = useState('');
  const [options, setOptions] = useState<VehicleOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleWithCustomer | null>(null);
  const [existingWorkOrders, setExistingWorkOrders] = useState<WorkOrder[]>([]);

  const fetchWorkOrdersForVehicle = async (vehicleId: string) => {
    setIsLoading(true);
    try {
      const { data: woData, error: woError } = await supabase
        .from('work_orders')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('created_at', { ascending: false });

      if (woError) throw woError;
      setExistingWorkOrders(woData || []);
    } catch (error: any) {
      showError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedSearch = useMemo(
    () =>
      debounce(async (value: string) => {
        if (!value || value.length < 2) {
          setOptions([]);
          return;
        }
        setIsLoading(true);
        try {
          const { data, error } = await supabase
            .from('vehicles')
            .select('*, customers(*)')
            .ilike('license_plate', `%${value}%`)
            .limit(10);

          if (error) throw error;

          const vehicleOptions = (data || []).map((vehicle: any) => ({
            value: vehicle.license_plate,
            label: (
              <div>
                <Text strong>{vehicle.license_plate}</Text><br/>
                <Text type="secondary">{vehicle.year} {vehicle.make} {vehicle.model}</Text>
              </div>
            ),
            vehicle: vehicle as VehicleWithCustomer,
          }));
          setOptions(vehicleOptions);
        } catch (error: any) {
          showError(error.message);
        } finally {
          setIsLoading(false);
        }
      }, 300),
    []
  );

  const handleSearch = (value: string) => {
    setSearchValue(value);
    setSelectedVehicle(null);
    setExistingWorkOrders([]);
    debouncedSearch(value);
  };

  const onSelect = (value: string, option: VehicleOption) => {
    setSearchValue(value);
    setSelectedVehicle(option.vehicle);
    fetchWorkOrdersForVehicle(option.vehicle.id);
  };

  const handleProceed = () => {
    if (selectedVehicle) {
      onProceed(selectedVehicle);
    }
  };

  const handleClose = () => {
    setSearchValue('');
    setOptions([]);
    setSelectedVehicle(null);
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
      <Text>Type a license plate to search for a vehicle.</Text>
      <AutoComplete
        options={options}
        onSelect={onSelect}
        onSearch={handleSearch}
        value={searchValue}
        style={{ width: '100%', marginTop: 8 }}
        placeholder="e.g., UBF 123X"
        notFoundContent={isLoading ? <Spin size="small" /> : null}
      />

      {selectedVehicle && (
        <div style={{ marginTop: 24 }}>
          <Row gutter={24}>
            <Col xs={24} md={10}>
              <Card>
                <Title level={5}>Vehicle Selected</Title>
                <Text strong>{selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}</Text><br/>
                <Text type="secondary">VIN: {selectedVehicle.vin}</Text><br/>
                <Text type="secondary">Owner: {selectedVehicle.customers?.name || 'N/A'}</Text>
                <Button type="primary" style={{ marginTop: 16, width: '100%' }} onClick={handleProceed}>
                  Create Work Order for this Vehicle
                </Button>
              </Card>
            </Col>
            <Col xs={24} md={14}>
              <Card>
                <Title level={5}>Existing Work Orders ({existingWorkOrders.length})</Title>
                {isLoading ? <Spin /> : existingWorkOrders.length > 0 ? (
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
        </div>
      )}
    </Modal>
  );
};