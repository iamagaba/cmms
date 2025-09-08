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
import isBetween from 'dayjs/plugin/isBetween';
import { camelToSnakeCase } from "@/utils/data-helpers";
import WorkOrderDetailsDrawer from "@/components/WorkOrderDetailsDrawer";
import { useSearchParams } from "react-router-dom";
import PageHeader from "@/components/PageHeader";

dayjs.extend(isBetween);
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
      const { error } = await supabase.from('work_orders').upsert([workOrderData]);
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
  const kpiData = useMemo(() => {
    const orders = filteredWorkOrders || [];
    if (orders.length === 0) {
      const emptyTrend = { trend: undefined, trendDirection: undefined };
      return { 
        totalOrders: 0, 
        openOrders: 0, 
        slaPerformance: '0', 
        avgCompletionTime: '0.0', 
        totalOrdersTrend: emptyTrend, 
        openOrdersTrend: emptyTrend, 
        slaTrend: emptyTrend, 
        avgCompletionTimeTrend: emptyTrend 
      };
    }

    const now = dayjs();
    const sevenDaysAgo = now.subtract(7, 'days');
    const fourteenDaysAgo = now.subtract(14, 'days');

    const calculateTrend = (current: number, previous: number) => {
      if (previous === 0) {
        return { trend: current > 0 ? '100%' : '0%', trendDirection: current > 0 ? 'up' : undefined };
      }
      const percentageChange = ((current - previous) / previous) * 100;
      if (isNaN(percentageChange) || !isFinite(percentageChange)) {
        return { trend: '0%', trendDirection: undefined };
      }
      return {
        trend: `${Math.abs(percentageChange).toFixed(0)}%`,
        trendDirection: percentageChange > 0 ? 'up' : (percentageChange < 0 ? 'down' : undefined),
      };
    };

    // --- Data for periods ---
    const createdThisWeek = orders.filter(o => dayjs(o.createdAt).isAfter(sevenDaysAgo));
    const createdLastWeek = orders.filter(o => dayjs(o.createdAt).isBetween(fourteenDaysAgo, sevenDaysAgo));
    const completedThisWeek = orders.filter(o => o.status === 'Completed' && o.completedAt && dayjs(o.completedAt).isAfter(sevenDaysAgo));
    const completedLastWeek = orders.filter(o => o.status === 'Completed' && o.completedAt && dayjs(o.completedAt).isBetween(fourteenDaysAgo, sevenDaysAgo));

    // --- Main KPIs ---
    const totalOrders = orders.length;
    const openOrders = orders.filter(o => o.status !== 'Completed').length;
    const allCompleted = orders.filter(o => o.status === 'Completed' && o.completedAt && o.createdAt);
    const slaMet = allCompleted.filter(o => o.slaDue && dayjs(o.completedAt).isBefore(dayjs(o.slaDue))).length;
    const slaPerformance = allCompleted.length > 0 ? ((slaMet / allCompleted.length) * 100) : 0;
    const totalCompletionTime = allCompleted.reduce((acc, wo) => acc + dayjs(wo.completedAt).diff(dayjs(wo.createdAt), 'hour'), 0);
    const avgCompletionTimeDays = allCompleted.length > 0 ? (totalCompletionTime / allCompleted.length / 24).toFixed(1) : '0.0';

    // --- Trend KPIs ---
    const totalOrdersTrend = calculateTrend(createdThisWeek.length, createdLastWeek.length);
    const openOrdersNow = openOrders;
    const openOrdersLastWeek = orders.filter(o => dayjs(o.createdAt).isBefore(sevenDaysAgo) && (o.status !== 'Completed' || (o.completedAt && dayjs(o.completedAt).isAfter(sevenDaysAgo)))).length;
    const openOrdersTrend = calculateTrend(openOrdersNow, openOrdersLastWeek);
    const slaMetThisWeek = completedThisWeek.filter(o => o.slaDue && dayjs(o.completedAt).isBefore(dayjs(o.slaDue))).length;
    const slaPerfThisWeek = completedThisWeek.length > 0 ? (slaMetThisWeek / completedThisWeek.length) * 100 : 0;
    const slaMetLastWeek = completedLastWeek.filter(o => o.slaDue && dayjs(o.completedAt).isBefore(dayjs(o.slaDue))).length;
    const slaPerfLastWeek = completedLastWeek.length > 0 ? (slaMetLastWeek / completedLastWeek.length) * 100 : 0;
    const slaTrend = calculateTrend(slaPerfThisWeek, slaPerfLastWeek);
    const totalCompletionTimeThisWeek = completedThisWeek.reduce((acc, wo) => acc + dayjs(wo.completedAt).diff(dayjs(wo.createdAt), 'hour'), 0);
    const avgCompletionTimeThisWeek = completedThisWeek.length > 0 ? (totalCompletionTimeThisWeek / completedThisWeek.length) : 0;
    const totalCompletionTimeLastWeek = completedLastWeek.reduce((acc, wo) => acc + dayjs(wo.completedAt).diff(dayjs(wo.createdAt), 'hour'), 0);
    const avgCompletionTimeLastWeek = completedLastWeek.length > 0 ? (totalCompletionTimeLastWeek / completedLastWeek.length) : 0;
    const avgCompletionTimeTrend = calculateTrend(avgCompletionTimeThisWeek, avgCompletionTimeLastWeek);

    return {
      totalOrders,
      openOrders,
      slaPerformance: slaPerformance.toFixed(0),
      avgCompletionTime: avgCompletionTimeDays,
      totalOrdersTrend,
      openOrdersTrend,
      slaTrend,
      avgCompletionTimeTrend,
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
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={12} lg={6}><KpiCard title="Total Work Orders" value={kpiData.totalOrders.toString()} icon={<ToolOutlined />} trend={kpiData.totalOrdersTrend.trend} trendDirection={kpiData.totalOrdersTrend.trendDirection} /></Col>
        <Col xs={24} sm={12} md={12} lg={6}><KpiCard title="Open Work Orders" value={kpiData.openOrders.toString()} icon={<ExclamationCircleOutlined />} isUpGood={false} trend={kpiData.openOrdersTrend.trend} trendDirection={kpiData.openOrdersTrend.trendDirection} /></Col>
        <Col xs={24} sm={12} md={12} lg={6}><KpiCard title="SLA Performance" value={`${kpiData.slaPerformance}%`} icon={<CheckCircleOutlined />} trend={kpiData.slaTrend.trend} trendDirection={kpiData.slaTrend.trendDirection} /></Col>
        <Col xs={24} sm={12} md={12} lg={6}><KpiCard title="Avg. Completion Time" value={`${kpiData.avgCompletionTime} Days`} icon={<ClockCircleOutlined />} isUpGood={false} trend={kpiData.avgCompletionTimeTrend.trend} trendDirection={kpiData.avgCompletionTimeTrend.trendDirection} /></Col>
      </Row>
      <Row gutter={[16, 16]} align="stretch">
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
      <PageHeader
        title="Dashboard"
        hideSearch
        actions={
          <Segmented
            options={locationOptions}
            value={selectedLocation}
            onChange={(value) => setSelectedLocation(value as string)}
          />
        }
      />
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