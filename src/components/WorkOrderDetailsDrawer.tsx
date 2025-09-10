import { Drawer, Button, Space, Typography, Skeleton } from 'antd';
import { ExpandOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { WorkOrder, Technician, Location } from '@/types/supabase';
import WorkOrderDetails from '@/pages/WorkOrderDetails';
import NotFound from '@/pages/NotFound'; // Added missing import

interface WorkOrderDetailsDrawerProps {
  workOrderId: string | null;
  onClose: () => void;
}

const { Title } = Typography;

const WorkOrderDetailsDrawer = ({ workOrderId, onClose }: WorkOrderDetailsDrawerProps) => {
  const navigate = useNavigate();

  const { data: workOrder, isLoading: isLoadingWorkOrder } = useQuery<WorkOrder | null>({
    queryKey: ['work_order', workOrderId],
    queryFn: async () => {
      if (!workOrderId) return null;
      const { data, error } = await supabase.from('work_orders').select('*').eq('id', workOrderId).single();
      if (error) throw new Error(error.message);
      if (data) {
        // Manually map snake_case to camelCase for consistency with WorkOrder type
        const mappedData: WorkOrder = {
          ...data,
          workOrderNumber: data.work_order_number,
          assignedTechnicianId: data.assigned_technician_id,
          locationId: data.location_id,
          serviceNotes: data.service_notes,
          partsUsed: data.parts_used,
          activityLog: data.activity_log,
          slaDue: data.sla_due,
          completedAt: data.completed_at,
          customerLat: data.customer_lat,
          customerLng: data.customer_lng,
          customerAddress: data.customer_address,
          onHoldReason: data.on_hold_reason,
          appointmentDate: data.appointment_date,
          customerId: data.customer_id,
          vehicleId: data.vehicle_id,
          created_by: data.created_by,
        };
        return mappedData;
      }
      return null;
    },
    enabled: !!workOrderId,
  });

  const handleExpand = () => {
    if (workOrderId) {
      navigate(`/work-orders/${workOrderId}`);
    }
  };

  const drawerTitle = (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Title level={5} style={{ margin: 0 }}>
        Work Order: {workOrder?.workOrderNumber || 'Loading...'}
      </Title>
      <Button icon={<ExpandOutlined />} onClick={handleExpand}>
        Expand
      </Button>
    </div>
  );

  return (
    <Drawer
      title={drawerTitle}
      placement="right"
      onClose={onClose}
      open={!!workOrderId}
      width={800}
      destroyOnClose
    >
      {/* Pass the fetched data to WorkOrderDetailsPage */}
      {isLoadingWorkOrder ? <Skeleton active /> : (
        workOrder ? (
          <WorkOrderDetails isDrawerMode drawerWorkOrder={workOrder} drawerIsLoadingWorkOrder={isLoadingWorkOrder} />
        ) : (
          <div style={{ padding: 24 }}><NotFound /></div>
        )
      )}
    </Drawer>
  );
};

export default WorkOrderDetailsDrawer;