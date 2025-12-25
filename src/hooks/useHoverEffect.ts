import { useState, useCallback, useRef, useEffect } from 'react';

interface UseHoverEffectOptions {
  /**
   * Delay before hover state activates (ms)
   */
  enterDelay?: number;
  
  /**
   * Delay before hover state deactivates (ms)
   */
  leaveDelay?: number;
  
  /**
   * Callback when hover starts
   */
  onHoverStart?: () => void;
  
  /**
   * Callback when hover ends
   */
  onHoverEnd?: () => void;
}

/**
 * Hook for managing hover state with delays and callbacks
 * 
 * @example
 * const { isHovered, hoverProps } = useHoverEffect({
 *   enterDelay: 200,
 *   onHoverStart: () => console.log('Hover started')
 * });
 * 
 * return <div {...hoverProps}>Hover me</div>;
 */
export function useHoverEffect(options: UseHoverEffectOptions = {}) {
  const {
    enterDelay = 0,
    leaveDelay = 0,
    onHoverStart,
    onHoverEnd,
  } = options;

  const [isHovered, setIsHovered] = useState(false);
  const enterTimeoutRef = useRef<NodeJS.Timeout>();
  const leaveTimeoutRef = useRef<NodeJS.Timeout>();

  const handleMouseEnter = useCallback(() => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
    }

    if (enterDelay > 0) {
      enterTimeoutRef.current = setTimeout(() => {
        setIsHovered(true);
        onHoverStart?.();
      }, enterDelay);
    } else {
      setIsHovered(true);
      onHoverStart?.();
    }
  }, [enterDelay, onHoverStart]);

  const handleMouseLeave = useCallback(() => {
    if (enterTimeoutRef.current) {
      clearTimeout(enterTimeoutRef.current);
    }

    if (leaveDelay > 0) {
      leaveTimeoutRef.current = setTimeout(() => {
        setIsHovered(false);
        onHoverEnd?.();
      }, leaveDelay);
    } else {
      setIsHovered(false);
      onHoverEnd?.();
    }
  }, [leaveDelay, onHoverEnd]);

  useEffect(() => {
    return () => {
      if (enterTimeoutRef.current) {
        clearTimeout(enterTimeoutRef.current);
      }
      if (leaveTimeoutRef.current) {
        clearTimeout(leaveTimeoutRef.current);
      }
    };
  }, []);

  return {
    isHovered,
    hoverProps: {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    },
  };
}

export default useHoverEffect;
