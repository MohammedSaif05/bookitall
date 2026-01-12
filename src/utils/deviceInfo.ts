/**
 * Device Information Utility
 * Gets device information for API registration
 */

import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';

export interface DeviceInfoData {
  deviceId: string;
  platform: 'ios' | 'android';
  appVersion: string;
  fcmToken: string | null;
}

/**
 * Get device unique ID
 */
export const getDeviceId = async (): Promise<string> => {
  try {
    const deviceId = await DeviceInfo.getUniqueId();
    return deviceId;
  } catch (error) {
    console.error('Error getting device ID:', error);
    throw new Error('Failed to get device ID');
  }
};

/**
 * Get platform name
 */
export const getPlatform = (): 'ios' | 'android' => {
  return Platform.OS as 'ios' | 'android';
};

/**
 * Get app version
 */
export const getAppVersion = (): string => {
  try {
    return DeviceInfo.getVersion();
  } catch (error) {
    console.error('Error getting app version:', error);
    return '1.0.0'; // Fallback version
  }
};

/**
 * Get FCM token
 * Note: Deprecation warning is expected - React Native Firebase is preparing for v22 modular API migration
 * The current API (messaging().getToken()) is correct and functional
 * This will be updated when React Native Firebase releases stable modular API
 */
export const getFCMToken = async (): Promise<string | null> => {
  try {
    // Get default messaging instance (uses default Firebase app automatically)
    const messagingInstance = messaging();
    // Get FCM token - this is the correct current API
    const token = await messagingInstance.getToken();
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

/**
 * Get all device information
 */
export const getDeviceInfo = async (): Promise<DeviceInfoData> => {
  try {
    const [deviceId, fcmToken] = await Promise.all([
      getDeviceId(),
      getFCMToken(),
    ]);

    return {
      deviceId,
      platform: getPlatform(),
      appVersion: getAppVersion(),
      fcmToken,
    };
  } catch (error) {
    console.error('Error getting device info:', error);
    throw error;
  }
};

