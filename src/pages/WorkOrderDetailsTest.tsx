import { useParams } from "react-router-dom";
import { Card, Typography } from "antd";

const { Title, Text } = Typography;

interface WorkOrderDetailsProps {
  isDrawerMode?: boolean;
  workOrderId?: string | null;
}

const WorkOrderDetailsPage = ({ isDrawerMode = false, workOrderId }: WorkOrderDetailsProps) => {
  const { id: paramId } = useParams<{ id: string }>();
  
  const id = workOrderId || paramId;

  return (
    <div style={{ padding: '20px' }}>
      <Card>
        <Title level={2}>Work Order Details - Test Page</Title>
        <Text>This is a simplified test page to verify routing works.</Text>
        <br />
        <Text strong>ID from URL: {id || 'No ID'}</Text>
        <br />
        <Text strong>Param ID: {paramId || 'No Param ID'}</Text>
        <br />
        <Text strong>Work Order ID prop: {workOrderId || 'No Work Order ID'}</Text>
        <br />
        <Text strong>Is Drawer Mode: {isDrawerMode ? 'Yes' : 'No'}</Text>
      </Card>
    </div>
  );
};

export default WorkOrderDetailsPage;