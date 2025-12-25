import { Table, Card, Space, Typography, Avatar, Empty, Button } from 'antd';
import StatusChip from '@/components/StatusChip';
import { Icon } from '@iconify/react';
import { WorkOrder, Technician, Vehicle } from '@/types/supabase';
import { formatDistanceToNow, isPast } from 'date-fns';
import React from 'react';

const { Text } = Typography;

interface UrgentWorkOrdersTableProps {
  workOrders: WorkOrder[];
  technicians: Technician[];
  vehicles: Vehicle[];
  onViewDetails?: (workOrderId: string) => void;
}

const UrgentWorkOrdersTable: React.FC<UrgentWorkOrdersTableProps> = ({ workOrders, technicians, vehicles, onViewDetails }) => {
  const now = new Date();
  const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const vehicleMap = React.useMemo(() => {
    const map = new Map(vehicles.map(v => [v.id, v]));
    console.log('UrgentWorkOrders - Vehicles loaded:', vehicles.length, 'vehicles');
    console.log('UrgentWorkOrders - Vehicle IDs in work orders:', workOrders.map(wo => wo.vehicleId).filter(Boolean));
    return map;
  }, [vehicles, workOrders]);

  const urgentOrders = workOrders
    .filter(wo => {
      if (wo.status === 'Completed' || !wo.slaDue) return false;
      const dueDate = new Date(wo.slaDue);
      return isPast(dueDate) || dueDate < twentyFourHoursFromNow;
    })
    .sort((a, b) => new Date(a.slaDue!).getTime() - new Date(b.slaDue!).getTime());

  const columns = [
    {
      title: 'License Plate',
      dataIndex: 'vehicleId',
      key: 'vehicleId',
      render: (_: string, record: WorkOrder) => {
        // Try to get license plate from vehicleId. Support both camelCase and snake_case field names.
        let licensePlate: string | undefined;
        if (record.vehicleId) {
          const vehicle = vehicleMap.get(record.vehicleId);
          if (vehicle) {
            // Some data paths may have been camelCased (licensePlate) or left as snake_case (license_plate)
            licensePlate = (vehicle as any).licensePlate || (vehicle as any).license_plate || (vehicle as any).plate;
          }
        }

        // Fallbacks: try record.vehicleModel or record.vehicleId
        if (!licensePlate && record.vehicleModel) licensePlate = record.vehicleModel as any;
        if (!licensePlate && record.vehicleId) licensePlate = record.vehicleId;

        return licensePlate ? <Text>{licensePlate}</Text> : <Text type="secondary">N/A</Text>;
      },
    },
    {
      title: 'Service',
      dataIndex: 'service',
      key: 'service',
    },
    {
      title: 'Technician',
      dataIndex: 'assignedTechnicianId',
      key: 'assignedTechnicianId',
      render: (techId: string) => {
        const tech = technicians.find(t => t.id === techId);
        return tech ? (
          <Space>
            <Avatar size="small" src={tech.avatar || undefined} icon={<Icon icon="ph:user-fill" />} />
            <Text>{tech.name}</Text>
          </Space>
        ) : (
          <Text type="secondary">Unassigned</Text>
        );
      },
    },
    {
      title: 'Client Location',
      dataIndex: 'customerAddress',
      key: 'customerAddress',
      render: (address: string) => address ? (
        <Space>
          <Icon icon="ph:map-pin-fill" style={{ marginRight: 4 }} />
          <Text>{address}</Text>
        </Space>
      ) : <Text type="secondary">N/A</Text>,
    },
    {
      title: 'Due Status',
      dataIndex: 'slaDue',
      key: 'dueStatus',
      render: (slaDue: string) => {
        const dueDate = new Date(slaDue);
        const isOverdue = isPast(dueDate);
        return <StatusChip kind="custom" value={isOverdue ? 'Overdue' : 'Due Soon'} color={isOverdue ? '#EF4444' : '#F59E0B'} />;
      },
    },
    {
      title: 'Due In',
      dataIndex: 'slaDue',
      key: 'dueIn',
      render: (slaDue: string) => <Text type="secondary" style={{ fontSize: 12 }}>{formatDistanceToNow(new Date(slaDue), { addSuffix: true })}</Text>,
    },
  ];

  return (
  <Card size="small" title={<Space><Icon icon="ph:warning-fill" style={{ color: '#faad14' }} /><Text>Urgent Work Orders</Text></Space>} style={{ height: '100%' }}>
      {urgentOrders.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <>
              <div>No urgent work orders</div>
              <Button type="primary" style={{ marginTop: 12 }} onClick={() => window.location.reload()}>
                Refresh
              </Button>
            </>
          }
        />
      ) : (
        <Table
          dataSource={urgentOrders}
          columns={columns}
          rowKey="id"
          pagination={false}
          onRow={(record) => ({
            onClick: () => onViewDetails && onViewDetails(record.id),
            style: { cursor: onViewDetails ? 'pointer' : undefined },
          })}
          size="small"
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <>
                    <div>No urgent work orders</div>
                    <Button type="primary" style={{ marginTop: 12 }} onClick={() => window.location.reload()}>
                      Refresh
                    </Button>
                  </>
                }
              />
            ),
          }}
        />
      )}
    </Card>
  );
};

export default UrgentWorkOrdersTable;
