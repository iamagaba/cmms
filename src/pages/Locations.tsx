import { useState } from "react";
import { Button, Typography, Space } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { locations, workOrders, Location } from "@/data/mockData";
import { LocationFormDialog } from "@/components/LocationFormDialog";
import { LocationDataTable } from "@/components/LocationDataTable";

const { Title } = Typography;

const LocationsPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [allLocations, setAllLocations] = useState(locations);

  const handleSave = (locationData: Location) => {
    const exists = allLocations.some(l => l.id === locationData.id);
    if (exists) {
      setAllLocations(allLocations.map(l => l.id === locationData.id ? locationData : l));
    } else {
      setAllLocations([...allLocations, locationData]);
    }
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={4}>Service Locations</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsDialogOpen(true)}>
          Add Location
        </Button>
      </div>
      
      <LocationDataTable initialData={allLocations} workOrders={workOrders} />

      {isDialogOpen && (
        <LocationFormDialog 
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSave={handleSave}
          location={null}
        />
      )}
    </Space>
  );
};

export default LocationsPage;