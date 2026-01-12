/**
 * Axios Configuration with Production-Ready Interceptors
 */

import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiError, ApiResponse } from './types';

/**
 * API Configuration
 */
const API_CONFIG = {
  BASE_URL: 'https://bookitall-user-service.onrender.com',
  TIMEOUT: 30000, // 30 seconds
  RETRY_DELAY: 1000, // 1 second
  MAX_RETRIES: 3,
};

/**
 * Create Axios Instance
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

/**
 * Token Storage Interface
 * In production, use secure storage like react-native-keychain
 */
class TokenStorage {
  private static tokenKey = '@bookitall:auth_token';
  private static refreshTokenKey = '@bookitall:refresh_token';

  static async getToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem(this.tokenKey);
      return token || null;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  static async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(this.tokenKey, token);
    } catch (error) {
      console.error('Error setting token:', error);
    }
  }

  static async getRefreshToken(): Promise<string | null> {
    try {
      const refreshToken = await AsyncStorage.getItem(this.refreshTokenKey);
      return refreshToken || null;
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  static async setRefreshToken(refreshToken: string): Promise<void> {
    try {
      await AsyncStorage.setItem(this.refreshTokenKey, refreshToken);
    } catch (error) {
      console.error('Error setting refresh token:', error);
    }
  }

  static async clearTokens(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([this.tokenKey, this.refreshTokenKey]);
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }
}

/**
 * Request Interceptor
 * - Adds authentication token to requests
 * - Adds request ID for tracking
 * - Logs requests in development
 */
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Add auth token if available
    const token = await TokenStorage.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request ID for tracking
    if (config.headers) {
      config.headers['X-Request-ID'] = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Log request in development
    if (__DEV__) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
      });
    }

    return config;
  },
  (error: AxiosError) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * - Handles response transformation
 * - Handles error responses
 * - Implements token refresh logic
 * - Retry logic for failed requests
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    // Log response in development
    if (__DEV__) {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }

    // Response is already in the correct format
    return response;
  },
  async (error: AxiosError<ApiResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Log error in development
    if (__DEV__) {
      console.error(`[API Error] ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    }

    // Handle 401 Unauthorized - Token expired or invalid
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await TokenStorage.getRefreshToken();
        
        if (refreshToken) {
          // Attempt to refresh token
          const refreshResponse = await axios.post<ApiResponse<{ token: string; refreshToken: string }>>(
            `${API_CONFIG.BASE_URL}/auth/refresh`,
            { refreshToken }
          );

          if (refreshResponse.data.data?.token) {
            await TokenStorage.setToken(refreshResponse.data.data.token);
            if (refreshResponse.data.data.refreshToken) {
              await TokenStorage.setRefreshToken(refreshResponse.data.data.refreshToken);
            }

            // Retry original request with new token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.data.token}`;
            }
            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh failed - clear tokens and redirect to login
        await TokenStorage.clearTokens();
        // TODO: Navigate to login screen
        return Promise.reject(refreshError);
      }
    }

    // Handle network errors
    if (!error.response) {
      const networkError: ApiError = {
        message: 'Network error. Please check your internet connection.',
        code: 'NETWORK_ERROR',
      };
      return Promise.reject(networkError);
    }

    // Handle server errors
    const errorData = error.response.data as any;
    const apiError: ApiError = {
      message: errorData?.message || errorData?.error || error.message || 'An unexpected error occurred',
      status: error.response.status,
      code: errorData?.error || 'UNKNOWN_ERROR',
      errors: errorData?.errors,
    };

    return Promise.reject(apiError);
  }
);

/**
 * Export configured API client
 */
export default apiClient;

/**
 * Export token storage utilities
 */
export { TokenStorage, API_CONFIG };

