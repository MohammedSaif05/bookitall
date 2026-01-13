/**
 * Location Permission and Geolocation Utility
 * Handles location permissions and geolocation for both Android and iOS
 * Uses native system permission dialogs
 */

import { Platform, PermissionsAndroid } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

export type LocationPermissionStatus = 'granted' | 'denied' | 'blocked' | 'unavailable';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationInfo {
  city: string;
  state?: string;
  country?: string;
  coordinates: Coordinates;
}

/**
 * Request location permission for Android
 * Shows native Android permission dialog (no custom dialog)
 */
const requestAndroidPermission = async (): Promise<boolean> => {
  try {
    // Request fine location permission (shows native system dialog)
    const fineLocationGranted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );

    if (fineLocationGranted === PermissionsAndroid.RESULTS.GRANTED) {
      return true;
    }

    // Try coarse location as fallback (shows native system dialog)
    const coarseLocationGranted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
    );

    return coarseLocationGranted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.error('Error requesting Android location permission:', err);
    return false;
  }
};

/**
 * Request location permission for iOS
 * Shows native iOS permission dialog
 * On iOS, permission dialog appears automatically when getCurrentPosition is called
 * This function attempts to get location which triggers the native permission dialog
 */
const requestIOSPermission = async (): Promise<boolean> => {
  try {
    // On iOS, the native permission dialog appears automatically when we try to get location
    // Attempt to get position with short timeout to trigger the permission dialog
    return new Promise((resolve) => {
      Geolocation.getCurrentPosition(
        () => {
          // Permission granted
          resolve(true);
        },
        (error) => {
          // Permission denied or error
          // Error code 1 = PERMISSION_DENIED
          resolve(error.code !== 1);
        },
        {
          enableHighAccuracy: false,
          timeout: 1000,
          maximumAge: 0,
        }
      );
    });
  } catch (err) {
    console.error('Error requesting iOS location permission:', err);
    return false;
  }
};

/**
 * Check current location permission status
 */
export const checkLocationPermission = async (): Promise<LocationPermissionStatus> => {
  try {
    if (Platform.OS === 'android') {
      const version = typeof Platform.Version === 'number' ? Platform.Version : parseInt(Platform.Version, 10);
      
      if (version >= 29) {
        const fineLocation = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        const coarseLocation = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
        );
        
        if (fineLocation || coarseLocation) {
          return 'granted';
        }
        return 'denied';
      }

      // Android < 10
      const fineLocation = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      return fineLocation ? 'granted' : 'denied';
    } else {
      // iOS - Check permission by attempting to get location
      // The community geolocation library doesn't have getAuthorizationStatus
      // So we'll check by trying to get position with a very short timeout
      try {
        return await new Promise<LocationPermissionStatus>((resolve) => {
          Geolocation.getCurrentPosition(
            () => {
              resolve('granted');
            },
            (error) => {
              if (error.code === 1) {
                // PERMISSION_DENIED
                resolve('denied');
              } else if (error.code === 2) {
                // POSITION_UNAVAILABLE
                resolve('unavailable');
              } else {
                resolve('denied');
              }
            },
            {
              enableHighAccuracy: false,
              timeout: 100,
              maximumAge: 0,
            }
          );
        });
      } catch {
        return 'unavailable';
      }
    }
  } catch (error) {
    console.error('Error checking location permission:', error);
    return 'unavailable';
  }
};

/**
 * Request location permission
 * Shows native system permission dialog directly
 */
export const requestLocationPermission = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'android') {
      return await requestAndroidPermission();
    } else {
      return await requestIOSPermission();
    }
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return false;
  }
};

/**
 * Get current GPS coordinates
 */
export const getCurrentPosition = (): Promise<Coordinates> => {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.error('Error getting current position:', error);
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  });
};

/**
 * Reverse geocode coordinates to get location information
 * Uses OpenStreetMap Nominatim API (free, no API key required)
 */
export const reverseGeocode = async (coordinates: Coordinates): Promise<LocationInfo> => {
  try {
    const { latitude, longitude } = coordinates;
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'BookItAll/1.0', // Required by Nominatim
      },
    });

    if (!response.ok) {
      throw new Error('Reverse geocoding failed');
    }

    const data = await response.json();
    const address = data.address || {};

    return {
      city: address.city || address.town || address.village || address.county || 'Unknown',
      state: address.state,
      country: address.country,
      coordinates,
    };
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    // Return default location info on error
    return {
      city: 'Unknown',
      coordinates,
    };
  }
};

/**
 * Get current location with city name
 * Combines permission check, location request, and reverse geocoding
 */
export const getCurrentLocation = async (): Promise<LocationInfo | null> => {
  try {
    // Check permission first
    const permissionStatus = await checkLocationPermission();

    if (permissionStatus === 'granted') {
      // Get coordinates
      const coordinates = await getCurrentPosition();
      // Reverse geocode to get city name
      const locationInfo = await reverseGeocode(coordinates);
      return locationInfo;
    } else if (permissionStatus === 'denied') {
      // Request permission
      const granted = await requestLocationPermission();
      if (granted) {
        // Get coordinates
        const coordinates = await getCurrentPosition();
        // Reverse geocode to get city name
        const locationInfo = await reverseGeocode(coordinates);
        return locationInfo;
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting current location:', error);
    return null;
  }
};

