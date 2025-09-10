import { useState, useMemo, useEffect } from 'react';
import { Drawer, Button, Spin, Row, Col, Card, Typography, List, Tag, Empty, AutoComplete, Space } from 'antd';
import { supabase } from '@/integrations/supabase/client';
import { Vehicle, Customer, WorkOrder } from '@/types/supabase';
import { showError } from '@/utils/toast';
import { Link } from 'react-router-dom';
import debounce from 'lodash.debounce';

const { Title, Text } = Typography;

type VehicleWithCustomer = Vehicle & { customers: Customer | null };
interface VehicleOption {
  value: string;
  label: React.ReactNode;
  vehicle: VehicleWithCustomer;
}

interface CreateWorkOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: (vehicle: VehicleWithCustomer) => void;
  initialVehicle?: VehicleWithCustomer | null; // New prop for pre-filling from asset page
  initialCustomerId?: string | null; // New prop for filtering by customer
}

export const CreateWorkOrderDialog = ({ isOpen, onClose, onProceed, initialVehicle, initialCustomerId }: CreateWorkOrderDialogProps) => {
  const [searchValue, setSearchValue] = useState('');
  const [options, setOptions] = useState<VehicleOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleWithCustomer | null>(null);
  const [existingWorkOrders, setExistingWorkOrders] = useState<WorkOrder[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (initialVehicle) {
        setSelectedVehicle(initialVehicle);
        setSearchValue(initialVehicle.license_plate);
        fetchWorkOrdersForVehicle(initialVehicle.id);
      } else {
        // Reset state when dialog opens without initial data
        setSearchValue('');
        setOptions([]);
        setSelectedVehicle(null);
        setExistingWorkOrders([]);
      }
    }
  }, [isOpen, initialVehicle]);

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
          let query = supabase
            .from('vehicles')
            .select('*, customers(*)')
            .ilike('license_plate', `%${value}%`)
            .limit(10);

          if (initialCustomerId) {
            query = query.eq('customer_id', initialCustomerId);
          }

          const { data, error } = await query;

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
    [initialCustomerId]
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

  const handleProceedClick = () => {
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
    <Drawer
      title="Create New Work Order: Step 1"
      placement="right"
      onClose={handleClose}
      open={isOpen}
      width={800} // Default width for the drawer
      destroyOnClose
      footer={
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button key="back" onClick={handleClose} disabled={isLoading}>Cancel</Button>
          <Button key="submit" type="primary" onClick={handleProceedClick} disabled={!selectedVehicle || isLoading}>Proceed</Button>
        </Space>
      }
    >
      {!initialVehicle && ( // Only show search if no initial vehicle is provided
        <>
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
        </>
      )}

      {isLoading && !selectedVehicle && <div style={{ textAlign: 'center', padding: '48px 0' }}><Spin /></div>}

      {selectedVehicle && (
        <div style={{ marginTop: 24 }}>
          <Row gutter={24}>
            <Col xs={24} md={10}>
              <Card>
                <Title level={5}>Vehicle Selected</Title>
                <Text strong>{selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}</Text><br/>
                <Text type="secondary">VIN: {selectedVehicle.vin}</Text><br/>
                <Text type="secondary">Owner: {selectedVehicle.customers?.name || 'N/A'}</Text>
                {/* The "Create Work Order for this Vehicle" button is now in the footer */}
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

      {!isLoading && !selectedVehicle && searchValue && (
        <Empty description={`No vehicle found with license plate "${searchValue}". You can add a new asset in the Assets page.`} style={{ marginTop: 24 }} />
      )}
    </Drawer>
  );
};