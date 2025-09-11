import { Drawer, Button, Space, Typography, Skeleton } from 'antd';
import { ExpandOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { WorkOrder } from '@/types/supabase';
import WorkOrderDetails from '@/pages/WorkOrderDetails';

const { Title } = Typography;

interface WorkOrderDetailsDrawerProps {
  onClose: () => void; // No longer takes workOrderId as a prop
}

const WorkOrderDetailsDrawer = ({ onClose }: WorkOrderDetailsDrawerProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const workOrderId = searchParams.get('view'); // Get workOrderId from search params

  const { data: workOrder, isLoading: isLoadingWorkOrder } = useQuery<WorkOrder | null>({
    queryKey: ['work_order', workOrderId],
    queryFn: async () => {
      if (!workOrderId) return null;
      const { data, error } = await supabase.from('work_orders').select('*').eq('id', workOrderId).single();
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!workOrderId, // Enable query only if workOrderId is present
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
      open={!!workOrderId} // Drawer is open if workOrderId is present
      width={800}
      destroyOnClose
    >
      {isLoadingWorkOrder && <Skeleton active />}
      {workOrder && <WorkOrderDetails isDrawerMode />}
    </Drawer>
  );
};

export default WorkOrderDetailsDrawer;