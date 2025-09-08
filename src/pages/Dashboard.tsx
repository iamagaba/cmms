import { useState, useMemo } from "react";
import { Row, Col, Typography, Segmented, Badge, Space, Skeleton, Tabs } from "antd";
import KpiCard from "@/components/KpiCard";
import TechnicianStatusList from "@/components/TechnicianStatusList";
import WorkOrderKanban from "@/components/WorkOrderKanban";
import { CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined, ToolOutlined } from "@ant-design/icons";
import UrgentWorkOrders from "@/components/UrgentWorkOrders";
import { showSuccess, showInfo, showError } from "@/utils/toast";
import { OnHoldReasonDialog } from "@/components/OnHoldReasonDialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder, Technician, Location, Customer, Vehicle } from "@/types/supabase";
import dayjs from "dayjs";
import { camelToSnakeCase } from "@/utils/data-helpers";
import WorkOrderDetailsDrawer from "@/components/WorkOrderDetailsDrawer";
import { useSearchParams } from "react-router-dom";
import PageHeader from "@/components/PageHeader";

const { Title } = Typography;

const Dashboard = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [onHoldWorkOrder, setOnHoldWorkOrder] = useState<WorkOrder | null>(null);

  const viewingWorkOrderId = searchParams.get('view');

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

  const { data: customers, isLoading: isLoadingCustomers } = useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase.from('customers').select('*');
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
    
    workOrderMutation.mutate(camelToSnakeCase({ id, ...updates }));
  };

  const handleSaveOnHoldReason = (reason: string) => {
    if (!onHoldWorkOrder) return;
    const updates = { status: 'On Hold' as const, onHoldReason: reason };
    workOrderMutation.mutate(camelToSnakeCase({ id: onHoldWorkOrder.id, ...updates }));
    setOnHoldWorkOrder(null);
  };

  const handleViewDetails = (workOrderId: string) => {
    setSearchParams({ view: workOrderId });
  };

  const handleCloseDrawer = () => {
    setSearchParams({});
  };

  const filteredWorkOrders = useMemo(() => {
    if (!allWorkOrders) return [];
    return selectedLocation === 'all'
      ? allWorkOrders
      : allWorkOrders.filter(wo => wo.locationId === selectedLocation);
  }, [allWorkOrders, selectedLocation]);

  // KPI and Chart Data Calculations
  const { kpiData, chartData } = useMemo(() => {
    const orders = filteredWorkOrders || [];
    const totalOrders = orders.length;
    const openOrders = orders.filter(o => o.status !== 'Completed').length;
    const completedOrders = orders.filter(o => o.status === 'Completed');
    const slaMet = completedOrders.filter(o => o.completedAt && o.slaDue && dayjs(o.completedAt).isBefore(dayjs(o.slaDue))).length;
    const slaPerformance = completedOrders.length > 0 ? ((slaMet / completedOrders.length) * 100) : 0;

    // Chart data for the last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => dayjs().subtract(i, 'day')).reverse();
    const dailyNewOrders = last7Days.map(day => ({
      name: day.format('ddd'),
      value: orders.filter(wo => wo.createdAt && dayjs(wo.createdAt).isSame(day, 'day')).length,
    }));
    const dailyOpenOrders = last7Days.map(day => ({
        name: day.format('ddd'),
        value: orders.filter(wo => {
            if (!wo.createdAt) return false;
            const wasCreatedOnOrBefore = dayjs(wo.createdAt).startOf('day').diff(day.startOf('day')) <= 0;
            if (!wasCreatedOnOrBefore) return false;
            
            const isCompleted = wo.status === 'Completed';
            if (!isCompleted) return true;
            
            if (!wo.completedAt) return true;
            
            const wasCompletedAfter = dayjs(wo.completedAt).startOf('day').diff(day.startOf('day')) > 0;
            return wasCompletedAfter;
        }).length,
    }));
    const dailySlaPerformance = last7Days.map(day => {
        const completedOnDay = completedOrders.filter(wo => wo.completedAt && dayjs(wo.completedAt).isSame(day, 'day'));
        const metOnDay = completedOnDay.filter(wo => wo.slaDue && dayjs(wo.completedAt).isBefore(dayjs(wo.slaDue))).length;
        const perf = completedOnDay.length > 0 ? (metOnDay / completedOnDay.length) * 100 : 0;
        return { name: day.format('ddd'), value: perf };
    });

    return {
      kpiData: {
        totalOrders,
        openOrders,
        slaPerformance: slaPerformance.toFixed(0),
      },
      chartData: {
        total: dailyNewOrders,
        open: dailyOpenOrders,
        sla: dailySlaPerformance,
      }
    };
  }, [filteredWorkOrders]);

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
          <Badge count={allWorkOrders?.length || 0} showZero color="#6A0DAD" />
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
            <Badge count={count} showZero color="#6A0DAD" />
          </Space>
        ),
        value: loc.id
      }
    })
  ];

  const isLoading = isLoadingWorkOrders || isLoadingTechnicians || isLoadingLocations || isLoadingCustomers || isLoadingVehicles;

  if (isLoading) {
    return <Skeleton active paragraph={{ rows: 10 }} />;
  }

  const overviewTab = (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <PageHeader
        title="Overview"
        hideSearch
        actions={
          <Segmented
            options={locationOptions}
            value={selectedLocation}
            onChange={(value) => setSelectedLocation(value as string)}
          />
        }
      />
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={12} lg={6}><KpiCard title="Total Work Orders" value={kpiData.totalOrders.toString()} icon={<ToolOutlined />} chartData={chartData.total} /></Col>
        <Col xs={24} sm={12} md={12} lg={6}><KpiCard title="Open Work Orders" value={kpiData.openOrders.toString()} icon={<ExclamationCircleOutlined />} isUpGood={false} chartData={chartData.open} /></Col>
        <Col xs={24} sm={12} md={12} lg={6}><KpiCard title="SLA Performance" value={`${kpiData.slaPerformance}%`} icon={<CheckCircleOutlined />} chartData={chartData.sla} /></Col>
        <Col xs={24} sm={12} md={12} lg={6}><KpiCard title="Avg. Completion Time" value="3.2 Days" icon={<ClockCircleOutlined />} isUpGood={false} /></Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} xl={16}>
          <UrgentWorkOrders workOrders={allWorkOrders || []} technicians={technicians || []} />
        </Col>
        <Col xs={24} xl={8}>
          <TechnicianStatusList technicians={technicians || []} workOrders={allWorkOrders || []} />
        </Col>
      </Row>
    </Space>
  );

  const workOrderBoardTab = (
    <WorkOrderKanban 
      workOrders={filteredWorkOrders} 
      technicians={technicians || []}
      locations={locations || []}
      customers={customers || []}
      vehicles={vehicles || []}
      groupBy="status"
      columns={kanbanColumns}
      onUpdateWorkOrder={handleUpdateWorkOrder}
      onViewDetails={handleViewDetails}
    />
  );

  const tabItems = [
    { label: 'Dashboard', key: '1', children: overviewTab },
    { label: 'Work Order Board', key: '2', children: workOrderBoardTab },
  ];

  return (
    <>
      <Tabs defaultActiveKey="1" items={tabItems} />
      {onHoldWorkOrder && (
        <OnHoldReasonDialog
          isOpen={!!onHoldWorkOrder}
          onClose={() => setOnHoldWorkOrder(null)}
          onSave={handleSaveOnHoldReason}
        />
      )}
      <WorkOrderDetailsDrawer workOrderId={viewingWorkOrderId} onClose={handleCloseDrawer} />
    </>
  );
};

export default Dashboard;