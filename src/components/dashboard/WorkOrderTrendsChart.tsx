
import { BarChart } from '@mui/x-charts/BarChart';
import { Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Status color configuration matching the application's status colors
const STATUS_COLORS = {
  'Open': '#3b82f6',           // Blue
  'Confirmation': '#8b5cf6',   // Purple  
  'On Hold': '#f59e0b',        // Amber
  'Ready': '#06b6d4',          // Cyan
  'In Progress': '#f97316',    // Orange
  'Completed': '#10b981',      // Emerald
  'Cancelled': '#ef4444',      // Red
};

const STATUS_ORDER = ['Open', 'Confirmation', 'Ready', 'In Progress', 'On Hold', 'Completed', 'Cancelled'];

export const WorkOrderTrendsChart = ({
    data,
    range = 7,
    onRangeChange
}: {
    data: any[],
    range?: 7 | 14,
    onRangeChange?: (days: 7 | 14) => void
}) => {
    // Handle empty data
    if (!data || data.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-muted-foreground" />
                            <div>
                                <CardTitle>Work Order Trends</CardTitle>
                                <CardDescription>Last {range} days</CardDescription>
                            </div>
                        </div>
                        {onRangeChange && (
                            <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
                                {[7, 14].map((days) => (
                                    <Button
                                        key={days}
                                        variant={range === days ? "secondary" : "ghost"}
                                        size="sm"
                                        className={`h-7 text-xs px-2 ${range === days ? 'bg-background shadow-sm' : 'hover:bg-background/50'}`}
                                        onClick={() => onRangeChange(days as 7 | 14)}
                                    >
                                        {days}d
                                    </Button>
                                ))}
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="h-[180px] w-full flex items-center justify-center text-muted-foreground text-sm">
                        No data available
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Get CSS variable values for theming
    const borderColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--border')
        .trim();
    const mutedForeground = getComputedStyle(document.documentElement)
        .getPropertyValue('--muted-foreground')
        .trim();

    // Determine which statuses have data in the current period
    const statusesWithData = new Set<string>();
    data.forEach(dayData => {
        STATUS_ORDER.forEach(status => {
            const dataKey = status.toLowerCase().replace(' ', '_');
            if (dayData[dataKey] && dayData[dataKey] > 0) {
                statusesWithData.add(status);
            }
        });
    });

    // Create series only for statuses that have data
    const series = STATUS_ORDER
        .filter(status => statusesWithData.has(status))
        .map(status => ({
            dataKey: status.toLowerCase().replace(' ', '_'),
            label: status,
            color: STATUS_COLORS[status as keyof typeof STATUS_COLORS],
            stack: 'status'
        }));

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-muted-foreground" />
                        <div>
                            <CardTitle className="text-lg">Work Order Trends</CardTitle>
                            <CardDescription>Last {range} days</CardDescription>
                        </div>
                    </div>
                    {onRangeChange && (
                        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
                            {[7, 14].map((days) => (
                                <Button
                                    key={days}
                                    variant={range === days ? "secondary" : "ghost"}
                                    size="sm"
                                    className={`h-7 text-xs px-2 ${range === days ? 'bg-background shadow-sm' : 'hover:bg-background/50'}`}
                                    onClick={() => onRangeChange(days as 7 | 14)}
                                >
                                    {days}d
                                </Button>
                            ))}
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[200px] w-full">
                    <BarChart
                        dataset={data}
                        xAxis={[
                            {
                                scaleType: 'band',
                                dataKey: 'date',
                                tickLabelStyle: {
                                    fontSize: 10,
                                    fill: `hsl(${mutedForeground})`,
                                },
                            },
                        ]}
                        yAxis={[
                            {
                                // Hide Y-axis labels but keep the scale
                                tickLabelStyle: {
                                    display: 'none',
                                },
                            },
                        ]}
                        series={series}
                        margin={{ top: 40, right: 10, bottom: 30, left: 10 }}
                        grid={{ horizontal: true, vertical: false }}
                        borderRadius={4}
                        legend={{
                            direction: 'row',
                            position: { vertical: 'top', horizontal: 'left' },
                            padding: 0,
                            itemMarkWidth: 12,
                            itemMarkHeight: 12,
                            markGap: 6,
                            itemGap: 16,
                            labelStyle: {
                                fontSize: 12,
                                fill: `hsl(${mutedForeground})`,
                            },
                        }}
                        sx={{
                            '& .MuiChartsGrid-line': {
                                stroke: `hsl(${borderColor})`,
                                strokeDasharray: '3 3',
                            },
                            '& .MuiChartsAxis-line': {
                                display: 'none',
                            },
                            '& .MuiChartsAxis-tick': {
                                display: 'none',
                            },
                            // Hide Y-axis labels
                            '& .MuiChartsAxis-left .MuiChartsAxis-tickLabel': {
                                display: 'none',
                            },
                        }}
                    />
                </div>
            </CardContent>
        </Card>
    );
};

