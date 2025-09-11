import React from 'react';
import { Col, Skeleton } from 'antd';
import KpiCard from '@/components/KpiCard';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { WorkOrder, Technician } from '@/types/supabase';
import { CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined, ToolOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);

interface KpiCardWidgetProps {
  widgetId: string;
  title: string;
  icon: React.ReactNode;
  kpiType: 'totalWorkOrders' | 'openWorkOrders' | 'slaPerformance' | 'avgCompletionTime' | 'activeTechnicians';
}

const KpiCardWidget: React.FC<KpiCardWidgetProps> = ({ widgetId, title, icon, kpiType }) => {
  const { data: allWorkOrders, isLoading: isLoadingWorkOrders } = useQuery<WorkOrder[]>({
    queryKey: ['work_orders_for_kpi'],
    queryFn: async () => {
      const { data, error } = await supabase.from('work_orders').select('*');
      if (error) throw new Error(error.message);
      return (data || []).map((item: any) => ({ ...item, createdAt: item.created_at, completedAt: item.completed_at, slaDue: item.sla_due }));
    }
  });

  const { data: technicians, isLoading: isLoadingTechnicians } = useQuery<Technician[]>({
    queryKey: ['technicians_for_kpi'],
    queryFn: async () => {
      const { data, error } = await supabase.from('technicians').select('*');
      if (error) throw new Error(error.message);
      return data || [];
    }
  });

  const isLoading = isLoadingWorkOrders || isLoadingTechnicians;

  const kpiValue = React.useMemo(() => {
    if (isLoading || !allWorkOrders || !technicians) {
      return { value: '...', trend: undefined, trendDirection: undefined, isUpGood: true };
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

    const createdThisWeek = allWorkOrders.filter(o => dayjs(o.createdAt).isAfter(sevenDaysAgo));
    const createdLastWeek = allWorkOrders.filter(o => dayjs(o.createdAt).isBetween(fourteenDaysAgo, sevenDaysAgo));
    const completedThisWeek = allWorkOrders.filter(o => o.status === 'Completed' && o.completedAt && dayjs(o.completedAt).isAfter(sevenDaysAgo));
    const completedLastWeek = allWorkOrders.filter(o => o.status === 'Completed' && o.completedAt && dayjs(o.completedAt).isBetween(fourteenDaysAgo, sevenDaysAgo));

    const allCompleted = allWorkOrders.filter(o => o.status === 'Completed' && o.completedAt && o.createdAt);

    switch (kpiType) {
      case 'totalWorkOrders': {
        const trend = calculateTrend(createdThisWeek.length, createdLastWeek.length);
        return { value: allWorkOrders.length.toString(), ...trend, isUpGood: true };
      }
      case 'openWorkOrders': {
        const openThisWeek = createdThisWeek.filter(o => o.status !== 'Completed').length;
        const openLastWeek = createdLastWeek.filter(o => o.status !== 'Completed').length;
        const trend = calculateTrend(openThisWeek, openLastWeek);
        return { value: allWorkOrders.filter(o => o.status !== 'Completed').length.toString(), ...trend, isUpGood: false };
      }
      case 'slaPerformance': {
        const slaMetThisWeek = completedThisWeek.filter(o => o.slaDue && dayjs(o.completedAt).isBefore(dayjs(o.slaDue))).length;
        const slaMetLastWeek = completedLastWeek.filter(o => o.slaDue && dayjs(o.completedAt).isBefore(dayjs(o.slaDue))).length;
        const slaPerformanceThisWeek = completedThisWeek.length > 0 ? (slaMetThisWeek / completedThisWeek.length * 100) : 0;
        const slaPerformanceLastWeek = completedLastWeek.length > 0 ? (slaMetLastWeek / completedLastWeek.length * 100) : 0;
        const trend = calculateTrend(slaPerformanceThisWeek, slaPerformanceLastWeek);
        const slaMet = allCompleted.filter(o => o.slaDue && dayjs(o.completedAt).isBefore(dayjs(o.slaDue))).length;
        const slaPerformance = allCompleted.length > 0 ? ((slaMet / allCompleted.length) * 100).toFixed(0) : '0';
        return { value: `${slaPerformance}%`, ...trend, isUpGood: true };
      }
      case 'avgCompletionTime': {
        const totalCompletionTime = allCompleted.reduce((acc, wo) => acc + dayjs(wo.completedAt).diff(dayjs(wo.createdAt), 'hour'), 0);
        const avgCompletionTimeDays = allCompleted.length > 0 ? (totalCompletionTime / allCompleted.length / 24).toFixed(1) : '0.0';
        
        const avgCompletionTimeThisWeek = completedThisWeek.reduce((acc, wo) => acc + dayjs(wo.completedAt!).diff(dayjs(wo.createdAt!), 'hour'), 0) / (completedThisWeek.length || 1);
        const avgCompletionTimeLastWeek = completedLastWeek.reduce((acc, wo) => acc + dayjs(wo.completedAt!).diff(dayjs(wo.createdAt!), 'hour'), 0) / (completedLastWeek.length || 1);
        const trend = calculateTrend(avgCompletionTimeThisWeek, avgCompletionTimeLastWeek);

        return { value: `${avgCompletionTimeDays} Days`, ...trend, isUpGood: false };
      }
      case 'activeTechnicians':
        return { value: technicians.length.toString(), trend: undefined, trendDirection: undefined, isUpGood: true };
      default:
        return { value: 'N/A', trend: undefined, trendDirection: undefined, isUpGood: true };
    }
  }, [isLoading, allWorkOrders, technicians, kpiType]);

  if (isLoading) {
    return <Col xs={24} sm={12} lg={6}><Skeleton active paragraph={{ rows: 1 }} /></Col>;
  }

  return (
    <Col xs={24} sm={12} md={12} lg={6}>
      <KpiCard
        title={title}
        value={kpiValue.value}
        icon={icon}
        trend={kpiValue.trend}
        trendDirection={kpiValue.trendDirection as 'up' | 'down' | undefined} // Cast to correct type
        isUpGood={kpiValue.isUpGood}
      />
    </Col>
  );
};

export default KpiCardWidget;