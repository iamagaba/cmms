import { useParams, useNavigate } from "react-router-dom";
import { Button, Card, Space, Skeleton, Typography } from "antd";
import { Icon } from '@iconify/react';
import NotFound from "./NotFound";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder } from "@/types/supabase";
import { snakeToCamelCase } from "@/utils/data-helpers";
import AppBreadcrumb from "@/components/Breadcrumbs";

// Debug version

const { Title, Text } = Typography;

interface WorkOrderDetailsProps {
  isDrawerMode?: boolean;
  workOrderId?: string | null;
}

const WorkOrderDetailsPage = ({ isDrawerMode = false, workOrderId }: WorkOrderDetailsProps) => {
  const { id: paramId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const id = workOrderId || paramId;
  
  console.log('WorkOrderDetailsSimple: Component rendered with id:', id);
  console.log('WorkOrderDetailsSimple: isDrawerMode:', isDrawerMode);
  console.log('WorkOrderDetailsSimple: workOrderId:', workOrderId);
  console.log('WorkOrderDetailsSimple: paramId:', paramId);

  const { data: workOrder, isLoading, error } = useQuery<WorkOrder | null>({ 
    queryKey: ['work_order', id], 
    queryFn: async () => { 
      console.log('WorkOrderDetailsSimple: Fetching work order with id:', id);
      if (!id) return null; 
      
      // First, let's see what work orders exist
      const { data: allWorkOrders } = await supabase
        .from('work_orders')
        .select('id, work_order_number')
        .limit(5);
      console.log('WorkOrderDetailsSimple: Available work orders:', allWorkOrders);
      
      const { data, error } = await supabase
        .from('work_orders')
        .select('*')
        .eq('id', id)
        .single(); 
      console.log('WorkOrderDetailsSimple: Query result - data:', data, 'error:', error);
      if (error) {
        console.log('WorkOrderDetailsSimple: Error details:', error.details, error.hint, error.code);
        throw new Error(error.message); 
      }
      if (data) {
        const transformed = snakeToCamelCase(data) as WorkOrder;
        console.log('WorkOrderDetailsSimple: Transformed data:', transformed);
        return transformed;
      }
      return null;
    }, 
    enabled: !!id
  });
  
  console.log('WorkOrderDetailsSimple: Current state - isLoading:', isLoading, 'workOrder:', workOrder, 'error:', error);

  if (isLoading) {
    console.log('WorkOrderDetailsSimple: Showing loading skeleton');
    return <Skeleton active />;
  }
  if (!workOrder) {
    console.log('WorkOrderDetailsSimple: No work order found, showing NotFound');
    return isDrawerMode ? <div style={{ padding: 24 }}><NotFound /></div> : <NotFound />;
  }
  
  console.log('WorkOrderDetailsSimple: Rendering work order details for:', workOrder.id);

  const backButton = (
    <Button icon={<Icon icon="ant-design:arrow-left-outlined" width={18} height={18} />} onClick={() => navigate('/work-orders')} />
  );

  return (
    <>
      <AppBreadcrumb backButton={!isDrawerMode ? backButton : undefined} />
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Card>
          <div style={{ padding: '20px' }}>
            <Title level={2}>Work Order Details</Title>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Text strong>ID: </Text>
                <Text>{workOrder.id}</Text>
              </div>
              <div>
                <Text strong>Work Order Number: </Text>
                <Text>{workOrder.workOrderNumber || 'N/A'}</Text>
              </div>
              <div>
                <Text strong>Status: </Text>
                <Text>{workOrder.status}</Text>
              </div>
              <div>
                <Text strong>Service: </Text>
                <Text>{workOrder.service || 'N/A'}</Text>
              </div>
              {workOrder.customerAddress && (
                <div>
                  <Text strong>Customer Address: </Text>
                  <Text>{workOrder.customerAddress}</Text>
                </div>
              )}
              {workOrder.serviceNotes && (
                <div>
                  <Text strong>Service Notes: </Text>
                  <Text>{workOrder.serviceNotes}</Text>
                </div>
              )}
              {workOrder.created_at && (
                <div>
                  <Text strong>Created At: </Text>
                  <Text>{new Date(workOrder.created_at).toLocaleString()}</Text>
                </div>
              )}
            </Space>
          </div>
        </Card>
      </Space>
    </>
  );
};

export default WorkOrderDetailsPage;