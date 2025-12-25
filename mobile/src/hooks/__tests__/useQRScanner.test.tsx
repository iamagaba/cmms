import {renderHook, act} from '@testing-library/react-native';
import {Alert} from 'react-native';
import {useQRScanner} from '../useQRScanner';
import {qrScannerService} from '@/services/qrScannerService';
import {assetService} from '@/services/assetService';

// Mock dependencies
jest.mock('@/services/qrScannerService', () => ({
  qrScannerService: {
    requestCameraPermission: jest.fn(),
    parseQRCode: jest.fn(),
    isValidQRCode: jest.fn(),
    formatQRCodeForDisplay: jest.fn(),
  },
}));

jest.mock('@/services/assetService', () => ({
  assetService: {
    searchAssetByCode: jest.fn(),
  },
}));

jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

const mockQrScannerService = qrScannerService as jest.Mocked<typeof qrScannerService>;
const mockAssetService = assetService as jest.Mocked<typeof assetService>;
const mockAlert = Alert.alert as jest.MockedFunction<typeof Alert.alert>;

describe('useQRScanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const {result} = renderHook(() => useQRScanner());

    expect(result.current.isScanning).toBe(false);
    expect(result.current.hasPermission).toBe(null);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should request camera permission successfully', async () => {
    mockQrScannerService.requestCameraPermission.mockResolvedValue(true);

    const {result} = renderHook(() => useQRScanner());

    await act(async () => {
      const hasPermission = await result.current.requestPermission();
      expect(hasPermission).toBe(true);
    });

    expect(result.current.hasPermission).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle permission request failure', async () => {
    const errorMessage = 'Permission denied';
    mockQrScannerService.requestCameraPermission.mockRejectedValue(new Error(errorMessage));

    const onError = jest.fn();
    const {result} = renderHook(() => useQRScanner({onError}));

    await act(async () => {
      const hasPermission = await result.current.requestPermission();
      expect(hasPermission).toBe(false);
    });

    expect(result.current.hasPermission).toBe(false);
    expect(result.current.error).toBe(errorMessage);
    expect(onError).toHaveBeenCalledWith(errorMessage);
  });

  it('should handle successful asset QR scan', async () => {
    const mockAsset = {
      id: '123',
      year: 2023,
      make: 'Honda',
      model: 'Civic',
      license_plate: 'ABC123',
      vin: '1HGBH41JXMN109186',
    };

    mockQrScannerService.parseQRCode.mockReturnValue({
      type: 'asset',
      id: '123',
      originalData: 'ASSET-123',
    });
    mockAssetService.searchAssetByCode.mockResolvedValue(mockAsset);

    const onAssetFound = jest.fn();
    const {result} = renderHook(() => useQRScanner({onAssetFound}));

    await act(async () => {
      await result.current.handleQRScan({data: 'ASSET-123', type: 'qr'});
    });

    expect(mockQrScannerService.parseQRCode).toHaveBeenCalledWith('ASSET-123');
    expect(mockAssetService.searchAssetByCode).toHaveBeenCalledWith('123');
    expect(onAssetFound).toHaveBeenCalledWith(mockAsset);
    expect(result.current.isScanning).toBe(false);
  });

  it('should handle asset not found', async () => {
    mockQrScannerService.parseQRCode.mockReturnValue({
      type: 'asset',
      id: '123',
      originalData: 'ASSET-123',
    });
    mockAssetService.searchAssetByCode.mockResolvedValue(null);

    const onAssetNotFound = jest.fn();
    const {result} = renderHook(() => useQRScanner({onAssetNotFound}));

    await act(async () => {
      await result.current.handleQRScan({data: 'ASSET-123', type: 'qr'});
    });

    expect(onAssetNotFound).toHaveBeenCalledWith('ASSET-123');
    expect(mockAlert).toHaveBeenCalledWith(
      'Asset Not Found',
      'No asset found with code: 123',
      expect.any(Array)
    );
  });

  it('should handle part QR scan', async () => {
    mockQrScannerService.parseQRCode.mockReturnValue({
      type: 'part',
      id: '456',
      originalData: 'PART-456',
    });

    const onPartFound = jest.fn();
    const {result} = renderHook(() => useQRScanner({onPartFound}));

    await act(async () => {
      await result.current.handleQRScan({data: 'PART-456', type: 'qr'});
    });

    expect(onPartFound).toHaveBeenCalledWith('456');
    expect(mockAlert).toHaveBeenCalledWith(
      'Part Scanning',
      'Part scanning functionality will be implemented in a future update.',
      expect.any(Array)
    );
  });

  it('should handle unknown QR code format', async () => {
    mockQrScannerService.parseQRCode.mockReturnValue({
      type: 'unknown',
      id: 'UNKNOWN-123',
      originalData: 'UNKNOWN-123',
    });

    const {result} = renderHook(() => useQRScanner());

    await act(async () => {
      await result.current.handleQRScan({data: 'UNKNOWN-123', type: 'qr'});
    });

    expect(mockAlert).toHaveBeenCalledWith(
      'Unknown QR Code',
      expect.stringContaining('UNKNOWN-123'),
      expect.any(Array)
    );
  });

  it('should handle QR scan error', async () => {
    const errorMessage = 'Scan failed';
    mockQrScannerService.parseQRCode.mockImplementation(() => {
      throw new Error(errorMessage);
    });

    const onError = jest.fn();
    const {result} = renderHook(() => useQRScanner({onError}));

    await act(async () => {
      await result.current.handleQRScan({data: 'ASSET-123', type: 'qr'});
    });

    expect(result.current.error).toBe(errorMessage);
    expect(onError).toHaveBeenCalledWith(errorMessage);
    expect(mockAlert).toHaveBeenCalledWith(
      'Scan Error',
      errorMessage,
      expect.any(Array)
    );
  });

  it('should reset scanner state', () => {
    const {result} = renderHook(() => useQRScanner());

    act(() => {
      result.current.setScanning(true);
    });

    expect(result.current.isScanning).toBe(true);

    act(() => {
      result.current.resetScanner();
    });

    expect(result.current.isScanning).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should set scanning state', () => {
    const {result} = renderHook(() => useQRScanner());

    act(() => {
      result.current.setScanning(true);
    });

    expect(result.current.isScanning).toBe(true);

    act(() => {
      result.current.setScanning(false);
    });

    expect(result.current.isScanning).toBe(false);
  });
});