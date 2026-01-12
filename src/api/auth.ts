/**
 * Authentication API Service
 */

import apiClient from './config';
import {
  ApiResponse,
  SendOTPRequest,
  SendOTPResponse,
  VerifyOTPRequest,
  VerifyOTPResponse,
  UpdateNameRequest,
  UpdateNameResponse,
  ResendOTPRequest,
  ResendOTPResponse,
  UpdateCustomerDetailsRequest,
  UpdateCustomerDetailsResponse,
  GetCustomerDetailsResponse,
  RegisterDeviceRequest,
  RegisterDeviceResponse,
} from './types';
import { TokenStorage } from './config';

/**
 * Send OTP to phone number
 */
export const sendOTP = async (mobileNo: string): Promise<SendOTPResponse> => {
  try {
    const response = await apiClient.post<ApiResponse<SendOTPResponse>>('/api/auth/send-otp', {
      mobileNo,
    } as SendOTPRequest);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Failed to send OTP');
  } catch (error: any) {
    throw error;
  }
};

/**
 * Verify OTP
 */
export const verifyOTP = async (
  mobileNo: string,
  otp: string,
  userType: string = 'customer'
): Promise<VerifyOTPResponse> => {
  try {
    const response = await apiClient.post<ApiResponse<VerifyOTPResponse>>('/api/auth/verify-otp', {
      mobileNo,
      otp,
      userType,
    } as VerifyOTPRequest);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Failed to verify OTP');
  } catch (error: any) {
    throw error;
  }
};

/**
 * Resend OTP
 */
export const resendOTP = async (phoneNumber: string, sessionId?: string): Promise<ResendOTPResponse> => {
  try {
    const response = await apiClient.post<ApiResponse<ResendOTPResponse>>('/api/auth/resend-otp', {
      mobileNo: phoneNumber,
      sessionId,
    } as ResendOTPRequest);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Failed to resend OTP');
  } catch (error: any) {
    throw error;
  }
};

/**
 * Update user name
 */
export const updateName = async (name: string): Promise<UpdateNameResponse> => {
  try {
    const response = await apiClient.put<ApiResponse<UpdateNameResponse>>('/api/auth/update-name', {
      name,
    } as UpdateNameRequest);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Failed to update name');
  } catch (error: any) {
    throw error;
  }
};

/**
 * Get customer details
 */
export const getCustomerDetails = async (userId: string): Promise<GetCustomerDetailsResponse> => {
  try {
    const response = await apiClient.get<ApiResponse<GetCustomerDetailsResponse>>(
      `/api/customer/get-details/${userId}`
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Failed to get customer details');
  } catch (error: any) {
    throw error;
  }
};

/**
 * Update customer details
 */
export const updateCustomerDetails = async (
  userId: string,
  customerName: string
): Promise<UpdateCustomerDetailsResponse> => {
  try {
    const response = await apiClient.patch<ApiResponse<UpdateCustomerDetailsResponse>>(
      `/api/customer/update-details/${userId}`,
      {
        customerName,
      } as UpdateCustomerDetailsRequest
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Failed to update customer details');
  } catch (error: any) {
    throw error;
  }
};

/**
 * Register device for push notifications
 */
export const registerDevice = async (
  userId: string,
  deviceData: RegisterDeviceRequest
): Promise<RegisterDeviceResponse> => {
  try {
    const response = await apiClient.patch<ApiResponse<RegisterDeviceResponse>>(
      `/api/notifications/${userId}/register-device`,
      deviceData
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Failed to register device');
  } catch (error: any) {
    throw error;
  }
};

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
  try {
    await apiClient.post('/auth/logout');
  } catch (error) {
    // Even if API call fails, clear local tokens
    console.error('Logout API error:', error);
  } finally {
    await TokenStorage.clearTokens();
  }
};

