import { ArrowLeft, Bike, Check, ClipboardList, Clock, Home, Info, Loader2, Map as MapIcon, Pause, Tag, X } from 'lucide-react';
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';


import { supabase } from '@/integrations/supabase/client';
import { WorkOrder, Customer, Vehicle, Technician, Location, WorkOrderPart, EmergencyBikeAssignment } from '@/types/supabase';
import { getWorkOrderNumber } from '@/utils/work-order-display';
import { useWorkOrderData } from '@/hooks/useWorkOrderData';
import { snakeToCamelCase } from '@/utils/data-helpers';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

// Modular Components
import { WorkOrderOverviewCards } from '@/components/work-order-details/WorkOrderOverviewCards';
import { WorkOrderSidebar } from '@/components/work-order-details/WorkOrderSidebar';
import { WorkOrderCustomerVehicleCard } from '@/components/work-order-details/WorkOrderCustomerVehicleCard';
import { WorkOrderDetailsInfoCard } from '@/components/work-order-details/WorkOrderDetailsInfoCard';
import { WorkOrderServiceLifecycleCard } from '@/components/work-order-details/WorkOrderServiceLifecycleCard';
import { WorkOrderActivityLogCard } from '@/components/work-order-details/WorkOrderActivityLogCard';
import { TimelineContainer } from '@/components/timeline/TimelineContainer';
import { TimelineDemo } from '@/components/timeline/TimelineDemo';
import WorkOrderStepper from '@/components/WorkOrderStepper/WorkOrderStepper';
import { Skeleton } from '@/components/tailwind-components';
import { WorkOrderNotesCard } from '@/components/work-order-details/WorkOrderNotesCard';
import { WorkOrderCostSummaryCard } from '@/components/work-order-details/WorkOrderCostSummaryCard';
import { WorkOrderLocationMapCard } from '@/components/work-order-details/WorkOrderLocationMapCard';
import { WorkOrderRelatedHistoryCard } from '@/components/work-order-details/WorkOrderRelatedHistoryCard';

// Dialogs
import { AssignTechnicianModal } from '@/components/work-order-details/AssignTechnicianModal';
import { AssignEmergencyBikeModal } from '@/components/work-order-details/AssignEmergencyBikeModal';
import { ConfirmationCallDialog } from '@/components/work-order-details/ConfirmationCallDialog';
import { MaintenanceCompletionDrawer } from '@/components/MaintenanceCompletionDrawer';
import { WorkOrderPartsDialog } from '@/components/WorkOrderPartsDialog';
import { OnHoldReasonDialog } from '@/components/OnHoldReasonDialog';
import { IssueConfirmationDialog } from '@/components/IssueConfirmationDialog';

interface WorkOrderDetailsProps {
  isDrawerMode?: boolean;
  workOrderId?: string | null;
}

