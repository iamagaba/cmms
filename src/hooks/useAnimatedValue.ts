import { useState, useEffect, useRef } from 'react';

interface UseAnimatedValueOptions {
  duration?: number;
  easing?: (t: number) => number;
  onComplete?: () => void;
}

/**
 * Hook for animating numeric values with easing
 * 
 * @example
 * const value = useAnimatedValue(1234, { duration: 1000 });
 * return <span>{Math.round(value)}</span>;
 */
export function useAnimatedValue(
  targetValue: number,
  options: UseAnimatedValueOptions = {}
): number {
  const {
    duration = 600,
    easing = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t, // easeInOutQuad
    onComplete,
  } = options;

  const [currentValue, setCurrentValue] = useState(0);
  const startValueRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number>();

  useEffect(() => {
    startValueRef.current = currentValue;
    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easing(progress);

      const newValue =
        startValueRef.current +
        (targetValue - startValueRef.current) * easedProgress;

      setCurrentValue(newValue);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        onComplete?.();
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [targetValue, duration, easing, onComplete]);

  return currentValue;
}

export default useAnimatedValue;
