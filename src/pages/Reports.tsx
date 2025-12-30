import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Home01Icon,
  Wrench01Icon,
  UserIcon,
  ClipboardIcon,
  Car01Icon,
  Tag01Icon as TagIcon,
  PackageIcon,
  File01Icon as FileIcon,
  TimelineIcon,
  CheckmarkCircle01Icon,
  Clock01Icon,
  Flag01Icon as FlagIcon,
  Coins01Icon as CoinsDollarIcon,
  BarChartIcon as Chart01Icon,
  ChartHistogramIcon,
  ChartLineData01Icon,
  TableIcon,
  Car01Icon as TruckIcon,
  ActivityIcon as Activity01Icon,
  Calendar01Icon as CalendarCheckIn01Icon,
  Invoice01Icon as ReceiptDollarIcon,
} from '@hugeicons/core-free-icons';
import { Link, useSearchParams } from 'react-router-dom';
import { Stack, Button, Group, Card, Badge, Skeleton, Select, Tabs } from '@/components/tailwind-components';
import { supabase } from '@/integrations/supabase/client';
import { WorkOrder, Technician, Vehicle } from '@/types/supabase';
import dayjs from 'dayjs';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { professionalColors } from '@/theme/professional-colors';
import InventoryReport from '@/components/reports/InventoryReport';

type ReportType = 'overview' | 'technician' | 'workorder' | 'asset' | 'financial' | 'inventory' | 'fleet';
type DateRange = '7days' | '30days' | '90days' | 'year' | 'custom';

