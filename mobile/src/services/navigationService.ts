import {Platform, Linking, Alert} from 'react-native';

export interface NavigationDestination {
  latitude: number;
  longitude: number;
  address?: string;
  name?: string;
}

export enum NavigationApp {
  GOOGLE_MAPS = 'google_maps',
  APPLE_MAPS = 'apple_maps',
  WAZE = 'waze',
}

class NavigationService {
  /**
   * Navigate to a destination using the default map app
   */
  async navigateToDestination(destination: NavigationDestination): Promise<void> {
    const {latitude, longitude, address, name} = destination;
    
    try {
      if (Platform.OS === 'ios') {
        await this.navigateWithAppleMaps(latitude, longitude, address || name);
      } else {
        await this.navigateWithGoogleMaps(latitude, longitude, address || name);
      }
    } catch (error) {
      console.error('Navigation error:', error);
      this.showNavigationOptions(destination);
    }
  }

  /**
   * Show navigation options to user
   */
  private showNavigationOptions(destination: NavigationDestination): void {
    const {latitude, longitude, address, name} = destination;
    const destinationName = name || address || 'Destination';

    Alert.alert(
      'Choose Navigation App',
      `Navigate to ${destinationName}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Google Maps',
          onPress: () => this.navigateWithGoogleMaps(latitude, longitude, destinationName),
        },
        ...(Platform.OS === 'ios' ? [{
          text: 'Apple Maps',
          onPress: () => this.navigateWithAppleMaps(latitude, longitude, destinationName),
        }] : []),
        {
          text: 'Waze',
          onPress: () => this.navigateWithWaze(latitude, longitude),
        },
      ]
    );
  }

  /**
   * Navigate using Google Maps
   */
  private async navigateWithGoogleMaps(
    latitude: number,
    longitude: number,
    name?: string
  ): Promise<void> {
    const destination = `${latitude},${longitude}`;
    const label = name ? encodeURIComponent(name) : '';
    
    const url = Platform.select({
      ios: `comgooglemaps://?daddr=${destination}&directionsmode=driving${label ? `&q=${label}` : ''}`,
      android: `google.navigation:q=${destination}${label ? `&label=${label}` : ''}`,
    });

    const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}${label ? `&destination_place_id=${label}` : ''}`;

    try {
      if (url && await Linking.canOpenURL(url)) {
        await Linking.openURL(url);
      } else {
        await Linking.openURL(webUrl);
      }
    } catch (error) {
      throw new Error('Failed to open Google Maps');
    }
  }

  /**
   * Navigate using Apple Maps (iOS only)
   */
  private async navigateWithAppleMaps(
    latitude: number,
    longitude: number,
    name?: string
  ): Promise<void> {
    if (Platform.OS !== 'ios') {
      throw new Error('Apple Maps is only available on iOS');
    }

    const destination = `${latitude},${longitude}`;
    const label = name ? encodeURIComponent(name) : '';
    const url = `http://maps.apple.com/?daddr=${destination}&dirflg=d${label ? `&q=${label}` : ''}`;

    try {
      if (await Linking.canOpenURL(url)) {
        await Linking.openURL(url);
      } else {
        throw new Error('Apple Maps not available');
      }
    } catch (error) {
      throw new Error('Failed to open Apple Maps');
    }
  }

  /**
   * Navigate using Waze
   */
  private async navigateWithWaze(latitude: number, longitude: number): Promise<void> {
    const url = `waze://?ll=${latitude},${longitude}&navigate=yes`;
    const webUrl = `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`;

    try {
      if (await Linking.canOpenURL(url)) {
        await Linking.openURL(url);
      } else {
        await Linking.openURL(webUrl);
      }
    } catch (error) {
      throw new Error('Failed to open Waze');
    }
  }

  /**
   * Check if a navigation app is available
   */
  async isNavigationAppAvailable(app: NavigationApp): Promise<boolean> {
    let url: string;

    switch (app) {
      case NavigationApp.GOOGLE_MAPS:
        url = Platform.select({
          ios: 'comgooglemaps://',
          android: 'google.navigation:',
        }) || '';
        break;
      case NavigationApp.APPLE_MAPS:
        url = Platform.OS === 'ios' ? 'http://maps.apple.com/' : '';
        break;
      case NavigationApp.WAZE:
        url = 'waze://';
        break;
      default:
        return false;
    }

    if (!url) return false;

    try {
      return await Linking.canOpenURL(url);
    } catch {
      return false;
    }
  }

  /**
   * Get available navigation apps
   */
  async getAvailableNavigationApps(): Promise<NavigationApp[]> {
    const apps = [
      NavigationApp.GOOGLE_MAPS,
      ...(Platform.OS === 'ios' ? [NavigationApp.APPLE_MAPS] : []),
      NavigationApp.WAZE,
    ];

    const availableApps: NavigationApp[] = [];

    for (const app of apps) {
      if (await this.isNavigationAppAvailable(app)) {
        availableApps.push(app);
      }
    }

    return availableApps;
  }

  /**
   * Calculate estimated travel time (basic implementation)
   * In a real app, you'd use a routing service like Google Directions API
   */
  estimateTravelTime(
    fromLatitude: number,
    fromLongitude: number,
    toLatitude: number,
    toLongitude: number
  ): number {
    // Calculate straight-line distance
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(toLatitude - fromLatitude);
    const dLon = this.toRadians(toLongitude - fromLongitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(fromLatitude)) *
        Math.cos(this.toRadians(toLatitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    // Rough estimate: assume average speed of 40 km/h in city
    const estimatedTimeHours = distance / 40;
    return Math.round(estimatedTimeHours * 60); // Return minutes
  }

  /**
   * Format travel time for display
   */
  formatTravelTime(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    
    return `${hours}h ${remainingMinutes}m`;
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

export const navigationService = new NavigationService();