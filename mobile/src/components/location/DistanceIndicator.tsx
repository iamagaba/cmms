import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useLocation} from '@/hooks/useLocation';
import {navigationService} from '@/services/navigationService';

interface DistanceIndicatorProps {
  latitude: number;
  longitude: number;
  showTravelTime?: boolean;
  showIcon?: boolean;
  style?: any;
  textStyle?: any;
  compact?: boolean;
}

export const DistanceIndicator: React.FC<DistanceIndicatorProps> = ({
  latitude,
  longitude,
  showTravelTime = true,
  showIcon = true,
  style,
  textStyle,
  compact = false,
}) => {
  const [distance, setDistance] = useState<number | null>(null);
  const [travelTime, setTravelTime] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const {currentLocation} = useLocation({
    requestPermissionOnMount: true,
  });

  /**
   * Calculate distance and travel time
   */
  useEffect(() => {
    if (!currentLocation) {
      setDistance(null);
      setTravelTime(null);
      return;
    }

    setIsCalculating(true);

    try {
      // Calculate straight-line distance
      const calculatedDistance = navigationService.estimateTravelTime(
        currentLocation.latitude,
        currentLocation.longitude,
        latitude,
        longitude
      );

      // For distance, we'll use the location service calculation
      const distanceInMeters = Math.sqrt(
        Math.pow((latitude - currentLocation.latitude) * 111000, 2) +
        Math.pow((longitude - currentLocation.longitude) * 111000 * Math.cos(latitude * Math.PI / 180), 2)
      );

      setDistance(distanceInMeters);

      if (showTravelTime) {
        const estimatedTime = navigationService.estimateTravelTime(
          currentLocation.latitude,
          currentLocation.longitude,
          latitude,
          longitude
        );
        setTravelTime(estimatedTime);
      }
    } catch (error) {
      console.error('Error calculating distance:', error);
      setDistance(null);
      setTravelTime(null);
    } finally {
      setIsCalculating(false);
    }
  }, [currentLocation, latitude, longitude, showTravelTime]);

  /**
   * Format distance for display
   */
  const formatDistance = (distanceInMeters: number): string => {
    if (distanceInMeters < 1000) {
      return `${Math.round(distanceInMeters)}m`;
    } else {
      return `${(distanceInMeters / 1000).toFixed(1)}km`;
    }
  };

  /**
   * Get distance category for styling
   */
  const getDistanceCategory = (distanceInMeters: number): 'near' | 'medium' | 'far' => {
    if (distanceInMeters < 500) return 'near';
    if (distanceInMeters < 5000) return 'medium';
    return 'far';
  };

  /**
   * Get icon and color based on distance
   */
  const getDistanceInfo = (distanceInMeters: number) => {
    const category = getDistanceCategory(distanceInMeters);
    
    switch (category) {
      case 'near':
        return {
          icon: 'near-me',
          color: '#4CAF50',
          label: 'Nearby',
        };
      case 'medium':
        return {
          icon: 'location-on',
          color: '#FF9800',
          label: 'Moderate distance',
        };
      case 'far':
        return {
          icon: 'place',
          color: '#F44336',
          label: 'Far away',
        };
    }
  };

  if (isCalculating) {
    return (
      <View style={[styles.container, compact && styles.compactContainer, style]}>
        {showIcon && (
          <Icon name="location-searching" size={compact ? 12 : 16} color="#999" />
        )}
        <Text style={[styles.text, compact && styles.compactText, textStyle]}>
          Calculating...
        </Text>
      </View>
    );
  }

  if (!currentLocation || distance === null) {
    return (
      <View style={[styles.container, compact && styles.compactContainer, style]}>
        {showIcon && (
          <Icon name="location-disabled" size={compact ? 12 : 16} color="#999" />
        )}
        <Text style={[styles.text, compact && styles.compactText, styles.unavailableText, textStyle]}>
          Location unavailable
        </Text>
      </View>
    );
  }

  const distanceInfo = getDistanceInfo(distance);

  if (compact) {
    return (
      <View style={[styles.compactContainer, style]}>
        {showIcon && (
          <Icon 
            name={distanceInfo.icon} 
            size={12} 
            color={distanceInfo.color} 
          />
        )}
        <Text style={[styles.compactText, {color: distanceInfo.color}, textStyle]}>
          {formatDistance(distance)}
          {showTravelTime && travelTime && ` • ${navigationService.formatTravelTime(travelTime)}`}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {showIcon && (
        <Icon 
          name={distanceInfo.icon} 
          size={16} 
          color={distanceInfo.color} 
        />
      )}
      <View style={styles.textContainer}>
        <Text style={[styles.distanceText, {color: distanceInfo.color}, textStyle]}>
          {formatDistance(distance)}
        </Text>
        {showTravelTime && travelTime && (
          <Text style={[styles.timeText, textStyle]}>
            {navigationService.formatTravelTime(travelTime)}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  textContainer: {
    alignItems: 'flex-start',
  },
  text: {
    fontSize: 14,
    color: '#666',
  },
  compactText: {
    fontSize: 12,
    color: '#666',
  },
  distanceText: {
    fontSize: 14,
    fontWeight: '600',
  },
  timeText: {
    fontSize: 12,
    color: '#999',
    marginTop: 1,
  },
  unavailableText: {
    fontStyle: 'italic',
    color: '#999',
  },
});