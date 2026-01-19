/**
 * Businesses API Service
 */

import apiClient from './config';
import { ApiResponse, NearbyBusinessesResponse, BusinessDetails } from './types';

/**
 * Get nearby businesses
 */
export const getNearbyBusinesses = async (
  latitude: number,
  longitude: number,
  page: number = 1,
  category?: string,
  sort?: string
): Promise<NearbyBusinessesResponse> => {
  try {
    const response = await apiClient.get<ApiResponse<NearbyBusinessesResponse>>(
      '/api/businesses/nearby',
      {
        params: {
          lat: latitude,
          lng: longitude,
          page,
          ...(category ? { category } : {}),
          ...(sort ? { sort } : {}),
        },
      }
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Failed to get nearby businesses');
  } catch (error: any) {
    throw error;
  }
};

/**
 * Get business details
 */
export const getBusinessDetails = async (
  businessId: string,
  latitude: number,
  longitude: number
): Promise<BusinessDetails> => {
  try {
    const response = await apiClient.get<ApiResponse<BusinessDetails>>(
      `/api/businesses/${businessId}/details`,
      {
        params: {
          lat: latitude,
          lng: longitude,
        },
      }
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Failed to get business details');
  } catch (error: any) {
    throw error;
  }
};

