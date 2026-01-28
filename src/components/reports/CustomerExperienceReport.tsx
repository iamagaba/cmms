import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Activity,
    Clock,
    Users,
    Repeat,
    ThumbsUp,
    AlertTriangle,
    CheckCircle,
    TrendingUp
} from 'lucide-react';
import { WorkOrder } from '@/types/supabase';
import dayjs from 'dayjs';
// Temporarily disabled MUI charts due to react-is version conflict
// import { BarChart } from '@mui/x-charts/BarChart';
// import { LineChart } from '@mui/x-charts/LineChart';
// import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart, LineChart, PieChart } from '@/components/ChartPlaceholder';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

// Chart colors (Muted Industrial)
const CHART_COLORS = {
    primary: '#475569', // Slate 600 - Industrial Steel
    success: '#059669', // Emerald 600 - Safety Green
    warning: '#d97706', // Amber 600 - Caution Amber
    danger: '#dc2626',  // Red 600 - Alert Red
    neutral: '#94a3b8', // Slate 400
    purple: '#7c3aed',  // Violet 600 - Deep Brand
};

interface CustomerExperienceReportProps {
    workOrders: WorkOrder[];
    startDate: string;
    endDate: string;
}

export const CustomerExperienceReport: React.FC<CustomerExperienceReportProps> = ({
    workOrders,
    startDate,
    endDate,
}) => {
    // ---------------------------------------------------------------------------
    // 1. KPI Calculations
    // ---------------------------------------------------------------------------
    const stats = useMemo(() => {
        const completedOrders = workOrders.filter(wo => wo.status?.toLowerCase() === 'completed');
        const totalCompleted = completedOrders.length;

        // --- A. Average Resolution Time ---
        // (completed_at - created_at) in hours
        let totalResolutionHours = 0;
        let validResolutionCount = 0;

        completedOrders.forEach(wo => {
            if (wo.completed_at && wo.created_at) {
                const diff = dayjs(wo.completed_at).diff(dayjs(wo.created_at), 'hour', true);
                if (diff >= 0) {
                    totalResolutionHours += diff;
                    validResolutionCount++;
                }
            }
        });

        const avgResolutionTimeHours = validResolutionCount > 0
            ? totalResolutionHours / validResolutionCount
            : 0;

        // Format nicely (e.g. 24.5h or 2d 1h)
        const avgResolutionLabel = avgResolutionTimeHours < 24
            ? `${avgResolutionTimeHours.toFixed(1)}h`
            : `${(avgResolutionTimeHours / 24).toFixed(1)}d`;


        // --- B. SLA Compliance Rate ---
        // Orders completed On or Before sla_due
        let slaCompliantCount = 0;
        let slaApplicableCount = 0;

        completedOrders.forEach(wo => {
            if (wo.sla_due) {
                slaApplicableCount++;
                const completedAt = dayjs(wo.completed_at || wo.updated_at); // Fallback if completed_at missing
                const dueAt = dayjs(wo.sla_due);
                // Compliant if completed <= due date
                if (completedAt.isBefore(dueAt) || completedAt.isSame(dueAt)) {
                    slaCompliantCount++;
                }
            }
        });

        const slaComplianceRate = slaApplicableCount > 0
            ? ((slaCompliantCount / slaApplicableCount) * 100).toFixed(1)
            : 'N/A';


        // --- C. Repeat Visit Rate (within 30 days) ---
        // Percentage of vehicles that had another completed work order within 30 days of a previous one.
        // This is a rough proxy for "fix it straight first time" or general reliability issues.
        // Note: This requires sorting all orders by vehicle and date.
        const ordersByVehicle: Record<string, WorkOrder[]> = {};
        workOrders.forEach(wo => {
            if (wo.vehicle_id && wo.status?.toLowerCase() === 'completed' && wo.completed_at) {
                if (!ordersByVehicle[wo.vehicle_id]) {
                    ordersByVehicle[wo.vehicle_id] = [];
                }
                ordersByVehicle[wo.vehicle_id].push(wo);
            }
        });

        let vehiclesWithRepeatVisits = 0;
        let totalVehiclesServiced = 0;

        Object.values(ordersByVehicle).forEach(vehicleOrders => {
            totalVehiclesServiced++;
            // Sort by completion date
            vehicleOrders.sort((a, b) => dayjs(a.completed_at).diff(dayjs(b.completed_at)));

            let hasRepeat = false;
            for (let i = 0; i < vehicleOrders.length - 1; i++) {
                const current = vehicleOrders[i];
                const next = vehicleOrders[i + 1];
                const diffDays = dayjs(next.completed_at).diff(dayjs(current.completed_at), 'day');

                if (diffDays <= 30) {
                    hasRepeat = true;
                    break;
                }
            }
            if (hasRepeat) vehiclesWithRepeatVisits++;
        });

        const repeatVisitRate = totalVehiclesServiced > 0
            ? ((vehiclesWithRepeatVisits / totalVehiclesServiced) * 100).toFixed(1)
            : '0.0';


        // --- D. Unique Customers Served ---
        const uniqueCustomers = new Set(workOrders.map(wo => wo.customer_id).filter(Boolean)).size;

        return {
            avgResolutionLabel,
            slaComplianceRate,
            repeatVisitRate,
            uniqueCustomers,
            validResolutionCount, // for context
            slaApplicableCount
        };
    }, [workOrders]);


    // ---------------------------------------------------------------------------
    // 2. Chart Data Preparation
    // ---------------------------------------------------------------------------

    // A. Resolution Time Trend (Daily/Weekly average)
    // Group completed orders by date, calculate avg resolution time per day
    const resolutionTrendData = useMemo(() => {
        const grouped: Record<string, { totalHours: number; count: number }> = {};

        workOrders.forEach(wo => {
            if (wo.status?.toLowerCase() === 'completed' && wo.completed_at && wo.created_at) {
                const dateKey = dayjs(wo.completed_at).format('MMM DD');
                const diff = dayjs(wo.completed_at).diff(dayjs(wo.created_at), 'hour', true);
                // Filter outliers > 30 days (720 hours) to keep chart readable? 
                // For now, let's keep all valid positive durations.
                if (diff >= 0) {
                    if (!grouped[dateKey]) grouped[dateKey] = { totalHours: 0, count: 0 };
                    grouped[dateKey].totalHours += diff;
                    grouped[dateKey].count++;
                }
            }
        });

        return Object.entries(grouped)
            .map(([date, data]) => ({
                date,
                avgHours: parseFloat((data.totalHours / data.count).toFixed(1))
            }))
            .sort((a, b) => dayjs(a.date, 'MMM DD').diff(dayjs(b.date, 'MMM DD'))) // Simple sort, assumes same year
            .slice(-14); // Last 14 days with data
    }, [workOrders]);


    // B. SLA High-Risk Categories
    // Which service types breach SLA most often?
    const slaBreachByServiceData = useMemo(() => {
        const breachesByService: Record<string, number> = {};

        workOrders.forEach(wo => {
            if (wo.status?.toLowerCase() === 'completed' && wo.sla_due && wo.completed_at) {
                const completedAt = dayjs(wo.completed_at);
                const dueAt = dayjs(wo.sla_due);
                if (completedAt.isAfter(dueAt)) {
                    const service = wo.service_type || 'Unspecified'; // Assuming field is service_type or service
                    // The type def says `service`: string | null, and existing code used `service` or `service_type` (need to check type again).
                    // Type definition says `service`. Existing code in Reports.tsx used `service_type` (line 597: `wo.service_type || 'Unknown'`). 
                    // I should verify if `service_type` exists on `WorkOrder` or if it was mapped/extended. 
                    // `supabase.ts` shows `service?: string`. I will use `service`.
                    // Actually `supabase.ts` line 104 `service?: string | null`. 
                    // But `Reports.tsx` line 597 uses `wo.service_type`. 
                    // Let's assume `service` for now based on strict type, or check if existing code casts it.
                    const s = (wo as any).service_type || wo.service || 'General';
                    breachesByService[s] = (breachesByService[s] || 0) + 1;
                }
            }
        });

        // Top 5 breach categories
        return Object.entries(breachesByService)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([name, value]) => ({ name, value }));
    }, [workOrders]);


    // C. Top Customers (by Completed Orders)
    const topCustomersData = useMemo(() => {
        const customerCounts: Record<string, { name: string, count: number, ownershipType: string }> = {};
        workOrders.forEach(wo => {
            // Check for customer_id and either customer_name or the relation customer.name
            if (wo.customer_id) {
                const name = wo.customer_name || (wo.customer as any)?.name || 'Unknown Customer';

                // Determine Ownership Type
                // logic: vehicle.is_company_asset -> 'Company'
                // else customer.customer_type -> e.g. 'WATU', 'B2B'
                // else 'Private'
                let ownershipType = 'Private';
                const vehicle = wo.vehicle as any;
                const customer = wo.customer as any;

                if (vehicle?.is_company_asset) {
                    ownershipType = 'Company';
                } else if (customer?.customer_type) {
                    ownershipType = customer.customer_type;
                }

                if (!customerCounts[wo.customer_id]) {
                    customerCounts[wo.customer_id] = { name, count: 0, ownershipType };
                }
                customerCounts[wo.customer_id].count++;
            }
        });

        return Object.values(customerCounts)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }, [workOrders]);


    return (
        <div className="space-y-4">
            {/* Key Metrics Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <Card>
                    <CardContent className="pt-3 pb-3">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Avg Resolution Time</span>
                            <div className="p-1 bg-slate-100 rounded">
                                <Clock className="w-4 h-4 text-slate-600" />
                            </div>
                        </div>
                        <div className="text-xl font-bold">{stats.avgResolutionLabel}</div>
                        <div className="text-xs text-muted-foreground">
                            Based on {stats.validResolutionCount} completed orders
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-3 pb-3">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">SLA Compliance</span>
                            <div className="p-1 bg-emerald-50 rounded">
                                <CheckCircle className="w-4 h-4 text-emerald-700" />
                            </div>
                        </div>
                        <div className="text-xl font-bold">{stats.slaComplianceRate}%</div>
                        <div className="text-xs text-muted-foreground">
                            Target: 95%
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-3 pb-3">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Repeat Visit Rate</span>
                            <div className="p-1 bg-amber-50 rounded">
                                <Repeat className="w-4 h-4 text-amber-700" />
                            </div>
                        </div>
                        <div className="text-xl font-bold">{stats.repeatVisitRate}%</div>
                        <div className="text-xs text-muted-foreground">
                            Returns within 30 days
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-3 pb-3">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Unique Customers</span>
                            <div className="p-1 bg-indigo-50 rounded">
                                <Users className="w-4 h-4 text-indigo-700" />
                            </div>
                        </div>
                        <div className="text-xl font-bold">{stats.uniqueCustomers}</div>
                        <div className="text-xs text-muted-foreground">
                            Served in period
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* Resolution Time Trend */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-1.5 text-slate-800">
                            <TrendingUp className="w-4 h-4 text-slate-500" />
                            Avg Resolution Time Trend (Hours)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {resolutionTrendData.length > 0 ? (
                            <div className="h-[220px] w-full">
                                <LineChart
                                    dataset={resolutionTrendData}
                                    xAxis={[{
                                        scaleType: 'point',
                                        dataKey: 'date',
                                        tickLabelStyle: { fontSize: 10, fill: '#6b7280' }
                                    }]}
                                    series={[{
                                        dataKey: 'avgHours',
                                        label: 'Hours',
                                        color: CHART_COLORS.primary,
                                        area: true,
                                        showMark: true,
                                    }]}
                                    margin={{ top: 10, right: 10, bottom: 30, left: 30 }}
                                    grid={{ horizontal: true, vertical: false }}
                                    slotProps={{
                                        legend: { hidden: true }
                                    }}
                                    sx={{
                                        '& .MuiChartsGrid-line': { stroke: '#e5e7eb', strokeDasharray: '3 3' },
                                        '& .MuiChartsAxis-line': { display: 'none' },
                                        '& .MuiChartsAxis-tick': { display: 'none' },
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="h-[220px] flex items-center justify-center text-xs text-muted-foreground">
                                No sufficient data for trend
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Top SLA Breaches */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-1.5 text-slate-800">
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                            SLA Breaches by Service Type
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {slaBreachByServiceData.length > 0 ? (
                            <div className="h-[220px] w-full">
                                <BarChart
                                    dataset={slaBreachByServiceData}
                                    layout="horizontal"
                                    yAxis={[{
                                        scaleType: 'band',
                                        dataKey: 'name',
                                        tickLabelStyle: { fontSize: 10, fill: '#6b7280' }
                                    }]}
                                    series={[{
                                        dataKey: 'value',
                                        label: 'Breaches',
                                        color: CHART_COLORS.danger
                                    }]}
                                    margin={{ top: 10, right: 10, bottom: 20, left: 80 }}
                                    grid={{ vertical: true, horizontal: false }}
                                    borderRadius={4}
                                    slotProps={{
                                        legend: { hidden: true }
                                    }}
                                    sx={{
                                        '& .MuiChartsGrid-line': { stroke: '#e5e7eb', strokeDasharray: '3 3' },
                                        '& .MuiChartsAxis-line': { display: 'none' },
                                        '& .MuiChartsAxis-tick': { display: 'none' },
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="h-[220px] flex flex-col items-center justify-center text-muted-foreground gap-2">
                                <div className="p-3 bg-muted rounded-full">
                                    <CheckCircle className="w-6 h-6 text-muted-foreground/50" />
                                </div>
                                <span className="text-xs">No SLA breaches recorded</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Top Loyalty / At Risk Table */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-1.5 text-slate-800">
                        <Users className="w-4 h-4 text-slate-500" />
                        Top Customers (Most Work Orders)
                    </CardTitle>
                    <CardDescription className="text-xs">
                        Customers with highest service volume in this period
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50 border-b border-slate-200">
                                    <TableHead className="text-left py-2 px-3 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Customer Name</TableHead>
                                    <TableHead className="text-center py-2 px-3 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Total Orders</TableHead>
                                    <TableHead className="text-center py-2 px-3 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Ownership Type</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-border">
                                {topCustomersData.map((cust, i) => (
                                    <TableRow key={i} className="hover:bg-slate-50 transition-colors border-slate-100">
                                        <TableCell className="py-2 px-3 font-medium">{cust.name}</TableCell>
                                        <TableCell className="py-2 px-3 text-center font-semibold">{cust.count}</TableCell>
                                        <TableCell className="py-2 px-3 text-center text-muted-foreground">
                                            {cust.ownershipType}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {topCustomersData.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-8 text-xs text-muted-foreground">
                                            No customer data available
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default CustomerExperienceReport;
