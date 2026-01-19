/**
 * Businesses API Service
 */

import apiClient from './config';
import { ApiResponse, NearbyBusinessesResponse } from './types';

/**
 * Get nearby businesses
 */
export const getNearbyBusinesses = async (
  latitude: number,
  longitude: number,
  page: number = 1,
  category?: string
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

