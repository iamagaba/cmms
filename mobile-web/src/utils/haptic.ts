/**
 * Haptic Feedback Utility
 * Provides tactile feedback for mobile interactions
 */

export type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning' | 'selection'

interface HapticConfig {
  pattern: number[]
  fallback?: () => void
}

const hapticPatterns: Record<HapticPattern, HapticConfig> = {
  light: {
    pattern: [10],
    fallback: () => console.log('🔸 Light haptic feedback')
  },
  medium: {
    pattern: [50],
    fallback: () => console.log('🔹 Medium haptic feedback')
  },
  heavy: {
    pattern: [100],
    fallback: () => console.log('🔶 Heavy haptic feedback')
  },
  success: {
    pattern: [50, 50, 100],
    fallback: () => console.log('✅ Success haptic feedback')
  },
  error: {
    pattern: [100, 50, 100, 50, 100],
    fallback: () => console.log('❌ Error haptic feedback')
  },
  warning: {
    pattern: [75, 25, 75],
    fallback: () => console.log('⚠️ Warning haptic feedback')
  },
  selection: {
    pattern: [25],
    fallback: () => console.log('👆 Selection haptic feedback')
  }
}

class HapticFeedback {
  private isSupported: boolean = false
  private isEnabled: boolean = true

  constructor() {
    this.checkSupport()
  }

  private checkSupport(): void {
    // Check for Vibration API support
    this.isSupported = 'vibrate' in navigator && typeof navigator.vibrate === 'function'
    
    // Additional checks for mobile devices
    if (this.isSupported) {
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
      this.isSupported = isMobile
    }
  }

  /**
   * Enable or disable haptic feedback
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled
  }

  /**
   * Check if haptic feedback is available and enabled
   */
  isAvailable(): boolean {
    return this.isSupported && this.isEnabled
  }

  /**
   * Trigger haptic feedback with specified pattern
   */
  trigger(pattern: HapticPattern): void {
    if (!this.isEnabled) return

    const config = hapticPatterns[pattern]
    
    if (this.isSupported) {
      try {
        navigator.vibrate(config.pattern)
      } catch (error) {
        console.warn('Haptic feedback failed:', error)
        config.fallback?.()
      }
    } else {
      // Fallback for development/testing
      config.fallback?.()
    }
  }

  /**
   * Trigger custom vibration pattern
   */
  custom(pattern: number[]): void {
    if (!this.isEnabled || !this.isSupported) return

    try {
      navigator.vibrate(pattern)
    } catch (error) {
      console.warn('Custom haptic feedback failed:', error)
    }
  }

  /**
   * Stop any ongoing vibration
   */
  stop(): void {
    if (this.isSupported) {
      navigator.vibrate(0)
    }
  }

  // Convenience methods for common interactions
  tap(): void {
    this.trigger('light')
  }

  buttonPress(): void {
    this.trigger('medium')
  }

  longPress(): void {
    this.trigger('heavy')
  }

  success(): void {
    this.trigger('success')
  }

  error(): void {
    this.trigger('error')
  }

  warning(): void {
    this.trigger('warning')
  }

  select(): void {
    this.trigger('selection')
  }
}

// Export singleton instance
export const haptic = new HapticFeedback()

// React hook for haptic feedback
export function useHaptic() {
  return {
    haptic,
    isAvailable: haptic.isAvailable(),
    tap: () => haptic.tap(),
    buttonPress: () => haptic.buttonPress(),
    longPress: () => haptic.longPress(),
    success: () => haptic.success(),
    error: () => haptic.error(),
    warning: () => haptic.warning(),
    select: () => haptic.select(),
    trigger: (pattern: HapticPattern) => haptic.trigger(pattern),
    setEnabled: (enabled: boolean) => haptic.setEnabled(enabled)
  }
}