import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import LottieView from 'lottie-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { Button } from '../../components/auth';
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
import { useUserStore } from '../../store/userStore';
import { authApi } from '../../api';

const SuccessAnimation = require('../../assets/lottie/Success.json');

const PERMISSIONS_ASKED_KEY = '@bookitall:permissions_asked';

type Props = NativeStackScreenProps<RootStackParamList, 'SuccessScreen'>;

const SuccessScreen = ({ navigation }: Props) => {
  const userId = useUserStore((state) => state.userId);

  const registerDeviceForNotifications = async () => {
    if (!userId) {
      return;
    }

    try {
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

      if (!hasRegisteredBefore) {
        await AsyncStorage.setItem(notificationKey, 'true');
      }
    } catch (error: any) {
      console.error('Error registering device:', error);
    }
  };

  useEffect(() => {
    const requestPermissions = async () => {
      try {
        // Check if permissions were already asked
        const permissionsAsked = await AsyncStorage.getItem(PERMISSIONS_ASKED_KEY);
        if (permissionsAsked === 'true') {
          return; // Permissions already asked, skip
        }

        // Request notification permission first
        const notificationStatus = await checkNotificationPermission();
        if (notificationStatus === 'denied') {
          await requestNotificationPermission();
        }
        // Register device for notifications if permission is granted
        if (notificationStatus === 'granted' || notificationStatus === 'denied') {
          const granted = notificationStatus === 'granted' || await checkNotificationPermission() === 'granted';
          if (granted && userId) {
            await registerDeviceForNotifications();
          }
        }

        // Request location permission after notification permission
        const locationStatus = await checkLocationPermission();
        if (locationStatus === 'denied') {
          await requestLocationPermission();
          // Try to get location if permission was granted
          const locationGranted = await checkLocationPermission();
          if (locationGranted === 'granted') {
            await getCurrentLocation();
          }
        } else if (locationStatus === 'granted') {
          await getCurrentLocation();
        }

        // Mark that permissions were asked
        await AsyncStorage.setItem(PERMISSIONS_ASKED_KEY, 'true');
      } catch (error) {
        console.error('Error requesting permissions:', error);
        // Still mark as asked to avoid blocking the flow
        await AsyncStorage.setItem(PERMISSIONS_ASKED_KEY, 'true');
      }
    };

    requestPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleContinue = () => {
    navigation.navigate('Dashboard');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <LottieView
          source={SuccessAnimation}
          autoPlay
          loop={false}
          style={styles.animation}
        />
        <Text style={styles.title}>Your account is all set !</Text>
        <Text style={styles.subtitle}>Everything is ready-start exploring now</Text>
      </View>

      <SafeAreaView edges={['bottom']} style={styles.buttonWrapper}>
        <Button title="Continue to explore" onPress={handleContinue} />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.background.primary,
  },
  animation: {
    width: 340,
    height: 340,
    marginBottom: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 32,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonWrapper: {
    width: '100%',
    paddingHorizontal: 24,
  },
});

export default SuccessScreen;

