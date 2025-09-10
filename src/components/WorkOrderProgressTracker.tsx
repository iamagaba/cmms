import { Steps, Popover, Typography } from 'antd';
import { WorkOrder } from '@/types/supabase';
import dayjs from 'dayjs';

const { Step } = Steps;
const { Text } = Typography;

interface WorkOrderProgressTrackerProps {
  workOrder: WorkOrder;
}

const WorkOrderProgressTracker = ({ workOrder }: WorkOrderProgressTrackerProps) => {
  const steps = ['Open', 'Confirmation', 'Ready', 'In Progress', 'Completed'];
  
  let currentStepIndex = steps.indexOf(workOrder.status || 'Open');
  
  if (workOrder.status === 'On Hold') {
    currentStepIndex = steps.indexOf('In Progress');
  }

  const getStatusTimestamp = (status: string): string | null => {
    if (!workOrder.activityLog) return null;
    
    if (status === 'Open' && workOrder.createdAt) {
        return dayjs(workOrder.createdAt).format('MMM D, h:mm A');
    }

    if (status === 'Completed' && workOrder.completedAt) {
        return dayjs(workOrder.completedAt).format('MMM D, h:mm A');
    }

    const statusChangeLog = [...workOrder.activityLog].reverse().find(log => 
        log.activity.startsWith('Status changed') && log.activity.includes(`to '${status}'`)
    );

    if (statusChangeLog) {
        return dayjs(statusChangeLog.timestamp).format('MMM D, h:mm A');
    }

    return null;
  };

  return (
    <Steps current={currentStepIndex} size="small">
      {steps.map((step, index) => {
        const timestamp = getStatusTimestamp(step);
        let stepStatus: 'wait' | 'process' | 'finish' | 'error' = 'wait';

        if (workOrder.status === 'Completed') {
          stepStatus = 'finish';
        } else if (index < currentStepIndex) {
          stepStatus = 'finish';
        } else if (index === currentStepIndex) {
          stepStatus = 'process';
        }

        if (workOrder.status === 'On Hold' && step === 'In Progress') {
          stepStatus = 'error';
        }
        
        const description = (
          <>
            {timestamp && <Text type="secondary" style={{ fontSize: 12 }}>{timestamp}</Text>}
            {stepStatus === 'error' && workOrder.onHoldReason && (
              <Popover content={workOrder.onHoldReason} title="On Hold Reason" trigger="hover">
                <Text type="danger" style={{ fontSize: 12, display: 'block', cursor: 'pointer' }}>On Hold</Text>
              </Popover>
            )}
          </>
        );

        return (
          <Step 
            key={step} 
            title={step} 
            status={stepStatus}
            description={description}
          />
        );
      })}
    </Steps>
  );
};

export default WorkOrderProgressTracker;