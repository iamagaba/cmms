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
import { WorkOrder, Technician, Location, Customer, Vehicle, Profile } from "@/types/supabase"; // Import Profile
import dayjs from "dayjs";
import isBetween from 'dayjs/plugin/isBetween';
import { camelToSnakeCase } from "@/utils/data-helpers";
import WorkOrderDetailsDrawer from "@/components/WorkOrderDetailsDrawer";
import { useSearchParams } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import { useSession } from "@/context/SessionContext";

dayjs.extend(isBetween);
const { Title } = Typography;

const OverviewDashboard = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams(); // Corrected initialization
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [onHoldWorkOrder, setOnHoldWorkOrder] = useState<WorkOrder | null>(null);
  const { session } = useSession();

  const viewingWorkOrderId = searchParams.get('view');

  // Data Fetching
  const { data: allWorkOrders, isLoading: isLoadingWorkOrders } = useQuery<WorkOrder[]>({
    queryKey: ['work_orders'],
    queryFn: async () => {
      const { data, error } = await supabase.from('work_orders').select('*').order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return (data || []).map((item: any) => ({ ...item, createdAt: item.created_at, workOrderNumber: item.work_order_number, assignedTechnicianId: item.assigned_technician_id, locationId: item.location_id, serviceNotes: item.service_notes, partsUsed: item.parts_used, activityLog: item.activity_log, slaDue: item.sla_due, completedAt: item.completed_at, customerLat: item.customer_lat, customerLng: item.customer_lng, customerAddress: item.customer_address, onHoldReason: item.on_hold_reason, appointmentDate: item.appointment_date, customerId: item.customer_id, vehicleId: item.vehicle_id, created_by: item.created_by, service_category_id: item.service_category_id, confirmed_at: item.confirmed_at, work_started_at: item.work_started_at, sla_timers_paused_at: item.sla_timers_paused_at, total_paused_duration_seconds: item.total_paused_duration_seconds })) || [];
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

  const { data: profiles, isLoading: isLoadingProfiles } = useQuery<Profile[]>({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*'); // Select all fields for Profile type
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

    const oldWorkOrder = { ...workOrder };
    const newActivityLog = [...(workOrder.activityLog || [])];
    let activityMessage = '';

    if (updates.status && updates.status !== oldWorkOrder.status) {
      activityMessage = `Status changed from '${oldWorkOrder.status || 'N/A'}' to '${updates.status}'.`;
    } else if (updates.assignedTechnicianId && updates.assignedTechnicianId !== oldWorkOrder.assignedTechnicianId) {
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

    // Calculate trends
    const totalOrdersTrend = calculateTrend(createdThisWeek.length, createdLastWeek.length);
    const openOrdersTrend = calculateTrend(
      createdThisWeek.filter(o => o.status !== 'Completed').length,
      createdLastWeek.filter(o => o.status !== 'Completed').length
    );
    const slaTrend = calculateTrend(
      completedThisWeek.filter(o => o.slaDue && dayjs(o.completedAt).isBefore(dayjs(o.slaDue))).length,
      completedLastWeek.filter(o => o.slaDue && dayjs(o.completedAt).isBefore(dayjs(o.slaDue))).length
    );
    const avgCompletionTimeTrend = calculateTrend(
      completedThisWeek.reduce((acc, wo) => acc + dayjs(wo.completedAt!).diff(dayjs(wo.createdAt!), 'hour'), 0) / (completedThisWeek.length || 1),
      completedLastWeek.reduce((acc, wo) => acc + dayjs(wo.completedAt!).diff(dayjs(wo.createdAt!), 'hour'), 0) / (completedLastWeek.length || 1)
    );


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

  const isLoading = isLoadingWorkOrders || isLoadingTechnicians || isLoadingLocations || isLoadingCustomers || isLoadingVehicles || isLoadingProfiles;

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
        title="Overview Dashboard"
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

export default OverviewDashboard;