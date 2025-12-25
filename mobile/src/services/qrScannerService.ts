import {PermissionsAndroid, Platform, Alert} from 'react-native';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';

export interface QRScanResult {
  data: string;
  type: string;
  bounds?: {
    origin: {x: number; y: number};
    size: {width: number; height: number};
  };
}

export class QRScannerService {
  /**
   * Request camera permissions for QR code scanning
   */
  async requestCameraPermission(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        const permission = PERMISSIONS.ANDROID.CAMERA;
        const result = await check(permission);
        
        if (result === RESULTS.GRANTED) {
          return true;
        }
        
        if (result === RESULTS.DENIED) {
          const requestResult = await request(permission);
          return requestResult === RESULTS.GRANTED;
        }
        
        if (result === RESULTS.BLOCKED) {
          Alert.alert(
            'Camera Permission Required',
            'Please enable camera access in your device settings to scan QR codes.',
            [
              {text: 'Cancel', style: 'cancel'},
              {text: 'Open Settings', onPress: () => {
                // TODO: Open app settings
              }}
            ]
          );
          return false;
        }
        
        return false;
      } else {
        // iOS
        const permission = PERMISSIONS.IOS.CAMERA;
        const result = await check(permission);
        
        if (result === RESULTS.GRANTED) {
          return true;
        }
        
        if (result === RESULTS.DENIED) {
          const requestResult = await request(permission);
          return requestResult === RESULTS.GRANTED;
        }
        
        if (result === RESULTS.BLOCKED) {
          Alert.alert(
            'Camera Permission Required',
            'Please enable camera access in Settings > Privacy & Security > Camera to scan QR codes.',
            [
              {text: 'Cancel', style: 'cancel'},
              {text: 'Open Settings', onPress: () => {
                // TODO: Open app settings
              }}
            ]
          );
          return false;
        }
        
        return false;
      }
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      return false;
    }
  }

  /**
   * Parse QR code data to determine asset type and ID
   */
  parseQRCode(data: string): {type: 'asset' | 'part' | 'unknown'; id: string; originalData: string} {
    // Remove whitespace and convert to uppercase for consistent parsing
    const cleanData = data.trim().toUpperCase();
    
    // Asset QR codes might be in formats like:
    // - ASSET-12345
    // - VIN:1HGBH41JXMN109186
    // - VEHICLE-ID-12345
    // - Just the VIN directly
    
    if (cleanData.startsWith('ASSET-') || cleanData.startsWith('VEHICLE-')) {
      const id = cleanData.split('-').slice(1).join('-');
      return {type: 'asset', id, originalData: data};
    }
    
    if (cleanData.startsWith('VIN:')) {
      const id = cleanData.substring(4);
      return {type: 'asset', id, originalData: data};
    }
    
    // Check if it looks like a VIN (17 characters, alphanumeric)
    if (/^[A-HJ-NPR-Z0-9]{17}$/.test(cleanData)) {
      return {type: 'asset', id: cleanData, originalData: data};
    }
    
    // Part QR codes might be in formats like:
    // - PART-67890
    // - P-12345
    // - SKU:ABC123
    // - Just the SKU directly (if it matches common patterns)
    if (cleanData.startsWith('PART-') || cleanData.startsWith('P-')) {
      const id = cleanData.split('-').slice(1).join('-');
      return {type: 'part', id, originalData: data};
    }
    
    if (cleanData.startsWith('SKU:')) {
      const id = cleanData.substring(4);
      return {type: 'part', id, originalData: data};
    }
    
    // Check if it looks like a common SKU pattern (alphanumeric, 3-20 characters)
    if (/^[A-Z0-9]{3,20}$/.test(cleanData) && !(/^[A-HJ-NPR-Z0-9]{17}$/.test(cleanData))) {
      return {type: 'part', id: cleanData, originalData: data};
    }
    
    // If we can't determine the type, treat it as unknown but still return the data
    return {type: 'unknown', id: data, originalData: data};
  }

  /**
   * Validate QR code format
   */
  isValidQRCode(data: string): boolean {
    if (!data || data.trim().length === 0) {
      return false;
    }
    
    const parsed = this.parseQRCode(data);
    return parsed.type !== 'unknown' || parsed.id.length > 0;
  }

  /**
   * Format QR code data for display
   */
  formatQRCodeForDisplay(data: string): string {
    const parsed = this.parseQRCode(data);
    
    switch (parsed.type) {
      case 'asset':
        return `Asset: ${parsed.id}`;
      case 'part':
        return `Part: ${parsed.id}`;
      default:
        return `Code: ${parsed.id}`;
    }
  }
}

export const qrScannerService = new QRScannerService();