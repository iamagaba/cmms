import { Row, Col, Card, Typography, Skeleton, DatePicker } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { WorkOrder, Technician } from '@/types/supabase';
import KpiCard from '@/components/KpiCard';
import { CheckCircleOutlined, ClockCircleOutlined, ToolOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useState } from 'react';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const AnalyticsPage = () => {
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([dayjs().subtract(30, 'days'), dayjs()]);

  const { data: workOrders, isLoading: isLoadingWorkOrders } = useQuery<WorkOrder[]>({
    queryKey: ['work_orders', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('work_orders')
        .select('*')
        .gte('created_at', dateRange[0].toISOString())
        .lte('created_at', dateRange[1].toISOString());
      if (error) throw new Error(error.message);
      return data || [];
    }
  });

  const { data: technicians, isLoading: isLoadingTechnicians } = useQuery<Technician[]>({
    queryKey: ['technicians'],
    queryFn: async () => {
      const { data, error } = await supabase.from('technicians').select('*');
      if (error) throw new Error(error.message);
      return data || [];
    }
  });

  if (isLoadingWorkOrders || isLoadingTechnicians) {
    return <Skeleton active />;
  }

  // KPI Calculations
  const completedOrders = (workOrders || []).filter(wo => wo.status === 'Completed' && wo.completedAt && wo.createdAt);
  const slaMetCount = completedOrders.filter(wo => wo.slaDue && dayjs(wo.completedAt).isBefore(dayjs(wo.slaDue))).length;
  const slaCompliance = completedOrders.length > 0 ? (slaMetCount / completedOrders.length * 100).toFixed(1) : '0.0';
  
  const totalCompletionTime = completedOrders.reduce((acc, wo) => {
    const completionTime = dayjs(wo.completedAt).diff(dayjs(wo.createdAt), 'hour');
    return acc + completionTime;
  }, 0);
  const avgCompletionTimeHours = completedOrders.length > 0 ? (totalCompletionTime / completedOrders.length).toFixed(1) : '0.0';

  // Chart Data Processing
  const statusData = ['Open', 'In Progress', 'On Hold', 'Completed'].map(status => ({
    name: status,
    count: (workOrders || []).filter(wo => wo.status === status).length,
  }));

  const workOrdersByDate = (workOrders || []).reduce((acc, wo) => {
    const date = dayjs(wo.createdAt).format('YYYY-MM-DD');
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const workOrdersOverTimeData = Object.keys(workOrdersByDate).map(date => ({
    date,
    count: workOrdersByDate[date],
  })).sort((a, b) => dayjs(a.date).unix() - dayjs(b.date).unix());

  const serviceData = (workOrders || []).reduce((acc, wo) => {
    if (wo.service) {
      const serviceName = wo.service.split(' - ')[0]; // Basic grouping
      acc[serviceName] = (acc[serviceName] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const serviceDistributionData = Object.keys(serviceData).map(name => ({
    name,
    value: serviceData[name],
  }));

  const technicianPerformance = (technicians || []).map(tech => ({
    name: tech.name,
    completed: (workOrders || []).filter(wo => wo.assignedTechnicianId === tech.id && wo.status === 'Completed').length,
  })).sort((a, b) => b.completed - a.completed).slice(0, 10);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Row justify="space-between" align="middle">
        <Col><Title level={4}>Analytics Dashboard</Title></Col>
        <Col><RangePicker value={dateRange} onChange={(dates) => dates && setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])} /></Col>
      </Row>
      
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}><KpiCard title="Total Work Orders" value={(workOrders || []).length.toString()} icon={<ToolOutlined />} /></Col>
        <Col xs={24} sm={12} lg={6}><KpiCard title="Avg. Completion Time" value={`${avgCompletionTimeHours} hrs`} icon={<ClockCircleOutlined />} /></Col>
        <Col xs={24} sm={12} lg={6}><KpiCard title="SLA Compliance" value={`${slaCompliance}%`} icon={<CheckCircleOutlined />} /></Col>
        <Col xs={24} sm={12} lg={6}><KpiCard title="Active Technicians" value={(technicians || []).length.toString()} icon={<UserOutlined />} /></Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card title="Work Orders Over Time">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={workOrdersOverTimeData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis allowDecimals={false} /><Tooltip /><Legend /><Line type="monotone" dataKey="count" stroke="#8884d8" name="New Work Orders" /></LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Work Orders by Status">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData} layout="vertical"><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" allowDecimals={false} /><YAxis dataKey="name" type="category" width={80} /><Tooltip /><Bar dataKey="count" fill="#1677ff" name="Work Orders" /></BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card title="Technician Performance (Completed Orders)">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={technicianPerformance}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Legend /><Bar dataKey="completed" fill="#52c41a" name="Completed Tasks" /></BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Service Type Distribution">
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie data={serviceDistributionData} cx="50%" cy="50%" labelLine={false} outerRadius={120} fill="#8884d8" dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {serviceDistributionData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                </Pie>
                <Tooltip /><Legend layout="vertical" verticalAlign="middle" align="right" />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AnalyticsPage;