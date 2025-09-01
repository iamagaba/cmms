import { useState } from "react";
import { Button, Typography, Space } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { workOrders, technicians, locations, WorkOrder } from "@/data/mockData";
import { WorkOrderDataTable } from "@/components/WorkOrderDataTable";
import { WorkOrderFormDialog } from "@/components/WorkOrderFormDialog";

const { Title } = Typography;

const WorkOrdersPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [allWorkOrders, setAllWorkOrders] = useState(workOrders);

  const handleSave = (workOrderData: WorkOrder) => {
    const exists = allWorkOrders.some(wo => wo.id === workOrderData.id);
    if (exists) {
      setAllWorkOrders(allWorkOrders.map(wo => wo.id === workOrderData.id ? workOrderData : wo));
    } else {
      setAllWorkOrders([...allWorkOrders, workOrderData]);
    }
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={4}>Work Order Management</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsDialogOpen(true)}>
          Add Work Order
        </Button>
      </div>
      
      <WorkOrderDataTable 
        initialData={allWorkOrders} 
        technicians={technicians} 
        locations={locations} 
      />

      {isDialogOpen && (
        <WorkOrderFormDialog 
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSave={handleSave}
          workOrder={null}
        />
      )}
    </Space>
  );
};

export default WorkOrdersPage;