const WorkOrderDetailsEnhanced: React.FC<WorkOrderDetailsProps> = ({
  isDrawerMode = false,
  workOrderId
}) => {
  const { id: paramId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const id = isDrawerMode ? workOrderId : paramId;

  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isAssignEmergencyOpen, setIsAssignEmergencyOpen] = useState(false);
  const [isConfirmationCallDialogOpen, setIsConfirmationCallDialogOpen] = useState(false);
  const [isMaintenanceCompletionDrawerOpen, setIsMaintenanceCompletionDrawerOpen] = useState(false);
  const [isAddPartDialogOpen, setIsAddPartDialogOpen] = useState(false);
  const [isOnHoldDialogOpen, setIsOnHoldDialogOpen] = useState(false);
  const [isIssueConfirmationOpen, setIsIssueConfirmationOpen] = useState(false);
  const [showInteractiveMap, setShowInteractiveMap] = useState(false);

  // Fetch work order data with all relations
  const { data: workOrder, isLoading, error, refetch } = useQuery({
    queryKey: ['work_order', id],
    queryFn: async () => {
      if (!id) throw new Error('No work order ID provided');

      const { data, error } = await supabase
        .from('work_orders')
        .select(`
          *,
          customers (*),
          vehicles (*),
          technicians (*),
          locations (*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return snakeToCamelCase(data) as WorkOrder;
    },
    enabled: !!id,
  });

  // Fetch used parts
  const { data: usedParts = [] } = useQuery<WorkOrderPart[]>({
    queryKey: ['work_order_parts', id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from('work_order_parts')
        .select('*, inventory_items(*)')
        .eq('work_order_id', id);
      if (error) throw error;
      return (data || []).map(p => snakeToCamelCase(p)) as WorkOrderPart[];
    },
    enabled: !!id,
  });

  // Fetch emergency bike assignment
  const { data: emergencyAssignment } = useQuery<EmergencyBikeAssignment>({
    queryKey: ['emergency_bike_assignment', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('emergency_bike_assignments')
        .select('*')
        .eq('work_order_id', id)
        .is('returned_at', null)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data ? snakeToCamelCase(data) as EmergencyBikeAssignment : null;
    },
    enabled: !!id,
  });

  // Fetch emergency bike details
  const { data: emergencyBike } = useQuery<Vehicle>({
    queryKey: ['emergency_bike', emergencyAssignment?.emergencyBikeAssetId],
    queryFn: async () => {
      if (!emergencyAssignment?.emergencyBikeAssetId) return null;
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', emergencyAssignment.emergencyBikeAssetId)
        .single();
      if (error) throw error;
      return snakeToCamelCase(data) as Vehicle;
    },
    enabled: !!emergencyAssignment?.emergencyBikeAssetId,
  });

  // Get auxiliary data
  const {
    allWorkOrders,
    technicians,
    locations,
    customers,
    vehicles,
    profiles,
    serviceCategories
  } = useWorkOrderData();

  // Build profile map for activity log
  const profileMap = useMemo(() => {
    const map = new Map<string, string>();
    profiles?.forEach(p => {
      map.set(p.id, p.full_name || p.email || 'Unknown');
    });
    return map;
  }, [profiles]);

  // Extract related data
  const customer = workOrder?.customers as Customer | undefined;
  const vehicle = workOrder?.vehicles as Vehicle | undefined;
  const technician = workOrder?.technicians as Technician | undefined;
  const location = workOrder?.locations as Location | undefined;

  // Emergency Bike Logic & Stepper Helpers
  const computeElapsedActiveSeconds = () => {
    const startIso = workOrder?.workStartedAt || workOrder?.createdAt;
    if (!startIso) return 0;
    const paused = workOrder?.totalPausedDurationSeconds || 0;
    const elapsedMs = Date.now() - new Date(startIso as string).getTime();
    return Math.max(0, Math.floor(elapsedMs / 1000) - paused);
  };

  const elapsedSec = computeElapsedActiveSeconds();
  const sixHoursSec = 6 * 60 * 60;
  const hasActiveEmergencyAssignment = Boolean(emergencyAssignment);
  const emergencyEligible = workOrder?.status !== 'Completed' && !hasActiveEmergencyAssignment && elapsedSec >= sixHoursSec;
  const isLoadingEmergencyBike = false; // We fetch this in parent but don't strictly track its loading separately for the banner, assuming minimal delay.

  // Helper for displaying banner
  const renderEmergencyBikeBanner = () => {
    if (!emergencyEligible && !hasActiveEmergencyAssignment) return null;

    return (
      <div className={`px-4 py-2 flex items-center justify-between border-b ${hasActiveEmergencyAssignment ? 'bg-muted border-blue-200' : 'bg-muted border-orange-200'
        }`}>
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${hasActiveEmergencyAssignment ? 'bg-background' : 'bg-background'
            }`}>
            <Bike className={`w-5 h-5 ${hasActiveEmergencyAssignment ? 'text-blue-600' : 'text-orange-600'
              }`} />
          </div>
          <div>
            <p className={`text-sm font-bold ${hasActiveEmergencyAssignment ? 'text-blue-900' : 'text-orange-900'
              }`}>
              {hasActiveEmergencyAssignment
                ? `Emergency Bike: ${emergencyBike ? ((emergencyBike as any).licensePlate || emergencyBike.license_plate) : 'Loading...'}`
                : 'Customer Eligible for Emergency Bike'
              }
            </p>
            {hasActiveEmergencyAssignment && (
              <>
                {emergencyBike ? (
                  <>
                    <p className="text-xs text-muted-foreground">
                      {emergencyBike.make} {emergencyBike.model}
                    </p>
                    {emergencyAssignment?.assigned_at && (
                      <p className="text-xs text-muted-foreground">
                        Assigned {new Date(emergencyAssignment.assigned_at).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground italic">Bike details unavailable</p>
                )}
              </>
            )}
            {emergencyEligible && (
              <p className="text-xs text-muted-foreground">
                Repair time &gt; 6 hours.
              </p>
            )}
          </div>
        </div>

        {!hasActiveEmergencyAssignment ? (
          <Button
            size="sm"
            onClick={() => setIsAssignEmergencyOpen(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white border-none"
          >
            Assign Bike
          </Button>
        ) : (
          <Badge variant="info" className="uppercase tracking-wider">
            Active
          </Badge>
        )}
      </div>
    );
  };

  // Update work order mutation
  const updateWorkOrderMutation = useMutation({
    mutationFn: async (updates: Partial<WorkOrder>) => {
      if (!id) throw new Error('No work order ID');

      const { data, error } = await supabase
        .from('work_orders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work_order', id] });
      queryClient.invalidateQueries({ queryKey: ['work_orders'] });
      toast({
        title: 'Success',
        description: 'Work order updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Add activity log entry
  const addActivityLog = async (activity: string, userId?: string) => {
    if (!workOrder) return;

    const currentLog = workOrder.activityLog || [];
    const newEntry = {
      activity,
      timestamp: new Date().toISOString(),
      userId: userId || null,
    };

    await updateWorkOrderMutation.mutateAsync({
      activityLog: [...currentLog, newEntry],
    });
  };

  // Handle status updates
  const handleStatusUpdate = async (newStatus: string, additionalUpdates: Partial<WorkOrder> = {}) => {
    await updateWorkOrderMutation.mutateAsync({
      status: newStatus,
      ...additionalUpdates,
    });
    await addActivityLog(`Status changed to ${newStatus}`);
  };

  // Handle confirmation call
  const handleConfirmationCall = async (
    notes: string,
    outcome: 'confirmed' | 'cancelled' | 'unreachable',
    appointmentDate?: string
  ) => {
    const updates: Partial<WorkOrder> = {
      confirmationCallNotes: notes,
      confirmationCallAt: new Date().toISOString(),
    };

    if (outcome === 'confirmed') {
      updates.status = 'Ready';
      if (appointmentDate) {
        updates.appointmentDate = appointmentDate;
      }
      await handleStatusUpdate('Ready', updates);
    } else if (outcome === 'cancelled') {
      updates.status = 'Cancelled';
      await handleStatusUpdate('Cancelled', updates);
    } else {
      await updateWorkOrderMutation.mutateAsync(updates);
    }

    setIsConfirmationCallDialogOpen(false);
  };

  // Handle technician assignment
  const handleAssignTechnician = async (technicianId: string) => {
    await updateWorkOrderMutation.mutateAsync({
      assignedTechnicianId: technicianId,
      status: 'In Progress',
      workStartedAt: new Date().toISOString(),
    });
    await addActivityLog(`Technician assigned`);
    setIsAssignModalOpen(false);
  };

  // Handle emergency bike assignment
  const handleAssignEmergencyBike = async (bikeId: string, notes: string) => {
    if (!id) return;

    const { error } = await supabase.from('emergency_bike_assignments').insert({
      work_order_id: id,
      emergency_bike_asset_id: bikeId,
      assigned_at: new Date().toISOString(),
      notes,
    });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to assign emergency bike',
        variant: 'destructive',
      });
      return;
    }

    await addActivityLog(`Emergency bike assigned`);
    queryClient.invalidateQueries({ queryKey: ['emergency_bike_assignment', id] });
    setIsAssignEmergencyOpen(false);
  };

  // Handle work order completion
  const handleCompleteWorkOrder = async (data: any) => {
    await updateWorkOrderMutation.mutateAsync({
      status: 'Completed',
      completedAt: new Date().toISOString(),
      maintenanceNotes: data.maintenanceNotes,
      estimatedHours: data.estimatedHours,
    });
    await addActivityLog('Work order completed');
    setIsMaintenanceCompletionDrawerOpen(false);
  };

  // Handle on hold
  const handleOnHold = async (reason: string) => {
    await updateWorkOrderMutation.mutateAsync({
      status: 'On Hold',
      onHoldReason: reason,
    });
    await addActivityLog(`Work order put on hold: ${reason}`);
    setIsOnHoldDialogOpen(false);
  };

  // Handle add part
  const handleAddPart = async (itemId: string, quantity: number) => {
    if (!id) return;

    // Fetch item price
    const { data: item } = await supabase
      .from('inventory_items')
      .select('unit_price')
      .eq('id', itemId)
      .single();

    const { error } = await supabase.from('work_order_parts').insert({
      work_order_id: id,
      inventory_item_id: itemId,
      quantity_used: quantity,
      price_at_time_of_use: item?.unit_price || 0,
    });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to add part',
        variant: 'destructive',
      });
      return;
    }

    await addActivityLog(`Part added (qty: ${quantity})`);
    queryClient.invalidateQueries({ queryKey: ['work_order_parts', id] });
    setIsAddPartDialogOpen(false);
  };

  // Handle remove part
  const handleRemovePart = async (partId: string) => {
    const { error } = await supabase
      .from('work_order_parts')
      .delete()
      .eq('id', partId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove part',
        variant: 'destructive',
      });
      return;
    }

    await addActivityLog('Part removed');
    queryClient.invalidateQueries({ queryKey: ['work_order_parts', id] });
  };

  // Handle work order selection from sidebar
  const handleSelectWorkOrder = (workOrderId: string) => {
    navigate(`/work-orders/${workOrderId}`);
  };




  // Render status action buttons
  const renderStatusActions = () => {
    if (!workOrder) return null;

    const status = workOrder.status;

    return (
      <div className="flex items-center gap-2">
        {status === 'New' && (
          <Button
            size="sm"
            onClick={() => setIsConfirmationCallDialogOpen(true)}
            className="gap-1.5"
          >
            <Check className="w-5 h-5" />
            Confirm Call
          </Button>
        )}

        {status === 'Confirmation' && (
          <Button
            size="sm"
            onClick={() => setIsAssignModalOpen(true)}
            className="gap-1.5"
          >
            <Check className="w-5 h-5" />
            Mark Ready
          </Button>
        )}

        {status === 'Ready' && (
          <>
            <Button
              size="sm"
              onClick={() => setIsAssignModalOpen(true)}
              className="gap-1.5"
            >
              <Check className="w-5 h-5" />
              Assign Technician
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsAssignEmergencyOpen(true)}
              className="gap-1.5"
            >
              <Bike className="w-5 h-5" />
              Emergency Bike
            </Button>
          </>
        )}

        {status === 'In Progress' && (
          <>
            <Button
              size="sm"
              onClick={() => setIsMaintenanceCompletionDrawerOpen(true)}
              className="gap-1.5"
            >
              <Check className="w-5 h-5" />
              Complete
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsOnHoldDialogOpen(true)}
              className="gap-1.5"
            >
              <Pause className="w-5 h-5" />
              On Hold
            </Button>
          </>
        )}

        {status === 'On Hold' && (
          <Button
            size="sm"
            onClick={() => handleStatusUpdate('In Progress')}
            className="gap-1.5"
          >
            <Loader2 className="w-5 h-5" />
            Resume
          </Button>
        )}

        {(status === 'New' || status === 'Confirmation' || status === 'Ready') && (
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleStatusUpdate('Cancelled')}
            className="gap-1.5"
          >
            <X className="w-5 h-5" />
            Cancel
          </Button>
        )}
      </div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col h-screen bg-background">

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading work order...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !workOrder) {
    return (
      <div className="flex flex-col h-screen bg-background">

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-destructive text-lg font-semibold mb-2">Error Loading Work Order</div>
            <p className="text-muted-foreground mb-4">
              {(error as Error)?.message || 'Work order not found'}
            </p>
            <Button onClick={() => navigate('/work-orders')}>
              Back to Work Orders
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar - Desktop only */}
      {!isDrawerMode && (
        <WorkOrderSidebar
          currentWorkOrderId={id!}
          onSelectWorkOrder={handleSelectWorkOrder}
          className="hidden lg:block w-80 flex-shrink-0"
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">


        {/* Overview Cards */}
        <WorkOrderOverviewCards
          workOrder={workOrder}
          customer={customer || null}
          vehicle={vehicle || null}
          technician={technician || null}
          location={location || null}
        />

        {/* Work Order Stepper */}
        <div className="border-b border-border bg-card">
          <WorkOrderStepper
            workOrder={workOrder}
            profileMap={profileMap}
            onConfirmationClick={() => setIsConfirmationCallDialogOpen(true)}
            onReadyClick={() => setIsAssignModalOpen(true)}
            onInProgressClick={() => setIsMaintenanceCompletionDrawerOpen(true)}
          />
        </div>

        {/* Emergency Bike Banner */}
        {renderEmergencyBikeBanner()}

        {/* Tabs Content */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="flex border-b border-border px-4 bg-card">
              <TabsList className="h-auto p-0 bg-transparent border-b-0 space-x-6 rounded-none">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-primary data-[state=active]:text-primary border-b-2 border-transparent rounded-none px-2 py-3 text-xs font-medium gap-2"
                >
                  <Info className="w-5 h-5" />
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="details"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-primary data-[state=active]:text-primary border-b-2 border-transparent rounded-none px-2 py-3 text-xs font-medium gap-2"
                >
                  <ClipboardList className="w-5 h-5" />
                  Details
                </TabsTrigger>
                <TabsTrigger
                  value="parts"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-primary data-[state=active]:text-primary border-b-2 border-transparent rounded-none px-2 py-3 text-xs font-medium gap-2"
                >
                  <Tag className="w-5 h-5" />
                  Parts & Costs
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-primary data-[state=active]:text-primary border-b-2 border-transparent rounded-none px-2 py-3 text-xs font-medium gap-2"
                >
                  <Clock className="w-5 h-5" />
                  History
                </TabsTrigger>
                <TabsTrigger
                  value="location"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-primary data-[state=active]:text-primary border-b-2 border-transparent rounded-none px-2 py-3 text-xs font-medium gap-2"
                >
                  <MapIcon className="w-5 h-5" />
                  Location
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto">
              <TabsContent value="overview" className="p-4 space-y-4">
                <div className="space-y-4">
                  <WorkOrderDetailsInfoCard
                    workOrder={workOrder}
                    allLocations={locations}
                    serviceCategories={serviceCategories}
                    technicians={technicians}
                    onAssignClick={() => setIsAssignModalOpen(true)}
                    emergencyBike={emergencyBike || null}
                    emergencyAssignment={emergencyAssignment || null}
                  />
                </div>
              </TabsContent>

              <TabsContent value="details" className="p-4 space-y-4">
                {/* Enhanced Activity Timeline - Primary Feature */}
                <TimelineDemo 
                  workOrderId={id!}
                />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <WorkOrderActivityLogCard
                    workOrder={workOrder}
                    profileMap={profileMap}
                  />
                  <WorkOrderNotesCard
                    workOrder={workOrder}
                    profileMap={profileMap}
                  />
                </div>
              </TabsContent>

              <TabsContent value="parts" className="p-4 space-y-4">
                <WorkOrderCostSummaryCard
                  workOrder={workOrder}
                  usedParts={usedParts}
                  isAddPartDialogOpen={isAddPartDialogOpen}
                  setIsAddPartDialogOpen={setIsAddPartDialogOpen}
                  handleAddPart={handleAddPart}
                  handleRemovePart={handleRemovePart}
                />
              </TabsContent>

              <TabsContent value="history" className="p-4">
                <WorkOrderRelatedHistoryCard
                  workOrder={workOrder}
                  vehicle={vehicle}
                  onViewWorkOrder={handleSelectWorkOrder}
                  serviceCategories={serviceCategories}
                />
              </TabsContent>

              <TabsContent value="location" className="p-4">
                <WorkOrderLocationMapCard
                  workOrder={workOrder}
                  location={location}
                  allLocations={locations}
                  showInteractiveMap={showInteractiveMap}
                  setShowInteractiveMap={setShowInteractiveMap}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Dialogs */}
      <AssignTechnicianModal
        open={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        technicians={technicians || []}
        onAssign={handleAssignTechnician}
        isAssigning={updateWorkOrderMutation.isPending}
      />

      <AssignEmergencyBikeModal
        open={isAssignEmergencyOpen}
        onClose={() => setIsAssignEmergencyOpen(false)}
        onAssign={handleAssignEmergencyBike}
      />

      <ConfirmationCallDialog
        isOpen={isConfirmationCallDialogOpen}
        onClose={() => setIsConfirmationCallDialogOpen(false)}
        onConfirm={handleConfirmationCall}
        workOrderNumber={getWorkOrderNumber(workOrder)}
        customerName={customer?.name || workOrder.customerName}
        customerPhone={customer?.phone || workOrder.customerPhone}
        isSubmitting={updateWorkOrderMutation.isPending}
      />

      {workOrder && (
        <MaintenanceCompletionDrawer
          isOpen={isMaintenanceCompletionDrawerOpen}
          onClose={() => setIsMaintenanceCompletionDrawerOpen(false)}
          workOrder={workOrder}
          onSave={handleCompleteWorkOrder}
          usedParts={usedParts}
        />
      )}

      {workOrder && (
        <WorkOrderPartsDialog
          isOpen={isAddPartDialogOpen}
          onClose={() => setIsAddPartDialogOpen(false)}
          workOrder={workOrder}
          onAddPart={handleAddPart}
        />
      )}

      <OnHoldReasonDialog
        isOpen={isOnHoldDialogOpen}
        onClose={() => setIsOnHoldDialogOpen(false)}
        onSave={handleOnHold}
      />

      <IssueConfirmationDialog
        isOpen={isIssueConfirmationOpen}
        onClose={() => setIsIssueConfirmationOpen(false)}
      />
    </div>
  );
};

export default WorkOrderDetailsEnhanced;
