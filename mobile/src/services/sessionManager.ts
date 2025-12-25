import {AppState, AppStateStatus} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {authService} from './auth';
import {STORAGE_KEYS} from '@/utils/constants';

export interface SessionConfig {
  inactivityTimeout: number; // milliseconds
  warningTimeout: number; // milliseconds before showing warning
  backgroundTimeout: number; // milliseconds in background before logout
}

const DEFAULT_CONFIG: SessionConfig = {
  inactivityTimeout: 15 * 60 * 1000, // 15 minutes
  warningTimeout: 13 * 60 * 1000, // 13 minutes (2 minutes before logout)
  backgroundTimeout: 5 * 60 * 1000, // 5 minutes in background
};

class SessionManager {
  private inactivityTimer: NodeJS.Timeout | null = null;
  private warningTimer: NodeJS.Timeout | null = null;
  private backgroundTimer: NodeJS.Timeout | null = null;
  private lastActivityTime: number = Date.now();
  private backgroundTime: number | null = null;
  private isActive: boolean = true;
  private config: SessionConfig = DEFAULT_CONFIG;
  private listeners: Set<(event: SessionEvent) => void> = new Set();

  constructor() {
    this.setupAppStateListener();
    this.startInactivityTimer();
  }

  /**
   * Initialize session management
   */
  async initialize(): Promise<void> {
    try {
      // Load custom configuration if exists
      const savedConfig = await AsyncStorage.getItem(STORAGE_KEYS.SESSION_CONFIG);
      if (savedConfig) {
        this.config = {...DEFAULT_CONFIG, ...JSON.parse(savedConfig)};
      }

      // Reset activity tracking
      this.updateActivity();
    } catch (error) {
      console.warn('Failed to initialize session manager:', error);
    }
  }

  /**
   * Update last activity time and reset timers
   */
  updateActivity(): void {
    this.lastActivityTime = Date.now();
    this.resetTimers();
  }

  /**
   * Set session configuration
   */
  async setConfig(config: Partial<SessionConfig>): Promise<void> {
    this.config = {...this.config, ...config};
    
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.SESSION_CONFIG,
        JSON.stringify(this.config)
      );
    } catch (error) {
      console.warn('Failed to save session config:', error);
    }

    // Restart timers with new config
    this.resetTimers();
  }

  /**
   * Get current session configuration
   */
  getConfig(): SessionConfig {
    return {...this.config};
  }

  /**
   * Add event listener
   */
  addEventListener(listener: (event: SessionEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Manually trigger session warning
   */
  showSessionWarning(): void {
    this.emitEvent({
      type: 'session_warning',
      timeRemaining: this.getTimeUntilLogout(),
    });
  }

  /**
   * Extend session (reset timers)
   */
  extendSession(): void {
    this.updateActivity();
    this.emitEvent({type: 'session_extended'});
  }

  /**
   * Manually logout due to inactivity
   */
  async logoutDueToInactivity(): Promise<void> {
    try {
      this.emitEvent({type: 'session_expired'});
      await authService.signOut();
    } catch (error) {
      console.error('Error during inactivity logout:', error);
    }
  }

  /**
   * Get time remaining until automatic logout
   */
  getTimeUntilLogout(): number {
    const elapsed = Date.now() - this.lastActivityTime;
    return Math.max(0, this.config.inactivityTimeout - elapsed);
  }

  /**
   * Check if session is about to expire
   */
  isSessionNearExpiry(): boolean {
    const timeRemaining = this.getTimeUntilLogout();
    const warningThreshold = this.config.inactivityTimeout - this.config.warningTimeout;
    return timeRemaining <= warningThreshold;
  }

  /**
   * Pause session management (useful for certain screens)
   */
  pause(): void {
    this.clearTimers();
    this.isActive = false;
  }

  /**
   * Resume session management
   */
  resume(): void {
    this.isActive = true;
    this.updateActivity();
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.clearTimers();
    this.listeners.clear();
  }

  private setupAppStateListener(): void {
    AppState.addEventListener('change', this.handleAppStateChange);
  }

  private handleAppStateChange = (nextAppState: AppStateStatus): void => {
    if (nextAppState === 'background' || nextAppState === 'inactive') {
      this.backgroundTime = Date.now();
      this.clearTimers();
      this.startBackgroundTimer();
    } else if (nextAppState === 'active') {
      this.clearBackgroundTimer();
      
      if (this.backgroundTime) {
        const backgroundDuration = Date.now() - this.backgroundTime;
        
        if (backgroundDuration > this.config.backgroundTimeout) {
          // Auto-logout due to background timeout
          this.logoutDueToInactivity();
          return;
        }
      }
      
      this.backgroundTime = null;
      this.updateActivity();
    }
  };

  private startInactivityTimer(): void {
    if (!this.isActive) return;

    this.clearTimers();

    // Warning timer
    this.warningTimer = setTimeout(() => {
      this.showSessionWarning();
    }, this.config.warningTimeout);

    // Logout timer
    this.inactivityTimer = setTimeout(() => {
      this.logoutDueToInactivity();
    }, this.config.inactivityTimeout);
  }

  private startBackgroundTimer(): void {
    this.backgroundTimer = setTimeout(() => {
      this.logoutDueToInactivity();
    }, this.config.backgroundTimeout);
  }

  private resetTimers(): void {
    if (!this.isActive) return;
    this.clearTimers();
    this.startInactivityTimer();
  }

  private clearTimers(): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
    
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }
  }

  private clearBackgroundTimer(): void {
    if (this.backgroundTimer) {
      clearTimeout(this.backgroundTimer);
      this.backgroundTimer = null;
    }
  }

  private emitEvent(event: SessionEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Session event listener error:', error);
      }
    });
  }
}

export interface SessionEvent {
  type: 'session_warning' | 'session_expired' | 'session_extended';
  timeRemaining?: number;
}

// Add session config to storage keys
declare module '@/utils/constants' {
  interface StorageKeys {
    SESSION_CONFIG: 'session_config';
  }
}

export const sessionManager = new SessionManager();