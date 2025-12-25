import NetInfo, {NetInfoState} from '@react-native-community/netinfo';
import {apiClient} from './apiClient';

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: string;
  isWifiEnabled: boolean;
  isCellularEnabled: boolean;
}

class NetworkService {
  private listeners: Array<(status: NetworkStatus) => void> = [];
  private currentStatus: NetworkStatus = {
    isConnected: false,
    isInternetReachable: false,
    type: 'unknown',
    isWifiEnabled: false,
    isCellularEnabled: false,
  };

  constructor() {
    this.initialize();
  }

  /**
   * Initialize network monitoring
   */
  private initialize() {
    NetInfo.addEventListener(this.handleNetworkChange);
    
    // Get initial network state
    NetInfo.fetch().then(this.handleNetworkChange);
  }

  /**
   * Handle network state changes
   */
  private handleNetworkChange = (state: NetInfoState) => {
    const newStatus: NetworkStatus = {
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable ?? false,
      type: state.type,
      isWifiEnabled: state.type === 'wifi' && (state.isConnected ?? false),
      isCellularEnabled: state.type === 'cellular' && (state.isConnected ?? false),
    };

    const statusChanged = JSON.stringify(newStatus) !== JSON.stringify(this.currentStatus);
    
    if (statusChanged) {
      this.currentStatus = newStatus;
      this.notifyListeners(newStatus);
    }
  };

  /**
   * Get current network status
   */
  getStatus(): NetworkStatus {
    return this.currentStatus;
  }

  /**
   * Check if device is online
   */
  isOnline(): boolean {
    return this.currentStatus.isConnected && this.currentStatus.isInternetReachable;
  }

  /**
   * Check if device is offline
   */
  isOffline(): boolean {
    return !this.isOnline();
  }

  /**
   * Add network status listener
   */
  addListener(callback: (status: NetworkStatus) => void): () => void {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify all listeners of status change
   */
  private notifyListeners(status: NetworkStatus) {
    this.listeners.forEach(callback => {
      try {
        callback(status);
      } catch (error) {
        console.error('Error in network status listener:', error);
      }
    });
  }

  /**
   * Test internet connectivity by making a request to the API
   */
  async testConnectivity(): Promise<boolean> {
    try {
      const isHealthy = await apiClient.healthCheck();
      return isHealthy;
    } catch (error) {
      console.warn('Connectivity test failed:', error);
      return false;
    }
  }

  /**
   * Wait for network connection
   */
  async waitForConnection(timeout: number = 30000): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.isOnline()) {
        resolve(true);
        return;
      }

      const timeoutId = setTimeout(() => {
        unsubscribe();
        resolve(false);
      }, timeout);

      const unsubscribe = this.addListener((status) => {
        if (status.isConnected && status.isInternetReachable) {
          clearTimeout(timeoutId);
          unsubscribe();
          resolve(true);
        }
      });
    });
  }

  /**
   * Get network type description
   */
  getNetworkTypeDescription(): string {
    const {type, isConnected} = this.currentStatus;
    
    if (!isConnected) {
      return 'No connection';
    }

    switch (type) {
      case 'wifi':
        return 'Wi-Fi';
      case 'cellular':
        return 'Mobile data';
      case 'ethernet':
        return 'Ethernet';
      case 'bluetooth':
        return 'Bluetooth';
      default:
        return 'Connected';
    }
  }

  /**
   * Get connection quality estimate
   */
  getConnectionQuality(): 'excellent' | 'good' | 'fair' | 'poor' | 'offline' {
    if (!this.isOnline()) {
      return 'offline';
    }

    const {type} = this.currentStatus;
    
    switch (type) {
      case 'wifi':
      case 'ethernet':
        return 'excellent';
      case 'cellular':
        // Could be enhanced with actual speed testing
        return 'good';
      default:
        return 'fair';
    }
  }

  /**
   * Check if connection is suitable for large operations (uploads, sync)
   */
  isSuitableForLargeOperations(): boolean {
    const quality = this.getConnectionQuality();
    return ['excellent', 'good'].includes(quality);
  }
}

export const networkService = new NetworkService();