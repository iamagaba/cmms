import { useMemo, useState } from "react";
import { Button, Space, Tabs, Alert, Spin, Table, Typography } from "antd";
import { Icon } from '@iconify/react';
import { WorkOrderDataTable } from "@/components/WorkOrderDataTable";
import { ALL_COLUMNS } from "@/components/work-order-columns-constants";
import { WorkOrderFormDrawer } from "@/components/WorkOrderFormDrawer";
import WorkOrderDetailsDrawer from "@/components/WorkOrderDetailsDrawer";
import WorkOrderKanban from "@/components/WorkOrderKanban";
import { OnHoldReasonDialog } from "@/components/OnHoldReasonDialog";
import WorkOrderProgressTracker from "@/components/WorkOrderProgressTracker";

import CalendarPage from "./Calendar";
import MapViewPage from "./MapView";
import { CreateWorkOrderDialog } from "@/components/CreateWorkOrderDialog";
import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime';
import isBetween from 'dayjs/plugin/isBetween';
import AppBreadcrumb from "@/components/Breadcrumbs";
import Fab from "@/components/Fab";
import { useWorkOrderData } from "@/hooks/useWorkOrderData";
import { useWorkOrderMutations } from "@/hooks/useWorkOrderMutations";
import { useWorkOrderFilters, GroupByOption } from "@/hooks/useWorkOrderFilters";
// Removed custom primary button style to match Customers page buttons
import { WorkOrder, Vehicle, Customer } from "@/types/supabase";
import WorkOrderFilters from "@/components/WorkOrderFilters";

dayjs.extend(isBetween);
dayjs.extend(relativeTime);

type WorkOrderView = 'table' | 'kanban' | 'calendar' | 'map' | 'progress';

