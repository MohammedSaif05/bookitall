import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, ScrollView, Keyboard, TouchableWithoutFeedback } from 'react-native';
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
  getCachedLocations,
  LocationInfo,
} from '../../utils/location';
import { getDeviceInfo } from '../../utils/deviceInfo';
import { authApi } from '../../api';
import { showSuccessToast, showErrorToast } from '../../utils/toast';
import LocationIcon from '../../assets/icons/svg/location.svg';
import NotificationIcon from '../../assets/icons/svg/notification.svg';
import DropDownIcon from '../../assets/icons/svg/drop_down.svg';
import { SearchBar, CategoriesList } from '../../components/common';

const HomeScreen = () => {
  const userId = useUserStore((state) => state.userId);
  const [isCheckingPermissions, setIsCheckingPermissions] = useState(true);
  const [customerName, setCustomerName] = useState<string>('');
  const [isLoadingCustomerName, setIsLoadingCustomerName] = useState(true);
  const [cityName, setCityName] = useState<string>('');
  const [isLoadingCity, setIsLoadingCity] = useState<boolean>(true);
  const [showLocationModal, setShowLocationModal] = useState<boolean>(false);
  const [cachedLocations, setCachedLocations] = useState<LocationInfo[]>([]);

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

  const loadCachedLocations = async () => {
    try {
      const cached = await getCachedLocations();
      setCachedLocations(cached);
    } catch (error) {
      console.error('Error loading cached locations:', error);
    }
  };

  const handleLocationPress = async () => {
    await loadCachedLocations();
    setShowLocationModal(true);
  };

  const handleLocationSelect = (location: LocationInfo) => {
    setCityName(location.city);
    setShowLocationModal(false);
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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Header */}
      <View style={styles.header}>
        {/* Left side - Greeting and Location */}
        <View style={styles.headerLeft}>
          <Text style={styles.greetingText}>
            Hi, {isLoadingCustomerName ? 'Loading...' : customerName || 'User'}
          </Text>
          <TouchableOpacity
            style={styles.locationContainer}
            activeOpacity={0.7}
            onPress={handleLocationPress}
          >
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

      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <SearchBar />
      </View>

      {/* Categories List */}
      <CategoriesList />

      {/* Location Picker Modal */}
      <Modal
        visible={showLocationModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLocationModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowLocationModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Location</Text>
              <TouchableOpacity
                onPress={() => setShowLocationModal(false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.locationsList}>
              {cachedLocations.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No cached locations</Text>
                  <Text style={styles.emptyStateSubtext}>
                    Your recent locations will appear here
                  </Text>
                </View>
              ) : (
                cachedLocations.map((location, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.locationItem,
                      cityName === location.city && styles.locationItemActive,
                    ]}
                    onPress={() => handleLocationSelect(location)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.locationItemIcon}>
                      <LocationIcon width={ms(20)} height={ms(20)} />
                    </View>
                    <View style={styles.locationItemText}>
                      <Text
                        style={[
                          styles.locationItemCity,
                          cityName === location.city && styles.locationItemCityActive,
                        ]}
                      >
                        {location.city}
                      </Text>
                      {location.state && (
                        <Text style={styles.locationItemState}>
                          {location.state}
                          {location.country && `, ${location.country}`}
                        </Text>
                      )}
                    </View>
                    {cityName === location.city && (
                      <View style={styles.locationItemCheck}>
                        <Text style={styles.locationItemCheckText}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

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
    </TouchableWithoutFeedback>
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
  searchBarContainer: {
    paddingHorizontal: hs(20),
    paddingTop: vs(0),
    paddingBottom: vs(8),
    backgroundColor: colors.background.white,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background.white,
    borderTopLeftRadius: ms(20),
    borderTopRightRadius: ms(20),
    maxHeight: '80%',
    paddingBottom: vs(20),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: hs(20),
    paddingTop: vs(20),
    paddingBottom: vs(16),
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  modalTitle: {
    fontFamily: fonts.manrope.bold,
    fontSize: ms(18),
    color: colors.text.title,
  },
  modalCloseButton: {
    width: ms(32),
    height: ms(32),
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: ms(24),
    color: colors.text.secondary,
    lineHeight: ms(24),
  },
  locationsList: {
    maxHeight: vs(400),
  },
  emptyState: {
    paddingVertical: vs(40),
    paddingHorizontal: hs(20),
    alignItems: 'center',
  },
  emptyStateText: {
    fontFamily: fonts.manrope.medium,
    fontSize: ms(16),
    color: colors.text.title,
    marginBottom: vs(8),
  },
  emptyStateSubtext: {
    fontFamily: fonts.manrope.regular,
    fontSize: ms(14),
    color: colors.text.secondary,
    textAlign: 'center',
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: hs(20),
    paddingVertical: vs(16),
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  locationItemActive: {
    backgroundColor: '#F8F9FA',
  },
  locationItemIcon: {
    marginRight: hs(12),
  },
  locationItemText: {
    flex: 1,
  },
  locationItemCity: {
    fontFamily: fonts.manrope.medium,
    fontSize: ms(16),
    color: colors.text.title,
    marginBottom: vs(4),
  },
  locationItemCityActive: {
    fontFamily: fonts.manrope.semiBold,
    color: colors.text.primary,
  },
  locationItemState: {
    fontFamily: fonts.manrope.regular,
    fontSize: ms(14),
    color: colors.text.secondary,
  },
  locationItemCheck: {
    width: ms(24),
    height: ms(24),
    borderRadius: ms(12),
    backgroundColor: colors.background.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationItemCheckText: {
    color: colors.text.white,
    fontSize: ms(14),
    fontFamily: fonts.manrope.bold,
  },
});

export default HomeScreen;
