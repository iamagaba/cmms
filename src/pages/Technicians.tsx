import { useState } from "react";
import { Button, Typography, Space } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { technicians, workOrders, Technician } from "@/data/mockData";
import { TechnicianDataTable } from "@/components/TechnicianDataTable";
import { TechnicianFormDialog } from "@/components/TechnicianFormDialog";

const { Title } = Typography;

const TechniciansPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [allTechnicians, setAllTechnicians] = useState(technicians);

  const handleSave = (technicianData: Technician) => {
    const exists = allTechnicians.some(t => t.id === technicianData.id);
    if (exists) {
      setAllTechnicians(allTechnicians.map(t => t.id === technicianData.id ? technicianData : t));
    } else {
      setAllTechnicians([...allTechnicians, technicianData]);
    }
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={4}>Technician Management</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsDialogOpen(true)}>
          Add Technician
        </Button>
      </div>
      
      <TechnicianDataTable initialData={allTechnicians} workOrders={workOrders} />

      {isDialogOpen && (
        <TechnicianFormDialog 
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSave={handleSave}
          technician={null}
        />
      )}
    </Space>
  );
};

export default TechniciansPage;