/**
 * Notification Permission Utility
 * Handles notification permissions for both Android and iOS
 * Uses native system permission dialogs
 */

import { Platform, PermissionsAndroid } from 'react-native';
import messaging from '@react-native-firebase/messaging';

export type NotificationPermissionStatus = 'granted' | 'denied' | 'blocked' | 'unavailable';

/**
 * Request notification permission for Android
 * Shows native Android permission dialog
 */
const requestAndroidPermission = async (): Promise<boolean> => {
  try {
    // Android 13+ (API level 33+) uses POST_NOTIFICATIONS permission
    const version = typeof Platform.Version === 'number' ? Platform.Version : parseInt(Platform.Version, 10);
    if (version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    // For Android < 13, notifications are enabled by default
    return true;
  } catch (err) {
    console.error('Error requesting Android notification permission:', err);
    return false;
  }
};

/**
 * Request notification permission for iOS
 * Shows native iOS permission dialog
 */
const requestIOSPermission = async (): Promise<boolean> => {
  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    return enabled;
  } catch (err) {
    console.error('Error requesting iOS notification permission:', err);
    return false;
  }
};

/**
 * Check current notification permission status
 */
export const checkNotificationPermission = async (): Promise<NotificationPermissionStatus> => {
  try {
    if (Platform.OS === 'android') {
      const version = typeof Platform.Version === 'number' ? Platform.Version : parseInt(Platform.Version, 10);
      if (version >= 33) {
        const hasPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        return hasPermission ? 'granted' : 'denied';
      }
      // Android < 13, notifications are enabled by default
      return 'granted';
    } else {
      // iOS
      const authStatus = await messaging().hasPermission();
      if (authStatus === messaging.AuthorizationStatus.AUTHORIZED) {
        return 'granted';
      } else if (authStatus === messaging.AuthorizationStatus.DENIED) {
        return 'blocked';
      } else {
        return 'denied';
      }
    }
  } catch (error) {
    console.error('Error checking notification permission:', error);
    return 'unavailable';
  }
};

/**
 * Request notification permission
 * Shows native system permission dialog directly
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'android') {
      return await requestAndroidPermission();
    } else {
      return await requestIOSPermission();
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

