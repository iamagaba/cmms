import { useState, useCallback, useRef, useEffect } from 'react';
import { navigationHaptics, workOrderHaptics } from '../utils/haptic';

export interface MultiSelectState<T = string> {
  selectedItems: Set<T>;
  isMultiSelectMode: boolean;
  selectionCount: number;
}

export interface MultiSelectActions<T = string> {
  toggleSelection: (item: T) => void;
  selectAll: (items: T[]) => void;
  clearSelection: () => void;
  enterMultiSelectMode: () => void;
  exitMultiSelectMode: () => void;
  isSelected: (item: T) => boolean;
}

export interface MultiSelectOptions {
  longPressDelay?: number; // Delay in ms for long press activation
  hapticFeedback?: boolean; // Whether to provide haptic feedback
  maxSelections?: number; // Maximum number of items that can be selected
}

const DEFAULT_OPTIONS: Required<MultiSelectOptions> = {
  longPressDelay: 500,
  hapticFeedback: true,
  maxSelections: 50
};

/**
 * Custom hook for managing multi-selection state and interactions
 * Supports long-press activation and provides haptic feedback
 */
export function useMultiSelect<T = string>(
  options: MultiSelectOptions = {}
): MultiSelectState<T> & MultiSelectActions<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const [selectedItems, setSelectedItems] = useState<Set<T>>(new Set());
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);

  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressActiveRef = useRef(false);

  // Clear long press timer on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  const toggleSelection = useCallback((item: T) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);

      if (newSet.has(item)) {
        newSet.delete(item);
        if (opts.hapticFeedback) {
          workOrderHaptics.workOrderSelect();
        }
      } else {
        // Check max selections limit
        if (newSet.size >= opts.maxSelections) {
          if (opts.hapticFeedback) {
            workOrderHaptics.workOrderError();
          }
          return prev; // Don't add if at max limit
        }

        newSet.add(item);
        if (opts.hapticFeedback) {
          workOrderHaptics.workOrderSelect();
        }
      }

      return newSet;
    });
  }, [opts.hapticFeedback, opts.maxSelections]);

  const selectAll = useCallback((items: T[]) => {
    const itemsToSelect = items.slice(0, opts.maxSelections);
    setSelectedItems(new Set(itemsToSelect));

    if (opts.hapticFeedback) {
      workOrderHaptics.workOrderSelect();
    }
  }, [opts.maxSelections, opts.hapticFeedback]);

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());

    if (opts.hapticFeedback) {
      navigationHaptics.tabSelect();
    }
  }, [opts.hapticFeedback]);

  const enterMultiSelectMode = useCallback(() => {
    setIsMultiSelectMode(true);

    if (opts.hapticFeedback) {
      navigationHaptics.menuToggle();
    }
  }, [opts.hapticFeedback]);

  const exitMultiSelectMode = useCallback(() => {
    setIsMultiSelectMode(false);
    clearSelection();
  }, [clearSelection]);

  const isSelected = useCallback((item: T) => {
    return selectedItems.has(item);
  }, [selectedItems]);

  const selectionCount = selectedItems.size;

  return {
    // State
    selectedItems,
    isMultiSelectMode,
    selectionCount,

    // Actions
    toggleSelection,
    selectAll,
    clearSelection,
    enterMultiSelectMode,
    exitMultiSelectMode,
    isSelected
  };
}

/**
 * Hook for handling long-press gestures to activate multi-select mode
 */
