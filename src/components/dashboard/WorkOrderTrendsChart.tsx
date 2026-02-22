import { useState, useRef, useEffect } from 'react';
// Charts restored - react-is version conflict resolved
import { BarChart } from '@mui/x-charts/BarChart';
import { Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Global style for MUI Charts tooltip
const tooltipStyles = `
  .MuiChartsTooltip-root,
  .MuiChartsTooltip-root *,
  .MuiChartsTooltip-table,
  .MuiChartsTooltip-table td,
  .MuiChartsTooltip-table th,
  .MuiPopper-root .MuiChartsTooltip-table,
  .MuiPopper-root .MuiChartsTooltip-table td,
  .MuiPopper-root .MuiChartsTooltip-table th {
    font-size: 12px !important;
  }
`;

// Status color configuration matching the application's status colors
const STATUS_COLORS = {
    'New': '#64748b',           // Slate (Passive state)
    'Confirmation': '#8b5cf6',   // Purple  
    'On Hold': '#f59e0b',        // Amber
    'Ready': '#06b6d4',          // Cyan
    'In Progress': '#f97316',    // Orange
    'Completed': '#0d9488',      // Teal (Brand Primary)
    'Cancelled': '#ef4444',      // Red
};

const STATUS_ORDER = ['New', 'Confirmation', 'Ready', 'In Progress', 'On Hold', 'Completed', 'Cancelled'];

export const WorkOrderTrendsChart = ({
    data,
    range = 7,
    onRangeChange
}: {
    data: any[],
    range?: 7 | 14 | 30,
    onRangeChange?: (days: 7 | 14 | 30) => void
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [chartWidth, setChartWidth] = useState(500);

    useEffect(() => {
        if (!containerRef.current) return;

        const updateWidth = () => {
            if (containerRef.current) {
                setChartWidth(containerRef.current.offsetWidth);
            }
        };

        const resizeObserver = new ResizeObserver(() => {
            updateWidth();
        });

        resizeObserver.observe(containerRef.current);
        updateWidth(); // Initial call

        return () => resizeObserver.disconnect();
    }, []);
    // Handle empty data
    if (!data || data.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-muted-foreground" />
                            <div>
                                <CardTitle className="text-base font-bold">Work Order Trends</CardTitle>
                                <CardDescription>Last {range} days</CardDescription>
                            </div>
                        </div>
                        {onRangeChange && (
                            <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
                                {[7, 14, 30].map((days) => (
                                    <Button
                                        key={days}
                                        variant={range === days ? "secondary" : "ghost"}
                                        size="sm"
                                        className={`h-7 text-xs px-2 ${range === days ? 'bg-background shadow-sm text-foreground font-semibold hover:bg-background' : 'text-muted-foreground hover:text-foreground hover:bg-background/50'}`}
                                        onClick={() => onRangeChange(days as 7 | 14 | 30)}
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
    data.forEach((dayData: any) => {
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
        <Card className="shadow-sm hover:shadow transition-all duration-300 border border-border/50">
            <style>{tooltipStyles}</style>
            <CardHeader className="pb-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-muted-foreground" />
                        <div>
                            <CardTitle className="text-base font-bold">Work Order Trends</CardTitle>
                            <CardDescription className="text-xs">Last {range} days</CardDescription>
                        </div>
                    </div>
                    {onRangeChange && (
                        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
                            {[7, 14, 30].map((days) => (
                                <Button
                                    key={days}
                                    variant={range === days ? "secondary" : "ghost"}
                                    size="sm"
                                    className={`h-7 text-xs px-2 ${range === days ? 'bg-background shadow-sm text-foreground font-semibold hover:bg-background' : 'text-muted-foreground hover:text-foreground hover:bg-background/50'}`}
                                    onClick={() => onRangeChange(days as 7 | 14 | 30)}
                                >
                                    {days}d
                                </Button>
                            ))}
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div ref={containerRef} className="h-[220px] w-full overflow-hidden">
                    <BarChart
                        dataset={data}
                        width={chartWidth}
                        height={220}
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
                                label: 'Work Orders',
                                labelStyle: {
                                    fontSize: 12,
                                    fill: `hsl(${mutedForeground})`,
                                },
                                tickLabelStyle: {
                                    fontSize: 10,
                                    fill: `hsl(${mutedForeground})`,
                                },
                            },
                        ]}
                        series={series}
                        margin={{ top: 40, right: 10, bottom: 30, left: 10 }}
                        grid={{ horizontal: true, vertical: false }}
                        borderRadius={0}
                        slotProps={{
                            legend: {
                                direction: 'row' as any,
                                position: { vertical: 'top', horizontal: 'start' },
                                padding: { left: 10, top: 0, right: 0, bottom: 0 },
                                itemMarkWidth: 12,
                                itemMarkHeight: 12,
                                markGap: 6,
                                itemGap: 16,
                                labelStyle: {
                                    fontSize: 12,
                                    fill: `hsl(${mutedForeground})`,
                                },
                            } as any,
                            popper: {
                                sx: {
                                    '& .MuiChartsTooltip-root': {
                                        fontSize: '11px !important',
                                    },
                                    '& .MuiChartsTooltip-table': {
                                        fontSize: '11px !important',
                                    },
                                    '& td': {
                                        fontSize: '11px !important',
                                    },
                                    '& th': {
                                        fontSize: '11px !important',
                                    },
                                }
                            } as any
                        }}
                        sx={{
                            '& .MuiBarElement-root': {
                                fillOpacity: 0.8,
                                filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))',
                                stroke: 'none',
                            },
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
                            '& .MuiChartsTooltip-root': {
                                fontSize: '11px !important',
                            },
                            '& .MuiChartsTooltip-table': {
                                fontSize: '11px !important',
                            },
                            '& .MuiChartsTooltip-cell': {
                                fontSize: '11px !important',
                            },
                            '& .MuiChartsTooltip-mark': {
                                fontSize: '11px !important',
                            },
                            '& .MuiChartsTooltip-labelCell': {
                                fontSize: '11px !important',
                            },
                            '& .MuiChartsTooltip-valueCell': {
                                fontSize: '11px !important',
                            },
                            '& .MuiChartsTooltip-paper': {
                                fontSize: '11px !important',
                            },
                            '& .MuiChartsTooltip-paper *': {
                                fontSize: '11px !important',
                            },
                        }}
                    />
                </div>
            </CardContent>
        </Card>
    );
};

