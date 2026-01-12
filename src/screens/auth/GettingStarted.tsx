import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Image, Text, ScrollView, StatusBar, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { showSuccessToast, showErrorToast, showWarningToast } from '../../utils/toast';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { typography, fonts } from '../../theme/fonts';
import { colors, getColorWithOpacity } from '../../theme/colors';
import { Button, PhoneNumberInput } from '../../components/auth';
import { authApi } from '../../api';
import { useUserStore } from '../../store/userStore';

const AuthBanner = require('../../assets/webp/Auth_banner.webp');

type Props = NativeStackScreenProps<RootStackParamList, 'GettingStarted'>;

const GettingStarted = ({ navigation }: Props) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const setPhoneNumberInStore = useUserStore((state) => state.setPhoneNumber);

  // Check if phone number has exactly 10 digits
  const isPhoneValid = phoneNumber.length === 10;

  // Listen to keyboard events
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleContinue = async () => {
    if (!isPhoneValid) {
      showWarningToast({
        message: 'Invalid Phone Number',
        description: 'Please enter a valid 10-digit phone number',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.sendOTP(phoneNumber);
      
      // Store phone number in store
      await setPhoneNumberInStore(phoneNumber);

      showSuccessToast({
        message: 'OTP Sent',
        description: response.message || 'OTP has been sent to your phone number',
      });

      // Navigate to OTP screen with phone number
      navigation.navigate('OTPScreen', {
        phoneNumber,
      });
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to send OTP. Please try again.';
      showErrorToast({
        message: 'Error',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle="light-content" 
        translucent 
        backgroundColor="transparent" 
      />
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Banner Image - Top Half with Status Bar Overlay */}
        <View style={[
          styles.bannerContainer,
          isKeyboardVisible && styles.bannerContainerKeyboardVisible
        ]}>
          <Image 
            source={AuthBanner} 
            style={styles.bannerImage}
            resizeMode="cover"
          />
        </View>

        {/* Bottom Half - Form Content */}
        <View style={styles.formContainer}>
          {/* Title Section - Hide when keyboard is visible */}
          {!isKeyboardVisible && (
            <View style={styles.titleContainer}>
              <Text style={styles.titleLine1}>India's Fastest</Text>
              <Text style={styles.titleLine2}>Booking Platform</Text>
            </View>
          )}

          {/* Divider with Text - Hide when keyboard is visible */}
          {!isKeyboardVisible && (
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Login or Signup</Text>
              <View style={styles.dividerLine} />
            </View>
          )}

          {/* Phone Number Input */}
          <View style={styles.inputWrapper}>
            <PhoneNumberInput
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Enter your phone number"
            />
          </View>

          {/* Next Button */}
          <View style={styles.buttonWrapper}>
            <Button
              title="Next"
              onPress={handleContinue}
              loading={isLoading}
              disabled={!isPhoneValid}
            />
          </View>

          {/* Terms and Conditions */}
          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              By continuing, you agree to our{' '}
              <Text style={styles.termsLink}>Terms and Conditions</Text>
            </Text>
          </View>
        </View>
      </ScrollView>
      <SafeAreaView style={styles.bottomSafeArea} edges={['bottom']} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollContent: {
    flexGrow: 1,
  },
  bannerContainer: {
    width: '100%',
    height: '50%',
    minHeight: 400,
    overflow: 'hidden',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    // Shadow for iOS
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    // Shadow for Android
    elevation: 8,
  },
  bannerContainerKeyboardVisible: {
    marginTop: -120,
    height: '50%',
    minHeight: 250,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bottomSafeArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
    marginTop: 24,
    backgroundColor: colors.background.primary,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  titleLine1: {
    ...typography.h1,
    color: colors.text.title,
    marginBottom: 4,
  },
  titleLine2: {
    ...typography.h1,
    color: colors.text.title,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.divider,
  },
  dividerText: {
    ...typography.dividerCaption,
    color: colors.divider.text,
    paddingHorizontal: 16,
  },
  inputWrapper: {
    marginBottom: 40,
  },
  buttonWrapper: {
    width: '100%',
    marginBottom: 16,
  },
  termsContainer: {
    alignItems: 'center',
    paddingTop: 8,
  },
  termsText: {
    ...typography.terms,
    color: getColorWithOpacity('#000000', 0.6),
    textAlign: 'center',
  },
  termsLink: {
    ...typography.terms,
    color: getColorWithOpacity('#000000', 0.6),
    fontFamily: fonts.manrope.semiBold,
  },
});

export default GettingStarted;

