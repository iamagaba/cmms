import {qrScannerService} from '../qrScannerService';

// Mock react-native-permissions
jest.mock('react-native-permissions', () => ({
  check: jest.fn(),
  request: jest.fn(),
  PERMISSIONS: {
    ANDROID: {
      CAMERA: 'android.permission.CAMERA',
    },
    IOS: {
      CAMERA: 'ios.permission.CAMERA',
    },
  },
  RESULTS: {
    GRANTED: 'granted',
    DENIED: 'denied',
    BLOCKED: 'blocked',
  },
}));

// Mock react-native Alert
jest.mock('react-native', () => ({
  PermissionsAndroid: {},
  Platform: {
    OS: 'ios',
  },
  Alert: {
    alert: jest.fn(),
  },
}));

describe('QRScannerService', () => {
  describe('parseQRCode', () => {
    it('should parse asset QR codes with ASSET- prefix', () => {
      const result = qrScannerService.parseQRCode('ASSET-12345');
      expect(result).toEqual({
        type: 'asset',
        id: '12345',
        originalData: 'ASSET-12345',
      });
    });

    it('should parse asset QR codes with VEHICLE- prefix', () => {
      const result = qrScannerService.parseQRCode('VEHICLE-ID-67890');
      expect(result).toEqual({
        type: 'asset',
        id: 'ID-67890',
        originalData: 'VEHICLE-ID-67890',
      });
    });

    it('should parse VIN format QR codes', () => {
      const result = qrScannerService.parseQRCode('VIN:1HGBH41JXMN109186');
      expect(result).toEqual({
        type: 'asset',
        id: '1HGBH41JXMN109186',
        originalData: 'VIN:1HGBH41JXMN109186',
      });
    });

    it('should parse direct VIN QR codes', () => {
      const result = qrScannerService.parseQRCode('1HGBH41JXMN109186');
      expect(result).toEqual({
        type: 'asset',
        id: '1HGBH41JXMN109186',
        originalData: '1HGBH41JXMN109186',
      });
    });

    it('should parse part QR codes with PART- prefix', () => {
      const result = qrScannerService.parseQRCode('PART-67890');
      expect(result).toEqual({
        type: 'part',
        id: '67890',
        originalData: 'PART-67890',
      });
    });

    it('should parse part QR codes with P- prefix', () => {
      const result = qrScannerService.parseQRCode('P-12345');
      expect(result).toEqual({
        type: 'part',
        id: '12345',
        originalData: 'P-12345',
      });
    });

    it('should handle unknown QR code formats', () => {
      const result = qrScannerService.parseQRCode('UNKNOWN-FORMAT-123');
      expect(result).toEqual({
        type: 'unknown',
        id: 'UNKNOWN-FORMAT-123',
        originalData: 'UNKNOWN-FORMAT-123',
      });
    });

    it('should handle case insensitive parsing', () => {
      const result = qrScannerService.parseQRCode('asset-12345');
      expect(result).toEqual({
        type: 'asset',
        id: '12345',
        originalData: 'asset-12345',
      });
    });

    it('should trim whitespace', () => {
      const result = qrScannerService.parseQRCode('  ASSET-12345  ');
      expect(result).toEqual({
        type: 'asset',
        id: '12345',
        originalData: '  ASSET-12345  ',
      });
    });
  });

  describe('isValidQRCode', () => {
    it('should return true for valid asset QR codes', () => {
      expect(qrScannerService.isValidQRCode('ASSET-12345')).toBe(true);
      expect(qrScannerService.isValidQRCode('VIN:1HGBH41JXMN109186')).toBe(true);
      expect(qrScannerService.isValidQRCode('1HGBH41JXMN109186')).toBe(true);
    });

    it('should return true for valid part QR codes', () => {
      expect(qrScannerService.isValidQRCode('PART-67890')).toBe(true);
      expect(qrScannerService.isValidQRCode('P-12345')).toBe(true);
    });

    it('should return false for empty or invalid QR codes', () => {
      expect(qrScannerService.isValidQRCode('')).toBe(false);
      expect(qrScannerService.isValidQRCode('   ')).toBe(false);
    });

    it('should return true for unknown but non-empty QR codes', () => {
      expect(qrScannerService.isValidQRCode('SOME-DATA')).toBe(true);
    });
  });

  describe('formatQRCodeForDisplay', () => {
    it('should format asset QR codes for display', () => {
      expect(qrScannerService.formatQRCodeForDisplay('ASSET-12345')).toBe('Asset: 12345');
      expect(qrScannerService.formatQRCodeForDisplay('VIN:1HGBH41JXMN109186')).toBe('Asset: 1HGBH41JXMN109186');
    });

    it('should format part QR codes for display', () => {
      expect(qrScannerService.formatQRCodeForDisplay('PART-67890')).toBe('Part: 67890');
      expect(qrScannerService.formatQRCodeForDisplay('P-12345')).toBe('Part: 12345');
    });

    it('should format unknown QR codes for display', () => {
      expect(qrScannerService.formatQRCodeForDisplay('UNKNOWN-123')).toBe('Code: UNKNOWN-123');
    });
  });
});