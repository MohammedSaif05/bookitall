/**
 * Categories API Service
 */

import apiClient from './config';
import { ApiResponse, Category } from './types';

/**
 * Get all categories
 */
export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await apiClient.get<ApiResponse<Category[]>>('/api/categories');

    if (response.data.success && response.data.data) {
      // Filter only active categories and sort by order
      return response.data.data
        .filter((category) => category.isActive)
        .sort((a, b) => a.order - b.order);
    }

    throw new Error(response.data.message || 'Failed to get categories');
  } catch (error: any) {
    throw error;
  }
};

