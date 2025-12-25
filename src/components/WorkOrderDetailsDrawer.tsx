import { Drawer, Button, Typography, Skeleton } from 'antd';
import { ExpandOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import WorkOrderDetails from '@/pages/WorkOrderDetails';

const { Title } = Typography;


interface WorkOrderDetailsDrawerProps {
  onClose: () => void;
  workOrderId?: string | null;
  open?: boolean;
}

const WorkOrderDetailsDrawer = ({ onClose, workOrderId, open }: WorkOrderDetailsDrawerProps) => {
  const navigate = useNavigate();

  // Use a distinct cache key to avoid colliding with the detailed page's query
  const { data: workOrder, isLoading: isLoadingWorkOrder } = useQuery<{ workOrderNumber?: string } | null>({
    queryKey: ['work_order_drawer_title', workOrderId],
    queryFn: async () => {
      if (!workOrderId) return null;
      const { data, error } = await supabase
        .from('work_orders')
        .select('work_order_number')
        .eq('id', workOrderId)
        .single();
      if (error) throw new Error(error.message);
      return data ? { workOrderNumber: (data as any).work_order_number as string } : null;
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
      open={!!open}
      width={800}
      destroyOnClose
    >
  {isLoadingWorkOrder && <Skeleton active />}
  {workOrderId && <WorkOrderDetails isDrawerMode workOrderId={workOrderId} />}
    </Drawer>
  );
};

export default WorkOrderDetailsDrawer;