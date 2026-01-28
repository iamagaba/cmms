import { AlertCircle, CheckCircle, Clock, Plus, RefreshCw, Clipboard, Folder, Home } from 'lucide-react';
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
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { StatRibbon } from "@/components/dashboard/StatRibbon";
import { WorkOrderTrendsChart } from "@/components/dashboard/WorkOrderTrendsChart";
import { PriorityWorkOrders } from "@/components/dashboard/PriorityWorkOrders";
import { TechniciansList } from "@/components/dashboard/TechniciansList";

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
  const [trendRange, setTrendRange] = useState<7 | 14>(7);
  const [onHoldWorkOrder, setOnHoldWorkOrder] = useState<WorkOrder | null>(null);


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
        weeklyTrend: 0
      };
    }

    const now = dayjs();
    const today = now.startOf('day');
    const weekAgo = now.subtract(7, 'days');

    const totalOrders = realtimeWorkOrders.length;
    const openOrders = realtimeWorkOrders.filter((wo: WorkOrder) =>
      wo.status === 'Open' || wo.status === 'In Progress'
    ).length;
    const completedToday = realtimeWorkOrders.filter((wo: WorkOrder) =>
      wo.status === 'Completed' && dayjs(wo.updated_at).isAfter(today)
    ).length;
    const overdueOrders = realtimeWorkOrders.filter((wo: WorkOrder) =>
      wo.dueDate && dayjs(wo.dueDate).isBefore(now) && wo.status !== 'Completed'
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

    // Calculate weekly trend
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

    return {
      totalOrders,
      openOrders,
      completedToday,
      overdueOrders,
      avgCompletionTime,
      weeklyTrend
    };
  }, [realtimeWorkOrders]);

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
        open: 0,
        confirmation: 0,
        on_hold: 0,
        ready: 0,
        in_progress: 0,
        completed: 0,
        cancelled: 0
      };

      dayWorkOrders.forEach((wo: WorkOrder) => {
        const status = (wo.status || 'Open').toLowerCase().replace(' ', '_');
        if (status in statusCounts) {
          statusCounts[status as keyof typeof statusCounts]++;
        } else {
          // Default to open if status is not recognized
          statusCounts.open++;
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
      : realtimeWorkOrders.filter((wo: WorkOrder) => wo.locationId === selectedLocation);
  }, [realtimeWorkOrders, selectedLocation]);



  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardErrorBoundary>
      <div className="w-full">
        <div className="space-y-6">
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
                  Create
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
                subtitle: `${metrics.weeklyTrend >= 0 ? '+' : ''}${typeof metrics.weeklyTrend === 'number' ? metrics.weeklyTrend.toFixed(1) : '0'}% vs last week`,
                icon: Clipboard,
                color: "primary",
                onClick: () => navigate('/work-orders')
              },
              {
                title: "Open",
                value: metrics.openOrders,
                icon: Folder,
                color: "amber",
                onClick: () => navigate('/work-orders?status=open')
              },
              {
                title: "Completed Today",
                value: metrics.completedToday,
                icon: CheckCircle,
                color: "emerald"
              },
              {
                title: "Avg Completion",
                value: metrics.avgCompletionTime,
                icon: Clock,
                color: "blue"
              },
              {
                title: "Overdue",
                value: metrics.overdueOrders,
                icon: AlertCircle,
                color: "red",
                onClick: () => navigate('/work-orders?status=overdue')
              }
            ]}
          />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Trends Chart */}
              <WorkOrderTrendsChart
                data={trendData}
                range={trendRange}
                onRangeChange={setTrendRange}
              />

              <PriorityWorkOrders
                workOrders={filteredWorkOrders}
                vehicles={vehicles || []}
                onViewDetails={handleViewDetails}
              />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <TechniciansList
                technicians={realtimeTechnicians}
                workOrders={filteredWorkOrders}
              />
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
      </div>
    </DashboardErrorBoundary>
  );
};

export default ProfessionalCMMSDashboard;