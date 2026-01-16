/**
 * Promotions API Service
 */

import apiClient from './config';
import { ApiResponse, Promotion } from './types';

/**
 * Get active promotions
 */
export const getPromotions = async (isActive: boolean = true): Promise<Promotion[]> => {
  try {
    const response = await apiClient.get<ApiResponse<Promotion[]>>('/api/promotions', {
      params: {
        isActive,
      },
    });

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Failed to get promotions');
  } catch (error: any) {
    throw error;
  }
};

