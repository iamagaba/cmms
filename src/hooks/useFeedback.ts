import { useState, useCallback, useRef, useEffect } from 'react';

type FeedbackType = 'success' | 'error' | 'warning' | 'info' | null;

interface UseFeedbackOptions {
  /**
   * Duration to show feedback (ms)
   */
  duration?: number;
  
  /**
   * Callback when feedback is shown
   */
  onShow?: (type: FeedbackType) => void;
  
  /**
   * Callback when feedback is hidden
   */
  onHide?: () => void;
}

/**
 * Hook for managing visual feedback states (success, error, etc.)
 * 
 * @example
 * const { feedbackType, showSuccess, showError, feedbackClass } = useFeedback();
 * 
 * const handleSubmit = async () => {
 *   try {
 *     await api.submit();
 *     showSuccess();
 *   } catch (error) {
 *     showError();
 *   }
 * };
 * 
 * return <button className={feedbackClass}>Submit</button>;
 */
export function useFeedback(options: UseFeedbackOptions = {}) {
  const { duration = 2000, onShow, onHide } = options;

  const [feedbackType, setFeedbackType] = useState<FeedbackType>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const showFeedback = useCallback(
    (type: FeedbackType) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setFeedbackType(type);
      onShow?.(type);

      if (duration > 0) {
        timeoutRef.current = setTimeout(() => {
          setFeedbackType(null);
          onHide?.();
        }, duration);
      }
    },
    [duration, onShow, onHide]
  );

  const showSuccess = useCallback(() => showFeedback('success'), [showFeedback]);
  const showError = useCallback(() => showFeedback('error'), [showFeedback]);
  const showWarning = useCallback(() => showFeedback('warning'), [showFeedback]);
  const showInfo = useCallback(() => showFeedback('info'), [showFeedback]);
  const hideFeedback = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setFeedbackType(null);
    onHide?.();
  }, [onHide]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Generate CSS class based on feedback type
  const feedbackClass = feedbackType ? `feedback-${feedbackType}` : '';

  return {
    feedbackType,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideFeedback,
    feedbackClass,
    hasFeedback: feedbackType !== null,
  };
}

export default useFeedback;
