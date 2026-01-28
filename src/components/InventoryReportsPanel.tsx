import { Calendar, Loader2, X } from 'lucide-react';
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
import dayjs from 'dayjs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface InventoryReportsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type ReportType = 'valuation' | 'movement' | 'slow-moving' | 'trends' | 'cost-analysis';

const REPORT_TABS = [
  { id: 'valuation', label: 'Valuation', icon: 'tabler:currency-dollar' },
  { id: 'movement', label: 'Stock Movement', icon: 'tabler:arrows-exchange' },
  { id: 'slow-moving', label: 'Slow/Dead Stock', icon: 'tabler:clock-pause' },
  { id: 'trends', label: 'Usage Trends', icon: 'tabler:trending-up' },
  { id: 'cost-analysis', label: 'Cost Analysis', icon: 'tabler:chart-pie' },
];

export const InventoryReportsPanel: React.FC<InventoryReportsPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeReport, setActiveReport] = useState<ReportType>('valuation');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Inventory Reports & Analytics
            </h2>
            <p className="text-sm text-muted-foreground">
              Comprehensive inventory insights and analysis
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-accent rounded-lg">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Report Tabs */}
        <div className="flex border-b border-border overflow-x-auto">
          {REPORT_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveReport(tab.id as ReportType)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${activeReport === tab.id
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              {/* TODO: Convert tab.icon prop to use HugeiconsIcon component */}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeReport === 'valuation' && <ValuationReport />}
          {activeReport === 'movement' && <StockMovementReport />}
          {activeReport === 'slow-moving' && <SlowMovingReport />}
          {activeReport === 'trends' && <UsageTrendsReport />}
          {activeReport === 'cost-analysis' && <CostAnalysisReport />}
        </div>
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
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Total Items"
          value={data.totalItems.toLocaleString()}
          icon="tabler:package"
          color="purple"
        />
        <StatCard
          label="Total Quantity"
          value={data.totalQuantity.toLocaleString()}
          icon="tabler:stack-2"
          color="blue"
        />
        <StatCard
          label="Total Value"
          value={`UGX ${data.totalValue.toLocaleString()}`}
          icon="tabler:currency-dollar"
          color="emerald"
        />
        <StatCard
          label="Avg Item Value"
          value={`UGX ${Math.round(data.averageItemValue).toLocaleString()}`}
          icon="tabler:chart-bar"
          color="orange"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Value by Category */}
        <div className="bg-muted rounded-lg p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">Value by Category</h3>
          <div className="space-y-2 max-h-64 overflow-auto">
            {Object.entries(data.itemsByCategory)
              .sort(([, a], [, b]) => b.value - a.value)
              .map(([category, stats]) => (
                <div key={category} className="flex items-center justify-between p-2 bg-card rounded">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {ITEM_CATEGORY_LABELS[category as keyof typeof ITEM_CATEGORY_LABELS] || category}
                    </p>
                    <p className="text-xs text-muted-foreground">{stats.count} items</p>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    UGX {stats.value.toLocaleString()}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Value by Warehouse */}
        <div className="bg-muted rounded-lg p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">Value by Warehouse</h3>
          <div className="space-y-2 max-h-64 overflow-auto">
            {Object.entries(data.itemsByWarehouse)
              .sort(([, a], [, b]) => b.value - a.value)
              .map(([warehouse, stats]) => (
                <div key={warehouse} className="flex items-center justify-between p-2 bg-card rounded">
                  <div>
                    <p className="text-sm font-medium text-foreground">{warehouse}</p>
                    <p className="text-xs text-muted-foreground">{stats.count} items</p>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    UGX {stats.value.toLocaleString()}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Top Value Items */}
      <div className="bg-muted rounded-lg p-4">
        <h3 className="text-sm font-semibold text-foreground mb-4">Top 10 Highest Value Items</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="text-left text-muted-foreground border-b border-border">
              <TableRow>
                <TableHead className="pb-2 font-medium">Item</TableHead>
                <TableHead className="pb-2 font-medium">SKU</TableHead>
                <TableHead className="pb-2 font-medium text-right">Qty</TableHead>
                <TableHead className="pb-2 font-medium text-right">Unit Price</TableHead>
                <TableHead className="pb-2 font-medium text-right">Total Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-700">
              {data.topValueItems.map((item, idx) => (
                <TableRow key={item.id}>
                  <TableCell className="py-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 flex items-center justify-center bg-primary/10 text-primary rounded text-xs font-medium">
                        {idx + 1}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{item.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-2 text-gray-500">{item.sku || '-'}</TableCell>
                  <TableCell className="py-2 text-right text-gray-900 dark:text-gray-100">{item.quantity_on_hand}</TableCell>
                  <TableCell className="py-2 text-right text-gray-900 dark:text-gray-100">UGX {Math.round(item.unit_price).toLocaleString()}</TableCell>
                  <TableCell className="py-2 text-right font-semibold text-foreground">
                    UGX {item.total_value.toLocaleString()}
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
    const now = dayjs();
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
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Stock Movement History</h3>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value as any)}
          className="h-9 px-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="all">All time</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Total In"
          value={`+${data.totalIn.toLocaleString()}`}
          icon="tabler:arrow-down"
          color="emerald"
        />
        <StatCard
          label="Total Out"
          value={`-${data.totalOut.toLocaleString()}`}
          icon="tabler:arrow-up"
          color="red"
        />
        <StatCard
          label="Net Change"
          value={data.netChange >= 0 ? `+${data.netChange}` : data.netChange.toString()}
          icon="tabler:arrows-exchange"
          color={data.netChange >= 0 ? 'blue' : 'orange'}
        />
        <StatCard
          label="Transactions"
          value={data.records.length.toString()}
          icon="tabler:receipt"
          color="purple"
        />
      </div>

      {/* Movement by Reason */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Movement by Reason</h3>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(data.byReason).map(([reason, stats]) => (
            <div key={reason} className="p-3 bg-white dark:bg-gray-700 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">{REASON_LABELS[reason] || reason}</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {stats.count} <span className="text-sm font-normal text-gray-500">transactions</span>
              </p>
              <p className={`text-sm ${stats.quantity >= 0 ? 'text-foreground' : 'text-destructive'}`}>
                {stats.quantity >= 0 ? '+' : ''}{stats.quantity} units
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Movements Table */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Movements</h3>
        <div className="overflow-x-auto max-h-80">
          <Table>
            <TableHeader className="sticky top-0 bg-gray-50 dark:bg-gray-800">
              <TableRow className="text-left text-gray-500 border-b border-gray-200 dark:border-gray-700">
                <TableHead className="pb-2 font-medium">Date</TableHead>
                <TableHead className="pb-2 font-medium">Item</TableHead>
                <TableHead className="pb-2 font-medium">Reason</TableHead>
                <TableHead className="pb-2 font-medium text-right">Change</TableHead>
                <TableHead className="pb-2 font-medium text-right">After</TableHead>
                <TableHead className="pb-2 font-medium">By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-700">
              {data.records.slice(0, 50).map(record => (
                <TableRow key={record.id}>
                  <TableCell className="py-2 text-gray-500">{dayjs(record.created_at).format('MMM D, HH:mm')}</TableCell>
                  <TableCell className="py-2">
                    <p className="font-medium text-gray-900 dark:text-gray-100">{record.item_name}</p>
                    {record.item_sku && <p className="text-xs text-gray-500">{record.item_sku}</p>}
                  </TableCell>
                  <TableCell className="py-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${record.quantity_delta > 0
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-destructive/10 text-destructive'
                      }`}>
                      {REASON_LABELS[record.reason] || record.reason}
                    </span>
                  </TableCell>
                  <TableCell className={`py-2 text-right font-medium ${record.quantity_delta > 0 ? 'text-foreground' : 'text-destructive'
                    }`}>
                    {record.quantity_delta > 0 ? '+' : ''}{record.quantity_delta}
                  </TableCell>
                  <TableCell className="py-2 text-right text-gray-900 dark:text-gray-100">{record.quantity_after}</TableCell>
                  <TableCell className="py-2 text-gray-500">{record.created_by_name || '-'}</TableCell>
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
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Slow-Moving Items"
          value={(slowMoving?.length || 0).toString()}
          icon="tabler:clock-pause"
          color="orange"
        />
        <StatCard
          label="Slow-Moving Value"
          value={`UGX ${slowMovingValue.toLocaleString()}`}
          icon="tabler:currency-dollar"
          color="orange"
        />
        <StatCard
          label="Dead Stock Items"
          value={(deadStock?.length || 0).toString()}
          icon="tabler:alert-triangle"
          color="red"
        />
        <StatCard
          label="Dead Stock Value"
          value={`UGX ${deadStockValue.toLocaleString()}`}
          icon="tabler:currency-dollar"
          color="red"
        />
      </div>

      {/* Threshold Selector */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">Show items with no movement for:</span>
        <div className="flex gap-2">
          {[90, 180, 365].map(days => (
            <button
              key={days}
              onClick={() => setThreshold(days as any)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${threshold === days
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                }`}
            >
              {days}+ days
            </button>
          ))}
        </div>
      </div>

      {/* Slow-Moving Items Table */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Slow-Moving Stock ({threshold}+ days without movement)
        </h3>
        {!slowMoving?.length ? (
          <EmptyState message="No slow-moving items found" />
        ) : (
          <div className="overflow-x-auto max-h-64">
            <Table>
              <TableHeader className="sticky top-0 bg-gray-50 dark:bg-gray-800">
                <TableRow className="text-left text-gray-500 border-b border-gray-200 dark:border-gray-700">
                  <TableHead className="pb-2 font-medium">Item</TableHead>
                  <TableHead className="pb-2 font-medium">Warehouse</TableHead>
                  <TableHead className="pb-2 font-medium text-right">Qty</TableHead>
                  <TableHead className="pb-2 font-medium text-right">Value</TableHead>
                  <TableHead className="pb-2 font-medium text-right">Days Idle</TableHead>
                  <TableHead className="pb-2 font-medium">Last Movement</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-gray-700">
                {slowMoving.slice(0, 20).map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="py-2">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{item.name}</p>
                      {item.sku && <p className="text-xs text-gray-500">{item.sku}</p>}
                    </TableCell>
                    <TableCell className="py-2 text-gray-500">{item.warehouse || '-'}</TableCell>
                    <TableCell className="py-2 text-right text-gray-900 dark:text-gray-100">{item.quantity_on_hand}</TableCell>
                    <TableCell className="py-2 text-right font-medium text-muted-foreground">
                      UGX {Math.round(item.total_value).toLocaleString()}
                    </TableCell>
                    <TableCell className="py-2 text-right">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${item.days_since_movement >= 180
                        ? 'bg-destructive/10 text-destructive'
                        : 'bg-orange-500/10 text-muted-foreground dark:text-orange-400'
                        }`}>
                        {item.days_since_movement} days
                      </span>
                    </TableCell>
                    <TableCell className="py-2 text-gray-500">
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

      {/* Inventory Turnover */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Inventory Turnover Rate (Last 12 Months)
        </h3>
        {!turnover?.length ? (
          <EmptyState message="No turnover data available" />
        ) : (
          <div className="overflow-x-auto max-h-64">
            <Table>
              <TableHeader className="sticky top-0 bg-gray-50 dark:bg-gray-800">
                <TableRow className="text-left text-gray-500 border-b border-gray-200 dark:border-gray-700">
                  <TableHead className="pb-2 font-medium">Item</TableHead>
                  <TableHead className="pb-2 font-medium text-right">Avg Inventory</TableHead>
                  <TableHead className="pb-2 font-medium text-right">Total Sold</TableHead>
                  <TableHead className="pb-2 font-medium text-right">Turnover Rate</TableHead>
                  <TableHead className="pb-2 font-medium text-right">Days to Sell</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-gray-700">
                {turnover.slice(0, 15).map(item => (
                  <TableRow key={item.inventory_item_id}>
                    <TableCell className="py-2">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{item.item_name}</p>
                      {item.item_sku && <p className="text-xs text-gray-500">{item.item_sku}</p>}
                    </TableCell>
                    <TableCell className="py-2 text-right text-gray-900 dark:text-gray-100">
                      {item.average_inventory.toFixed(1)}
                    </TableCell>
                    <TableCell className="py-2 text-right text-gray-900 dark:text-gray-100">{item.total_sold}</TableCell>
                    <TableCell className="py-2 text-right">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${item.turnover_rate >= 4
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : item.turnover_rate >= 1
                          ? 'bg-blue-500/10 text-muted-foreground dark:text-blue-400'
                          : 'bg-orange-500/10 text-muted-foreground dark:text-orange-400'
                        }`}>
                        {item.turnover_rate.toFixed(2)}x
                      </span>
                    </TableCell>
                    <TableCell className="py-2 text-right text-gray-500">
                      {item.days_to_sell >= 999 ? '∞' : `${Math.round(item.days_to_sell)} days`}
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
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Usage Trends & Forecasting</h3>
        <div className="flex gap-2">
          {(['daily', 'weekly', 'monthly'] as const).map(period => (
            <button
              key={period}
              onClick={() => setPeriodType(period)}
              className={`px-3 py-1.5 text-sm rounded-lg capitalize transition-colors ${periodType === period
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Avg Monthly Usage"
          value={Math.round(data.averageMonthlyUsage).toLocaleString()}
          icon="tabler:chart-line"
          color="purple"
        />
        <StatCard
          label="Avg Monthly Received"
          value={Math.round(data.averageMonthlyReceived).toLocaleString()}
          icon="tabler:package-import"
          color="emerald"
        />
        <StatCard
          label="Projected Next Month"
          value={Math.round(data.projectedNextMonth).toLocaleString()}
          icon="tabler:trending-up"
          color="blue"
        />
        <StatCard
          label="Growth Rate"
          value={`${data.growthRate >= 0 ? '+' : ''}${data.growthRate.toFixed(1)}%`}
          icon={data.growthRate >= 0 ? 'tabler:arrow-up' : 'tabler:arrow-down'}
          color={data.growthRate >= 0 ? 'emerald' : 'red'}
        />
      </div>

      {/* Trend Chart (Simple Bar Chart) */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Usage Over Time
        </h3>
        <div className="space-y-2">
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
                    className="h-full bg-destructive"
                    style={{ width: `${(trend.totalUsed / maxUsage) * 100}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300">
                    -{trend.totalUsed}
                  </span>
                </div>
                {/* Received bar (green) */}
                <div className="flex-1 h-6 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden relative">
                  <div
                    className="h-full bg-emerald-500"
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
            <div className="w-3 h-3 bg-destructive rounded" />
            <span className="text-xs text-gray-500">Used</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-500 rounded" />
            <span className="text-xs text-gray-500">Received</span>
          </div>
        </div>
      </div>

      {/* Trend Data Table */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Detailed Data</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="text-left text-gray-500 border-b border-gray-200 dark:border-gray-700">
                <TableHead className="pb-2 font-medium">Period</TableHead>
                <TableHead className="pb-2 font-medium text-right">Used</TableHead>
                <TableHead className="pb-2 font-medium text-right">Received</TableHead>
                <TableHead className="pb-2 font-medium text-right">Net Change</TableHead>
                <TableHead className="pb-2 font-medium text-right">Transactions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-700">
              {data.trends.map(trend => (
                <TableRow key={trend.period}>
                  <TableCell className="py-2 text-gray-900 dark:text-gray-100">{trend.period}</TableCell>
                  <TableCell className="py-2 text-right text-destructive">-{trend.totalUsed}</TableCell>
                  <TableCell className="py-2 text-right text-foreground">+{trend.totalReceived}</TableCell>
                  <TableCell className={`py-2 text-right font-medium ${trend.netChange >= 0 ? 'text-foreground' : 'text-destructive'
                    }`}>
                    {trend.netChange >= 0 ? '+' : ''}{trend.netChange}
                  </TableCell>
                  <TableCell className="py-2 text-right text-gray-500">{trend.transactionCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Total Inventory Value"
          value={`UGX ${data.totalInventoryValue.toLocaleString()}`}
          icon="tabler:currency-dollar"
          color="emerald"
        />
        <StatCard
          label="Average Item Cost"
          value={`UGX ${Math.round(data.averageItemCost).toLocaleString()}`}
          icon="tabler:chart-bar"
          color="blue"
        />
        <StatCard
          label="Highest Value Category"
          value={ITEM_CATEGORY_LABELS[data.highestValueCategory as keyof typeof ITEM_CATEGORY_LABELS] || data.highestValueCategory}
          icon="tabler:arrow-up"
          color="purple"
        />
        <StatCard
          label="Categories"
          value={data.byCategory.length.toString()}
          icon="tabler:category"
          color="orange"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Cost by Category */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Cost by Category</h3>
          <div className="space-y-3">
            {data.byCategory.map(cat => (
              <div key={cat.category}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    {ITEM_CATEGORY_LABELS[cat.category as keyof typeof ITEM_CATEGORY_LABELS] || cat.category}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    UGX {cat.totalValue.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${(cat.totalValue / maxCategoryValue) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-12 text-right">
                    {cat.percentageOfTotal.toFixed(1)}%
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {cat.itemCount} items • Avg: UGX {Math.round(cat.averageUnitCost).toLocaleString()}/unit
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Cost by Supplier */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Cost by Supplier</h3>
          <div className="space-y-2 max-h-80 overflow-auto">
            {data.bySupplier.map((supplier, idx) => (
              <div key={supplier.supplier_id || idx} className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-muted dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Store className="w-4 h-4 text-muted-foreground dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {supplier.supplier_name}
                    </p>
                    <p className="text-xs text-gray-500">{supplier.itemCount} items</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    UGX {supplier.totalValue.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">{supplier.percentageOfTotal.toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Details Table */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Category Details</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-200 dark:border-gray-700">
                <th className="pb-2 font-medium">Category</th>
                <th className="pb-2 font-medium text-right">Items</th>
                <th className="pb-2 font-medium text-right">Total Qty</th>
                <th className="pb-2 font-medium text-right">Total Value</th>
                <th className="pb-2 font-medium text-right">Avg Unit Cost</th>
                <th className="pb-2 font-medium text-right">% of Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {data.byCategory.map(cat => (
                <tr key={cat.category}>
                  <td className="py-2 font-medium text-gray-900 dark:text-gray-100">
                    {ITEM_CATEGORY_LABELS[cat.category as keyof typeof ITEM_CATEGORY_LABELS] || cat.category}
                  </td>
                  <td className="py-2 text-right text-gray-900 dark:text-gray-100">{cat.itemCount}</td>
                  <td className="py-2 text-right text-gray-900 dark:text-gray-100">{cat.totalQuantity}</td>
                  <td className="py-2 text-right font-medium text-foreground">
                    UGX {cat.totalValue.toLocaleString()}
                  </td>
                  <td className="py-2 text-right text-gray-900 dark:text-gray-100">
                    UGX {Math.round(cat.averageUnitCost).toLocaleString()}
                  </td>
                  <td className="py-2 text-right text-gray-500">{cat.percentageOfTotal.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ============ HELPER COMPONENTS ============

const StatCard: React.FC<{
  label: string;
  value: string;
  icon: string;
  color: 'purple' | 'emerald' | 'blue' | 'orange' | 'red';
}> = ({ label, value, icon, color }) => {
  const colorClasses = {
    purple: 'bg-primary/10 text-primary',
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    blue: 'bg-blue-500/10 text-muted-foreground dark:text-blue-400',
    orange: 'bg-orange-500/10 text-muted-foreground dark:text-orange-400',
    red: 'bg-destructive/10 text-destructive',
  };

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          {/* TODO: Convert icon prop to use HugeiconsIcon component */}
        </div>
      </div>
      <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
};

const LoadingState: React.FC = () => (
  <div className="flex items-center justify-center py-12">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="text-center py-12">
    <ChartBarOffIcon size={48} className="text-gray-300 mx-auto mb-3" />
    <p className="text-sm text-gray-500">{message}</p>
  </div>
);

export default InventoryReportsPanel;



