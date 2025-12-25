import {useState, useCallback} from 'react';
import {Alert} from 'react-native';
import {qrScannerService, QRScanResult} from '@/services/qrScannerService';
import {assetService} from '@/services/assetService';
import {inventoryService} from '@/services/inventoryService';
import {Vehicle, MobileInventoryItem} from '@/types';

export interface QRScannerState {
  isScanning: boolean;
  hasPermission: boolean | null;
  isLoading: boolean;
  error: string | null;
}

export interface QRScannerActions {
  requestPermission: () => Promise<boolean>;
  handleQRScan: (result: QRScanResult) => Promise<void>;
  resetScanner: () => void;
  setScanning: (scanning: boolean) => void;
}

export interface UseQRScannerOptions {
  onAssetFound?: (asset: Vehicle) => void;
  onAssetNotFound?: (qrData: string) => void;
  onPartFound?: (part: MobileInventoryItem) => void;
  onPartNotFound?: (qrData: string) => void;
  onError?: (error: string) => void;
  autoNavigate?: boolean;
}

export const useQRScanner = (options: UseQRScannerOptions = {}) => {
  const [state, setState] = useState<QRScannerState>({
    isScanning: false,
    hasPermission: null,
    isLoading: false,
    error: null,
  });

  const updateState = useCallback((updates: Partial<QRScannerState>) => {
    setState(prev => ({...prev, ...updates}));
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      updateState({isLoading: true, error: null});
      
      const hasPermission = await qrScannerService.requestCameraPermission();
      updateState({hasPermission, isLoading: false});
      
      return hasPermission;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to request camera permission';
      updateState({
        hasPermission: false,
        isLoading: false,
        error: errorMessage,
      });
      options.onError?.(errorMessage);
      return false;
    }
  }, [options, updateState]);

  const handleQRScan = useCallback(async (result: QRScanResult) => {
    try {
      updateState({isLoading: true, error: null});
      
      // Parse the QR code data
      const parsed = qrScannerService.parseQRCode(result.data);
      
      if (parsed.type === 'asset') {
        // Search for the asset
        const asset = await assetService.searchAssetByCode(parsed.id);
        
        if (asset) {
          options.onAssetFound?.(asset);
        } else {
          options.onAssetNotFound?.(result.data);
          
          // Show alert for asset not found
          Alert.alert(
            'Asset Not Found',
            `No asset found with code: ${parsed.id}`,
            [
              {text: 'Try Again', style: 'default'},
              {
                text: 'Manual Entry',
                onPress: () => {
                  // TODO: Implement manual entry
                  console.log('Manual entry for asset:', parsed.id);
                },
              },
            ]
          );
        }
      } else if (parsed.type === 'part') {
        // Search for the part by SKU
        const part = await inventoryService.searchBySku(parsed.id);
        
        if (part) {
          options.onPartFound?.(part);
        } else {
          options.onPartNotFound?.(result.data);
          
          // Show alert for part not found
          Alert.alert(
            'Part Not Found',
            `No part found with SKU: ${parsed.id}`,
            [
              {text: 'Try Again', style: 'default'},
              {
                text: 'Manual Search',
                onPress: () => {
                  // The calling component can handle manual search
                  console.log('Manual search for part:', parsed.id);
                },
              },
            ]
          );
        }
      } else {
        // Unknown QR code format
        Alert.alert(
          'Unknown QR Code',
          `Scanned code: ${result.data}\n\nThis doesn't appear to be a valid asset or part code.`,
          [
            {text: 'Try Again', style: 'default'},
            {
              text: 'Manual Search',
              onPress: () => {
                // TODO: Implement manual search
                console.log('Manual search for:', result.data);
              },
            },
          ]
        );
      }
      
      updateState({isLoading: false, isScanning: false});
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process QR code';
      updateState({
        isLoading: false,
        error: errorMessage,
        isScanning: false,
      });
      options.onError?.(errorMessage);
      
      Alert.alert(
        'Scan Error',
        errorMessage,
        [{text: 'Try Again'}]
      );
    }
  }, [options, updateState]);

  const resetScanner = useCallback(() => {
    updateState({
      isScanning: false,
      isLoading: false,
      error: null,
    });
  }, [updateState]);

  const setScanning = useCallback((scanning: boolean) => {
    updateState({isScanning: scanning});
  }, [updateState]);

  return {
    ...state,
    requestPermission,
    handleQRScan,
    resetScanner,
    setScanning,
  };
};