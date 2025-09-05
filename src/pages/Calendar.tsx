import { useState, useMemo } from 'react';
import { Calendar, Badge, Popover, List, Typography, Avatar, Tag } from 'antd';
import { workOrders, technicians } from '@/data/mockData';
import dayjs, { Dayjs } from 'dayjs';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

const priorityColors: Record<string, string> = {
  High: "red",
  Medium: "gold",
  Low: "green",
};

const CalendarPage = () => {
  const [allWorkOrders] = useState(workOrders);

  const scheduledWorkOrders = useMemo(() => {
    return allWorkOrders.filter(wo => wo.appointmentDate);
  }, [allWorkOrders]);

  const getListData = (value: Dayjs) => {
    return scheduledWorkOrders.filter(wo => dayjs(wo.appointmentDate).isSame(value, 'day'));
  };

  const dateCellRender = (value: Dayjs) => {
    const listData = getListData(value);
    if (listData.length === 0) {
      return null;
    }

    const popoverContent = (
      <List
        size="small"
        dataSource={listData}
        renderItem={item => {
          const technician = technicians.find(t => t.id === item.assignedTechnicianId);
          return (
            <List.Item>
              <List.Item.Meta
                avatar={<Tag color={priorityColors[item.priority]}>{item.priority}</Tag>}
                title={<Link to={`/work-orders/${item.id}`}>{item.vehicleId}</Link>}
                description={
                  <>
                    <Text>{item.service}</Text><br/>
                    {technician && <Text type="secondary">{technician.name}</Text>}
                  </>
                }
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
              <Badge color={priorityColors[item.priority]} text={`${dayjs(item.appointmentDate).format('h:mm A')} - ${item.vehicleId}`} />
            </li>
          ))}
        </ul>
      </Popover>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Title level={4}>Work Order Calendar</Title>
      <Calendar dateCellRender={dateCellRender} />
    </div>
  );
};

export default CalendarPage;