import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { Button, Icon } from 'react-native-elements';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { useQRScanner } from '../../hooks/useQRScanner';
import { MobileInventoryItem } from '../../types';
import { theme } from '../../theme/theme';

interface PartScannerProps {
  visible: boolean;
  onClose: () => void;
  onPartFound: (part: MobileInventoryItem) => void;
  onManualEntry?: () => void;
  title?: string;
  subtitle?: string;
}

const { width, height } = Dimensions.get('window');

export const PartScanner: React.FC<PartScannerProps> = ({
  visible,
  onClose,
  onPartFound,
  onManualEntry,
  title = 'Scan Part Barcode',
  subtitle = 'Position the barcode or QR code within the frame',
}) => {
  const [flashOn, setFlashOn] = useState(false);
  const [scannerActive, setScannerActive] = useState(true);

  const {
    hasPermission,
    isLoading,
    error,
    requestPermission,
    handleQRScan,
    resetScanner,
  } = useQRScanner({
    onPartFound: (part) => {
      setScannerActive(false);
      onPartFound(part);
      onClose();
    },
    onPartNotFound: (qrData) => {
      setScannerActive(false);
      Alert.alert(
        'Part Not Found',
        `No part found for scanned code: ${qrData}`,
        [
          {
            text: 'Try Again',
            onPress: () => setScannerActive(true),
          },
          {
            text: 'Manual Entry',
            onPress: () => {
              onManualEntry?.();
              onClose();
            },
          },
        ]
      );
    },
    onAssetFound: () => {
      setScannerActive(false);
      Alert.alert(
        'Asset Code Detected',
        'This appears to be an asset code, not a part code. Please scan a part barcode or QR code.',
        [
          {
            text: 'Try Again',
            onPress: () => setScannerActive(true),
          },
        ]
      );
    },
    onError: (errorMessage) => {
      setScannerActive(false);
      Alert.alert(
        'Scan Error',
        errorMessage,
        [
          {
            text: 'Try Again',
            onPress: () => setScannerActive(true),
          },
          {
            text: 'Close',
            onPress: onClose,
          },
        ]
      );
    },
  });

  useEffect(() => {
    if (visible && hasPermission === null) {
      requestPermission();
    }
  }, [visible, hasPermission, requestPermission]);

  useEffect(() => {
    if (visible) {
      setScannerActive(true);
      setFlashOn(false);
      resetScanner();
    }
  }, [visible, resetScanner]);

  const handleBarCodeRead = (e: any) => {
    if (!scannerActive) return;
    
    handleQRScan({
      data: e.data,
      type: e.type,
    });
  };

  const toggleFlash = () => {
    setFlashOn(!flashOn);
  };

  const handleManualEntry = () => {
    onManualEntry?.();
    onClose();
  };

  if (!visible) {
    return null;
  }

  if (hasPermission === false) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={styles.permissionContainer}>
          <Icon
            name="camera-alt"
            type="material"
            size={64}
            color={theme.colors.grey3}
          />
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionText}>
            Please allow camera access to scan part barcodes and QR codes.
          </Text>
          <View style={styles.permissionButtons}>
            <Button
              title="Request Permission"
              onPress={requestPermission}
              buttonStyle={styles.permissionButton}
              loading={isLoading}
            />
            <Button
              title="Manual Entry"
              onPress={handleManualEntry}
              buttonStyle={[styles.permissionButton, styles.manualButton]}
              titleStyle={styles.manualButtonText}
              type="outline"
            />
            <Button
              title="Cancel"
              onPress={onClose}
              buttonStyle={[styles.permissionButton, styles.cancelButton]}
              titleStyle={styles.cancelButtonText}
              type="clear"
            />
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon
              name="close"
              type="material"
              size={24}
              color={theme.colors.white}
            />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{title}</Text>
            <Text style={styles.headerSubtitle}>{subtitle}</Text>
          </View>
          <TouchableOpacity onPress={toggleFlash} style={styles.flashButton}>
            <Icon
              name={flashOn ? 'flash-on' : 'flash-off'}
              type="material"
              size={24}
              color={theme.colors.white}
            />
          </TouchableOpacity>
        </View>

        {/* Scanner */}
        <View style={styles.scannerContainer}>
          <QRCodeScanner
            onRead={handleBarCodeRead}
            flashMode={
              flashOn
                ? QRCodeScanner.Constants.FlashMode.torch
                : QRCodeScanner.Constants.FlashMode.off
            }
            showMarker={true}
            markerStyle={styles.marker}
            cameraStyle={styles.camera}
            containerStyle={styles.qrContainer}
            reactivate={scannerActive}
            reactivateTimeout={2000}
          />
          
          {/* Overlay */}
          <View style={styles.overlay}>
            <View style={styles.overlayTop} />
            <View style={styles.overlayMiddle}>
              <View style={styles.overlaySide} />
              <View style={styles.scanArea} />
              <View style={styles.overlaySide} />
            </View>
            <View style={styles.overlayBottom} />
          </View>

          {/* Scan area corners */}
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.instructionText}>
            Align the barcode or QR code within the frame
          </Text>
          <View style={styles.footerButtons}>
            <Button
              title="Manual Entry"
              onPress={handleManualEntry}
              buttonStyle={styles.manualEntryButton}
              titleStyle={styles.manualEntryButtonText}
              type="outline"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const scanAreaSize = Math.min(width * 0.7, 250);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  closeButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.white,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.grey4,
    textAlign: 'center',
    marginTop: 4,
  },
  flashButton: {
    padding: 8,
  },
  scannerContainer: {
    flex: 1,
    position: 'relative',
  },
  qrContainer: {
    flex: 1,
  },
  camera: {
    height: height,
  },
  marker: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayMiddle: {
    flexDirection: 'row',
    height: scanAreaSize,
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  scanArea: {
    width: scanAreaSize,
    backgroundColor: 'transparent',
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  scanFrame: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: scanAreaSize,
    height: scanAreaSize,
    marginTop: -scanAreaSize / 2,
    marginLeft: -scanAreaSize / 2,
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: theme.colors.primary,
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  footer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  instructionText: {
    fontSize: 16,
    color: theme.colors.white,
    textAlign: 'center',
    marginBottom: 16,
  },
  footerButtons: {
    alignItems: 'center',
  },
  manualEntryButton: {
    borderColor: theme.colors.white,
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  manualEntryButtonText: {
    color: theme.colors.white,
    fontSize: 16,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: theme.colors.white,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.grey0,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 16,
    color: theme.colors.grey2,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  permissionButtons: {
    width: '100%',
  },
  permissionButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 12,
  },
  manualButton: {
    backgroundColor: 'transparent',
    borderColor: theme.colors.primary,
    borderWidth: 1,
  },
  manualButtonText: {
    color: theme.colors.primary,
  },
  cancelButton: {
    backgroundColor: 'transparent',
  },
  cancelButtonText: {
    color: theme.colors.grey2,
  },
});