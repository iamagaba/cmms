import React, { useState } from 'react';
import { FileText, Phone, Wrench, CheckCircle, AlertCircle } from 'lucide-react';
import { WorkOrder } from '@/types/supabase';
import dayjs from 'dayjs';

interface WorkOrderStepperProps {
  workOrder: WorkOrder;
  compact?: boolean;
  profileMap?: Map<string, string>;
  onConfirmationClick?: () => void;
  onCompletionClick?: () => void;
  onInProgressClick?: () => void;
  onReadyClick?: () => void;
}

const STEPS = [
  { key: 'Open', label: 'Open', icon: FileText },
  { key: 'Confirmation', label: 'Confirmation', icon: Phone },
  { key: 'Ready', label: 'Ready', icon: Wrench },
  { key: 'In Progress', label: 'In Progress', icon: Wrench },
  { key: 'Completed', label: 'Completed', icon: CheckCircle },
];

const STATUS_ORDER = ['Open', 'Confirmation', 'Ready', 'In Progress', 'Completed'];

// Format duration in human-readable format
const formatDuration = (ms: number): string => {
  if (ms < 0) return '-';
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    const remainingHours = hours % 24;
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
  }
  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }
  if (minutes > 0) {
    return `${minutes}m`;
  }
  return '< 1m';
};

