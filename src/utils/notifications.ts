/**
 * Notification Permission Utility
 * Handles notification permissions for both Android and iOS
 */

import { Platform, PermissionsAndroid, Alert } from 'react-native';
import messaging from '@react-native-firebase/messaging';

export type NotificationPermissionStatus = 'granted' | 'denied' | 'blocked' | 'unavailable';

/**
 * Request notification permission for Android
 */
const requestAndroidPermission = async (): Promise<boolean> => {
  try {
    // Android 13+ (API level 33+) uses POST_NOTIFICATIONS permission
    if (Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        {
          title: 'Notification Permission',
          message: 'We need permission to send you notifications',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
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
      if (Platform.Version >= 33) {
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
 * Shows appropriate prompt based on platform
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

/**
 * Show permission prompt alert
 */
export const showPermissionAlert = (
  onAllow: () => void,
  onDeny?: () => void
): void => {
  Alert.alert(
    'Enable Notifications',
    'We would like to send you notifications to keep you updated. Please enable notifications in your settings.',
    [
      {
        text: 'Not Now',
        style: 'cancel',
        onPress: onDeny,
      },
      {
        text: 'Allow',
        onPress: onAllow,
        style: 'default',
      },
    ],
    { cancelable: true }
  );
};

