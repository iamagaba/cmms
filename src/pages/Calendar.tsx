import { useState, useMemo } from 'react';
import { Calendar, Badge, Popover, List, Typography, Skeleton, Row, Col, Empty, Card, Space } from 'antd';
import StatusChip from "@/components/StatusChip";
import dayjs, { Dayjs } from 'dayjs';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { WorkOrder, Technician, Vehicle } from '@/types/supabase';
import { snakeToCamelCase } from '@/utils/data-helpers';
import WorkOrderDetailsDrawer from '@/components/WorkOrderDetailsDrawer';
import AppBreadcrumb from "@/components/Breadcrumbs";

const { Text } = Typography;

const priorityColors: Record<string, string> = { High: "red", Medium: "gold", Low: "green" };

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [, setSearchParams] = useSearchParams(); // Initialize useSearchParams, ignore value

  const { data: workOrders, isLoading: isLoadingWorkOrders } = useQuery<WorkOrder[]>({ queryKey: ['work_orders'], queryFn: async () => { const { data, error } = await supabase.from('work_orders').select('*'); if (error) throw new Error(error.message); return (data || []).map(workOrder => snakeToCamelCase(workOrder) as WorkOrder); } });
  const { data: technicians } = useQuery<Technician[]>({ queryKey: ['technicians'], queryFn: async () => { const { data, error } = await supabase.from('technicians').select('*'); if (error) throw new Error(error.message); return (data || []).map(technician => snakeToCamelCase(technician) as Technician); } });
  const { data: vehicles } = useQuery<Vehicle[]>({ queryKey: ['vehicles'], queryFn: async () => { const { data, error } = await supabase.from('vehicles').select('*'); if (error) throw new Error(error.message); return (data || []).map(vehicle => snakeToCamelCase(vehicle) as Vehicle); } });

  const scheduledWorkOrders = useMemo(() => (workOrders || []).filter(wo => wo.appointmentDate), [workOrders]);

  const getListData = (value: Dayjs) => scheduledWorkOrders.filter(wo => dayjs(wo.appointmentDate).isSame(value, 'day'));

  const handleDateSelect = (value: Dayjs) => {
    setSelectedDate(value);
    setSearchParams({}); // Clear search params when a new date is selected (closes drawer)
  };

  const dateCellRender = (value: Dayjs) => {
    const listData = getListData(value);

    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center', marginTop: '4px', minHeight: '20px' }}>
        {listData.map(item => {
          const technician = technicians?.find(t => t.id === item.assignedTechnicianId);
          const vehicle = vehicles?.find(v => v.id === item.vehicleId);
          const priorityColor = priorityColors[item.priority || 'Low'];

          const popoverContent = (
            <Space direction="vertical" size={4}>
              <Text strong>{item.workOrderNumber}</Text>
              <Text>{item.service}</Text>
              {vehicle && <Text type="secondary">{vehicle.license_plate}</Text>}
              {technician && <Text type="secondary">Assigned to: {technician.name}</Text>}
              <Text type="secondary">Due: {dayjs(item.slaDue).format('MMM D, h:mm A')}</Text>
            </Space>
          );

          return (
            <Popover key={item.id} content={popoverContent} title="Work Order Details" trigger="hover">
              <Badge dot color={priorityColor} style={{ cursor: 'pointer' }} className="calendar-badge-dot" />
            </Popover>
          );
        })}
      </div>
    );
  };

  const WorkOrdersForSelectedDate = () => {
    if (!selectedDate) return null;
    const dailyOrders = getListData(selectedDate);

    if (dailyOrders.length === 0) {
      return <Empty description="No appointments scheduled for this day." />;
    }

    return (
      <List
        itemLayout="horizontal"
        dataSource={dailyOrders}
        renderItem={item => {
          const technician = technicians?.find(t => t.id === item.assignedTechnicianId);
          const vehicle = vehicles?.find(v => v.id === item.vehicleId);
          return (
            <List.Item
              key={item.id}
              onClick={() => setSearchParams({ view: item.id })} // Update search params to open drawer
              style={{ cursor: 'pointer', padding: '12px 0' }}
            >
              <List.Item.Meta
avatar={<StatusChip kind="priority" value={item.priority || 'Low'} />}
                title={<Text strong>{item.workOrderNumber}</Text>}
                description={
                  <Space direction="vertical" size={0}>
                    <Text>{item.service}</Text>
                    {vehicle && <Text type="secondary">{vehicle.license_plate}</Text>}
                    {technician && <Text type="secondary">Assigned to: {technician.name}</Text>}
                    <Text type="secondary">Due: {dayjs(item.slaDue).format('MMM D, h:mm A')}</Text>
                  </Space>
                }
              />
            </List.Item>
          );
        }}
      />
    );
  };

  if (isLoadingWorkOrders) {
    return <Skeleton active />;
  }

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
  <AppBreadcrumb />
      <Row gutter={[24, 24]} style={{ height: 'calc(100vh - 112px - 24px)' }}>
        <Col xs={24} lg={16}>
          <Card title="Appointments Calendar" style={{ height: '100%' }}>
            <Calendar
              dateCellRender={dateCellRender}
              onSelect={handleDateSelect}
              value={selectedDate || dayjs()}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title={selectedDate ? `Appointments for ${selectedDate.format('MMM D, YYYY')}` : 'Select a Date'} style={{ height: '100%', overflowY: 'auto' }}>
            {selectedDate ? (
              <WorkOrdersForSelectedDate />
            ) : (
              <Empty description="Select a date on the calendar to view scheduled appointments." />
            )}
          </Card>
        </Col>
      </Row>
      <WorkOrderDetailsDrawer onClose={() => setSearchParams({})} />
    </Space>
  );
};

export default CalendarPage;