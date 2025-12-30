import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { File01Icon as FileIcon, Call02Icon, Wrench01Icon, CheckmarkCircle01Icon, Tick01Icon, Clock01Icon } from '@hugeicons/core-free-icons';
import { WorkOrder } from '@/types/supabase';
import dayjs from 'dayjs';

interface WorkOrderStepperProps {
  workOrder: WorkOrder;
  compact?: boolean;
  profileMap?: Map<string, string>;
  onConfirmationClick?: () => void;
}

const STEPS = [
  { key: 'Open', label: 'Open', icon: FileIcon },
  { key: 'Confirmation', label: 'Confirmation', icon: Call02Icon },
  { key: 'Ready', label: 'Ready', icon: Wrench01Icon },
  { key: 'In Progress', label: 'In Progress', icon: Wrench01Icon },
  { key: 'Completed', label: 'Completed', icon: CheckmarkCircle01Icon },
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

const WorkOrderStepper: React.FC<WorkOrderStepperProps> = ({ workOrder, compact = false, profileMap, onConfirmationClick }) => {
  const currentStatus = workOrder?.status || 'Open';
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);
  const isOnHold = currentStatus === 'On Hold';
  const [hoveredStep, setHoveredStep] = useState<string | null>(null);

  // Check if confirmation call is needed or if we're in confirmation status
  const needsConfirmationCall = workOrder?.status === 'Open' && !workOrder?.confirmation_call_completed;
  const isConfirmationStep = workOrder?.status === 'Confirmation';
  // Make confirmation step clickable in Open or Confirmation status
  const canClickConfirmation = workOrder?.status === 'Open' || workOrder?.status === 'Confirmation';

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
        if (workOrder.confirmed_at) return dayjs(workOrder.confirmed_at);
        if ((workOrder as any).confirmedAt) return dayjs((workOrder as any).confirmedAt);
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
      nextTimestamp = getStepTimestamp('In Progress') || getStepTimestamp('Completed');
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

  if (compact) {
    return (
      <>
        <style>{rippleStyles}</style>
        <div className="flex items-center gap-2 py-3 overflow-x-auto px-4">
          {STEPS.map((step, index) => {
            const isCompleted = currentIndex > index;
            const isCurrent = STATUS_ORDER[index] === currentStatus;
            const timestamp = getStepTimestamp(step.key);
            const duration = getStepDuration(step.key, index);
            const stepUser = getStepUser(step.key);

            return (
              <React.Fragment key={step.key}>
                <div
                  className={`flex flex-col items-center min-w-[70px] relative group step-container ${step.key === 'Confirmation' && canClickConfirmation && onConfirmationClick ? 'cursor-pointer hover:opacity-80' : 'cursor-default'
                    }`}
                  onMouseEnter={() => setHoveredStep(step.key)}
                  onMouseLeave={() => setHoveredStep(null)}
                  onClick={() => {
                    if (step.key === 'Confirmation' && canClickConfirmation && onConfirmationClick) {
                      onConfirmationClick();
                    }
                  }}
                >
                  <div className="flex items-center gap-1">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center relative transition-colors duration-200 ${isCurrent ? 'bg-purple-500 ripple-animation' :
                      isCompleted ? 'bg-emerald-500' :
                        'bg-gray-300'
                      }`}>
                      <HugeiconsIcon
                        icon={isCompleted ? Tick01Icon : step.icon}
                        size={10}
                        className={`step-icon ${isCurrent ? 'text-white' :
                          isCompleted ? 'text-white' :
                            'text-gray-500'
                          }`}
                      />
                      {step.key === 'Confirmation' && needsConfirmationCall && (
                        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border border-white animate-pulse" />
                      )}
                    </div>
                    <span className={`text-xs font-medium transition-colors duration-200 ${isCurrent ? 'text-purple-600' :
                      isCompleted ? 'text-emerald-600' :
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
      <div className="bg-white border-b border-gray-200 px-3 py-2">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-gray-700">
            Progress: <span className={`${currentStatus === 'Completed' ? 'text-emerald-600' : currentStatus === 'On Hold' ? 'text-amber-600' : 'text-purple-600'}`}>{currentStatus}</span>
          </h3>
          {isOnHold && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-700">
              <HugeiconsIcon icon={Clock01Icon} className="w-2.5 h-2.5" size={10} />
              On Hold
            </span>
          )}
        </div>

        {/* Horizontal Stepper - Compact */}
        <div className="flex items-start justify-between gap-1">
          {STEPS.map((step, index) => {
            const isCompleted = currentIndex > index;
            const isCurrent = STATUS_ORDER[index] === currentStatus;
            const isLast = index === STEPS.length - 1;
            const timestamp = getStepTimestamp(step.key);
            const duration = getStepDuration(step.key, index);
            const stepUser = getStepUser(step.key);

            return (
              <React.Fragment key={step.key}>
                <div
                  className={`flex flex-col items-center flex-1 relative group step-container ${step.key === 'Confirmation' && canClickConfirmation && onConfirmationClick ? 'cursor-pointer hover:opacity-80' : 'cursor-default'
                    }`}
                  onMouseEnter={() => setHoveredStep(step.key)}
                  onMouseLeave={() => setHoveredStep(null)}
                  onClick={() => {
                    if (step.key === 'Confirmation' && canClickConfirmation && onConfirmationClick) {
                      onConfirmationClick();
                    }
                  }}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center relative transition-colors duration-200 ${isCurrent ? 'bg-purple-500 ripple-animation' :
                    isCompleted ? 'bg-emerald-500' :
                      'bg-gray-300'
                    }`}>
                    <HugeiconsIcon
                      icon={isCompleted ? Tick01Icon : step.icon}
                      className={`w-4 h-4 step-icon ${isCurrent ? 'text-white' :
                        isCompleted ? 'text-white' :
                          'text-gray-500'
                        }`}
                      size={16}
                    />
                    {step.key === 'Confirmation' && needsConfirmationCall && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white animate-pulse" />
                    )}
                  </div>
                  <span className={`text-xs mt-1 font-medium text-center transition-colors duration-200 leading-tight ${isCurrent ? 'text-purple-600' :
                    isCompleted ? 'text-emerald-600' :
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
