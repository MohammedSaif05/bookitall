import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../theme/colors';
import { typography, fonts } from '../../theme/fonts';
import { ms, hs, vs } from '../../theme/scaling';
import { useUserStore } from '../../store/userStore';
import {
  checkNotificationPermission,
  requestNotificationPermission,
} from '../../utils/notifications';
import {
  checkLocationPermission,
  requestLocationPermission,
  getCurrentLocation,
} from '../../utils/location';
import { getDeviceInfo } from '../../utils/deviceInfo';
import { authApi } from '../../api';
import { showSuccessToast, showErrorToast } from '../../utils/toast';
import LocationIcon from '../../assets/icons/svg/location.svg';
import NotificationIcon from '../../assets/icons/svg/notification.svg';
import DropDownIcon from '../../assets/icons/svg/drop_down.svg';

const HomeScreen = () => {
  const userId = useUserStore((state) => state.userId);
  const [isCheckingPermissions, setIsCheckingPermissions] = useState(true);
  const [customerName, setCustomerName] = useState<string>('');
  const [isLoadingCustomerName, setIsLoadingCustomerName] = useState(true);
  const [cityName, setCityName] = useState<string>('');
  const [isLoadingCity, setIsLoadingCity] = useState<boolean>(true);

  useEffect(() => {
    checkAndRegisterNotifications();
    fetchCustomerDetails();
    checkAndGetLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const fetchCustomerDetails = async () => {
    if (!userId) {
      setIsLoadingCustomerName(false);
      return;
    }

    try {
      const details = await authApi.getCustomerDetails(userId);
      if (details.customerName) {
        setCustomerName(details.customerName);
      }
    } catch (error) {
      console.error('Error fetching customer details:', error);
    } finally {
      setIsLoadingCustomerName(false);
    }
  };

  const checkAndGetLocation = async () => {
    try {
      const permissionStatus = await checkLocationPermission();

      if (permissionStatus === 'granted') {
        await getLocationAndUpdateCity();
      } else if (permissionStatus === 'denied') {
        const granted = await requestLocationPermission();
        if (granted) {
          await getLocationAndUpdateCity();
        } else {
          // Permission denied, use default city
          setCityName('Hosur');
          setIsLoadingCity(false);
          console.log('Location permission denied, using default city');
        }
      } else if (permissionStatus === 'blocked') {
        // Location is blocked, use default city
        setCityName('Hosur');
        setIsLoadingCity(false);
        console.log('Location permission blocked, using default city');
      } else {
        // Unavailable or other status, use default city
        setCityName('Hosur');
        setIsLoadingCity(false);
      }
    } catch (error) {
      console.error('Error checking location permissions:', error);
      setCityName('Hosur');
      setIsLoadingCity(false);
    }
  };

  const getLocationAndUpdateCity = async () => {
    try {
      const locationInfo = await getCurrentLocation();
      if (locationInfo && locationInfo.city) {
        setCityName(locationInfo.city);
      } else {
        // Fallback to default city if location info is not available
        setCityName('Hosur');
      }
    } catch (error) {
      console.error('Error getting location:', error);
      // Use default city on error
      setCityName('Hosur');
    } finally {
      setIsLoadingCity(false);
    }
  };

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
      // Check if notification has been registered before for this userId
      const notificationKey = `@bookitall:notification_registered:${userId}`;
      const hasRegisteredBefore = await AsyncStorage.getItem(notificationKey);

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

      // Only show success toast on first registration
      if (!hasRegisteredBefore) {
        showSuccessToast({
          message: 'Notifications Enabled',
          description: 'You will now receive push notifications',
        });
        // Mark as registered for this userId
        await AsyncStorage.setItem(notificationKey, 'true');
      }
      // Silently register on subsequent calls
    } catch (error: any) {
      console.error('Error registering device:', error);
      // Only show error toast if it's the first attempt
      const notificationKey = `@bookitall:notification_registered:${userId}`;
      const hasRegisteredBefore = await AsyncStorage.getItem(notificationKey);
      
      if (!hasRegisteredBefore) {
        const errorMessage = error?.message || 'Failed to register device for notifications';
        showErrorToast({
          message: 'Registration Failed',
          description: errorMessage,
        });
      }
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        {/* Left side - Greeting and Location */}
        <View style={styles.headerLeft}>
          <Text style={styles.greetingText}>
            Hi, {isLoadingCustomerName ? 'Loading...' : customerName || 'User'}
          </Text>
          <TouchableOpacity style={styles.locationContainer} activeOpacity={0.7}>
            <View style={styles.locationIconWrapper}>
              <LocationIcon width={ms(16)} height={ms(16)} />
            </View>
            <Text style={styles.locationText}>
              {isLoadingCity ? 'Loading...' : cityName || 'Hosur'}
            </Text>
            <View style={styles.dropdownIconWrapper}>
              <DropDownIcon width={ms(12)} height={ms(12)} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Right side - Notification Icon */}
        <TouchableOpacity style={styles.notificationButton} activeOpacity={0.7}>
          <View style={styles.notificationIconContainer}>
            <NotificationIcon width={ms(20)} height={ms(20)} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Content */}
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
    backgroundColor: colors.background.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: colors.background.white,
    paddingHorizontal: hs(20),
    paddingTop: vs(16),
    paddingBottom: vs(16),
  },
  headerLeft: {
    flex: 1,
  },
  greetingText: {
    fontFamily: fonts.manrope.bold,
    fontSize: ms(24),
    lineHeight: ms(32),
    color: colors.text.title,
    marginBottom: vs(2),
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIconWrapper: {
    marginRight: hs(6),
  },
  locationText: {
    fontFamily: fonts.manrope.regular,
    fontSize: ms(14),
    lineHeight: ms(20),
    color: colors.text.title,
    marginRight: hs(4),
  },
  dropdownIconWrapper: {
    marginLeft: hs(2),
  },
  notificationButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationIconContainer: {
    width: ms(40),
    height: ms(40),
    borderRadius: ms(20),
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: hs(24),
    backgroundColor: colors.background.white,
  },
  title: {
    ...typography.h1,
    color: colors.text.black,
    marginBottom: vs(16),
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

export default HomeScreen;
