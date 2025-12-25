import React, {useState, useEffect} from 'react';
import {View, StyleSheet, Alert, Dimensions} from 'react-native';
import {Text, Button, Card, ActivityIndicator} from 'react-native-paper';
import {useNavigation, useRoute, RouteProp, CommonActions} from '@react-navigation/native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {ScreenWrapper} from '@/components/common';
import {AssetLookup} from '@/components/assets';
import {AssetsStackParams, Vehicle} from '@/types';
import {useQRScanner} from '@/hooks/useQRScanner';

type QRScannerScreenRouteProp = RouteProp<AssetsStackParams, 'QRScanner'>;

const {width} = Dimensions.get('window');

export const QRScannerScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<QRScannerScreenRouteProp>();
  const {type} = route.params;
  
  const [showManualEntry, setShowManualEntry] = useState(false);

  const {
    isScanning,
    hasPermission,
    isLoading,
    error,
    requestPermission,
    handleQRScan,
    resetScanner,
    setScanning,
  } = useQRScanner({
    onAssetFound: (asset: Vehicle) => {
      Alert.alert(
        'Asset Found',
        `Found: ${asset.year} ${asset.make} ${asset.model}\nLicense: ${asset.license_plate}`,
        [
          {
            text: 'View Details',
            onPress: () => {
              navigation.navigate('AssetDetails', {assetId: asset.id});
            },
          },
          {
            text: 'Create Work Order',
            onPress: () => {
              navigation.dispatch(
                CommonActions.navigate({
                  name: 'WorkOrders',
                  params: {
                    screen: 'WorkOrderCreate',
                    params: {assetId: asset.id},
                  },
                })
              );
            },
          },
          {text: 'Scan Another', onPress: () => setScanning(true)},
        ]
      );
    },
    onAssetNotFound: (qrData: string) => {
      Alert.alert(
        'Asset Not Found',
        `No asset found for code: ${qrData}`,
        [
          {text: 'Try Again', onPress: () => setScanning(true)},
          {text: 'Manual Entry', onPress: () => setShowManualEntry(true)},
        ]
      );
    },
    onError: (errorMessage: string) => {
      console.error('QR Scanner error:', errorMessage);
    },
  });

  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  const handleManualEntry = () => {
    setShowManualEntry(true);
  };

  const handleAssetSelect = (asset: Vehicle) => {
    setShowManualEntry(false);
    Alert.alert(
      'Asset Selected',
      `Selected: ${asset.year} ${asset.make} ${asset.model}\nLicense: ${asset.license_plate}`,
      [
        {
          text: 'View Details',
          onPress: () => {
            navigation.navigate('AssetDetails', {assetId: asset.id});
          },
        },
        {
          text: 'Create Work Order',
          onPress: () => {
            navigation.dispatch(
              CommonActions.navigate({
                name: 'WorkOrders',
                params: {
                  screen: 'WorkOrderCreate',
                  params: {assetId: asset.id},
                },
              })
            );
          },
        },
        {text: 'Select Another', onPress: () => setShowManualEntry(true)},
      ]
    );
  };

  const onQRCodeRead = (e: any) => {
    if (!isScanning) return;
    
    setScanning(false);
    handleQRScan({data: e.data, type: 'qr'});
  };

  if (hasPermission === null || isLoading) {
    return (
      <ScreenWrapper>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>
            {hasPermission === null ? 'Requesting camera permission...' : 'Loading...'}
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (hasPermission === false) {
    return (
      <ScreenWrapper>
        <View style={styles.centerContainer}>
          <Card style={styles.errorCard}>
            <Card.Content>
              <Text variant="headlineSmall" style={styles.errorTitle}>
                Camera Permission Required
              </Text>
              <Text style={styles.errorText}>
                Please enable camera access in your device settings to scan QR codes.
              </Text>
              <Button
                mode="contained"
                onPress={requestPermission}
                style={styles.retryButton}>
                Retry
              </Button>
            </Card.Content>
          </Card>
        </View>
      </ScreenWrapper>
    );
  }

  if (showManualEntry) {
    return (
      <ScreenWrapper>
        <AssetLookup
          onAssetSelect={handleAssetSelect}
          onCancel={() => setShowManualEntry(false)}
          title={`Manual ${type === 'asset' ? 'Asset' : 'Part'} Lookup`}
          placeholder={type === 'asset' 
            ? 'Search by VIN, license plate, make, model...'
            : 'Search by part number, description...'
          }
        />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Card style={styles.instructionCard}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.title}>
              Scan {type === 'asset' ? 'Asset' : 'Part'} QR Code
            </Text>
            <Text style={styles.instruction}>
              Position the QR code within the camera frame to scan automatically.
            </Text>
          </Card.Content>
        </Card>

        <View style={styles.cameraContainer}>
          {isScanning ? (
            <QRCodeScanner
              onRead={onQRCodeRead}
              showMarker={true}
              markerStyle={styles.qrMarker}
              cameraStyle={styles.camera}
              topContent={null}
              bottomContent={null}
              reactivate={false}
              reactivateTimeout={2000}
            />
          ) : (
            <View style={styles.cameraPlaceholder}>
              <View style={styles.scanFrame}>
                <Text style={styles.cameraText}>
                  Tap "Start Scan" to begin
                </Text>
                <Text style={styles.cameraSubtext}>
                  Point your camera at a QR code
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.actionContainer}>
          <Button
            mode="contained"
            onPress={() => setScanning(!isScanning)}
            disabled={isLoading}
            style={styles.scanButton}>
            {isScanning ? 'Stop Scan' : 'Start Scan'}
          </Button>
          
          <Button
            mode="outlined"
            onPress={handleManualEntry}
            disabled={isScanning || isLoading}
            style={styles.manualButton}>
            Manual Entry
          </Button>
        </View>

        {error && (
          <Card style={styles.errorCard}>
            <Card.Content>
              <Text style={styles.errorText}>{error}</Text>
              <Button
                mode="text"
                onPress={resetScanner}
                style={styles.retryButton}>
                Try Again
              </Button>
            </Card.Content>
          </Card>
        )}
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
  },
  errorCard: {
    width: '100%',
    maxWidth: 400,
    marginTop: 16,
  },
  errorTitle: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#d32f2f',
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#d32f2f',
  },
  retryButton: {
    alignSelf: 'center',
  },
  instructionCard: {
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    flex: 1,
  },
  instruction: {
    textAlign: 'center',
    opacity: 0.7,
  },
  cameraContainer: {
    flex: 1,
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  qrMarker: {
    borderColor: '#fff',
    borderWidth: 2,
  },
  cameraPlaceholder: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  scanFrame: {
    alignItems: 'center',
  },
  cameraText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cameraSubtext: {
    color: '#ccc',
    fontSize: 14,
  },
  scanningContainer: {
    alignItems: 'center',
  },
  scanningText: {
    color: '#fff',
    marginTop: 16,
    fontSize: 16,
  },
  actionContainer: {
    gap: 12,
  },
  scanButton: {
    paddingVertical: 8,
  },
  manualButton: {
    paddingVertical: 8,
  },

});