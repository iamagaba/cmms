import { useParams, Link, useNavigate } from "react-router-dom";
import { Avatar, Card, Col, Row, Typography, Tag, Descriptions, Table, Button, Space, Skeleton, Statistic, Select } from "antd";
import { Icon } from '@iconify/react'; // Import Icon from Iconify
import dayjs from "dayjs";
import NotFound from "./NotFound";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Technician, WorkOrder, Location, Vehicle } from "@/types/supabase";
import { useMemo } from "react";
import Breadcrumbs from "@/components/Breadcrumbs"; // Import Breadcrumbs
import { useSession } from "@/context/SessionContext"; // Import useSession
import { showSuccess, showError } from "@/utils/toast"; // Import toast utilities
import { camelToSnakeCase, snakeToCamelCase } from "@/utils/data-helpers"; // Import camelToSnakeCase and snakeToCamelCase

const { Title, Text } = Typography;
const { Option } = Select;

const statusColorMap: Record<string, string> = { available: 'success', busy: 'warning', offline: 'default' };
const statusTextMap: Record<string, string> = { available: 'Available', busy: 'Busy', offline: 'Offline' };
const priorityColors: Record<string, string> = { High: "red", Medium: "gold", Low: "green" };

const TechnicianProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { session } = useSession();
  const currentUserId = session?.user?.id;

  const { data: technician, isLoading: isLoadingTechnician } = useQuery<Technician | null>({
    queryKey: ['technician', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase.from('technicians').select('*').eq('id', id).single();
      if (error) throw new Error(error.message);
      return snakeToCamelCase(data) as Technician; // Apply snakeToCamelCase
    },
    enabled: !!id,
  });

  const { data: assignedWorkOrders, isLoading: isLoadingWorkOrders } = useQuery<WorkOrder[]>({
    queryKey: ['work_orders', { technicianId: id }],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase.from('work_orders').select('*').eq('assigned_technician_id', id);
      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!id,
  });

  const { data: locations, isLoading: isLoadingLocations } = useQuery<Location[]>({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase.from('locations').select('*');
      if (error) throw new Error(error.message);
      return data || [];
    }
  });

  const { data: vehicles, isLoading: isLoadingVehicles } = useQuery<Vehicle[]>({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('vehicles').select('*');
      if (error) throw new Error(error.message);
      return data || [];
    }
  });

  const updateTechnicianStatusMutation = useMutation({
    mutationFn: async (newStatus: Technician['status']) => {
      if (!id) throw new Error("Technician ID is missing.");
      const { error } = await supabase
        .from('technicians')
        .update(camelToSnakeCase({ status: newStatus })) // Convert to snake_case
        .eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technician', id] });
      showSuccess('Technician status updated successfully!');
    },
    onError: (error) => showError(`Failed to update status: ${error.message}`),
  });

  const performanceMetrics = useMemo(() => {
    if (!assignedWorkOrders) return null;

    const completedOrders = assignedWorkOrders.filter(wo => wo.status === 'Completed' && wo.created_at && wo.completedAt); // Use created_at
    const totalCompleted = completedOrders.length;
    const activeTasks = assignedWorkOrders.length - totalCompleted;

    const totalCompletionHours = completedOrders.reduce((acc, wo) => acc + dayjs(wo.completedAt).diff(dayjs(wo.created_at), 'hour'), 0); // Use created_at
    const avgResolutionTime = totalCompleted > 0 ? (totalCompletionHours / totalCompleted).toFixed(1) : '0';

    const completedWithSla = completedOrders.filter(wo => wo.slaDue);
    const slaMetCount = completedWithSla.filter(wo => wo.slaDue && dayjs(wo.completedAt).isBefore(dayjs(wo.slaDue))).length;
    const slaCompliance = completedWithSla.length > 0 ? ((slaMetCount / completedWithSla.length) * 100).toFixed(1) : '100';

    return { totalCompleted, activeTasks, avgResolutionTime, slaCompliance };
  }, [assignedWorkOrders]);

  const isLoading = isLoadingTechnician || isLoadingWorkOrders || isLoadingLocations || isLoadingVehicles;

  if (isLoading) {
    return <Skeleton active />;
  }

  if (!technician) {
    return <NotFound />;
  }

  const assignedLocation = locations?.find(loc => loc.id === technician.location_id);
  const isCurrentUserTechnician = currentUserId === technician.id;

  const workOrderColumns = [
    { title: 'ID', dataIndex: 'workOrderNumber', render: (text: string, record: WorkOrder) => <Link to={`/work-orders/${record.id}`}><Text code>{text}</Text></Link> },
    { title: 'Vehicle', dataIndex: 'vehicleId', render: (vehicleId: string) => {
        const vehicle = vehicles?.find(v => v.id === vehicleId);
        return vehicle ? `${vehicle.make} ${vehicle.model}` : 'N/A';
    }},
    { title: 'Priority', dataIndex: 'priority', render: (priority: string) => <Tag color={priorityColors[priority]}>{priority}</Tag> },
    { title: 'Location', dataIndex: 'locationId', render: (locId: string) => locations?.find(l => l.id === locId)?.name?.replace(' Service Center', '') || 'N/A' },
    { title: 'Due Date', dataIndex: 'slaDue', render: (date: string) => dayjs(date).format('MMM D, YYYY') },
  ];

  const backButton = (
    <Button icon={<Icon icon="ph:arrow-left-fill" />} onClick={() => navigate('/technicians')} />
  );

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Breadcrumbs backButton={backButton} />
        {performanceMetrics && (
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}><Card><Statistic title="Completed Jobs" value={performanceMetrics.totalCompleted} prefix={<Icon icon="ph:wrench-fill" />} /></Card></Col>
            <Col xs={24} sm={12} lg={6}><Card><Statistic title="Active Tasks" value={performanceMetrics.activeTasks} prefix={<Icon icon="ph:clipboard-text-fill" />} /></Card></Col>
            <Col xs={24} sm={12} lg={6}><Card><Statistic title="Avg. Resolution Time" value={performanceMetrics.avgResolutionTime} suffix="hrs" prefix={<Icon icon="ph:hourglass-fill" />} /></Card></Col>
            <Col xs={24} sm={12} lg={6}><Card><Statistic title="SLA Compliance" value={performanceMetrics.slaCompliance} suffix="%" prefix={<Icon icon="ph:check-circle-fill" />} /></Card></Col>
          </Row>
        )}
        <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
                <Card>
                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                        <Avatar size={128} src={technician.avatar || undefined}>{technician.name.split(' ').map(n => n[0]).join('')}</Avatar>
                        <Title level={4} style={{ marginTop: 16 }}>{technician.name}</Title>
                        {isCurrentUserTechnician ? (
                          <Select
                            value={technician.status || 'offline'}
                            onChange={(value) => updateTechnicianStatusMutation.mutate(value)}
                            style={{ width: 120, marginTop: 8 }}
                            loading={updateTechnicianStatusMutation.isPending}
                          >
                            <Option value="available"><Tag color={statusColorMap["available"]}>Available</Tag></Option>
                            <Option value="busy"><Tag color={statusColorMap["busy"]}>Busy</Tag></Option>
                            <Option value="offline"><Tag color={statusColorMap["offline"]}>Offline</Tag></Option>
                          </Select>
                        ) : (
                          <Tag color={statusColorMap[technician.status || 'offline']} style={{ marginTop: 8 }}>{statusTextMap[technician.status || 'offline']}</Tag>
                        )}
                    </div>
                    <Descriptions column={1} bordered>
                        <Descriptions.Item label={<><Icon icon="ph:envelope-fill" /> Email</>}><a href={`mailto:${technician.email}`}>{technician.email}</a></Descriptions.Item>
                        <Descriptions.Item label={<><Icon icon="ph:phone-fill" /> Phone</>}><a href={`tel:${technician.phone}`}>{technician.phone}</a></Descriptions.Item>
                        <Descriptions.Item label={<><Icon icon="ph:wrench-fill" /> Specialization</>}>{technician.specializations?.join(', ') || 'N/A'}</Descriptions.Item>
                        <Descriptions.Item label={<><Icon icon="ph:map-pin-fill" /> Location</>}>
                          {assignedLocation ? (
                            <Link to={`/locations/${assignedLocation.id}`}>{assignedLocation.name}</Link>
                          ) : (
                            <Text type="secondary">Not Assigned</Text>
                          )}
                        </Descriptions.Item>
                        <Descriptions.Item label={<><Icon icon="ph:calendar-fill" /> Member Since</>}>{dayjs(technician.join_date).format('MMMM YYYY')}</Descriptions.Item>
                    </Descriptions>
                </Card>
            </Col>
            <Col xs={24} md={16}>
                <Card>
                    <Title level={5}>Assigned Work Orders ({assignedWorkOrders?.length || 0})</Title>
                    <Table 
                        dataSource={assignedWorkOrders} 
                        columns={workOrderColumns} 
                        rowKey="id"
                        pagination={{ pageSize: 5 }}
                    />
                </Card>
            </Col>
        </Row>
    </Space>
  );
};

export default TechnicianProfilePage;