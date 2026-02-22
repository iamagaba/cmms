
import { Bot, Activity, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface AutomationHeroProps {
    enabled: boolean;
    onToggle: (enabled: boolean) => void;
    metrics?: {
        total_assignments: number;
        success_rate: number;
    };
}

export function AutomationHero({ enabled, onToggle, metrics }: AutomationHeroProps) {
    return (
        <Card className={cn(
            "relative overflow-hidden border shadow-sm transition-all duration-300 bg-white border-slate-200"
        )}>
            <CardContent className="p-4 sm:px-6 sm:py-4">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 overflow-hidden">
                        <div className={cn(
                            "h-10 w-10 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300",
                            enabled
                                ? "bg-teal-100 text-teal-600"
                                : "bg-slate-200 text-slate-400"
                        )}>
                            <Bot className="w-5 h-5" />
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 min-w-0">
                            <h2 className={cn(
                                "text-base font-semibold tracking-tight truncate",
                                enabled ? "text-teal-900" : "text-slate-700"
                            )}>
                                Auto-Assignment
                            </h2>

                            {enabled && metrics && (
                                <div className="flex items-center gap-3 text-xs text-muted-foreground hidden sm:flex">
                                    <div className="w-px h-3.5 bg-slate-300/50" />
                                    <div className="flex items-center gap-1.5" title="Success Rate">
                                        <Activity className="w-3.5 h-3.5 text-emerald-500" />
                                        <span>{metrics.success_rate.toFixed(1)}% Success</span>
                                    </div>
                                    <div className="flex items-center gap-1.5" title="Processed Count">
                                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                                        <span>{metrics.total_assignments} processed</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <span className={cn(
                            "text-sm font-medium transition-colors hidden sm:inline-block",
                            enabled ? "text-teal-700" : "text-slate-500"
                        )}>
                            {enabled ? "Active" : "Offline"}
                        </span>
                        <Switch
                            checked={enabled}
                            onCheckedChange={onToggle}
                            className="data-[state=checked]:bg-teal-600"
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
