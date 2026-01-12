import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Image, Text, ScrollView, StatusBar, Keyboard, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { showSuccessToast, showErrorToast, showWarningToast } from '../../utils/toast';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { typography } from '../../theme/fonts';
import { colors } from '../../theme/colors';
import { Button } from '../../components/auth';
import OTPInput from '../../components/auth/OTPInput';
import { authApi } from '../../api';
import { useUserStore } from '../../store/userStore';

const HeaderLogo = require('../../assets/webp/header_logo.webp');

type Props = NativeStackScreenProps<RootStackParamList, 'OTPScreen'>;

const OTPScreen = ({ navigation, route }: Props) => {
  const { phoneNumber } = route.params;
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(45); // 45 seconds timer
  const [isLoading, setIsLoading] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const setUserId = useUserStore((state) => state.setUserId);

  useEffect(() => {
    // Timer countdown
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [timer]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showListener = Keyboard.addListener(showEvent, () => setIsKeyboardVisible(true));
    const hideListener = Keyboard.addListener(hideEvent, () => setIsKeyboardVisible(false));

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  const formatTimer = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleOTPComplete = (otpValue: string) => {
    setOtp(otpValue);
  };

  const handleVerify = async () => {
    if (otp.length !== 6) {
      showWarningToast({
        message: 'Invalid OTP',
        description: 'Please enter a valid 6-digit OTP',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Step 1: Verify OTP
      const verifyResponse = await authApi.verifyOTP(phoneNumber, otp, 'customer');
      
      // Store userId in store and AsyncStorage
      if (verifyResponse.userId) {
        await setUserId(verifyResponse.userId);
      }

      showSuccessToast({
        message: 'OTP Verified',
        description: verifyResponse.message || 'Phone number verified successfully',
      });

      // Step 2: Get customer details immediately after verification
      try {
        const customerDetails = await authApi.getCustomerDetails(verifyResponse.userId);
        
        // Check if customerName exists
        if (customerDetails.customerName && customerDetails.customerName.trim().length > 0) {
          // Customer name exists, navigate to Dashboard
          navigation.navigate('Dashboard');
        } else {
          // Customer name doesn't exist, navigate to NameScreen
          navigation.navigate('NameScreen');
        }
      } catch (detailsError: any) {
        // If get-details fails, still navigate to NameScreen as fallback
        console.error('Error fetching customer details:', detailsError);
        navigation.navigate('NameScreen');
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Invalid OTP. Please try again.';
      showErrorToast({
        message: 'Verification Failed',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditNumber = () => {
    navigation.goBack();
  };

  const handleResendOTP = () => {
    if (timer === 0) {
      setTimer(45); // Restart timer to 45 seconds
      // Add your resend OTP API call here
      console.log('Resending OTP...');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor={colors.background.primary}
      />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Logo */}
          <View style={styles.header}>
            <Image 
              source={HeaderLogo} 
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Main Content */}
          <View style={styles.content}>
            {/* Instruction Text */}
            <Text style={styles.instructionText}>
              Enter the 6-digit{'\n'}OTP sent to{'\n'}your phone
            </Text>

            {/* Resend Timer or Resend Button */}
            {timer > 0 ? (
              <Text style={styles.timerText}>
                Resend OTP in {formatTimer(timer)}
              </Text>
            ) : (
              <Text style={styles.resendText} onPress={handleResendOTP}>
                Resend OTP
              </Text>
            )}

            {/* OTP Input */}
            <OTPInput 
              length={6}
              onChange={setOtp}
              onComplete={handleOTPComplete}
            />

            {isKeyboardVisible && (
              <View style={[styles.buttonContainer, styles.buttonContainerInline]}>
                <View style={styles.buttonRow}>
                  {/* Edit Number Button */}
                  <View style={styles.editButtonWrapper}>
                    <Button
                      title="Edit number"
                      onPress={handleEditNumber}
                      variant="secondary"
                      style={styles.editButton}
                      textStyle={styles.editButtonText}
                    />
                  </View>

                  {/* Verify Button */}
                  <View style={styles.verifyButtonWrapper}>
                    <Button
                      title="Verify"
                      onPress={handleVerify}
                      loading={isLoading}
                      disabled={otp.length !== 6}
                      style={styles.verifyButton}
                    />
                  </View>
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Bottom Buttons (hidden when keyboard is open) */}
        {!isKeyboardVisible && (
          <View style={styles.buttonContainer}>
            <View style={styles.buttonRow}>
              {/* Edit Number Button */}
              <View style={styles.editButtonWrapper}>
                <Button
                  title="Edit number"
                  onPress={handleEditNumber}
                  variant="secondary"
                  style={styles.editButton}
                  textStyle={styles.editButtonText}
                />
              </View>

              {/* Verify Button */}
              <View style={styles.verifyButtonWrapper}>
                <Button
                  title="Verify"
                  onPress={handleVerify}
                  loading={isLoading}
                  disabled={otp.length !== 6}
                  style={styles.verifyButton}
                />
              </View>
            </View>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    paddingTop: 32,
    paddingBottom: 24,
  },
  logo: {
    width: 120,
    height: 32,
  },
  content: {
    flex: 1,
    marginTop: 32,
  },
  instructionText: {
    ...typography.h1,
    color: colors.text.black,
    marginBottom: 16,
  },
  timerText: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  resendText: {
    ...typography.body,
    color: colors.button.primary,
    marginBottom: 8,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 16,
  },
  buttonContainerInline: {
    paddingHorizontal: 0, // avoid double padding (scroll already has 24px)
    paddingBottom: 0,
    marginTop: 24,
    width: '100%', // match bottom full-width sizing
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  editButtonWrapper: {
    flex: 1,
  },
  editButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.button.primary,
    paddingHorizontal: 20,
  },
  editButtonText: {
    color: colors.text.black,
  },
  verifyButtonWrapper: {
    flex: 1,
  },
  verifyButton: {
    backgroundColor: colors.button.primary,
  },
});

export default OTPScreen;

