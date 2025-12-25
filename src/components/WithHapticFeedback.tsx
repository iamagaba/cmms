import React, { ComponentType } from 'react';
import { workOrderHaptics, formHaptics, navigationHaptics } from '../utils/haptic';

export type HapticFeedbackType = 
  | 'selection'
  | 'success' 
  | 'error'
  | 'navigation'
  | 'button'
  | 'submit'
  | 'statusChange'
  | 'workOrderSelect'
  | 'startWorkOrder'
  | 'completeWorkOrder';

interface WithHapticFeedbackProps {
  hapticType?: HapticFeedbackType;
  disabled?: boolean;
}

/**
 * Higher-order component that adds haptic feedback to any component with onClick
 */
export function withHapticFeedback<P extends Record<string, any>>(
  WrappedComponent: ComponentType<P>,
  defaultHapticType: HapticFeedbackType = 'selection'
) {
  return React.forwardRef<any, P & WithHapticFeedbackProps>((props, ref) => {
    const { hapticType = defaultHapticType, disabled = false, onClick, ...restProps } = props;

    const getHapticFunction = (type: HapticFeedbackType) => {
      switch (type) {
        case 'selection':
          return workOrderHaptics.workOrderSelect;
        case 'success':
          return workOrderHaptics.statusChange;
        case 'error':
          return workOrderHaptics.workOrderError;
        case 'navigation':
          return navigationHaptics.pageChange;
        case 'button':
          return formHaptics.buttonPress;
        case 'submit':
          return formHaptics.submitSuccess;
        case 'statusChange':
          return workOrderHaptics.statusChange;
        case 'workOrderSelect':
          return workOrderHaptics.workOrderSelect;
        case 'startWorkOrder':
          return workOrderHaptics.startWorkOrder;
        case 'completeWorkOrder':
          return workOrderHaptics.completeWorkOrder;
        default:
          return formHaptics.buttonPress;
      }
    };

    const handleClick = (event: any) => {
      if (!disabled) {
        // Provide haptic feedback
        const hapticFunction = getHapticFunction(hapticType);
        hapticFunction();
      }

      // Call original onClick if provided
      if (onClick) {
        onClick(event);
      }
    };

    return (
      <WrappedComponent
        {...(restProps as P)}
        ref={ref}
        onClick={handleClick}
        disabled={disabled}
      />
    );
  });
}

/**
 * Hook for adding haptic feedback to custom event handlers
 */
export function useHapticCallback<T extends (...args: any[]) => any>(
  callback: T,
  hapticType: HapticFeedbackType = 'selection',
  disabled: boolean = false
): T {
  return React.useCallback(
    ((...args: Parameters<T>) => {
      if (!disabled) {
        const getHapticFunction = (type: HapticFeedbackType) => {
          switch (type) {
            case 'selection':
              return workOrderHaptics.workOrderSelect;
            case 'success':
              return workOrderHaptics.statusChange;
            case 'error':
              return workOrderHaptics.workOrderError;
            case 'navigation':
              return navigationHaptics.pageChange;
            case 'button':
              return formHaptics.buttonPress;
            case 'submit':
              return formHaptics.submitSuccess;
            case 'statusChange':
              return workOrderHaptics.statusChange;
            case 'workOrderSelect':
              return workOrderHaptics.workOrderSelect;
            case 'startWorkOrder':
              return workOrderHaptics.startWorkOrder;
            case 'completeWorkOrder':
              return workOrderHaptics.completeWorkOrder;
            default:
              return formHaptics.buttonPress;
          }
        };

        const hapticFunction = getHapticFunction(hapticType);
        hapticFunction();
      }

      return callback(...args);
    }) as T,
    [callback, hapticType, disabled]
  );
}

/**
 * Utility function to add haptic feedback to any function
 */
export function addHapticFeedback<T extends (...args: any[]) => any>(
  fn: T,
  hapticType: HapticFeedbackType = 'selection'
): T {
  return ((...args: Parameters<T>) => {
    const getHapticFunction = (type: HapticFeedbackType) => {
      switch (type) {
        case 'selection':
          return workOrderHaptics.workOrderSelect;
        case 'success':
          return workOrderHaptics.statusChange;
        case 'error':
          return workOrderHaptics.workOrderError;
        case 'navigation':
          return navigationHaptics.pageChange;
        case 'button':
          return formHaptics.buttonPress;
        case 'submit':
          return formHaptics.submitSuccess;
        case 'statusChange':
          return workOrderHaptics.statusChange;
        case 'workOrderSelect':
          return workOrderHaptics.workOrderSelect;
        case 'startWorkOrder':
          return workOrderHaptics.startWorkOrder;
        case 'completeWorkOrder':
          return workOrderHaptics.completeWorkOrder;
        default:
          return formHaptics.buttonPress;
      }
    };

    const hapticFunction = getHapticFunction(hapticType);
    hapticFunction();
    
    return fn(...args);
  }) as T;
}