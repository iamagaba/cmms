
import {
    MoreVertical,
    Edit2,
    Trash2,
    Power,
    PowerOff,
    Zap,
    Calendar,
    Filter,
    Play
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AutomationRule } from "@/types/automation";
import { cn } from "@/lib/utils";

interface AutomationRuleListProps {
    rules: AutomationRule[];
    onEdit: (rule: AutomationRule) => void;
    onDelete: (ruleId: string) => void;
    onToggle: (rule: AutomationRule) => void;
}

export function AutomationRuleList({ rules, onEdit, onDelete, onToggle }: AutomationRuleListProps) {

    const getPriorityInfo = (priority: number) => {
        if (priority >= 75) return { label: 'High', className: 'text-orange-600 bg-orange-50 border-orange-200' };
        if (priority >= 50) return { label: 'Medium', className: 'text-blue-600 bg-blue-50 border-blue-200' };
        return { label: 'Low', className: 'text-slate-600 bg-slate-100 border-slate-200' };
    };

    return (
        <div className="space-y-3">
            {rules.map((rule) => {
                const priorityInfo = getPriorityInfo(rule.priority);
                const isScheduled = !!rule.schedule_cron;
                const actionCount = rule.actions?.length || 0;
                const conditionCount = rule.trigger_conditions?.conditions?.length || 0;

                return (
                    <div
                        key={rule.id}
                        className={cn(
                            "group flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-xl bg-white hover:border-slate-300 hover:shadow-sm transition-all duration-200",
                            !rule.is_active && "opacity-75 bg-slate-50/50"
                        )}
                    >
                        <div className="flex items-start gap-4 mb-4 sm:mb-0 w-full">
                            {/* Icon Box */}
                            <div className={cn(
                                "mt-0.5 h-10 w-10 rounded-lg flex items-center justify-center shrink-0 border shadow-sm",
                                rule.is_active
                                    ? "bg-white border-slate-100 text-teal-600"
                                    : "bg-slate-100 border-transparent text-slate-400"
                            )}>
                                {isScheduled ? <Calendar className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                            </div>

                            <div className="space-y-1 flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className={cn(
                                        "font-semibold text-sm sm:text-base truncate",
                                        rule.is_active ? "text-slate-900" : "text-slate-500"
                                    )}>
                                        {rule.name}
                                    </h3>

                                    {!rule.is_active && (
                                        <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-slate-100 text-slate-500 border-slate-200">
                                            Paused
                                        </Badge>
                                    )}
                                </div>

                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1.5" title="Trigger Type">
                                        <Zap className="w-3 h-3 text-amber-500" />
                                        <span className="truncate max-w-[120px]">
                                            {rule.trigger_conditions?.trigger?.replace(/_/g, ' ') || 'Event Trigger'}
                                        </span>
                                    </div>

                                    <div className="h-3 w-px bg-slate-200" />

                                    <div className="flex items-center gap-1.5" title="Conditions">
                                        <Filter className="w-3 h-3 text-blue-500" />
                                        <span>{conditionCount} condition{conditionCount !== 1 ? 's' : ''}</span>
                                    </div>

                                    <div className="h-3 w-px bg-slate-200" />

                                    <div className="flex items-center gap-1.5" title="Actions">
                                        <Play className="w-3 h-3 text-emerald-500" />
                                        <span>{actionCount} action{actionCount !== 1 ? 's' : ''}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions & Meta */}
                        <div className="flex items-center gap-3 self-end sm:self-center pl-14 sm:pl-0 w-full sm:w-auto justify-between sm:justify-end">
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className={cn("text-[10px] h-5 px-2 font-medium border", priorityInfo.className)}>
                                    {priorityInfo.label}
                                </Badge>
                            </div>

                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="hidden sm:flex h-8 px-2 text-slate-500 hover:text-teal-600 hover:bg-teal-50"
                                    onClick={() => onEdit(rule)}
                                >
                                    Edit
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700">
                                            <MoreVertical className="w-4 h-4" />
                                            <span className="sr-only">Menu</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-40">
                                        <DropdownMenuItem onClick={() => onEdit(rule)}>
                                            <Edit2 className="w-4 h-4 mr-2" />
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onToggle(rule)}>
                                            {rule.is_active ? (
                                                <>
                                                    <PowerOff className="w-4 h-4 mr-2" />
                                                    Pause
                                                </>
                                            ) : (
                                                <>
                                                    <Power className="w-4 h-4 mr-2" />
                                                    Activate
                                                </>
                                            )}
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={() => onDelete(rule.id)}
                                            className="text-destructive focus:text-destructive"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