const WorkOrdersPage = () => {
  // const navigate = useNavigate();
  // Component state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingWorkOrder, setEditingWorkOrder] = useState<WorkOrder | null>(null);
  const [prefillData, setPrefillData] = useState<Partial<WorkOrder> | null>(null);
  const [view, setView] = useState<WorkOrderView>('table');
  const [onHoldWorkOrder, setOnHoldWorkOrder] = useState<WorkOrder | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(ALL_COLUMNS.map(c => c.value));

    // const viewingWorkOrderId = searchParams.get('view');

  // Custom hooks for data, mutations, and filters
  const {
    allWorkOrders,
    technicians,
    locations,
    customers,
    vehicles,
    profiles,
    serviceCategories,
    slaPolicies,
    isLoading,
    error,
    refetch
  } = useWorkOrderData();

  const {
    vehicleFilter,
    statusFilter,
    priorityFilter,
    technicianFilter,
    channelFilter,
    groupBy,
    setVehicleFilter,
    setStatusFilter,
    setPriorityFilter,
    setTechnicianFilter,
    setChannelFilter,
    setGroupBy,
    filteredWorkOrders,
    kanbanColumns,
    groupByField
  } = useWorkOrderFilters(allWorkOrders, technicians);

  const {
    updateWorkOrder,
    saveWorkOrder,
    deleteWorkOrder,
    bulkAssign
  } = useWorkOrderMutations({ serviceCategories, slaPolicies, technicians, locations });

  // Event handlers
  const handleSave = (workOrderData: WorkOrder) => {
    saveWorkOrder(workOrderData);
    setIsFormDialogOpen(false);
    setEditingWorkOrder(null);
  };

  const handleDelete = (workOrderData: WorkOrder) => {
    deleteWorkOrder(workOrderData);
  };
  
  const handleUpdateWorkOrder = (id: string, updates: Partial<WorkOrder>) => {
    const workOrder = allWorkOrders?.find(wo => wo.id === id);
    if (!workOrder) return;
    updateWorkOrder(workOrder, updates, setOnHoldWorkOrder);
  };

  const handleSaveOnHoldReason = (reason: string) => {
    if (!onHoldWorkOrder) return;
    const updates = { status: 'On Hold' as const, onHoldReason: reason };
    handleUpdateWorkOrder(onHoldWorkOrder.id, updates);
    setOnHoldWorkOrder(null);
  };

  const [drawerWorkOrderId, setDrawerWorkOrderId] = useState<string | null>(null);
  const handleViewDetails = (workOrderId: string) => {
    setDrawerWorkOrderId(workOrderId);
  };

  // removed duplicate searchTerm state
  // Drawer removed

  const handleProceedToCreate = (vehicle: Vehicle & { customers?: Customer | null }) => {
    setIsCreateDialogOpen(false);
    const initialSlaDue = dayjs().add(15, 'minutes').toISOString();
    const prefill = {
      vehicleId: vehicle.id,
      customerId: vehicle.customers?.id,
      customerName: vehicle.customers?.name || '',
      customerPhone: vehicle.customers?.phone || '',
      vehicleModel: `${vehicle.make} ${vehicle.model}`,
      slaDue: initialSlaDue,
    };
    setPrefillData(prefill);
    setIsFormDialogOpen(true);
  };

  const handleVisibleColumnsChange = setVisibleColumns;
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

  // Maps for quick lookup
  const vehicleMap = useMemo(() => new Map((vehicles || []).map(v => [v.id, v])), [vehicles]);
  const locationMap = useMemo(() => new Map((locations || []).map(l => [l.id, l])), [locations]);

  const tabItems = [
    {
      label: (<span><Icon icon="si:table" /> Table</span>),
      key: 'table',
      children: (
        <WorkOrderDataTable
          workOrders={filteredWorkOrders}
          technicians={technicians}
          locations={locations}
          customers={customers}
          vehicles={vehicles}
          onEdit={(wo) => { setEditingWorkOrder(wo); setIsFormDialogOpen(true); }}
          onDelete={handleDelete}
          onUpdateWorkOrder={handleUpdateWorkOrder}
          onViewDetails={handleViewDetails}
          profiles={profiles}
          visibleColumns={visibleColumns}
          onVisibleColumnsChange={handleVisibleColumnsChange}
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys as string[]),
          }}
          onBulkAssign={(ids, technicianId) => bulkAssign(ids, technicianId)}
          virtualized={filteredWorkOrders.length > 80}
        />
      ),
    },
    {
      label: (<span><Icon icon="si:grid" /> Board</span>),
      key: 'kanban',
      children: (
        <WorkOrderKanban
          workOrders={filteredWorkOrders}
          groupBy={groupByField}
          columns={kanbanColumns}
          onUpdateWorkOrder={handleUpdateWorkOrder}
          technicians={technicians}
          locations={locations}
          customers={customers}
          vehicles={vehicles}
          onViewDetails={handleViewDetails}
        />
      ),
    },
    {
      label: (<span><Icon icon="si:calendar" /> Calendar</span>),
      key: 'calendar',
      children: <CalendarPage />,
    },
    {
      label: (<span><Icon icon="si:map" /> Map View</span>),
      key: 'map',
      children: <MapViewPage />,
    },
    {
      label: (<span><Icon icon="ant-design:ordered-list-outlined" /> Progress</span>),
      key: 'progress',
      children: (
        <Table
          size="small"
          dataSource={filteredWorkOrders}
          rowKey="id"
          pagination={{ pageSize: 10, position: ["bottomCenter"] as const, hideOnSinglePage: true }}
          columns={[
            {
              title: 'Work Order',
              key: 'workOrder',
              render: (_: any, wo: WorkOrder) => (
                <Typography.Link onClick={() => handleViewDetails(wo.id)}>
                  {wo.workOrderNumber || wo.id}
                </Typography.Link>
              ),
            },
            {
              title: 'License Plate',
              key: 'licensePlate',
              render: (_: any, wo: WorkOrder) => vehicleMap.get(wo.vehicleId || '')?.license_plate || 'N/A',
            },
            {
              title: 'Location',
              key: 'location',
              render: (_: any, wo: WorkOrder) => locationMap.get(wo.locationId || '')?.name?.replace(' Service Center', '') || 'N/A',
            },
            {
              title: 'Technician',
              key: 'technician',
              render: (_: any, wo: WorkOrder) => {
                const tech = technicians?.find(t => t.id === wo.assignedTechnicianId);
                return tech?.name || 'Unassigned';
              },
            },
            {
              title: 'Created',
              key: 'created',
              render: (_: any, wo: WorkOrder) => {
                const ts = (wo as any).createdAt ?? (wo as any).created_at;
                return ts ? dayjs(ts).fromNow() : '—';
              },
            },
            {
              title: 'Progress',
              key: 'progress',
              render: (_: any, wo: WorkOrder) => (
                <div style={{ minWidth: 320 }}>
                  <WorkOrderProgressTracker workOrder={wo} type="inline" showDescriptions={false} customDotColors />
                </div>
              ),
            },
          ]}
        />
      ),
    },
  ];


  // Define pageActions for AppBreadcrumb (e.g., bulk actions, add button)
  const pageActions = (
    <Button
      className="primary-action-btn"
      type="primary"
      icon={<Icon icon="ant-design:plus-outlined" width={16} height={16} />}
      onClick={() => setIsCreateDialogOpen(true)}
    >
      New Work Order
    </Button>
  );

  if (error) {
    return (
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <AppBreadcrumb actions={pageActions} />
        <Alert
          message="Error Loading Work Orders"
          description={error.message}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
        />
      </Space>
    );
  }

  if (isLoading) {
    return (
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <AppBreadcrumb actions={pageActions} />
        <Spin tip="Loading work orders..." size="large" style={{ width: '100%', margin: '40px 0' }} />
      </Space>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      <AppBreadcrumb actions={pageActions} />
      <div className="sticky-header-secondary">
        <WorkOrderFilters
        vehicleFilter={vehicleFilter}
        statusFilter={statusFilter}
        priorityFilter={priorityFilter}
        technicianFilter={technicianFilter}
        channelFilter={channelFilter}
        onVehicleFilterChange={setVehicleFilter}
        onStatusFilterChange={setStatusFilter}
        onPriorityFilterChange={setPriorityFilter}
        onTechnicianFilterChange={setTechnicianFilter}
        onChannelFilterChange={setChannelFilter}
        technicians={technicians}
        locations={locations}
        view={view}
        groupBy={groupBy}
        onGroupByChange={(value) => setGroupBy(value as GroupByOption)}
        />
      </div>
      <div className="sticky-header-secondary">
        <Tabs 
          defaultActiveKey="table" 
          activeKey={view} 
          onChange={(key) => setView(key as WorkOrderView)} 
          items={tabItems} 
        />
      </div>
      {isCreateDialogOpen && (
        <CreateWorkOrderDialog 
          isOpen={isCreateDialogOpen} 
          onClose={() => setIsCreateDialogOpen(false)} 
          onProceed={handleProceedToCreate} 
        />
      )}
      {isFormDialogOpen && (
        <WorkOrderFormDrawer 
          isOpen={isFormDialogOpen} 
          onClose={() => { 
            setIsFormDialogOpen(false); 
            setPrefillData(null); 
          }} 
          onSave={(data) => handleSave(data as WorkOrder)}
          workOrder={editingWorkOrder} 
          prefillData={prefillData} 
          technicians={technicians} 
          locations={locations} 
          serviceCategories={serviceCategories} 
        />
      )}
      {onHoldWorkOrder && (
        <OnHoldReasonDialog 
          isOpen={!!onHoldWorkOrder} 
          onClose={() => setOnHoldWorkOrder(null)} 
          onSave={handleSaveOnHoldReason} 
        />
      )}
      {drawerWorkOrderId && (
        <WorkOrderDetailsDrawer
          open={!!drawerWorkOrderId}
          workOrderId={drawerWorkOrderId}
          onClose={() => setDrawerWorkOrderId(null)}
        />
      )}

      {/* Mobile FAB for quick add */}
      <div className="hide-on-desktop">
        <Fab label="New Work Order" onClick={() => setIsCreateDialogOpen(true)} />
      </div>
    </div>
  );
};

export default WorkOrdersPage;