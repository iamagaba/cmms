import { useParams, useNavigate } from "react-router-dom";
import { locations, workOrders, technicians, Technician } from "@/data/mockData";
import { Avatar, Button, Card, Col, Descriptions, Row, Space, Table, Typography, List } from "antd";
import { ArrowLeftOutlined, UserOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { GoogleMap, MarkerF } from "@react-google-maps/api";
import { WorkOrderDataTable } from "@/components/WorkOrderDataTable";
import NotFound from "./NotFound";
import { useMemo, useState } from "react";

const { Title, Text } = Typography;

const containerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '8px',
};

const LocationDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [allWorkOrders, setAllWorkOrders] = useState(workOrders);

  const location = locations.find(loc => loc.id === id);

  const locationWorkOrders = useMemo(() => {
    return allWorkOrders.filter(wo => wo.locationId === id);
  }, [id, allWorkOrders]);

  const locationTechnicians = useMemo(() => {
    const techIds = new Set(locationWorkOrders.map(wo => wo.assignedTechnicianId));
    return technicians.filter(tech => techIds.has(tech.id));
  }, [locationWorkOrders]);

  if (!location) {
    return <NotFound />;
  }
  
  const handleSaveWorkOrder = (workOrderData: typeof workOrders[0]) => {
    const exists = allWorkOrders.some(wo => wo.id === workOrderData.id);
    if (exists) {
      setAllWorkOrders(allWorkOrders.map(wo => wo.id === workOrderData.id ? workOrderData : wo));
    } else {
      setAllWorkOrders([workOrderData, ...allWorkOrders]);
    }
  };

  const handleDeleteWorkOrder = (workOrderData: typeof workOrders[0]) => {
    setAllWorkOrders(allWorkOrders.filter(wo => wo.id !== workOrderData.id));
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/locations')}>
        Back to Locations
      </Button>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card>
              <Title level={4}>{location.name}</Title>
              <Text type="secondary"><EnvironmentOutlined /> {location.address}</Text>
            </Card>
            <Card title="Technicians On-Site">
              <List
                itemLayout="horizontal"
                dataSource={locationTechnicians}
                renderItem={(tech: Technician) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar src={tech.avatar} />}
                      title={<a href={`/technicians/${tech.id}`}>{tech.name}</a>}
                      description={tech.specialization}
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Space>
        </Col>
        <Col xs={24} lg={16}>
          <Card title="Location Map" bodyStyle={{ padding: 0 }}>
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={{ lat: location.lat, lng: location.lng }}
              zoom={14}
            >
              <MarkerF position={{ lat: location.lat, lng: location.lng }} label="L" />
              {locationTechnicians.map(tech => (
                <MarkerF key={tech.id} position={{ lat: tech.lat, lng: tech.lng }} icon={{ path: google.maps.SymbolPath.CIRCLE, scale: 5, fillColor: 'blue', fillOpacity: 1, strokeWeight: 0 }} />
              ))}
            </GoogleMap>
          </Card>
        </Col>
      </Row>

      <Card>
        <Title level={5}>Work Orders at {location.name}</Title>
        <WorkOrderDataTable 
          workOrders={locationWorkOrders}
          technicians={technicians}
          locations={locations}
          onSave={handleSaveWorkOrder}
          onDelete={handleDeleteWorkOrder}
        />
      </Card>
    </Space>
  );
};

export default LocationDetailsPage;