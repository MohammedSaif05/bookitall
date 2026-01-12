/**
 * Modern Toast Message Utility
 * Production-ready toast notifications with beautiful styling
 */

import { showMessage, MessageOptions } from 'react-native-flash-message';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

interface ToastOptions {
  message: string;
  description?: string;
  duration?: number;
}

/**
 * Show success toast with modern styling
 */
export const showSuccessToast = ({ message, description, duration = 3000 }: ToastOptions) => {
  showMessage({
    message,
    description,
    type: 'success',
    duration,
    style: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderRadius: 12,
      marginHorizontal: 16,
      marginBottom: 20,
      backgroundColor: colors.status.success,
      borderLeftWidth: 0,
      borderRightWidth: 0,
      borderTopWidth: 0,
      borderBottomWidth: 0,
      // Shadow for iOS
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      // Shadow for Android
      elevation: 8,
    },
    titleStyle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
      fontFamily: fonts.manrope.semiBold,
      marginBottom: description ? 4 : 0,
    },
    textStyle: {
      fontSize: 14,
      fontWeight: '400',
      color: '#FFFFFF',
      fontFamily: fonts.manrope.regular,
      lineHeight: 20,
    },
  } as MessageOptions);
};

/**
 * Show error toast with modern styling
 */
export const showErrorToast = ({ message, description, duration = 4000 }: ToastOptions) => {
  showMessage({
    message,
    description,
    type: 'danger',
    duration,
    style: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderRadius: 12,
      marginHorizontal: 16,
      marginBottom: 20,
      backgroundColor: colors.status.error,
      borderLeftWidth: 0,
      borderRightWidth: 0,
      borderTopWidth: 0,
      borderBottomWidth: 0,
      // Shadow for iOS
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      // Shadow for Android
      elevation: 8,
    },
    titleStyle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
      fontFamily: fonts.manrope.semiBold,
      marginBottom: description ? 4 : 0,
    },
    textStyle: {
      fontSize: 14,
      fontWeight: '400',
      color: '#FFFFFF',
      fontFamily: fonts.manrope.regular,
      lineHeight: 20,
    },
  } as MessageOptions);
};

/**
 * Show warning toast with modern styling
 */
export const showWarningToast = ({ message, description, duration = 3000 }: ToastOptions) => {
  showMessage({
    message,
    description,
    type: 'warning',
    duration,
    style: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderRadius: 12,
      marginHorizontal: 16,
      marginBottom: 20,
      backgroundColor: colors.status.warning,
      borderLeftWidth: 0,
      borderRightWidth: 0,
      borderTopWidth: 0,
      borderBottomWidth: 0,
      // Shadow for iOS
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      // Shadow for Android
      elevation: 8,
    },
    titleStyle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
      fontFamily: fonts.manrope.semiBold,
      marginBottom: description ? 4 : 0,
    },
    textStyle: {
      fontSize: 14,
      fontWeight: '400',
      color: '#FFFFFF',
      fontFamily: fonts.manrope.regular,
      lineHeight: 20,
    },
  } as MessageOptions);
};

/**
 * Show info toast with modern styling
 */
export const showInfoToast = ({ message, description, duration = 3000 }: ToastOptions) => {
  showMessage({
    message,
    description,
    type: 'info',
    duration,
    style: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderRadius: 12,
      marginHorizontal: 16,
      marginBottom: 20,
      backgroundColor: colors.status.info,
      borderLeftWidth: 0,
      borderRightWidth: 0,
      borderTopWidth: 0,
      borderBottomWidth: 0,
      // Shadow for iOS
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      // Shadow for Android
      elevation: 8,
    },
    titleStyle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
      fontFamily: fonts.manrope.semiBold,
      marginBottom: description ? 4 : 0,
    },
    textStyle: {
      fontSize: 14,
      fontWeight: '400',
      color: '#FFFFFF',
      fontFamily: fonts.manrope.regular,
      lineHeight: 20,
    },
  } as MessageOptions);
};

