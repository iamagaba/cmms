/**
 * Haptic feedback utility for mobile web applications
 * Provides consistent vibration patterns across different actions and devices
 */

export interface HapticCapabilities {
  isSupported: boolean;
  hasVibrationAPI: boolean;
  userPreference: 'enabled' | 'disabled' | 'reduced';
}

export interface HapticPatterns {
  light: () => void;
  medium: () => void;
  heavy: () => void;
  success: () => void;
  error: () => void;
  warning: () => void;
  selection: () => void;
  navigation: () => void;
  notification: () => void;
}

// Vibration patterns in milliseconds [vibrate, pause, vibrate, pause, ...]
const VIBRATION_PATTERNS = {
  light: [10],
  medium: [20],
  heavy: [30],
  success: [10, 50, 10, 50, 20],
  error: [50, 100, 50, 100, 50],
  warning: [20, 100, 20],
  selection: [5],
  navigation: [15],
  notification: [10, 50, 10]
} as const;

// Reduced motion patterns (shorter and less intense)
const REDUCED_PATTERNS = {
  light: [5],
  medium: [8],
  heavy: [12],
  success: [5, 25, 5],
  error: [20, 50, 20],
  warning: [10, 50, 10],
  selection: [3],
  navigation: [8],
  notification: [5, 25, 5]
} as const;

class HapticManager {
  private capabilities: HapticCapabilities;
  private isEnabled: boolean = true;

  constructor() {
    this.capabilities = this.detectCapabilities();
    this.loadUserPreferences();
  }

  /**
   * Detect device haptic capabilities
   */
  private detectCapabilities(): HapticCapabilities {
    const hasVibrationAPI = 'vibrate' in navigator;
    const isSupported = hasVibrationAPI && this.isVibrateSupported();
    
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const userPreference = prefersReducedMotion ? 'reduced' : 'enabled';

    return {
      isSupported,
      hasVibrationAPI,
      userPreference
    };
  }

  /**
   * Test if vibration API actually works (some browsers report support but don't vibrate)
   */
  private isVibrateSupported(): boolean {
    try {
      // Some browsers return false if vibration is not supported
      return navigator.vibrate && navigator.vibrate(0) !== false;
    } catch {
      return false;
    }
  }

  /**
   * Load user preferences from localStorage
   */
  private loadUserPreferences(): void {
    try {
      const stored = localStorage.getItem('haptic_preferences');
      if (stored) {
        const preferences = JSON.parse(stored);
        this.isEnabled = preferences.enabled !== false;
        
        // Override system preference if user has explicitly set it
        if (preferences.userPreference) {
          this.capabilities.userPreference = preferences.userPreference;
        }
      }
    } catch {
      // Silently fail if localStorage is not available
    }
  }

  /**
   * Save user preferences to localStorage
   */
  private saveUserPreferences(): void {
    try {
      const preferences = {
        enabled: this.isEnabled,
        userPreference: this.capabilities.userPreference
      };
      localStorage.setItem('haptic_preferences', JSON.stringify(preferences));
    } catch {
      // Silently fail if localStorage is not available
    }
  }

  /**
   * Enable or disable haptic feedback
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    this.saveUserPreferences();
  }

  /**
   * Set user preference for haptic intensity
   */
  public setUserPreference(preference: 'enabled' | 'disabled' | 'reduced'): void {
    this.capabilities.userPreference = preference;
    this.isEnabled = preference !== 'disabled';
    this.saveUserPreferences();
  }

  /**
   * Get current haptic capabilities
   */
  public getCapabilities(): HapticCapabilities {
    return { ...this.capabilities };
  }

  /**
   * Execute a vibration pattern
   */
  private vibrate(pattern: readonly number[]): void {
    // Check if haptic feedback should be executed
    if (!this.shouldVibrate()) {
      return;
    }

    try {
      // Use appropriate pattern based on user preference
      const patternToUse = this.capabilities.userPreference === 'reduced' 
        ? this.getReducedPattern(pattern)
        : pattern;

      navigator.vibrate(patternToUse);
    } catch {
      // Silently fail if vibration fails
    }
  }

  /**
   * Get reduced intensity pattern
   */
  private getReducedPattern(pattern: readonly number[]): number[] {
    return pattern.map(duration => Math.max(1, Math.floor(duration * 0.5)));
  }

  /**
   * Check if vibration should be executed
   */
  private shouldVibrate(): boolean {
    return (
      this.isEnabled &&
      this.capabilities.isSupported &&
      this.capabilities.userPreference !== 'disabled' &&
      document.visibilityState === 'visible' // Only vibrate when page is visible
    );
  }

