
import { PieChart } from '@mui/x-charts/PieChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck } from 'lucide-react';
import { useMemo } from 'react';
import { Vehicle } from '@/types/supabase';

// Status Colors matching the application's vehicle status colors
const STATUS_COLORS = {
    'Normal': '#10b981',        // Emerald-500
    'In Repair': '#f97316',     // Orange-500
    'Decommissioned': '#64748b', // Slate-500
};

const STATUS_ORDER = ['Normal', 'In Repair', 'Decommissioned'];

interface VehicleStatusChartProps {
    vehicles: Vehicle[];
}

export const VehicleStatusChart = ({ vehicles }: VehicleStatusChartProps) => {

    // Aggregate vehicles by status
    const data = useMemo(() => {
        if (!vehicles || vehicles.length === 0) return [];

        const counts = {
            'Normal': 0,
            'In Repair': 0,
            'Decommissioned': 0
        };

        vehicles.forEach(vehicle => {
            const status = vehicle.status || 'Normal';
            if (status in counts) {
                counts[status as keyof typeof counts]++;
            }
        });

        // Format for PieChart
        return STATUS_ORDER
            .map((status, index) => ({
                id: index,
                value: counts[status as keyof typeof counts],
                label: status,
                color: STATUS_COLORS[status as keyof typeof STATUS_COLORS]
            }))
            .filter(item => item.value > 0);
    }, [vehicles]);

    const totalVehicles = useMemo(() => {
        return vehicles.length;
    }, [vehicles]);

    // Handle empty state
    if (data.length === 0) {
        return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-muted-foreground" />
                    <div>
                        <CardTitle className="text-base font-bold">Asset Status</CardTitle>
                        <CardDescription className="text-xs">Distribution by status</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[200px] w-full flex items-center justify-center text-muted-foreground text-sm bg-muted/50 rounded-xl border border-dashed">
                    No assets registered
                </div>
            </CardContent>
        </Card>
        );
    }

    return (
        <Card className="shadow-sm hover:shadow transition-all duration-300 border border-border/50">
            <CardHeader className="pb-0">
                <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-muted-foreground" />
                    <div>
                        <CardTitle className="text-base font-bold">Asset Status</CardTitle>
                        <CardDescription className="text-xs">Distribution of asset statuses</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="relative pr-6">
                <div className="h-[220px] w-full relative">
                    <div className="absolute inset-0 flex items-center justify-start pr-4">
                        {/* Chart Container */}
                        <div className="relative w-[180px] h-full flex items-center justify-center">
                            {/* Centered Total Label */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                                <span className="text-2xl font-bold text-foreground">{totalVehicles}</span>
                                <span className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground">Assets</span>
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
                        <div className="flex-1 flex items-center pl-6 pr-12">
                            <div className="flex flex-col gap-2 w-full max-w-[160px]">
                                {data.map((item) => (
                                    <div key={item.id} className="flex items-center gap-2">
                                        <div
                                            className="w-2 h-2 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: item.color }}
                                        />
                                        <div className="flex flex-col min-w-0 flex-1">
                                            <span className="text-xs font-medium text-foreground">
                                                {item.label}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground">
                                                {item.value} ({Math.round((item.value / totalVehicles) * 100)}%)
                                            </span>
                                        </div>
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
