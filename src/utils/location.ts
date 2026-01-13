/**
 * Location Permission and Geolocation Utility
 * Handles location permissions and geolocation for both Android and iOS
 * Uses native system permission dialogs
 */

import { Platform, PermissionsAndroid } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  timestamp?: number; // For caching
}

const CACHED_LOCATIONS_KEY = '@bookitall:cached_locations';
const MAX_CACHED_LOCATIONS = 10; // Keep last 10 locations

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
              maximumAge: 300000, // Use cached location for faster check
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
 * Optimized for speed: Uses cached location first, then network-based location
 * For city name, network location is sufficient and much faster than GPS
 */
export const getCurrentPosition = (): Promise<Coordinates> => {
  return new Promise((resolve, reject) => {
    // First attempt: Fast network-based location with cached data (instant if available)
    Geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        // If network location fails, try with GPS (slower but more accurate)
        // Error codes: 1=PERMISSION_DENIED, 2=POSITION_UNAVAILABLE, 3=TIMEOUT
        if (error.code === 3 || error.code === 2) {
          console.log('Network location unavailable, trying GPS...');
          Geolocation.getCurrentPosition(
            (position) => {
              resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              });
            },
            (gpsError) => {
              console.error('Error getting GPS position:', gpsError);
              reject(gpsError);
            },
            {
              enableHighAccuracy: true,
              timeout: 8000, // 8 seconds max for GPS
              maximumAge: 0,
            }
          );
        } else {
          console.error('Error getting current position:', error);
          reject(error);
        }
      },
      {
        enableHighAccuracy: false, // Network-based (faster)
        timeout: 5000, // 5 seconds max - fast timeout
        maximumAge: 300000, // Accept cached location up to 5 minutes old (instant if available)
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
      try {
        // Get coordinates
        const coordinates = await getCurrentPosition();
        // Reverse geocode to get city name
        const locationInfo = await reverseGeocode(coordinates);
        // Save to cache
        await saveLocationToCache(locationInfo);
        return locationInfo;
      } catch (error: any) {
        // Handle timeout or other location errors gracefully
        if (error.code === 3) {
          console.log('Location request timed out, using default city');
        } else if (error.code === 1) {
          console.log('Location permission denied');
        } else {
          console.error('Error getting location:', error);
        }
        return null;
      }
    } else if (permissionStatus === 'denied') {
      // Request permission
      const granted = await requestLocationPermission();
      if (granted) {
        try {
          // Get coordinates
          const coordinates = await getCurrentPosition();
          // Reverse geocode to get city name
          const locationInfo = await reverseGeocode(coordinates);
          // Save to cache
          await saveLocationToCache(locationInfo);
          return locationInfo;
        } catch (error: any) {
          // Handle timeout or other location errors gracefully
          if (error.code === 3) {
            console.log('Location request timed out after permission granted');
          } else {
            console.error('Error getting location:', error);
          }
          return null;
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting current location:', error);
    return null;
  }
};

/**
 * Save location to cache
 */
export const saveLocationToCache = async (locationInfo: LocationInfo): Promise<void> => {
  try {
    const cachedLocations = await getCachedLocations();
    
    // Add timestamp
    const locationWithTimestamp: LocationInfo = {
      ...locationInfo,
      timestamp: Date.now(),
    };

    // Remove duplicate if exists (same city)
    const filtered = cachedLocations.filter(
      (loc) => loc.city !== locationInfo.city
    );

    // Add new location at the beginning
    const updated = [locationWithTimestamp, ...filtered];

    // Keep only last MAX_CACHED_LOCATIONS
    const trimmed = updated.slice(0, MAX_CACHED_LOCATIONS);

    await AsyncStorage.setItem(CACHED_LOCATIONS_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Error saving location to cache:', error);
  }
};

/**
 * Get all cached locations
 */
export const getCachedLocations = async (): Promise<LocationInfo[]> => {
  try {
    const cached = await AsyncStorage.getItem(CACHED_LOCATIONS_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
    return [];
  } catch (error) {
    console.error('Error getting cached locations:', error);
    return [];
  }
};

/**
 * Clear all cached locations
 */
export const clearCachedLocations = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(CACHED_LOCATIONS_KEY);
  } catch (error) {
    console.error('Error clearing cached locations:', error);
  }
};

