import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Text,
  Dimensions,
} from 'react-native';
import MapView, {Marker, PROVIDER_GOOGLE, Region, Callout} from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useLocation} from '@/hooks/useLocation';
import {LocationCoordinates} from '@/services/locationService';

export interface WorkOrderLocation {
  id: string;
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  address?: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Emergency';
  status?: string;
}

interface WorkOrderMapProps {
  workOrderLocations: WorkOrderLocation[];
  selectedWorkOrderId?: string;
  onWorkOrderSelect?: (workOrderId: string) => void;
  onNavigateToLocation?: (location: WorkOrderLocation) => void;
  showUserLocation?: boolean;
  style?: any;
  initialRegion?: Region;
}

const {width, height} = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export const WorkOrderMap: React.FC<WorkOrderMapProps> = ({
  workOrderLocations,
  selectedWorkOrderId,
  onWorkOrderSelect,
  onNavigateToLocation,
  showUserLocation = true,
  style,
  initialRegion,
}) => {
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const {
    currentLocation,
    isLoading,
    error,
    getCurrentLocation,
    requestPermission,
  } = useLocation({
    enableTracking: showUserLocation,
    requestPermissionOnMount: showUserLocation,
  });

  useEffect(() => {
    if (initialRegion) {
      setRegion(initialRegion);
    } else if (workOrderLocations.length > 0) {
      // Calculate region to fit all work orders
      const coordinates = workOrderLocations.map(wo => ({
        latitude: wo.latitude,
        longitude: wo.longitude,
      }));

      if (currentLocation) {
        coordinates.push({
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
        });
      }

      const minLat = Math.min(...coordinates.map(c => c.latitude));
      const maxLat = Math.max(...coordinates.map(c => c.latitude));
      const minLng = Math.min(...coordinates.map(c => c.longitude));
      const maxLng = Math.max(...coordinates.map(c => c.longitude));

      const centerLat = (minLat + maxLat) / 2;
      const centerLng = (minLng + maxLng) / 2;
      const latDelta = Math.max(maxLat - minLat, 0.01) * 1.2;
      const lngDelta = Math.max(maxLng - minLng, 0.01) * 1.2;

      setRegion({
        latitude: centerLat,
        longitude: centerLng,
        latitudeDelta: latDelta,
        longitudeDelta: lngDelta,
      });
    } else if (currentLocation) {
      // Center on user location
      setRegion({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      });
    }
  }, [workOrderLocations, currentLocation, initialRegion]);

  const handleMyLocationPress = async () => {
    if (!showUserLocation) return;

    if (!currentLocation) {
      try {
        const location = await getCurrentLocation();
        if (location) {
          animateToLocation(location);
        }
      } catch (err) {
        Alert.alert(
          'Location Error',
          'Unable to get your current location. Please check your location settings.',
          [
            {text: 'Cancel', style: 'cancel'},
            {text: 'Retry', onPress: handleMyLocationPress},
          ]
        );
      }
    } else {
      animateToLocation(currentLocation);
    }
  };

  const animateToLocation = (location: LocationCoordinates) => {
    const newRegion = {
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };

    mapRef.current?.animateToRegion(newRegion, 1000);
  };

  const handleWorkOrderPress = (workOrder: WorkOrderLocation) => {
    if (onWorkOrderSelect) {
      onWorkOrderSelect(workOrder.id);
    }
    
    // Animate to work order location
    const newRegion = {
      latitude: workOrder.latitude,
      longitude: workOrder.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    
    mapRef.current?.animateToRegion(newRegion, 1000);
  };

  const handleNavigatePress = (workOrder: WorkOrderLocation) => {
    if (onNavigateToLocation) {
      onNavigateToLocation(workOrder);
    }
  };

  const getPriorityColor = (priority?: string): string => {
    switch (priority) {
      case 'Emergency':
        return '#F44336';
      case 'High':
        return '#FF9800';
      case 'Medium':
        return '#2196F3';
      case 'Low':
        return '#4CAF50';
      default:
        return '#9E9E9E';
    }
  };

  const getMarkerIcon = (priority?: string): string => {
    switch (priority) {
      case 'Emergency':
        return 'warning';
      case 'High':
        return 'priority-high';
      default:
        return 'location-on';
    }
  };

  if (!region) {
    return (
      <View style={[styles.container, styles.loadingContainer, style]}>
        <Icon name="map" size={48} color="#ccc" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        showsUserLocation={showUserLocation && !!currentLocation}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        onRegionChangeComplete={setRegion}
      >
        {/* Work Order Markers */}
        {workOrderLocations.map((workOrder) => (
          <Marker
            key={workOrder.id}
            coordinate={{
              latitude: workOrder.latitude,
              longitude: workOrder.longitude,
            }}
            pinColor={getPriorityColor(workOrder.priority)}
            onPress={() => handleWorkOrderPress(workOrder)}
          >
            <View style={[
              styles.markerContainer,
              {borderColor: getPriorityColor(workOrder.priority)},
              selectedWorkOrderId === workOrder.id && styles.selectedMarker,
            ]}>
              <Icon
                name={getMarkerIcon(workOrder.priority)}
                size={20}
                color={getPriorityColor(workOrder.priority)}
              />
            </View>
            
            <Callout onPress={() => handleNavigatePress(workOrder)}>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>{workOrder.title}</Text>
                {workOrder.description && (
                  <Text style={styles.calloutDescription}>
                    {workOrder.description}
                  </Text>
                )}
                {workOrder.address && (
                  <Text style={styles.calloutAddress}>{workOrder.address}</Text>
                )}
                <TouchableOpacity style={styles.navigateButton}>
                  <Icon name="navigation" size={16} color="#2196F3" />
                  <Text style={styles.navigateButtonText}>Navigate</Text>
                </TouchableOpacity>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* My Location Button */}
      {showUserLocation && (
        <TouchableOpacity
          style={styles.myLocationButton}
          onPress={handleMyLocationPress}
          disabled={isLoading}
        >
          <Icon
            name={isLoading ? 'location-searching' : 'my-location'}
            size={24}
            color={currentLocation ? '#2196F3' : '#666'}
          />
        </TouchableOpacity>
      )}

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Icon name="error" size={16} color="#F44336" />
          <Text style={styles.errorText}>{error.message}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: '#666',
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'white',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  selectedMarker: {
    borderWidth: 3,
    transform: [{scale: 1.2}],
  },
  calloutContainer: {
    minWidth: 200,
    padding: 8,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  calloutDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  calloutAddress: {
    fontSize: 11,
    color: '#999',
    marginBottom: 8,
  },
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#E3F2FD',
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  navigateButtonText: {
    fontSize: 12,
    color: '#2196F3',
    marginLeft: 4,
    fontWeight: '500',
  },
  myLocationButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  errorContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 8,
    borderRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  errorText: {
    fontSize: 12,
    color: '#F44336',
    marginLeft: 8,
    flex: 1,
  },
});