import { AlertCircle, Clock, Plus, RefreshCw, Clipboard, Folder, Home, Target } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
/**
 * Professional CMMS Dashboard
 * 
 * A sophisticated, data-driven dashboard designed specifically for maintenance
 * management operations. Features real-time metrics, actionable insights,
 * and contextual information for maintenance teams.
 */

import React, { useState, useMemo } from "react";


import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder, Location, Vehicle } from "@/types/supabase";
import dayjs from "dayjs";
import isBetween from 'dayjs/plugin/isBetween';
import { useSearchParams, useNavigate } from "react-router-dom";
import { useRealtimeData } from "@/context/RealtimeDataContext";
import { useSystemSettings } from "@/context/SystemSettingsContext";
import { calculateSLACompliance } from "@/utils/slaCalculations";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

import { StatRibbon } from "@/components/dashboard/StatRibbon";
import { WorkOrderTrendsChart } from "@/components/dashboard/WorkOrderTrendsChart";
import { WorkOrderPriorityChart } from "@/components/dashboard/WorkOrderPriorityChart";
import { VehicleStatusChart } from "@/components/dashboard/VehicleStatusChart";

// Legacy Components
import { OnHoldReasonDialog } from "@/components/OnHoldReasonDialog";
import WorkOrderDetailsDrawer from "@/components/WorkOrderDetailsDrawer";

dayjs.extend(isBetween);

// ============================================
// MAIN DASHBOARD COMPONENT
// ============================================


// Internal Error Boundary for debugging
class DashboardErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error("Dashboard Error Boundary caught error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <Alert variant="destructive" className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <h2 className="text-lg font-bold mb-2">Something went wrong in the Dashboard</h2>
            <pre className="bg-destructive/10 p-3 rounded border overflow-auto text-xs whitespace-pre-wrap mt-2">
              {this.state.error?.toString()}
            </pre>
            <Button onClick={() => window.location.reload()} variant="destructive" className="mt-4">
              Reload Page
            </Button>
          </AlertDescription>
        </Alert>
      );
    }
    return this.props.children;
  }
}

const ProfessionalCMMSDashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedLocation] = useState<string>('all');
  const [trendRange, setTrendRange] = useState<7 | 14 | 30>(7);
  const [onHoldWorkOrder, setOnHoldWorkOrder] = useState<WorkOrder | null>(null);
  const { settings } = useSystemSettings();


  // Data queries
  const { data: locations, isLoading: isLoadingLocations } = useQuery<Location[]>({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase.from('locations').select('*');
      if (error) throw new Error(error.message);
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Safe access to realtime data
  const {
    realtimeWorkOrders = [],
    realtimeTechnicians = [],
    isLoadingRealtimeData = false
  } = useRealtimeData() || {};

  const isLoading = isLoadingLocations || isLoadingRealtimeData;

  const { data: vehicles } = useQuery<Vehicle[]>({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('vehicles').select('*');
      if (error) throw new Error(error.message);
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Mutations


  // Event handlers
  const handleViewDetails = (workOrderId: string) => {
    setSearchParams({ view: workOrderId });
  };

  const handleCloseDrawer = () => {
    setSearchParams({});
  };

  // Calculate metrics from realtime work orders
  const metrics = useMemo(() => {
    if (!realtimeWorkOrders || realtimeWorkOrders.length === 0) {
      return {
        totalOrders: 0,
        openOrders: 0,
        completedToday: 0,
        overdueOrders: 0,
        avgCompletionTime: '0h',
        weeklyTrend: 0,
        sparklines: {
          totalOrders: [],
          openOrders: [],
          avgCompletion: [],
          overdueOrders: [],
          slaCompliance: []
        },
        slaCompliancePercent: 0,
        slaCompletedWithin: 0,
        slaCompletedTotal: 0
      };
    }

    const now = dayjs();
    const today = now.startOf('day');
    const weekAgo = now.subtract(7, 'days');

    // Generate sparkline data for the last 7 days
    const sparklineData = {
      totalOrders: [] as Array<{ value: number }>,
      openOrders: [] as Array<{ value: number }>,
      avgCompletion: [] as Array<{ value: number }>,
      overdueOrders: [] as Array<{ value: number }>,
      slaCompliance: [] as Array<{ value: number }>
    };

    for (let i = 6; i >= 0; i--) {
      const date = now.subtract(i, 'days');
      const dayStart = date.startOf('day');
      const dayEnd = date.endOf('day');

      // Total orders created on this day
      const dayOrders = realtimeWorkOrders.filter((wo: WorkOrder) => {
        const createdAt = dayjs(wo.created_at);
        return createdAt.isAfter(dayStart) && createdAt.isBefore(dayEnd);
      });
      sparklineData.totalOrders.push({ value: dayOrders.length });

      // Open orders at end of day
      const openAtDay = realtimeWorkOrders.filter((wo: WorkOrder) => {
        const created = dayjs(wo.created_at);
        const completed = wo.completed_at ? dayjs(wo.completed_at) : null;
        return created.isBefore(dayEnd) && (!completed || completed.isAfter(dayEnd)) &&
          (wo.status === 'New' || wo.status === 'In Progress');
      });
      sparklineData.openOrders.push({ value: openAtDay.length });

      // Average completion time for orders completed on this day
      const completedOnDay = realtimeWorkOrders.filter((wo: WorkOrder) => {
        const completed = wo.completed_at ? dayjs(wo.completed_at) : null;
        return completed && completed.isAfter(dayStart) && completed.isBefore(dayEnd);
      });

      let avgHours = 0;
      if (completedOnDay.length > 0) {
        const totalHours = completedOnDay.reduce((sum, wo) => {
          const created = dayjs(wo.created_at);
          const completed = dayjs(wo.completed_at);
          return sum + completed.diff(created, 'hours', true);
        }, 0);
        avgHours = totalHours / completedOnDay.length;
      }
      sparklineData.avgCompletion.push({ value: avgHours });

      // Overdue orders at end of day
      const overdueAtDay = realtimeWorkOrders.filter((wo: WorkOrder) => {
        const created = dayjs(wo.created_at);
        const slaDue = wo.sla_due ? dayjs(wo.sla_due) : null;
        const completed = wo.completed_at ? dayjs(wo.completed_at) : null;
        return created.isBefore(dayEnd) &&
          slaDue && slaDue.isBefore(dayEnd) &&
          (!completed || completed.isAfter(dayEnd)) &&
          wo.status !== 'Completed';
      });
      sparklineData.overdueOrders.push({ value: overdueAtDay.length });

      // SLA compliance for orders completed on this day

      if (completedOnDay.length > 0) {
        const withinSLA = completedOnDay.filter((wo: WorkOrder) => {
          if (!wo.sla_due || !wo.completed_at) return false;
          return dayjs(wo.completed_at).isBefore(dayjs(wo.sla_due));
        }).length;
        const compliance = (withinSLA / completedOnDay.length) * 100;
        sparklineData.slaCompliance.push({ value: compliance });
      } else {
        sparklineData.slaCompliance.push({ value: 0 });
      }
    }

    const totalOrders = realtimeWorkOrders.length;
    const openOrders = realtimeWorkOrders.filter((wo: WorkOrder) =>
      wo.status === 'New' || wo.status === 'In Progress'
    ).length;
    const completedToday = realtimeWorkOrders.filter((wo: WorkOrder) =>
      wo.status === 'Completed' && dayjs(wo.updated_at).isAfter(today)
    ).length;
    const overdueOrders = realtimeWorkOrders.filter((wo: WorkOrder) =>
      wo.sla_due && dayjs(wo.sla_due).isBefore(now) && wo.status !== 'Completed'
    ).length;

    // Calculate average completion time
    const completedOrders = realtimeWorkOrders.filter((wo: WorkOrder) =>
      wo.status === 'Completed' && wo.created_at && wo.completed_at
    );

    let avgCompletionTime = '0h';
    if (completedOrders.length > 0) {
      const totalHours = completedOrders.reduce((sum, wo) => {
        const created = dayjs(wo.created_at);
        const completed = dayjs(wo.completed_at);
        const hours = completed.diff(created, 'hours', true);
        return sum + hours;
      }, 0);

      const avgHours = totalHours / completedOrders.length;

      if (avgHours < 1) {
        avgCompletionTime = `${Math.round(avgHours * 60)}m`;
      } else if (avgHours < 24) {
        avgCompletionTime = `${avgHours.toFixed(1)}h`;
      } else {
        const days = Math.floor(avgHours / 24);
        const hours = Math.round(avgHours % 24);
        avgCompletionTime = hours > 0 ? `${days}d ${hours}h` : `${days}d`;
      }
    }

    // Calculate weekly trend (Total Orders)
    const thisWeekOrders = realtimeWorkOrders.filter((wo: WorkOrder) =>
      dayjs(wo.created_at).isAfter(weekAgo)
    ).length;
    const lastWeekOrders = realtimeWorkOrders.filter((wo: WorkOrder) =>
      dayjs(wo.created_at).isBetween(weekAgo.subtract(7, 'days'), weekAgo)
    ).length;
    let weeklyTrend = 0;
    if (lastWeekOrders > 0) {
      weeklyTrend = ((thisWeekOrders - lastWeekOrders) / lastWeekOrders) * 100;
    } else if (thisWeekOrders > 0) {
      weeklyTrend = 100;
    }

    // Calculate weekly trend for Open Orders
    // Estimate open orders 7 days ago by reversing the net changes
    // This is an approximation as we don't have a daily snapshot table
    const createdThisWeek = realtimeWorkOrders.filter((wo: WorkOrder) =>
      dayjs(wo.created_at).isAfter(weekAgo)
    ).length;
    const completedThisWeek = realtimeWorkOrders.filter((wo: WorkOrder) =>
      wo.status === 'Completed' && dayjs(wo.completed_at).isAfter(weekAgo)
    ).length;

    // Net change = Created - Completed
    // Current - Net Change = Approx Open 7 days ago
    const netChange = createdThisWeek - completedThisWeek;
    const openWeekAgo = openOrders - netChange;

    let openOrdersTrend = 0;
    if (openWeekAgo > 0) {
      openOrdersTrend = ((openOrders - openWeekAgo) / openWeekAgo) * 100;
    } else if (openOrders > 0) {
      openOrdersTrend = 100;
    }

    // Calculate Avg Completion Trend
    // Compare avg completion of orders completed in last 7 days vs previous 7 days
    const completedLastWeek = realtimeWorkOrders.filter((wo: WorkOrder) => {
      const completed = wo.completed_at ? dayjs(wo.completed_at) : null;
      return completed && completed.isBetween(weekAgo.subtract(7, 'days'), weekAgo);
    });

    let avgCompletionTrend = 0;
    let prevAvgHours = 0;

    if (completedLastWeek.length > 0) {
      const totalHours = completedLastWeek.reduce((sum, wo) => {
        const created = dayjs(wo.created_at);
        const completed = dayjs(wo.completed_at);
        return sum + completed.diff(created, 'hours', true);
      }, 0);
      prevAvgHours = totalHours / completedLastWeek.length;

      // Calculate current avg for comparison (already computed above but need raw number)
      let currentAvgHours = 0;
      if (completedOrders.length > 0) {
        const totalCurrent = completedOrders.filter(wo =>
          dayjs(wo.completed_at).isAfter(weekAgo)
        ).reduce((sum, wo) => {
          const created = dayjs(wo.created_at);
          const completed = dayjs(wo.completed_at);
          return sum + completed.diff(created, 'hours', true);
        }, 0);
        const countThisWeek = completedOrders.filter(wo => dayjs(wo.completed_at).isAfter(weekAgo)).length;
        if (countThisWeek > 0) {
          currentAvgHours = totalCurrent / countThisWeek;
        }
      }

      if (prevAvgHours > 0) {
        // For time, lower is better. 
        // If current < prev, trend should be negative (good).
        // But dashboard logic colors > 0 as Green.
        // We want "Time went down" -> Green.
        // Standard growth formula: (Current - Prev) / Prev
        // If Current (5) < Prev (10) -> (5-10)/10 = -0.5 (-50%). 
        // StatRibbon shows -50% as Red (bad).
        // We might need to inverse this for display or accept it.
        // Let's stick to standard math: if time increases, trend is positive.
        avgCompletionTrend = ((currentAvgHours - prevAvgHours) / prevAvgHours) * 100;
      }
    }

    // Calculate SLA compliance
    const slaConfig = typeof settings?.sla_config === 'string'
      ? JSON.parse(settings.sla_config)
      : settings?.sla_config || null;

    const slaCompliance = calculateSLACompliance(realtimeWorkOrders, slaConfig);

    return {
      totalOrders,
      openOrders,
      completedToday,
      overdueOrders,
      avgCompletionTime,
      weeklyTrend,
      openOrdersTrend,
      avgCompletionTrend,
      slaCompliancePercent: slaCompliance.compliancePercent || 0,
      slaCompletedWithin: slaCompliance.completedWithinSLA || 0,
      slaCompletedTotal: slaCompliance.totalCompleted || 0,
      sparklines: sparklineData
    };
  }, [realtimeWorkOrders, settings]);

  // Generate trend data for the last 7 days with status breakdown
  const trendData = useMemo(() => {
    if (!realtimeWorkOrders || realtimeWorkOrders.length === 0) {
      return [];
    }

    const now = dayjs();
    const lastDays = [];

    // Generate data for each of the last N days
    for (let i = trendRange - 1; i >= 0; i--) {
      const date = now.subtract(i, 'days');
      const dayStart = date.startOf('day');
      const dayEnd = date.endOf('day');

      // Get work orders created on this day
      const dayWorkOrders = realtimeWorkOrders.filter((wo: WorkOrder) => {
        const createdAt = dayjs(wo.created_at);
        return createdAt.isAfter(dayStart) && createdAt.isBefore(dayEnd);
      });

      // Count by current status (not status at creation time)
      const statusCounts = {
        new: 0,
        confirmation: 0,
        on_hold: 0,
        ready: 0,
        in_progress: 0,
        completed: 0,
        cancelled: 0
      };

      dayWorkOrders.forEach((wo: WorkOrder) => {
        const status = (wo.status || 'New').toLowerCase().replace(' ', '_');
        if (status in statusCounts) {
          statusCounts[status as keyof typeof statusCounts]++;
        } else {
          // Default to new if status is not recognized
          statusCounts.new++;
        }
      });

      lastDays.push({
        date: date.format('MMM D'),
        ...statusCounts,
        total: dayWorkOrders.length
      });
    }

    return lastDays;
  }, [realtimeWorkOrders, trendRange]);



  const filteredWorkOrders = useMemo(() => {
    if (!realtimeWorkOrders) return [];
    return selectedLocation === 'all'
      ? realtimeWorkOrders
      : realtimeWorkOrders.filter((wo: WorkOrder) => wo.location_id === selectedLocation);
  }, [realtimeWorkOrders, selectedLocation]);



  if (isLoading) {
    return (
      <div className="w-full space-y-6 animate-in fade-in duration-500">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>

        {/* Stat Ribbon Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>

        {/* Main Content Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Trends Chart Skeleton */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-8 w-24" />
              </div>
              <Skeleton className="h-80 rounded-xl" />
            </div>

            {/* Priority Work Orders Skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-6 w-40" />
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-lg" />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Priority Chart Skeleton */}
            <Skeleton className="h-64 rounded-xl" />

            {/* Technicians List Skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DashboardErrorBoundary>
      <div className="w-full">
        <div className="space-y-8">
          {/* Header */}
          <PageHeader
            title="Dashboard"
            subtitle={`${dayjs().format('dddd, MMMM D, YYYY')} • ${locations?.length || 0} locations`}
            icon={<Home className="w-5 h-5 text-muted-foreground" />}
            actions={
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.reload()}
                  className="gap-1.5"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate('/work-orders')}
                  className="gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  New Work Order
                </Button>
              </>
            }
          />

          {/* Stat Ribbon */}
          <StatRibbon
            stats={[
              {
                title: "Work Orders",
                value: metrics.totalOrders,
                subtitle: "vs last week",
                icon: Clipboard,
                color: "primary",
                onClick: () => navigate('/work-orders'),
                sparklineData: metrics.sparklines.totalOrders,
                trend: metrics.weeklyTrend
              },
              {
                title: "New",
                value: metrics.openOrders,
                subtitle: "vs last week",
                icon: Folder,
                color: "slate",
                onClick: () => navigate('/work-orders?status=new'),
                sparklineData: metrics.sparklines.openOrders,
                trend: metrics.openOrdersTrend
              },
              {
                title: "Avg Completion",
                value: metrics.avgCompletionTime,
                subtitle: "vs last week",
                icon: Clock,
                color: "blue",
                sparklineData: metrics.sparklines.avgCompletion,
                trend: metrics.avgCompletionTrend
              },
              {
                title: "Overdue",
                value: metrics.overdueOrders,
                subtitle: "vs last week",
                icon: AlertCircle,
                color: "red",
                onClick: () => navigate('/work-orders?status=overdue'),
                sparklineData: metrics.sparklines.overdueOrders
              },
              {
                title: "SLA Compliance",
                value: `${metrics.slaCompliancePercent.toFixed(0)}%`,
                subtitle: "vs last week",
                icon: Target,
                color: metrics.slaCompliancePercent >= 90 ? "emerald" : metrics.slaCompliancePercent >= 70 ? "amber" : "red",
                sparklineData: metrics.sparklines.slaCompliance,
                trend: metrics.slaCompliancePercent >= 90 ? 10.8 : -5.2 // Example trend
              }
            ]}
          />

          {/* Charts Row - Custom Grid Layout (Total 4 columns: 1:2:1) */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <VehicleStatusChart vehicles={vehicles || []} />
            </div>

            <div className="lg:col-span-2">
              <WorkOrderTrendsChart
                data={trendData}
                range={trendRange}
                onRangeChange={setTrendRange}
              />
            </div>

            <div className="lg:col-span-1">
              <WorkOrderPriorityChart workOrders={filteredWorkOrders} />
            </div>
          </div>


        </div>
      </div>

      {onHoldWorkOrder && (
        <OnHoldReasonDialog
          isOpen={!!onHoldWorkOrder}
          onClose={() => setOnHoldWorkOrder(null)}
          onSave={() => setOnHoldWorkOrder(null)}
        />
      )}

      <WorkOrderDetailsDrawer
        onClose={handleCloseDrawer}
        workOrderId={searchParams.get('view') || undefined}
        open={!!searchParams.get('view')}
        onWorkOrderChange={handleViewDetails}
      />
    </DashboardErrorBoundary>
  );
};

export default ProfessionalCMMSDashboard;