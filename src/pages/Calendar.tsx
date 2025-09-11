import { useState, useMemo } from 'react';
import { Calendar, Badge, Popover, List, Typography, Tag, Skeleton, Row, Col, Empty, Card, Space } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { WorkOrder, Technician, Vehicle } from '@/types/supabase';
import WorkOrderDetailsDrawer from '@/components/WorkOrderDetailsDrawer'; // Import the drawer
import Breadcrumbs from "@/components/Breadcrumbs"; // Import Breadcrumbs

const { Text, Title } = Typography;

const priorityColors: Record<string, string> = { High: "red", Medium: "gold", Low: "green" };

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [viewingWorkOrderId, setViewingWorkOrderId] = useState<string | null>(null);

  const { data: workOrders, isLoading: isLoadingWorkOrders } = useQuery<WorkOrder[]>({ queryKey: ['work_orders'], queryFn: async () => { const { data, error } = await supabase.from('work_orders').select('*'); if (error) throw new Error(error.message); return data || []; } });
  const { data: technicians, isLoading: isLoadingTechnicians } = useQuery<Technician[]>({ queryKey: ['technicians'], queryFn: async () => { const { data, error } = await supabase.from('technicians').select('*'); if (error) throw new Error(error.message); return data || []; } });
  const { data: vehicles, isLoading: isLoadingVehicles } = useQuery<Vehicle[]>({ queryKey: ['vehicles'], queryFn: async () => { const { data, error } = await supabase.from('vehicles').select('*'); if (error) throw new Error(error.message); return data || []; } });

  const scheduledWorkOrders = useMemo(() => (workOrders || []).filter(wo => wo.appointmentDate), [workOrders]);

  const getListData = (value: Dayjs) => scheduledWorkOrders.filter(wo => dayjs(wo.appointmentDate).isSame(value, 'day'));

  const handleDateSelect = (value: Dayjs) => {
    setSelectedDate(value);
    setViewingWorkOrderId(null); // Close any open drawer when a new date is selected
  };

  const dateCellRender = (value: Dayjs) => {
    const listData = getListData(value);

    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center', marginTop: '4px', minHeight: '20px' }}> {/* Added minHeight for stability */}
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
              <Badge dot color={priorityColor} style={{ cursor: 'pointer' }} />
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
      return <Empty description="No work orders scheduled for this day." />;
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
              onClick={() => setViewingWorkOrderId(item.id)}
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
    <Space direction="vertical" size="middle" style={{ width: '100%' }}> {/* Use Space for vertical layout */}
      <Breadcrumbs />
      <Row gutter={[24, 24]} style={{ height: 'calc(100vh - 112px - 24px)' }}> {/* Adjusted height calculation */}
        <Col xs={24} lg={16}> {/* Calendar column */}
          <Card title="Work Order Calendar" style={{ height: '100%' }}>
            <Calendar
              dateCellRender={dateCellRender}
              onSelect={handleDateSelect}
              value={selectedDate || dayjs()} // Highlight selected date or current day
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}> {/* Preview column */}
          <Card title={selectedDate ? `Work Orders for ${selectedDate.format('MMM D, YYYY')}` : 'Select a Date'} style={{ height: '100%', overflowY: 'auto' }}>
            {selectedDate ? (
              <WorkOrdersForSelectedDate />
            ) : (
              <Empty description="Select a date on the calendar to view scheduled work orders." />
            )}
          </Card>
        </Col>
      </Row>
      <WorkOrderDetailsDrawer workOrderId={viewingWorkOrderId} onClose={() => setViewingWorkOrderId(null)} />
    </Space>
  );
};

export default CalendarPage;