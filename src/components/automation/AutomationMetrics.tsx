
import { CheckCircle2, XCircle, TrendingUp, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface AutomationMetricsProps {
    metrics: {
        total_assignments: number;
        successful_assignments: number;
        failed_assignments: number;
        success_rate: number;
    };
}

export function AutomationMetrics({ metrics }: AutomationMetricsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className={cn(
                            "text-sm font-medium px-2.5 py-0.5 rounded-full",
                            metrics.success_rate >= 95 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                                metrics.success_rate >= 80 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                                    "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        )}>
                            {metrics.success_rate.toFixed(1)}% Rate
                        </span>
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-2xl font-bold tracking-tight">Success Rate</h3>
                        <p className="text-sm text-muted-foreground">Overall execution efficiency</p>
                    </div>
                    <Progress value={metrics.success_rate} className="h-1.5 mt-4 bg-emerald-100 dark:bg-emerald-900/20" indicatorClassName="bg-emerald-500" />
                </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                            <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">Total</span>
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-2xl font-bold tracking-tight">{metrics.successful_assignments}</h3>
                        <p className="text-sm text-muted-foreground">Successful assignments</p>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs font-medium text-blue-600 dark:text-blue-400">
                        <Activity className="w-3 h-3" />
                        <span> {metrics.total_assignments} total attempts</span>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        {metrics.failed_assignments > 0 && (
                            <span className="animate-pulse flex h-2.5 w-2.5 rounded-full bg-red-500" />
                        )}
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-2xl font-bold tracking-tight">{metrics.failed_assignments}</h3>
                        <p className="text-sm text-muted-foreground">Failed executions</p>
                    </div>
                    <div className="mt-4 text-xs text-muted-foreground">
                        Requires attention if persistent
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