const WorkOrderStepper: React.FC<WorkOrderStepperProps> = ({ workOrder, compact = false, profileMap, onConfirmationClick, onCompletionClick, onInProgressClick, onReadyClick }) => {
  const currentStatus = workOrder?.status || 'Open';
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);
  const [hoveredStep, setHoveredStep] = useState<string | null>(null);

  // Check if confirmation call is needed or if we're in confirmation status
  const needsConfirmationCall = workOrder?.status === 'Open' && !workOrder?.confirmation_call_completed;
  // Make confirmation step clickable in Open or Confirmation status
  const canClickConfirmation = workOrder?.status === 'Open' || workOrder?.status === 'Confirmation';

  // Make in-progress step clickable ONLY if currently In Progress (to resolve)
  const canClickInProgress = workOrder?.status === 'In Progress';
  // Make Ready step clickable if we are in Ready status
  const canClickReady = workOrder?.status === 'Ready';

  // Make completed step clickable if we are in Ready or In Progress status
  const canClickCompletion = workOrder?.status === 'Ready' || workOrder?.status === 'In Progress';

  // Subtle animation styles
  const rippleStyles = `
    @keyframes subtlePulse {
      0%, 100% {
        box-shadow: 0 0 0 0 rgba(147, 51, 234, 0.2);
      }
      50% {
        box-shadow: 0 0 0 4px rgba(147, 51, 234, 0.05);
      }
    }
    
    .ripple-animation {
      animation: subtlePulse 3s infinite;
    }
    
    .step-icon {
      transition: all 0.2s ease;
    }
    
    .step-container {
      transition: opacity 0.15s ease;
    }
    
    .step-connector {
      transition: background-color 0.2s ease;
    }
  `;

  // Get timestamps for each step - first try database fields, then fall back to activity log
  const getStepTimestamp = (stepKey: string): dayjs.Dayjs | null => {
    // First try the dedicated database fields (check both snake_case and camelCase)
    switch (stepKey) {
      case 'Open':
        if (workOrder.created_at) return dayjs(workOrder.created_at);
        if ((workOrder as any).createdAt) return dayjs((workOrder as any).createdAt);
        break;
      case 'Confirmation':
        if (workOrder.confirmation_status_entered_at) return dayjs(workOrder.confirmation_status_entered_at);
        if ((workOrder as any).confirmationStatusEnteredAt) return dayjs((workOrder as any).confirmationStatusEnteredAt);
        // Fallback for legacy data
        if (workOrder.confirmed_at) return dayjs(workOrder.confirmed_at);
        if ((workOrder as any).confirmedAt) return dayjs((workOrder as any).confirmedAt);
        break;
      case 'Ready':
        if (workOrder.ready_at) return dayjs(workOrder.ready_at);
        if ((workOrder as any).readyAt) return dayjs((workOrder as any).readyAt);
        break;
      case 'In Progress':
        if (workOrder.work_started_at) return dayjs(workOrder.work_started_at);
        if ((workOrder as any).workStartedAt) return dayjs((workOrder as any).workStartedAt);
        break;
      case 'Completed':
        if (workOrder.completedAt) return dayjs(workOrder.completedAt);
        if ((workOrder as any).completed_at) return dayjs((workOrder as any).completed_at);
        break;
    }

    // Fall back to activity log for any step
    const activityLog = workOrder.activityLog || [];
    const statusChangeEntry = activityLog
      .filter(entry => {
        const activity = entry.activity.toLowerCase();
        // Match status changes to this step
        return (activity.includes('status') && activity.includes(stepKey.toLowerCase())) ||
          (activity.includes(`to '${stepKey.toLowerCase()}'`)) ||
          (activity.includes(`to "${stepKey.toLowerCase()}"`));
      })
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())[0];

    if (statusChangeEntry?.timestamp) {
      return dayjs(statusChangeEntry.timestamp);
    }

    return null;
  };

  // Get user who made the status change
  const getStepUser = (stepKey: string): string | null => {
    const activityLog = workOrder.activityLog || [];
    const statusChangeEntry = activityLog
      .filter(entry => entry.activity.toLowerCase().includes(`status changed`) && entry.activity.toLowerCase().includes(stepKey.toLowerCase()))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

    if (statusChangeEntry?.userId && profileMap) {
      return profileMap.get(statusChangeEntry.userId) || 'Unknown User';
    }
    return statusChangeEntry?.userId ? 'System User' : null;
  };

  // Calculate duration spent in each step
  const getStepDuration = (stepKey: string, stepIndex: number): string | null => {
    // Don't show duration for Completed (it's the final state)
    if (stepKey === 'Completed') return null;

    const stepTimestamp = getStepTimestamp(stepKey);
    if (!stepTimestamp) return null;

    // Find the next step's timestamp
    let nextTimestamp: dayjs.Dayjs | null = null;

    if (stepKey === 'Open') {
      nextTimestamp = getStepTimestamp('Confirmation') || getStepTimestamp('In Progress') || getStepTimestamp('Completed');
    } else if (stepKey === 'Confirmation') {
      nextTimestamp = getStepTimestamp('Ready') || getStepTimestamp('In Progress') || getStepTimestamp('Completed');
    } else if (stepKey === 'Ready') {
      nextTimestamp = getStepTimestamp('In Progress') || getStepTimestamp('Completed');
    } else if (stepKey === 'In Progress') {
      nextTimestamp = getStepTimestamp('Completed');
    }

    // If step is completed (has next timestamp), calculate duration
    if (nextTimestamp) {
      const duration = nextTimestamp.diff(stepTimestamp);
      return formatDuration(duration);
    }

    // If this is the current step, show time since it started
    if (STATUS_ORDER[stepIndex] === currentStatus || stepIndex < currentIndex) {
      // For current step, show ongoing duration
      if (STATUS_ORDER[stepIndex] === currentStatus) {
        const duration = dayjs().diff(stepTimestamp);
        return formatDuration(duration);
      }
    }

    return null;
  };

  const isClickableStep = (stepKey: string) => {
    if (stepKey === 'Confirmation' && canClickConfirmation && onConfirmationClick) return true;
    if (stepKey === 'Ready' && canClickReady && onReadyClick) return true;
    if (stepKey === 'In Progress' && canClickInProgress && onInProgressClick) return true;
    if (stepKey === 'Completed' && canClickCompletion && onCompletionClick) return true;
    return false;
  };

  if (compact) {
    return (
      <>
        <style>{rippleStyles}</style>
        <div className="flex items-center gap-2 py-3 overflow-x-auto px-4">
          {STEPS.map((step, index) => {
            const isCompleted = currentIndex > index;
            const isCurrent = STATUS_ORDER[index] === currentStatus;

            // Treat "Completed" step as finished (Green) even if it's the current status
            const showAsCompleted = isCompleted || (isCurrent && step.key === 'Completed');
            const showAsCurrent = isCurrent && step.key !== 'Completed';

            const timestamp = getStepTimestamp(step.key);
            const duration = getStepDuration(step.key, index);
            const stepUser = getStepUser(step.key);
            const clickable = isClickableStep(step.key);

            return (
              <React.Fragment key={step.key}>
                <div
                  className={`flex flex-col items-center min-w-[70px] relative group step-container ${clickable ? 'cursor-pointer hover:opacity-80' : 'cursor-default'
                    }`}
                  onMouseEnter={() => setHoveredStep(step.key)}
                  onMouseLeave={() => setHoveredStep(null)}
                  onClick={() => {
                    if (step.key === 'Confirmation' && canClickConfirmation && onConfirmationClick) {
                      onConfirmationClick();
                    } else if (step.key === 'Ready' && canClickReady && onReadyClick) {
                      onReadyClick();
                    } else if (step.key === 'In Progress' && canClickInProgress && onInProgressClick) {
                      onInProgressClick();
                    } else if (step.key === 'Completed' && canClickCompletion && onCompletionClick) {
                      onCompletionClick();
                    }
                  }}
                >
                  <div className="flex items-center gap-1">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center relative transition-colors duration-200 ${showAsCurrent ? 'bg-purple-500 ripple-animation' :
                      showAsCompleted ? 'bg-emerald-500' :
                        'bg-gray-300'
                      }`}>
                      {showAsCompleted ? (
                        <CheckCircle className={`w-3 h-3 step-icon text-white`} />
                      ) : (
                        <step.icon className={`w-3 h-3 step-icon ${showAsCurrent ? 'text-white' : 'text-gray-500'}`} />
                      )}
                      {step.key === 'Confirmation' && needsConfirmationCall && (
                        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border border-white animate-pulse" />
                      )}
                    </div>
                    <span className={`text-xs font-medium transition-colors duration-200 ${showAsCurrent ? 'text-purple-600' :
                      showAsCompleted ? 'text-emerald-600' :
                        'text-gray-400'
                      }`}>
                      {step.label}
                    </span>
                  </div>
                  <span className={`text-xs font-medium mt-0.5 ${timestamp ? 'text-gray-700' : 'text-gray-400'}`}>
                    {timestamp ? timestamp.format('MMM D, h:mm A') : '—'}
                  </span>
                  {duration && (
                    <span className="text-xs text-blue-700 font-semibold mt-0.5 bg-blue-100 px-2 py-0.5 rounded border border-blue-200">{duration}</span>
                  )}

                  {/* Hover tooltip */}
                  {hoveredStep === step.key && (
                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                      {step.key === 'Confirmation' && canClickConfirmation && onConfirmationClick ? (
                        'Click to make confirmation call'
                      ) : step.key === 'Ready' && canClickReady && onReadyClick ? (
                        'Click to assign technician and start work'
                      ) : step.key === 'In Progress' && canClickInProgress && onInProgressClick ? (
                        'Click to resolve work order'
                      ) : step.key === 'Completed' && canClickCompletion && onCompletionClick ? (
                        'Click to complete work order'
                      ) : stepUser ? (
                        `Changed by: ${stepUser}`
                      ) : null}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  )}
                </div>
                {
                  index < STEPS.length - 1 && (
                    <div className={`w-4 h-0.5 flex-shrink-0 step-connector ${isCompleted ? 'bg-emerald-500' : 'bg-gray-200'
                      }`} />
                  )
                }
              </React.Fragment>
            );
          })}
        </div >
      </>
    );
  }

  return (
    <>
      <style>{rippleStyles}</style>
      <div className="bg-white border border-gray-200 shadow-md px-3 py-3">
        {/* Horizontal Stepper - Compact */}
        <div className="flex items-start justify-between gap-1">
          {STEPS.map((step, index) => {
            const isCompleted = currentIndex > index;
            const isCurrent = STATUS_ORDER[index] === currentStatus;

            // Treat "Completed" step as finished (Green) even if it's the current status
            const showAsCompleted = isCompleted || (isCurrent && step.key === 'Completed');
            const showAsCurrent = isCurrent && step.key !== 'Completed';

            const isLast = index === STEPS.length - 1;
            const timestamp = getStepTimestamp(step.key);
            const duration = getStepDuration(step.key, index);
            const stepUser = getStepUser(step.key);
            const clickable = isClickableStep(step.key);

            return (
              <React.Fragment key={step.key}>
                <div
                  className={`flex flex-col items-center flex-1 relative group step-container ${clickable ? 'cursor-pointer hover:opacity-80' : 'cursor-default'
                    }`}
                  onMouseEnter={() => setHoveredStep(step.key)}
                  onMouseLeave={() => setHoveredStep(null)}
                  onClick={() => {
                    if (step.key === 'Confirmation' && canClickConfirmation && onConfirmationClick) {
                      onConfirmationClick();
                    } else if (step.key === 'Ready' && canClickReady && onReadyClick) {
                      onReadyClick();
                    } else if (step.key === 'In Progress' && canClickInProgress && onInProgressClick) {
                      onInProgressClick();
                    } else if (step.key === 'Completed' && canClickCompletion && onCompletionClick) {
                      onCompletionClick();
                    }
                  }}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center relative transition-colors duration-200 ${showAsCurrent ? 'bg-purple-500 ripple-animation' :
                    showAsCompleted ? 'bg-emerald-500' :
                      'bg-gray-300'
                    }`}>
                    {showAsCompleted ? (
                      <CheckCircle className={`w-4 h-4 step-icon text-white`} />
                    ) : (
                      <step.icon className={`w-4 h-4 step-icon ${showAsCurrent ? 'text-white' : 'text-gray-500'}`} />
                    )}
                    {step.key === 'Confirmation' && needsConfirmationCall && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white animate-pulse" />
                    )}
                  </div>
                  <span className={`text-xs mt-1 font-medium text-center transition-colors duration-200 leading-tight ${showAsCurrent ? 'text-purple-600' :
                    showAsCompleted ? 'text-emerald-600' :
                      'text-gray-400'
                    }`}>
                    {step.label}
                  </span>
                  <span className={`text-[10px] mt-1 text-center leading-tight ${timestamp ? 'text-gray-500' : 'text-gray-300'}`}>
                    {timestamp ? timestamp.format('MMM D, h:mm A') : '—'}
                  </span>
                  {duration && (
                    <span className="text-[10px] text-blue-600 font-semibold mt-1 bg-blue-50 px-2 py-0.5 rounded whitespace-nowrap">
                      {duration}
                    </span>
                  )}

                  {/* Hover tooltip */}
                  {hoveredStep === step.key && (
                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded whitespace-nowrap z-10 shadow-lg">
                      {step.key === 'Confirmation' && canClickConfirmation && onConfirmationClick ? (
                        'Click to make confirmation call'
                      ) : step.key === 'Ready' && canClickReady && onReadyClick ? (
                        'Click to assign technician and start work'
                      ) : step.key === 'In Progress' && canClickInProgress && onInProgressClick ? (
                        'Click to resolve work order'
                      ) : step.key === 'Completed' && canClickCompletion && onCompletionClick ? (
                        'Click to complete work order'
                      ) : stepUser ? (
                        `Changed by: ${stepUser}`
                      ) : null}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  )}
                </div>
                {
                  !isLast && (
                    <div className={`flex-1 h-0.5 mt-3 mx-1 step-connector ${isCompleted ? 'bg-emerald-500' : 'bg-gray-200'
                      }`} />
                  )
                }
              </React.Fragment>
            );
          })}
        </div>
      </div >
    </>
  );
};

export default WorkOrderStepper;


