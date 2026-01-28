import { 
  AlertCircle, 
  Calendar, 
  Clock, 
  Loader2, 
  Tag, 
  TrendingUp, 
  ArrowLeftRight, 
  TrendingUp as AnalyticsUpIcon, 
  PieChart as PieChartIcon, 
  Package, 
  PackageCheck as PackageDeliveredIcon,
  Layers as Layers01Icon,
  BarChart3 as ChartIcon,
  ArrowDown as ArrowDownIcon,
  ArrowUp as ArrowUpIcon,
  FileText as Invoice01Icon,
  Grid3X3 as GridIcon,
  Building2 as Building04Icon
} from 'lucide-react';
import React, { useState } from 'react';


import {
  useInventoryValuation,
  useStockMovementHistory,
  useSlowMovingStock,
  useDeadStock,
  useUsageTrends,
  useCostAnalysis,
  useInventoryTurnover,
} from '@/hooks/useInventoryReports';
import { ITEM_CATEGORY_LABELS } from '@/utils/inventory-categorization-helpers';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import dayjs from 'dayjs';

type InventoryReportType = 'valuation' | 'movement' | 'slow-moving' | 'trends' | 'cost-analysis';

const INVENTORY_REPORT_TABS = [
  { id: 'valuation', label: 'Valuation', icon: Tag },
  { id: 'movement', label: 'Stock Movement', icon: ArrowLeftRight },
  { id: 'slow-moving', label: 'Slow/Dead Stock', icon: Clock },
  { id: 'trends', label: 'Usage Trends', icon: AnalyticsUpIcon },
  { id: 'cost-analysis', label: 'Cost Analysis', icon: PieChartIcon },
];

// Currency formatter for UGX
const formatCurrency = (amount: number) => `UGX ${amount.toLocaleString()}`;

