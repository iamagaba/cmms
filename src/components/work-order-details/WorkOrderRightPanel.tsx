import React, { useState } from 'react';
import { User, CheckCircle, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { WorkOrder, Technician, WorkOrderPart } from '@/types/supabase';
import { ActivityTimeline } from './ActivityTimeline';

interface WorkOrderRightPanelProps {
  workOrder: WorkOrder;
  technician?: Technician | null;
  allTechnicians?: Technician[];
  usedParts?: WorkOrderPart[];
  laborRate?: number;
  onAssignTechnician?: (techId: string) => void;
  profileMap?: Map<string, string>;
}

export const WorkOrderRightPanel: React.FC<WorkOrderRightPanelProps> = ({
  workOrder,
  technician,
  allTechnicians = [],
  usedParts = [],
  laborRate = 50,
  onAssignTechnician,
  profileMap = new Map(),
}) => {
  const [isAssigning, setIsAssigning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter technicians
  const filteredTechnicians = allTechnicians.filter(tech => {
    const term = searchQuery.toLowerCase();
    const name = (tech.full_name || tech.name || '').toLowerCase();
    return name.includes(term);
  });

  const handleAssign = (techId: string) => {
    if (onAssignTechnician) {
      onAssignTechnician(techId);
      setIsAssigning(false);
      setSearchQuery('');
    }
  };
  // Calculate costs
  const partsCost = usedParts.reduce((sum, part) => {
    const p = part as any;
    const item = p.inventory_items || p.inventoryItems || p.inventory_item || p.inventoryItem;
    const price = p.price_at_time_of_use || p.priceAtTimeOfUse || item?.unit_price || item?.unitPrice || 0;
    const qty = p.quantity_used ?? p.quantityUsed ?? 0;
    return sum + (price * qty);
  }, 0);

  const estimatedHours = workOrder.estimatedHours || 0;
  const laborCost = estimatedHours * laborRate;

  // Calculate actual labor if work has started
  let actualLaborHours = 0;
  if (workOrder.work_started_at) {
    const startTime = new Date(workOrder.work_started_at).getTime();
    const endTime = workOrder.completedAt ? new Date(workOrder.completedAt).getTime() : Date.now();
    const pausedSeconds = workOrder.total_paused_duration_seconds || 0;
    actualLaborHours = ((endTime - startTime) / 1000 - pausedSeconds) / 3600;
  }
  const actualLaborCost = actualLaborHours * laborRate;

  const totalCost = partsCost + (actualLaborHours > 0 ? actualLaborCost : laborCost);
  const formatCurrency = (amount: number) => `UGX ${amount.toLocaleString()}`;

  // Get technician initials
  const getTechnicianInitials = (name?: string) => {
    if (!name) return 'UN';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Determine technician status (mock for now - you can enhance this with real data)
  const technicianStatus = technician ? 'Clocked In' : null;

  return (
    <div className="w-80 border-l border-border bg-background h-screen overflow-y-auto flex-shrink-0">
      <div className="p-6 flex flex-col gap-6">
        {/* Technician Assignment Card */}
        <div className="pb-6 border-b border-border">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 text-left">
            Technician
          </h3>

          {/* Inline Assignment UI */}
          {isAssigning ? (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search technicians..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 h-9 text-xs"
                    autoFocus
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setIsAssigning(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="bg-muted/30 rounded-md border border-border overflow-hidden">
                <div className="max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/20">
                  {filteredTechnicians.length === 0 ? (
                    <div className="p-3 text-center text-xs text-muted-foreground">
                      No technicians found
                    </div>
                  ) : (
                    <div className="divide-y divide-border/50">
                      {filteredTechnicians.map((tech) => (
                        <button
                          key={tech.id}
                          className="w-full text-left p-2 hover:bg-muted/50 transition-colors flex items-center gap-3"
                          onClick={() => handleAssign(tech.id)}
                        >
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={tech.avatar_url || undefined} />
                            <AvatarFallback className="bg-slate-100 text-slate-600 text-[10px]">
                              {getTechnicianInitials(tech.full_name || tech.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground truncate">
                              {tech.full_name || tech.name}
                            </p>
                            {/* You could add status/location here if available */}
                          </div>
                          {technician?.id === tech.id && (
                            <CheckCircle className="w-3 h-3 text-teal-600" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : !technician ? (
            // State 1: Unassigned
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                  <User className="w-6 h-6 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-xs text-muted-foreground">
                    No technician assigned
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-teal-700 bg-teal-100 hover:bg-teal-200 hover:text-teal-800 mt-3"
                onClick={() => setIsAssigning(true)}
              >
                Assign
              </Button>
            </div>
          ) : (
            // State 2: Assigned
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={technician.avatar_url || undefined} />
                  <AvatarFallback className="bg-teal-100 text-teal-700 font-semibold">
                    {getTechnicianInitials(technician.full_name || technician.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-xs text-foreground">
                    {technician.full_name || technician.name || 'Unknown Technician'}
                  </p>
                  {technicianStatus && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className={`w-2 h-2 rounded-full ${technicianStatus === 'Clocked In' ? 'bg-green-500' : 'bg-slate-400'}`} />
                      <span className="text-xs text-muted-foreground">{technicianStatus}</span>
                    </div>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-teal-700 bg-teal-100 hover:bg-teal-200 hover:text-teal-800 mt-3"
                onClick={() => setIsAssigning(true)}
              >
                Reassign
              </Button>
            </div>
          )}
        </div>

        {/* Financial Summary Card */}
        <div className="pb-6 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider text-left">
              Cost Estimate
            </h3>
            {workOrder.status === 'Completed' ? (
              <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                Approved
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                Quote Pending
              </span>
            )}
          </div>

          <div className="space-y-4">
            {/* Breakdown List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Parts ({usedParts.length} items)</span>
                <span className="font-medium text-foreground">{formatCurrency(partsCost)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  Labor ({actualLaborHours > 0 ? `${actualLaborHours.toFixed(1)}` : estimatedHours} hrs)
                </span>
                <span className="font-medium text-foreground">
                  {formatCurrency(actualLaborHours > 0 ? actualLaborCost : laborCost)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Tax / Fees</span>
                <span className="font-medium text-foreground">UGX 0</span>
              </div>
            </div>

            {/* Total Cost - Below Breakdown */}
            <div className="flex items-center justify-between py-2 border-t mt-1">
              <p className="text-xs font-semibold text-slate-900 uppercase tracking-tight">Total Cost</p>
              <p className="text-lg font-bold text-slate-900 tracking-tight">{formatCurrency(totalCost)}</p>
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        <ActivityTimeline workOrder={workOrder} profileMap={profileMap} />
      </div>
    </div>
  );
};

export default WorkOrderRightPanel;