export function useLongPress<T = string>(
  onLongPress: (item: T) => void,
  options: { delay?: number; hapticFeedback?: boolean } = {}
) {
  const { delay = 500, hapticFeedback = true } = options;

  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressActiveRef = useRef(false);
  const startPositionRef = useRef<{ x: number; y: number } | null>(null);

  const startLongPress = useCallback((item: T, clientX: number, clientY: number) => {
    isLongPressActiveRef.current = false;
    startPositionRef.current = { x: clientX, y: clientY };

    longPressTimerRef.current = setTimeout(() => {
      isLongPressActiveRef.current = true;

      if (hapticFeedback) {
        navigationHaptics.menuToggle();
      }

      onLongPress(item);
    }, delay);
  }, [onLongPress, delay, hapticFeedback]);

  const cancelLongPress = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    isLongPressActiveRef.current = false;
    startPositionRef.current = null;
  }, []);

  const checkMovement = useCallback((clientX: number, clientY: number) => {
    if (!startPositionRef.current) return false;

    const deltaX = Math.abs(clientX - startPositionRef.current.x);
    const deltaY = Math.abs(clientY - startPositionRef.current.y);
    const maxMovement = 10; // pixels

    if (deltaX > maxMovement || deltaY > maxMovement) {
      cancelLongPress();
      return true; // Movement detected, cancel long press
    }

    return false;
  }, [cancelLongPress]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  return {
    startLongPress,
    cancelLongPress,
    checkMovement,
    isLongPressActive: () => isLongPressActiveRef.current
  };
}

/**
 * Utility function to create long-press handlers for work order cards
 */
export function createLongPressHandlers<T>(
  item: T,
  onLongPress: (item: T) => void,
  onTap?: (item: T) => void,
  options?: { delay?: number; hapticFeedback?: boolean }
) {
  const { startLongPress, cancelLongPress, checkMovement } = useLongPress(onLongPress, options);

  return {
    onTouchStart: (event: React.TouchEvent) => {
      if (event.touches.length === 1) {
        const touch = event.touches[0];
        startLongPress(item, touch.clientX, touch.clientY);
      }
    },

    onTouchMove: (event: React.TouchEvent) => {
      if (event.touches.length === 1) {
        const touch = event.touches[0];
        checkMovement(touch.clientX, touch.clientY);
      }
    },

    onTouchEnd: (event: React.TouchEvent) => {
      const wasLongPress = cancelLongPress();

      // If it wasn't a long press and we have a tap handler, call it
      if (!wasLongPress && onTap) {
        onTap(item);
      }
    },

    onTouchCancel: () => {
      cancelLongPress();
    },

    // Mouse events for desktop testing
    onMouseDown: (event: React.MouseEvent) => {
      startLongPress(item, event.clientX, event.clientY);
    },

    onMouseMove: (event: React.MouseEvent) => {
      checkMovement(event.clientX, event.clientY);
    },

    onMouseUp: () => {
      const wasLongPress = cancelLongPress();

      if (!wasLongPress && onTap) {
        onTap(item);
      }
    },

    onMouseLeave: () => {
      cancelLongPress();
    }
  };
}

/**
 * Component wrapper that adds multi-select capabilities to any list component
 */
export interface MultiSelectWrapperProps<T> {
  items: T[];
  children: (props: {
    multiSelectState: MultiSelectState<T> & MultiSelectActions<T>;
    getLongPressHandlers: (item: T) => Record<string, any>;
  }) => React.ReactNode;
  onSelectionChange?: (selectedItems: Set<T>) => void;
  multiSelectOptions?: MultiSelectOptions;
}

export function MultiSelectWrapper<T>({
  items,
  children,
  onSelectionChange,
  multiSelectOptions
}: MultiSelectWrapperProps<T>) {
  const multiSelectState = useMultiSelect<T>(multiSelectOptions);

  // Notify parent of selection changes
  useEffect(() => {
    onSelectionChange?.(multiSelectState.selectedItems);
  }, [multiSelectState.selectedItems, onSelectionChange]);

  const handleLongPress = useCallback((item: T) => {
    if (!multiSelectState.isMultiSelectMode) {
      multiSelectState.enterMultiSelectMode();
    }
    multiSelectState.toggleSelection(item);
  }, [multiSelectState]);

  const handleTap = useCallback((item: T) => {
    if (multiSelectState.isMultiSelectMode) {
      multiSelectState.toggleSelection(item);
    }
  }, [multiSelectState]);

  const getLongPressHandlers = useCallback((item: T) => {
    return createLongPressHandlers(
      item,
      handleLongPress,
      handleTap,
      { delay: multiSelectOptions?.longPressDelay }
    );
  }, [handleLongPress, handleTap, multiSelectOptions?.longPressDelay]);

  return (
    <>
    {
      children({
        multiSelectState,
        getLongPressHandlers
      })
    }
    </>
  );
}
