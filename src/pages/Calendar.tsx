import { useState, useMemo } from 'react';
import { Calendar, Badge, Popover, List, Typography, Tag, Skeleton, Row, Col, Empty, Card, Space } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { WorkOrder, Technician, Vehicle } from '@/types/supabase';
import WorkOrderDetailsDrawer from '@/components/WorkOrderDetailsDrawer';
import Breadcrumbs from "@/components/Breadcrumbs";

const { Text, Title } = Typography;

const priorityColors: Record<string, string> = { High: "red", Medium: "gold", Low: "green" };

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const { data: workOrders, isLoading: isLoadingWorkOrders } = useQuery<WorkOrder[]>({ queryKey: ['work_orders'], queryFn: async () => { const { data, error } = await supabase.from('work_orders').select('*'); if (error) throw new Error(error.message); return data || []; } });
  const { data: technicians, isLoading: isLoadingTechnicians } = useQuery<Technician[]>({ queryKey: ['technicians'], queryFn: async () => { const { data, error } = await supabase.from('technicians').select('*'); if (error) throw new Error(error.message); return data || []; } });
  const { data: vehicles, isLoading: isLoadingVehicles } = useQuery<Vehicle[]>({ queryKey: ['vehicles'], queryFn: async () => { const { data, error } = await supabase.from('vehicles').select('*'); if (error) throw new Error(error.message); return data || []; } });

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
              onClick={() => setSearchParams({ view: item.id })}
              style={{ cursor: 'pointer', padding: '12px 0' }}
            >
              <List.Item.Meta
                avatar={<Tag color={priorityColors[item.priority || 'Low']}>{item.priority}</Tag>}
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

  if (isLoadingWorkOrders || isLoadingTechnicians || isLoadingVehicles) {
    return <Skeleton active />;
  }

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Breadcrumbs />
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