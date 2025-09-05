import { Row, Col, Card, Typography, Skeleton } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { WorkOrder, Technician } from '@/types/supabase';

const { Title } = Typography;

const AnalyticsPage = () => {
  const { data: workOrders, isLoading: isLoadingWorkOrders } = useQuery<WorkOrder[]>({
    queryKey: ['work_orders'],
    queryFn: async () => {
      const { data, error } = await supabase.from('work_orders').select('*');
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

  const statusData = ['Open', 'In Progress', 'On Hold', 'Completed'].map(status => ({
    name: status,
    count: (workOrders || []).filter(wo => wo.status === status).length,
  }));

  const priorityData = ['High', 'Medium', 'Low'].map(priority => ({
    name: priority,
    value: (workOrders || []).filter(wo => wo.priority === priority).length,
  }));

  const technicianData = (technicians || []).map(tech => ({
    name: tech.name,
    completed: (workOrders || []).filter(wo => wo.assignedTechnicianId === tech.id && wo.status === 'Completed').length,
    open: (workOrders || []).filter(wo => wo.assignedTechnicianId === tech.id && wo.status !== 'Completed').length,
  }));

  const COLORS = { High: '#ff4d4f', Medium: '#faad14', Low: '#52c41a' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Title level={4}>Analytics Dashboard</Title>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card title="Work Orders by Status">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Legend /><Bar dataKey="count" fill="#1677ff" name="Work Orders" /></BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Work Orders by Priority">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={priorityData} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {priorityData.map((entry) => (<Cell key={`cell-${entry.name}`} fill={COLORS[entry.name as keyof typeof COLORS]} />))}
                </Pie>
                <Tooltip /><Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24}>
          <Card title="Technician Workload">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={technicianData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" allowDecimals={false} /><YAxis dataKey="name" type="category" width={100} /><Tooltip /><Legend /><Bar dataKey="completed" stackId="a" fill="#52c41a" name="Completed Tasks" /><Bar dataKey="open" stackId="a" fill="#faad14" name="Open Tasks" /></BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AnalyticsPage;