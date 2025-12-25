import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {LocationCoordinates, LocationError} from '@/services/locationService';

interface LocationStatusIndicatorProps {
  currentLocation: LocationCoordinates | null;
  isTracking: boolean;
  isLoading: boolean;
  error: LocationError | null;
  lastUpdateTime: number | null;
  onPress?: () => void;
  compact?: boolean;
}

export const LocationStatusIndicator: React.FC<LocationStatusIndicatorProps> = ({
  currentLocation,
  isTracking,
  isLoading,
  error,
  lastUpdateTime,
  onPress,
  compact = false,
}) => {
  const getStatusInfo = () => {
    if (isLoading) {
      return {
        icon: 'location-searching',
        color: '#FF9800',
        text: 'Getting location...',
        subtext: 'Please wait',
      };
    }

    if (error) {
      return {
        icon: 'location-off',
        color: '#F44336',
        text: 'Location unavailable',
        subtext: error.message,
      };
    }

    if (!currentLocation) {
      return {
        icon: 'location-disabled',
        color: '#9E9E9E',
        text: 'Location disabled',
        subtext: 'Tap to enable',
      };
    }

    if (isTracking) {
      return {
        icon: 'my-location',
        color: '#4CAF50',
        text: 'Location active',
        subtext: getAccuracyText(currentLocation.accuracy),
      };
    }

    return {
      icon: 'location-on',
      color: '#2196F3',
      text: 'Location available',
      subtext: getLastUpdateText(),
    };
  };

  const getAccuracyText = (accuracy: number): string => {
    if (accuracy <= 10) return 'High accuracy';
    if (accuracy <= 50) return 'Good accuracy';
    if (accuracy <= 100) return 'Fair accuracy';
    return 'Low accuracy';
  };

  const getLastUpdateText = (): string => {
    if (!lastUpdateTime) return 'Never updated';
    
    const now = Date.now();
    const diffMs = now - lastUpdateTime;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return 'Over 24h ago';
  };

  const statusInfo = getStatusInfo();

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactContainer, onPress && styles.pressable]}
        onPress={onPress}
        disabled={!onPress}
      >
        <Icon 
          name={statusInfo.icon} 
          size={16} 
          color={statusInfo.color} 
        />
        <Text style={[styles.compactText, {color: statusInfo.color}]}>
          {statusInfo.text}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.container, onPress && styles.pressable]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.iconContainer}>
        <Icon 
          name={statusInfo.icon} 
          size={24} 
          color={statusInfo.color} 
        />
        {isTracking && (
          <View style={styles.trackingIndicator}>
            <View style={styles.pulse} />
          </View>
        )}
      </View>
      
      <View style={styles.textContainer}>
        <Text style={[styles.statusText, {color: statusInfo.color}]}>
          {statusInfo.text}
        </Text>
        <Text style={styles.subtextText}>
          {statusInfo.subtext}
        </Text>
      </View>

      {currentLocation && (
        <View style={styles.coordinatesContainer}>
          <Text style={styles.coordinatesText}>
            {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    gap: 4,
  },
  pressable: {
    opacity: 0.8,
  },
  iconContainer: {
    position: 'relative',
    marginRight: 12,
  },
  trackingIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  pulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    opacity: 0.6,
  },
  textContainer: {
    flex: 1,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  subtextText: {
    fontSize: 12,
    color: '#666',
  },
  compactText: {
    fontSize: 12,
    fontWeight: '500',
  },
  coordinatesContainer: {
    marginLeft: 8,
  },
  coordinatesText: {
    fontSize: 10,
    color: '#999',
    fontFamily: 'monospace',
  },
});