const Reports: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') as ReportType | null;

  const [reportType, setReportType] = useState<ReportType>(tabFromUrl || 'overview');
  const [dateRange, setDateRange] = useState<DateRange>('30days');
  const [startDate, setStartDate] = useState(dayjs().subtract(30, 'days').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(dayjs().format('YYYY-MM-DD'));

  // Update report type when URL changes
  useEffect(() => {
    if (tabFromUrl && tabFromUrl !== reportType) {
      setReportType(tabFromUrl);
    }
  }, [tabFromUrl, reportType]);

  // Update date range when selection changes
  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
    const today = dayjs();

    switch (range) {
      case '7days':
        setStartDate(today.subtract(7, 'days').format('YYYY-MM-DD'));
        setEndDate(today.format('YYYY-MM-DD'));
        break;
      case '30days':
        setStartDate(today.subtract(30, 'days').format('YYYY-MM-DD'));
        setEndDate(today.format('YYYY-MM-DD'));
        break;
      case '90days':
        setStartDate(today.subtract(90, 'days').format('YYYY-MM-DD'));
        setEndDate(today.format('YYYY-MM-DD'));
        break;
      case 'year':
        setStartDate(today.subtract(1, 'year').format('YYYY-MM-DD'));
        setEndDate(today.format('YYYY-MM-DD'));
        break;
    }
  };

  // Fetch work orders
  const { data: workOrders, isLoading: loadingWorkOrders } = useQuery({
    queryKey: ['work-orders-reports', startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('work_orders')
        .select('*, technician:technicians(*), customer:customers(*), vehicle:vehicles(*)')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as WorkOrder[];
    },
  });

  // Fetch technicians
  const { data: technicians, isLoading: loadingTechnicians } = useQuery({
    queryKey: ['technicians'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('technicians')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Technician[];
    },
  });

  // Fetch vehicles
  const { data: vehicles, isLoading: loadingVehicles } = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Vehicle[];
    },
  });

  const handleExportPDF = () => {
    // TODO: Implement PDF export
    alert('PDF export functionality coming soon!');
  };

  const handleExportExcel = () => {
    // TODO: Implement Excel export
    alert('Excel export functionality coming soon!');
  };

  if (loadingWorkOrders || loadingTechnicians || loadingVehicles) {
    return (
      <div className="flex h-screen bg-white">
        <div className="w-80 border-r border-gray-200 flex flex-col">
          <div className="px-4 py-4 border-b border-gray-200">
            <Skeleton height={24} width={120} className="mb-3" />
            <Skeleton height={36} />
          </div>
          <div className="flex-1 p-4">
            <Skeleton height={400} />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Skeleton height={48} width={48} className="mx-auto mb-3" />
            <Skeleton height={20} width={160} className="mx-auto mb-2" />
            <Skeleton height={16} width={240} className="mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900">
      {/* Left Panel - Report Navigation & Controls */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-800 flex flex-col">
        {/* Header */}
        <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Reports</h1>
            <button
              onClick={handleExportPDF}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <HugeiconsIcon icon={FileIcon} size={16} />
            </button>
          </div>

          {/* Date Range Selector */}
          <div className="space-y-2 mb-4">
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => handleDateRangeChange(e.target.value as DateRange)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="year">Last Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Custom Date Inputs */}
          {dateRange === 'custom' && (
            <div className="space-y-2 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          )}

          {/* Report Type Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">Report Type</label>
            <div className="space-y-1">
              {[
                { id: 'overview', label: 'Overview', icon: Home01Icon },
                { id: 'fleet', label: 'Fleet Overview', icon: Car01Icon },
                { id: 'technician', label: 'Technician Performance', icon: UserIcon },
                { id: 'workorder', label: 'Work Order Analysis', icon: ClipboardIcon },
                { id: 'asset', label: 'Asset Reports', icon: Car01Icon },
                { id: 'financial', label: 'Financial Summary', icon: TagIcon },
                { id: 'inventory', label: 'Inventory Reports', icon: PackageIcon },
              ].map((report) => (
                <button
                  key={report.id}
                  onClick={() => setReportType(report.id as ReportType)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${reportType === report.id
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                >
                  <HugeiconsIcon icon={report.icon} size={16} />
                  {report.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wide">Export Options</h3>
          <div className="space-y-2">
            <button
              onClick={handleExportPDF}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <HugeiconsIcon icon={FileIcon} size={16} />
              Export PDF
            </button>
            <button
              onClick={handleExportExcel}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <HugeiconsIcon icon={FileIcon} size={16} />
              Export Excel
            </button>
          </div>
        </div>

        {/* Date Range Info */}
        <div className="px-4 py-3">
          <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">Current Period</h3>
          <div className="text-sm text-gray-900 dark:text-gray-100">
            {dayjs(startDate).format('MMM D, YYYY')} - {dayjs(endDate).format('MMM D, YYYY')}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {dayjs(endDate).diff(dayjs(startDate), 'days')} days
          </div>
        </div>
      </div>

      {/* Right Panel - Report Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {reportType === 'overview' ? 'Overview Report' :
                  reportType === 'technician' ? 'Technician Performance' :
                    reportType === 'workorder' ? 'Work Order Analysis' :
                      reportType === 'asset' ? 'Asset Reports' :
                        reportType === 'fleet' ? 'Fleet Overview' :
                          reportType === 'financial' ? 'Financial Summary' : 'Inventory Reports'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {reportType === 'overview' ? 'Comprehensive insights and performance metrics' :
                  reportType === 'technician' ? 'Individual technician performance analysis' :
                    reportType === 'workorder' ? 'Work order trends and patterns' :
                      reportType === 'asset' ? 'Asset maintenance and service history' :
                        reportType === 'fleet' ? 'Fleet status, health, and availability metrics' :
                          reportType === 'financial' ? 'Revenue and cost analysis' : 'Inventory valuation, movement, and analytics'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {reportType === 'overview' && (
            <OverviewReport
              workOrders={workOrders || []}
              technicians={technicians || []}
              vehicles={vehicles || []}
              startDate={startDate}
              endDate={endDate}
            />
          )}

          {reportType === 'fleet' && (
            <FleetOverviewReport
              vehicles={vehicles || []}
              workOrders={workOrders || []}
            />
          )}

          {reportType === 'technician' && (
            <TechnicianPerformanceReport
              workOrders={workOrders || []}
              technicians={technicians || []}
            />
          )}

          {reportType === 'workorder' && (
            <WorkOrderAnalysisReport
              workOrders={workOrders || []}
            />
          )}

          {reportType === 'asset' && (
            <AssetReport
              workOrders={workOrders || []}
              vehicles={vehicles || []}
            />
          )}

          {reportType === 'financial' && (
            <FinancialReport
              workOrders={workOrders || []}
            />
          )}

          {reportType === 'inventory' && (
            <InventoryReport />
          )}
        </div>
      </div>
    </div>
  );
};

// Chart colors from design system
const CHART_COLORS = {
  primary: professionalColors.chart.primary,
  extended: professionalColors.chart.extended,
  gradients: professionalColors.chart.gradients,

  // Semantic colors for specific use cases
  steelBlue: professionalColors.steelBlue[500],
  safetyOrange: professionalColors.safetyOrange[500],
  industrialGreen: professionalColors.industrialGreen[500],
  maintenanceYellow: professionalColors.maintenanceYellow[500],
  warningRed: professionalColors.warningRed[500],
  machineryGray: professionalColors.machineryGray[500],

  // Status colors
  pending: professionalColors.maintenanceYellow[500],
  inProgress: professionalColors.steelBlue[500],
  completed: professionalColors.industrialGreen[500],
  onHold: professionalColors.safetyOrange[500],

  // Priority colors
  urgent: professionalColors.warningRed[600],
  high: professionalColors.safetyOrange[600],
  medium: professionalColors.maintenanceYellow[600],
  low: professionalColors.machineryGray[500],
};

// Overview Report Component
const OverviewReport: React.FC<{
  workOrders: WorkOrder[];
  technicians: Technician[];
  vehicles: Vehicle[];
  startDate: string;
  endDate: string;
}> = ({ workOrders, technicians, vehicles, startDate, endDate }) => {
  const stats = useMemo(() => {
    const total = workOrders.length;
    const completed = workOrders.filter(wo => wo.status === 'completed').length;
    const inProgress = workOrders.filter(wo => wo.status === 'in_progress').length;
    const pending = workOrders.filter(wo => wo.status === 'pending').length;
    const onHold = workOrders.filter(wo => wo.status === 'on_hold').length;

    const completionRate = total > 0 ? ((completed / total) * 100).toFixed(1) : '0';

    const totalCost = workOrders.reduce((sum, wo) => sum + (wo.total_cost || 0), 0);
    const avgCost = total > 0 ? (totalCost / total) : 0;

    const activeTechnicians = technicians.filter(t => t.status === 'active').length;
    const totalVehicles = vehicles.length;

    return {
      total,
      completed,
      inProgress,
      pending,
      onHold,
      completionRate,
      totalCost,
      avgCost,
      activeTechnicians,
      totalVehicles,
    };
  }, [workOrders, technicians, vehicles]);

  // Prepare chart data
  const statusChartData = useMemo(() => [
    { name: 'Pending', value: stats.pending, color: CHART_COLORS.pending },
    { name: 'In Progress', value: stats.inProgress, color: CHART_COLORS.inProgress },
    { name: 'Completed', value: stats.completed, color: CHART_COLORS.completed },
    { name: 'On Hold', value: stats.onHold, color: CHART_COLORS.onHold },
  ], [stats]);

  const priorityChartData = useMemo(() => {
    return ['urgent', 'high', 'medium', 'low'].map(priority => ({
      name: priority.charAt(0).toUpperCase() + priority.slice(1),
      count: workOrders.filter(wo => wo.priority === priority).length,
      color: CHART_COLORS[priority as keyof typeof CHART_COLORS] as string,
    }));
  }, [workOrders]);

  // Timeline data - group by day
  const timelineData = useMemo(() => {
    const grouped: Record<string, { date: string; completed: number; created: number }> = {};

    workOrders.forEach(wo => {
      const createdDate = dayjs(wo.created_at).format('MMM DD');
      if (!grouped[createdDate]) {
        grouped[createdDate] = { date: createdDate, completed: 0, created: 0 };
      }
      grouped[createdDate].created += 1;
      if (wo.status === 'completed') {
        grouped[createdDate].completed += 1;
      }
    });

    return Object.values(grouped).sort((a, b) =>
      dayjs(a.date, 'MMM DD').valueOf() - dayjs(b.date, 'MMM DD').valueOf()
    );
  }, [workOrders]);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Work Orders</span>
            <div className="p-2 bg-primary-50 dark:bg-primary-900/30 rounded-lg">
              <HugeiconsIcon icon={ClipboardIcon} size={20} className="text-primary-600 dark:text-primary-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {dayjs(startDate).format('MMM D')} - {dayjs(endDate).format('MMM D, YYYY')}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Completion Rate</span>
            <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg">
              <HugeiconsIcon icon={CheckmarkCircle01Icon} size={20} className="text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.completionRate}%</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {stats.completed} of {stats.total} completed
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</span>
            <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg">
              <HugeiconsIcon icon={CoinsDollarIcon} size={20} className="text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            UGX {(stats.totalCost / 1000000).toFixed(1)}M
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Avg: UGX {(stats.avgCost / 1000).toFixed(0)}K
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Technicians</span>
            <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
              <HugeiconsIcon icon={Wrench01Icon} size={20} className="text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.activeTechnicians}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Managing {stats.totalVehicles} vehicles
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Pie Chart */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <HugeiconsIcon icon={Chart01Icon} size={20} className="text-primary-600 dark:text-primary-400" />
            Status Distribution
          </h3>
          <ReactECharts
            option={{
              tooltip: {
                trigger: 'item',
                formatter: '{b}: {c} ({d}%)',
              },
              legend: {
                bottom: 10,
                left: 'center',
              },
              series: [
                {
                  type: 'pie',
                  radius: ['40%', '70%'],
                  avoidLabelOverlap: false,
                  itemStyle: {
                    borderRadius: 10,
                    borderColor: '#fff',
                    borderWidth: 2,
                  },
                  label: {
                    show: true,
                    formatter: '{b}: {d}%',
                  },
                  emphasis: {
                    label: {
                      show: true,
                      fontSize: 14,
                      fontWeight: 'bold',
                    },
                  },
                  data: statusChartData.map(item => ({
                    value: item.value,
                    name: item.name,
                    itemStyle: { color: item.color },
                  })),
                },
              ],
            }}
            style={{ height: '350px' }}
          />
        </div>

        {/* Priority Distribution Bar Chart */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <HugeiconsIcon icon={ChartHistogramIcon} size={20} className="text-primary-600 dark:text-primary-400" />
            Priority Distribution
          </h3>
          <ReactECharts
            option={{
              tooltip: {
                trigger: 'axis',
                axisPointer: {
                  type: 'shadow',
                },
              },
              grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true,
              },
              xAxis: {
                type: 'category',
                data: priorityChartData.map(item => item.name),
                axisTick: {
                  alignWithLabel: true,
                },
              },
              yAxis: {
                type: 'value',
              },
              series: [
                {
                  type: 'bar',
                  data: priorityChartData.map(item => ({
                    value: item.count,
                    itemStyle: {
                      color: item.color,
                      borderRadius: [8, 8, 0, 0],
                    },
                  })),
                  barWidth: '60%',
                },
              ],
            }}
            style={{ height: '350px' }}
          />
        </div>
      </div>

      {/* Timeline Chart */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <HugeiconsIcon icon={ChartLineData01Icon} size={20} className="text-primary-600 dark:text-primary-400" />
          Work Orders Timeline
        </h3>
        <ReactECharts
          option={{
            tooltip: {
              trigger: 'axis',
              axisPointer: {
                type: 'cross',
              },
            },
            legend: {
              data: ['Created', 'Completed'],
              bottom: 10,
            },
            grid: {
              left: '3%',
              right: '4%',
              bottom: '15%',
              containLabel: true,
            },
            xAxis: {
              type: 'category',
              boundaryGap: false,
              data: timelineData.map(item => item.date),
            },
            yAxis: {
              type: 'value',
            },
            series: [
              {
                name: 'Created',
                type: 'line',
                smooth: true,
                areaStyle: {
                  color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [
                      { offset: 0, color: CHART_COLORS.steelBlue + '40' },
                      { offset: 1, color: CHART_COLORS.steelBlue + '00' },
                    ],
                  },
                },
                lineStyle: {
                  color: CHART_COLORS.steelBlue,
                  width: 2,
                },
                itemStyle: {
                  color: CHART_COLORS.steelBlue,
                },
                data: timelineData.map(item => item.created),
              },
              {
                name: 'Completed',
                type: 'line',
                smooth: true,
                areaStyle: {
                  color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [
                      { offset: 0, color: CHART_COLORS.industrialGreen + '40' },
                      { offset: 1, color: CHART_COLORS.industrialGreen + '00' },
                    ],
                  },
                },
                lineStyle: {
                  color: CHART_COLORS.industrialGreen,
                  width: 2,
                },
                itemStyle: {
                  color: CHART_COLORS.industrialGreen,
                },
                data: timelineData.map(item => item.completed),
              },
            ],
          }}
          style={{ height: '350px' }}
        />
      </div>
    </div>
  );
};

// Technician Performance Report
const TechnicianPerformanceReport: React.FC<{
  workOrders: WorkOrder[];
  technicians: Technician[];
}> = ({ workOrders, technicians }) => {
  const technicianStats = useMemo(() => {
    return technicians.map(tech => {
      const techWorkOrders = workOrders.filter(wo => wo.technician_id === tech.id);
      const completed = techWorkOrders.filter(wo => wo.status === 'completed').length;
      const inProgress = techWorkOrders.filter(wo => wo.status === 'in_progress').length;
      const total = techWorkOrders.length;
      const completionRate = total > 0 ? ((completed / total) * 100).toFixed(1) : '0';
      const totalRevenue = techWorkOrders.reduce((sum, wo) => sum + (wo.total_cost || 0), 0);

      return {
        ...tech,
        total,
        completed,
        inProgress,
        completionRate: parseFloat(completionRate),
        totalRevenue,
      };
    }).sort((a, b) => b.total - a.total);
  }, [workOrders, technicians]);

  // Chart data for technician comparison
  const technicianChartData = useMemo(() => {
    return technicianStats.slice(0, 8).map(tech => ({
      name: tech.name.split(' ')[0], // First name only for chart
      completed: tech.completed,
      inProgress: tech.inProgress,
      total: tech.total,
    }));
  }, [technicianStats]);

  return (
    <div className="space-y-6">
      {/* Performance Comparison Chart */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <HugeiconsIcon icon={ChartHistogramIcon} size={20} className="text-primary-600 dark:text-primary-400" />
          Technician Performance Comparison
        </h3>
        <ReactECharts
          option={{
            tooltip: {
              trigger: 'axis',
              axisPointer: {
                type: 'shadow',
              },
            },
            legend: {
              data: ['Completed', 'In Progress'],
              bottom: 10,
            },
            grid: {
              left: '3%',
              right: '4%',
              bottom: '15%',
              containLabel: true,
            },
            xAxis: {
              type: 'category',
              data: technicianChartData.map(item => item.name),
            },
            yAxis: {
              type: 'value',
            },
            series: [
              {
                name: 'Completed',
                type: 'bar',
                data: technicianChartData.map(item => item.completed),
                itemStyle: {
                  color: CHART_COLORS.completed,
                  borderRadius: [8, 8, 0, 0],
                },
              },
              {
                name: 'In Progress',
                type: 'bar',
                data: technicianChartData.map(item => item.inProgress),
                itemStyle: {
                  color: CHART_COLORS.inProgress,
                  borderRadius: [8, 8, 0, 0],
                },
              },
            ],
          }}
          style={{ height: '400px' }}
        />
      </div>

      {/* Individual Technician Cards */}
      <div className="space-y-4">
        {technicianStats.map(tech => (
          <div key={tech.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                  <HugeiconsIcon icon={Wrench01Icon} size={24} className="text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{tech.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{tech.specialization}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded text-xs font-medium ${tech.status === 'active'
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                }`}>
                {tech.status}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total WOs</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{tech.total}</div>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Completed</div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{tech.completed}</div>
              </div>
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">In Progress</div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{tech.inProgress}</div>
              </div>
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Completion Rate</div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{tech.completionRate}%</div>
              </div>
              <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Revenue</div>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {(tech.totalRevenue / 1000000).toFixed(1)}M
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Work Order Analysis Report
const WorkOrderAnalysisReport: React.FC<{
  workOrders: WorkOrder[];
}> = ({ workOrders }) => {
  const analysis = useMemo(() => {
    const byServiceType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    const byPriority: Record<string, number> = {};

    workOrders.forEach(wo => {
      // Service type
      const serviceType = wo.service_type || 'Unknown';
      byServiceType[serviceType] = (byServiceType[serviceType] || 0) + 1;

      // Status
      byStatus[wo.status] = (byStatus[wo.status] || 0) + 1;

      // Priority
      byPriority[wo.priority] = (byPriority[wo.priority] || 0) + 1;
    });

    return { byServiceType, byStatus, byPriority };
  }, [workOrders]);

  // Service type chart data
  const serviceTypeChartData = useMemo(() => {
    return Object.entries(analysis.byServiceType)
      .sort(([, a], [, b]) => b - a)
      .map(([type, count]) => ({
        name: type,
        value: count,
      }));
  }, [analysis.byServiceType]);

  // Status chart data
  const statusChartData = useMemo(() => {
    const statusColors: Record<string, string> = {
      pending: CHART_COLORS.pending,
      in_progress: CHART_COLORS.inProgress,
      completed: CHART_COLORS.completed,
      on_hold: CHART_COLORS.onHold,
      cancelled: CHART_COLORS.machineryGray,
    };

    return Object.entries(analysis.byStatus)
      .sort(([, a], [, b]) => b - a)
      .map(([status, count]) => ({
        name: status.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        value: count,
        color: statusColors[status] || CHART_COLORS.machineryGray,
      }));
  }, [analysis.byStatus]);

  return (
    <div className="space-y-6">
      {/* Service Type Bar Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <HugeiconsIcon icon={ChartHistogramIcon} size={20} className="text-primary-600" />
          Work Orders by Service Type
        </h3>
        <ReactECharts
          option={{
            tooltip: {
              trigger: 'axis',
              axisPointer: {
                type: 'shadow',
              },
            },
            grid: {
              left: '15%',
              right: '4%',
              bottom: '3%',
              containLabel: true,
            },
            xAxis: {
              type: 'value',
            },
            yAxis: {
              type: 'category',
              data: serviceTypeChartData.map(item => item.name),
            },
            series: [
              {
                type: 'bar',
                data: serviceTypeChartData.map(item => item.value),
                itemStyle: {
                  color: CHART_COLORS.steelBlue,
                  borderRadius: [0, 8, 8, 0],
                },
                barWidth: '60%',
              },
            ],
          }}
          style={{ height: '400px' }}
        />
      </div>

      {/* Status and Priority Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <HugeiconsIcon icon={Chart01Icon} size={20} className="text-primary-600" />
            By Status
          </h3>
          <ReactECharts
            option={{
              tooltip: {
                trigger: 'item',
                formatter: '{b}: {c} ({d}%)',
              },
              legend: {
                bottom: 10,
                left: 'center',
              },
              series: [
                {
                  type: 'pie',
                  radius: '70%',
                  center: ['50%', '45%'],
                  itemStyle: {
                    borderRadius: 8,
                    borderColor: '#fff',
                    borderWidth: 2,
                  },
                  label: {
                    show: true,
                    formatter: '{b}: {d}%',
                  },
                  emphasis: {
                    label: {
                      show: true,
                      fontSize: 14,
                      fontWeight: 'bold',
                    },
                  },
                  data: statusChartData.map(item => ({
                    value: item.value,
                    name: item.name,
                    itemStyle: { color: item.color },
                  })),
                },
              ],
            }}
            style={{ height: '350px' }}
          />
        </div>

        {/* Priority List */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <HugeiconsIcon icon={FlagIcon} size={20} className="text-primary-600" />
            By Priority
          </h3>
          <div className="space-y-3">
            {Object.entries(analysis.byPriority)
              .sort(([, a], [, b]) => b - a)
              .map(([priority, count]) => {
                const total = workOrders.length;
                const percentage = ((count / total) * 100).toFixed(1);
                const priorityColors: Record<string, { bg: string; text: string; bar: string }> = {
                  urgent: { bg: 'bg-red-50', text: 'text-red-700', bar: professionalColors.warningRed[600] },
                  high: { bg: 'bg-orange-50', text: 'text-orange-700', bar: professionalColors.safetyOrange[600] },
                  medium: { bg: 'bg-yellow-50', text: 'text-yellow-700', bar: professionalColors.maintenanceYellow[600] },
                  low: { bg: 'bg-green-50', text: 'text-green-700', bar: professionalColors.industrialGreen[500] },
                };
                const colors = priorityColors[priority] || { bg: 'bg-gray-50', text: 'text-gray-700', bar: professionalColors.machineryGray[500] };

                return (
                  <div key={priority} className={`p-4 ${colors.bg} rounded-lg`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-semibold ${colors.text} capitalize`}>{priority}</span>
                      <span className={`text-lg font-bold ${colors.text}`}>{count}</span>
                    </div>
                    <div className="w-full bg-white/50 rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: colors.bar
                        }}
                      />
                    </div>
                    <div className="text-xs text-gray-600 mt-1">{percentage}% of total</div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};

// Asset Report
const AssetReport: React.FC<{
  workOrders: WorkOrder[];
  vehicles: Vehicle[];
}> = ({ workOrders, vehicles }) => {
  const vehicleStats = useMemo(() => {
    return vehicles.map(vehicle => {
      const vehicleWorkOrders = workOrders.filter(wo => wo.vehicle_id === vehicle.id);
      const totalCost = vehicleWorkOrders.reduce((sum, wo) => sum + (wo.total_cost || 0), 0);

      return {
        ...vehicle,
        workOrderCount: vehicleWorkOrders.length,
        totalCost,
      };
    }).sort((a, b) => b.workOrderCount - a.workOrderCount);
  }, [workOrders, vehicles]);

  // Top 10 for chart
  const top10VehiclesChartData = useMemo(() => {
    return vehicleStats.slice(0, 10).map(v => ({
      name: v.registration_number,
      workOrders: v.workOrderCount,
      cost: v.totalCost / 1000000, // Convert to millions
    }));
  }, [vehicleStats]);

  return (
    <div className="space-y-6">
      {/* Top Vehicles Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <HugeiconsIcon icon={ChartHistogramIcon} size={20} className="text-primary-600" />
          Top 10 Vehicles by Service Frequency
        </h3>
        <ReactECharts
          option={{
            tooltip: {
              trigger: 'axis',
              axisPointer: {
                type: 'shadow',
              },
              formatter: (params: any) => {
                const data = params[0];
                return `${data.name}<br/>Work Orders: ${data.value}`;
              },
            },
            grid: {
              left: '15%',
              right: '4%',
              bottom: '3%',
              containLabel: true,
            },
            xAxis: {
              type: 'value',
            },
            yAxis: {
              type: 'category',
              data: top10VehiclesChartData.map(item => item.name),
              axisLabel: {
                fontSize: 11,
              },
            },
            series: [
              {
                name: 'Work Orders',
                type: 'bar',
                data: top10VehiclesChartData.map(item => item.workOrders),
                itemStyle: {
                  color: CHART_COLORS.steelBlue,
                  borderRadius: [0, 8, 8, 0],
                },
                barWidth: '60%',
                label: {
                  show: true,
                  position: 'right',
                  formatter: '{c}',
                },
              },
            ],
          }}
          style={{ height: '450px' }}
        />
      </div>

      {/* Detailed Table */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <HugeiconsIcon icon={TableIcon} size={20} className="text-primary-600" />
          All Vehicles Service History
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Rank</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Vehicle</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Make/Model</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Work Orders</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total Cost</th>
              </tr>
            </thead>
            <tbody>
              {vehicleStats.slice(0, 20).map((vehicle, index) => (
                <tr key={vehicle.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                      index === 1 ? 'bg-gray-100 text-gray-700' :
                        index === 2 ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-50 text-gray-600'
                      }`}>
                      {index + 1}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <HugeiconsIcon icon={Car01Icon} size={16} className="text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">{vehicle.registration_number}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {vehicle.make} {vehicle.model}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
                      {vehicle.workOrderCount}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm font-semibold text-right text-gray-900">
                    UGX {(vehicle.totalCost / 1000000).toFixed(2)}M
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {vehicleStats.length > 20 && (
          <div className="mt-4 text-center text-sm text-gray-500">
            Showing top 20 of {vehicleStats.length} vehicles
          </div>
        )}
      </div>
    </div>
  );
};

// Financial Report
const FinancialReport: React.FC<{
  workOrders: WorkOrder[];
}> = ({ workOrders }) => {
  const financialStats = useMemo(() => {
    const totalRevenue = workOrders.reduce((sum, wo) => sum + (wo.total_cost || 0), 0);
    const totalLabor = workOrders.reduce((sum, wo) => sum + (wo.labor_cost || 0), 0);
    const totalParts = workOrders.reduce((sum, wo) => sum + (wo.parts_cost || 0), 0);

    const completedRevenue = workOrders
      .filter(wo => wo.status === 'completed')
      .reduce((sum, wo) => sum + (wo.total_cost || 0), 0);

    const pendingRevenue = workOrders
      .filter(wo => wo.status === 'pending' || wo.status === 'in_progress')
      .reduce((sum, wo) => sum + (wo.total_cost || 0), 0);

    return {
      totalRevenue,
      totalLabor,
      totalParts,
      completedRevenue,
      pendingRevenue,
      avgOrderValue: workOrders.length > 0 ? totalRevenue / workOrders.length : 0,
    };
  }, [workOrders]);

  // Revenue breakdown chart data
  const revenueBreakdownData = useMemo(() => [
    { name: 'Completed', value: financialStats.completedRevenue, color: CHART_COLORS.completed },
    { name: 'Pending', value: financialStats.pendingRevenue, color: CHART_COLORS.pending },
  ], [financialStats]);

  // Cost breakdown chart data
  const costBreakdownData = useMemo(() => [
    { name: 'Labor', value: financialStats.totalLabor, color: CHART_COLORS.steelBlue },
    { name: 'Parts', value: financialStats.totalParts, color: CHART_COLORS.industrialGreen },
  ], [financialStats]);

  return (
    <div className="space-y-6">
      {/* Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Total Revenue</span>
            <div className="p-2 bg-gray-50 rounded-lg">
              <HugeiconsIcon icon={CoinsDollarIcon} size={20} className="text-gray-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            UGX {(financialStats.totalRevenue / 1000000).toFixed(1)}M
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Completed Revenue</span>
            <div className="p-2 bg-green-50 rounded-lg">
              <HugeiconsIcon icon={CheckmarkCircle01Icon} size={20} className="text-green-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-green-600">
            UGX {(financialStats.completedRevenue / 1000000).toFixed(1)}M
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Pending Revenue</span>
            <div className="p-2 bg-yellow-50 rounded-lg">
              <HugeiconsIcon icon={Clock01Icon} size={20} className="text-yellow-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-yellow-600">
            UGX {(financialStats.pendingRevenue / 1000000).toFixed(1)}M
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Breakdown Pie Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <HugeiconsIcon icon={Chart01Icon} size={20} className="text-primary-600" />
            Revenue by Status
          </h3>
          <ReactECharts
            option={{
              tooltip: {
                trigger: 'item',
                formatter: (params: any) => {
                  const value = (params.value / 1000000).toFixed(2);
                  return `${params.name}: UGX ${value}M (${params.percent}%)`;
                },
              },
              legend: {
                bottom: 10,
                left: 'center',
              },
              series: [
                {
                  type: 'pie',
                  radius: ['40%', '70%'],
                  center: ['50%', '45%'],
                  itemStyle: {
                    borderRadius: 10,
                    borderColor: '#fff',
                    borderWidth: 2,
                  },
                  label: {
                    show: true,
                    formatter: '{b}: {d}%',
                  },
                  emphasis: {
                    label: {
                      show: true,
                      fontSize: 14,
                      fontWeight: 'bold',
                    },
                  },
                  data: revenueBreakdownData.map(item => ({
                    value: item.value,
                    name: item.name,
                    itemStyle: { color: item.color },
                  })),
                },
              ],
            }}
            style={{ height: '350px' }}
          />
        </div>

        {/* Cost Breakdown Pie Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <HugeiconsIcon icon={Chart01Icon} size={20} className="text-primary-600" />
            Cost Breakdown
          </h3>
          <ReactECharts
            option={{
              tooltip: {
                trigger: 'item',
                formatter: (params: any) => {
                  const value = (params.value / 1000000).toFixed(2);
                  return `${params.name}: UGX ${value}M (${params.percent}%)`;
                },
              },
              legend: {
                bottom: 10,
                left: 'center',
              },
              series: [
                {
                  type: 'pie',
                  radius: ['40%', '70%'],
                  center: ['50%', '45%'],
                  itemStyle: {
                    borderRadius: 10,
                    borderColor: '#fff',
                    borderWidth: 2,
                  },
                  label: {
                    show: true,
                    formatter: '{b}: {d}%',
                  },
                  emphasis: {
                    label: {
                      show: true,
                      fontSize: 14,
                      fontWeight: 'bold',
                    },
                  },
                  data: costBreakdownData.map(item => ({
                    value: item.value,
                    name: item.name,
                    itemStyle: { color: item.color },
                  })),
                },
              ],
            }}
            style={{ height: '350px' }}
          />
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <HugeiconsIcon icon={ReceiptDollarIcon} size={20} className="text-primary-600" />
          Detailed Cost Analysis
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Labor Costs</span>
              <span className="text-sm font-semibold text-gray-900">
                UGX {(financialStats.totalLabor / 1000000).toFixed(2)}M
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="h-3 rounded-full transition-all"
                style={{
                  width: `${(financialStats.totalLabor / financialStats.totalRevenue) * 100}%`,
                  backgroundColor: CHART_COLORS.steelBlue
                }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {((financialStats.totalLabor / financialStats.totalRevenue) * 100).toFixed(1)}% of total revenue
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Parts Costs</span>
              <span className="text-sm font-semibold text-gray-900">
                UGX {(financialStats.totalParts / 1000000).toFixed(2)}M
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="h-3 rounded-full transition-all"
                style={{
                  width: `${(financialStats.totalParts / financialStats.totalRevenue) * 100}%`,
                  backgroundColor: CHART_COLORS.industrialGreen
                }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {((financialStats.totalParts / financialStats.totalRevenue) * 100).toFixed(1)}% of total revenue
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <span className="text-sm font-medium text-gray-700">Average Order Value</span>
                <p className="text-xs text-gray-500 mt-1">Per work order</p>
              </div>
              <span className="text-2xl font-bold text-gray-900">
                UGX {(financialStats.avgOrderValue / 1000).toFixed(0)}K
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


// Fleet Overview Report
const FleetOverviewReport: React.FC<{
  vehicles: Vehicle[];
  workOrders: WorkOrder[];
}> = ({ vehicles, workOrders }) => {
  const stats = useMemo(() => {
    const total = vehicles.length;
    const active = vehicles.filter(v => v.status === 'Active').length;
    const maintenance = vehicles.filter(v => v.status === 'Maintenance').length;
    const outOfService = vehicles.filter(v => v.status === 'Out of Service').length;

    // Calculate availability rate
    const availabilityRate = total > 0 ? ((active / total) * 100).toFixed(1) : '0';

    // Calculate average age (mock calculation based on year)
    const currentYear = new Date().getFullYear();
    const totalAge = vehicles.reduce((sum, v) => sum + (currentYear - (v.year || currentYear)), 0);
    const avgAge = total > 0 ? (totalAge / total).toFixed(1) : '0';

    return { total, active, maintenance, outOfService, availabilityRate, avgAge };
  }, [vehicles]);

  // Status Chart Data
  const statusData = useMemo(() => [
    { name: 'Active', value: stats.active, color: CHART_COLORS.industrialGreen },
    { name: 'Maintenance', value: stats.maintenance, color: CHART_COLORS.maintenanceYellow },
    { name: 'Out of Service', value: stats.outOfService, color: CHART_COLORS.warningRed },
  ], [stats]);

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Fleet */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Fleet Size</span>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <HugeiconsIcon icon={TruckIcon} size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</div>
        </div>

        {/* Availability Rate */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Availability Rate</span>
            <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg">
              <HugeiconsIcon icon={Activity01Icon} size={20} className="text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.availabilityRate}%</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stats.active} vehicles available</div>
        </div>

        {/* In Maintenance */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">In Maintenance</span>
            <div className="p-2 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
              <HugeiconsIcon icon={Wrench01Icon} size={20} className="text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.maintenance}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1"> Currently being serviced</div>
        </div>

        {/* Average Age */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Age</span>
            <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <HugeiconsIcon icon={CalendarCheckIn01Icon} size={20} className="text-gray-600 dark:text-gray-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.avgAge}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Years</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <HugeiconsIcon icon={Chart01Icon} size={20} className="text-primary-600 dark:text-primary-400" />
            Fleet Status Distribution
          </h3>
          <ReactECharts
            option={{
              tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
              legend: { bottom: 0 },
              series: [{
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
                label: { show: true, formatter: '{b}: {c}' },
                data: statusData.map(item => ({ value: item.value, name: item.name, itemStyle: { color: item.color } }))
              }]
            }}
            style={{ height: '300px' }}
          />
        </div>
      </div>
    </div>
  );
};

export default Reports;
