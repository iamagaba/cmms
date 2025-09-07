import { useState, useMemo } from "react";
import { Row, Col, Typography, Segmented, Badge, Space, Skeleton } from "antd";
import KpiCard from "@/components/KpiCard";
import TechnicianStatusList from "@/components/TechnicianStatusList";
import WorkOrderKanban from "@/components/WorkOrderKanban";
import { CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined, ToolOutlined } from "@ant-design/icons";
import UrgentWorkOrders from "@/components/UrgentWorkOrders";
import { showSuccess, showInfo, showError } from "@/utils/toast";
import { OnHoldReasonDialog } from "@/components/OnHoldReasonDialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder, Technician, Location } from "@/types/supabase";
import dayjs from "dayjs";
import { camelToSnakeCase } from "@/utils/data-helpers"; // Import the utility

const { Title } = Typography;

// Removed generateChartData function

const Dashboard = () => {
  const queryClient = useQueryClient();
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [onHoldWorkOrder, setOnHoldWorkOrder] = useState<WorkOrder | null>(null);

  // Data Fetching
  const { data: allWorkOrders, isLoading: isLoadingWorkOrders } = useQuery<WorkOrder[]>({
    queryKey: ['work_orders'],
    queryFn: async () => {
      const { data, error } = await supabase.from('work_orders').select('*').order('created_at', { ascending: false });
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

  const { data: locations, isLoading: isLoadingLocations } = useQuery<Location[]>({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase.from('locations').select('*');
      if (error) throw new Error(error.message);
      return data || [];
    }
  });

  // Mutations
  const workOrderMutation = useMutation({
    mutationFn: async (workOrderData: Partial<WorkOrder>) => {
      const { error } = await supabase.from('work_orders').upsert(workOrderData);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work_orders'] });
      showSuccess('Work order has been updated.');
    },
    onError: (error) => showError(error.message),
  });

  const handleUpdateWorkOrder = (id: string, updates: Partial<WorkOrder>) => {
    const workOrder = allWorkOrders?.find(wo => wo.id === id);
    if (!workOrder) return;

    if (updates.status === 'On Hold') {
      setOnHoldWorkOrder(workOrder);
      return;
    }

    if ((updates.assignedTechnicianId || updates.appointmentDate) && workOrder.status === 'Ready') {
      updates.status = 'In Progress';
      showInfo(`Work Order ${workOrder.workOrderNumber} automatically moved to In Progress.`);
    }
    
    workOrderMutation.mutate(camelToSnakeCase({ id, ...updates })); // Apply camelToSnakeCase here
  };

  const handleSaveOnHoldReason = (reason: string) => {
    if (!onHoldWorkOrder) return;
    const updates = { status: 'On Hold' as const, onHoldReason: reason };
    workOrderMutation.mutate(camelToSnakeCase({ id: onHoldWorkOrder.id, ...updates })); // Apply camelToSnakeCase here
    setOnHoldWorkOrder(null);
  };

  const filteredWorkOrders = useMemo(() => {
    if (!allWorkOrders) return [];
    return selectedLocation === 'all'
      ? allWorkOrders
      : allWorkOrders.filter(wo => wo.locationId === selectedLocation);
  }, [allWorkOrders, selectedLocation]);

  const totalOrders = filteredWorkOrders.length;
  const openOrders = filteredWorkOrders.filter(o => o.status !== 'Completed').length;
  const completedOrders = filteredWorkOrders.filter(o => o.status === 'Completed').length;
  const slaMet = filteredWorkOrders.filter(o => o.status === 'Completed' && o.completedAt && o.slaDue && dayjs(o.completedAt).isBefore(dayjs(o.slaDue))).length;
  const slaPerformance = completedOrders > 0 ? ((slaMet / completedOrders) * 100).toFixed(0) : 0;

  const kanbanColumns = [
    { id: 'Open', title: 'Open' },
    { id: 'Confirmation', title: 'Confirmation' },
    { id: 'Ready', title: 'Ready' },
    { id: 'In Progress', title: 'In Progress' },
    { id: 'On Hold', title: 'On Hold' },
    { id: 'Completed', title: 'Completed' },
  ];

  const locationOptions = [
    { 
      label: (
        <Space>
          <span>All Locations</span>
          <Badge count={allWorkOrders?.length || 0} showZero color="#6A0DAD" /> {/* GOGO Brand Purple */}
        </Space>
      ), 
      value: 'all' 
    },
    ...(locations || []).map(loc => {
      const count = allWorkOrders?.filter(wo => wo.locationId === loc.id).length || 0;
      return {
        label: (
          <Space>
            <span>{loc.name.replace(' Service Center', '')}</span>
            <Badge count={count} showZero color="#6A0DAD" /> {/* GOGO Brand Purple */}
          </Space>
        ),
        value: loc.id
      }
    })
  ];

  const isLoading = isLoadingWorkOrders || isLoadingTechnicians || isLoadingLocations;

  if (isLoading) {
    return <Skeleton active paragraph={{ rows: 10 }} />;
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <UrgentWorkOrders workOrders={allWorkOrders || []} technicians={technicians || []} />
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <Title level={4} style={{ margin: 0 }}>Overview</Title>
            <Segmented
              options={locationOptions}
              value={selectedLocation}
              onChange={(value) => setSelectedLocation(value as string)}
            />
          </div>
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} md={12} lg={6}><KpiCard title="Total Work Orders" value={totalOrders.toString()} icon={<ToolOutlined />} trend="+5%" trendDirection="up" /></Col>
            <Col xs={24} sm={12} md={12} lg={6}><KpiCard title="Open Work Orders" value={openOrders.toString()} icon={<ExclamationCircleOutlined />} trend="+3" trendDirection="up" isUpGood={false} /></Col>
            <Col xs={24} sm={12} md={12} lg={6}><KpiCard title="SLA Performance" value={`${slaPerformance}%`} icon={<CheckCircleOutlined />} trend="+1.2%" trendDirection="up" /></Col>
            <Col xs={24} sm={12} md={12} lg={6}><KpiCard title="Avg. Completion Time" value="3.2 Days" icon={<ClockCircleOutlined />} trend="-0.2 Days" trendDirection="down" isUpGood={false} /></Col>
          </Row>
        </div>
        
        <Row gutter={[24, 24]}>
          <Col xs={24} xl={16}>
            <Title level={4}>Work Order Board</Title>
            <WorkOrderKanban 
              workOrders={filteredWorkOrders} 
              technicians={technicians || []}
              locations={locations || []}
              groupBy="status"
              columns={kanbanColumns}
              onUpdateWorkOrder={handleUpdateWorkOrder}
            />
          </Col>
          <Col xs={24} xl={8}>
            <Title level={4}>Team Status</Title>
            <TechnicianStatusList technicians={technicians || []} workOrders={allWorkOrders || []} />
          </Col>
        </Row>
      </div>
      {onHoldWorkOrder && (
        <OnHoldReasonDialog
          isOpen={!!onHoldWorkOrder}
          onClose={() => setOnHoldWorkOrder(null)}
          onSave={handleSaveOnHoldReason}
        />
      )}
    </>
  );
};

export default Dashboard;