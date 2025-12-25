import { useParams } from "react-router-dom";
import { Card, Typography } from "antd";

const { Title, Text } = Typography;

// Ultra simple test to verify routing works in full-screen mode
const WorkOrderDetailsSimpleTest = () => {
  const { id } = useParams<{ id: string }>();
  
  console.log('WorkOrderDetailsSimpleTest: Component loaded with id:', id);
  
  return (
    <div style={{ padding: '20px' }}>
      <Card>
        <Title level={2}>Work Order Details - Simple Test</Title>
        <Text>Work Order ID: {id}</Text>
        <br />
        <Text>If you can see this, the routing to full-screen mode works!</Text>
        <br />
        <Text>Timestamp: {new Date().toLocaleTimeString()}</Text>
      </Card>
    </div>
  );
};

export default WorkOrderDetailsSimpleTest;