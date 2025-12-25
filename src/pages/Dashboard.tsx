import { useState, useMemo } from "react";
import { Row, Col, Segmented, Badge, Space, Skeleton, Tabs, theme } from "antd";
import KpiCard from "@/components/KpiCard";
import TechnicianStatusList from "@/components/TechnicianStatusList";
import WorkOrderKanban from "@/components/WorkOrderKanban";
import { Icon } from '@iconify/react'; // Import Icon from Iconify
import UrgentWorkOrdersTable from "@/components/UrgentWorkOrdersTable";
import { showSuccess, showInfo, showError } from "@/utils/toast";
import { OnHoldReasonDialog } from "@/components/OnHoldReasonDialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder, Technician, Location, Customer, Vehicle, Profile } from "@/types/supabase";
import dayjs from "dayjs";
import isBetween from 'dayjs/plugin/isBetween';
import { camelToSnakeCase, snakeToCamelCase } from "@/utils/data-helpers";
import WorkOrderDetailsDrawer from "@/components/WorkOrderDetailsDrawer";
import { useSearchParams } from "react-router-dom";
import { useSession } from "@/context/SessionContext";
import AppBreadcrumb from "@/components/Breadcrumbs";

dayjs.extend(isBetween);




const Dashboard = () => {
  const queryClient = useQueryClient();
  const { token } = theme.useToken();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [onHoldWorkOrder, setOnHoldWorkOrder] = useState<WorkOrder | null>(null);
  const { session } = useSession();



  // Data Fetching
  const { data: allWorkOrders, isLoading: isLoadingWorkOrders } = useQuery<WorkOrder[]>({
    queryKey: ['work_orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('work_orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return (data || []).map(workOrder => snakeToCamelCase(workOrder) as WorkOrder);
    }
  });

  const { data: technicians, isLoading: isLoadingTechnicians } = useQuery<Technician[]>({
    queryKey: ['technicians'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('technicians')
        .select('*');
      if (error) throw new Error(error.message);
      return (data || []).map(technician => snakeToCamelCase(technician) as Technician);
    }
  });

  const { data: locations, isLoading: isLoadingLocations } = useQuery<Location[]>({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('*');
      if (error) throw new Error(error.message);
      return (data || []).map(location => snakeToCamelCase(location) as Location);
    }
  });

  const { data: customers, isLoading: isLoadingCustomers } = useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*');
      if (error) throw new Error(error.message);
      return (data || []).map(customer => snakeToCamelCase(customer) as Customer);
    }
  });

  const { data: vehicles, isLoading: isLoadingVehicles } = useQuery<Vehicle[]>({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*');
      if (error) throw new Error(error.message);
      return (data || []).map(vehicle => snakeToCamelCase(vehicle) as Vehicle);
    }
  });

  const { isLoading: isLoadingProfiles } = useQuery<Profile[]>({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      if (error) throw new Error(error.message);
      return (data || []).map(profile => snakeToCamelCase(profile) as Profile);
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

    const oldWorkOrder = { ...workOrder };
    const newActivityLog = [...(workOrder.activityLog || [])];
    let activityMessage = '';

    // --- Timestamp & SLA Automation ---
    const oldStatus = oldWorkOrder.status;
    const newStatus = updates.status;

    if (newStatus && newStatus !== oldStatus) {
      activityMessage = `Status changed from '${oldStatus || 'N/A'}' to '${newStatus}'.`;
      if (newStatus === 'Confirmation' && !oldWorkOrder.confirmed_at) updates.confirmed_at = new Date().toISOString();
      if (newStatus === 'In Progress' && !oldWorkOrder.work_started_at) updates.work_started_at = new Date().toISOString();
      if (newStatus === 'On Hold' && oldStatus !== 'On Hold') updates.sla_timers_paused_at = new Date().toISOString();
      if (oldStatus === 'On Hold' && newStatus !== 'On Hold' && oldWorkOrder.sla_timers_paused_at) {
        const pausedAt = dayjs(oldWorkOrder.sla_timers_paused_at);
        const resumedAt = dayjs();
        const durationPaused = resumedAt.diff(pausedAt, 'second');
        updates.total_paused_duration_seconds = (oldWorkOrder.total_paused_duration_seconds || 0) + durationPaused;
        updates.sla_timers_paused_at = null;
        activityMessage += ` (SLA timers resumed after ${durationPaused}s pause).`;
      }
    }

    if (updates.assignedTechnicianId && updates.assignedTechnicianId !== oldWorkOrder.assignedTechnicianId) {
      const oldTech = technicians?.find(t => t.id === oldWorkOrder.assignedTechnicianId)?.name || 'Unassigned';
      const newTech = technicians?.find(t => t.id === updates.assignedTechnicianId)?.name || 'Unassigned';
      activityMessage = `Assigned technician changed from '${oldTech}' to '${newTech}'.`;
    } else if (updates.slaDue && updates.slaDue !== oldWorkOrder.slaDue) {
      activityMessage = `SLA due date updated to '${dayjs(updates.slaDue).format('MMM D, YYYY h:mm A')}'.`;
    } else if (updates.appointmentDate && updates.appointmentDate !== oldWorkOrder.appointmentDate) {
      activityMessage = `Appointment date updated to '${dayjs(updates.appointmentDate).format('MMM D, YYYY h:mm A')}'.`;
    } else if (updates.service && updates.service !== oldWorkOrder.service) {
      activityMessage = `Service description updated.`;
    } else if (updates.serviceNotes && updates.serviceNotes !== oldWorkOrder.serviceNotes) {
      activityMessage = `Service notes updated.`;
    } else if (updates.priority && updates.priority !== oldWorkOrder.priority) {
      activityMessage = `Priority changed from '${oldWorkOrder.priority || 'N/A'}' to '${updates.priority}'.`;
    } else if (updates.locationId && updates.locationId !== oldWorkOrder.locationId) {
      const oldLoc = locations?.find(l => l.id === oldWorkOrder.locationId)?.name || 'N/A';
      const newLoc = locations?.find(l => l.id === updates.locationId)?.name || 'N/A';
      activityMessage = `Service location changed from '${oldLoc}' to '${newLoc}'.`;
    } else if (updates.customerAddress && updates.customerAddress !== oldWorkOrder.customerAddress) {
      activityMessage = `Client address updated to '${updates.customerAddress}'.`;
    } else if (updates.customerLat !== oldWorkOrder.customerLat || updates.customerLng !== oldWorkOrder.customerLng) {
      activityMessage = `Client coordinates updated.`;
    } else {
      activityMessage = 'Work order details updated.'; // Generic message for other changes
    }

    if (activityMessage) {
      newActivityLog.push({ timestamp: new Date().toISOString(), activity: activityMessage, userId: session?.user.id ?? null });
      updates.activityLog = newActivityLog;
    }

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
        avgResponseTimeHours: '0.0',
        totalOrdersTrend: emptyTrend, 
        openOrdersTrend: emptyTrend, 
        slaTrend: emptyTrend,
        avgCompletionTimeTrend: emptyTrend,
        avgResponseTimeTrend: emptyTrend,
      };
    }

  const now = dayjs();
  const todayStart = now.startOf('day');
  const yesterdayStart = todayStart.subtract(1, 'day');

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
  const createdToday = orders.filter(o => o.created_at && dayjs(o.created_at).isAfter(todayStart));
  const createdYesterday = orders.filter(o => o.created_at && dayjs(o.created_at).isBetween(yesterdayStart, todayStart));
  const completedToday = orders.filter(o => o.status === 'Completed' && o.completedAt && dayjs(o.completedAt).isAfter(todayStart));
  const completedYesterday = orders.filter(o => o.status === 'Completed' && o.completedAt && dayjs(o.completedAt).isBetween(yesterdayStart, todayStart));
  const confirmedToday = orders.filter(o => o.confirmed_at && dayjs(o.confirmed_at).isAfter(todayStart));
  const confirmedYesterday = orders.filter(o => o.confirmed_at && dayjs(o.confirmed_at).isBetween(yesterdayStart, todayStart));

    // --- Main KPIs ---
    const totalOrders = orders.length;
    const openOrders = orders.filter(o => o.status !== 'Completed').length;
    const allCompleted = orders.filter(o => o.status === 'Completed' && o.completedAt && o.created_at);
    const slaMet = allCompleted.filter(o => o.slaDue && dayjs(o.completedAt).isBefore(dayjs(o.slaDue))).length;
    const slaPerformance = allCompleted.length > 0 ? ((slaMet / allCompleted.length) * 100) : 0;
  const totalCompletionTime = allCompleted.reduce((acc, wo) => acc + dayjs(wo.completedAt).diff(dayjs(wo.created_at), 'hour'), 0);
  const avgCompletionTimeDays = allCompleted.length > 0 ? (totalCompletionTime / allCompleted.length / 24).toFixed(1) : '0.0';
  // Response time (creation -> Confirmation)
  const allConfirmed = orders.filter(o => o.confirmed_at && o.created_at);
  const totalResponseHours = allConfirmed.reduce((acc, wo) => acc + dayjs(wo.confirmed_at as string).diff(dayjs(wo.created_at as string), 'hour', true), 0);
  const avgResponseTimeHours = allConfirmed.length > 0 ? (totalResponseHours / allConfirmed.length).toFixed(1) : '0.0';

    // Calculate trends
    const totalOrdersTrend = calculateTrend(createdToday.length, createdYesterday.length);
    const openOrdersTrend = calculateTrend(
      createdToday.filter(o => o.status !== 'Completed').length,
      createdYesterday.filter(o => o.status !== 'Completed').length
    );
    // Keep for compatibility but not displayed now; if needed, compute SLA-based daily deltas
    const slaTrend = calculateTrend(
      completedToday.filter(o => o.slaDue && dayjs(o.completedAt).isBefore(dayjs(o.slaDue))).length,
      completedYesterday.filter(o => o.slaDue && dayjs(o.completedAt).isBefore(dayjs(o.slaDue))).length
    );
    const avgCompletionTimeTrend = calculateTrend(
      completedToday.reduce((acc, wo) => acc + dayjs(wo.completedAt!).diff(dayjs(wo.created_at!), 'hour'), 0) / (completedToday.length || 1),
      completedYesterday.reduce((acc, wo) => acc + dayjs(wo.completedAt!).diff(dayjs(wo.created_at!), 'hour'), 0) / (completedYesterday.length || 1)
    );
    const avgResponseTimeTrend = calculateTrend(
      confirmedToday.reduce((acc, wo) => acc + dayjs(wo.confirmed_at as string).diff(dayjs(wo.created_at as string), 'hour', true), 0) / (confirmedToday.length || 1),
      confirmedYesterday.reduce((acc, wo) => acc + dayjs(wo.confirmed_at as string).diff(dayjs(wo.created_at as string), 'hour', true), 0) / (confirmedYesterday.length || 1),
    );


    return {
      totalOrders,
      openOrders,
      slaPerformance: slaPerformance.toFixed(0),
      avgCompletionTime: avgCompletionTimeDays,
      avgResponseTimeHours,
      totalOrdersTrend,
      openOrdersTrend,
      slaTrend,
      avgCompletionTimeTrend,
      avgResponseTimeTrend,
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
            <Badge count={allWorkOrders?.length || 0} showZero color={token.colorPrimary} />
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
            <Badge count={count} showZero color={token.colorPrimary} />
          </Space>
        ),
        value: loc.id
      }
    })
  ];

  const isLoading = isLoadingWorkOrders || isLoadingTechnicians || isLoadingLocations || isLoadingCustomers || isLoadingVehicles || isLoadingProfiles;

  if (isLoading) {
    return <Skeleton active paragraph={{ rows: 10 }} />;
  }

  const overviewTab = (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Row gutter={[16, 16]}>
  <Col xs={24} sm={12} md={12} lg={6}><KpiCard title="Total Work Orders" value={kpiData.totalOrders.toString()} icon={<Icon icon="ant-design:tool-filled" width={24} height={24} />} trend={kpiData.totalOrdersTrend.trend} trendDirection={kpiData.totalOrdersTrend.trendDirection as 'up' | 'down' | undefined} /></Col>
  <Col xs={24} sm={12} md={12} lg={6}><KpiCard title="Open Work Orders" value={kpiData.openOrders.toString()} icon={<Icon icon="ant-design:folder-open-filled" width={24} height={24} />} isUpGood={false} trend={kpiData.openOrdersTrend.trend} trendDirection={kpiData.openOrdersTrend.trendDirection as 'up' | 'down' | undefined} /></Col>
  <Col xs={24} sm={12} md={12} lg={6}><KpiCard title="Response Time" value={`${kpiData.avgResponseTimeHours} Hrs`} icon={<Icon icon="ant-design:thunderbolt-filled" width={24} height={24} />} isUpGood={false} trend={kpiData.avgResponseTimeTrend.trend} trendDirection={kpiData.avgResponseTimeTrend.trendDirection as 'up' | 'down' | undefined} /></Col>
  <Col xs={24} sm={12} md={12} lg={6}><KpiCard title="Resolution Time" value={`${kpiData.avgCompletionTime} Days`} icon={<Icon icon="ant-design:clock-circle-filled" width={24} height={24} />} isUpGood={false} trend={kpiData.avgCompletionTimeTrend.trend} trendDirection={kpiData.avgCompletionTimeTrend.trendDirection as 'up' | 'down' | undefined} /></Col>
      </Row>
      <Row gutter={[16, 16]} align="stretch">
        <Col xs={24} lg={18} xl={18}>
          <UrgentWorkOrdersTable workOrders={allWorkOrders || []} technicians={technicians || []} vehicles={vehicles || []} onViewDetails={handleViewDetails} />
        </Col>
        <Col xs={24} lg={6} xl={6}>
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

  const pageActions = (
    <Segmented
      options={locationOptions}
      value={selectedLocation}
      onChange={(value) => setSelectedLocation(value as string)}
    />
  );

  return (
    <>
      <AppBreadcrumb actions={pageActions} />
      <div className="sticky-header-secondary">
        <Tabs defaultActiveKey="1" items={tabItems} />
      </div>
      {onHoldWorkOrder && (
        <OnHoldReasonDialog
          isOpen={!!onHoldWorkOrder}
          onClose={() => setOnHoldWorkOrder(null)}
          onSave={handleSaveOnHoldReason}
        />
      )}
      {/* Open the drawer if the 'view' search param is set */}
      <WorkOrderDetailsDrawer 
        onClose={handleCloseDrawer}
        workOrderId={searchParams.get('view') || undefined}
        open={!!searchParams.get('view')}
      />
    </>
  );
};

export default Dashboard;