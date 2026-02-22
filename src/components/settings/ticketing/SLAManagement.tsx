
import React, { useState } from 'react';
import { useTicketSlaConfig, useTicketSettingsMutations } from '@/hooks/useTicketing';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { showSuccess, showError } from '@/utils/toast';
import { TicketSlaConfig } from '@/types/ticketing';
import { Save, X, Pencil } from 'lucide-react';

export default function SLAManagement() {
    const { data: slaConfigs, isLoading } = useTicketSlaConfig();

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">SLA Configuration</h3>
                <p className="text-sm text-muted-foreground">
                    Set response and resolution time targets for each ticket priority.
                </p>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Priority</TableHead>
                            <TableHead>Response Time (Hours)</TableHead>
                            <TableHead>Resolution Time (Hours)</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {slaConfigs?.map((config) => (
                            <SLAConfigRow key={config.id} config={config} />
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

function SLAConfigRow({ config }: { config: TicketSlaConfig }) {
    const [isEditing, setIsEditing] = useState(false);
    const [responseTime, setResponseTime] = useState(config.response_time_hours);
    const [resolutionTime, setResolutionTime] = useState(config.resolution_time_hours);
    const { updateSlaConfig } = useTicketSettingsMutations();

    const handleSave = async () => {
        try {
            await updateSlaConfig.mutateAsync({
                id: config.id,
                updates: {
                    response_time_hours: Number(responseTime),
                    resolution_time_hours: Number(resolutionTime),
                },
            });
            showSuccess(`SLA for ${config.priority} updated`);
            setIsEditing(false);
        } catch (error) {
            showError('Failed to update SLA');
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'bg-red-100 text-red-800 hover:bg-red-100';
            case 'high': return 'bg-orange-100 text-orange-800 hover:bg-orange-100';
            case 'medium': return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
            case 'low': return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <TableRow>
            <TableCell>
                <Badge variant="outline" className={`capitalize border-0 ${getPriorityColor(config.priority)}`}>
                    {config.priority}
                </Badge>
            </TableCell>
            <TableCell>
                {isEditing ? (
                    <Input
                        type="number"
                        value={responseTime}
                        onChange={(e) => setResponseTime(Number(e.target.value))}
                        className="w-24 h-8"
                        min={0}
                        step={0.5}
                    />
                ) : (
                    <span>{config.response_time_hours}h</span>
                )}
            </TableCell>
            <TableCell>
                {isEditing ? (
                    <Input
                        type="number"
                        value={resolutionTime}
                        onChange={(e) => setResolutionTime(Number(e.target.value))}
                        className="w-24 h-8"
                        min={0}
                        step={0.5}
                    />
                ) : (
                    <span>{config.resolution_time_hours}h</span>
                )}
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-2">
                    {isEditing ? (
                        <>
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleSave}>
                                <Save className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setIsEditing(false)}>
                                <X className="h-4 w-4 text-red-600" />
                            </Button>
                        </>
                    ) : (
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setIsEditing(true)}>
                            <Pencil className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    )}
                </div>
            </TableCell>
        </TableRow>
    );
}
