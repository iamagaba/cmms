
import { PieChart } from '@mui/x-charts/PieChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { useMemo } from 'react';
import { WorkOrder } from '@/types/supabase';

// Priority Colors matching the work order creation form
const PRIORITY_COLORS = {
    'Urgent': '#ef4444',   // Red (matches form)
    'High': '#f97316',     // Orange (matches form)
    'Medium': '#14b8a6',   // Teal (matches form)
    'Low': '#64748b',      // Slate (matches form)
};

const PRIORITY_ORDER = ['Urgent', 'High', 'Medium', 'Low'];

interface WorkOrderPriorityChartProps {
    workOrders: WorkOrder[];
}

export const WorkOrderPriorityChart = ({ workOrders }: WorkOrderPriorityChartProps) => {

    // Aggregate work orders by priority
    const data = useMemo(() => {
        if (!workOrders || workOrders.length === 0) return [];

        const counts = {
            'Urgent': 0,
            'High': 0,
            'Medium': 0,
            'Low': 0
        };

        let total = 0;

        workOrders.forEach(wo => {
            let priority = wo.priority || 'Medium'; // Default to Medium if null

            // Normalize priority to title case for matching
            priority = priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();

            if (priority in counts) {
                counts[priority as keyof typeof counts]++;
                total++;
            }
        });

        // Format for PieChart
        return PRIORITY_ORDER
            .filter(priority => counts[priority as keyof typeof counts] > 0)
            .map((priority, index) => ({
                id: index,
                value: counts[priority as keyof typeof counts],
                label: priority,
                color: PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS]
            }));
    }, [workOrders]);

    const totalWorkOrders = useMemo(() => {
        return workOrders.length;
    }, [workOrders]);

    // Handle empty state
    if (data.length === 0) {
        return (
            <Card className="h-full border-none shadow-none bg-transparent">
                <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-muted-foreground" />
                        <div>
                            <CardTitle className="text-base font-bold">Priority Breakdown</CardTitle>
                            <CardDescription className="text-xs">Active work orders</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="h-[200px] w-full flex items-center justify-center text-muted-foreground text-sm bg-muted/50 rounded-xl border border-dashed">
                        No active work orders
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="shadow-sm hover:shadow transition-all duration-300 border border-border/50">
            <CardHeader className="pb-0">
                <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-muted-foreground" />
                    <div>
                        <CardTitle className="text-base font-bold">Priority Breakdown</CardTitle>
                        <CardDescription className="text-xs">Distribution by priority level</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="relative">
                <div className="h-[220px] w-full relative">
                    <div className="absolute inset-0 flex items-center justify-start">
                        {/* Chart Container */}
                        <div className="relative w-[180px] h-full flex items-center justify-center">
                            {/* Centered Total Label */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                                <span className="text-2xl font-bold text-foreground">{totalWorkOrders}</span>
                                <span className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground">Total</span>
                            </div>

                            <PieChart
                                series={[
                                    {
                                        data: data,
                                        innerRadius: 50,
                                        outerRadius: 70,
                                        paddingAngle: 0,
                                        cornerRadius: 0,
                                        startAngle: -90,
                                        endAngle: 270,
                                    }
                                ]}
                                slotProps={{
                                    legend: {
                                        hidden: true,
                                    } as any
                                }}
                                sx={{
                                    '& .MuiChartsLegend-root': {
                                        display: 'none !important',
                                    },
                                }}
                                margin={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                width={180}
                                height={220}
                            />
                        </div>

                        {/* Custom Legend */}
                        <div className="flex-1 flex items-center justify-center pl-4">
                            <div className="flex flex-col gap-2">
                                {data.map((item) => (
                                    <div key={item.id} className="flex items-center gap-2">
                                        <div
                                            className="w-2 h-2 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: item.color }}
                                        />
                                        <span className="text-xs font-medium text-foreground">
                                            {item.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
