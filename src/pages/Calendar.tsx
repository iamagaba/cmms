import { useState, useMemo } from 'react';
import { Calendar, Badge, Popover, List, Typography, Tag, Skeleton } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { WorkOrder, Technician } from '@/types/supabase';

const { Text } = Typography;

const priorityColors: Record<string, string> = { High: "red", Medium: "gold", Low: "green" };

const CalendarPage = () => {
  const { data: workOrders, isLoading: isLoadingWorkOrders } = useQuery<WorkOrder[]>({ queryKey: ['work_orders'], queryFn: async () => { const { data, error } = await supabase.from('work_orders').select('*'); if (error) throw new Error(error.message); return data || []; } });
  const { data: technicians, isLoading: isLoadingTechnicians } = useQuery<Technician[]>({ queryKey: ['technicians'], queryFn: async () => { const { data, error } = await supabase.from('technicians').select('*'); if (error) throw new Error(error.message); return data || []; } });

  const scheduledWorkOrders = useMemo(() => (workOrders || []).filter(wo => wo.appointmentDate), [workOrders]);

  const getListData = (value: Dayjs) => scheduledWorkOrders.filter(wo => dayjs(wo.appointmentDate).isSame(value, 'day'));

  const dateCellRender = (value: Dayjs) => {
    const listData = getListData(value);
    if (listData.length === 0) return null;

    const popoverContent = (
      <List
        size="small"
        dataSource={listData}
        renderItem={(item: WorkOrder) => {
          const technician = technicians?.find(t => t.id === item.assignedTechnicianId);
          return (
            <List.Item>
              <List.Item.Meta
                avatar={<Tag color={priorityColors[item.priority || 'Low']}>{item.priority}</Tag>}
                title={<Link to={`/work-orders/${item.id}`}>{item.vehicleId}</Link>}
                description={<><Text>{item.service}</Text><br/>{technician && <Text type="secondary">{technician.name}</Text>}</>}
              />
            </List.Item>
          );
        }}
      />
    );

    return (
      <Popover content={popoverContent} title={`Appointments for ${value.format('MMM D')}`} trigger="hover">
        <ul className="events" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {listData.map(item => (
            <li key={item.id}>
              <Badge color={priorityColors[item.priority || 'Low']} text={`${dayjs(item.appointmentDate).format('h:mm A')} - ${item.vehicleId}`} />
            </li>
          ))}
        </ul>
      </Popover>
    );
  };

  if (isLoadingWorkOrders || isLoadingTechnicians) {
    return <Skeleton active />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Typography.Title level={4}>Work Order Calendar</Typography.Title>
      <Calendar dateCellRender={dateCellRender} />
    </div>
  );
};

export default CalendarPage;