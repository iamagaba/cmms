import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {LocationPermissionStatus} from '@/services/locationService';

interface LocationPermissionModalProps {
  visible: boolean;
  onClose: () => void;
  onRequestPermission: () => Promise<LocationPermissionStatus>;
  permissionStatus: LocationPermissionStatus | null;
}

export const LocationPermissionModal: React.FC<LocationPermissionModalProps> = ({
  visible,
  onClose,
  onRequestPermission,
  permissionStatus,
}) => {
  const handleRequestPermission = async () => {
    const status = await onRequestPermission();
    
    if (status === LocationPermissionStatus.GRANTED) {
      onClose();
    } else if (status === LocationPermissionStatus.NEVER_ASK_AGAIN) {
      showSettingsAlert();
    }
  };

  const showSettingsAlert = () => {
    Alert.alert(
      'Location Permission Required',
      'Location access has been permanently denied. Please enable it in your device settings to use location features.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Open Settings',
          onPress: () => {
            Linking.openSettings();
          },
        },
      ]
    );
  };

  const getPermissionStatusText = () => {
    switch (permissionStatus) {
      case LocationPermissionStatus.DENIED:
        return 'Location access is currently denied.';
      case LocationPermissionStatus.NEVER_ASK_AGAIN:
        return 'Location access has been permanently denied. Please enable it in settings.';
      case LocationPermissionStatus.RESTRICTED:
        return 'Location access is restricted on this device.';
      default:
        return 'Location access is required for this feature.';
    }
  };

  const canRequestPermission = 
    permissionStatus !== LocationPermissionStatus.NEVER_ASK_AGAIN &&
    permissionStatus !== LocationPermissionStatus.RESTRICTED;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Icon name="location-on" size={48} color="#2196F3" />
            <Text style={styles.title}>Location Permission</Text>
          </View>

          <View style={styles.content}>
            <Text style={styles.description}>
              This app uses your location to:
            </Text>
            
            <View style={styles.featureList}>
              <View style={styles.featureItem}>
                <Icon name="navigation" size={20} color="#4CAF50" />
                <Text style={styles.featureText}>
                  Navigate to customer locations
                </Text>
              </View>
              
              <View style={styles.featureItem}>
                <Icon name="check-circle" size={20} color="#4CAF50" />
                <Text style={styles.featureText}>
                  Automatically check you in at work sites
                </Text>
              </View>
              
              <View style={styles.featureItem}>
                <Icon name="schedule" size={20} color="#4CAF50" />
                <Text style={styles.featureText}>
                  Calculate travel times and distances
                </Text>
              </View>
              
              <View style={styles.featureItem}>
                <Icon name="security" size={20} color="#4CAF50" />
                <Text style={styles.featureText}>
                  Track your position for safety
                </Text>
              </View>
            </View>

            <Text style={styles.statusText}>
              {getPermissionStatusText()}
            </Text>

            <Text style={styles.privacyNote}>
              Your location data is only used for work-related purposes and is not shared with third parties.
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            {canRequestPermission ? (
              <TouchableOpacity
                style={styles.enableButton}
                onPress={handleRequestPermission}
              >
                <Text style={styles.enableButtonText}>Enable Location</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.settingsButton}
                onPress={showSettingsAlert}
              >
                <Text style={styles.settingsButtonText}>Open Settings</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  content: {
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  featureList: {
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  statusText: {
    fontSize: 14,
    color: '#FF9800',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '500',
  },
  privacyNote: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  enableButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#2196F3',
    alignItems: 'center',
  },
  enableButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  settingsButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#FF9800',
    alignItems: 'center',
  },
  settingsButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
});