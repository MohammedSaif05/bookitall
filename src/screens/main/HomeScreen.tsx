import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/fonts';
import { useUserStore } from '../../store/userStore';
import {
  checkNotificationPermission,
  requestNotificationPermission,
} from '../../utils/notifications';
import { getDeviceInfo } from '../../utils/deviceInfo';
import { authApi } from '../../api';
import { showSuccessToast, showErrorToast } from '../../utils/toast';

const HomeScreen = () => {
  const userId = useUserStore((state) => state.userId);
  const [isCheckingPermissions, setIsCheckingPermissions] = useState(true);

  useEffect(() => {
    checkAndRegisterNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const checkAndRegisterNotifications = async () => {
    if (!userId) {
      setIsCheckingPermissions(false);
      return;
    }

    try {
      const permissionStatus = await checkNotificationPermission();

      if (permissionStatus === 'granted') {
        await registerDeviceForNotifications();
      } else if (permissionStatus === 'denied') {
        const granted = await requestNotificationPermission();
        if (granted) {
          await registerDeviceForNotifications();
        } else {
          showErrorToast({
            message: 'Permission Denied',
            description: 'Notification permission was denied. You can enable it later in settings.',
          });
        }
      } else if (permissionStatus === 'blocked') {
        showErrorToast({
          message: 'Notifications Blocked',
          description: 'Notifications are blocked. Please enable them in your device settings.',
        });
      }
    } catch (error) {
      console.error('Error checking notification permissions:', error);
    } finally {
      setIsCheckingPermissions(false);
    }
  };

  const registerDeviceForNotifications = async () => {
    if (!userId) {
      return;
    }

    try {
      const deviceInfo = await getDeviceInfo();

      if (!deviceInfo.fcmToken) {
        console.warn('FCM token not available');
        return;
      }

      await authApi.registerDevice(userId, {
        deviceId: deviceInfo.deviceId,
        platform: deviceInfo.platform,
        fcmToken: deviceInfo.fcmToken,
        appVersion: deviceInfo.appVersion,
      });

      showSuccessToast({
        message: 'Notifications Enabled',
        description: 'You will now receive push notifications',
      });
    } catch (error: any) {
      console.error('Error registering device:', error);
      const errorMessage = error?.message || 'Failed to register device for notifications';
      showErrorToast({
        message: 'Registration Failed',
        description: errorMessage,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <Text style={styles.title}>Home</Text>
        <Text style={styles.subtitle}>
          {isCheckingPermissions
            ? 'Setting up notifications...'
            : 'This screen will be built later'}
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    ...typography.h1,
    color: colors.text.black,
    marginBottom: 16,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

export default HomeScreen;
