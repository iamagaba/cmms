import React, {useState, useEffect} from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  navigationService,
  NavigationDestination,
  NavigationApp,
} from '@/services/navigationService';
import {useLocation} from '@/hooks/useLocation';

interface NavigationButtonProps {
  destination: NavigationDestination;
  style?: any;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'outline';
  showDistance?: boolean;
  showTravelTime?: boolean;
  disabled?: boolean;
  onNavigationStart?: () => void;
  onNavigationError?: (error: string) => void;
}

export const NavigationButton: React.FC<NavigationButtonProps> = ({
  destination,
  style,
  size = 'medium',
  variant = 'primary',
  showDistance = true,
  showTravelTime = true,
  disabled = false,
  onNavigationStart,
  onNavigationError,
}) => {
  const [isNavigating, setIsNavigating] = useState(false);
  const [availableApps, setAvailableApps] = useState<NavigationApp[]>([]);
  const [distance, setDistance] = useState<number | null>(null);
  const [travelTime, setTravelTime] = useState<number | null>(null);

  const {currentLocation, calculateDistanceTo} = useLocation({
    requestPermissionOnMount: true,
  });

  /**
   * Check available navigation apps
   */
  useEffect(() => {
    const checkApps = async () => {
      const apps = await navigationService.getAvailableNavigationApps();
      setAvailableApps(apps);
    };
    checkApps();
  }, []);

  /**
   * Calculate distance and travel time
   */
  useEffect(() => {
    if (currentLocation && (showDistance || showTravelTime)) {
      const calculatedDistance = calculateDistanceTo(
        destination.latitude,
        destination.longitude
      );

      if (calculatedDistance !== null) {
        setDistance(calculatedDistance);

        if (showTravelTime) {
          const estimatedTime = navigationService.estimateTravelTime(
            currentLocation.latitude,
            currentLocation.longitude,
            destination.latitude,
            destination.longitude
          );
          setTravelTime(estimatedTime);
        }
      }
    }
  }, [
    currentLocation,
    destination.latitude,
    destination.longitude,
    showDistance,
    showTravelTime,
    calculateDistanceTo,
  ]);

  /**
   * Handle navigation button press
   */
  const handleNavigate = async () => {
    if (disabled || isNavigating) return;

    try {
      setIsNavigating(true);
      
      if (onNavigationStart) {
        onNavigationStart();
      }

      await navigationService.navigateToDestination(destination);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Navigation failed';
      console.error('Navigation error:', errorMessage);
      
      if (onNavigationError) {
        onNavigationError(errorMessage);
      }
    } finally {
      setIsNavigating(false);
    }
  };

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
   * Get button styles based on size and variant
   */
  const getButtonStyles = () => {
    const baseStyle = [styles.button];
    
    // Size styles
    switch (size) {
      case 'small':
        baseStyle.push(styles.smallButton);
        break;
      case 'large':
        baseStyle.push(styles.largeButton);
        break;
      default:
        baseStyle.push(styles.mediumButton);
    }

    // Variant styles
    switch (variant) {
      case 'secondary':
        baseStyle.push(styles.secondaryButton);
        break;
      case 'outline':
        baseStyle.push(styles.outlineButton);
        break;
      default:
        baseStyle.push(styles.primaryButton);
    }

    if (disabled) {
      baseStyle.push(styles.disabledButton);
    }

    return baseStyle;
  };

  /**
   * Get text styles based on variant and size
   */
  const getTextStyles = () => {
    const baseStyle = [styles.buttonText];
    
    // Size styles
    switch (size) {
      case 'small':
        baseStyle.push(styles.smallText);
        break;
      case 'large':
        baseStyle.push(styles.largeText);
        break;
      default:
        baseStyle.push(styles.mediumText);
    }

    // Variant styles
    switch (variant) {
      case 'secondary':
        baseStyle.push(styles.secondaryText);
        break;
      case 'outline':
        baseStyle.push(styles.outlineText);
        break;
      default:
        baseStyle.push(styles.primaryText);
    }

    if (disabled) {
      baseStyle.push(styles.disabledText);
    }

    return baseStyle;
  };

  /**
   * Get icon size based on button size
   */
  const getIconSize = (): number => {
    switch (size) {
      case 'small':
        return 16;
      case 'large':
        return 28;
      default:
        return 20;
    }
  };

  if (availableApps.length === 0) {
    return null; // Don't show button if no navigation apps available
  }

  return (
    <TouchableOpacity
      style={[...getButtonStyles(), style]}
      onPress={handleNavigate}
      disabled={disabled || isNavigating}
      activeOpacity={0.7}
    >
      <View style={styles.buttonContent}>
        {isNavigating ? (
          <ActivityIndicator
            size="small"
            color={variant === 'primary' ? 'white' : '#2196F3'}
          />
        ) : (
          <Icon
            name="navigation"
            size={getIconSize()}
            color={variant === 'primary' ? 'white' : '#2196F3'}
          />
        )}
        
        <View style={styles.textContainer}>
          <Text style={getTextStyles()}>
            {isNavigating ? 'Opening...' : 'Navigate'}
          </Text>
          
          {(showDistance || showTravelTime) && (distance !== null || travelTime !== null) && (
            <View style={styles.infoContainer}>
              {showDistance && distance !== null && (
                <Text style={[styles.infoText, variant === 'primary' && styles.primaryInfoText]}>
                  {formatDistance(distance)}
                </Text>
              )}
              {showTravelTime && travelTime !== null && (
                <Text style={[styles.infoText, variant === 'primary' && styles.primaryInfoText]}>
                  {navigationService.formatTravelTime(travelTime)}
                </Text>
              )}
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  smallButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  mediumButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  largeButton: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  primaryButton: {
    backgroundColor: '#2196F3',
  },
  secondaryButton: {
    backgroundColor: '#E3F2FD',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  disabledButton: {
    backgroundColor: '#E0E0E0',
    elevation: 0,
    shadowOpacity: 0,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  textContainer: {
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: '600',
  },
  smallText: {
    fontSize: 12,
  },
  mediumText: {
    fontSize: 14,
  },
  largeText: {
    fontSize: 16,
  },
  primaryText: {
    color: 'white',
  },
  secondaryText: {
    color: '#2196F3',
  },
  outlineText: {
    color: '#2196F3',
  },
  disabledText: {
    color: '#9E9E9E',
  },
  infoContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  infoText: {
    fontSize: 10,
    color: '#666',
  },
  primaryInfoText: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
});