const InventoryReport: React.FC = () => {
  const [activeReport, setActiveReport] = useState<InventoryReportType>('valuation');

  return (
    <div className="space-y-4">
      {/* Report Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {INVENTORY_REPORT_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveReport(tab.id as InventoryReportType)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors ${activeReport === tab.id
              ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div>
        {activeReport === 'valuation' && <ValuationReport />}
        {activeReport === 'movement' && <StockMovementReport />}
        {activeReport === 'slow-moving' && <SlowMovingReport />}
        {activeReport === 'trends' && <UsageTrendsReport />}
        {activeReport === 'cost-analysis' && <CostAnalysisReport />}
      </div>
    </div>
  );
};

// ============ VALUATION REPORT ============

const ValuationReport: React.FC = () => {
  const { data, isLoading } = useInventoryValuation();

  if (isLoading) return <LoadingState />;
  if (!data) return <EmptyState message="No valuation data available" />;

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-3">
        <StatCard
          label="Total Items"
          value={data.totalItems.toLocaleString()}
          icon={Package}
          color="purple"
        />
        <StatCard
          label="Total Quantity"
          value={data.totalQuantity.toLocaleString()}
          icon={Layers01Icon}
          color="blue"
        />
        <StatCard
          label="Total Value"
          value={formatCurrency(data.totalValue)}
          icon={Tag}
          color="emerald"
        />
        <StatCard
          label="Avg Item Value"
          value={formatCurrency(data.averageItemValue)}
          icon={ChartIcon}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Value by Category */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md overflow-hidden">
          <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Value by Category</h3>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <TableHead className="py-1.5 px-3 text-left font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs">Category</TableHead>
                  <TableHead className="py-1.5 px-3 text-right font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs">Items</TableHead>
                  <TableHead className="py-1.5 px-3 text-right font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-gray-700">
                {Object.entries(data.itemsByCategory)
                  .sort(([, a], [, b]) => b.value - a.value)
                  .map(([category, stats]) => (
                    <TableRow key={category} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <TableCell className="py-1.5 px-3 text-gray-900 dark:text-gray-100 font-medium">
                        {ITEM_CATEGORY_LABELS[category as keyof typeof ITEM_CATEGORY_LABELS] || category}
                      </TableCell>
                      <TableCell className="py-1.5 px-3 text-right text-gray-600 dark:text-gray-400">{stats.count}</TableCell>
                      <TableCell className="py-1.5 px-3 text-right font-semibold text-foreground">
                        {formatCurrency(stats.value)}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Value by Warehouse */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md overflow-hidden">
          <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Value by Warehouse</h3>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <TableHead className="py-1.5 px-3 text-left font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs">Warehouse</TableHead>
                  <TableHead className="py-1.5 px-3 text-right font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs">Items</TableHead>
                  <TableHead className="py-1.5 px-3 text-right font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-gray-700">
                {Object.entries(data.itemsByWarehouse)
                  .sort(([, a], [, b]) => b.value - a.value)
                  .map(([warehouse, stats]) => (
                    <TableRow key={warehouse} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <TableCell className="py-1.5 px-3 text-gray-900 dark:text-gray-100 font-medium">{warehouse}</TableCell>
                      <TableCell className="py-1.5 px-3 text-right text-gray-600 dark:text-gray-400">{stats.count}</TableCell>
                      <TableCell className="py-1.5 px-3 text-right font-semibold text-foreground">
                        {formatCurrency(stats.value)}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Top Value Items */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md overflow-hidden">
        <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Top 10 Highest Value Items</h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <TableHead className="py-1.5 px-3 text-left font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs">Item</TableHead>
                <TableHead className="py-1.5 px-3 text-left font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs">SKU</TableHead>
                <TableHead className="py-1.5 px-3 text-right font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs">Qty</TableHead>
                <TableHead className="py-1.5 px-3 text-right font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs">Unit Price</TableHead>
                <TableHead className="py-1.5 px-3 text-right font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs">Total Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-700">
              {data.topValueItems.map((item, idx) => (
                <TableRow key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <TableCell className="py-1.5 px-3">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400 font-medium">{idx + 1}</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{item.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-1.5 px-3 text-gray-600 dark:text-gray-400 font-mono">{item.sku || '-'}</TableCell>
                  <TableCell className="py-1.5 px-3 text-right text-gray-900 dark:text-gray-100">{item.quantity_on_hand}</TableCell>
                  <TableCell className="py-1.5 px-3 text-right text-gray-900 dark:text-gray-100">{formatCurrency(item.unit_price)}</TableCell>
                  <TableCell className="py-1.5 px-3 text-right font-semibold text-foreground">
                    {formatCurrency(item.total_value)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

// ============ STOCK MOVEMENT REPORT ============

const StockMovementReport: React.FC = () => {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  const getDateRange = () => {
    // Anchor to the current minute to ensure the query key is stable for at least 60 seconds
    // This allows the cache to work when switching tabs
    const now = dayjs().startOf('minute');
    switch (dateRange) {
      case '7d': return { start: now.subtract(7, 'day').toISOString(), end: now.toISOString() };
      case '30d': return { start: now.subtract(30, 'day').toISOString(), end: now.toISOString() };
      case '90d': return { start: now.subtract(90, 'day').toISOString(), end: now.toISOString() };
      default: return { start: undefined, end: undefined };
    }
  };

  const { start, end } = getDateRange();
  const { data, isLoading } = useStockMovementHistory(undefined, start, end, 200);

  if (isLoading) return <LoadingState />;
  if (!data) return <EmptyState message="No movement data available" />;

  const REASON_LABELS: Record<string, string> = {
    received: 'Received',
    damaged: 'Damaged',
    returned: 'Returned',
    expired: 'Expired',
    theft: 'Theft',
    cycle_count: 'Cycle Count',
    transfer_in: 'Transfer In',
    transfer_out: 'Transfer Out',
    other: 'Other',
  };

  return (
    <div className="space-y-4">
      {/* Date Range Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Stock Movement History</h3>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value as any)}
          className="px-2 py-1.5 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-xs"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="all">All time</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-3">
        <StatCard
          label="Total In"
          value={`+${data.totalIn.toLocaleString()}`}
          icon={ArrowDownIcon}
          color="emerald"
        />
        <StatCard
          label="Total Out"
          value={`-${data.totalOut.toLocaleString()}`}
          icon={ArrowUpIcon}
          color="red"
        />
        <StatCard
          label="Net Change"
          value={data.netChange >= 0 ? `+${data.netChange}` : data.netChange.toString()}
          icon={ArrowLeftRight}
          color={data.netChange >= 0 ? 'blue' : 'orange'}
        />
        <StatCard
          label="Transactions"
          value={data.records.length.toString()}
          icon={Invoice01Icon}
          color="purple"
        />
      </div>

      {/* Movement by Reason */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-3">
        <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-3">Movement by Reason</h3>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(data.byReason).map(([reason, stats]) => (
            <div key={reason} className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <p className="text-xs font-medium text-gray-900 dark:text-gray-100 mb-0.5">{REASON_LABELS[reason] || reason}</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {stats.count} <span className="text-xs font-normal text-gray-500">transactions</span>
              </p>
              <p className={`text-xs ${stats.quantity >= 0 ? 'text-foreground' : 'text-destructive'}`}>
                {stats.quantity >= 0 ? '+' : ''}{stats.quantity} units
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Movements Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-3">
        <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-2">Recent Movements</h3>
        <div className="overflow-x-auto max-h-64">
          <Table>
            <TableHeader className="sticky top-0 bg-white dark:bg-gray-900">
              <TableRow className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <TableHead className="py-1.5 px-3 text-left font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs">Date</TableHead>
                <TableHead className="py-1.5 px-3 text-left font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs">Item</TableHead>
                <TableHead className="py-1.5 px-3 text-left font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs">Reason</TableHead>
                <TableHead className="py-1.5 px-3 text-right font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs">Change</TableHead>
                <TableHead className="py-1.5 px-3 text-right font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs">After</TableHead>
                <TableHead className="py-1.5 px-3 text-left font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs">By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-700">
              {data.records.slice(0, 50).map(record => (
                <TableRow key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <TableCell className="py-1.5 px-3 text-gray-500">{dayjs(record.created_at).format('MMM D, HH:mm')}</TableCell>
                  <TableCell className="py-1.5 px-3">
                    <p className="font-medium text-gray-900 dark:text-gray-100">{record.item_name}</p>
                    {record.item_sku && <p className="text-xs text-gray-500">{record.item_sku}</p>}
                  </TableCell>
                  <TableCell className="py-1.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${record.quantity_delta > 0
                      ? 'bg-muted text-foreground'
                      : 'bg-destructive/10 text-destructive'
                      }`}>
                      {REASON_LABELS[record.reason] || record.reason}
                    </span>
                  </TableCell>
                  <TableCell className={`py-1.5 px-3 text-right font-medium ${record.quantity_delta > 0 ? 'text-foreground' : 'text-destructive'
                    }`}>
                    {record.quantity_delta > 0 ? '+' : ''}{record.quantity_delta}
                  </TableCell>
                  <TableCell className="py-1.5 px-3 text-right text-gray-900 dark:text-gray-100">{record.quantity_after}</TableCell>
                  <TableCell className="py-1.5 px-3 text-gray-500">{record.created_by_name || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

// ============ SLOW-MOVING / DEAD STOCK REPORT ============

const SlowMovingReport: React.FC = () => {
  const [threshold, setThreshold] = useState<90 | 180 | 365>(90);
  const { data: slowMoving, isLoading: isLoadingSlow } = useSlowMovingStock(threshold);
  const { data: deadStock, isLoading: isLoadingDead } = useDeadStock(180);
  const { data: turnover, isLoading: isLoadingTurnover } = useInventoryTurnover(12);

  const isLoading = isLoadingSlow || isLoadingDead || isLoadingTurnover;

  if (isLoading) return <LoadingState />;

  const slowMovingValue = (slowMoving || []).reduce((sum, i) => sum + i.total_value, 0);
  const deadStockValue = (deadStock || []).reduce((sum, i) => sum + i.total_value, 0);

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-3">
        <StatCard
          label="Slow-Moving Items"
          value={(slowMoving?.length || 0).toString()}
          icon={Clock}
          color="orange"
        />
        <StatCard
          label="Slow-Moving Value"
          value={formatCurrency(slowMovingValue)}
          icon={Tag}
          color="orange"
        />
        <StatCard
          label="Dead Stock Items"
          value={(deadStock?.length || 0).toString()}
          icon={AlertCircle}
          color="red"
        />
        <StatCard
          label="Dead Stock Value"
          value={formatCurrency(deadStockValue)}
          icon={Tag}
          color="red"
        />
      </div>

      {/* Threshold Selector */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500">Show items with no movement for:</span>
        <div className="flex gap-1.5">
          {[90, 180, 365].map(days => (
            <button
              key={days}
              onClick={() => setThreshold(days as any)}
              className={`px-2 py-1 text-xs rounded transition-colors ${threshold === days
                ? 'bg-primary text-primary-foreground'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                }`}
            >
              {days}+ days
            </button>
          ))}
        </div>
      </div>

      {/* Slow-Moving Items Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-3">
        <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Slow-Moving Stock ({threshold}+ days without movement)
        </h3>
        {!slowMoving?.length ? (
          <EmptyState message="No slow-moving items found" />
        ) : (
          <div className="overflow-x-auto max-h-56">
            <Table>
              <TableHeader className="sticky top-0 bg-white dark:bg-gray-900">
                <TableRow className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <TableHead className="py-1.5 px-3 text-left font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs">Item</TableHead>
                  <TableHead className="py-1.5 px-3 text-left font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs">Warehouse</TableHead>
                  <TableHead className="py-1.5 px-3 text-right font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs">Qty</TableHead>
                  <TableHead className="py-1.5 px-3 text-right font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs">Value</TableHead>
                  <TableHead className="py-1.5 px-3 text-right font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs">Days Idle</TableHead>
                  <TableHead className="py-1.5 px-3 text-left font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs">Last Movement</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-gray-700">
                {slowMoving.slice(0, 20).map(item => (
                  <TableRow key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <TableCell className="py-1.5 px-3">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{item.name}</p>
                      {item.sku && <p className="text-xs text-gray-500">{item.sku}</p>}
                    </TableCell>
                    <TableCell className="py-1.5 px-3 text-gray-500">{item.warehouse || '-'}</TableCell>
                    <TableCell className="py-1.5 px-3 text-right text-gray-900 dark:text-gray-100">{item.quantity_on_hand}</TableCell>
                    <TableCell className="py-1.5 px-3 text-right font-medium text-muted-foreground">
                      {formatCurrency(item.total_value)}
                    </TableCell>
                    <TableCell className="py-1.5 px-3 text-right">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${item.days_since_movement >= 180
                        ? 'bg-destructive/10 text-destructive'
                        : 'bg-muted text-muted-foreground'
                        }`}>
                        {item.days_since_movement} days
                      </span>
                    </TableCell>
                    <TableCell className="py-1.5 px-3 text-gray-500">
                      {item.last_movement_date
                        ? dayjs(item.last_movement_date).format('MMM D, YYYY')
                        : 'Never'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

// ============ USAGE TRENDS REPORT ============

const UsageTrendsReport: React.FC = () => {
  const [periodType, setPeriodType] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const { data, isLoading } = useUsageTrends(periodType, periodType === 'daily' ? 30 : periodType === 'weekly' ? 12 : 12);

  if (isLoading) return <LoadingState />;
  if (!data) return <EmptyState message="No trend data available" />;

  const maxUsage = Math.max(...data.trends.map(t => t.totalUsed), 1);

  return (
    <div className="space-y-4">
      {/* Period Selector */}
      <div className="flex items-center justify-end">
        <div className="flex gap-1.5">
          {(['daily', 'weekly', 'monthly'] as const).map(period => (
            <button
              key={period}
              onClick={() => setPeriodType(period)}
              className={`px-2 py-1 text-xs rounded capitalize transition-colors ${periodType === period
                ? 'bg-primary text-primary-foreground'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-3">
        <StatCard
          label="Avg Monthly Usage"
          value={Math.round(data.averageMonthlyUsage).toLocaleString()}
          icon={TrendingUp}
          color="purple"
        />
        <StatCard
          label="Avg Monthly Received"
          value={Math.round(data.averageMonthlyReceived).toLocaleString()}
          icon={PackageDeliveredIcon}
          color="emerald"
        />
        <StatCard
          label="Projected Next Month"
          value={Math.round(data.projectedNextMonth).toLocaleString()}
          icon={AnalyticsUpIcon}
          color="blue"
        />
        <StatCard
          label="Growth Rate"
          value={`${data.growthRate >= 0 ? '+' : ''}${data.growthRate.toFixed(1)}%`}
          icon={data.growthRate >= 0 ? ArrowUpIcon : ArrowDownIcon}
          color={data.growthRate >= 0 ? 'emerald' : 'red'}
        />
      </div>

      {/* Trend Chart (Simple Bar Chart) */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-3">
        <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Usage Over Time
        </h3>
        <div className="space-y-1.5">
          {data.trends.map(trend => (
            <div key={trend.period} className="flex items-center gap-3">
              <span className="w-20 text-xs text-gray-500 flex-shrink-0">
                {periodType === 'monthly'
                  ? dayjs(trend.period).format('MMM YY')
                  : periodType === 'weekly'
                    ? `W${dayjs(trend.period).week()}`
                    : dayjs(trend.period).format('MMM D')}
              </span>
              <div className="flex-1 flex items-center gap-2">
                {/* Usage bar (red) */}
                <div className="flex-1 h-6 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden relative">
                  <div
                    className="h-full bg-destructive/60"
                    style={{ width: `${(trend.totalUsed / maxUsage) * 100}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300">
                    -{trend.totalUsed}
                  </span>
                </div>
                {/* Received bar (green) */}
                <div className="flex-1 h-6 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden relative">
                  <div
                    className="h-full bg-primary/60"
                    style={{ width: `${(trend.totalReceived / maxUsage) * 100}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300">
                    +{trend.totalReceived}
                  </span>
                </div>
              </div>
              <span className={`w-16 text-xs font-medium text-right ${trend.netChange >= 0 ? 'text-foreground' : 'text-destructive'
                }`}>
                {trend.netChange >= 0 ? '+' : ''}{trend.netChange}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-destructive/60 rounded" />
            <span className="text-xs text-gray-500">Used</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary/60 rounded" />
            <span className="text-xs text-gray-500">Received</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ COST ANALYSIS REPORT ============

const CostAnalysisReport: React.FC = () => {
  const { data, isLoading } = useCostAnalysis();

  if (isLoading) return <LoadingState />;
  if (!data) return <EmptyState message="No cost data available" />;

  const maxCategoryValue = Math.max(...data.byCategory.map(c => c.totalValue), 1);

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-3">
        <StatCard
          label="Total Inventory Value"
          value={formatCurrency(data.totalInventoryValue)}
          icon={Tag}
          color="emerald"
        />
        <StatCard
          label="Average Item Cost"
          value={formatCurrency(data.averageItemCost)}
          icon={ChartIcon}
          color="blue"
        />
        <StatCard
          label="Highest Value Category"
          value={ITEM_CATEGORY_LABELS[data.highestValueCategory as keyof typeof ITEM_CATEGORY_LABELS] || data.highestValueCategory}
          icon={ArrowUpIcon}
          color="purple"
        />
        <StatCard
          label="Categories"
          value={data.byCategory.length.toString()}
          icon={GridIcon}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Cost by Category */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-3">
          <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-3">Cost by Category</h3>
          <div className="space-y-3">
            {data.byCategory.map(cat => (
              <div key={cat.category}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                    {ITEM_CATEGORY_LABELS[cat.category as keyof typeof ITEM_CATEGORY_LABELS] || cat.category}
                  </span>
                  <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                    {formatCurrency(cat.totalValue)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${(cat.totalValue / maxCategoryValue) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-10 text-right">
                    {cat.percentageOfTotal.toFixed(1)}%
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {cat.itemCount} items • Avg: {formatCurrency(cat.averageUnitCost)}/unit
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Cost by Supplier */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-3">
          <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-3">Cost by Supplier</h3>
          <div className="space-y-2 max-h-64 overflow-auto">
            {data.bySupplier.map((supplier, idx) => (
              <div key={supplier.supplier_id || idx} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-muted rounded flex items-center justify-center">
                    <Building04Icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                      {supplier.supplier_name}
                    </p>
                    <p className="text-xs text-gray-500">{supplier.itemCount} items</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                    {formatCurrency(supplier.totalValue)}
                  </p>
                  <p className="text-xs text-gray-500">{supplier.percentageOfTotal.toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ HELPER COMPONENTS ============

const StatCard: React.FC<{
  label: string;
  value: string;
  icon: any;
  color: 'purple' | 'emerald' | 'blue' | 'orange' | 'red';
}> = ({ label, value, icon, color }) => {
  const colorClasses = {
    purple: 'bg-primary/10 text-primary',
    emerald: 'bg-muted text-muted-foreground',
    blue: 'bg-muted text-muted-foreground',
    orange: 'bg-muted text-muted-foreground',
    red: 'bg-destructive/10 text-destructive',
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</span>
        <div className={`w-6 h-6 rounded flex items-center justify-center ${colorClasses[color]}`}>
          <icon className="w-4 h-4" />
        </div>
      </div>
      <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{value}</div>
    </div>
  );
};

const LoadingState: React.FC = () => (
  <div className="py-6 space-y-4">
    <Skeleton className="h-8 w-full" />
    <Skeleton className="h-32 w-full" />
    <Skeleton className="h-32 w-full" />
  </div>
);

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="text-center py-12">
    <Clock size={48} className="text-gray-300 mx-auto mb-3" />
    <p className="text-sm text-gray-500">{message}</p>
  </div>
);

export default InventoryReport;



