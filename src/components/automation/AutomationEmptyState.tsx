
import { Bot, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface AutomationEmptyStateProps {
    onCreateRule: () => void;
}

export function AutomationEmptyState({ onCreateRule }: AutomationEmptyStateProps) {
    return (
        <Card className="border-dashed border-2 bg-muted/20">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="bg-background p-4 rounded-full shadow-sm mb-6 relative">
                    <Bot className="w-12 h-12 text-muted-foreground/50" />
                    <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1.5 shadow-md">
                        <Plus className="w-4 h-4" />
                    </div>
                </div>

                <h3 className="text-xl font-semibold mb-2">No automation rules</h3>
                <p className="text-muted-foreground max-w-md mb-8">
                    Create rules to assign work orders, send notifications,
                    or update statuses based on triggers.
                </p>

                <div className="flex items-center gap-3">
                    <Button onClick={onCreateRule} size="lg" className="gap-2">
                        <Plus className="w-4 h-4" />
                        Create Rule
                    </Button>
                    <Button variant="outline" size="lg" className="gap-2 hidden">
                        <span>View Templates</span>
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
