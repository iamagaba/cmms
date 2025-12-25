import React, { useRef, useEffect, useCallback, RefObject } from 'react';
import { navigationHaptics } from '../utils/haptic';

export interface SwipeGestureOptions {
  threshold?: number; // Minimum distance in pixels to trigger swipe
  velocityThreshold?: number; // Minimum velocity to trigger swipe
  maxVerticalDistance?: number; // Maximum vertical movement allowed
  preventScroll?: boolean; // Whether to prevent scroll during swipe
}

export interface SwipeGestureCallbacks {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeStart?: (direction: 'left' | 'right' | null) => void;
  onSwipeProgress?: (progress: number, direction: 'left' | 'right' | null) => void;
  onSwipeEnd?: () => void;
}

interface TouchData {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  startTime: number;
  isActive: boolean;
}

const DEFAULT_OPTIONS: Required<SwipeGestureOptions> = {
  threshold: 80,
  velocityThreshold: 0.3,
  maxVerticalDistance: 100,
  preventScroll: true
};

/**
 * Custom hook for handling swipe gestures on mobile devices
 * Provides visual feedback and haptic feedback during swipe interactions
 */
export function useSwipeGesture(
  elementRef: RefObject<HTMLDivElement | null>,
  callbacks: SwipeGestureCallbacks,
  options: SwipeGestureOptions = {}
): {
  isSwipeActive: boolean;
  swipeProgress: number;
  swipeDirection: 'left' | 'right' | null;
} {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const touchDataRef = useRef<TouchData>({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    startTime: 0,
    isActive: false
  });

  const isSwipeActiveRef = useRef(false);
  const swipeProgressRef = useRef(0);
  const swipeDirectionRef = useRef<'left' | 'right' | null>(null);

  const resetSwipeState = useCallback(() => {
    touchDataRef.current.isActive = false;
    isSwipeActiveRef.current = false;
    swipeProgressRef.current = 0;
    swipeDirectionRef.current = null;
  }, []);

  const calculateSwipeData = useCallback((currentX: number, currentY: number) => {
    const touchData = touchDataRef.current;
    const deltaX = currentX - touchData.startX;
    const deltaY = Math.abs(currentY - touchData.startY);
    const distance = Math.abs(deltaX);
    
    // Check if vertical movement is within acceptable range
    if (deltaY > opts.maxVerticalDistance) {
      return null;
    }

    // Determine direction
    const direction: 'left' | 'right' | null = deltaX > 0 ? 'right' : deltaX < 0 ? 'left' : null;
    
    // Calculate progress (0 to 1)
    const progress = Math.min(distance / opts.threshold, 1);

    return {
      deltaX,
      deltaY,
      distance,
      direction,
      progress
    };
  }, [opts.maxVerticalDistance, opts.threshold]);

  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (event.touches.length !== 1) return;

    const touch = event.touches[0];
    touchDataRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      startTime: Date.now(),
      isActive: true
    };

    // Prevent scroll if option is enabled
    if (opts.preventScroll) {
      event.preventDefault();
    }
  }, [opts.preventScroll]);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (!touchDataRef.current.isActive || event.touches.length !== 1) return;

    const touch = event.touches[0];
    touchDataRef.current.currentX = touch.clientX;
    touchDataRef.current.currentY = touch.clientY;

    const swipeData = calculateSwipeData(touch.clientX, touch.clientY);
    
    if (!swipeData) {
      // Invalid swipe (too much vertical movement)
      resetSwipeState();
      callbacks.onSwipeEnd?.();
      return;
    }

    const { direction, progress } = swipeData;

    // Update state
    isSwipeActiveRef.current = progress > 0.1; // Start showing feedback at 10% progress
    swipeProgressRef.current = progress;
    swipeDirectionRef.current = direction;

    // Trigger callbacks
    if (!isSwipeActiveRef.current && progress > 0.1) {
      callbacks.onSwipeStart?.(direction);
      navigationHaptics.swipeGesture(); // Haptic feedback when swipe starts
    }

    if (isSwipeActiveRef.current) {
      callbacks.onSwipeProgress?.(progress, direction);
    }

    // Prevent scroll during active swipe
    if (opts.preventScroll && isSwipeActiveRef.current) {
      event.preventDefault();
    }
  }, [calculateSwipeData, resetSwipeState, callbacks, opts.preventScroll]);

  const handleTouchEnd = useCallback((event: TouchEvent) => {
    if (!touchDataRef.current.isActive) return;

    const touchData = touchDataRef.current;
    const endTime = Date.now();
    const duration = endTime - touchData.startTime;
    
    const swipeData = calculateSwipeData(touchData.currentX, touchData.currentY);
    
    if (swipeData) {
      const { deltaX, distance, direction } = swipeData;
      const velocity = distance / duration; // pixels per millisecond

      // Check if swipe meets threshold requirements
      const meetsDistanceThreshold = distance >= opts.threshold;
      const meetsVelocityThreshold = velocity >= opts.velocityThreshold;

      if ((meetsDistanceThreshold || meetsVelocityThreshold) && direction) {
        // Successful swipe
        if (direction === 'left' && callbacks.onSwipeLeft) {
          callbacks.onSwipeLeft();
        } else if (direction === 'right' && callbacks.onSwipeRight) {
          callbacks.onSwipeRight();
        }
      }
    }

    // Reset state and trigger end callback
    resetSwipeState();
    callbacks.onSwipeEnd?.();
  }, [calculateSwipeData, resetSwipeState, callbacks, opts.threshold, opts.velocityThreshold]);

  const handleTouchCancel = useCallback(() => {
    resetSwipeState();
    callbacks.onSwipeEnd?.();
  }, [resetSwipeState, callbacks]);

  // Set up event listeners
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Add touch event listeners with passive: false to allow preventDefault
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    element.addEventListener('touchcancel', handleTouchCancel, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchCancel);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, handleTouchCancel]);

  return {
    isSwipeActive: isSwipeActiveRef.current,
    swipeProgress: swipeProgressRef.current,
    swipeDirection: swipeDirectionRef.current
  };
}

/**
 * Higher-order component wrapper for adding swipe gestures to any element
 */
export function withSwipeGesture<T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  swipeCallbacks: SwipeGestureCallbacks,
  swipeOptions?: SwipeGestureOptions
) {
  return function SwipeGestureWrapper(props: T) {
    const elementRef = useRef<HTMLDivElement>(null);
    const { isSwipeActive, swipeProgress, swipeDirection } = useSwipeGesture(
      elementRef,
      swipeCallbacks,
      swipeOptions
    );

    return React.createElement(
      'div',
      {
        ref: elementRef,
        style: {
          position: 'relative',
          touchAction: swipeOptions?.preventScroll ? 'pan-y' : 'auto'
        }
      },
      React.createElement(Component, {
        ...props,
        swipeState: {
          isSwipeActive,
          swipeProgress,
          swipeDirection
        }
      })
    );
  };
}

/**
 * Utility function to create swipe gesture handlers for work order cards
 */
export function createWorkOrderSwipeHandlers(
  workOrderId: string,
  onStart: (id: string) => void,
  onComplete: (id: string) => void
): SwipeGestureCallbacks {
  return {
    onSwipeRight: () => onStart(workOrderId),
    onSwipeLeft: () => onComplete(workOrderId),
    onSwipeStart: (direction) => {
      // Provide haptic feedback when swipe gesture starts
      navigationHaptics.swipeGesture();
    }
  };
}