  /**
   * Create haptic pattern functions
   */
  public createPatterns(): HapticPatterns {
    return {
      light: () => this.vibrate(VIBRATION_PATTERNS.light),
      medium: () => this.vibrate(VIBRATION_PATTERNS.medium),
      heavy: () => this.vibrate(VIBRATION_PATTERNS.heavy),
      success: () => this.vibrate(VIBRATION_PATTERNS.success),
      error: () => this.vibrate(VIBRATION_PATTERNS.error),
      warning: () => this.vibrate(VIBRATION_PATTERNS.warning),
      selection: () => this.vibrate(VIBRATION_PATTERNS.selection),
      navigation: () => this.vibrate(VIBRATION_PATTERNS.navigation),
      notification: () => this.vibrate(VIBRATION_PATTERNS.notification)
    };
  }
}

// Global haptic manager instance
const hapticManager = new HapticManager();

/**
 * Get haptic feedback patterns
 * @returns Object with haptic pattern functions
 */
export function useHapticFeedback(): HapticPatterns {
  return hapticManager.createPatterns();
}

/**
 * Get haptic capabilities and preferences
 * @returns Current haptic capabilities
 */
export function getHapticCapabilities(): HapticCapabilities {
  return hapticManager.getCapabilities();
}

/**
 * Enable or disable haptic feedback globally
 * @param enabled Whether haptic feedback should be enabled
 */
export function setHapticEnabled(enabled: boolean): void {
  hapticManager.setEnabled(enabled);
}

/**
 * Set user preference for haptic feedback intensity
 * @param preference User preference for haptic feedback
 */
export function setHapticPreference(preference: 'enabled' | 'disabled' | 'reduced'): void {
  hapticManager.setUserPreference(preference);
}

/**
 * Pre-defined haptic patterns for common actions
 * Can be used directly without the hook in non-React contexts
 */
export const hapticPatterns = hapticManager.createPatterns();

/**
 * Utility function to add haptic feedback to click handlers
 * @param callback Original click handler
 * @param pattern Haptic pattern to use (default: 'selection')
 * @returns Enhanced click handler with haptic feedback
 */
export function withHapticFeedback<T extends (...args: any[]) => any>(
  callback: T,
  pattern: keyof HapticPatterns = 'selection'
): T {
  return ((...args: Parameters<T>) => {
    hapticPatterns[pattern]();
    return callback(...args);
  }) as T;
}

/**
 * React hook for haptic feedback with component lifecycle awareness
 */
export function useHapticPatterns(): HapticPatterns & {
  isSupported: boolean;
  setEnabled: (enabled: boolean) => void;
  setPreference: (preference: 'enabled' | 'disabled' | 'reduced') => void;
} {
  const patterns = useHapticFeedback();
  const capabilities = getHapticCapabilities();

  return {
    ...patterns,
    isSupported: capabilities.isSupported,
    setEnabled: setHapticEnabled,
    setPreference: setHapticPreference
  };
}

/**
 * Haptic feedback for form interactions
 */
export const formHaptics = {
  /**
   * Haptic feedback for successful form submission
   */
  submitSuccess: () => hapticPatterns.success(),
  
  /**
   * Haptic feedback for form validation errors
   */
  validationError: () => hapticPatterns.error(),
  
  /**
   * Haptic feedback for field focus
   */
  fieldFocus: () => hapticPatterns.light(),
  
  /**
   * Haptic feedback for field input
   */
  fieldInput: () => hapticPatterns.selection(),
  
  /**
   * Haptic feedback for button press
   */
  buttonPress: () => hapticPatterns.medium()
};

/**
 * Haptic feedback for navigation actions
 */
export const navigationHaptics = {
  /**
   * Haptic feedback for page navigation
   */
  pageChange: () => hapticPatterns.navigation(),
  
  /**
   * Haptic feedback for tab selection
   */
  tabSelect: () => hapticPatterns.selection(),
  
  /**
   * Haptic feedback for menu open/close
   */
  menuToggle: () => hapticPatterns.light(),
  
  /**
   * Haptic feedback for swipe gestures
   */
  swipeGesture: () => hapticPatterns.medium(),
  
  /**
   * Haptic feedback for errors
   */
  error: () => hapticPatterns.error()
};

/**
 * Haptic feedback for work order specific actions
 */
export const workOrderHaptics = {
  /**
   * Haptic feedback for work order status change
   */
  statusChange: () => hapticPatterns.success(),
  
  /**
   * Haptic feedback for work order selection
   */
  workOrderSelect: () => hapticPatterns.selection(),
  
  /**
   * Haptic feedback for starting a work order
   */
  startWorkOrder: () => hapticPatterns.success(),
  
  /**
   * Haptic feedback for completing a work order
   */
  completeWorkOrder: () => hapticPatterns.success(),
  
  /**
   * Haptic feedback for work order error
   */
  workOrderError: () => hapticPatterns.error(),
  
  /**
   * Haptic feedback for urgent work order notification
   */
  urgentNotification: () => hapticPatterns.notification(),
  
  /**
   * Haptic feedback for work order update
   */
  workOrderUpdate: () => hapticPatterns.medium(),
  
  /**
   * Haptic feedback for work order completion
   */
  workOrderComplete: () => hapticPatterns.success()
};