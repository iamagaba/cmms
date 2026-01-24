/**
 * Professional CMMS Dashboard
 * 
 * A sophisticated, data-driven dashboard designed specifically for maintenance
 * management operations. Features real-time metrics, actionable insights,
 * and contextual information for maintenance teams.
 */

import React, { useState, useMemo } from "react";
import { HugeiconsIcon } from '@hugeicons/react';
import {
  RefreshIcon,
  Add01Icon,
  Task01Icon,
  Folder01Icon,
  CheckmarkCircle01Icon,
  AlertCircleIcon
} from '@hugeicons/core-free-icons';
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
          <AlertCircleIcon className="h-4 w-4" />
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
        avgResponseTime: '0h',
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

    // Calculate weekly trend
    const thisWeekOrders = realtimeWorkOrders.filter((wo: WorkOrder) =>
      dayjs(wo.created_at).isAfter(weekAgo)
    ).length;
    const lastWeekOrders = realtimeWorkOrders.filter((wo: WorkOrder) =>
      dayjs(wo.created_at).isBetween(weekAgo.subtract(7, 'days'), weekAgo)
    ).length;
    const weeklyTrend = lastWeekOrders > 0
      ? ((thisWeekOrders - lastWeekOrders) / lastWeekOrders) * 100
      : 0;

    return {
      totalOrders,
      openOrders,
      completedToday,
      overdueOrders,
      avgResponseTime: '0h',
      weeklyTrend
    };
  }, [realtimeWorkOrders]);



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
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                Operations Dashboard
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {dayjs().format('dddd, MMMM D, YYYY')} • {locations?.length || 0} locations active
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                className="gap-1.5 h-8 text-xs"
              >
                <HugeiconsIcon icon={RefreshIcon} size={14} />
                Refresh
              </Button>
              <Button
                size="sm"
                onClick={() => navigate('/work-orders')}
                className="gap-1.5 h-8 text-xs"
              >
                <HugeiconsIcon icon={Add01Icon} size={14} />
                New Work Order
              </Button>
            </div>
          </div>

          {/* Stat Ribbon */}
          <StatRibbon
            stats={[
              {
                title: "Total Work Orders",
                value: metrics.totalOrders,
                subtitle: `${metrics.weeklyTrend >= 0 ? '+' : ''}${typeof metrics.weeklyTrend === 'number' ? metrics.weeklyTrend.toFixed(1) : '0'}% vs last week`,
                icon: Task01Icon,
                color: "primary",
                onClick: () => navigate('/work-orders')
              },
              {
                title: "Open Orders",
                value: metrics.openOrders,
                icon: Folder01Icon,
                color: "amber",
                onClick: () => navigate('/work-orders?status=open')
              },
              {
                title: "Completed Today",
                value: metrics.completedToday,
                icon: CheckmarkCircle01Icon,
                color: "emerald"
              },
              {
                title: "Overdue Orders",
                value: metrics.overdueOrders,
                icon: AlertCircleIcon,
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
              <WorkOrderTrendsChart data={[]} />

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