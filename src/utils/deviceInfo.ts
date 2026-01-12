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
 */
export const getFCMToken = async (): Promise<string | null> => {
  try {
    const token = await messaging().getToken();
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

